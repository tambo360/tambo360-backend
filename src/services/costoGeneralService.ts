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
/*
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
*/

async listar(idEstablecimiento: string, filtros?: {
    fechaDesde?: Date;
    fechaHasta?: Date;
}) {

    // =====================================================
    // Validar que se haya enviado un período de consulta.
    // El cálculo del costo de alimentación depende de las
    // fechas seleccionadas por el usuario.
    // =====================================================
    if (!filtros?.fechaDesde || !filtros?.fechaHasta) {
        throw new AppError(
            "Debe indicar un período de consulta",
            400
        );
    }

    const fechaDesde = filtros.fechaDesde;
    const fechaHasta = filtros.fechaHasta;

    // =====================================================
    // Obtener costos generales manuales registrados
    // =====================================================
    const costosManuales = await prisma.costoGeneral.findMany({
        where: {
            idEstablecimiento,
            fecha: {
                gte: fechaDesde,
                lte: fechaHasta,
            },
        },
        orderBy: {
            fecha: "desc",
        },
    });

    // =====================================================
    // Calcular automáticamente el costo de alimentación
    // (no se encuentra almacenado en la base de datos)
    // =====================================================
    const costoAlimentacion =
        await this.calcularCostoAlimentacion(
            idEstablecimiento,
            fechaDesde,
            fechaHasta
        );

    // =====================================================
    // Crear un registro virtual para que el frontend pueda
    // mostrarlo junto a los costos manuales.
    // =====================================================
    const costoAutomatico = {
        idCostoGeneral: "alimentacion",
        tipoCosto: "ALIMENTACION",
        descripcion: "Costo de alimentación (calculado automáticamente)",
        monto: costoAlimentacion,
        fecha: fechaHasta,

        // El frontend podrá identificar este registro
        // como un costo automático de solo lectura.
        automatico: true,
        soloLectura: true,
    };

    // =====================================================
    // Devolver un único listado con costos manuales
    // y el costo automático de alimentación.
    // =====================================================
    return [...costosManuales, costoAutomatico].sort(
        (a, b) =>
            new Date(b.fecha).getTime() -
            new Date(a.fecha).getTime()
    );
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