import { prisma, } from "../lib/prisma";
import { ActualizarAnimal, ActualizarEst, AltaAnimal, AltaAnimalIndividual, AltaAnimalRodeo, BajaAnimal, BajaAnimalIndividual, BajaAnimalRodeo, ListarAnimalesFiltros, motivosPorTipo, TransferenciaRodeo } from "../schemas/settingSchema";
import { AppError } from "../utils/AppError";
import { Prisma, TipoMovimientoAnimal, TipoSeguimiento } from "@prisma/client";
import EstablishmentsService from "./establishmentsService";
import { Decimal } from "@prisma/client/runtime/library";
import { formatDate, normalizarMotivo } from "../utils";


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

    async actualizarEst(userId: string, idEstablecimiento: string, body: ActualizarEst) {
        const est = await EstablishmentsService.obtenerEstablecimiento(idEstablecimiento)

        const res = await prisma.$transaction(async (tx) => {
            const conf = await tx.configuracion.update({
                where: {
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

            return { conf, establecimiento }
        })

        return res
    }

    async listarAnimales(idEstablecimiento: string, params: ListarAnimalesFiltros) {
        const where: any = {};
        const fecha = new Date();
        const inicioDia = new Date(fecha.setHours(0, 0, 0, 0));
        const finDia = new Date(fecha.setHours(23, 59, 59, 999))
        const hoy = fecha.getTime()
            ;
        if (params.codigo) {
            where.codigo = { contains: params.codigo, mode: "insensitive" };
        }

        if (params.nombre) {
            where.nombre = { contains: params.nombre, mode: "insensitive" };
        }

        if (params.estado) {
            where.estado = params.estado;
        }
        const animales = await prisma.animal.findMany({
            where: {
                ...where,
                activo: true
            },
            orderBy: {
                nombre: params.orden ?? "asc",
            },
            skip: (params.page - 1) * params.limit,
            take: params.limit,
            include: {
                producciones: {
                    where: {
                        lote: {
                            fechaProduccion: {
                                gte: inicioDia,
                                lte: finDia,
                            }
                        }
                    }
                }
            }
        })

        const parsedAnimales = animales.map(a => {
            let diffDias = 0
            if (a.fechaUltimoParto) {
                const diffMs = hoy - a.fechaUltimoParto.getTime();
                diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            }

            const litrosAgrupados = a.producciones.reduce((acc, prod) => {
                const litros = prod.litros as Decimal;
                acc[prod.destino] = (acc[prod.destino] ?? new Decimal(0)).add(litros);
                return acc;
            }, {} as Record<string, Decimal>);

            return {
                idAnimal: a.idAnimal,
                idRodeo: a.idRodeo,
                nombre: a.nombre,
                codigo: a.codigo,
                categoria: a.categoria,
                estado: a.estado,
                genero: a.genero,
                observacion: a.observacion,
                fechaNacimiento: a.fechaNacimiento,
                DEL: diffDias,
                produccion: {
                    litros_hoy: litrosAgrupados,
                    litros_totales: Object.values(litrosAgrupados).reduce((sum, v) => sum.add(v), new Decimal(0)),
                }
            }
        })

        return parsedAnimales
    }

    async actualizarAnimal(idEstablecimiento: string, data: ActualizarAnimal) {
        const res = await prisma.$transaction(async tx => {
            const animal = await tx.animal.findUnique({
                where: {
                    idAnimal: data.id,
                    idEstablecimiento: idEstablecimiento
                }
            })

            if (!animal) {
                throw new AppError("El animal no existe", 400);
            }

            return await tx.animal.update({
                where: {
                    idAnimal: data.id,
                    idEstablecimiento: idEstablecimiento
                },
                data: {
                    codigo: data.codigo,
                    nombre: data.nombre,
                    categoria: data.Categoria,
                    estado: data.estado,
                    observacion: data.observacion,
                    fechaNacimiento: data.fechaNacimiento,
                    fechaUltimoParto: data.fechaParto
                }
            })
        })

        return res
    }

    async obtenerMovimientos(idEstablecimiento: string){
        const est = await EstablishmentsService.obtenerEstablecimiento(idEstablecimiento)

        const movimientos = await prisma.movimientoAnimal.findMany({
            where: {
                idConfiguracion: est.configuracions[0].idConfiguracion
            },
            select:{
                idMovimiento: true,
                tipo: true,
                motivo: true,
                rodeoOrigen: true,
                rodeoDestino: true,
                cantidad: true,
                observacion: true,
                usuarioId: true,
                fechaCreacion: true,
                detalles: {
                    select: {
                        animal: {
                            select: {
                                idAnimal: true,
                                codigo: true,
                                nombre: true,
                                idRodeo: true,
                                categoria: true,
                                estado: true
                            }
                        }
                    }
                },
                usuario: {
                    select: {
                        nombre: true
                    }
                }
            }
        })

        const res = movimientos.map(m => ({
            ...m,
            motivo: normalizarMotivo(m.motivo),
            fechaCreacion: formatDate(m.fechaCreacion)
        }))
        return res
    }
}

export default new SettingService();