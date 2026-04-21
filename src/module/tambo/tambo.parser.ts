import {
    OutlierLote,
    TamboAnalysisInput,
    AlertaLote,
} from "./tambo.types";

export function mergeDescriptions(raw: string,outliers: OutlierLote[],data: TamboAnalysisInput): AlertaLote[] {
    const descriptions: Record<string, string> = {};

    // 🧹 limpieza
    let cleaned = raw.trim();

    if (cleaned.startsWith("```")) {
        const lines = cleaned.split("\n");
        cleaned = lines.slice(1, -1).join("\n").trim();
    }

    // 🔄 parseo seguro
    try {
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed)) {
            for (const item of parsed) {
                const id = String(item?.idLote ?? "");
                const desc = item?.descripcion ?? "";
                descriptions[id] = desc;
            }
        }
    } catch (e) {
        console.warn("Could not parse AI descriptions, using fallback:", e);
    }

    // 🔗 merge + fallback
    const alertas: AlertaLote[] = [];

    for (const o of outliers) {
        const desc =
            descriptions[String(o.numeroLote)] ||
            `El lote L${o.numeroLote} presenta una merma de ${o.merma_total} ${o.unidad} (que es el ${o.pct_merma_lote}% de su volumen total), ` +
            `superando en un ${o.porcentaje_sobre_promedio}% el porcentaje promedio de la categoría ` +
            `${o.categoria} (que es tan solo ${o.promedio_categoria_pct}%).`;

        alertas.push({
            idLote: o.idLote,
            producto: o.producto,
            categoria: o.categoria,
            nivel: o.nivel,
            descripcion: desc,
        });
    }

    return alertas;
}