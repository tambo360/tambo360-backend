import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { CrearLoteDTO } from "../schemas/batchSchema";
import { Prisma } from "@prisma/client";
import { TamboEngineService } from "./tamboEngineService";


export class LoteService {

    static async crearLote(idUsuario: string, data: CrearLoteDTO) {
        const establecimiento = await prisma.establecimiento.findFirst({
            where: { idUsuario },
        });

        if (!establecimiento) {
            throw new AppError("El usuario no tiene un establecimiento registrado", 400);
        }

        const producto = await prisma.producto.findUnique({
            where: { idProducto: data.idProducto },
        });

        if (!producto) {
            throw new AppError("El producto seleccionado no existe", 400);
        }

        const ultimoLote = await prisma.loteProduccion.findFirst({
            where: { idEstablecimiento: establecimiento.idEstablecimiento },
            orderBy: { numeroLote: 'desc' }
        });

        const nuevoNumeroLote = ultimoLote ? ultimoLote.numeroLote + 1 : 1;

        const unidad: "kg" | "litros" = producto.categoria === "quesos" ? "kg" : "litros";

        const lote = await prisma.loteProduccion.create({
            data: {
                idProducto: data.idProducto,
                idEstablecimiento: establecimiento.idEstablecimiento,
                cantidad: data.cantidad,
                unidad,
                fechaProduccion: data.fechaProduccion ?? undefined,
                estado: data.estado ?? false,
                numeroLote: nuevoNumeroLote,
            },
            include: {
                producto: {
                    select: {
                        nombre: true,
                        categoria: true
                    }
                }
            }
        });

        // Disparar en background el análisis de IA si se creó como completado
        if (lote.estado) {
            TamboEngineService.analizarSiCorresponde(establecimiento.idEstablecimiento, lote.idLote);
        }

        return lote;
    }

    static async editarLote(idLote: string, data: Partial<CrearLoteDTO>, idUsuario: string) {
        const lote = await prisma.loteProduccion.findUnique({
            where: { idLote },
            include: { establecimiento: true, mermas: true, costosDirectos: true }
        });

        if (!lote) throw new AppError("El lote no existe", 404);

        if (lote.establecimiento.idUsuario !== idUsuario) {
            throw new AppError("No tiene permisos para modificar este lote", 403);
        }

        if (lote.mermas.length > 0 || lote.costosDirectos.length > 0) {
            throw new AppError(
                "El lote tiene mermas o costos directos asociados y no puede editarse",
                400
            );
        }

        let idProducto = lote.idProducto;
        let unidad = lote.unidad;

        if (data.idProducto && data.idProducto !== lote.idProducto) {
            const producto = await prisma.producto.findUnique({
                where: { idProducto: data.idProducto }
            });

            if (!producto) {
                throw new AppError("El producto seleccionado no existe", 400);
            }

            idProducto = data.idProducto;
            unidad = producto.categoria === "quesos" ? "kg" : "litros";
        }

        return prisma.loteProduccion.update({
            where: { idLote },
            data: {
                idProducto,
                unidad,
                cantidad: data.cantidad ?? lote.cantidad,
                fechaProduccion: data.fechaProduccion
                    ? new Date(data.fechaProduccion)
                    : lote.fechaProduccion,
            },
            include: {
                producto: true,
                mermas: true,
                costosDirectos: true
            }
        });
    }

    static async eliminarLote(idLote: string, idUsuario: string) {
        const lote = await prisma.loteProduccion.findUnique({
            where: { idLote },
            include: { establecimiento: true, mermas: true, costosDirectos: true },
        });

        if (!lote) {
            throw new AppError("El lote no existe", 404);
        }

        if (lote.establecimiento.idUsuario !== idUsuario) {
            throw new AppError("No tiene permisos para eliminar este lote", 403);
        }

        if ((lote.mermas.length > 0) || (lote.costosDirectos.length > 0)) {
            throw new AppError("No se puede eliminar el lote, tiene información asociada", 400);
        }

        return prisma.loteProduccion.delete({ where: { idLote } });
    }

    //Nuevo listarLotes por la issue #29
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

    // Filtro base multi-tenant.
    // Solamente se listan lotes pertenecientes
    // al establecimiento validado por middleware.
    const where: Prisma.LoteProduccionWhereInput = {
        idEstablecimiento,
    };

    // Filtro por estado del lote.
    // true  -> lote completo/cerrado
    // false -> lote incompleto/modificable
    if (filtros?.estado !== undefined) {
        where.estado = filtros.estado;
    }

    // Filtro por número de lote exacto.
    if (
        filtros?.numeroLote !== undefined &&
        !Number.isNaN(filtros.numeroLote)
    ) {
        where.numeroLote = filtros.numeroLote;
    }

    // Filtro por rango de fechas.
    // Permite combinar:
    // - fecha_desde
    // - fecha_hasta
    if (filtros?.fecha_desde || filtros?.fecha_hasta) {

        where.fechaProduccion = {};

        if (filtros.fecha_desde) {
            where.fechaProduccion.gte = filtros.fecha_desde;
        }

        if (filtros.fecha_hasta) {
            where.fechaProduccion.lte = filtros.fecha_hasta;
        }
    }

    // Filtro textual por producto/nombre.
    // El nuevo schema utiliza:
    // LoteProduccion -> EstablecimientoProducto -> Producto
    //
    // Por eso el filtro requiere doble relación.
    if (filtros?.producto || filtros?.nombre) {

        const valorBusqueda = filtros.producto || filtros.nombre;

        where.producto = {
            producto: {
                nombre: {
                    contains: valorBusqueda,
                    mode: "insensitive",
                },
            },
        };
    }

    // Configuración de paginación.
    // Valores por defecto:
    // - página 1
    // - máximo 10 registros
    const page = filtros?.page && filtros.page > 0
        ? filtros.page
        : 1;

    const limit = filtros?.limit && filtros.limit > 0
        ? filtros.limit
        : 10;

    // Total de registros para cálculo de páginas.
    const totalLotes = await prisma.loteProduccion.count({
        where,
    });

    const totalPaginas = Math.ceil(totalLotes / limit);

    // Validación de página inexistente.
    if (page > totalPaginas && totalPaginas > 0) {
        throw new AppError(
            "La página solicitada no existe",
            404
        );
    }

    // Consulta principal paginada.
    const lotes = await prisma.loteProduccion.findMany({
        where,

        include: {

            // Relación contextual del producto.
            producto: {
                include: {
                    producto: true,
                },
            },

            // Relación contextual de raza.
            raza: {
                include: {
                    raza: true,
                },
            },

            // Necesario para cálculo de merma_porcentaje.
            mermas: true,
        },

        // Ordenamiento configurable.
        // Se mantiene asc/desc por compatibilidad.
        orderBy: {
            numeroLote: filtros?.orden ?? "desc",
        },

        skip: (page - 1) * limit,

        take: limit,
    });

    // Transformación final de datos.
    // Se calcula:
    // merma_porcentaje =
    // (total_mermas / cantidad) * 100
    const lotesTransformados = lotes.map((lote: any) => {

        const cantidadProduccion = Number(lote.cantidad);

        const totalMermas = lote.mermas.reduce(
            (acc: number, merma:any) => acc + Number(merma.cantidad),
            0
        );

        // Evita división por cero.
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

    // Response paginada final.
    return {
        page,
        limit,
        totalLotes,
        totalPaginas,
        lotes: lotesTransformados,
    };
}

    //Este listarLotes estaba antes de aplicar la issue #29
    /*
    static async listarLotes(idUsuario: string, filtros?: {
        nombre?: string; fecha?: { inicio: Date; fin: Date }; numeroLote?: number;
        orden?: "asc" | "desc"; pagina?: number;
    }
    ) {

        const establecimiento = await prisma.establecimiento.findFirst({
            where: { idUsuario },
        });

        if (!establecimiento) {
            throw new AppError("El usuario no tiene un establecimiento registrado", 400);
        }

        const where: Prisma.LoteProduccionWhereInput = {
            idEstablecimiento: establecimiento.idEstablecimiento,
        };

        if (filtros?.nombre) {
            const valor = filtros.nombre;
            const esNumero = !Number.isNaN(Number(valor));

            if (esNumero) {
                // Buscar lotes cuyo numeroLote empiece con el número
                const lotesNumero = await prisma.$queryRaw<{ idLote: string }[]>`
                SELECT "idLote"
                FROM "LoteProduccion"
                WHERE CAST("numeroLote" AS TEXT) LIKE ${valor + "%"}
                AND "idEstablecimiento" = ${establecimiento.idEstablecimiento}
            `;
                const ids = lotesNumero.map((l) => l.idLote);

                if (ids.length > 0) {
                    where.idLote = { in: ids };
                } else {

                    where.idLote = { equals: "0" };
                }
            } else {

                where.producto = {
                    nombre: {
                        contains: valor,
                        mode: "insensitive",
                    },
                };
            }
        } else if (filtros?.numeroLote !== undefined && !Number.isNaN(filtros.numeroLote)) {

            where.numeroLote = filtros.numeroLote;
        }

        const pagina = filtros?.pagina && filtros.pagina > 0 ? filtros.pagina : 1;
        const cantidadPorPagina = 20;

        const totalLotes = await prisma.loteProduccion.count({ where });
        const totalPaginas = Math.ceil(totalLotes / cantidadPorPagina);

        if (pagina > totalPaginas && totalPaginas > 0) {
            throw new AppError("La página solicitada no existe", 404);
        }

        const lotes = await prisma.loteProduccion.findMany({
            where,
            include: {
                producto: true,
                mermas: true,
                costosDirectos: true,
            },
            orderBy: [
                { numeroLote: filtros?.orden ?? "asc" },
                { fechaProduccion: filtros?.orden ?? "desc" },
            ],
            skip: (pagina - 1) * cantidadPorPagina,
            take: cantidadPorPagina,
        });


        return {
            pagina,
            totalPaginas,
            totalLotes,
            lotes,
        };

    }
*/
    static async obtenerLote(idLote: string, idUsuario: string) {
        const lote = await prisma.loteProduccion.findUnique({
            where: { idLote },
            include: { producto: true, mermas: true, costosDirectos: true, establecimiento: true },
        });


        if (!lote) {
            throw new AppError("El lote no existe", 404);
        }

        if (lote.establecimiento.idUsuario !== idUsuario) {
            throw new AppError("No tiene permisos para ver este lote", 403);
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
}
