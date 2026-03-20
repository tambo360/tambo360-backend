import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { isValidEnum } from "../utils/enumValidation";
import { MetricaObj } from "../types";
import { DashboardService } from "../services/dashboardService";

export const listarPorMes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        console.log(user)

        if (!user) throw new AppError("Usuario no autenticado", 401);

        const respuesta = await DashboardService.listarPorMes(user.id)

        return res.status(200).json(ApiResponse.success(respuesta, "Resumen del mes actual"));
    } catch (error) {
        next(error);
    }
}

export const loteGrafico = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const productoRaw = req.query.producto as string;
        const metricaRaw = req.query.metrica as "cantidad" | "mermas" | "costos";
        const isvalid = Object.values(MetricaObj).includes(metricaRaw);

        if (!user) throw new AppError("Usuario no autenticado", 401);

        if (!productoRaw || !metricaRaw) {
            throw new AppError("La métrica y el producto son obligatorios", 400);
        }

        if (!isValidEnum(productoRaw) || !isvalid) {
            throw new AppError("Producto o métrica no válidos", 400);
        }

        const respuesta = await DashboardService.graficoProduccion(user.id, productoRaw, metricaRaw)

        return res.status(200).json(ApiResponse.success(respuesta, "Resumen de los ultimo 6 meses"))


    } catch (error) {
        next(error)
    }
}