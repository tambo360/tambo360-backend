import { analyze } from "../tambo.service";
import { TamboAnalysisInput } from "../tambo.types";

async function test() {
    const lotes = [];

    // 🔹 14 lotes "normales"
    for (let i = 1; i <= 14; i++) {
        lotes.push({
            idLote: `lote-${i}`,
            numeroLote: i,
            producto: "Leche entera",
            categoria: "leches" as const,
            unidad: "litros",
            cantidad: 1000,
            mermas: [{ cantidad: 50 }], // 5%
        });
    }

    // 🔥 1 lote OUTLIER (mucho mayor)
    lotes.push({
        idLote: "lote-15",
        numeroLote: 15,
        producto: "Leche entera",
        categoria: "leches" as const,
        unidad: "litros",
        cantidad: 1000,
        mermas: [{ cantidad: 200 }], // 20% → debería explotar como outlier
    });

    const data: TamboAnalysisInput = {
        idEstablecimiento: "est-test",
        nombreEstablecimiento: "Tambo Test",
        lotes,
    };

    console.log("🚀 Ejecutando análisis...\n");

    const result = await analyze(data);

    console.log("\n✅ RESULTADO FINAL:");
    console.dir(result, { depth: null });
}

test().catch((err) => {
    console.error("❌ ERROR EN TEST:", err);
});
