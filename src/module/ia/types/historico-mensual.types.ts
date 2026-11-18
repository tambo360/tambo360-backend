
import { CategoriaCostoResumen } from "@prisma/client";

/**
 * Representa un costo correspondiente a una categoría
 * dentro de un resumen mensual histórico.
 */
export interface CostoCategoriaHistorico {
  idResumenCostoCategoria: string;
  categoria: CategoriaCostoResumen;
  monto: string;
}

/**
 * Representa un resumen mensual anterior.
 *
 * Los importes Decimal de Prisma se convierten a string
 * para evitar pérdidas de precisión.
 */
export interface ResumenMensualHistorico {
  idResumenMensual: string;
  anio: number;
  mes: number;
  fechaDesde: string;
  fechaHasta: string;

  cantLotes: number;

  litrosProduccion: string;
  litrosMermas: string;
  litrosTotales: string;
  litrosLibres: string | null;

  costosTotales: string;
  costoPorLitro: string | null;

  costoPorCategoria: CostoCategoriaHistorico[];
}

/**
 * Datos que devuelve el endpoint dentro de ApiResponse.
 */
export interface HistoricoMensualResponse {
  historico: ResumenMensualHistorico[];
}
