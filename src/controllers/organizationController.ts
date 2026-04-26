import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import OrganizationService from "../services/organizationService";
import { createOrganizationSchema } from "../schemas/organizationSchema";

export class OrganizationController {
    static async createOrganization(req: Request, res: Response, next: NextFunction) {
        try {
            const { nombre, rol } = req.body;
            const userId = req.user?.id;
            const result = createOrganizationSchema.safeParse({ nombre, rol, userId });

            if (!result.success) {
                throw new AppError("Datos inválidos", 400);
            }

            const organization = await OrganizationService.createOrganization(result.data);

            return res.status(200).json(ApiResponse.success(organization, "Organización creada correctamente"));
        } catch (error) {
            next(error);
        }
    }

    static async getOrganizations(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError("Usuario no autenticado", 401);
            }

            const organizations = await OrganizationService.getOrganizations(userId);

            return res.status(200).json(ApiResponse.success(organizations, "Organizaciones obtenidas correctamente"));
        } catch (error) {
            next(error);
        }
    }

    static async getOrganizationById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError("Usuario no autenticado", 401);
            }
            const organization = await OrganizationService.getOrganizationById(id, userId);

            if (!organization) {
                throw new AppError("Organización no encontrada", 404);
            }
            return res.status(200).json(ApiResponse.success(organization, "Organización obtenida correctamente"));
        } catch (error) {
            next(error);
        }
    }

}
