import fs from "fs";
import path from "path";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { Ollama } from "@langchain/ollama";
import { Buffer } from "buffer";
import { extractPdfText } from "../../../lib/extractPdfText.js";

const mainChatMessageHistory = new InMemoryChatMessageHistory();
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

function extractMessage(response) {
  return response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

export async function POST(req) {
  try {
    const { question, modelSelected, pdf } = await req.json();

    if (!question?.trim()) {
      return Response.json({ error: "Question is required." }, { status: 400 });
    }

    let pdfText = "";
    let pdfMeta = null;

    if (pdf) {
      const publicPath = path.join(process.cwd(), "public");
      if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true });
      }

      const filename = `file_${Date.now()}.pdf`;
      const filePath = path.join(publicPath, filename);
      fs.writeFileSync(filePath, Buffer.from(pdf, "base64"));

      const extracted = await extractPdfText(filePath);
      pdfText = extracted.text;
      pdfMeta = { usedOcr: extracted.usedOcr, charCount: extracted.charCount };

      if (!pdfText || pdfText.length < 20) {
        return Response.json(
          {
            error:
              "Could not read text from this PDF. It may be blank, encrypted, or too low quality for OCR.",
          },
          { status: 422 }
        );
      }
    }

    const systemMessage = pdfText
      ? `You are a professional medical assistant. The user uploaded a document and its extracted text is provided below under DOCUMENT CONTENT. Answer the user's question using that content. Do not ask the user to share the document again — you already have it. If the answer is not in the document, say what is missing. Always note that a licensed healthcare provider should interpret medical documents.`
      : `You are a professional medical assistant. Provide clear, concise, evidence-informed guidance. Always remind the user to consult a licensed healthcare provider for diagnosis or treatment decisions.`;

    const existingMessages = await mainChatMessageHistory.getMessages();
    if (existingMessages.length === 0) {
      await mainChatMessageHistory.addMessage(new SystemMessage(systemMessage));
    }

    const model = new Ollama({
      model: modelSelected,
      baseUrl: OLLAMA_BASE_URL,
    });

    const contextBlock = pdfText
      ? `DOCUMENT CONTENT:\n"""${pdfText}"""\n\nUSER QUESTION: ${question}`
      : question;

    await mainChatMessageHistory.addMessage(new HumanMessage(question));

    let fullResponse = "";
    try {
      const stream = await model.stream(`${systemMessage}\n\n${contextBlock}\n\nAssistant:`);
      for await (const chunk of stream) {
        fullResponse += chunk;
      }
    } catch (ollamaError) {
      const errText = String(ollamaError?.message || "").toLowerCase();
      const isConnectionError =
        ollamaError?.cause?.code === "ECONNREFUSED" || errText.includes("fetch failed");
      const isMissingModel =
        errText.includes("404") ||
        errText.includes("not found") ||
        (errText.includes("model") && errText.includes("does not exist"));

      let message = ollamaError.message || "Ollama request failed.";
      if (isConnectionError) {
        message = `Cannot reach Ollama at ${OLLAMA_BASE_URL}. Run \`ollama serve\` in a terminal.`;
      } else if (isMissingModel) {
        message = `Model "${modelSelected}" is not installed. Run: ollama pull ${modelSelected}`;
      }

      return Response.json({ error: message }, { status: 503 });
    }

    fullResponse = extractMessage(fullResponse);
    await mainChatMessageHistory.addMessage(new AIMessage(fullResponse));

    return Response.json({ text: fullResponse, pdfMeta });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
