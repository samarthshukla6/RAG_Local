import fs from "fs";
import Tesseract from "tesseract.js";
import { ensurePdfWorker, resetPdfWorker, PDFParse } from "./pdfParse.js";

const MIN_TEXT_CHARS = 80;
const MAX_PAGES_OCR = 10;
const MAX_CONTEXT_CHARS = 12000;

async function ocrFromPdfBuffer(buffer) {
  resetPdfWorker();

  const data = new Uint8Array(buffer);
  const parser = new PDFParse({ data });

  try {
    const screenshot = await parser.getScreenshot({
      scale: 2,
      imageDataUrl: true,
    });

    const pages = (screenshot.pages || []).slice(0, MAX_PAGES_OCR);
    const chunks = [];

    for (const page of pages) {
      if (!page.dataUrl) continue;
      const { data: result } = await Tesseract.recognize(page.dataUrl, "eng");
      if (result.text?.trim()) {
        chunks.push(result.text.trim());
      }
    }

    return chunks.join("\n\n");
  } finally {
    await parser.destroy();
  }
}

function truncateText(text) {
  if (text.length <= MAX_CONTEXT_CHARS) return text;
  return `${text.slice(0, MAX_CONTEXT_CHARS)}\n\n[Document truncated due to length…]`;
}

export async function extractPdfText(filePath) {
  ensurePdfWorker();

  const buffer = fs.readFileSync(filePath);
  const data = new Uint8Array(buffer);
  const parser = new PDFParse({ data });

  let text = "";
  let usedOcr = false;

  try {
    const result = await parser.getText();
    text = result.text?.trim() || "";
  } finally {
    await parser.destroy();
  }

  if (text.length < MIN_TEXT_CHARS) {
    text = await ocrFromPdfBuffer(buffer);
    usedOcr = true;
  }

  text = truncateText(text.trim());

  return { text, usedOcr, charCount: text.length };
}
