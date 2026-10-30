import { EstadoEjecucionIA } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { ErrorEjecucionIA, MetricasEjecucionIA, EstadoEjecucionIAType, FinalizarEjecucionParams } from "../types/ia.execution.types";
import { EjecucionIAError } from "../errors/python-ia.error";



/**
 * Inicia un nuevo intento de análisis.
 *
 * Incrementa el contador del evento y crea una ejecución RUNNING
 * dentro de la misma transacción.
 */
export async function iniciarEjecucion(idEventoIA: string) {
    return prisma.$transaction(async (tx) => {
        const evento = await tx.aiAnalysisEvent.update({
            where: { idEventoIA },
            data: {
                intentos: {
                    increment: 1,
                },
            },
            select: {
                intentos: true,
            },
        });

        const ejecucion = await tx.aiAnalysisExecution.create({
            data: {
                idEventoIA,
                numeroIntento: evento.intentos,
                estado: EstadoEjecucionIA.RUNNING,
            },
        });

        return ejecucion;
    });
}

/**
 * Finaliza una ejecución correctamente.
 *
 * Solo permite finalizar ejecuciones que estén en RUNNING.
 */
export async function finalizarEjecucionExitosa(idEjecucionIA: string, metricas?: MetricasEjecucionIA) {
    return finalizarEjecucion({ idEjecucionIA, estadoFinal: EstadoEjecucionIAType.COMPLETED, metricas, });
}

/**
 * Finaliza una ejecución con error.
 *
 * Guarda el código y el mensaje del error.
 * Solo permite finalizar ejecuciones que estén en RUNNING.
 */
export async function finalizarEjecucionFallida(idEjecucionIA: string, error: ErrorEjecucionIA, metricas?: MetricasEjecucionIA
) {
    return finalizarEjecucion({ idEjecucionIA, estadoFinal: EstadoEjecucionIAType.FAILED, error, metricas, });
}


async function finalizarEjecucion({ idEjecucionIA, estadoFinal, error, metricas,}: FinalizarEjecucionParams) {
    return prisma.$transaction(async (tx) => {
        const ejecucion = await tx.aiAnalysisExecution.findUnique({
            where: { idEjecucionIA },
            select: {
                idEjecucionIA: true,
                estado: true,
                inicioEn: true,
            },
        });

        if (!ejecucion) {
            throw new EjecucionIAError(`No existe la ejecución ${idEjecucionIA}`,"EJECUCION_NO_ENCONTRADA");
        }

        if (ejecucion.estado !== EstadoEjecucionIA.RUNNING) {
            throw new EjecucionIAError(`La ejecución ${idEjecucionIA} ya fue finalizada`, "EJECUCION_YA_FINALIZADA");
        }

        const finEn = new Date();
        const duracionMs = Math.max(0, finEn.getTime() - ejecucion.inicioEn.getTime());

        const resultado = await tx.aiAnalysisExecution.updateMany({
            where: {
                idEjecucionIA,
                estado: EstadoEjecucionIA.RUNNING,
            },
            data: {
                estado: estadoFinal,
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

        // La condición RUNNING evita que dos finalizaciones concurrentes
        // modifiquen una ejecución que ya fue finalizada.
        if (resultado.count === 0) {
            throw new EjecucionIAError(`La ejecución ${idEjecucionIA} ya fue finalizada`, "EJECUCION_YA_FINALIZADA");
        }

        return tx.aiAnalysisExecution.findUniqueOrThrow({
            where: { idEjecucionIA },
        });
    });
}