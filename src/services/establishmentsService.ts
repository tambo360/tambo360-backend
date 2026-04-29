import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { CreateEstablishmentData, QuestionnaireData } from "../schemas/establishmentSchema";
import { RolEstablecimiento } from "@prisma/client";
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
                    cantVacas: data.cantidadVacas,
                    cantOrdenies: data.cantOrdenie,
                    promLitros: data.promLitros,
                    tipoOrdenie: data.tipoOrdenie,
                    ventaLeche: data.ventaLeche,
                    empleados: data.empleados,
                    cantEmpleados: data.cantEmpleados,
                    modificadoEn: new Date(),
                }
            });

            // 3. Normalizar nombres
            const razasInput = data.Razas.map(r => ({
                idRaza: r.idRaza,
                nombre: r.nombre,
                nombreNormalizado: r.nombre.trim().toLowerCase()
            }));

            // 4. Separar
            const conId = razasInput.filter(r => r.idRaza);
            const sinId = razasInput.filter(r => !r.idRaza);

            // 5. Buscar existentes (batch)
            const nombresSinId = sinId.map(r => r.nombreNormalizado);

            const existentes = await tx.raza.findMany({
                where: {
                    nombreNormalizado: { in: nombresSinId },
                    OR: [
                        { idOrganizacion: null },
                        { idOrganizacion: orgId }
                    ]
                }
            });

            // map rápido
            const mapaExistentes = new Map(
                existentes.map(r => [r.nombreNormalizado, r])
            );

            // 6. Crear las que no existen
            const nuevasCrear = sinId.filter(r => !mapaExistentes.has(r.nombreNormalizado));

            let nuevasCreadas: { idRaza: string }[] = [];

            if (nuevasCrear.length > 0) {
                nuevasCreadas = await Promise.all(
                    nuevasCrear.map(r =>
                        tx.raza.create({
                            data: {
                                nombre: r.nombre,
                                nombreNormalizado: r.nombreNormalizado,
                                idOrganizacion: orgId,
                                esSistema: false
                            },
                            select: { idRaza: true }
                        })
                    )
                );
            }

            // 7. Armar lista final de IDs
            const idsFinales = [
                ...conId.map(r => r.idRaza!),
                ...sinId.map(r => mapaExistentes.get(r.nombreNormalizado)?.idRaza).filter(Boolean) as string[],
                ...nuevasCreadas.map(r => r.idRaza)
            ];

            // evitar duplicados
            const idsUnicos = [...new Set(idsFinales)];

            // 8. Reemplazar relaciones
            await tx.establecimientoRaza.deleteMany({
                where: { idEstablecimiento: data.idEstablecimiento }
            });

            await tx.establecimientoRaza.createMany({
                data: idsUnicos.map(idRaza => ({
                    idEstablecimiento: data.idEstablecimiento,
                    idRaza
                }))
            });

            return { status: "success" };
        });
    }
    
    async getCuestionario(idEstablecimiento: string) {
        const [cuestionario, razas, establecimiento] = await Promise.all([
            prisma.configuracion.findFirst({
                where: {
                    idEstablecimiento,
                }
            }),
            prisma.establecimientoRaza.findMany({
                where: {
                    idEstablecimiento,
                },
                include: {
                    raza: true,
                }
            }),
            prisma.establecimiento.findFirst({
                where: {
                    idEstablecimiento,
                },
                select: {
                    localidad: true,
                    provincia: true,
                }
            })
        ])

        return { cuestionario, razas, establecimiento };
    }

    async sendInvitation(orgId: string, estId: string, userId: string, correo: string, rol: RolEstablecimiento) {
        const rawToken = generateToken()
        const hashedToken = hashToken(rawToken)

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
}

export default new EstablishmentsService();