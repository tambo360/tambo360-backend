import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { CreateEstablishmentData, QuestionnaireData } from "../schemas/establishmentSchema";
import { RolEstablecimiento } from "@prisma/client";

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
        const existente = await prisma.establecimiento.findFirst({
            where: {
                idEstablecimiento: data.idEstablecimiento,
            },
        });

        if (!existente) {
            throw new AppError("Establecimiento no encontrado", 404);
        }

        const result = await prisma.$transaction(async (prisma) => {
            const establecimiento = await prisma.establecimiento.update({
                where: {
                    idEstablecimiento: data.idEstablecimiento,
                },
                data: {
                    localidad: data.ubicacion.localidad,
                    provincia: data.ubicacion.provincia,
                },
                select: {
                    configuracions: {
                        select: {
                            idConfiguracion: true,
                        }
                    }
                }
            });

            await prisma.configuracion.update({
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
            })

            await prisma.establecimientoRaza.deleteMany({
                where: {
                    idEstablecimiento: data.idEstablecimiento,
                }
            });

            const razasData = data.Razas.map(raza => ({
                idEstablecimiento: data.idEstablecimiento,
                idRaza: raza.idRaza,
            }));

            await prisma.establecimientoRaza.createMany({
                data: razasData
            });

            return { status: "success" };
        })


        return result;
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
}

export default new EstablishmentsService();