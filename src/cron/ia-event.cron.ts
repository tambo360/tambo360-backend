import cron from "node-cron";
import { procesarEventosLotesPendientes, procesarEventosCierreMesPendientes } from "../module/ia/services/ia-eventService";

export function procesarEventosLoteCron() {
  let estaProcesando = false; // Candado de seguridad
  let eventosProcesados = 0
  // Se ejecuta en el minuto 0, 20 y 40 de cada hora
  cron.schedule("*/20 * * * *", async () => {
    if (estaProcesando) {
      console.log("[CRON] Ya hay un proceso corriendo, saltando este ciclo.");
      return;
    }

    estaProcesando = true;
    const timerLabel = "[CRON] TIEMPO TOTAL DE EJECUCIÓN";
    console.log("[CRON] INICIANDO PROCESAMIENTO DE EVENTOS (LOT_CLOSED)");
    console.time(timerLabel); // Inicia el cronómetro

    try {
      const response = await procesarEventosLotesPendientes();
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

export function procesarEventosCierreMesCron() {
  let estaProcesando = false; // Candado de seguridad
  let eventosProcesados = 0

  cron.schedule("*/2 * * * *", async () => {
    if (estaProcesando) {
      console.log("[CRON] Ya hay un proceso corriendo, saltando este ciclo.");
      return;
    }

    estaProcesando = true;
    const timerLabel = "[CRON] TIEMPO TOTAL DE EJECUCIÓN";
    console.log("[CRON] INICIANDO PROCESAMIENTO DE EVENTOS (MONTH_CLOSED)");
    console.time(timerLabel); // Inicia el cronómetro

    try {
      const response = await procesarEventosCierreMesPendientes();
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