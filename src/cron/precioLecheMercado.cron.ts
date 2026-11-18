
import cron from "node-cron";
import { PrecioMercadoService } from "../services/precioMercadoService";

export function iniciarPrecioMercadoCron() {
    // Ejecuta la actualización el día 1 de cada mes a las 06:00.
    // La zona horaria corresponde a Argentina.
    cron.schedule(
        "0 6 1 * *",
        async () => {
            console.log("[CRON] Iniciando actualización del precio nacional de mercado de la leche");

            try {
                await PrecioMercadoService.actualizarPrecioMercado();

                console.log("[CRON] Precio nacional de mercado actualizado correctamente");
            } catch (error) {
                console.error(
                    "[CRON] Error al actualizar el precio nacional de mercado. Se conserva el último valor válido obtenido.",
                    error
                );
            }
        },
        {
            timezone: "America/Argentina/Buenos_Aires",
        }
    );

    console.log("[CRON] Tarea de precio de mercado programada: día 1 de cada mes a las 06:00");
}
