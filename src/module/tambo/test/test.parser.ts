import { mergeDescriptions } from "../tambo.parser";
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

function test(name: string, raw: string) {
  console.log(`\n===== ${name} =====`);
  const result = mergeDescriptions(raw, mockOutliers, mockData);
  console.log(JSON.stringify(result, null, 2));
}

test(
  "IA OK",
  JSON.stringify([
    { idLote: "21", descripcion: "Descripción generada por IA" },
  ])
);

test("IA ROTA", "cualquier cosa");

test(
  "IA MARKDOWN",
  "```json\n[{\"idLote\":\"21\",\"descripcion\":\"ok desde markdown\"}]\n```"
);

test("IA VACIA", JSON.stringify([]));

test(
  "IA PARCIAL",
  JSON.stringify([
    { idLote: "999", descripcion: "no coincide" }
  ])
);