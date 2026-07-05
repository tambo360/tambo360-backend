import { Request, Response, NextFunction } from "express";
import costoGeneralService from "../services/costoGeneralService";
import { ApiResponse } from "../utils/ApiResponse";
import { AppError } from "../utils/AppError";
import { crearCostoGeneralSchema, actualizarCostoGeneralSchema } from "../schemas/costoGeneralSchema";

export const crear = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idEstablecimiento = req.estAccess?.idEstablecimiento;
        if (!idEstablecimiento) throw new AppError("No se pudo determinar el establecimiento", 400);

        const parsed = crearCostoGeneralSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new AppError(parsed.error.issues.map(e => e.message).join(", "), 400);
        }

        const costo = await costoGeneralService.crear(idEstablecimiento, parsed.data);
        return res.status(201).json(ApiResponse.success(costo, "Costo general registrado correctamente"));
    } catch (error) {
        next(error);
    }
};

export const listar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idEstablecimiento = req.estAccess?.idEstablecimiento;
        if (!idEstablecimiento) throw new AppError("No se pudo determinar el establecimiento", 400);

        const { fechaDesde, fechaHasta } = req.query;

        const costos = await costoGeneralService.listar(idEstablecimiento, {
            fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
            fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
        });

        return res.status(200).json(ApiResponse.success(costos, "Costos generales obtenidos correctamente"));
    } catch (error) {
        next(error);
    }
};

export const actualizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idEstablecimiento = req.estAccess?.idEstablecimiento;
        if (!idEstablecimiento) throw new AppError("No se pudo determinar el establecimiento", 400);

        const parsed = actualizarCostoGeneralSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new AppError(parsed.error.issues.map(e => e.message).join(", "), 400);
        }

        const costo = await costoGeneralService.actualizar(req.params.id, idEstablecimiento, parsed.data);
        return res.status(200).json(ApiResponse.success(costo, "Costo general actualizado correctamente"));
    } catch (error) {
        next(error);
    }
};

export const eliminar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idEstablecimiento = req.estAccess?.idEstablecimiento;
        if (!idEstablecimiento) throw new AppError("No se pudo determinar el establecimiento", 400);

        await costoGeneralService.eliminar(req.params.id, idEstablecimiento);

        return res.status(200).json(ApiResponse.success(null, "Costo general eliminado correctamente"));
    } catch (error) {
        next(error);
    }
};