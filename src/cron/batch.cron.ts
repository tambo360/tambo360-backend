import cron from "node-cron";
import { LoteService } from "../services/batchService";

export function iniciarLotesCron() {

  cron.schedule("0 0 * * *", async () => {

    console.log("[CRON] Iniciando cierre automático de lotes");
    try {

      await LoteService.cerrarLotesVencidos();

    } catch (error) {

      console.error("[CRON] Error en cierre automático de lotes",error);

    }

  });

}