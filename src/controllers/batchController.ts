import { Request, Response, NextFunction } from "express";
import { LoteService } from "../services/batchService";
import { crearLoteSchema, editarLoteSchema, idLoteParamSchema, listarLotesSchema } from "../schemas/batchSchema";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";


export const crearLote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = crearLoteSchema.safeParse(req.body);

        if (!parsed.success) {
            const errores = parsed.error.issues.map(e => e.message);
            throw new AppError(errores.join(", "), 400);
        }

        const user = (req as any).user;
        if (!user) throw new AppError("Usuario no autenticado", 401);

        const lote = await LoteService.crearLote(user.id, parsed.data);

        return res.status(201).json(ApiResponse.success(lote, "Lote creado correctamente", 201));
    } catch (error) {
        next(error);
    }
};

export const editarLote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = idLoteParamSchema.parse(req.params);
        const body = editarLoteSchema.parse(req.body);

        const user = (req as any).user;
        if (!user) throw new AppError("Usuario no autenticado", 401);

        const lote = await LoteService.editarLote(params.idLote, body, user.id);

        return res.status(200).json(
            ApiResponse.success(lote, "Lote actualizado correctamente")
        );
    } catch (error) {
        next(error);
    }
};

export const eliminarLote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = idLoteParamSchema.parse(req.params);

        const user = (req as any).user;
        if (!user) throw new AppError("Usuario no autenticado", 401);

        await LoteService.eliminarLote(params.idLote, user.id);

        return res.status(200).json(
            ApiResponse.success(null, "Lote eliminado correctamente")
        );
    } catch (error) {
        next(error);
    }
};

export const listarLotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        if (!user) throw new AppError("Usuario no autenticado", 401);

        const parsed = listarLotesSchema.safeParse(req.query);
        if (!parsed.success) {
            const errores = parsed.error.issues.map((e) => e.message);
            throw new AppError(errores.join(", "), 400);
        }

        const filtros = parsed.data;

        const lotes = await LoteService.listarLotes(user.id, filtros);

        return res.status(200).json(ApiResponse.success(lotes, "Lotes listados correctamente"));

    } catch (error) {
        next(error);
    }
};

export const obtenerLote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        if (!user) throw new AppError("Usuario no autenticado", 401);

        const parsedParams = idLoteParamSchema.safeParse(req.params);

        if (!parsedParams.success) {
            const errores = parsedParams.error.issues.map(e => e.message);
            throw new AppError(errores.join(", "), 400);
        }

        const { idLote } = req.params;

        const lote = await LoteService.obtenerLote(idLote, user.id);

        return res.status(200).json(
            ApiResponse.success(lote, "Lote obtenido correctamente")
        );

    } catch (error) {
        next(error);
    }
};

export const produccionDelDia = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        if (!user) throw new AppError("Usuario no autenticado", 401);

        const lotes = await LoteService.listarProduccionDelDia(user.id);

        return res.status(200).json(ApiResponse.success(lotes, "Producción del día"));
    } catch (error) { next(error); }
};

export const completarLote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedParams = idLoteParamSchema.safeParse(req.params);

        if (!parsedParams.success) {
            const errores = parsedParams.error.issues.map(e => e.message);
            throw new AppError(errores.join(", "), 400);
        }

        const user = (req as any).user;
        if (!user) throw new AppError("Usuario no autenticado", 401);

        const loteActualizado = await LoteService.completarLote(parsedParams.data.idLote, user.id);

        return res.status(200).json(
            ApiResponse.success(loteActualizado, "Lote completado correctamente")
        );
    } catch (error) {
        next(error);
    }
};