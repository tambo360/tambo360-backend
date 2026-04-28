import { prisma } from "../lib/prisma";



class ProfileService {
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
                        correo: user?.correo || ""
                    },
                    select: {
                        idInvitacion: true,
                        correo: true,
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
                        correo: user?.correo || ""
                    },
                    select: {
                        idInvitacion: true,
                        correo: true,
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
                expiraEn: invitation.expiraEn,
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
                expiraEn: invitation.expiraEn,
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


}

export default new ProfileService();
