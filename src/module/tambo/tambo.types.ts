// src/modules/tambo/tambo.types.ts

// 🔹 Categorías
export type Categoria = "quesos" | "leches";

// 🔹 Nivel de alerta
export type NivelAlerta = "bajo" | "medio" | "alto";

// 🔹 Merma individual dentro de un lote
export interface MermaInput {
  cantidad: number;
}

// 🔹 Lote de entrada
export interface LoteInput {
  idLote: string;
  numeroLote: number;
  producto: string;
  categoria: Categoria;
  unidad: string;
  cantidad: number;
  mermas: MermaInput[];
}

// 🔹 Input principal del análisis
export interface TamboAnalysisInput {
  idEstablecimiento: string;
  nombreEstablecimiento: string;
  lotes: LoteInput[];
}

// 🔹 Alerta generada (resultado final)
export interface AlertaLote {
  idLote: string;
  producto: string;
  categoria: Categoria;
  nivel: NivelAlerta;
  descripcion: string;
}

// 🔹 Output del análisis
export interface TamboAnalysisOutput {
  idEstablecimiento: string;
  alertas_detectadas: AlertaLote[];
}

// 🔹 Estructura interna (outlier antes de IA)
export interface OutlierLote {
  idLote: string;
  numeroLote: number;
  producto: string;
  categoria: Categoria;
  unidad: string;
  merma_total: number;
  pct_merma_lote: number;
  promedio_categoria_pct: number;
  porcentaje_sobre_promedio: number;
  nivel: NivelAlerta;
}

// 🔹 Mensajes para IA
export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

// 🔹 Request hacia IA
export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}