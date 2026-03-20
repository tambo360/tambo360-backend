import { prisma } from "../lib/prisma";
import { CrearCostoDTO, ActualizarCostoDTO } from "../schemas/costShema";
import { AppError } from "../utils/AppError";


class ServicioCostos {

    async crear(idUsuario: string, data: CrearCostoDTO) {

        const lote = await prisma.loteProduccion.findUnique({
            where: { idLote: data.loteId },
            include: { establecimiento: true },
        });

        if (!lote) {
            throw new AppError("Lote no encontrado", 404);
        }

        if (lote.establecimiento.idUsuario !== idUsuario) {
            throw new AppError("No tiene permisos sobre este lote", 403);
        }

        if (lote.estado) {
            throw new AppError("No se pueden agregar costos a un lote terminado", 400);
        }

        return prisma.costosDirecto.create({
            data: {
                idLote: data.loteId,
                concepto: data.concepto,
                monto: data.monto,
                observaciones: data.observaciones,
            },
        });
    }

    async obtenerPorId(id: string, idUsuario: string) {
        const costo = await prisma.costosDirecto.findUnique({
            where: { idCostoDirecto: id },
            include: {
                lote: {
                    include: {
                        establecimiento: true
                    }
                }
            }
        });

        if (!costo) {
            throw new AppError("Costo no encontrado", 404);
        }

        if (costo.lote.establecimiento.idUsuario !== idUsuario) {
            throw new AppError("No tiene permisos para ver este costo", 403);
        }

        return costo;
    }

    async obtenerPorLote(loteId: string, idUsuario: string) {
        const lote = await prisma.loteProduccion.findUnique({
            where: { idLote: loteId },
            include: {
                establecimiento: true
            }
        });

        if (!lote) {
            throw new AppError("Lote no encontrado", 404);
        }

        if (lote.establecimiento.idUsuario !== idUsuario) {
            throw new AppError("No tiene permisos para ver los costos de este lote", 403);
        }

        return prisma.costosDirecto.findMany({
            where: { idLote: loteId },
            orderBy: { fechaCreacion: "desc" },
        });
    }

    async actualizar(id: string, idUsuario: string, data: ActualizarCostoDTO) {
        const costo = await prisma.costosDirecto.findUnique({
            where: { idCostoDirecto: id },
            include: {
                lote: {
                    include: {
                        establecimiento: true
                    }
                }
            }
        });

        if (!costo) {
            throw new AppError("Costo no encontrado", 404);
        }

        if (costo.lote.establecimiento.idUsuario !== idUsuario) {
            throw new AppError("No tiene permisos para actualizar este costo", 403);
        }

        if (costo.lote.estado) {
            throw new AppError("No se pueden modificar costos de un lote terminado", 400);
        }


        return prisma.costosDirecto.update({
            where: { idCostoDirecto: id },
            data,
        });
    }

    async eliminar(id: string, idUsuario: string) {
        const costo = await prisma.costosDirecto.findUnique({
            where: { idCostoDirecto: id },
            include: {
                lote: {
                    include: {
                        establecimiento: true
                    }
                }
            }
        });

        if (!costo) {
            throw new AppError("Costo no encontrado", 404);
        }

        if (costo.lote.establecimiento.idUsuario !== idUsuario) {
            throw new AppError("No tiene permisos para eliminar este costo", 403);
        }

        if (costo.lote.estado) {
            throw new AppError("No se pueden eliminar costos de un lote terminado", 400);
        }

        await prisma.costosDirecto.delete({
            where: { idCostoDirecto: id },
        });
    }
}

export default new ServicioCostos();