import { EstadoInvitacion, RolOrganizacion } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { CreateOrganizationInput } from "../schemas/organizationSchema";
import { generateToken, hashToken } from "../utils/token";
import { sendInvitationEmail } from "./mailService";
import { getRoleLabel } from "../utils/enumValidation";
import { formatDate } from "../utils";

class OrganizationService {
    async createOrganization(data: CreateOrganizationInput) {
        const result = await prisma.$transaction(async (prisma) => {
            const org = await prisma.organizacion.create({
                data: {
                    nombre: data.nombre
                }
            })

            await prisma.organizacionUsuario.create({
                data: {
                    idUsuario: data.userId,
                    idOrganizacion: org.idOrganizacion,
                    rol: data.rol
                }
            })

            return org
        })

        return result
    }

    async getOrganizations(userId: string) {
        const organizations = await prisma.organizacionUsuario.findMany({
            where: {
                idUsuario: userId
            },
            include: {
                organizacion: true,
                establecimientoOrganizacionUsuarios: {
                    include: {
                        establecimiento: true
                    }
                }
            }
        });
        return organizations;
    }

    async getOrganizationById(id: string, userId: string) {
        const organization = await prisma.organizacionUsuario.findFirst({
            where: {
                idUsuario: userId,
                idOrganizacion: id
            },
            include: {
                organizacion: true,
                establecimientoOrganizacionUsuarios: {
                    include: {
                        establecimiento: true
                    }
                }
            }
        });
        return organization;

    }

    async sendInvitation(orgId: string, userId: string, correo: string) {
        const rawToken = generateToken()
        const hasedToken = hashToken(rawToken)
        const existingInvitation = await prisma.invitacionOrganizacion.findFirst({
            where: {
                idOrganizacion: orgId,
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

        const invitation = await prisma.invitacionOrganizacion.create({
            data: {
                idOrganizacion: orgId,
                idInvitador: userId,
                correo: correo,
                codigo: hasedToken,
                expiraEn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expira en 7 días
                rol: RolOrganizacion.ORG_ADMIN
            },
            select: {
                invitador: {
                    select: {
                        nombre: true
                    }
                },
                organizacion: {
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

        await sendInvitationEmail(correo, invitation.invitador.nombre, invitation.organizacion.nombre, "la organización", getRoleLabel(invitation.rol, "organizacion"), link, formatDate(invitation.expiraEn));

        return invitation;
    }
}

export default new OrganizationService();
