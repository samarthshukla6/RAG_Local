import { NextResponse } from "next/server";
import { parseOllamaError, streamOllamaResponse } from "@/lib/ai/ollama";
import { extractPdfFromBase64 } from "@/lib/pdf/extractPdfText";
import type { RagChatRequest } from "@/types/api";

export async function POST(req: Request) {
  try {
    const body: RagChatRequest = await req.json();
    const { question, modelSelected, pdf } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    if (!modelSelected) {
      return NextResponse.json({ error: "Model is required." }, { status: 400 });
    }

    let pdfText = "";
    let pdfMeta = null;

    if (pdf) {
      const extracted = await extractPdfFromBase64(pdf);
      pdfText = extracted.text;
      pdfMeta = { usedOcr: extracted.usedOcr, charCount: extracted.charCount };

      if (!pdfText || pdfText.length < 20) {
        return NextResponse.json(
          {
            error:
              "Could not read text from this PDF. It may be blank, encrypted, or too low quality for OCR.",
          },
          { status: 422 }
        );
      }
    }

    try {
      const text = await streamOllamaResponse({
        model: modelSelected,
        question,
        documentText: pdfText || undefined,
      });

      return NextResponse.json({ text, pdfMeta });
    } catch (ollamaError) {
      return NextResponse.json(
        { error: parseOllamaError(ollamaError, modelSelected) },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("RAG chat error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
