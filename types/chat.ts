export type MessageRole = "user" | "ai" | "error";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

export interface PdfMeta {
  usedOcr: boolean;
  charCount: number;
}
