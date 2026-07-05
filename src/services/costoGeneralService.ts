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