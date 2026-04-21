import { buildPrompt } from "../tambo.prompt";
import { OutlierLote, TamboAnalysisInput } from "../tambo.types";

const mockOutliers: OutlierLote[] = [
    {
        idLote: "lote-1",
        numeroLote: 21,
        producto: "Leche entera",
        categoria: "leches",
        unidad: "litros",
        merma_total: 120,
        pct_merma_lote: 12,
        promedio_categoria_pct: 8,
        porcentaje_sobre_promedio: 50,
        nivel: "alto",
    },
];

const mockData: TamboAnalysisInput = {
    idEstablecimiento: "est-123",
    nombreEstablecimiento: "Tambo Don Pedro",
    lotes: [],
};

//con datos
const result = buildPrompt(mockOutliers, mockData);

//sin datos
const resultEmpty = buildPrompt([], mockData);

console.log(JSON.stringify(result, null, 2));
console.log(JSON.stringify(resultEmpty, null, 2));