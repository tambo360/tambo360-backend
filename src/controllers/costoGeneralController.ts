import { Request, Response, NextFunction } from "express";
import costoGeneralService from "../services/costoGeneralService";
import { ApiResponse } from "../utils/ApiResponse";
import { AppError } from "../utils/AppError";
import { crearCostoGeneralSchema, actualizarCostoGeneralSchema, resumenEconomicoQuerySchema } from "../schemas/costoGeneralSchema";

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

// Épica: Costos Generales y Resumen Económico (issue #79)
// GET /costos-generales/resumen?fechaDesde=...&fechaHasta=...
// Devuelve los indicadores agregados del período: gasto en
// alimentación, gasto en costos generales, gasto total,
// cantidad de lotes completos y prorrateo promedio por lote.
export const getResumen = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idEstablecimiento = req.estAccess?.idEstablecimiento;
        if (!idEstablecimiento) throw new AppError("No se pudo determinar el establecimiento", 400);

        const parsed = resumenEconomicoQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            throw new AppError(parsed.error.issues.map(e => e.message).join(", "), 400);
        }

        const resumen = await costoGeneralService.resumenEconomico(
            idEstablecimiento,
            parsed.data.fechaDesde,
            parsed.data.fechaHasta
        );

        return res.status(200).json(ApiResponse.success(resumen, "Resumen económico obtenido correctamente"));
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