import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { TamboEngineService } from "../services/tamboEngineService";

export class AlertController {
    static async getAlertas(req: Request, res: Response, next: NextFunction) {
        try {
            const { idEstablecimiento } = req.params;
            const { rango } = req.query;

            if (!idEstablecimiento) throw new AppError("ID del establecimiento requerido", 400);

            const rangoDias = rango ? parseInt(rango as string, 10) : undefined;
            const alertas = await TamboEngineService.getAlertas(idEstablecimiento, rangoDias);

            return res.status(200).json(ApiResponse.success(alertas, "Alertas obtenidas correctamente"));
        } catch (error) {
            next(error);
        }
    }

    static async getUltimasAlertas(req: Request, res: Response, next: NextFunction) {
        try {
            const { idEstablecimiento } = req.params;
            if (!idEstablecimiento) throw new AppError("ID del establecimiento requerido", 400);

            const alertas = await TamboEngineService.getUltimasAlertas(idEstablecimiento);
            return res.status(200).json(ApiResponse.success(alertas, "Últimas alertas obtenidas correctamente"));
        } catch (error) {
            next(error);
        }
    }

    static async marcarAlertaVisto(req: Request, res: Response, next: NextFunction) {
        try {
            const { idAlerta } = req.params;
            if (!idAlerta) throw new AppError("ID de la alerta requerido", 400);

            const alerta = await TamboEngineService.marcarAlertaVisto(idAlerta);
            return res.status(200).json(ApiResponse.success(alerta, "Alerta marcada como vista correctamente"));
        } catch (error) {
            next(error);
        }
    }
    static async getAlertasNoVistasCount(req: Request, res: Response, next: NextFunction) {
        try {
            const { idEstablecimiento } = req.params;
            if (!idEstablecimiento) throw new AppError("ID del establecimiento requerido", 400);

            const data = await TamboEngineService.getAlertasNoVistasCount(idEstablecimiento);
            return res.status(200).json(ApiResponse.success(data, "Conteo de alertas no vistas obtenido correctamente"));
        } catch (error) {
            next(error);
        }
    }
    static async getAlertasPorLote(req: Request, res: Response, next: NextFunction) {
        try {
            const { idEstablecimiento, idLote } = req.params;
            if (!idEstablecimiento) throw new AppError("ID del establecimiento requerido", 400);
            if (!idLote) throw new AppError("ID del lote requerido", 400);

            const alertas = await TamboEngineService.getAlertasPorLote(idEstablecimiento, idLote);
            return res.status(200).json(ApiResponse.success(alertas, "Alertas del lote obtenidas correctamente"));
        } catch (error) {
            next(error);
        }
    }
}
