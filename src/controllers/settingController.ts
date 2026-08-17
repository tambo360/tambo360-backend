import { Request, Response, NextFunction } from "express";
import { AppError, zodError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { transferenciaRodeoSchema, altaAnimalSchema } from "../schemas/settingSchema";
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

            return res.status(200).json(ApiResponse.success(result, "Alta de animal realizada correctamente"));
        } catch (error) {
            next(error);
        }
    }
}

export default new SettingController();