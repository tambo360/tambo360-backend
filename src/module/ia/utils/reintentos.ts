const ESPERA_BASE_MS = 60_000;
const ESPERA_MAXIMA_MS = 60 * 60 * 1000;

/**
 * Calcula cuándo debe volver a intentarse un evento.
 *
 * Intento 1: 1 minuto.
 * Intento 2: 2 minutos.
 * Intento 3: 4 minutos.
 * ...
 * El máximo de espera es 1 hora.
 */
export function calcularProximoIntento(
    intentos: number,
    ahora = new Date()
): Date {
    if (!Number.isInteger(intentos) || intentos < 1) {
        throw new Error("La cantidad de intentos debe ser un entero mayor a cero");
    }

    const esperaMs = Math.min(
        ESPERA_BASE_MS * 2 ** (intentos - 1),
        ESPERA_MAXIMA_MS
    );

    return new Date(ahora.getTime() + esperaMs);
}