import fs from "fs";
import os from "os";
import path from "path";
import { MAX_PDF_CONTEXT_CHARS } from "@/lib/ai/config";
import { truncateText } from "@/lib/utils/text";
import { ensurePdfWorker, resetPdfWorker, PDFParse } from "./pdfParse";
import type { PdfMeta } from "@/types/chat";

const MIN_TEXT_CHARS = 80;
const MAX_OCR_PAGES = 10;

export interface ExtractPdfResult extends PdfMeta {
  text: string;
}

async function ocrFromBuffer(buffer: Buffer): Promise<string> {
  const Tesseract = (await import("tesseract.js")).default;

  resetPdfWorker();
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const screenshot = await parser.getScreenshot({ scale: 2, imageDataUrl: true });
    const pages = (screenshot.pages ?? []).slice(0, MAX_OCR_PAGES);
    const chunks: string[] = [];

    for (const page of pages) {
      if (!page.dataUrl) continue;
      const { data } = await Tesseract.recognize(page.dataUrl, "eng");
      if (data.text?.trim()) chunks.push(data.text.trim());
    }

    return chunks.join("\n\n");
  } finally {
    await parser.destroy();
  }
}

export async function extractPdfText(filePath: string): Promise<ExtractPdfResult> {
  ensurePdfWorker();

  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  let text = "";
  let usedOcr = false;

  try {
    const result = await parser.getText();
    text = result.text?.trim() ?? "";
  } finally {
    await parser.destroy();
  }

  if (text.length < MIN_TEXT_CHARS) {
    text = await ocrFromBuffer(buffer);
    usedOcr = true;
  }

  text = truncateText(text.trim(), MAX_PDF_CONTEXT_CHARS);

  return { text, usedOcr, charCount: text.length };
}

export async function extractPdfFromBase64(base64: string): Promise<ExtractPdfResult> {
  const buffer = Buffer.from(base64, "base64");
  const filePath = path.join(os.tmpdir(), `healthxai-${Date.now()}.pdf`);
  fs.writeFileSync(filePath, buffer);

  try {
    return await extractPdfText(filePath);
  } finally {
    try {
      fs.unlinkSync(filePath);
    } catch {
      // Temp file cleanup is best-effort.
    }
  }
}
