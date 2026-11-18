import { Request, Response, NextFunction } from "express";
import ServicioCostos from "../services/costService";
import { ApiResponse } from "../utils/ApiResponse";
import { AppError } from "../utils/AppError";
import { crearCostoSchema, actualizarCostoSchema, idParamSchema, loteParamSchema } from "../schemas/costShema";


// export const crearCosto = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const parsed = crearCostoSchema.safeParse(req.body);

//         if (!parsed.success) {
//             const errores = parsed.error.issues.map(e => e.message);
//             throw new AppError(errores.join(", "), 400);
//         }

//         const user = (req as any).user;
//         if (!user) throw new AppError("Usuario no autenticado", 401);

//         const nuevoCosto = await servicioCostos.crear(user.id, parsed.data);

//         res.status(201).json(
//             ApiResponse.success(nuevoCosto, "Costo registrado correctamente", 201)
//         );
//     } catch (error) {
//         next(error);
//     }
// };

// export const obtenerCostoPorId = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const parsedParams = idParamSchema.safeParse(req.params);

//         if (!parsedParams.success) {
//             const errores = parsedParams.error.issues.map(e => e.message);
//             throw new AppError(errores.join(", "), 400);
//         }

//         const user = (req as any).user;
//         if (!user) throw new AppError("Usuario no autenticado", 401);

//         const costo = await servicioCostos.obtenerPorId(parsedParams.data.id, user.id);

//         if (!costo) {
//             throw new AppError("Costo no encontrado", 404);
//         }

//         res.json(ApiResponse.success(costo));
//     } catch (error) {
//         next(error);
//     }
// };

// export const obtenerCostosPorLote = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const parsedParams = loteParamSchema.safeParse(req.params);

//         if (!parsedParams.success) {
//             const errores = parsedParams.error.issues.map(e => e.message);
//             throw new AppError(errores.join(", "), 400);
//         }

//         const user = (req as any).user;
//         if (!user) throw new AppError("Usuario no autenticado", 401);

//         const costos = await servicioCostos.obtenerPorLote(parsedParams.data.loteId, user.id);

//         res.json(ApiResponse.success(costos));
//     } catch (error) {
//         next(error);
//     }
// };

export const crearCosto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = crearCostoSchema.safeParse(req.body);

        if (!parsed.success) {
            const errores = parsed.error.issues.map(e => e.message);
            throw new AppError(errores.join(", "), 400);
        }

        const idEstablecimiento = req.estAccess?.idEstablecimiento;

        if (!idEstablecimiento) {
            throw new AppError("No se pudo determinar el establecimiento", 400);
        }

        const nuevoCosto = await ServicioCostos.crearCostoDirecto(idEstablecimiento, parsed.data);

        return res.status(201).json(
            ApiResponse.success(nuevoCosto, "Costo registrado correctamente", 201)
        );
    } catch (error) {
        next(error);
    }
};

//Funcion para Obtener costos por lotes
export const obtenerCostosPorLote = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const parsedParams = loteParamSchema.safeParse(req.params);

        if (!parsedParams.success) {

            const errores = parsedParams.error.issues.map(
                    e => e.message
                );

            throw new AppError(
                errores.join(", "),
                400
            );
        }

        const idEstablecimiento = req.estAccess?.idEstablecimiento;

        if (!idEstablecimiento) {
            throw new AppError(
                "No se pudo determinar el establecimiento",
                400
            );
        }

        const costos =
            await ServicioCostos.obtenerCostosPorLote(
                parsedParams.data.loteId,
                idEstablecimiento
            );

        return res.status(200).json(
            ApiResponse.success(costos)
        );

    } catch (error) {
        next(error);
    }
};
export const actualizarCosto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            const errores = parsedParams.error.issues.map(e => e.message);
            throw new AppError(errores.join(", "), 400);
        }

        const parsedBody = actualizarCostoSchema.safeParse(req.body);
        if (!parsedBody.success) {
            const errores = parsedBody.error.issues.map(e => e.message);
            throw new AppError(errores.join(", "), 400);
        }

        const costoActualizado = await ServicioCostos.actualizarCostoDirecto(
            parsedParams.data.id,
            parsedBody.data
        );

        return res.status(200).json(
            ApiResponse.success(costoActualizado, "Costo actualizado correctamente")
        );
    } catch (error) {
        next(error);
    }
};

export const eliminarCosto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedParams = idParamSchema.safeParse(req.params);

        if (!parsedParams.success) {
            const errores = parsedParams.error.issues.map(e => e.message);
            throw new AppError(errores.join(", "), 400);
        }

        await ServicioCostos.eliminarCostoDirecto(parsedParams.data.id);

        return res.status(200).json(
            ApiResponse.success(null, "Costo eliminado correctamente")
        );
    } catch (error) {
        next(error);
    }
};

//Funcion para obtener costo por id
export const obtenerCostoPorId = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const parsedParams = idParamSchema.safeParse(req.params);

        if (!parsedParams.success) {
            const errores = parsedParams.error.issues.map(e => e.message);

            throw new AppError(
                errores.join(", "),
                400
            );
        }

        const idEstablecimiento = req.estAccess?.idEstablecimiento;

        if (!idEstablecimiento) {
            throw new AppError(
                "No se pudo determinar el establecimiento",
                400
            );
        }

        const costo =
            await ServicioCostos.obtenerCostoDirectoPorId(
                parsedParams.data.id,
                idEstablecimiento
            );

        return res.status(200).json(
            ApiResponse.success(costo)
        );

    } catch (error) {
        next(error);
    }
};
