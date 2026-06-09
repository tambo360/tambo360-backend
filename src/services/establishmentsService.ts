import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { CreateEstablishmentData, QuestionnaireData } from "../schemas/establishmentSchema";
import { Categoria, EstadoInvitacion, RolEstablecimiento } from "@prisma/client";
import { getRoleLabel } from "../utils/enumValidation";
import { sendInvitationEmail } from "./mailService";
import { generateToken, hashToken } from "../utils/token";
import { formatDate } from "../utils";

type CreateEstablishmentServiceData = CreateEstablishmentData & {
    userId: string;
    idOrg: string;
    idOrganizacionUsuario: string;
};

class EstablishmentsService {

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

            // 2. Actualizar datos básicos
            await tx.establecimiento.update({
                where: { idEstablecimiento: data.idEstablecimiento },
                data: {
                    localidad: data.ubicacion.localidad,
                    provincia: data.ubicacion.provincia,
                }
            });

            await tx.configuracion.update({
                where: {
                    idConfiguracion: establecimiento.configuracions[0].idConfiguracion,
                },
                data: {
                    cantVacas: data.rodeos.reduce((sum, r) => sum + r.cantVacas, 0),
                    cantOrdenies: data.cantOrdenie,
                    promLitros: data.promLitros,
                    tipoOrdenie: data.tipoOrdenie,
                    ventaLeche: data.ventaLeche,
                    empleados: data.empleados,
                    cantEmpleados: data.cantEmpleados,
                    modificadoEn: new Date(),
                }
            });

            await tx.rodeo.createMany({
                data: data.rodeos.map(r => ({
                    tipoRodeo: r.tipoRodeo,
                    cantVacas: r.cantVacas,
                    costoRacion: r.costoRacion,
                    idConfiguracion: establecimiento.configuracions[0].idConfiguracion,
                })),
            });


            // =========================================================
            // PRODUCTOS
            // =========================================================
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
                            { idOrganizacion: orgId }
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
                                    idOrganizacion: orgId,
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
                idConfiguracion: idConfiguracion
            }
        })

        if (!rodeo) {
            throw new AppError("Rodeo no encontrado", 404);
        }

        return rodeo;
    }
}

export default new EstablishmentsService();