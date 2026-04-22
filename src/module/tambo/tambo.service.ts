import {
  TamboAnalysisInput,
  TamboAnalysisOutput,
  ChatMessage,
  ChatRequest,
  AlertaLote,
  OutlierLote,
} from "./tambo.types";

import {
  seedCategoryAverages,
  evaluateSingleLote,
} from "./tambo.engine";

import { buildPrompt } from "./tambo.prompt";
import { mergeDescriptions } from "./tambo.parser";

import { aiService } from "./ia.service";
import { tamboRepository } from "./tambo.repository";

// -----------------------------
// IA CALL
// -----------------------------
async function callModel(messages: ChatMessage[]): Promise<string> {
  const request: ChatRequest = {
    messages,
    temperature: 0.1,
    max_tokens: 1500,
    stream: false,
  };

  const response = await aiService.chatCompletion(request);

  return response?.choices?.[0]?.message?.content || "";
}

// -----------------------------
// ANALYZE
// -----------------------------
export async function analyze(
  data: TamboAnalysisInput
): Promise<TamboAnalysisOutput> {
  let outliers: OutlierLote[] = [];

  // 1. ENGINE
  if (data.lotes.length >= 15) {
    outliers = await seedCategoryAverages(data);
  } else {
    outliers = await evaluateSingleLote(data);
  }

  let alertas: AlertaLote[] = [];

  // 2. IA
  if (outliers.length > 0) {
    const messages = buildPrompt(outliers, data);

    if (messages.length > 0) {
      try {
        const raw = await callModel(messages);
        alertas = mergeDescriptions(raw, outliers, data);
      } catch (err) {
        console.warn("[IA fallback]", err);
        alertas = mergeDescriptions("", outliers, data);
      }
    }
  }

  // 3. PERSISTENCIA ALERTAS (DB)
  if (alertas.length > 0) {
    await Promise.all(
      alertas.map((a) =>
        tamboRepository.createAlerta({
          idEstablecimiento: data.idEstablecimiento,
          idLote: a.idLote,
          producto: a.producto,
          categoria: a.categoria,
          nivel: a.nivel,
          descripcion: a.descripcion,
        })
      )
    );
  }

  // 4. OUTPUT
  return {
    idEstablecimiento: data.idEstablecimiento,
    alertas_detectadas: alertas,
  };
}