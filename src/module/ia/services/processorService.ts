import { EstadoEventoIA } from "@prisma/client";
import { ZodError } from "zod";

import { prisma } from "../../../lib/prisma";
import { ejecutarAnalisisIA } from "../clients/python-ia.client";
import { PythonIAError, EjecucionIAError } from "../errors/python-ia.error";
import {AnalisisIARequest,AnalisisIAResponse,ErrorProcesamiento,} from "../types/ia.types";
import {finalizarEjecucionExitosa,finalizarEjecucionFallida,iniciarEjecucion,} from "./ia-executionService";
import { reclamarEventoIA } from "./ia-eventService";

export interface ResultadoProcesamientoIA {
    procesado: boolean;
    idEventoIA: string;
    resultado?: AnalisisIAResponse;
    error?: ErrorProcesamiento;
}

/**
 * Procesa un evento de análisis IA.
 *
 * El payload debe llegar preparado por el flujo funcional correspondiente.
 * Este servicio no calcula promedios ni construye los datos del lote o mes.
 *
 * Flujo:
 * 1. Valida que el evento exista y coincida con el payload.
 * 2. Reclama el evento.
 * 3. Crea una ejecución RUNNING e incrementa intentos.
 * 4. Envía el payload a Python.
 * 5. Finaliza la ejecución y el evento.
 */
export async function procesarEventoIA(payload: AnalisisIARequest): Promise<ResultadoProcesamientoIA> {
    const evento = await prisma.aiAnalysisEvent.findUnique({
        where: {
            idEventoIA: payload.idEventoIA,
        },
        select: {
            idEventoIA: true,
            idEstablecimiento: true,
            tipo: true,
            estado: true,
        },
    });

    if (!evento) {
        throw new EjecucionIAError(`No existe el evento ${payload.idEventoIA}`,"EVENTO_NO_ENCONTRADO");
    }

    if (evento.idEstablecimiento !== payload.idEstablecimiento ||evento.tipo !== payload.tipo) {
        throw new EjecucionIAError("Los datos del payload no coinciden con el evento registrado","PAYLOAD_EVENTO_INCOMPATIBLE");
    }

    if (evento.estado !== EstadoEventoIA.PENDING) {
        return {
            procesado: false,
            idEventoIA: payload.idEventoIA,
        };
    }

    const eventoReclamado = await reclamarEventoIA(payload.idEventoIA);

    if (!eventoReclamado) {
        return {
            procesado: false,
            idEventoIA: payload.idEventoIA,
        };
    }

    const { idEventoIA, tokenBloqueo } = eventoReclamado;

    const ejecucion = await iniciarEjecucion(idEventoIA,tokenBloqueo);

    let respuesta: AnalisisIAResponse;

    /**
     * Se separa la llamada a Python de la finalización en base de datos.
     * Un error al guardar el resultado no debe confundirse con un error
     * de comunicación con Python.
     */
    try {
        respuesta = await ejecutarAnalisisIA(payload);
    } catch (error) {
        const errorProcesamiento = clasificarError(error);

        await finalizarEjecucionFallida(ejecucion.idEjecucionIA,tokenBloqueo,errorProcesamiento);

        return {
            procesado: true,
            idEventoIA,
            error: errorProcesamiento,
        };
    }

    /**
     * COMPLETED e INSUFFICIENT_HISTORY son respuestas válidas.
     * En el segundo caso, alerta será null y no se guardará ninguna alerta.
     */
    await finalizarEjecucionExitosa(ejecucion.idEjecucionIA,tokenBloqueo,undefined,respuesta.alerta);

    return {
        procesado: true,
        idEventoIA,
        resultado: respuesta,
    };
}

/**
 * Convierte los errores técnicos en errores con una clasificación uniforme.
 */
function clasificarError(error: unknown): ErrorProcesamiento {
    if (error instanceof PythonIAError) {
        return {
            codigo: error.codigo,
            mensaje: error.message,
            reintentable: error.reintentable,
        };
    }

    /**
     * Si el payload no cumple el contrato Zod, no tiene sentido
     * volver a enviar exactamente los mismos datos.
     */
    if (error instanceof ZodError) {
        return {
            codigo: "INVALID_REQUEST",
            mensaje: "El payload enviado a Python no cumple el contrato esperado",
            reintentable: false,
        };
    }

    if (error instanceof Error) {
        return {
            codigo: "PROCESSING_ERROR",
            mensaje: error.message,
            reintentable: true,
        };
    }

    return {
        codigo: "UNKNOWN_ERROR",
        mensaje: "Ocurrió un error desconocido durante el procesamiento",
        reintentable: true,
    };
}