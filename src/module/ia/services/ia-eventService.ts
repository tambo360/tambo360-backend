import { randomUUID } from "node:crypto";
import { EstadoEjecucionIA, EstadoEventoIA, Prisma, TipoRodeo } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { CrearEventoIAParams, FallarEventoIAParams, ReactivarEventoIAParams, TipoSeguimiento, } from "../types/ia.types";
import { calcularProximoIntento } from "../utils/reintentos";
import { procesarEventoIA } from "./processorService";
import { findAmbitoPromedioProductivo } from "../utils";
import { AppError } from "../../../utils/AppError";

const TIEMPO_BLOQUEO_MS = 2 * 60 * 1000;
const eventosPorCicloCRON = 10

/**
 * Crea un evento pendiente.
 *
 * La clave de idempotencia evita crear dos eventos para la misma operación.
 * Si ya existe, devuelve el evento existente sin modificarlo.
 */
export async function crearEventoIA(tx: Prisma.TransactionClient, params: CrearEventoIAParams) {
  const prismaTx = tx || prisma;
  return prismaTx.aiAnalysisEvent.upsert({
    where: {
      claveIdempotencia: params.claveIdempotencia,
    },
    create: {
      idEstablecimiento: params.idEstablecimiento,
      tipo: params.tipo,
      claveIdempotencia: params.claveIdempotencia,
      idLote: params.idLote,
      idResumenMensual: params.idResumenMensual,
    },
    update: {},
  });
}

/**
 * Reclama un evento para que un único proceso pueda ejecutarlo.
 *
 * El cambio de PENDING a PROCESSING se realiza mediante updateMany
 * con condiciones de concurrencia. Si otro proceso lo reclamó antes,
 * el count será 0 y se devuelve null.
 *
 * El contador de intentos no se incrementa aquí: se incrementa
 * cuando se crea efectivamente una ejecución.
 */
export async function reclamarEventoIA(idEventoIA: string) {
  const ahora = new Date();
  const tokenBloqueo = randomUUID();

  return prisma.$transaction(async (tx) => {
    const evento = await tx.aiAnalysisEvent.findUnique({
      where: { idEventoIA },
      select: {
        estado: true,
        intentos: true,
        intentosMaximos: true,
        proximoIntentoEn: true,
      },
    });

    if (
      !evento ||
      evento.estado !== EstadoEventoIA.PENDING ||
      evento.intentos >= evento.intentosMaximos ||
      (evento.proximoIntentoEn && evento.proximoIntentoEn > ahora)
    ) {
      return null;
    }

    const resultado = await tx.aiAnalysisEvent.updateMany({
      where: {
        idEventoIA,
        estado: EstadoEventoIA.PENDING,
        intentos: evento.intentos,
        OR: [
          { proximoIntentoEn: null },
          { proximoIntentoEn: { lte: ahora } },
        ],
      },
      data: {
        estado: EstadoEventoIA.PROCESSING,
        iniciadoEn: ahora,
        bloqueadoHasta: new Date(
          ahora.getTime() + TIEMPO_BLOQUEO_MS
        ),
        tokenBloqueo,
      },
    });

    if (resultado.count !== 1) {
      return null;
    }

    return {
      idEventoIA,
      tokenBloqueo,
    };
  });
}

/**
 * Completa un evento si todavía pertenece al proceso que lo reclama.
 *
 * Se conserva por compatibilidad con otros servicios.
 * Para finalizar una ejecución, utilizar finalizarEjecucionExitosa,
 * que actualiza también el registro de ejecución en la misma transacción.
 */
export async function completarEventoIA(idEventoIA: string, tokenBloqueo: string) {
  const ahora = new Date();

  const resultado = await prisma.aiAnalysisEvent.updateMany({
    where: {
      idEventoIA,
      estado: EstadoEventoIA.PROCESSING,
      tokenBloqueo,
      bloqueadoHasta: { gt: ahora },
    },
    data: {
      estado: EstadoEventoIA.COMPLETED,
      completadoEn: ahora,
      proximoIntentoEn: null,
      bloqueadoHasta: null,
      tokenBloqueo: null,
      ultimoError: null,
    },
  });

  return resultado.count === 1;
}

/**
 * Marca un evento como fallido o lo devuelve a PENDING
 * cuando el error permite un nuevo intento.
 *
 * Se conserva por compatibilidad.
 * Para finalizar una ejecución, utilizar finalizarEjecucionFallida,
 * que actualiza también el registro de ejecución en la misma transacción.
 */
export async function fallarEventoIA({ idEventoIA, tokenBloqueo, codigo, mensaje, reintentable, }: FallarEventoIAParams) {
  return prisma.$transaction(async (tx) => {
    const ahora = new Date();

    const evento = await tx.aiAnalysisEvent.findFirst({
      where: {
        idEventoIA,
        estado: EstadoEventoIA.PROCESSING,
        tokenBloqueo,
        bloqueadoHasta: { gt: ahora },
      },
      select: {
        intentos: true,
        intentosMaximos: true,
      },
    });

    if (!evento) {
      return false;
    }

    const puedeReintentar =
      reintentable && evento.intentos < evento.intentosMaximos;

    const resultado = await tx.aiAnalysisEvent.updateMany({
      where: {
        idEventoIA,
        estado: EstadoEventoIA.PROCESSING,
        tokenBloqueo,
        bloqueadoHasta: { gt: ahora },
        intentos: evento.intentos,
      },
      data: {
        estado: puedeReintentar
          ? EstadoEventoIA.PENDING
          : EstadoEventoIA.FAILED,
        ultimoError: `${codigo}: ${mensaje}`,
        proximoIntentoEn: puedeReintentar
          ? calcularProximoIntento(evento.intentos, ahora)
          : null,
        bloqueadoHasta: null,
        tokenBloqueo: null,
      },
    });

    return resultado.count === 1;
  });
}

/**
 * Recupera un evento cuyo bloqueo venció.
 *
 * Si había una ejecución RUNNING, también la marca como FAILED.
 * La recuperación no crea una nueva ejecución ni incrementa intentos.
 * El próximo procesamiento creará una ejecución nueva.
 */
export async function recuperarEventoBloqueado(idEventoIA: string) {
  return prisma.$transaction(async (tx) => {
    const ahora = new Date();

    const evento = await tx.aiAnalysisEvent.findFirst({
      where: {
        idEventoIA,
        estado: EstadoEventoIA.PROCESSING,
        bloqueadoHasta: { lte: ahora },
      },
      select: {
        intentos: true,
        intentosMaximos: true,
        tokenBloqueo: true,
      },
    });

    if (!evento) {
      return false;
    }

    const puedeReintentar =
      evento.intentos < evento.intentosMaximos;

    const ejecucionesActivas = await tx.aiAnalysisExecution.findMany({
      where: {
        idEventoIA,
        estado: EstadoEjecucionIA.RUNNING,
      },
      select: {
        idEjecucionIA: true,
        inicioEn: true,
      },
    });

    const actualizado = await tx.aiAnalysisEvent.updateMany({
      where: {
        idEventoIA,
        estado: EstadoEventoIA.PROCESSING,
        tokenBloqueo: evento.tokenBloqueo,
        bloqueadoHasta: { lte: ahora },
      },
      data: {
        estado: puedeReintentar
          ? EstadoEventoIA.PENDING
          : EstadoEventoIA.FAILED,
        ultimoError:
          "La ejecución quedó interrumpida por vencimiento del bloqueo",
        proximoIntentoEn: puedeReintentar
          ? calcularProximoIntento(evento.intentos, ahora)
          : null,
        bloqueadoHasta: null,
        tokenBloqueo: null,
      },
    });

    if (actualizado.count !== 1) {
      return false;
    }

    for (const ejecucion of ejecucionesActivas) {
      await tx.aiAnalysisExecution.updateMany({
        where: {
          idEjecucionIA: ejecucion.idEjecucionIA,
          estado: EstadoEjecucionIA.RUNNING,
        },
        data: {
          estado: EstadoEjecucionIA.FAILED,
          finEn: ahora,
          duracionMs: Math.max(
            0,
            ahora.getTime() - ejecucion.inicioEn.getTime()
          ),
          codigoError: "PROCESSING_TIMEOUT",
          mensajeError:
            "La ejecución fue interrumpida por vencimiento del bloqueo",
        },
      });
    }

    return true;
  });
}

/**
 * Reactiva manualmente un evento fallido.
 *
 * Se amplía el máximo de intentos sin borrar el historial.
 */
export async function reactivarEventoIA({ idEventoIA, intentosAdicionales, }: ReactivarEventoIAParams) {

  if (!Number.isInteger(intentosAdicionales) || intentosAdicionales < 1) {
    throw new Error("La cantidad de intentos adicionales debe ser mayor a cero");
  }

  const resultado = await prisma.aiAnalysisEvent.updateMany({
    where: {
      idEventoIA,
      estado: EstadoEventoIA.FAILED,
    },
    data: {
      estado: EstadoEventoIA.PENDING,
      intentosMaximos: {
        increment: intentosAdicionales,
      },
      proximoIntentoEn: null,
      bloqueadoHasta: null,
      tokenBloqueo: null,
    },
  });

  return resultado.count === 1;
}


// BUSca eventos pendientes para procesar, obtiene los eventos que están en estado PENDING y que no tienen un bloqueo activo. Esto permite que los procesos de análisis de IA puedan reclamar y procesar estos eventos. SOLO EVENTOS TIPO LOT_CLOSED
export async function obtenerEventosPendientes(take: number) {
  const ahora = new Date();
  return prisma.aiAnalysisEvent.findMany({
    where: {
      estado: EstadoEventoIA.PENDING,
      tipo: "LOT_CLOSED",
      OR: [
        { bloqueadoHasta: null },
        { bloqueadoHasta: { lte: ahora } },
      ],
    },
    take: take,
    include: {
      lote: {
        select: {
          idLote: true,
          cantidad: true,
          cantAnimales: true,
          fechaProduccion: true,
          rodeo: {
            select: {
              tipoRodeo: true
            }
          },
          produccionesIndividuales: {
            select: {
              idAnimal: true,
              litros: true
            }
          }
        }
      },
      establecimiento: {
        select: {
          idEstablecimiento: true,
          configuracions: {
            select: {
              tipoSeguimiento: true
            }
          }
        }
      }
    }
  });
}

//recibe los eventos pendientes y los procesa uno por uno, utilizando la función procesarEventoIA para cada evento. Esto permite que los eventos pendientes sean procesados de manera secuencial.
export async function procesarEventosPendientes() {
  let eventosProcesados = 0
  const eventosPendientes = await obtenerEventosPendientes(eventosPorCicloCRON);
  console.log(`[CRON] EVENTOS PENDIENTES ENCONTRADOS: ${eventosPendientes.length}`);

  for (const evento of eventosPendientes) {
    try {

      if (!evento.lote || !evento.idLote) {
        console.warn(`[CRON] Evento ${evento.idEventoIA} no tiene lote asociado, se omite`);
        continue;
      }


      let promedioProductivo = await obtenerPromedioProductivo(null, evento.idEstablecimiento, evento.establecimiento.configuracions[0].tipoSeguimiento, evento.lote.rodeo?.tipoRodeo || null);

      await procesarEventoIA({
        idEventoIA: evento.idEventoIA,
        tipo: evento.tipo,
        idEstablecimiento: evento.idEstablecimiento,
        datos: {
          lote: {
            idLote: evento.idLote,
            cantidad: evento.lote.cantidad.toString(),
            cantAnimales: evento.lote.cantAnimales,
            fechaProduccion: evento.lote.fechaProduccion.toISOString(),
            listaAnimales: evento.lote.produccionesIndividuales.map(a => ({
              ...a,
              litros: a.litros.toString()
            }))
          },
          contexto: {
            tipoSeguimiento: evento.establecimiento.configuracions[0].tipoSeguimiento,
            promedioProductivo: {
              idPromedioProductivo: promedioProductivo.idPromedioProductivo,
              ambito: promedioProductivo.ambito,
              promedioLitrosPorAnimal: promedioProductivo.promedioLitrosPorAnimal.toString(),
              cantLotes: promedioProductivo.cantidadLotes,
              periodoDesde: promedioProductivo.periodoDesde ? promedioProductivo.periodoDesde.toISOString() : null,
              periodoHasta: promedioProductivo.periodoHasta ? promedioProductivo.periodoHasta.toISOString() : null,
              lotes: promedioProductivo.promedioProductivoLotes.map(lote => ({
                idLote: lote.idLote,
                cantLitros: lote.lote.cantidad.toString(),
                cantAnimales: lote.lote.cantAnimales,
                creadoEn: lote.creadoEn.toISOString(),
                mermas: lote.lote.mermas.map(lote => ({
                  tipo: lote.tipo,
                  cantidad: lote.cantidad.toString()
                }))
              }))
            }
          }
        },

      });

      console.log(`[CRON] evento procesado: ${evento.idEventoIA}`);
      eventosProcesados++
    } catch (error) {
      console.error(`[CRON] Error procesando evento ${evento.idEventoIA}`, error);
    }
  }


  return {
    eventosProcesados
  }

}


export async function obtenerPromedioProductivo(tx: Prisma.TransactionClient | null, idEstablecimiento: string, tipoSeguimiento: TipoSeguimiento, tipoRodeo: TipoRodeo | null) {
  const prismaTX = tx || prisma;
  const ambitoPromedio = findAmbitoPromedioProductivo(tipoSeguimiento, tipoRodeo)
  const promedioProductivo = await prismaTX.promedioProductivo.findUnique({
    where: {
      idEstablecimiento_ambito: {
        idEstablecimiento: idEstablecimiento,
        ambito: ambitoPromedio
      }
    },
    include: {
      promedioProductivoLotes: {
        include: {
          lote: {
            select: {
              cantAnimales: true,
              cantidad: true,
              mermas: {
                select: {
                  tipo: true,
                  cantidad: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!promedioProductivo) {
    throw new AppError("No se encontró el promedio productivo para el establecimiento y ámbito especificado", 404);
  }

  return promedioProductivo;
}