import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { Animal, CreateEstablishmentData, QuestionnaireData, QuestionnaireIndividualData, Rodeo } from "../schemas/establishmentSchema";
import { EstadoInvitacion, RolEstablecimiento, Prisma, TipoSeguimiento, TipoRodeo, CategoriaAnimal, EstadoSanitarioAnimal } from "@prisma/client";
import { getRoleLabel } from "../utils/enumValidation";
import { sendInvitationEmail } from "./mailService";
import { generateToken, hashToken } from "../utils/token";
import { formatDate, RazasMetaData, TipoRodeoMetaData } from "../utils";

type CreateEstablishmentServiceData = CreateEstablishmentData & {
    userId: string;
    idOrg: string;
    idOrganizacionUsuario: string;
};

class EstablishmentsService {
    //Limite de animales para el seguimiento individual
    public LIMITE_ANIMAL = 70
    public LIMITE_PROM_LITROS = 2000

    async obtenerEstablecimiento(idEstablecimiento: string) {
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

    private async actualizarEstablecimiento(tx: Prisma.TransactionClient, data: QuestionnaireData) {
        await tx.establecimiento.update({
            where: { idEstablecimiento: data.idEstablecimiento },
            data: {
                localidad: data.ubicacion.localidad,
                provincia: data.ubicacion.provincia,
                cuestionarioCompletado: true,
            }
        });
    }

    private async actualizarConfiguracion(tx: Prisma.TransactionClient, data: QuestionnaireData, cantVacas: number, idConfiguracion: string) {
        await tx.configuracion.update({
            where: {
                idConfiguracion: idConfiguracion,
            },
            data: {
                cantVacas: cantVacas,
                cantOrdenies: data.cantOrdenie,
                promLitros: data.promLitros,
                promDEL: data.promDEL,
                tipoOrdenie: data.tipoOrdenie,
                ventaLeche: data.ventaLeche,
                precioLitro: data.precioLitro,
                tipoSeguimiento: data.TipoSeguimiento,
                modificadoEn: new Date(),
            }
        });
    }

    private async sincronizarRodeos(tx: Prisma.TransactionClient, data: Rodeo[], idConfiguracion: string) {
        for (const r of data) {
            await tx.rodeo.create({
                data: {
                    tipoRodeo: r.tipoRodeo,
                    cantVacas: r.cantVacas,
                    costoRacion: r.costoRacion,
                    idConfiguracion,
                    razas: {
                        create: r.razas.map(raza => ({
                            nombre: raza.raza,
                            cantVacas: raza.cantVacas,
                        })),
                    },
                },
            });
        }
    }


    private async sincronizarProductos(tx: Prisma.TransactionClient, data: QuestionnaireData, idOrganizacion: string) {
        if (data.productos) {
            const productosExistentesInput = data.productos.filter((p): p is Extract<typeof p, { tipo: "existente" }> => p.tipo === "existente");

            const productosNuevosInput = data.productos
                .filter((p): p is Extract<typeof p, { tipo: "nuevo" }> => p.tipo === "nuevo")
                .map(p => ({
                    nombre: p.nombre,
                    nombreNormalizado: p.nombre.trim().toLowerCase(),
                    categoria: p.categoria
                }));


            // =========================================
            // BUSCAR NUEVOS QUE YA EXISTAN
            // =========================================

            const nombresProductosNuevos = productosNuevosInput.map(
                p => p.nombreNormalizado
            );

            const productosExistentesDB = await tx.producto.findMany({
                where: {
                    nombreNormalizado: {
                        in: nombresProductosNuevos
                    },
                    OR: [
                        { idOrganizacion: null },
                        { idOrganizacion: idOrganizacion }
                    ]
                }
            });

            const mapaProductosExistentes = new Map(
                productosExistentesDB.map(p => [
                    p.nombreNormalizado,
                    p
                ])
            );


            // =========================================
            // FILTRAR LOS QUE REALMENTE HAY QUE CREAR
            // =========================================

            const nuevosProductosCrear = productosNuevosInput.filter(
                p => !mapaProductosExistentes.has(p.nombreNormalizado)
            );


            // =========================================
            // CREAR NUEVOS
            // =========================================

            let nuevosProductosCreados: { idProducto: string }[] = [];

            if (nuevosProductosCrear.length > 0) {

                nuevosProductosCreados = await Promise.all(
                    nuevosProductosCrear.map(p =>
                        tx.producto.create({
                            data: {
                                nombre: p.nombre,
                                nombreNormalizado: p.nombreNormalizado,
                                idOrganizacion: idOrganizacion,
                                esSistema: false,
                                categoria: p.categoria
                            },
                            select: {
                                idProducto: true
                            }
                        })
                    )
                );
            }


            // =========================================
            // ARMAR IDS FINALES
            // =========================================

            const idsProductosFinales = [

                // existentes enviados por front
                ...productosExistentesInput.map(p => p.idProducto),

                // nuevos que ya existían en DB
                ...productosNuevosInput
                    .map(p =>
                        mapaProductosExistentes.get(
                            p.nombreNormalizado
                        )?.idProducto
                    )
                    .filter(Boolean) as string[],

                // nuevos creados
                ...nuevosProductosCreados.map(
                    p => p.idProducto
                )
            ];


            const idsProductosUnicos = [
                ...new Set(idsProductosFinales)
            ];


            // =========================================
            // RELACIONES
            // =========================================

            await tx.establecimientoProducto.deleteMany({
                where: {
                    idEstablecimiento: data.idEstablecimiento
                }
            });

            await tx.establecimientoProducto.createMany({
                data: idsProductosUnicos.map(idProducto => ({
                    idEstablecimiento: data.idEstablecimiento,
                    idProducto
                }))
            });
        }
    }

    private async sincronizarAnimales(tx: Prisma.TransactionClient, data: Animal[], cantVacas: number, idEst: string) {
        const animales = await tx.animal.count({
            where: {
                idEstablecimiento: idEst,
                activo: true,
            }
        });

        if (animales + cantVacas > this.LIMITE_ANIMAL) {
            throw new AppError("No se puede superar el límite de animales para el establecimiento", 400);
        }

        await tx.animal.createMany({
            data: data.map(a => ({
                idEstablecimiento: idEst,
                codigo: a.codigo,
                nombre: a.nombre,
                categoria: a.categoria,
                estado: a.estado,
                fechaNacimiento: a.fechaNacimiento,
                fechaUltimoParto: a.fechaParto,
                observacion: a.observacion,
                raza: a.raza
            }))
        })
    }

    async create(data: CreateEstablishmentServiceData, tx?: Prisma.TransactionClient) {

        const existente = await prisma.organizacion.findFirst({
            where: {
                idOrganizacion: data.idOrg,
                establecimientos: {
                    some: {
                        nombre: data.nombre,
                    }
                }
            },
        });

        if (existente) {
            throw new AppError("Ya existe un establecimiento con ese nombre en la organización", 400);
        }

        if (tx) {
            const establecimiento = await tx.establecimiento.create({
                data: {
                    nombre: data.nombre,
                    idOrganizacion: data.idOrg,
                },
            });

            await tx.establecimiento_OrganizacionUsuario.create({
                data: {
                    idEstablecimiento: establecimiento.idEstablecimiento,
                    idOrganizacionUsuario: data.idOrganizacionUsuario,
                    rol: RolEstablecimiento.OWNER,
                }
            })

            await tx.configuracion.create({
                data: {
                    idEstablecimiento: establecimiento.idEstablecimiento
                }
            })

            return establecimiento;
        } else {
            const result = await prisma.$transaction(async (prisma) => {
                const establecimiento = await prisma.establecimiento.create({
                    data: {
                        nombre: data.nombre,
                        idOrganizacion: data.idOrg,
                    },
                });

                await prisma.establecimiento_OrganizacionUsuario.create({
                    data: {
                        idEstablecimiento: establecimiento.idEstablecimiento,
                        idOrganizacionUsuario: data.idOrganizacionUsuario,
                        rol: RolEstablecimiento.OWNER,
                    }
                })

                await prisma.configuracion.create({
                    data: {
                        idEstablecimiento: establecimiento.idEstablecimiento
                    }
                })

                return establecimiento;
            })

            return result;
        }
    }

    async listarPorUsuario(idOrganizacionUsuario: string) {
        const establecimientos = await prisma.organizacionUsuario.findMany({
            where: { idOrganizacionUsuario },
            include: {
                establecimientoOrganizacionUsuarios: {
                    include: {
                        establecimiento: true,
                    }
                }
            }
        });

        return establecimientos;
    }

    /* async actualizarNombre(idUsuario: string, nombre: string) {
 
         const establecimiento = await prisma.establecimiento.findFirst({
             where: { idUsuario }
         });
 
         if (!establecimiento) {
             throw new AppError("Establecimiento no encontrado", 404);
         }
 
         const actualizado = await prisma.establecimiento.update({
             where: { idEstablecimiento: establecimiento.idEstablecimiento },
             data: { nombre }
         });
 
         return actualizado;
     }*/

    async getEstablishmentById(id: string, idOrganizacionUsuario: string) {
        const establishment = await prisma.establecimiento_OrganizacionUsuario.findFirst({
            where: {
                idEstablecimiento: id,
                idOrganizacionUsuario,
            },
            include: {
                establecimiento: true,
            }
        });

        return establishment;
    }

    async guardarCuestionario(data: QuestionnaireData) {
        return await prisma.$transaction(async (tx) => {

            // 1. Validar establecimiento
            const establecimiento = await tx.establecimiento.findUnique({
                where: { idEstablecimiento: data.idEstablecimiento },
                select: {
                    idOrganizacion: true,
                    configuracions: {
                        select: { idConfiguracion: true }
                    },
                    idEstablecimiento: true
                }
            });

            if (!establecimiento) {
                throw new AppError("Establecimiento no encontrado", 404);
            }
            const orgId = establecimiento.idOrganizacion;
            let cant = 0

            switch (data.TipoSeguimiento) {
                case TipoSeguimiento.RODEO:
                case TipoSeguimiento.RODEO_UNICO:
                    const rodeosProcesados = data.rodeos.map(r => {
                        let sumaRazas = r.razas.reduce((acc, raza) => acc + raza.cantVacas, 0);

                        if (sumaRazas <= 0) {
                            throw new AppError(`El rodeo ${r.tipoRodeo} no tiene vacas válidas`, 400);
                        }

                        cant += sumaRazas;

                        return {
                            ...r,
                            cantVacas: sumaRazas, // derivado, no tomado del cliente
                        };
                    });

                    await this.actualizarEstablecimiento(tx, data)
                    await this.actualizarConfiguracion(tx, data, cant, establecimiento.configuracions[0].idConfiguracion)
                    await this.sincronizarProductos(tx, data, orgId)

                    await this.sincronizarRodeos(tx, rodeosProcesados, establecimiento.configuracions[0].idConfiguracion)
                    break
                case TipoSeguimiento.INDIVIDUAL:
                    if (!data.animales) {
                        throw new AppError("Debe proporcionar los animales", 400);
                    }
                    cant = data.animales.length;

                    if ((cant > this.LIMITE_ANIMAL || data.promLitros > this.LIMITE_PROM_LITROS) && data.TipoSeguimiento === TipoSeguimiento.INDIVIDUAL) {
                        throw new AppError("Los datos proporcionados exceden los límites permitidos para el seguimiento individual", 400);
                    }
                    await this.actualizarEstablecimiento(tx, data)
                    await this.actualizarConfiguracion(tx, data, cant, establecimiento.configuracions[0].idConfiguracion)
                    await this.sincronizarProductos(tx, data, orgId)

                    await this.sincronizarAnimales(tx, data.animales, cant, establecimiento.idEstablecimiento)
                    break;
                default:
                    throw new AppError("Tipo de seguimiento no válido", 400);
            }

            /*
            if (data.promLitros < this.LIMITE_PROM_LITROS && data.TipoSeguimiento === TipoSeguimiento.RODEO) {
                throw new AppError(`El promedio de litros debe ser mayor a ${this.LIMITE_PROM_LITROS} para el seguimiento por rodeo`, 400);
            }*/

            return { status: "success" };
        });
    }

    async getCuestionario(idEstablecimiento: string) {
        const cuestionario = await prisma.configuracion.findFirst({
            where: {
                idEstablecimiento,
            }
        })

        if (!cuestionario) {
            throw new AppError("Cuestionario no encontrado para este establecimiento", 404);
        }

        const [rodeos, establecimiento, productos, animales] = await Promise.all([
            prisma.rodeo.findMany({
                where: {
                    idConfiguracion: cuestionario.idConfiguracion,
                }
            })
            ,
            prisma.establecimiento.findFirst({
                where: {
                    idEstablecimiento,
                },
                select: {
                    localidad: true,
                    provincia: true,
                    nombre: true
                }
            }),
            prisma.establecimientoProducto.findMany({
                where: {
                    idEstablecimiento,
                },
                include: {
                    producto: true,
                }
            }),
            prisma.animal.findMany({
                where: {
                    idEstablecimiento: cuestionario.idEstablecimiento
                },
                select: {
                    idAnimal: true,
                    idRodeo: true,
                    codigo: true,
                    nombre: true,
                    categoria: true,
                    estado: true,
                    genero: true,
                    activo: true,
                    fechaNacimiento: true
                }
            })
        ])

        return { cuestionario, rodeos, establecimiento, productos, animales };
    }

    async sendInvitation(orgId: string, estId: string, userId: string, correo: string, rol: RolEstablecimiento) {
        const rawToken = generateToken()
        const hashedToken = hashToken(rawToken)

        const existingInvitation = await prisma.invitacionEstablecimiento.findFirst({
            where: {
                idEstablecimiento: estId,
                correo: correo,
                expiraEn: {
                    gt: new Date()
                },
                estado: EstadoInvitacion.pendiente
            }
        })

        if (existingInvitation) {
            throw new Error('Ya existe una invitación activa para este correo');
        }

        const invitation = await prisma.invitacionEstablecimiento.create({
            data: {
                idEstablecimiento: estId,
                idInvitador: userId,
                correo: correo,
                codigo: hashedToken,
                expiraEn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expira en 7 días,
                rol: rol
            },
            select: {
                invitador: {
                    select: {
                        nombre: true
                    }
                },
                establecimiento: {
                    select: {
                        nombre: true
                    }
                },
                rol: true,
                expiraEn: true
            }
        })

        if (!invitation) {
            throw new Error('Error al crear la invitación');
        }

        const link = `${process.env.FRONTEND_URL}/invitaciones`;

        await sendInvitationEmail(correo, invitation.invitador.nombre, invitation.establecimiento.nombre, "el establecimiento", getRoleLabel(invitation.rol, "establecimiento"), link, formatDate(invitation.expiraEn));

        return invitation;
    }

    async getInvitation(estId: string, userId: string) {
        const invitation = await prisma.invitacionEstablecimiento.findMany({
            where: {
                idEstablecimiento: estId,
                idInvitador: userId
            },
            select: {
                idInvitacion: true,
                estado: true,
                correo: true,
                codigo: true,
                expiraEn: true,
                rol: true
            }
        });

        if (!invitation) {
            throw new Error('Invitación no encontrada');
        }

        return invitation;
    }

    async deleteInvitation(invitationId: string, estId: string) {
        const invitation = await prisma.invitacionEstablecimiento.findUnique({
            where: {
                idInvitacion: invitationId
            }
        });

        if (!invitation) {
            throw new AppError("Invitación no encontrada", 404);
        }

        if (invitation.idEstablecimiento !== estId) {
            throw new AppError("No tienes permiso para eliminar esta invitación", 403);
        }

        if (invitation.estado !== EstadoInvitacion.pendiente || invitation.respondidaEn) {
            throw new AppError("La invitación ya ha sido procesada", 400);
        }

        await prisma.invitacionEstablecimiento.delete({
            where: {
                idInvitacion: invitation.idInvitacion
            }
        });

        return {
            idInvitacion: invitation.idInvitacion,
            idEstablecimiento: invitation.idEstablecimiento,
            correo: invitation.correo,
            estado: invitation.estado
        };
    }

    async validateProduct(idProducto: string) {
        const producto = await prisma.producto.findUnique({
            where: {
                idProducto: idProducto
            }
        })

        if (!producto) {
            throw new AppError("Producto no encontrado", 404);
        }

        return producto;
    }

    async validateRodeo(idRodeo: string, idConfiguracion: string) {
        const rodeo = await prisma.rodeo.findUnique({
            where: {
                idRodeo: idRodeo,
            },
            include: {
                razas: true
            }
        })


        if (!rodeo) {
            throw new AppError("Rodeo no encontrado", 404);
        }

        if (rodeo.idConfiguracion !== idConfiguracion) {
            throw new AppError("El rodeo no pertenece a la configuración del establecimiento", 400);
        }

        return rodeo;
    }

    async validateAnimals(idEstablecimiento: string, idAnimales: string[]) {
        const uniqueIds = [...new Set(idAnimales)];
        const animales = await prisma.animal.findMany({
            where: {
                idEstablecimiento: idEstablecimiento,
                activo: true,
                idAnimal: {
                    in: uniqueIds
                }
            }
        });

        if (animales.length !== uniqueIds.length) {
            throw new AppError("Algunos animales no pertenecen al establecimiento", 400);
        }

        return animales;
    }

    async listarAnimales(idEstablecimiento: string) {
        const animales = await prisma.animal.findMany({
            where: {
                idEstablecimiento: idEstablecimiento,
                activo: true,
                categoria: CategoriaAnimal.ORDENE,
                estado: EstadoSanitarioAnimal.SANO
            }
        });
        return animales.map(a => ({
            idAnimal: a.idAnimal,
            codigo: a.codigo,
            nombre: a.nombre,
            categoria: a.categoria,
            estado: a.estado,
            fechaNacimiento: a.fechaNacimiento,
            raza: RazasMetaData[a.raza]?.label || "Raza no definida"
        }));
    }


    async listarRodeos(idEstablecimiento: string, filtroTipoRodeo?: TipoRodeo[]) {
        const est = await prisma.establecimiento.findUnique({
            where: {
                idEstablecimiento
            },
            include: {
                configuracions: {
                    select: {
                        idConfiguracion: true
                    }
                }
            }
        })

        if (!est) {
            throw new AppError("Establecimiento no encontrado", 404);
        }

        const rodeos = await prisma.rodeo.findMany({
            where: {
                idConfiguracion: est.configuracions[0].idConfiguracion,
                ...(filtroTipoRodeo ? { tipoRodeo: { in: filtroTipoRodeo } } : {})
            },
            include: {
                razas: true
            }
        })

        return rodeos.map(r => ({
            idRodeo: r.idRodeo,
            label: TipoRodeoMetaData[r.tipoRodeo].label || "Tipo de rodeo no definido",
            value: TipoRodeoMetaData[r.tipoRodeo].value || "tipo-rodeo-no-definido",
            costoRacion: r.costoRacion,
            cantVacas: r.cantVacas,
            razas: r.razas.map(raza => ({
                idRaza: raza.idRaza,
                nombre: RazasMetaData[raza.nombre].label || "Raza no definida",
                value: RazasMetaData[raza.nombre].value || "raza-no-definida",
                cantVacas: raza.cantVacas
            }))
        }));
    }

    async obtenerOpcionesSeguimiento(idEstablecimiento: string) {
        const establecimiento = await this.obtenerEstablecimiento(idEstablecimiento);
        const tipoSeguimiento = establecimiento.configuracions[0].tipoSeguimiento;

        const filtrosRodeo = [TipoRodeo.ALTA_PRODUCCION, TipoRodeo.BAJA_PRODUCCION, TipoRodeo.UNICO_ORDENIE]
        switch (tipoSeguimiento) {
            case TipoSeguimiento.RODEO:
            case TipoSeguimiento.RODEO_UNICO: {
                const rodeos = await this.listarRodeos(idEstablecimiento, filtrosRodeo);
                return {
                    tipoSeguimiento,
                    rodeos,
                };
            }

            case TipoSeguimiento.INDIVIDUAL: {
                const animales = await this.listarAnimales(idEstablecimiento);
                return {
                    tipoSeguimiento,
                    animales,
                };
            }

            default:
                throw new AppError("Tipo de seguimiento no válido", 400);
        }


    }
}

export default new EstablishmentsService();