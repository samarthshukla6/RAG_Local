import path from "path";
import { pathToFileURL } from "url";
import { PDFParse } from "pdf-parse";

let workerConfigured = false;

function getWorkerPath(): string {
  return pathToFileURL(
    path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
  ).href;
}

export function ensurePdfWorker(): void {
  PDFParse.setWorker(getWorkerPath());
  workerConfigured = true;
}

export function resetPdfWorker(): void {
  PDFParse.setWorker(getWorkerPath());
  workerConfigured = workerConfigured || true;
}

export { PDFParse };
