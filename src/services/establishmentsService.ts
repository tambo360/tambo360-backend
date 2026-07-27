import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { CreateEstablishmentData, QuestionnaireData } from "../schemas/establishmentSchema";
import { EstadoInvitacion, RolEstablecimiento, Prisma, TipoSeguimiento } from "@prisma/client";
import { getRoleLabel } from "../utils/enumValidation";
import { sendInvitationEmail } from "./mailService";
import { generateToken, hashToken } from "../utils/token";
import { formatDate, TipoRodeoMetaData } from "../utils";

type CreateEstablishmentServiceData = CreateEstablishmentData & {
    userId: string;
    idOrg: string;
    idOrganizacionUsuario: string;
};

class EstablishmentsService {
    //Limite de animales para el seguimiento individual
    private LIMITE_ANIMAL = 70

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

    private async actualizarConfiguracion(tx: Prisma.TransactionClient, data: QuestionnaireData, idConfiguracion: string) {
        await tx.configuracion.update({
            where: {
                idConfiguracion: idConfiguracion,
            },
            data: {
                cantVacas: data.cantVacas,
                cantOrdenies: data.cantOrdenie,
                promLitros: data.promLitros,
                tipoOrdenie: data.tipoOrdenie,
                ventaLeche: data.ventaLeche,
                empleados: data.empleados,
                cantEmpleados: data.cantEmpleados,
                tipoSeguimiento: data.TipoSeguimiento,
                modificadoEn: new Date(),
            }
        });
    }

    private async sincronizarRodeos(tx: Prisma.TransactionClient, data: QuestionnaireData, idConfiguracion: string) {
        if(!data.rodeos) {
            throw new AppError("Debe proporcionar los rodeos", 400);
        }
        const cant = data.rodeos.reduce((sum, r) => sum + r.cantVacas, 0)

        if (cant !== data.cantVacas) {
            throw new AppError("La suma de la cantidad de vacas por rodeo no coincide con la cantidad total de vacas", 400);
        }

        await tx.rodeo.createMany({
            data: data.rodeos.map(r => ({
                tipoRodeo: r.tipoRodeo,
                cantVacas: r.cantVacas,
                costoRacion: r.costoRacion,
                idConfiguracion: idConfiguracion,
            })),
        });
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

    private async sincronizarAnimales(tx: Prisma.TransactionClient, data: QuestionnaireData, idConfiguracion: string) {
        if(!data.animales){
            throw new AppError("Debe proporcionar los animales", 400);
        }
        const cant = data.animales.length

        if (cant !== data.cantVacas) {
            throw new AppError("La cantidad de animales no coincide con la cantidad total de vacas", 400);
        }

        await tx.animal.createMany({
            data: data.animales.map(a => ({
                idEstablecimiento: data.idEstablecimiento,
                codigo: a.codigo,
                nombre: a.nombre,
                categoria: a.categoria,
                estado: a.estado,
                fechaNacimiento: a.fechaNacimiento
            }))
        })
    }

    async create(data: CreateEstablishmentServiceData) {

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
                    }
                }
            });

            if (!establecimiento) {
                throw new AppError("Establecimiento no encontrado", 404);
            }

            const orgId = establecimiento.idOrganizacion;

            if (data.cantVacas > this.LIMITE_ANIMAL && data.TipoSeguimiento === TipoSeguimiento.INDIVIDUAL) {
                throw new AppError("La cantidad de vacas excede el límite para el seguimiento individual", 400);
            }

            // 2. Actualizar datos básicos
            await this.actualizarEstablecimiento(tx, data)
            await this.actualizarConfiguracion(tx, data, establecimiento.configuracions[0].idConfiguracion)
            await this.sincronizarProductos(tx, data, orgId)

            if (data.TipoSeguimiento === TipoSeguimiento.RODEO) {
                await this.sincronizarRodeos(tx, data, establecimiento.configuracions[0].idConfiguracion)
            }else {
                await this.sincronizarAnimales(tx, data, establecimiento.configuracions[0].idConfiguracion)
            }


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

        const [rodeos, establecimiento, productos] = await Promise.all([
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
                }
            }),
            prisma.establecimientoProducto.findMany({
                where: {
                    idEstablecimiento,
                },
                include: {
                    producto: true,
                }
            })
        ])

        return { cuestionario, rodeos, establecimiento, productos };
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

    async listarRodeos(idEstablecimiento: string) {
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
                idConfiguracion: est.configuracions[0].idConfiguracion
            }
        })

        return rodeos.map(r => ({
            idRodeo: r.idRodeo,
            label: TipoRodeoMetaData[r.tipoRodeo].label || "Tipo de rodeo no definido",
            value: TipoRodeoMetaData[r.tipoRodeo].value || "tipo-rodeo-no-definido",
            costoRacion: r.costoRacion,
            cantVacas: r.cantVacas,
        }));
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
}

export default new EstablishmentsService();