import { prisma } from "../lib/prisma";
import { CreateOrganizationInput } from "../schemas/organizationSchema";

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
                establecimientoOrganiacionUsuarios: {
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
                establecimientoOrganiacionUsuarios: {
                    include: {
                        establecimiento: true
                    }
                }
            }
        });
        return organization;

    }
}

export default new OrganizationService();
