import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import { AppError } from "../utils/AppError";
import productService from "../services/productService";

export const listarProductos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const orgContext = req.orgId

        if (!userId) {
            throw new AppError("Usuario no autenticado", 401);
        }

        if (!orgContext) {
            throw new AppError("Acceso a organización no válido", 400);
        }

        const products = await productService.getAllProducts(orgContext);

        return res.status(200).json(ApiResponse.success(products, "Productos obtenidos correctamente"));
    } catch (error) {
        next(error);
    }
};