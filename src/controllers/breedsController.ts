import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import breedsService from "../services/breedsService";


export class BreedController {
    static async getAllBreeds(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const orgContext = req.orgId

            if (!userId) {
                throw new AppError("Usuario no autenticado", 401);
            }

            if (!orgContext) {
                throw new AppError("Acceso a organización no válido", 400);
            }

            const breeds = await breedsService.getAllBreeds(orgContext);

            return res.status(200).json(ApiResponse.success(breeds, "Razas obtenidas correctamente"));
        } catch (error) {
            next(error);
        }
    }


}
