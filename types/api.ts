import type { ModelOption, PdfMeta } from "./chat";

export interface OllamaModelsResponse {
  models: ModelOption[];
  connected: boolean;
  error?: string;
}

export interface RagChatRequest {
  question: string;
  modelSelected: string;
  pdf?: string | null;
}

export interface RagChatResponse {
  text?: string;
  error?: string;
  pdfMeta?: PdfMeta;
}
