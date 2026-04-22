import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { analyze } from "../module/tambo/tambo.service";
import { tamboRepository } from "../module/tambo/tambo.repository";

const MINIMO_LOTES = 15;

export class TamboEngineService {
    private static async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 15000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error: any) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new AppError("Timeout: La IA tardó demasiado en responder", 504);
            }
            throw new AppError("Error de red: No se pudo conectar con la IA", 503);
        }
    }

    private static async _enriquecerAlertasConNumeroLote(alertas: any[]) {
        if (!alertas || alertas.length === 0) return [];

        const idsLotes = alertas.map(a => a.idLote).filter(Boolean);
        if (idsLotes.length === 0) return alertas;

        const lotesDb = await prisma.loteProduccion.findMany({
            where: { idLote: { in: idsLotes } },
            select: { idLote: true, numeroLote: true }
        });

        const lotesMap = new Map(lotesDb.map(l => [l.idLote, l.numeroLote]));

        return alertas.map(a => ({
            ...a,
            numeroLote: lotesMap.get(a.idLote) || null
        }));
    }


    static async analizarSiCorresponde(idEstablecimiento: string, idLoteTrigger?: string) {
        try {
            // 1. Fetch de datos
            const lotes = await prisma.loteProduccion.findMany({
                where: {
                    idEstablecimiento,
                    estado: true,
                },
                include: {
                    producto: true,
                    mermas: true,
                    costosDirectos: true,
                    establecimiento: true,
                },
                orderBy: { fechaProduccion: "asc" },
            });

            // 2. control mínimo
            if (lotes.length < MINIMO_LOTES) return;

            // 3. selección de lotes
            const lotesAEnviar =
                lotes.length === MINIMO_LOTES
                    ? lotes
                    : idLoteTrigger
                        ? lotes.filter(l => l.idLote === idLoteTrigger)
                        : [lotes[lotes.length - 1]];

            if (!lotesAEnviar.length) return;

            // 4. transformación de datos al formato esperado por la función analyze (que antes era el endpoint HTTP)
            const input = {
                idEstablecimiento,
                nombreEstablecimiento:
                    lotesAEnviar[0].establecimiento?.nombre || idEstablecimiento,
                lotes: lotesAEnviar.map(l => ({
                    idLote: l.idLote,
                    numeroLote: l.numeroLote,
                    fechaProduccion: l.fechaProduccion.toISOString().split("T")[0],
                    producto: l.producto.nombre,
                    categoria: l.producto.categoria,
                    cantidad: Number(l.cantidad),
                    unidad: l.unidad,
                    mermas: l.mermas.map(m => ({
                        descripcion: m.observacion || m.tipo,
                        cantidad: Number(m.cantidad),
                        unidad: l.unidad,
                    })),
                    costosDirectos: l.costosDirectos.map(c => ({
                        concepto: c.concepto,
                        monto: Number(c.monto),
                        moneda: "ARS",
                    })),
                })),
            };

            // 5. REEMPLAZO (ANTES ERA HTTP)
            const result = await analyze(input);

            if (result.alertas_detectadas.length > 0) {
                console.log(
                    `[TamboEngine] ${result.alertas_detectadas.length} alertas generadas`
                );
            } else {
                console.log("[TamboEngine] sin alertas");
            }

            return result;
        } catch (error: any) {
            console.error(
                "[TamboEngine] Falló análisis:",
                error.message || error
            );
        }
    }

    static async getAlertas(idEstablecimiento: string, rangoDias?: number) {
        try {
            // 1. consulta directa al módulo (DB vía repository)
            const alertas = await tamboRepository.getAlertas(
                idEstablecimiento,
                rangoDias
            );

            // 2. enriquecimiento (si lo necesitás mantener igual comportamiento)
            return await this._enriquecerAlertasConNumeroLote(alertas);
        } catch (error: any) {
            console.error("[TamboEngine] Error consultando alertas:", error);

            if (error instanceof AppError) throw error;

            throw new AppError(
                "Error interno consultando alertas",
                502
            );
        }
    }

    static async getUltimasAlertas(idEstablecimiento: string) {
        try {
            const alertas = await tamboRepository.getUltimasAlertas(
                idEstablecimiento
            );

            if (!alertas || alertas.length === 0) return [];

            return await this._enriquecerAlertasConNumeroLote(alertas);
        } catch (error: any) {
            console.error("[TamboEngine] Error consultando últimas alertas:", error);

            if (error instanceof AppError) throw error;

            throw new AppError(
                "Error interno consultando últimas alertas",
                502
            );
        }
    }

    static async marcarAlertaVisto(idAlerta: string) {
        try {
            const alerta = await tamboRepository.marcarAlertaVisto(idAlerta);

            return alerta;
        } catch (error) {
            console.error("[TamboModule] Error marcando alerta como vista:", error);

            throw new Error("No se pudo marcar la alerta como vista");
        }
    }

    static async getAlertasNoVistasCount(idEstablecimiento: string) {
        try {
            return await tamboRepository.countAlertasNoVistas(idEstablecimiento);
        } catch (error) {
            console.error(
                "[TamboModule] Error contando alertas no vistas:",
                error
            );

            throw new Error("No se pudo obtener el conteo de alertas no vistas");
        }
    }

    static async getAlertasPorLote(idEstablecimiento: string, idLote: string) {
        try {
            const alertas = await tamboRepository.getAlertasPorLote(
                idEstablecimiento,
                idLote
            );

            return await this._enriquecerAlertasConNumeroLote(alertas);
        } catch (error: any) {
            console.error(
                `[TamboEngine] Error consultando alertas del lote ${idLote}:`,
                error
            );

            if (error instanceof AppError) throw error;

            throw new AppError(
                "El servicio de Inteligencia Artificial devolvió una respuesta inesperada.",
                502
            );
        }
    }
}
