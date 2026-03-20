import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { CreateEstablishmentData } from "../schemas/establishmentSchema";

type CreateEstablishmentServiceData = CreateEstablishmentData & {
    userId: string;
};

class EstablishmentsService {

    async crear(data: CreateEstablishmentServiceData) {

        const usuario = await prisma.usuario.findUnique({
            where: { idUsuario: data.userId },
        });

        if (!usuario) {
            throw new AppError("Usuario no encontrado", 404);
        }

        const existente = await prisma.establecimiento.findFirst({
            where: { idUsuario: data.userId },
        });

        if (existente) {
            throw new AppError("El usuario ya tiene un establecimiento registrado", 400);
        }

        const establecimiento = await prisma.establecimiento.create({
            data: {
                nombre: data.nombre,
                localidad: data.localidad,
                provincia: data.provincia,
                idUsuario: data.userId,
            },
        });

        return establecimiento;
    }

    async listarPorUsuario(idUsuario: string) {
        const establecimiento = await prisma.establecimiento.findFirst({
            where: { idUsuario },
            select: {
                idEstablecimiento: true,
                nombre: true,
                localidad: true,
                provincia: true,
                idUsuario: true,
            },
        });

        return establecimiento;
    }

    async actualizarNombre(idUsuario: string, nombre: string) {

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
    }
}

export default new EstablishmentsService();