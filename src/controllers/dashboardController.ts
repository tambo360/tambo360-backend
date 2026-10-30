import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { isValidEnum } from "../utils/enumValidation";
import { MetricaObj } from "../types";
import { DashboardService } from "../services/dashboardService";
import { PrecioMercadoService } from "../services/precioMercadoService";

export class DashboardController {
    static async costosPorCategoria(req: Request, res: Response, next: NextFunction) {
        try {

            const idEstablecimiento = req.estAccess?.idEstablecimiento;

            if (!idEstablecimiento) {
                throw new AppError("No se pudo determinar el establecimiento", 400);
            }

            const costsByCategory = await DashboardService.costosPorCategoria(idEstablecimiento)

            return res.status(200).json(ApiResponse.success(costsByCategory, "Costos por categoría obtenidos correctamente"))

        } catch (error) {
            next(error);
        }
    }

    // =====================================================
    // GET /dashboard/mes-actual
    // =====================================================
    static async mesActual(req: Request, res: Response, next: NextFunction) {
        try {
            const idEstablecimiento = req.estAccess?.idEstablecimiento;

            if (!idEstablecimiento) {
                throw new AppError("No se pudo determinar el establecimiento", 400);
            }

            const respuesta = await DashboardService.listarPorMes(idEstablecimiento)

            return res.status(200).json(ApiResponse.success(respuesta, "Resumen del mes actual"));
        } catch (error) {
            next(error);
        }
    }

    // =====================================================
    // GET /dashboard/grafico?producto=leches&metrica=cantidad
    // =====================================================
    static async grafico(req: Request, res: Response, next: NextFunction) {
        try {
            const idEstablecimiento = req.estAccess?.idEstablecimiento;
            const productoRaw = req.query.producto as string;
            const metricaRaw = req.query.metrica as "cantidad" | "mermas" | "costos";
            const isvalid = Object.values(MetricaObj).includes(metricaRaw);

            if (!idEstablecimiento) {
                throw new AppError("No se pudo determinar el establecimiento", 400);
            }

            if (!productoRaw || !metricaRaw) {
                throw new AppError("La métrica y el producto son obligatorios", 400);
            }

            if (!isValidEnum(productoRaw) || !isvalid) {
                throw new AppError("Producto o métrica no válidos", 400);
            }

            const respuesta = await DashboardService.graficoProduccion(idEstablecimiento, productoRaw as any, metricaRaw)

            return res.status(200).json(ApiResponse.success(respuesta, "Resumen de los ultimos 6 meses"))

        } catch (error) {
            next(error)
        }
    }


    // =====================================================
    // GET /dashboard/litros-libres
    // =====================================================
    static async litrosLibres(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const idEstablecimiento =
                req.estAccess?.idEstablecimiento;

            if (!idEstablecimiento) {
                throw new AppError(
                    "No se pudo determinar el establecimiento",
                    400
                );
            }

            const respuesta =
                await DashboardService.obtenerLitrosLibres(
                    idEstablecimiento
                );

            return res.status(200).json(
                ApiResponse.success(
                    respuesta,
                    "Litros Libres calculados correctamente"
                )
            );
        } catch (error) {
            next(error);
        }
    }

    
static async graficoCostosGenerales(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const idEstablecimiento = req.estAccess?.idEstablecimiento;

        if (!idEstablecimiento) {
            throw new AppError(
                "No se pudo determinar el establecimiento",
                400
            );
        }

        const periodo = req.query.periodo;

        if (
            periodo !== undefined &&
            typeof periodo !== "string"
        ) {
            throw new AppError(
                "El parámetro periodo debe ser un texto válido",
                400
            );
        }

        const respuesta =
            await DashboardService.obtenerGraficoCostosGenerales(
                idEstablecimiento,
                periodo ?? "6meses"
            );

        return res.status(200).json(
            ApiResponse.success(
                respuesta,
                "Gráfico de costos generales obtenido correctamente"
            )
        );
    } catch (error) {
        next(error);
    }
}


// =====================================================
// GET /dashboard/precio-mercado
// Obtiene el precio nacional publicado por el Ministerio.
// No modifica la configuración del establecimiento.
// =====================================================
static async precioMercado(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const respuesta =
            await PrecioMercadoService.obtenerPrecioMercado();

        return res.status(200).json(
            ApiResponse.success(
                respuesta,
                "Precio nacional de mercado obtenido correctamente"
            )
        );
    } catch (error) {
        next(error);
    }
}

}


