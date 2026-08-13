import { Request, Response, NextFunction } from "express";
import establishmentsService from "../services/establishmentsService";
import { createEstablishmentSchema, deleteInvitationSchema, questionnaireSchema, sendInvitationSchema } from "../schemas/establishmentSchema";
import { ApiResponse } from "../utils/ApiResponse";
import { AppError } from "../utils/AppError";
import { RolEstablecimiento, RolOrganizacion } from "@prisma/client";
import { getRoleLabel } from "../utils/enumValidation";
import { formatDate } from "../utils";

export const registrarEstablecimiento = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const orgAccess = req.orgAccess;

        if (!orgAccess) {
            throw new AppError("Acceso a organización no válido", 400);
        }

        if (orgAccess.rol !== RolOrganizacion.ORG_OWNER && orgAccess.rol !== RolOrganizacion.ORG_ADMIN) {
            throw new AppError("Permisos insuficientes para crear un establecimiento", 403);
        }

        const parsed = createEstablishmentSchema.safeParse(req.body);

        if (!parsed.success) {
            throw new AppError("Todos los campos son obligatorios y deben ser válidos", 400);
        }

        const nuevoEstablecimiento = await establishmentsService.create({ ...parsed.data, userId: orgAccess.idUsuario, idOrg: orgAccess.idOrganizacion, idOrganizacionUsuario: orgAccess.idOrganizacionUsuario });

        const response = ApiResponse.success(
            nuevoEstablecimiento,
            "Establecimiento creado correctamente",
            201
        );

        res.status(response.statusCode).json(response);

    } catch (error) {
        console.error("Error en registrarEstablecimiento:", error);
        next(error);
    }
};

export const listarEstablecimientos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const orgAccess = req.orgAccess;

        if (!orgAccess) {
            throw new AppError("Acceso a organización no válido", 400);
        }


        const establecimientos = await establishmentsService.listarPorUsuario(orgAccess.idOrganizacionUsuario);

        const response = ApiResponse.success(
            establecimientos,
            "Establecimientos obtenidos correctamente",
            200
        );

        res.status(response.statusCode).json(response);
    } catch (error) {
        next(error);
    }
};


export const getEstablishmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { idEst } = req.params;
        const orgAccess = req.orgAccess;

        if (!orgAccess) {
            throw new AppError("Acceso a organización no válido", 400);
        }

        const establishment = await establishmentsService.getEstablishmentById(idEst, orgAccess.idOrganizacionUsuario);

        if (!establishment) {
            throw new AppError("Establecimiento no encontrado", 404);
        }
        return res.status(200).json(ApiResponse.success(establishment, "Establecimiento obtenido correctamente"));

    } catch (error) {
        next(error);
    }
}

export const registrarCuestionario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgAccess = req.orgAccess;
        const estAcess = req.estAccess;

        if (!orgAccess) {
            throw new AppError("Acceso a organización no válido", 400);
        }

        if (!estAcess) {
            throw new AppError("Acceso a establecimiento no válido", 400);
        }

        if (estAcess.rol !== RolEstablecimiento.OWNER && estAcess.rol !== RolEstablecimiento.ADMIN) {
            throw new AppError("Permisos insuficientes para registrar el cuestionario", 403);
        }

        const parsed = questionnaireSchema.safeParse({ ...req.body, idEstablecimiento: estAcess.idEstablecimiento });

        if (!parsed.success) {
            console.error("Error en registrarCuestionario - Validación fallida:", parsed.error);
            throw new AppError("Todos los campos son obligatorios y deben ser válidos", 400);
        }

        const cuestionario = await establishmentsService.guardarCuestionario(parsed.data);

        const response = ApiResponse.success(
            cuestionario,
            "Cuestionario registrado correctamente",
            201
        );

        res.status(response.statusCode).json(response);

    } catch (error) {
        next(error);
    }
}

export const getCuestionario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgAccess = req.orgAccess;
        const estAcess = req.estAccess;

        if (!orgAccess) {
            throw new AppError("Acceso a organización no válido", 400);
        }

        if (!estAcess) {
            throw new AppError("Acceso a establecimiento no válido", 400);
        }

        if (estAcess.rol !== RolEstablecimiento.OWNER && estAcess.rol !== RolEstablecimiento.ADMIN) {
            throw new AppError("Permisos insuficientes para obtener el cuestionario", 403);
        }

        const { cuestionario, rodeos, establecimiento, productos } = await establishmentsService.getCuestionario(estAcess.idEstablecimiento);

        if (!cuestionario) {
            throw new AppError("Cuestionario no encontrado para este establecimiento", 404);
        }

        const data = {
            idEstablecimiento: cuestionario.idEstablecimiento,
            cantidad_vacas: cuestionario.cantVacas,
            productos: productos.map(ep => ({
                nombre: ep.producto.nombre,
                id: ep.producto.idProducto
            })),
            ordeñe_por_dia: cuestionario.cantOrdenies,
            tipo_ordeñe: cuestionario.tipoOrdenie,
            litros_por_dia: cuestionario.promLitros,
            venta_leche: cuestionario.ventaLeche,
            empleados: cuestionario.empleados,
            cantidad_empleados: cuestionario.cantEmpleados,
            modificado_en: cuestionario.modificadoEn,
            localidad: establecimiento?.localidad,
            provincia: establecimiento?.provincia,
            rodeos: rodeos
        }

        const response = ApiResponse.success(
            data,
            "Cuestionario obtenido correctamente",
            201
        );

        res.status(response.statusCode).json(response);

    } catch (error) {
        next(error);
    }
}

export const sendInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { correo, rol } = req.body
        const orgAccess = req.orgAccess;
        const estAcess = req.estAccess;

        const result = sendInvitationSchema.safeParse({ correo, rol });

        if (!result.success) {
            throw new AppError("Datos inválidos", 400);
        }

        if (!orgAccess) {
            throw new AppError("Acceso a organización no válido", 400);
        }

        if (!estAcess) {
            throw new AppError("Acceso a establecimiento no válido", 400);
        }

        if (estAcess.rol !== RolEstablecimiento.OWNER) {
            throw new AppError("Permisos insuficientes para enviar invitación", 403);
        }


        const invitation = await establishmentsService.sendInvitation(orgAccess.idOrganizacion, estAcess.idEstablecimiento, orgAccess.idUsuario, result.data.correo, result.data.rol);


        return res.status(200).json(ApiResponse.success(invitation, "Invitación enviada correctamente"));


    } catch (error) {
        next(error);
    }
}


export const getInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgAccess = req.orgAccess;
        const estAcess = req.estAccess;
        const user = req.user;


        if(!user) {
            throw new AppError("Usuario no autenticado", 401);
        }

        if (!orgAccess) {
            throw new AppError("Acceso a organización no válido", 400);
        }

        if (!estAcess) {
            throw new AppError("Acceso a establecimiento no válido", 400);
        }

        if (estAcess.rol !== RolEstablecimiento.OWNER) {
            throw new AppError("Permisos insuficientes para enviar invitación", 403);
        }


        const invitation = await establishmentsService.getInvitation(orgAccess.idOrganizacion, estAcess.idEstablecimiento,);


        const response = invitation.map(inv => ({
            id: inv.idInvitacion,
            correo: inv.correo,
            codigo: inv.codigo,
            estado: inv.estado,
            expiracion: formatDate(inv.expiraEn),
            rol: getRoleLabel(inv.rol, "establecimiento"),
        }))


        return res.status(200).json(ApiResponse.success(response, "Invitación enviada correctamente"));


    } catch (error) {
        next(error);
    }
}

export const deleteInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { idInvitacion } = req.params;
        const orgAccess = req.orgAccess;
        const estAccess = req.estAccess;

        const result = deleteInvitationSchema.safeParse({ idInvitacion });

        if (!result.success) {
            throw new AppError("Datos inválidos", 400);
        }

        if (!orgAccess) {
            throw new AppError("Acceso a organización no válido", 400);
        }

        if (!estAccess) {
            throw new AppError("Acceso a establecimiento no válido", 400);
        }

        if (estAccess.rol !== RolEstablecimiento.OWNER && estAccess.rol !== RolEstablecimiento.ADMIN) {
            throw new AppError("Permisos insuficientes para eliminar invitación", 403);
        }

        const deletedInvitation = await establishmentsService.deleteInvitation(result.data.idInvitacion, estAccess.idEstablecimiento);

        return res.status(200).json(ApiResponse.success(deletedInvitation, "Invitación eliminada correctamente"));
    } catch (error) {
        next(error);
    }
}

export const listarRodeos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const estAccess = req.estAccess;

        if (!estAccess) {
            throw new AppError("Acceso a establecimiento no válido", 400);
        }

        const rodeos = await establishmentsService.listarRodeos(estAccess.idEstablecimiento);

        return res.status(200).json(ApiResponse.success(rodeos, "Rodeos obtenidos correctamente"));

    }catch(error) {
        next(error);
    }
}

export const obtenerOpcionesSeguimiento = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idEstablecimiento = req.estAccess?.idEstablecimiento;

        if (!idEstablecimiento) {
            throw new AppError("No se pudo determinar el establecimiento", 400);
        }


        const opcionesCreacion = await establishmentsService.obtenerOpcionesSeguimiento(idEstablecimiento);

        return res.status(200).json(
            ApiResponse.success(opcionesCreacion, "Opciones de creación obtenidas correctamente")
        );

    } catch (error) {
        next(error);
    }
};

/*
export const editarNombreEstablecimiento = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        const parsed = updateEstablishmentNameSchema.safeParse(req.body);

        if (!parsed.success) {
            const message = parsed.error.issues[0].message;
            throw new AppError(message, 400);
        }

        const user = (req as any).user;

        if (!user) {
            throw new AppError("Usuario no autenticado", 401);
        }

        const establecimiento = await establishmentsService.actualizarNombre(
            user.id,
            parsed.data.nombre
        );

        const response = ApiResponse.success(
            establecimiento,
            "Nombre del establecimiento actualizado correctamente",
            200
        );

        res.status(response.statusCode).json(response);

    } catch (error) {
        next(error);
    }
};*/