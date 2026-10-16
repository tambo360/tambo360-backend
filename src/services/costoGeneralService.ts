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
        // =====================================================
        // El siguiente metodo lo eliminamos sin reemplazarlo
        // =====================================================

/*    async calcularCostoAlimentacion(idEstablecimiento: string, fechaDesde: Date, fechaHasta: Date) {

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
 */

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

        // =====================================================
        // El siguiente metodo lo reemplazamos por otro listar 
        // con los filtros necesarios segun issue #93
        // =====================================================

  /*  async listar(idEstablecimiento: string, filtros?: {
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
*/


async listar(idEstablecimiento: string, filtros?: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    tipoCosto?: TipoCostoGeneral;
    ordenarPor?: "fecha" | "monto";
    orden?: "asc" | "desc";
    page?: number;
    limit?: number;
}) {

    // =====================================================
    // Validar que se haya enviado un período de consulta.
    // =====================================================

    if (!filtros?.fechaDesde || !filtros?.fechaHasta) {
        throw new AppError(
            "Debe indicar un período de consulta",
            400
        );
    }

    // =====================================================
    // Paginación
    // =====================================================

    const page =
        filtros?.page && filtros.page > 0
            ? filtros.page
            : 1;

    const limit =
        filtros?.limit && filtros.limit > 0
            ? filtros.limit
            : 10;

    // =====================================================
    // Construcción de filtros
    // =====================================================

    const where = {
        idEstablecimiento,

        ...(filtros?.fechaDesde || filtros?.fechaHasta
            ? {
                fecha: {
                    ...(filtros.fechaDesde && {
                        gte: filtros.fechaDesde
                    }),
                    ...(filtros.fechaHasta && {
                        lte: filtros.fechaHasta
                    }),
                }
            }
            : {}),

        ...(filtros?.tipoCosto
            ? {
                tipoCosto: filtros.tipoCosto
            }
            : {}),
    };

    // =====================================================
    // Ordenamiento
    //
    // Por defecto:
    // - fecha
    // - descendente
    // =====================================================

    const ordenarPor =
        filtros?.ordenarPor ?? "fecha";

    const orden =
        filtros?.orden ?? "desc";

    // =====================================================
    // Obtener cantidad total de registros
    // =====================================================

    const totalCostos =
        await prisma.costoGeneral.count({
            where
        });

    // =====================================================
    // Calcular cantidad de páginas
    // =====================================================

    const totalPaginas =
        Math.ceil(totalCostos / limit);

    // =====================================================
    // Validar que la página solicitada exista
    // =====================================================

    if (
        page > totalPaginas &&
        totalPaginas > 0
    ) {
        throw new AppError(
            "La página solicitada no existe",
            404
        );
    }

    // =====================================================
    // Obtener costos paginados
    // =====================================================

    const costos =
        await prisma.costoGeneral.findMany({
            where,

            orderBy: {
                [ordenarPor]: orden,
            },

            skip: (page - 1) * limit,

            take: limit,
        });

    // =====================================================
    // Respuesta paginada
    // =====================================================

    return {
        page,
        limit,
        totalCostos,
        totalPaginas,
        costos,
    };
}

        // =====================================================
        // El siguiente metodo lo reemplazamos por otro resumen  
        // economico necesario según issue #93
        // =====================================================
/*
    // =====================================================
    // Resumen Económico del período (Épica: Costos Generales
    // y Resumen Económico).
    //
    // Devuelve los indicadores agregados que pide la épica:
    //   - gasto total en alimentación (automático)
    //   - gasto total en costos generales (manuales)
    //   - gasto total consolidado
    //   - cantidad de lotes completos del período
    //   - prorrateo promedio por lote
    //
    // No genera registros persistentes: los valores se
    // calculan al vuelo en cada consulta.
    // =====================================================
    async resumenEconomico(idEstablecimiento: string, fechaDesde: Date, fechaHasta: Date) {

        if (!fechaDesde || !fechaHasta) {
            throw new AppError(
                "Debe indicar un período de consulta",
                400
            );
        }

        // Costo de alimentación automático (reutiliza el cálculo existente)
        const gastoAlimentacion = await this.calcularCostoAlimentacion(
            idEstablecimiento,
            fechaDesde,
            fechaHasta
        );

        // Suma de costos generales manuales del período
        const costosManuales = await prisma.costoGeneral.aggregate({
            where: {
                idEstablecimiento,
                fecha: {
                    gte: fechaDesde,
                    lte: fechaHasta,
                },
            },
            _sum: { monto: true },
        });
        const gastoCostosGenerales = Number(costosManuales._sum.monto || 0);

        // Cantidad de lotes COMPLETOS del período
        // (solo participan los lotes con estado = true, según regla de negocio)
        const lotesCompletos = await prisma.loteProduccion.count({
            where: {
                idEstablecimiento,
                estado: true,
                fechaProduccion: {
                    gte: fechaDesde,
                    lte: fechaHasta,
                },
            },
        });

        const gastoTotal = gastoAlimentacion + gastoCostosGenerales;
        const prorrateoPromedio = lotesCompletos > 0 ? gastoTotal / lotesCompletos : 0;

        return {
            periodo: { fechaDesde, fechaHasta },
            gastoAlimentacion,
            gastoCostosGenerales,
            gastoTotal,
            lotesCompletos,
            prorrateoPromedio,
        };
    }
*/


async resumenEconomico(
    idEstablecimiento: string,
    fechaDesde: Date,
    fechaHasta: Date
) {

    if (!fechaDesde || !fechaHasta) {
        throw new AppError(
            "Debe indicar un período de consulta",
            400
        );
    }

    // =====================================================
    // Obtener todos los costos generales registrados
    // durante el período seleccionado.
    //
    // ALIMENTACION ya no se calcula automáticamente:
    // ahora es un costo registrado mediante el CRUD.
    // =====================================================
    const costosManuales = await prisma.costoGeneral.aggregate({
        where: {
            idEstablecimiento,
            fecha: {
                gte: fechaDesde,
                lte: fechaHasta,
            },
        },
        _sum: {
            monto: true,
        },
    });

    const gastoCostosGenerales =
        Number(costosManuales._sum.monto || 0);

    // =====================================================
    // Obtener específicamente los costos de ALIMENTACION.
    //
    // Se mantiene como dato informativo dentro del resumen,
    // pero ya no se calcula mediante animales x ración.
    // =====================================================
    const costoAlimentacion =
        await prisma.costoGeneral.aggregate({
            where: {
                idEstablecimiento,
                tipoCosto: TipoCostoGeneral.ALIMENTACION,
                fecha: {
                    gte: fechaDesde,
                    lte: fechaHasta,
                },
            },
            _sum: {
                monto: true,
            },
        });

    const gastoAlimentacion =
        Number(costoAlimentacion._sum.monto || 0);

    // =====================================================
    // Cantidad de lotes COMPLETOS del período.
    //
    // estado = true representa un lote completo/cerrado.
    // =====================================================
    const lotesCompletos =
        await prisma.loteProduccion.count({
            where: {
                idEstablecimiento,
                estado: true,
                fechaProduccion: {
                    gte: fechaDesde,
                    lte: fechaHasta,
                },
            },
        });

    // =====================================================
    // El gasto total ya incluye ALIMENTACION porque
    // ALIMENTACION forma parte de CostoGeneral.
    //
    // NO debemos hacer:
    //
    // gastoAlimentacion + gastoCostosGenerales
    //
    // porque eso duplicaría ALIMENTACION.
    // =====================================================
    const gastoTotal = gastoCostosGenerales;

    // =====================================================
    // Costo promedio por lote completo.
    //
    // Se evita la división por cero.
    // =====================================================
    const prorrateoPromedio =
        lotesCompletos > 0
            ? gastoTotal / lotesCompletos
            : 0;

    return {
        periodo: {
            fechaDesde,
            fechaHasta,
        },
        gastoAlimentacion,
        gastoCostosGenerales,
        gastoTotal,
        lotesCompletos,
        prorrateoPromedio,
    };
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