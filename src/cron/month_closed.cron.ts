import cron from "node-cron";
import { crearResumenesMensuales } from "../module/ia/services/historico-mensual.service";

let estaProcesando = false; // Candado en memoria para evitar superposiciones
let eventosProcesados = 0

export function cierreFinDeMes() {

    // "*/30 * 1-5 * *" -> Cada 30 minutos, los días 1, 2, 3, 4 y 5 de cada mes
    // Si prefieres solo los primeros 3 días, usa: "*/30 * 1-3 * *"
    cron.schedule('*/30 * 1-5 * *', async () => {

        if (estaProcesando) {
            console.log('[CRON] Ya hay un proceso corriendo, saltando este ciclo.');
            return;
        }

        estaProcesando = true;
        const hoy = new Date();

        // 1. Calcular el período del mes anterior
        const fechaDesde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1, 0, 0, 0, 0);
        const fechaHasta = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59, 999);

        // Extraer año y mes exactos desde fechaDesde (getMonth() + 1 para que enero sea 1 y diciembre 12)
        const anio = fechaDesde.getFullYear();
        const mes = fechaDesde.getMonth() + 1;
        const timerLabel = "[CRON] TIEMPO TOTAL DE EJECUCIÓN";

        try {
            console.log('Cerrando período desde:', "MES:", mes, "AÑO:", anio);
            console.time(timerLabel); // Inicia el cronómetro

            const res = await crearResumenesMensuales({ mes, anio, fechaDesde, fechaHasta })
            eventosProcesados = res.eventosProcesados

        } catch (error) {
            console.error("[CRON] ERROR EN PROCESAMIENTO DE CIERRE DE MES", error);
        } finally {
            console.timeEnd(timerLabel); // Imprime: [CRON] Tiempo total de ejecución: 1.234s
            console.log("TOTAL DE RESUMENES DE MES CREADOS: ", eventosProcesados)
            estaProcesando = false; // Liberar el candado siempre, incluso si hubo error
        }
    }, {
        timezone: "America/Argentina/Buenos_Aires"
    });

}




