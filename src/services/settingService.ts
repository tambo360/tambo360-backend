import { prisma, } from "../lib/prisma";
import { AltaAnimal, AltaAnimalIndividual, AltaAnimalRodeo, motivosPorTipo, TransferenciaRodeo } from "../schemas/settingSchema";
import { AppError } from "../utils/AppError";
import { Prisma, TipoMovimientoAnimal, TipoSeguimiento } from "@prisma/client";
import EstablishmentsService from "./establishmentsService";


class SettingService {

    private async altaAnimalRodeo(tx: Prisma.TransactionClient, userId: string, idConfiguracion: string, body: AltaAnimalRodeo) {
        const rodeoDestino = await tx.rodeo.findFirst({
            where: {
                idRodeo: body.rodeoDestino,
                idConfiguracion: idConfiguracion,
            },
        })

        if (!rodeoDestino) {
            throw new AppError("Rodeo de destino no encontrado", 404);
        }

        const nuevoRodeoDestino = await tx.rodeo.update({
            where: {
                idRodeo: body.rodeoDestino,
            },
            data: {
                cantVacas: rodeoDestino.cantVacas + body.cantidad,
                costoRacion: body.costoRacion ? body.costoRacion : rodeoDestino.costoRacion,
            },
        });

        const altaAnimal = await tx.movimientoAnimal.create({
            data: {
                usuarioId: userId,
                idConfiguracion: idConfiguracion,
                rodeoDestino: body.rodeoDestino,
                cantidad: body.cantidad,
                motivo: body.motivo,
                observacion: body.observacion,
                tipo: TipoMovimientoAnimal.INGRESO,
            }
        });

        return altaAnimal;
    }

    private async altaAnimalIndividual(tx: Prisma.TransactionClient, userId: string, idConfiguracion: string, body: AltaAnimalIndividual, idEstablecimiento: string) {
        const animales = await tx.animal.count({
            where: {
                idEstablecimiento: idEstablecimiento,
                activo: true,
            }

        });

        if (animales + body.animales.length > EstablishmentsService.LIMITE_ANIMAL) {
            throw new AppError("No se puede superar el límite de animales para el establecimiento", 400);
        }

        const altaAnimal = await tx.movimientoAnimal.create({
            data: {
                usuarioId: userId,
                idConfiguracion: idConfiguracion,
                cantidad: body.animales.length,
                motivo: body.motivo,
                observacion: body.observacion,
                tipo: TipoMovimientoAnimal.INGRESO,
            }
        });

        const animalesCreados = await Promise.all(
            body.animales.map(animal =>
                tx.animal.create({
                    data: {
                        idEstablecimiento,
                        categoria: animal.categoria,
                        estado: animal.estado,
                        codigo: animal.codigo,
                        nombre: animal.nombre,
                        fechaNacimiento: animal.fechaNacimiento,
                    },
                    select: {
                        idAnimal: true,
                        categoria: true,
                        estado: true,
                        codigo: true,
                        nombre: true,
                        fechaNacimiento: true,
                    },
                })
            )
        );

        await tx.movimientoAnimalDetalle.createMany({
            data: animalesCreados.map(animal => ({
                idMovimiento: altaAnimal.idMovimiento,
                idAnimal: animal.idAnimal,
            })),
        });

        return {...altaAnimal, animales: animalesCreados};


    }

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

            if (configuracion.tipoSeguimiento !== TipoSeguimiento.RODEO) {
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

    async crearAnimal(userId: string, idEstablecimiento: string, body: AltaAnimal) {
        const altaAnimal = await prisma.$transaction(async (tx) => {
            const configuracion = await tx.configuracion.findFirst({
                where: {
                    idEstablecimiento: idEstablecimiento,
                },
            })

            if (!configuracion) {
                throw new AppError("Configuración no encontrada", 404);
            }

            if (configuracion.tipoSeguimiento !== body.tipoSeguimiento) {
                throw new AppError("El tipo de seguimiento no es válido para este establecimiento", 400);
            }

            switch (body.tipoSeguimiento) {
                case TipoSeguimiento.RODEO_UNICO:
                case TipoSeguimiento.RODEO:
                    return await this.altaAnimalRodeo(tx, userId, configuracion.idConfiguracion, body);
                case TipoSeguimiento.INDIVIDUAL:
                    return await this.altaAnimalIndividual(tx, userId, configuracion.idConfiguracion, body, idEstablecimiento);
                default:
                    throw new AppError("Tipo de seguimiento invalido", 400);
            }


        })

        return altaAnimal;
    }
}

export default new SettingService();