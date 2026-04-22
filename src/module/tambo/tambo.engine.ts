// src/modules/tambo/tambo.engine.ts

import {
  TamboAnalysisInput,
  OutlierLote,
  NivelAlerta,
  Categoria,
} from "./tambo.types";
import { tamboRepository } from "./tambo.repository";

const THRESHOLDS = {
  bajo: 3,
  medio: 5,
};

// -------------------------------------------------
// SEED (≥15 lotes)
// -------------------------------------------------
export async function seedCategoryAverages(
  data: TamboAnalysisInput
): Promise<OutlierLote[]> {
  const categoryTotals: Record<
    Categoria,
    { merma: number; produccion: number; cantidad_lotes: number }
  > = {
    quesos: { merma: 0, produccion: 0, cantidad_lotes: 0 },
    leches: { merma: 0, produccion: 0, cantidad_lotes: 0 },
  };

  const lotMermaTotals: Record<string, number> = {};
  const lotMermaPcts: Record<string, number> = {};

  // 1. Acumular
  for (const lote of data.lotes) {
    const mermaTotal = lote.mermas.reduce((sum, m) => sum + m.cantidad, 0);

    const pct = lote.cantidad > 0 ? (mermaTotal / lote.cantidad) * 100 : 0;

    lotMermaTotals[lote.idLote] = mermaTotal;
    lotMermaPcts[lote.idLote] = pct;

    categoryTotals[lote.categoria].merma += mermaTotal;
    categoryTotals[lote.categoria].produccion += lote.cantidad;
    categoryTotals[lote.categoria].cantidad_lotes += 1;
  }

  const categoryAvgPct: Record<Categoria, number> = {
    quesos: 0,
    leches: 0,
  };

  // 2. Guardar en DB (OVERWRITE como Python)
  for (const categoria of Object.keys(categoryTotals) as Categoria[]) {
    const totals = categoryTotals[categoria];

    const avg =
      totals.produccion > 0
        ? (totals.merma / totals.produccion) * 100
        : 0;

    categoryAvgPct[categoria] = avg;

    const record = await tamboRepository.getPromedio(
      data.idEstablecimiento,
      categoria
    );

    if (!record) {
      await tamboRepository.createPromedio({
        idEstablecimiento: data.idEstablecimiento,
        categoria,
        produccionAcumulada: totals.produccion,
        mermaAcumulada: totals.merma,
        pctMermaPromedio: avg,
        cantidadLotes: totals.cantidad_lotes,
      });
    } else {
      await tamboRepository.updatePromedio(
        data.idEstablecimiento,
        categoria,
        {
          produccionAcumulada: totals.produccion,
          mermaAcumulada: totals.merma,
          pctMermaPromedio: avg,
          cantidadLotes: totals.cantidad_lotes,
        }
      );
    }
  }

  // 3. Detectar outliers
  const outliers: OutlierLote[] = [];

  for (const lote of data.lotes) {
    const total = lotMermaTotals[lote.idLote];
    const pct = lotMermaPcts[lote.idLote];
    const avgPct = categoryAvgPct[lote.categoria];

    if (avgPct === 0) continue;

    const pctOver = ((pct - avgPct) / avgPct) * 100;

    if (pctOver <= 0) continue;

    let nivel: NivelAlerta;
    if (pctOver <= THRESHOLDS.bajo) nivel = "bajo";
    else if (pctOver <= THRESHOLDS.medio) nivel = "medio";
    else nivel = "alto";

    outliers.push({
      idLote: lote.idLote,
      numeroLote: lote.numeroLote,
      producto: lote.producto,
      categoria: lote.categoria,
      unidad: lote.unidad,
      merma_total: Number(total.toFixed(2)),
      pct_merma_lote: Number(pct.toFixed(2)),
      promedio_categoria_pct: Number(avgPct.toFixed(2)),
      porcentaje_sobre_promedio: Number(pctOver.toFixed(1)),
      nivel,
    });
  }

  return outliers;
}

// -------------------------------------------------
// SINGLE LOTE (<15)
// -------------------------------------------------
export async function evaluateSingleLote(
  data: TamboAnalysisInput
): Promise<OutlierLote[]> {
  const lote = data.lotes[0];

  const mermaTotal = lote.mermas.reduce((sum, m) => sum + m.cantidad, 0);

  const pct = lote.cantidad > 0 ? (mermaTotal / lote.cantidad) * 100 : 0;

  const record = await tamboRepository.getPromedio(
    data.idEstablecimiento,
    lote.categoria
  );

  // Inicialización
  if (!record) {
    await tamboRepository.createPromedio({
      idEstablecimiento: data.idEstablecimiento,
      categoria: lote.categoria,
      produccionAcumulada: lote.cantidad,
      mermaAcumulada: mermaTotal,
      pctMermaPromedio: pct,
      cantidadLotes: 1,
    });

    return [];
  }

  const avgPct = record.pctMermaPromedio;
  const outliers: OutlierLote[] = [];

  // Evaluación
  if (avgPct > 0) {
    const pctOver = ((pct - avgPct) / avgPct) * 100;

    if (pctOver > 0) {
      let nivel: NivelAlerta;
      if (pctOver <= THRESHOLDS.bajo) nivel = "bajo";
      else if (pctOver <= THRESHOLDS.medio) nivel = "medio";
      else nivel = "alto";

      outliers.push({
        idLote: lote.idLote,
        numeroLote: lote.numeroLote,
        producto: lote.producto,
        categoria: lote.categoria,
        unidad: lote.unidad,
        merma_total: Number(mermaTotal.toFixed(2)),
        pct_merma_lote: Number(pct.toFixed(2)),
        promedio_categoria_pct: Number(avgPct.toFixed(2)),
        porcentaje_sobre_promedio: Number(pctOver.toFixed(1)),
        nivel,
      });
    }
  }

  // Update acumulado (igual Python)
  const newMerma = record.mermaAcumulada + mermaTotal;
  const newProduccion = record.produccionAcumulada + lote.cantidad;

  const newPct =
    newProduccion > 0 ? (newMerma / newProduccion) * 100 : 0;

  await tamboRepository.updatePromedio(
    data.idEstablecimiento,
    lote.categoria,
    {
      mermaAcumulada: newMerma,
      produccionAcumulada: newProduccion,
      cantidadLotes: record.cantidadLotes + 1,
      pctMermaPromedio: newPct,
    }
  );

  return outliers;
}