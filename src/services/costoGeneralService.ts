import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { TipoCostoGeneral } from "@prisma/client";

class CostoGeneralService {

    async crear(idEstablecimiento: string, data: {
        tipoCosto: TipoCostoGeneral;
        descripcion?: string;
        monto: number;
        fecha: Date;
    }) {
        return prisma.costoGeneral.create({
            data: {
                idEstablecimiento,
                tipoCosto: data.tipoCosto,
                descripcion: data.descripcion,
                monto: data.monto,
                fecha: data.fecha,
            }
        });
    }

async calcularCostoAlimentacion(idEstablecimiento: string, fechaDesde: Date, fechaHasta: Date) {

    const establecimiento = await prisma.establecimiento.findUnique({
        where: {
            idEstablecimiento
        },
        include: {
            configuracions: {
                include: {
                    rodeos: true
                }
            }
        }
    });

    if (!establecimiento) {
        throw new AppError("Establecimiento no encontrado", 404);
    }

    const configuracion = establecimiento.configuracions[0];

    if (!configuracion) {
        return 0;
    }

    const MS_POR_DIA = 1000 * 60 * 60 * 24;

    const dias =
        Math.floor(
            (fechaHasta.getTime() - fechaDesde.getTime()) /
            MS_POR_DIA
        ) + 1;

    let costoTotal = 0;

    for (const rodeo of configuracion.rodeos) {
        costoTotal +=
            rodeo.cantVacas *
            Number(rodeo.costoRacion) *
            dias;
    }

    return costoTotal;
}

    async listar(idEstablecimiento: string, filtros?: {
        fechaDesde?: Date;
        fechaHasta?: Date;
    }) {
        return prisma.costoGeneral.findMany({
            where: {
                idEstablecimiento,
                ...(filtros?.fechaDesde || filtros?.fechaHasta ? {
                    fecha: {
                        ...(filtros.fechaDesde && { gte: filtros.fechaDesde }),
                        ...(filtros.fechaHasta && { lte: filtros.fechaHasta }),
                    }
                } : {})
            },
            orderBy: { fecha: "desc" }
        });
    }

    async actualizar(idCostoGeneral: string, idEstablecimiento: string, data: {
        tipoCosto?: TipoCostoGeneral;
        descripcion?: string;
        monto?: number;
        fecha?: Date;
    }) {
        const costo = await prisma.costoGeneral.findUnique({
            where: { idCostoGeneral }
        });

        if (!costo) throw new AppError("Costo general no encontrado", 404);

        if (costo.idEstablecimiento !== idEstablecimiento) {
            throw new AppError("No tiene permisos sobre este costo", 403);
        }

        return prisma.costoGeneral.update({
            where: { idCostoGeneral },
            data
        });
    }

    async eliminar(idCostoGeneral: string, idEstablecimiento: string) {
        const costo = await prisma.costoGeneral.findUnique({
            where: { idCostoGeneral }
        });

        if (!costo) throw new AppError("Costo general no encontrado", 404);

        if (costo.idEstablecimiento !== idEstablecimiento) {
            throw new AppError("No tiene permisos sobre este costo", 403);
        }

        await prisma.costoGeneral.delete({
            where: { idCostoGeneral }
        });
    }
}

export default new CostoGeneralService();