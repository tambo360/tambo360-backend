import { iniciarLotesCron } from "./batch.cron";
import { procesarEventosCron } from "./ia-event.cron";
import { iniciarPrecioMercadoCron } from "./precioLecheMercado.cron";

export function iniciarCrons() {

  iniciarLotesCron();
  iniciarPrecioMercadoCron();
  procesarEventosCron()
}