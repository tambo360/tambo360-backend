import { Request, Response, NextFunction } from "express";
import { LoteService } from "../services/batchService";
import { crearLoteSchema, editarLoteSchema, idLoteParamSchema, listarLotesSchema } from "../schemas/batchSchema";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";



export const crearLote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = crearLoteSchema.safeParse(req.body);

        if (!parsed.success) {
            const errores: Record<string, string> = {};
            parsed.error.issues.forEach(e => {
                const campo = e.path.join(".");
                errores[campo] = e.message;
            });

            return res.status(400).json({
                statusCode: 400,
                errors: errores,
                success: false,
                data: null,
            });
        }

        const user = (req as any).user;
        if (!user) throw new AppError("Usuario no autenticado", 401);

        if(!req.estAccess) {
            throw new AppError("Acceso a establecimiento no válido", 400);
        }

        const lote = await LoteService.crearLote(parsed.data, req.estAccess.idEstablecimiento);

        return res.status(201).json(ApiResponse.success(lote, "Lote creado correctamente", 201));
    } catch (error) {
        next(error);
    }
};

//nuevo listarLotes issue #29
export const listarLotes = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // Validación de query params utilizando Zod
        const parsed = listarLotesSchema.safeParse(req.query);

        if (!parsed.success) {
            const errores = parsed.error.issues.map((e) => e.message);

            throw new AppError(errores.join(", "), 400);
        }

        // El middleware establecimientoRequireOrgAccess
        // ya validó que el usuario tenga acceso al establecimiento.
        const idEstablecimiento = req.estAccess?.idEstablecimiento;

        if (!idEstablecimiento) {
            throw new AppError(
                "No se pudo determinar el establecimiento",
                400
            );
        }

        // Filtros validados y transformados por Zod
        const filtros = parsed.data;

        // Consulta paginada de lotes
        const lotes = await LoteService.listarLotes(
            idEstablecimiento,
            filtros
        );

        return res.status(200).json(
            ApiResponse.success(
                lotes,
                "Lotes listados correctamente"
            )
        );

    } catch (error) {
        next(error);
    }
};

export const eliminarLote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = idLoteParamSchema.safeParse(req.params);
        const idEstablecimiento = req.estAccess?.idEstablecimiento;

        if (!idEstablecimiento) {
            throw new AppError("No se pudo determinar el establecimiento", 400);
        }

        const user = (req as any).user;
        if (!user) throw new AppError("Usuario no autenticado", 401);

        if (!params.success) {
            throw new AppError("Parámetros inválidos", 400);
        }

        await LoteService.eliminarLote(params.data.idLote, idEstablecimiento);

        return res.status(200).json(
            ApiResponse.success(null, "Lote eliminado correctamente")
        );
    } catch (error) {
        next(error);
    }
};

export const obtenerLote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idEstablecimiento = req.estAccess?.idEstablecimiento;

        if (!idEstablecimiento) {
            throw new AppError("No se pudo determinar el establecimiento", 400);
        }

        const parsedParams = idLoteParamSchema.safeParse(req.params);

        if (!parsedParams.success) {
            throw new AppError("Parámetros inválidos", 400);
        }

        const lote = await LoteService.obtenerLote(parsedParams.data.idLote, idEstablecimiento);

        return res.status(200).json(
            ApiResponse.success(lote, "Lote obtenido correctamente")
        );

    } catch (error) {
        next(error);
    }
};

export const editarLote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = idLoteParamSchema.safeParse(req.params);
        const body = editarLoteSchema.safeParse(req.body);
        const idEstablecimiento = req.estAccess?.idEstablecimiento;

        if (!idEstablecimiento) {
            throw new AppError("No se pudo determinar el establecimiento", 400);
        }

        if (!params.success) {
            throw new AppError("Parámetros inválidos", 400);
        }

        if (!body.success) {
            throw new AppError("Datos del cuerpo inválidos", 400);
        }

        const lote = await LoteService.editarLote(params.data.idLote, body.data, idEstablecimiento);

        return res.status(200).json(
            ApiResponse.success(lote, "Lote actualizado correctamente")
        );
    } catch (error) {
        next(error);
    }
};

//antes de aplicar la issue #29 estaba este listarLotes
// export const listarLotes = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const user = (req as any).user;
//         if (!user) throw new AppError("Usuario no autenticado", 401);

//         const parsed = listarLotesSchema.safeParse(req.query);
//         if (!parsed.success) {
//             const errores = parsed.error.issues.map((e) => e.message);
//             throw new AppError(errores.join(", "), 400);
//         }

//         const filtros = parsed.data;

//         const lotes = await LoteService.listarLotes(user.id, filtros);

//         return res.status(200).json(ApiResponse.success(lotes, "Lotes listados correctamente"));

//     } catch (error) {
//         next(error);
//     }
// };


// export const produccionDelDia = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const user = (req as any).user;
//         if (!user) throw new AppError("Usuario no autenticado", 401);

//         const lotes = await LoteService.listarProduccionDelDia(user.id);

//         return res.status(200).json(ApiResponse.success(lotes, "Producción del día"));
//     } catch (error) { next(error); }
// };


export const completarLote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedParams = idLoteParamSchema.safeParse(req.params);

        if (!parsedParams.success) {
            const errores = parsedParams.error.issues.map(e => e.message);
            throw new AppError(errores.join(", "), 400);
        }

        const user = (req as any).user;
        if (!user) throw new AppError("Usuario no autenticado", 401);

        const loteActualizado = await LoteService.completarLote(parsedParams.data.idLote);

        return res.status(200).json(
            ApiResponse.success(loteActualizado, "Lote completado correctamente")
        );
    } catch (error) {
        next(error);
    }
};


