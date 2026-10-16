
import { AppError } from "./AppError";

/**
 * Calcula los litros libres a partir de la producción,
 * el precio actual del litro de leche y los costos generales.
 */
export function calcularLitrosLibres(
    litrosProducidos: number,
    precioLitro: number,
    costosGenerales: number
): number {
    if (
        !Number.isFinite(litrosProducidos) ||
        !Number.isFinite(precioLitro) ||
        !Number.isFinite(costosGenerales)
    ) {
        throw new AppError("Los valores para calcular Litros Libres no son válidos", 400);
    }

    if (litrosProducidos < 0 || costosGenerales < 0) {
        throw new AppError("La producción y los costos no pueden ser negativos", 400);
    }

    if (precioLitro <= 0) {
        throw new AppError("El precio por litro debe ser mayor que cero", 400);
    }

    return ((litrosProducidos * precioLitro) - costosGenerales) / precioLitro;
}
