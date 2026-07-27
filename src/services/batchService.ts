import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { CrearLoteDTO, CrearLoteIndividualDTO, CrearLoteRodeoDTO, EditarLoteDTO, ProduccionAnimalDTO } from "../schemas/batchSchema"
import EstablishmentService from "./establishmentsService";
import { Prisma, TipoSeguimiento } from "@prisma/client";
import { TamboEngineService } from "./tamboEngineService";


export class LoteService {
    private async obtenerEstablecimiento(idEstablecimiento: string) {
        const establecimiento = await prisma.establecimiento.findUnique({
            where: { idEstablecimiento },
            include: {
                configuracions: true
            }
        })

        if (!establecimiento) {
            throw new AppError("El establecimiento no existe", 400);
        }

        return establecimiento;
    }

    private async generateBatchNumber(tx: Prisma.TransactionClient, idEstablecimiento: string) {
        const config = await tx.configuracion.update({
            where: { idEstablecimiento: idEstablecimiento },
            data: { ultimoNumeroLote: { increment: 1 } },
            select: { ultimoNumeroLote: true }
        })

        return config.ultimoNumeroLote;
    }

    private async crearLoteRodeo(tx: Prisma.TransactionClient, data: CrearLoteRodeoDTO, idEstablecimiento: string, numeroLote: number, idProducto: string) {

        const rodeo = await EstablishmentService.validateRodeo(data.idRodeo, idEstablecimiento)

        const lote = await tx.loteProduccion.create({
            data: {
                idLote: data.idLote,
                cantAnimales: rodeo.cantVacas,
                idProducto: idProducto,
                idEstablecimiento: idEstablecimiento,
                cantidad: data.cantidad,
                unidad: data.unidad,
                tempTanque: data.tempTanque,
                destino: data.destino,
                fechaProduccion: data.fechaProduccion ?? undefined,
                ...(data.estado ? { estado: data.estado } : {}),
                numeroLote: numeroLote,
                idRodeo: rodeo.idRodeo
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
    };

    private async validarCantidadProducto(cantidadLitros: number, animales: ProduccionAnimalDTO[]) {
        const produccionAnimales = animales.reduce((acc, animal) => acc + Number(animal.litros), 0);
        if (produccionAnimales !== cantidadLitros) {
            throw new AppError("La cantidad total de producción no coincide con la cantidad del lote", 400);
        }
    }

    private async crearLoteIndividual(tx: Prisma.TransactionClient, data: CrearLoteIndividualDTO, establecimiento: any, numeroLote: number) {
        const animales = await EstablishmentService.validateAnimals(establecimiento.idEstablecimiento, data.animales.map(a => a.idAnimal))
        this.validarCantidadProducto(data.cantidad, data.animales)

        const lote = await tx.loteProduccion.create({
            data: {
                idLote: data.idLote,
                cantAnimales: animales.length,
                idProducto: data.idProducto,
                idEstablecimiento: establecimiento.idEstablecimiento,
                cantidad: data.cantidad,
                unidad: data.unidad,
                tempTanque: data.tempTanque,
                destino: data.destino,
                fechaProduccion: data.fechaProduccion ?? undefined,
                ...(data.estado ? { estado: data.estado } : {}),
                numeroLote: numeroLote
            }
        })

        await tx.produccionAnimal.createMany({
            data: data.animales.map(animal => ({
                idAnimal: animal.idAnimal,
                idLote: lote.idLote,
                litros: animal.litros,
                estado: animal.estado 
            }))
        })

        return lote

    }

    async crearLote(data: CrearLoteDTO, idEstablecimiento: string) {
        const establecimiento = await this.obtenerEstablecimiento(idEstablecimiento);
        const tipoSeguimiento = establecimiento.configuracions[0].tipoSeguimiento;

        if (tipoSeguimiento !== data.tipoSeguimiento) {
            throw new AppError("El tipo de seguimiento enviado no coincide con la configuración del establecimiento", 400);
        }

        const producto = await EstablishmentService.validateProduct(data.idProducto)

        const lote = await prisma.$transaction(async (tx) => {
            const numeroLote = await this.generateBatchNumber(tx, idEstablecimiento);
            switch (data.tipoSeguimiento) {
                case TipoSeguimiento.RODEO:
                    return this.crearLoteRodeo(tx, data, establecimiento.idEstablecimiento, numeroLote, producto.idProducto);

                case TipoSeguimiento.INDIVIDUAL:
                    return this.crearLoteIndividual(tx, data, establecimiento, numeroLote);

                default:
                    throw new AppError("Tipo de seguimiento inválido", 400);
            }

        });

        // Disparar en background el análisis de IA si se creó como completado
        if (lote.estado) {
            TamboEngineService.analizarSiCorresponde(idEstablecimiento, lote.idLote);
        }

        return lote;
    }

    async eliminarLote(idLote: string, idEstablecimiento: string) {
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

    async obtenerLote(idLote: string, idEstablecimiento: string) {
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

    async editarLote(idLote: string, data: EditarLoteDTO, idEstablecimiento: string) {
        const lote = await prisma.loteProduccion.findUnique({
            where: { idLote, idEstablecimiento: idEstablecimiento },
        })

        if (!lote) {
            throw new AppError("El lote no existe o no pertenece al establecimiento", 404);
        }

        if (lote.estado) {
            throw new AppError("No se pueden editar lotes que ya están completados", 409);
        }


        const [producto, rodeo] = await Promise.all([
            data.idProducto ? EstablishmentService.validateProduct(data.idProducto) : null,
            EstablishmentService.validateRodeo(data.idRodeo, idEstablecimiento)
        ])


        const loteActualizado = await prisma.loteProduccion.update({
            where: { idLote, idEstablecimiento: idEstablecimiento },
            data
        });

        return loteActualizado;
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

    async listarLotes(
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

                // Necesario para calcular merma_porcentaje
                mermas: true,

                costosDirectos: true,
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
        const lotesTransformados = lotes.map((lote) => {

            const cantidadProduccion =
                Number(lote.cantidad);

            const totalMermas = lote.mermas.reduce(
                (acc: number, merma) =>
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
    */

    async completarLote(idLote: string) {

        const lote = await prisma.loteProduccion.findUnique({
            where: { idLote },
        });

        if (!lote) {
            throw new AppError("El lote no existe", 404);
        }

        if (lote.estado) {
            throw new AppError("El lote ya está completado", 400);
        }

        const loteActualizado = await prisma.loteProduccion.update({
            where: { idLote },
            data: { estado: true },
        });

        // Disparar en background el análisis de IA al completarse
        await TamboEngineService.analizarSiCorresponde(lote.idEstablecimiento, lote.idLote);

        return loteActualizado;
    }

    async cerrarLotesVencidos() {

        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 15);

        const lotes = await prisma.loteProduccion.findMany({
            where: {
                estado: false,
                fechaProduccion: { lte: fechaLimite }
            },
            select: { idLote: true }
        });

        console.log(`[CRON] Lotes vencidos encontrados: ${lotes.length}`);

        for (const lote of lotes) {
            try {
                await this.completarLote(lote.idLote);
                console.log(`[CRON] Lote cerrado: ${lote.idLote}`);
            } catch (error) {
                console.error(`[CRON] Error cerrando lote ${lote.idLote}`, error);
            }
        }

    }


    async obtenerLoteEditable(idLote: string, tx?: Prisma.TransactionClient) {
        const db = tx ?? prisma;
        const lote = await db.loteProduccion.findUnique(
            { where: { idLote } }
        )

        if (!lote) {
            throw new AppError("Lote no encontrado", 404)
        }

        if (lote.estado) {
            throw new AppError("El lote está completo", 409)
        }

        return lote
    }
}

export default new LoteService();