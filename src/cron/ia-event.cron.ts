import cron from "node-cron";
import { procesarEventosPendientes } from "../module/ia/services/ia-eventService";

let estaProcesando = false; // Candado de seguridad
let eventosProcesados = 0

export function procesarEventosCron() {
  // Se ejecuta en el minuto 0, 20 y 40 de cada hora
  cron.schedule("*/20 * * * *", async () => {
    if (estaProcesando) {
      console.log("[CRON] Ya hay un proceso corriendo, saltando este ciclo.");
      return;
    }

    estaProcesando = true;
    const timerLabel = "[CRON] TIEMPO TOTAL DE EJECUCIÓN";
    console.log("[CRON] INICIANDO PROCESAMIENTO DE EVENTOS");
    console.time(timerLabel); // Inicia el cronómetro

    try {
      const response = await procesarEventosPendientes();
      eventosProcesados = response.eventosProcesados
      
    } catch (error) {
      console.error("[CRON] ERROR EN PROCESAMIENTO DE EVENTOS", error);
    } finally {
      console.timeEnd(timerLabel); // Imprime: [CRON] Tiempo total de ejecución: 1.234s
      console.log("TOTAL DE EVENTOS PROCESADOS (CORRECTOS E INCORRECTOS)", eventosProcesados)
      estaProcesando = false;
    }
  });
}
