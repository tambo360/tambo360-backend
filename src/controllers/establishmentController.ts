import { Request, Response, NextFunction } from "express";
import establishmentsService from "../services/establishmentsService";
import { createEstablishmentSchema, questionnaireSchema, updateEstablishmentNameSchema } from "../schemas/establishmentSchema";
import { ApiResponse } from "../utils/ApiResponse";
import { AppError } from "../utils/AppError";
import { RolEstablecimiento, RolOrganizacion } from "@prisma/client";

export const registrarEstablecimiento = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const orgAccess = req.orgAccess;

        if (!orgAccess) {
            throw new AppError("Acceso a organización no válido", 400);
        }

        if (orgAccess.rol !== RolOrganizacion.duenio && orgAccess.rol !== RolOrganizacion.cooperativa) {
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

        if (estAcess.rol !== RolEstablecimiento.duenio && estAcess.rol !== RolEstablecimiento.administrador) {
            throw new AppError("Permisos insuficientes para registrar el cuestionario", 403);
        }

        const parsed = questionnaireSchema.safeParse(req.body);

        if (!parsed.success) {
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

        if (estAcess.rol !== RolEstablecimiento.duenio && estAcess.rol !== RolEstablecimiento.administrador) {
            throw new AppError("Permisos insuficientes para obtener el cuestionario", 403);
        }

        const { cuestionario, razas, establecimiento } = await establishmentsService.getCuestionario(estAcess.idEstablecimiento);

        if(!cuestionario){
            throw new AppError("Cuestionario no encontrado para este establecimiento", 404);
        }

        const data = {
            idEstablecimiento: cuestionario.idEstablecimiento,
            cantidad_vacas: cuestionario.cantVacas,
            razas: razas.map(er => er.raza.nombre),
            ordeñe_por_dia: cuestionario.cantOrdenies,
            tipo_ordeñe: cuestionario.tipoOrdenie,
            litros_por_dia: cuestionario.promLitros,
            venta_leche: cuestionario.ventaLeche,
            empleados: cuestionario.empleados,
            cantidad_empleados: cuestionario.cantEmpleados,
            modificado_en: cuestionario.modificadoEn,
            localidad: establecimiento?.localidad,
            provincia: establecimiento?.provincia,
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