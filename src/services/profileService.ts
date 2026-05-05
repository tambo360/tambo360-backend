import { RolOrganizacion } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { RespondEstablishmentInvitationInput, RespondOrganizationInvitationInput } from "../schemas/profileSchema";
import { formatDate } from "../utils";
import { getRoleLabel } from "../utils/enumValidation";



class ProfileService {
    //Metodos reutilizables -----------------------------------------------------------
    private async getOrCreateOrgUser(
        tx: any,
        idOrganizacion: string,
        userId: string
    ) {
        const existing = await tx.organizacionUsuario.findUnique({
            where: {
                idOrganizacion_idUsuario: {
                    idOrganizacion,
                    idUsuario: userId
                }
            }
        });

        if (existing) return existing;

        return tx.organizacionUsuario.create({
            data: {
                idOrganizacion,
                idUsuario: userId,
                rol: RolOrganizacion.MEMBER
            }
        });
    }

    private async addUserToEstablishment(
        tx: any,
        idOrganizacionUsuario: string,
        idEstablecimiento: string,
        rol: RespondEstablishmentInvitationInput["rol"]
    ) {
        const exists = await tx.establecimiento_OrganizacionUsuario.findUnique({
            where: {
                idEstablecimiento_idOrganizacionUsuario: {
                    idEstablecimiento,
                    idOrganizacionUsuario
                }
            }
        });

        if (exists) {
            throw new Error("El usuario ya se encuentra en el establecimiento");
        }

        return tx.establecimiento_OrganizacionUsuario.create({
            data: {
                idOrganizacionUsuario,
                idEstablecimiento,
                rol
            }
        });
    }

    private async markInvitationAccepted(tx: any, invitationId: string) {
        return tx.invitacionEstablecimiento.update({
            where: { idInvitacion: invitationId },
            data: {
                estado: "aceptada",
                respondidaEn: new Date()
            }
        });
    }

    private async getValidInvitation(invitationId: string, userId: string) {
        const invitation = await prisma.invitacionEstablecimiento.findUnique({
            where: { idInvitacion: invitationId },
            include: {
                establecimiento: {
                    include: { organizacion: true }
                }
            }
        });

        if (!invitation) {
            throw new Error("Invitación no encontrada");
        }

        if (invitation.respondidaEn) {
            throw new Error("La invitación ya ha sido respondida");
        }

        if (new Date() > invitation.expiraEn) {
            throw new Error("La invitación ha expirado");
        }

        const user = await prisma.usuario.findUnique({
            where: { idUsuario: userId }
        });

        if (invitation.correo !== user?.correo) {
            throw new Error("No tienes permiso para responder esta invitación");
        }

        return invitation;
    }

    private async rejectInvitation(invitationId: string) {
        await prisma.invitacionEstablecimiento.update({
            where: { idInvitacion: invitationId },
            data: {
                estado: "rechazada",
                respondidaEn: new Date()
            }
        });

        return { response: "rechazada" };
    }

    private async acceptInvitation(
        invitation: any,
        userId: string,
        rol: RespondEstablishmentInvitationInput["rol"]
    ) {
        return prisma.$transaction(async (tx) => {

            const orgUser = await this.getOrCreateOrgUser(
                tx,
                invitation.establecimiento.idOrganizacion,
                userId
            );

            await this.addUserToEstablishment(
                tx,
                orgUser.idOrganizacionUsuario,
                invitation.idEstablecimiento,
                rol
            );

            await this.markInvitationAccepted(tx, invitation.idInvitacion);

            return { response: "aceptada" };
        });
    }

    private async getValidOrganizationInvitation(invitationId: string, userId: string) {
        const invitation = await prisma.invitacionOrganizacion.findUnique({
            where: { idInvitacion: invitationId }
        });

        if (!invitation) {
            throw new Error("Invitación no encontrada");
        }

        if (invitation.respondidaEn) {
            throw new Error("La invitación ya ha sido respondida");
        }

        if (new Date() > invitation.expiraEn) {
            throw new Error("La invitación ha expirado");
        }

        const user = await prisma.usuario.findUnique({
            where: { idUsuario: userId }
        });

        if (invitation.correo !== user?.correo) {
            throw new Error("No tienes permiso para responder esta invitación");
        }

        return invitation;
    }

    private async rejectOrganizationInvitation(invitationId: string) {
        await prisma.invitacionOrganizacion.update({
            where: { idInvitacion: invitationId },
            data: {
                estado: "rechazada",
                respondidaEn: new Date()
            }
        });

        return { response: "rechazada" };
    }

    private async acceptOrganizationInvitation(invitation: any, userId: string) {
        return prisma.$transaction(async (tx) => {

            await tx.organizacionUsuario.create({
                data: {
                    idOrganizacion: invitation.idOrganizacion,
                    idUsuario: userId,
                    rol: RolOrganizacion.ORG_ADMIN
                }
            });

            await tx.invitacionOrganizacion.update({
                where: { idInvitacion: invitation.idInvitacion },
                data: {
                    estado: "aceptada",
                    respondidaEn: new Date()
                }
            });

            return { response: "aceptada" };
        });
    }

    //-----------------------------------------------------------------------------------


    async getInvitations(userid: string) {
        const result = await prisma.$transaction(async (prisma) => {
            const user = await prisma.usuario.findFirst({
                where: {
                    idUsuario: userid
                }
            })

            const [organizationInvitations, establishmentInvitations] = await Promise.all([
                prisma.invitacionOrganizacion.findMany({
                    where: {
                        correo: user?.correo || "",
                        respondidaEn: null,
                    },
                    select: {
                        idInvitacion: true,
                        correo: true,
                        rol: true,
                        invitador: {
                            select: {
                                nombre: true
                            }
                        },
                        estado: true,
                        expiraEn: true,
                        organizacion: {
                            select: {
                                nombre: true,
                                idOrganizacion: true
                            }
                        }
                    }

                }),
                prisma.invitacionEstablecimiento.findMany({
                    where: {
                        correo: user?.correo || "",
                        respondidaEn: null
                    },
                    select: {
                        idInvitacion: true,
                        correo: true,
                        rol: true,
                        invitador: {
                            select: {
                                nombre: true
                            }
                        },
                        estado: true,
                        expiraEn: true,
                        establecimiento: {
                            select: {
                                nombre: true,
                                idEstablecimiento: true,
                                organizacion: {
                                    select: {
                                        idOrganizacion: true,
                                        nombre: true

                                    }
                                }
                            }
                        }
                    }
                })
            ])


            return {
                organizationInvitations,
                establishmentInvitations
            }
        })

        const data = {
            invitaciones_organizacion: result.organizationInvitations.map(invitation => ({
                id: invitation.idInvitacion,
                correo: invitation.correo,
                invitador: invitation.invitador.nombre,
                estado: invitation.estado,
                rol: {
                    rol: invitation.rol,
                    nombre: getRoleLabel(invitation.rol, "organizacion")
                },
                expiraEn: formatDate(invitation.expiraEn),
                organizacion: {
                    id: invitation.organizacion.idOrganizacion,
                    nombre: invitation.organizacion.nombre
                }
            })),
            invitaciones_establecimiento: result.establishmentInvitations.map(invitation => ({
                id: invitation.idInvitacion,
                correo: invitation.correo,
                invitador: invitation.invitador.nombre,
                estado: invitation.estado,
                rol: {
                    rol: invitation.rol,
                    nombre: getRoleLabel(invitation.rol, "establecimiento")
                },
                expiraEn: formatDate(invitation.expiraEn),
                establecimiento: {
                    id: invitation.establecimiento.idEstablecimiento,
                    nombre: invitation.establecimiento.nombre
                },
                organizacion: {
                    id: invitation.establecimiento.organizacion.idOrganizacion,
                    nombre: invitation.establecimiento.organizacion.nombre
                }
            }))

        };

        return data;
    }

    async respondOrganizationInvitation(
        invitationId: RespondOrganizationInvitationInput["idInvitacion"],
        accion: RespondOrganizationInvitationInput["accion"],
        userId: string,
        rol: RespondOrganizationInvitationInput["rol"]
    ) {

        const invitation = await this.getValidOrganizationInvitation(invitationId, userId);

        if (accion === "rechazada") {
            return this.rejectOrganizationInvitation(invitationId);
        }

        return this.acceptOrganizationInvitation(invitation, userId);
    }


    async respondEstablishmentInvitation(
        invitationId: RespondEstablishmentInvitationInput["idInvitacion"],
        accion: RespondEstablishmentInvitationInput["accion"],
        userId: string,
        rol: RespondEstablishmentInvitationInput["rol"]
    ) {
        const invitation = await this.getValidInvitation(invitationId, userId);

        if (accion === "rechazada") {
            return this.rejectInvitation(invitationId);
        }

        return this.acceptInvitation(invitation, userId, rol);
    }
}
export default new ProfileService();


