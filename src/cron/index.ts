import { iniciarLotesCron } from "./batch.cron";
import { procesarEventosLoteCron } from "./ia-event.cron";
import { cierreFinDeMes } from "./month_closed.cron";
import { iniciarPrecioMercadoCron } from "./precioLecheMercado.cron";

export function iniciarCrons() {

  iniciarLotesCron();
  iniciarPrecioMercadoCron();
  procesarEventosLoteCron()
  cierreFinDeMes()
}