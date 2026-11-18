import { AppError } from "../../../utils/AppError";

import {buscarResumenMensualPorId, buscarResumenesAnteriores,} from "../repositories/historico-mensual.repository";

import {HistoricoMensualResponse, ResumenMensualHistorico,} from "../types/historico-mensual.types";

/**
 * Obtiene los resúmenes históricos de un resumen mensual.
 *
 * Reglas:
 * - El resumen solicitado debe existir.
 * - Solo se consultan resúmenes del mismo establecimiento.
 * - Solo se incluyen períodos anteriores.
 * - Se devuelven como máximo seis registros.
 * - Los costos se incluyen agrupados por categoría.
 */
export const obtenerHistoricoMensual = async (idResumenMensual: string): Promise<HistoricoMensualResponse> => {

  // 1. Buscar el resumen mensual solicitado.
  const resumenActual = await buscarResumenMensualPorId(
    idResumenMensual
  );

  // 2. Si no existe, devolver un error 404.
  if (!resumenActual) {
    throw new AppError("Resumen mensual no encontrado", 404);
  }

  // 3. Buscar los resúmenes anteriores del mismo establecimiento.
  const resumenesAnteriores = await buscarResumenesAnteriores(
    resumenActual.idEstablecimiento,
    resumenActual.anio,
    resumenActual.mes
  );

  // 4. Transformar los datos de Prisma al contrato de Python.
  const historico: ResumenMensualHistorico[] =
    resumenesAnteriores.map((resumen) => ({
      idResumenMensual: resumen.idResumenMensual,

      anio: resumen.anio,
      mes: resumen.mes,

      fechaDesde: resumen.fechaDesde.toISOString(),
      fechaHasta: resumen.fechaHasta.toISOString(),

      cantLotes: resumen.cantidadLotes,

      litrosProduccion: resumen.litrosProduccion.toString(),
      litrosMermas: resumen.litrosMermas.toString(),
      litrosTotales: resumen.litrosTotales.toString(),

      litrosLibres: resumen.litrosLibres?.toString() ?? null,

      costosTotales: resumen.costosTotales.toString(),
      costoPorLitro: resumen.costoPorLitro?.toString() ?? null,

      costoPorCategoria: resumen.costosPorCategoria.map((costo) => ({
        idResumenCostoCategoria: costo.idResumenCostoCategoria,
        categoria: costo.categoria,
        monto: costo.monto.toString(),
      })),
    }));

  // 5. Devolver el histórico.
  // Si no existen registros anteriores, historico será [].
  return {
    historico,
  };
};
