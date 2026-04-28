import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import profileService from "../services/profileService";

export class ProfileController {
    static async getInvitations(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

           if (!userId) {
                throw new AppError("Usuario no autenticado", 401);
            }
            const invitations = await profileService.getInvitations(userId);

            return res.status(200).json(ApiResponse.success(invitations, "Invitaciones obtenidas correctamente"));
        } catch (error) {
            next(error);
        }
    }


}
