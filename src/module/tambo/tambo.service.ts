// src/modules/tambo/tambo.service.ts

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

// -------------------------------------------------
// CALL MODEL (equivalente a Python call_model)
// -------------------------------------------------
async function callModel(messages: ChatMessage[]): Promise<string> {
  const request: ChatRequest = {
    messages,
    temperature: 0.1,
    max_tokens: 1500,
    stream: false,
  };
  console.log("LLAMANDO IA...");

  const response = await aiService.chatCompletion(request);

  // Protección básica (en Python esto se asumía válido)
  return response?.choices?.[0]?.message?.content || "";
}

// -------------------------------------------------
// MAIN ANALYZE (equivalente a Python analyze)
// -------------------------------------------------
export async function analyze(data: TamboAnalysisInput): Promise<TamboAnalysisOutput> {
  let outliers: OutlierLote[] = [];
  console.log("OUTLIERS:", outliers);
  // 1. Engine (igual Python)
  if (data.lotes.length >= 15) {
    outliers = await seedCategoryAverages(data);
  } else {
    outliers = await evaluateSingleLote(data);
  }


  let alertas: AlertaLote[] = [];

  // 2. IA solo si hay outliers
  if (outliers.length > 0) {
    const messages = buildPrompt(outliers, data);

    // mismo comportamiento que Python
    if (messages.length > 0) {
      try {
        const rawResponse = await callModel(messages);

        // 3. merge + fallback interno (parser se encarga de todo)
        alertas = mergeDescriptions(rawResponse, outliers, data);
      } catch (error) {
        // ⚠️ NO romper flujo (igual Python)
        console.warn("AI call failed, using fallback:", error);

        alertas = mergeDescriptions("", outliers, data);
      }
    }
  }

  // 4. Output final
  return {
    idEstablecimiento: data.idEstablecimiento,
    alertas_detectadas: alertas,
  };
}