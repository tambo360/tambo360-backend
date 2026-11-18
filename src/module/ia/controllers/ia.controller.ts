import { Request, Response, NextFunction } from "express";

import { ApiResponse } from "../../../utils/ApiResponse";
import { AppError } from "../../../utils/AppError";

import { obtenerHistoricoMensual as obtenerHistoricoMensualService } from "../services/historico-mensual.service";

/**
 * GET /internal/ia/resumenes/:idResumenMensual/historico
 *
 * Devuelve hasta seis resúmenes mensuales anteriores
 * para que Python pueda realizar el análisis histórico.
 */
export const obtenerHistoricoMensual = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { idResumenMensual } = req.params;

    // Validar que el parámetro tenga formato UUID.
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!idResumenMensual || !uuidRegex.test(idResumenMensual)) {
      throw new AppError(
        "El identificador del resumen mensual no es válido",
        400
      );
    }

    // Obtener el histórico mediante el servicio.
    const data = await obtenerHistoricoMensualService(
      idResumenMensual
    );

    // Responder utilizando el formato estándar del backend.
    const response = ApiResponse.success(
      data,
      "Histórico mensual obtenido correctamente"
    );

    res.status(response.statusCode).json(response);

  } catch (error) {
    // Delegar los errores al middleware global.
    next(error);
  }
};
