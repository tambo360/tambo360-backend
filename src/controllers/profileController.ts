import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import profileService from "../services/profileService";
import { actualizarPerfilSchema, respondEstablishmentInvitationSchema, respondOrganizationInvitationSchema } from "../schemas/profileSchema";
import { RolOrganizacion } from "@prisma/client";

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


    static async respondOrganizationInvitation(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const { idInvitacion, accion } = req.body;

            if (!userId) {
                throw new AppError("Usuario no autenticado", 401);
            }

            const result = respondOrganizationInvitationSchema.safeParse({ idInvitacion, accion, rol: RolOrganizacion.ORG_ADMIN });

            if (!result.success) {
                throw new AppError("Datos inválidos", 400);
            }

            const response = await profileService.respondOrganizationInvitation(result.data.idInvitacion, result.data.accion, userId, result.data.rol);

            return res.status(200).json(ApiResponse.success(response, "Invitaciones respondidas correctamente"));
        } catch (error) {
            next(error);
        }
    }

    static async respondEstablishmentInvitation(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const { idInvitacion, accion, rol } = req.body;

            if (!userId) {
                throw new AppError("Usuario no autenticado", 401);
            }

            const result = respondEstablishmentInvitationSchema.safeParse({ idInvitacion, accion, rol });

            if (!result.success) {
                throw new AppError("Datos inválidos", 400);
            }

            const response = await profileService.respondEstablishmentInvitation(result.data.idInvitacion, result.data.accion, userId, result.data.rol);

            return res.status(200).json(ApiResponse.success(response, "Invitaciones respondidas correctamente"));
        } catch (error) {
            next(error);
        }
    }

    static async actualizarPerfil(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Usuario no autenticado", 401);
            }

            const result = actualizarPerfilSchema.safeParse(req.body);

            if (!result.success) {
                throw new AppError(result.error.issues[0].message, 400);
            }

            const usuario = await profileService.actualizarPerfil(userId, result.data);

            const mensaje = usuario.verificado
                ? "Perfil actualizado correctamente"
                : "Perfil actualizado. Revisá tu correo nuevo para verificarlo";

            return res.status(200).json(ApiResponse.success(usuario, mensaje));
        } catch (error) {
            next(error);
        }
    }

}
