import { EstadoEventoIA } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { recuperarEventoBloqueado } from "./ia-eventService";

const INTERVALO_RECUPERACION_MS = 60_000;

let intervaloRecuperacion: ReturnType<typeof setInterval> | null = null;

export interface ResultadoRecuperacionIA {
    encontrados: number;
    recuperados: number;
    errores: number;
}

/**
 * Busca y recupera todos los eventos cuyo bloqueo venció.
 */
export async function recuperarEventosBloqueados(): Promise<ResultadoRecuperacionIA> {
    const ahora = new Date();

    const eventos = await prisma.aiAnalysisEvent.findMany({
        where: {
            estado: EstadoEventoIA.PROCESSING,
            bloqueadoHasta: {
                lte: ahora,
            },
        },
        select: {
            idEventoIA: true,
        },
    });

    let recuperados = 0;
    let errores = 0;

    for (const evento of eventos) {
        try {
            const recuperado = await recuperarEventoBloqueado(
                evento.idEventoIA
            );

            if (recuperado) {
                recuperados++;
            }
        } catch (error) {
            errores++;
            console.error(`[IA Recovery] Error recuperando evento ${evento.idEventoIA}:`,error);
        }
    }

    return {
        encontrados: eventos.length,
        recuperados,
        errores,
    };
}

/**
 * Ejecuta la recuperación periódicamente.
 *
 * Debe llamarse una sola vez al iniciar el backend.
 * La recuperación inicial permite atender bloqueos vencidos
 * que hayan quedado de una ejecución anterior del servidor.
 */
export function iniciarRecuperacionPeriodicaIA(): void {
    if (intervaloRecuperacion) {
        return;
    }

    void recuperarEventosBloqueados().catch((error) => {
        console.error("[IA Recovery] Error durante la recuperación inicial:",error);
    });

    intervaloRecuperacion = setInterval(() => {
        void recuperarEventosBloqueados().catch((error) => {
            console.error("[IA Recovery] Error durante la recuperación periódica:",error);
        });
    }, INTERVALO_RECUPERACION_MS);

    // Evita que el intervalo mantenga vivo el proceso por sí solo.
    intervaloRecuperacion.unref?.();
}

/**
 * Detiene el proceso periódico.
 * Útil para cierres controlados y pruebas.
 */
export function detenerRecuperacionPeriodicaIA(): void {
    if (!intervaloRecuperacion) {
        return;
    }

    clearInterval(intervaloRecuperacion);
    intervaloRecuperacion = null;
}