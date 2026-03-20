import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import { AppError } from "../utils/AppError";

export const listarProductos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productos = await prisma.producto.findMany({
            select: {
                idProducto: true,
                nombre: true,
                categoria: true,
            },
        });

        if (productos.length === 0) {
            throw new AppError("No hay productos registrados", 404);
        }

        return res.status(200).json(
            ApiResponse.success(productos, "Productos listados correctamente")
        );
    } catch (error) {
        next(error);
    }
};