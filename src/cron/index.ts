import { iniciarLotesCron } from "./batch.cron";
import { iniciarPrecioMercadoCron } from "./precioLecheMercado.cron";

export function iniciarCrons() {

  iniciarLotesCron();
  iniciarPrecioMercadoCron();
}