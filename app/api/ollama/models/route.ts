import { NextResponse } from "next/server";
import { listOllamaModels } from "@/lib/ai/ollama";

export async function GET() {
  const { models, connected } = await listOllamaModels();

  if (!connected) {
    return NextResponse.json(
      {
        error: "Ollama is not running. Start it with: ollama serve",
        models: [],
        connected: false,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ models, connected: true });
}
