import { AppError } from "../../../utils/AppError";
import { TipoSeguimiento, AmbitoPromedioProductivo, TipoRodeo } from "@prisma/client";

export const findAmbitoPromedioProductivo = (tipoSeguimiento: TipoSeguimiento, tipoRodeo: TipoRodeo | null): AmbitoPromedioProductivo => {
    switch (tipoSeguimiento) {
        case TipoSeguimiento.RODEO_UNICO:
        case TipoSeguimiento.RODEO:
            if (!tipoRodeo) {
                throw new AppError("Tipo de rodeo no proporcionado para tipo de seguimiento RODEO o RODEO_UNICO", 400);
            }

            switch (tipoRodeo) {
                case TipoRodeo.ALTA_PRODUCCION:
                    return AmbitoPromedioProductivo.RODEO_ALTO;
                case TipoRodeo.BAJA_PRODUCCION:
                    return AmbitoPromedioProductivo.RODEO_BAJO;
                case TipoRodeo.UNICO_ORDENIE:
                    return AmbitoPromedioProductivo.RODEO_UNICO;
                default:
                    throw new AppError(`Tipo de rodeo no soportado: ${tipoRodeo}`, 400);
            }

        case TipoSeguimiento.INDIVIDUAL:
            return AmbitoPromedioProductivo.INDIVIDUAL;

        default:
            throw new AppError(`Tipo de seguimiento no soportado: ${tipoSeguimiento}`, 400);
    }
}