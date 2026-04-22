// src/modules/ai/ai.service.ts

import axios from "axios";
import { ChatRequest } from "../tambo/tambo.types";

const BASE_URL = "https://openrouter.ai/api/v1";

export const aiService = {
  async chatCompletion(request: ChatRequest) {
    const payload = {
      model: "openai/gpt-4o-mini", // ⚠️ en Python venía en request.model
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: request.max_tokens,
      temperature: request.temperature,
      stream: request.stream ?? false,
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/chat/completions`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000", // opcional
            "X-Title": "tambo360-backend",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data || error?.message || "Unknown error";

      console.error("OpenRouter error:", msg);
      throw new Error(msg);
    }
  },
};