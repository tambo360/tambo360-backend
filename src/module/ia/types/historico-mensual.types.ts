
import { CategoriaCostoResumen, CostoGeneral } from "@prisma/client";

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


export interface crearResumenesMensualesParams {
  mes: number,
  anio: number,
  fechaDesde: Date,
  fechaHasta: Date
}

export interface crearResumenMensualParams {
  costos: CostoGeneral[],
  idEstablecimiento: string,
  anio: number,
  mes: number,
  fechaDesde: Date,
  fechaHasta: Date,
  cantidadLotes: number,
  litrosProduccion: number,
  litrosMermas:     number,
  litrosTotales:    number,
  litrosLibres:     number,
  costosTotales: number
  costoPorLitro: number
}