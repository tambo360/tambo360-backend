import { Request, Response, NextFunction } from "express";
import { AppError, zodError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { transferenciaRodeoSchema, altaAnimalSchema, bajaAnimalSchema, actualizarEstSchema, listarAnimalesFiltrosSchema, actualizarAnimalSchema, listaMovimientosSchema } from "../schemas/settingSchema";
import settingService from "../services/settingService";


class SettingController {
    async transferirRodeo(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const idEstablecimiento = req.estAccess?.idEstablecimiento;
            const body = transferenciaRodeoSchema.safeParse(req.body);

            if (!body.success) {
                throw zodError(body.error);
            }

            if (!userId) {
                throw new AppError("Usuario no autenticado", 401);
            }

            if (!idEstablecimiento) {
                throw new AppError("Establecimiento no autorizado", 403);
            }

            const result = await settingService.transferirRodeo(userId, idEstablecimiento, body.data);

            return res.status(200).json(ApiResponse.success(result, "Transferencia de rodeo realizada correctamente"));
        } catch (error) {
            next(error);
        }
    }

    async crearAnimal(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const idEstablecimiento = req.estAccess?.idEstablecimiento;
            const body = altaAnimalSchema.safeParse(req.body);

            if (!body.success) {
                throw zodError(body.error);
            }

            if (!userId) {
                throw new AppError("Usuario no autenticado", 401);
            }

            if (!idEstablecimiento) {
                throw new AppError("Establecimiento no autorizado", 403);
            }

            const result = await settingService.crearAnimal(userId, idEstablecimiento, body.data);

            return res.status(200).json(ApiResponse.success(result, "Alta de animales realizada correctamente"));
        } catch (error) {
            next(error);
        }
    }

    async eliminarAnimal(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const idEstablecimiento = req.estAccess?.idEstablecimiento;

            const body = bajaAnimalSchema.safeParse(req.body);

            if (!body.success) {
                throw zodError(body.error);
            }

            if (!userId) {
                throw new AppError("Usuario no autenticado", 401);
            }

            if (!idEstablecimiento) {
                throw new AppError("Establecimiento no autorizado", 403);
            }

            const result = await settingService.eliminarAnimal(userId, idEstablecimiento, body.data);

            return res.status(200).json(ApiResponse.success(result, "Baja de animales realizada correctamente"));

        } catch (error) {
            next(error);
        }
    }

    async actualizarEstablecimiento(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const idEstablecimiento = req.estAccess?.idEstablecimiento;
            const body = actualizarEstSchema.safeParse(req.body);

            if (!body.success) {
                throw zodError(body.error);
            }

            if (!userId) {
                throw new AppError("Usuario no autenticado", 401);
            }

            if (!idEstablecimiento) {
                throw new AppError("Establecimiento no autorizado", 403);
            }

            const result = await settingService.actualizarEst(userId, idEstablecimiento, body.data);

            return res.status(200).json(ApiResponse.success(result, "Información del establecimiento actualizada correctamente"));

        } catch (error) {
            next(error)
        }
    }

    async listarAnimales(req: Request, res: Response, next: NextFunction) {
        try {
            const idEstablecimiento = req.estAccess?.idEstablecimiento;
            const parsed = listarAnimalesFiltrosSchema.safeParse(req.query);

            if (!parsed.success) {
                throw zodError(parsed.error);
            }

            if (!idEstablecimiento) {
                throw new AppError("No se pudo determinar el establecimiento", 400);
            }


            const animales = await settingService.listarAnimales(idEstablecimiento, parsed.data);

            return res.status(200).json(ApiResponse.success(animales, "Animales obtenidos correctamente"));
        } catch (error) {
            next(error);
        }
    };

    async actualizarAnimal(req: Request, res: Response, next: NextFunction) {
        try {
            const idEstablecimiento = req.estAccess?.idEstablecimiento;
            const parsed = actualizarAnimalSchema.safeParse(req.query);

            if (!parsed.success) {
                throw zodError(parsed.error);
            }

            if (!idEstablecimiento) {
                throw new AppError("No se pudo determinar el establecimiento", 400);
            }

            const animal = await settingService.actualizarAnimal(idEstablecimiento, parsed.data);

            return res.status(200).json(ApiResponse.success(animal, "Animal actualizado correctamente"));

        } catch (error) {
            next(error)
        }
    }

    async obtenerMovimientos(req: Request, res: Response, next: NextFunction) {
        try {
            const idEstablecimiento = req.estAccess?.idEstablecimiento;
            
            if (!idEstablecimiento) {
                throw new AppError("No se pudo determinar el establecimiento", 400);
            }

            const parsed = listaMovimientosSchema.safeParse(idEstablecimiento);

            if (!parsed.success) {
                throw zodError(parsed.error);
            }

            const animal = await settingService.obtenerMovimientos(idEstablecimiento);

            return res.status(200).json(ApiResponse.success(animal, "Animal actualizado correctamente"));
        } catch (error) {
            next(error)
        }
    }
}

export default new SettingController();