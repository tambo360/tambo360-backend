import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { CrearLoteDTO } from "../schemas/batchSchema";
import { Prisma } from "@prisma/client";
import { TamboEngineService } from "./tamboEngineService";


export class LoteService {

    static async crearLote(data: CrearLoteDTO, idEstablecimiento?: string) {

        if (!idEstablecimiento) {
            throw new AppError("No se pudo determinar el establecimiento para crear el lote", 400);
        }

        const [producto, raza] = await Promise.all([
            prisma.producto.findUnique({
                where: {
                    idProducto: data.idProducto
                }
            }),
            prisma.raza.findUnique({
                where: {
                    idRaza: data.idRaza
                }
            }
            )
        ])

        if (!producto) {
            throw new AppError("El producto seleccionado no existe", 400);
        }

        if (!raza) {
            throw new AppError("La raza seleccionada no existe", 400);
        }


        const result = await prisma.$transaction(async (tx) => {
            const numeroLote = await LoteService.generateBatchNumber(tx, idEstablecimiento)

            const lote = await prisma.loteProduccion.create({
                data: {
                    idLote: data.idLote,
                    idProducto: producto.idProducto,
                    idEstablecimiento: idEstablecimiento,
                    cantidad: data.cantidad,
                    unidad: data.unidad,
                    fechaProduccion: data.fechaProduccion ?? undefined,
                    ...(data.estado ? { estado: data.estado } : {}),
                    numeroLote: numeroLote,
                    cantRazas: data.cantRaza,
                    idRaza: data.idRaza
                },
                include: {
                    producto: {
                        select: {
                            idProducto: true,
                            nombre: true,
                            categoria: true
                        }
                    }
                }
            })

            return lote
        });


        // Disparar en background el análisis de IA si se creó como completado
        if (result.estado) {
            TamboEngineService.analizarSiCorresponde(idEstablecimiento, result.idLote);
        }

        return result;
    }

    static async eliminarLote(idLote: string, idEstablecimiento: string) {
        const lote = await prisma.loteProduccion.findUnique({
            where: { idLote, idEstablecimiento: idEstablecimiento },
        })

        if (!lote) {
            throw new AppError("El lote no existe o no pertenece al establecimiento", 404);
        }

        if (lote.estado) {
            throw new AppError("No se pueden eliminar lotes que ya están completados", 409);
        }

        const alertas = await prisma.alerta.findMany({
            where: { idLote, idEstablecimiento: idEstablecimiento }
        })

        if (alertas && alertas.length > 0) {
            throw new AppError("No se pueden eliminar lotes que tienen alertas asociadas. Elimine primero las alertas.", 409);
        }

        await prisma.loteProduccion.delete({
            where: { idLote, idEstablecimiento: idEstablecimiento }
        })

        return;

    }

    static async obtenerLote(idLote: string, idEstablecimiento: string) {
        const lote = await prisma.loteProduccion.findUnique({
            where: { idLote, idEstablecimiento: idEstablecimiento },
            include: { producto: true, mermas: true, costosDirectos: true, establecimiento: true },
        });


        if (!lote) {
            throw new AppError("El lote no existe", 404);
        }


        let alertas = null;
        let alertasError = null;

        try {
            alertas = await TamboEngineService.getAlertasPorLote(
                lote.establecimiento.idEstablecimiento,
                idLote
            );
        } catch (error) {
            console.error("Error obteniendo alertas:", error);
            alertasError = "No se pudieron obtener las alertas";
        }


        return {
            ...lote,
            alertas,
            alertasError
        };
    }

    // ====================================================================================
    // LISTAR LOTES
    // Endpoint GET /lotes
    // Issue #29
    //
    // Permite listar lotes de forma paginada utilizando:
    //
    // - filtros
    // - ordenamiento
    // - contexto multi-tenant
    //
    // Incluye:
    // - cálculo de merma_porcentaje
    // - paginación
    // - filtros dinámicos
    // ====================================================================================

    static async listarLotes(
        idEstablecimiento: string,
        filtros?: {
            estado?: boolean;
            nombre?: string;
            producto?: string;
            numeroLote?: number;
            fecha_desde?: Date;
            fecha_hasta?: Date;
            orden?: "asc" | "desc";
            page?: number;
            limit?: number;
        }
    ) {

        // =========================================================
        // Filtro base multi-tenant
        // =========================================================
        const where: Prisma.LoteProduccionWhereInput = {
            idEstablecimiento,
        };

        // =========================================================
        // Filtro por estado
        // true  = lote completo/cerrado
        // false = lote incompleto/modificable
        // =========================================================
        if (filtros?.estado !== undefined) {
            where.estado = filtros.estado;
        }

        // =========================================================
        // Filtro por número exacto de lote
        // =========================================================
        if (
            filtros?.numeroLote !== undefined &&
            !Number.isNaN(filtros.numeroLote)
        ) {
            where.numeroLote = filtros.numeroLote;
        }

        // =========================================================
        // Filtro por rango de fechas
        // =========================================================
        if (filtros?.fecha_desde || filtros?.fecha_hasta) {

            where.fechaProduccion = {};

            if (filtros.fecha_desde) {
                where.fechaProduccion.gte = filtros.fecha_desde;
            }

            if (filtros.fecha_hasta) {
                where.fechaProduccion.lte = filtros.fecha_hasta;
            }
        }

        // =========================================================
        // Filtro textual por nombre de producto
        // =========================================================
        if (filtros?.producto || filtros?.nombre) {

            const valorBusqueda =
                filtros.producto || filtros.nombre;

            where.producto = {
                is: {
                    nombre: {
                        contains: valorBusqueda,
                        mode: "insensitive",
                    },
                },
            };
        }

        // =========================================================
        // Configuración de paginación
        // =========================================================
        const page =
            filtros?.page && filtros.page > 0
                ? filtros.page
                : 1;

        const limit =
            filtros?.limit && filtros.limit > 0
                ? filtros.limit
                : 10;

        // =========================================================
        // Total de registros
        // =========================================================
        const totalLotes = await prisma.loteProduccion.count({
            where,
        });

        const totalPaginas = Math.ceil(totalLotes / limit);

        // =========================================================
        // Validación de página inexistente
        // =========================================================
        if (page > totalPaginas && totalPaginas > 0) {
            throw new AppError(
                "La página solicitada no existe",
                404
            );
        }

        // =========================================================
        // Consulta principal
        // =========================================================
        const lotes = await prisma.loteProduccion.findMany({
            where,

            include: {

                // Información del producto asociado
                producto: true,

                // Información de raza asociada
                raza: true,

                // Necesario para calcular merma_porcentaje
                mermas: true,
            },

            // =====================================================
            // Ordenamiento configurable
            // asc  -> más antiguos primero
            // desc -> más recientes primero
            // =====================================================
            orderBy: {
                numeroLote: filtros?.orden ?? "desc",
            },

            skip: (page - 1) * limit,

            take: limit,
        });

        // =========================================================
        // Cálculo de merma_porcentaje
        // Fórmula:
        // (total_mermas / cantidad_produccion) * 100
        // =========================================================
        const lotesTransformados = lotes.map((lote: any) => {

            const cantidadProduccion =
                Number(lote.cantidad);

            const totalMermas = lote.mermas.reduce(
                (acc: number, merma: any) =>
                    acc + Number(merma.cantidad),
                0
            );

            // =====================================================
            // Evita división por cero
            // =====================================================
            const merma_porcentaje =
                cantidadProduccion > 0
                    ? Number(
                        (
                            (totalMermas / cantidadProduccion) * 100
                        ).toFixed(2)
                    )
                    : 0;

            return {
                ...lote,
                merma_porcentaje,
            };
        });

        // =========================================================
        // Response final paginado
        // =========================================================
        return {
            page,
            limit,
            totalLotes,
            totalPaginas,
            lotes: lotesTransformados,
        };
    }

    /*


    static async listarProduccionDelDia(idUsuario: string) {
        const establecimiento = await prisma.establecimiento.findFirst({ where: { idUsuario } });
        if (!establecimiento) throw new AppError("El usuario no tiene un establecimiento registrado", 400);

        const hoy = new Date();
        const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);
        const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);

        const producciones = await prisma.loteProduccion.findMany({
            where: {
                idEstablecimiento: establecimiento.idEstablecimiento,
                fechaProduccion: { gte: inicioDia, lte: finDia }
            },
            include: { producto: true, mermas: true, costosDirectos: true }
        });

        if (producciones.length === 0) {
            throw new AppError("No hay producción registrada para el día de hoy", 404);
        }
        return producciones;
    }

    static async completarLote(idLote: string, idUsuario: string) {

        const lote = await prisma.loteProduccion.findUnique({
            where: { idLote },
            include: { establecimiento: true }
        });

        if (!lote) {
            throw new AppError("El lote no existe", 404);
        }

        if (lote.establecimiento.idUsuario !== idUsuario) {
            throw new AppError("No tiene permisos para modificar este lote", 403);
        }

        if (lote.estado) {
            throw new AppError("El lote ya está completado", 400);
        }

        const loteActualizado = await prisma.loteProduccion.update({
            where: { idLote },
            data: { estado: true },
        });

        // Disparar en background el análisis de IA al completarse
        TamboEngineService.analizarSiCorresponde(lote.idEstablecimiento, lote.idLote);

        return loteActualizado;
    }
    */


    static async generateBatchNumber(tx: Prisma.TransactionClient, idEstablecimiento: string) {
        const config = await tx.configuracion.update({
            where: { idEstablecimiento: idEstablecimiento },
            data: { ultimoNumeroLote: { increment: 1 } },
            select: { ultimoNumeroLote: true }
        })

        return config.ultimoNumeroLote;
    }
}

