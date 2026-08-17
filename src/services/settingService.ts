import { prisma, } from "../lib/prisma";
import { motivosPorTipo, TransferenciaRodeo } from "../schemas/settingSchema";
import { AppError } from "../utils/AppError";
import { TipoMovimientoAnimal, TipoSeguimiento } from "@prisma/client";


class SettingService {
    async transferirRodeo(userId: string, idEstablecimiento: string, body: TransferenciaRodeo) {
        if (body.rodeoOrigen === body.rodeoDestino) {
            throw new AppError("El rodeo de origen y destino no pueden ser el mismo", 400);
        }

        if (!motivosPorTipo.TRANSFERENCIA.includes(body.motivo)) {
            throw new AppError("Motivo de transferencia inválido", 400);
        }

        const transferencia = await prisma.$transaction(async (tx) => {

            const configuracion = await tx.configuracion.findFirst({
                where: {
                    idEstablecimiento: idEstablecimiento,
                },
            })

            if (!configuracion) {
                throw new AppError("Configuración no encontrada", 404);
            }

            if(configuracion.tipoSeguimiento !== TipoSeguimiento.RODEO){
                throw new AppError("El establecimiento no tiene habilitado el seguimiento por rodeo", 400);
            }

            const [rodeoOrigen, rodeoDestino] = await Promise.all([
                tx.rodeo.findFirst({
                    where: {
                        idRodeo: body.rodeoOrigen,
                        idConfiguracion: configuracion.idConfiguracion,
                    },
                }),
                tx.rodeo.findFirst({
                    where: {
                        idRodeo: body.rodeoDestino,
                        idConfiguracion: configuracion.idConfiguracion,
                    },
                })
            ])

            if (!rodeoOrigen) {
                throw new AppError("Rodeo de origen no encontrado", 404);
            }
            if (!rodeoDestino) {
                throw new AppError("Rodeo de destino no encontrado", 404);
            }

            if (rodeoOrigen.cantVacas < body.cantidad) {
                throw new AppError("Cantidad a transferir mayor a la cantidad disponible en el rodeo de origen", 400);
            }


            const nuevoRodeoOrigen = await tx.rodeo.update({
                where: {
                    idRodeo: body.rodeoOrigen,
                },
                data: {
                    cantVacas: rodeoOrigen.cantVacas - body.cantidad,
                },
            });

            const nuevoRodeoDestino = await tx.rodeo.update({
                where: {
                    idRodeo: body.rodeoDestino,
                },
                data: {
                    cantVacas: rodeoDestino.cantVacas + body.cantidad,
                },
            });

            const transferencia = await tx.movimientoAnimal.create({
                data: {
                    usuarioId: userId,
                    idConfiguracion: configuracion.idConfiguracion,
                    rodeoOrigen: body.rodeoOrigen,
                    rodeoDestino: body.rodeoDestino,
                    cantidad: body.cantidad,
                    motivo: body.motivo,
                    observacion: body.observacion,
                    tipo: TipoMovimientoAnimal.TRANSFERENCIA,
                }
            });

            return transferencia;

        });

        return transferencia;
    }
}

export default new SettingService();