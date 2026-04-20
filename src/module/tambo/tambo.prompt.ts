import {
    OutlierLote,
    TamboAnalysisInput,
    ChatMessage,
} from "./tambo.types";

export function buildPrompt(outliers: OutlierLote[],data: TamboAnalysisInput): ChatMessage[] {
    
    // ✅ 1. Early return (igual que Python)
    if (!outliers.length) return [];

    // ✅ 2. outliers_text (RESPETAR EXACTO)
    const outliersText = outliers
        .map(
            (o) =>
                `- numeroLote: ${o.numeroLote} | Producto: ${o.producto} | Categoría: ${o.categoria}` +
                ` | Merma absoluta: ${o.merma_total} ${o.unidad}` +
                ` | Porcentaje de merma de este lote: ${o.pct_merma_lote}%` +
                ` | Porcentaje de merma del promedio de su categoría: ${o.promedio_categoria_pct}%` +
                ` | El porcentaje de este lote supera el promedio en un: ${o.porcentaje_sobre_promedio}%` +
                ` | Nivel: ${o.nivel}`
        )
        .join("\n");

    // ✅ 3. schema_example (igual estructura)
    const schemaExample = JSON.stringify(
        [
            {
                idLote: "<id del lote>",
                descripcion: "Descripción técnica y objetiva del desvío de merma",
            },
        ],
        null,
        2
    );

    // ✅ 4. system message (COPIAR TEXTUAL)
    const systemMessage: ChatMessage = {
        role: "system",
        content:
            "Eres un analista técnico de producción lechera y quesera.\n\n" +
            "Los cálculos ya están hechos. Tu única tarea es redactar una descripción " +
            "técnica y objetiva del desvío de merma para cada lote que se te indica.\n\n" +
            "REGLAS:\n" +
            "1. Responde ÚNICAMENTE con un JSON válido: una lista de objetos con 'idLote' y 'descripcion'. Nota: usa el 'numeroLote' recibido como idLote en tu JSON de respuesta.\n" +
            "2. Sin texto adicional, sin markdown, sin explicaciones fuera del JSON.\n" +
            "3. La descripción debe mencionar la merma absoluta, el % de merma del lote, el % de merma promedio de la categoría, el porcentaje de desvío y EL NOMBRE de la categoría (ej: 'la categoría quesos'). Referencia al lote específico anteponiendo una 'L' mayúscula al número (ej: 'el lote L8').\n" +
            "4. Máximo 2 oraciones por descripción. Tono técnico.\n" +
            "5. La descripción debe comenzar SIEMPRE nombrando al lote específico, por ejemplo: 'El lote L21 de la categoría leches presentó...'\n\n" +
            `Formato exacto:\n${schemaExample}`,
    };

    // ✅ 5. user message
    const userMessage: ChatMessage = {
        role: "user",
        content:
            `Establecimiento: '${data.nombreEstablecimiento}' (ID: ${data.idEstablecimiento}).\n\n` +
            `Lotes con desvío de merma detectado:\n${outliersText}\n\n` +
            "Generá la descripción técnica para cada uno.",
    };

    // ✅ 6. return
    return [systemMessage, userMessage];
}