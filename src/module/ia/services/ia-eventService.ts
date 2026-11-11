import { randomUUID } from "node:crypto";
import { EstadoEjecucionIA, EstadoEventoIA, Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { CrearEventoIAParams, FallarEventoIAParams, ReactivarEventoIAParams, } from "../types/ia.types";
import { calcularProximoIntento } from "../utils/reintentos";

const TIEMPO_BLOQUEO_MS = 2 * 60 * 1000;

/**
 * Crea un evento pendiente.
 *
 * La clave de idempotencia evita crear dos eventos para la misma operación.
 * Si ya existe, devuelve el evento existente sin modificarlo.
 */
export async function crearEventoIA(tx: Prisma.TransactionClient, params: CrearEventoIAParams) {
  const prismaTx = tx || prisma;
  return  prismaTx.aiAnalysisEvent.upsert({
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