import { Prisma, TipoEventoIA } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../../utils/AppError";

import { buscarResumenMensualPorId, buscarResumenesAnteriores, } from "../repositories/historico-mensual.repository";

import { crearResumenesMensualesParams, crearResumenMensualParams, HistoricoMensualResponse, ResumenMensualHistorico, } from "../types/historico-mensual.types";
import { crearEventoIA } from "./ia-eventService";

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


export const crearResumenesMensuales = async (data: crearResumenesMensualesParams) => {
  let eventosProcesados = 0
  const establecimientos = await prisma.establecimiento.findMany({
    where: {
      // Puedes sumar aquí filtros como: activo: true
      resumenMensuals: {
        none: {
          anio: data.anio,
          mes: data.mes,
        },
      },
    },
    select: {
      idEstablecimiento: true,
      configuracions: {
        select: {
          precioLitro: true
        }
      }
      // Trae solo los campos mínimos necesarios para no cargar memoria de más
    },
    take: 10,
  });


  if (establecimientos.length <= 0) {
    console.log("No quedan establecimientos pendientes para crear un resumen mensual")
    return {
      eventosProcesados
    }
  }

  for (const est of establecimientos) {
    try {
      if (!est.configuracions[0].precioLitro) {
        throw new AppError("Establecimiento sin configuracion suficiente", 500)
      }

      const lotes = await prisma.loteProduccion.findMany({
        where: {
          idEstablecimiento: est.idEstablecimiento,
          fechaProduccion: {
            lt: data.fechaHasta,
            gt: data.fechaDesde
          }
        },
        include: {
          mermas: true
        }
      })

      if (lotes.length <= 0) {
        console.warn(`[CRON] El establecimiento: ${est.idEstablecimiento} no tiene lotes existentes, se omite`);
        continue;
      }

      const costos = await prisma.costoGeneral.findMany({
        where: {
          idEstablecimiento: est.idEstablecimiento,
          fecha: {
            lt: data.fechaHasta,
            gt: data.fechaDesde
          }
        }
      })

      const gastosTotales = costos.reduce((acc, costo) => acc + costo.monto.toNumber(), 0)


      let litrosProduccion = 0
      let litrosMermas = 0

      lotes.forEach((lote) => {
        const totalMermaLote = lote.mermas.reduce((acc, merma) => acc + merma.cantidad.toNumber(), 0);
        litrosMermas += totalMermaLote
        litrosProduccion += lote.cantidad.toNumber()
      });

      const litrosLibres = await calcularLitrosLibres(litrosProduccion, est.configuracions[0].precioLitro.toNumber(), gastosTotales, data.mes, data.anio);
      const costoPorLitro = gastosTotales / (litrosProduccion + litrosMermas)


      await prisma.$transaction(async (tx) => {
        const resumenMensual = await crearResumenMensual(tx, {
          costos: costos,
          idEstablecimiento: est.idEstablecimiento,
          anio: data.anio,
          mes: data.mes,
          fechaDesde: data.fechaDesde,
          fechaHasta: data.fechaHasta,
          cantidadLotes: lotes.length,
          litrosProduccion: litrosProduccion,
          litrosMermas: litrosMermas,
          litrosTotales: litrosProduccion + litrosMermas,
          litrosLibres: litrosLibres,
          costosTotales: gastosTotales,
          costoPorLitro: costoPorLitro
        })
        const claveIdempotencia = "MONTH_CLOSED:" + est.idEstablecimiento + ":" + data.anio + ":" + data.mes
        await crearEventoIA(tx, {
          idEstablecimiento: est.idEstablecimiento,
          tipo: TipoEventoIA.MONTH_CLOSED,
          claveIdempotencia: claveIdempotencia,
          idResumenMensual: resumenMensual.idResumenMensual
        })
      })

      eventosProcesados++
      console.log("Resumen mensual y evento creado correctamente para el establecimiento:", est.idEstablecimiento)

    } catch (error) {
      console.log("Error interno al crear resumen mensual", error)
    }
  }

  return {
    eventosProcesados
  }
}

export const crearResumenMensual = async (tx: Prisma.TransactionClient, data: crearResumenMensualParams) => {
  const resumenMensual = await tx.resumenMensual.create({
    data: {
      idEstablecimiento: data.idEstablecimiento,
      anio: data.anio,
      mes: data.mes,
      fechaDesde: data.fechaDesde,
      fechaHasta: data.fechaHasta,
      cantidadLotes: data.cantidadLotes,
      litrosProduccion: data.litrosProduccion,
      litrosMermas: data.litrosMermas,
      litrosTotales: data.litrosTotales,
      litrosLibres: data.litrosLibres,
      costosTotales: data.costosTotales,
      costoPorLitro: data.costoPorLitro,
      costosPorCategoria: {
        createMany: {
          data: data.costos.map(costo => ({
            categoria: costo.tipoCosto,
            monto: costo.monto
          }))
        }
      }
    }
  })

  return resumenMensual
}


export const calcularLitrosLibres = async (litrosTotales: number, costoPorlitro: number, gastosTotales: number, mes: number, anio: number) => {
  let litrosDeGasto = 0
  if (!costoPorlitro || costoPorlitro <= 0) {
    const precioMercado = await prisma.precioMercado.findUnique({
      where: {
        mes_anio: {
          mes: mes,
          anio: anio
        }
      }
    })

    if (!precioMercado) {
      return 0;
    }

    litrosDeGasto = gastosTotales / precioMercado.precioLitro.toNumber();

  } else {
    litrosDeGasto = gastosTotales / costoPorlitro;
  }


  const litrosLibres = litrosTotales - litrosDeGasto;

  return litrosLibres;
}