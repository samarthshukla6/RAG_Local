const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

export async function GET() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return Response.json(
        { error: "Could not reach Ollama.", models: [] },
        { status: 503 }
      );
    }

    const data = await response.json();
    const models = (data.models || []).map((entry) => ({
      id: entry.name,
      name: entry.name,
      size: entry.size,
    }));

    return Response.json({ models, connected: true });
  } catch {
    return Response.json(
      {
        error: `Ollama is not running. Start it with: ollama serve`,
        models: [],
        connected: false,
      },
      { status: 503 }
    );
  }
}
