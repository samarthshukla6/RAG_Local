import type { ModelOption } from "@/types/chat";

export const FALLBACK_MODELS: ModelOption[] = [
  { id: "llama3.2", name: "llama3.2", description: "Recommended starter model (~2GB)" },
  { id: "deepseek-r1:1.5b", name: "deepseek-r1:1.5b", description: "Lightweight reasoning model" },
  { id: "gemma2:2b", name: "gemma2:2b", description: "Compact general assistant" },
];

export const INSTALLED_LABEL = "Installed locally";
