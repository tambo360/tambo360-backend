import { Request, Response, NextFunction } from "express";

import { ApiResponse } from "../../../utils/ApiResponse";
import { AppError } from "../../../utils/AppError";

import {
  obtenerContextoEvento as obtenerContextoEventoService,
} from "../services/contexto-evento.service";

/**
 * GET /internal/ia/eventos/:idEvento/contexto
 *
 * Devuelve el contexto productivo de un evento de IA
 * para que Python pueda realizar su análisis.
 */
export const obtenerContextoEvento = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idEvento } = req.params;

    // El establecimiento se recibe mediante header.
    const idEstablecimiento = req.get("x-establecimiento-id");

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Validar identificador del evento.
    if (!idEvento || !uuidRegex.test(idEvento)) {
      throw new AppError(
        "El identificador del evento no es válido",
        400
      );
    }

    // Validar identificador del establecimiento.
    if (
      !idEstablecimiento ||
      !uuidRegex.test(idEstablecimiento)
    ) {
      throw new AppError(
        "El identificador del establecimiento no es válido",
        400
      );
    }

    // Obtener el contexto mediante el servicio.
    const data = await obtenerContextoEventoService(
      idEvento,
      idEstablecimiento
    );

    // Responder utilizando el formato estándar del backend.
    const response = ApiResponse.success(
      data,
      "Contexto del evento obtenido correctamente"
    );

    res.status(response.statusCode).json(response);

  } catch (error) {
    // Delegar los errores al middleware global.
    next(error);
  }
};
