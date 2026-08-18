import { Ollama } from "@langchain/ollama";
import { OLLAMA_BASE_URL } from "@/lib/ai/config";
import { buildContextBlock, getSystemPrompt } from "@/lib/ai/prompts";
import { stripThinkingTags } from "@/lib/utils/text";

export interface StreamChatInput {
  model: string;
  question: string;
  documentText?: string;
}

export interface OllamaModelInfo {
  id: string;
  name: string;
  size?: number;
}

export async function listOllamaModels(): Promise<{
  models: OllamaModelInfo[];
  connected: boolean;
}> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { cache: "no-store" });
    if (!response.ok) return { models: [], connected: false };

    const data = await response.json();
    const models = (data.models ?? []).map((entry: { name: string; size?: number }) => ({
      id: entry.name,
      name: entry.name,
      size: entry.size,
    }));

    return { models, connected: true };
  } catch {
    return { models: [], connected: false };
  }
}

export function parseOllamaError(error: unknown, model: string): string {
  const err = error as { message?: string; cause?: { code?: string } };
  const errText = String(err?.message ?? "").toLowerCase();
  const isConnectionError =
    err?.cause?.code === "ECONNREFUSED" || errText.includes("fetch failed");
  const isMissingModel =
    errText.includes("404") ||
    errText.includes("not found") ||
    (errText.includes("model") && errText.includes("does not exist"));

  if (isConnectionError) {
    return `Cannot reach Ollama at ${OLLAMA_BASE_URL}. Run \`ollama serve\` in a terminal.`;
  }
  if (isMissingModel) {
    return `Model "${model}" is not installed. Run: ollama pull ${model}`;
  }
  return err?.message ?? "Ollama request failed.";
}

export async function streamOllamaResponse({
  model,
  question,
  documentText,
}: StreamChatInput): Promise<string> {
  const llm = new Ollama({ model, baseUrl: OLLAMA_BASE_URL });
  const systemMessage = getSystemPrompt(Boolean(documentText));
  const contextBlock = buildContextBlock(question, documentText);
  const prompt = `${systemMessage}\n\n${contextBlock}\n\nAssistant:`;

  let fullResponse = "";
  const stream = await llm.stream(prompt);
  for await (const chunk of stream) {
    fullResponse += chunk;
  }

  return stripThinkingTags(fullResponse);
}
