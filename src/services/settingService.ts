import { prisma, } from "../lib/prisma";
import { ActualizarEst, AltaAnimal, AltaAnimalIndividual, AltaAnimalRodeo, BajaAnimal, BajaAnimalIndividual, BajaAnimalRodeo, motivosPorTipo, TransferenciaRodeo } from "../schemas/settingSchema";
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
                cantVacas: rodeoDestino.cantVacas + body.cantidad
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

        if (body.cantidad !== body.animales.length) {
            throw new AppError("La cantidad de animles ingresada no coincide", 400)
        }

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

        return { ...altaAnimal, animales: animalesCreados };


    }

    private async bajaAnimalRodeo(tx: Prisma.TransactionClient, userId: string, idConfiguracion: string, body: BajaAnimalRodeo) {
        const rodeoOrigen = await tx.rodeo.findFirst({
            where: {
                idRodeo: body.rodeoOrigen,
                idConfiguracion: idConfiguracion,
            },
        })

        if (!rodeoOrigen) {
            throw new AppError("Rodeo de origen no encontrado", 404);
        }

        if (rodeoOrigen.cantVacas < body.cantidad) {
            throw new AppError("Cantidad a dar de baja mayor a la cantidad disponible en el rodeo de origen", 400);
        }

        const nuevoRodeoOrigen = await tx.rodeo.update({
            where: {
                idRodeo: body.rodeoOrigen,
            },
            data: {
                cantVacas: rodeoOrigen.cantVacas - body.cantidad,
            },
        });

        const bajaAnimal = await tx.movimientoAnimal.create({
            data: {
                usuarioId: userId,
                idConfiguracion: idConfiguracion,
                rodeoOrigen: body.rodeoOrigen,
                cantidad: body.cantidad,
                motivo: body.motivo,
                observacion: body.observacion,
                tipo: TipoMovimientoAnimal.EGRESO,
            }
        })

        return bajaAnimal
    }

    private async bajaAnimalIndividual(tx: Prisma.TransactionClient, userId: string, idConfiguracion: string, body: BajaAnimalIndividual, idEstablecimiento: string) {
        if (body.cantidad !== body.animales.length) {
            throw new AppError("La cantidad de animles ingresada no coincide", 400)
        }
        const animales = await EstablishmentsService.validateAnimals(idEstablecimiento, body.animales)

        if (animales.length < body.cantidad) {
            throw new AppError("Cantidad a dar de baja mayor a la cantidad disponible", 400)
        }


        const bajaAnimal = await tx.movimientoAnimal.create({
            data: {
                usuarioId: userId,
                idConfiguracion: idConfiguracion,
                cantidad: body.animales.length,
                motivo: body.motivo,
                observacion: body.observacion,
                tipo: TipoMovimientoAnimal.EGRESO,
            }
        });


        const animalesDescartados = await Promise.all(
            body.animales.map(animal =>
                tx.animal.update({
                    where: {
                        idAnimal: animal
                    },
                    data: {
                        activo: false
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
            data: animalesDescartados.map(animal => ({
                idMovimiento: bajaAnimal.idMovimiento,
                idAnimal: animal.idAnimal,
            })),
        });

        return { ...bajaAnimal, animales: animalesDescartados };

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

    async eliminarAnimal(userId: string, idEstablecimiento: string, body: BajaAnimal) {
        const bajaAnimal = await prisma.$transaction(async (tx) => {
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
                    return await this.bajaAnimalRodeo(tx, userId, configuracion.idConfiguracion, body);
                case TipoSeguimiento.INDIVIDUAL:
                    return await this.bajaAnimalIndividual(tx, userId, configuracion.idConfiguracion, body, idEstablecimiento);
                default:
                    throw new AppError("Tipo de seguimiento invalido", 400);
            }
        })

        return bajaAnimal;
    }

    async actualizarEst(userId: string, idEstablecimiento: string, body: ActualizarEst){
        const est = await EstablishmentsService.obtenerEstablecimiento(idEstablecimiento)

        const res = await prisma.$transaction(async (tx) => {
            const conf = await tx.configuracion.update({
                where:{
                    idConfiguracion: est.configuracions[0].idConfiguracion,
                    idEstablecimiento: est.idEstablecimiento
                },
                data: {
                    tipoOrdenie: body.tipo_ordenie,
                    promLitros: body.promLitros,
                    cantOrdenies: body.ordenie_dia,
                    modificadoEn: new Date()
                }
            })
            const establecimiento = await tx.establecimiento.update({
                where: {
                    idEstablecimiento: est.idEstablecimiento
                },
                data: {
                    provincia: body.ubicacion.provincia,
                    localidad: body.ubicacion.localidad,
                    nombre: body.nombre
                }
            })

            return {conf, establecimiento}
        })

        return res
    }
}

export default new SettingService();