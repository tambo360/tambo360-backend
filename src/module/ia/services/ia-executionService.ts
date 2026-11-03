import { EstadoEjecucionIA, EstadoEventoIA, Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { ErrorEjecucionIA, MetricasEjecucionIA, EstadoEjecucionIAType, FinalizarEjecucionParams } from "../types/ia.execution.types";
import { AlertaIAResponse } from "../types/ia.types";
import { EjecucionIAError } from "../errors/python-ia.error";
import { calcularProximoIntento } from "../utils/reintentos";

/**
 * Inicia un nuevo intento.
 *
 * Incrementa el contador del evento y crea una ejecución RUNNING
 * dentro de la misma transacción.
 */
export async function iniciarEjecucion(idEventoIA: string, tokenBloqueo: string) {
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
            throw new EjecucionIAError("El evento ya no está reclamado por este proceso", "EVENTO_NO_RECLAMADO");
        }

        if (evento.intentos >= evento.intentosMaximos) {
            throw new EjecucionIAError("El evento alcanzó el máximo de intentos", "INTENTOS_AGOTADOS");
        }

        const ejecucionActiva =
            await tx.aiAnalysisExecution.findFirst({
                where: {
                    idEventoIA,
                    estado: EstadoEjecucionIA.RUNNING,
                },
                select: {
                    idEjecucionIA: true,
                },
            });

        if (ejecucionActiva) {
            throw new EjecucionIAError("El evento ya tiene una ejecución activa", "EJECUCION_ACTIVA");
        }

        const numeroIntento = evento.intentos + 1;

        const actualizado = await tx.aiAnalysisEvent.updateMany({
            where: {
                idEventoIA,
                estado: EstadoEventoIA.PROCESSING,
                tokenBloqueo,
                bloqueadoHasta: { gt: ahora },
                intentos: evento.intentos,
            },
            data: {
                intentos: {
                    increment: 1,
                },
            },
        });

        if (actualizado.count !== 1) {
            throw new EjecucionIAError("No se pudo iniciar el intento", "EVENTO_NO_RECLAMADO");
        }

        return tx.aiAnalysisExecution.create({
            data: {
                idEventoIA,
                numeroIntento,
                estado: EstadoEjecucionIA.RUNNING,
            },
        });
    });
}

/**
 * Finaliza una ejecución correctamente.
 *
 * Si Python devolvió una alerta, también la guarda.
 * La alerta, la ejecución y el evento se confirman en una transacción.
 */
export async function finalizarEjecucionExitosa(idEjecucionIA: string, tokenBloqueo: string, metricas?: MetricasEjecucionIA, alerta?: AlertaIAResponse | null) {
    return finalizarEjecucion({ idEjecucionIA, tokenBloqueo, estadoFinal: EstadoEjecucionIAType.COMPLETED, metricas, alerta, });
}

/**
 * Finaliza una ejecución con error.
 *
 * Si el error permite reintentar y todavía quedan intentos,
 * el evento vuelve a PENDING. En caso contrario, pasa a FAILED.
 */
export async function finalizarEjecucionFallida(idEjecucionIA: string, tokenBloqueo: string, error: ErrorEjecucionIA, metricas?: MetricasEjecucionIA) {
    return finalizarEjecucion({ idEjecucionIA, tokenBloqueo, estadoFinal: EstadoEjecucionIAType.FAILED, error, metricas, });
}

interface FinalizarEjecucionConAlertaParams
    extends FinalizarEjecucionParams {
    alerta?: AlertaIAResponse | null;
}

async function finalizarEjecucion({ idEjecucionIA, tokenBloqueo, estadoFinal, error, metricas, alerta, }: FinalizarEjecucionConAlertaParams) {
    return prisma.$transaction(async (tx) => {
        const ahora = new Date();

        const ejecucion =
            await tx.aiAnalysisExecution.findUnique({
                where: {
                    idEjecucionIA,
                },
                select: {
                    idEjecucionIA: true,
                    idEventoIA: true,
                    estado: true,
                    inicioEn: true,
                },
            });

        if (!ejecucion) {
            throw new EjecucionIAError(`No existe la ejecución ${idEjecucionIA}`, "EJECUCION_NO_ENCONTRADA");
        }

        if (ejecucion.estado !== EstadoEjecucionIA.RUNNING) {
            throw new EjecucionIAError(`La ejecución ${idEjecucionIA} ya fue finalizada`, "EJECUCION_YA_FINALIZADA");
        }

        const evento = await tx.aiAnalysisEvent.findFirst({
            where: {
                idEventoIA: ejecucion.idEventoIA,
                estado: EstadoEventoIA.PROCESSING,
                tokenBloqueo,
                bloqueadoHasta: {
                    gt: ahora,
                },
            },
            select: {
                idEventoIA: true,
                idEstablecimiento: true,
                intentos: true,
                intentosMaximos: true,
            },
        });

        if (!evento) {
            throw new EjecucionIAError("El evento ya no pertenece a este proceso", "EVENTO_NO_RECLAMADO");
        }

        const esExitosa = estadoFinal === EstadoEjecucionIAType.COMPLETED;

        const puedeReintentar =
            !esExitosa &&
            Boolean(error?.reintentable) &&
            evento.intentos < evento.intentosMaximos;

        const nuevoEstadoEvento = esExitosa
            ? EstadoEventoIA.COMPLETED
            : puedeReintentar
                ? EstadoEventoIA.PENDING
                : EstadoEventoIA.FAILED;

        /**
         * Primero actualizamos el evento de forma condicional.
         * Si el bloqueo venció o cambió de propietario, no finalizamos.
         */
        const eventoActualizado =
            await tx.aiAnalysisEvent.updateMany({
                where: {
                    idEventoIA: evento.idEventoIA,
                    estado: EstadoEventoIA.PROCESSING,
                    tokenBloqueo,
                    bloqueadoHasta: {
                        gt: ahora,
                    },
                    intentos: evento.intentos,
                },
                data: {
                    estado: nuevoEstadoEvento,
                    completadoEn: esExitosa ? ahora : null,
                    ultimoError: esExitosa
                        ? null
                        : `${error?.codigo ?? "UNKNOWN_ERROR"}: ${error?.mensaje ?? "Error desconocido"
                        }`,
                    proximoIntentoEn: puedeReintentar
                        ? calcularProximoIntento(evento.intentos, ahora)
                        : null,
                    bloqueadoHasta: null,
                    tokenBloqueo: null,
                },
            });

        if (eventoActualizado.count !== 1) {
            throw new EjecucionIAError("No se pudo finalizar el evento porque el bloqueo cambió o venció", "EVENTO_NO_RECLAMADO");
        }

        const finEn = new Date();
        const duracionMs = Math.max(
            0,
            finEn.getTime() - ejecucion.inicioEn.getTime()
        );

        const ejecucionActualizada =
            await tx.aiAnalysisExecution.updateMany({
                where: {
                    idEjecucionIA,
                    estado: EstadoEjecucionIA.RUNNING,
                },
                data: {
                    estado:
                        estadoFinal === EstadoEjecucionIAType.COMPLETED
                            ? EstadoEjecucionIA.COMPLETED
                            : EstadoEjecucionIA.FAILED,
                    finEn,
                    duracionMs,

                    ...(error && {
                        codigoError: error.codigo,
                        mensajeError: error.mensaje,
                    }),

                    ...(metricas?.usoLLM !== undefined && {
                        usoLLM: metricas.usoLLM,
                    }),
                    ...(metricas?.proveedor !== undefined && {
                        proveedor: metricas.proveedor,
                    }),
                    ...(metricas?.modelo !== undefined && {
                        modelo: metricas.modelo,
                    }),
                    ...(metricas?.tokensEntrada !== undefined && {
                        tokensEntrada: metricas.tokensEntrada,
                    }),
                    ...(metricas?.tokensSalida !== undefined && {
                        tokensSalida: metricas.tokensSalida,
                    }),
                },
            });

        if (ejecucionActualizada.count !== 1) {
            throw new EjecucionIAError(`La ejecución ${idEjecucionIA} ya fue finalizada`, "EJECUCION_YA_FINALIZADA");
        }

        /**
         * Solo se persiste una alerta cuando Python devuelve una.
         * La transacción evita que quede guardada si falla la finalización.
         */
        if (esExitosa && alerta) {
            await tx.alertaIA.create({
                data: {
                    idEstablecimiento: evento.idEstablecimiento,
                    idEventoIA: evento.idEventoIA,
                    tipo: alerta.tipo,
                    nivel: alerta.nivel,
                    titulo: alerta.titulo,
                    descripcion: alerta.descripcion,
                    recomendacion: alerta.recomendacion ?? null,
                    ...(alerta.datosContexto != null && {
                        datosContexto:
                            alerta.datosContexto as Prisma.InputJsonValue,
                    }),
                },
            });
        }

        return tx.aiAnalysisExecution.findUniqueOrThrow({
            where: {
                idEjecucionIA,
            },
        });
    });
}