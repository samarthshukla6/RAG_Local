import { useRef } from "react";
import { FileText, Upload, X } from "lucide-react";
import { isPdfFile } from "@/lib/utils/files";

interface PdfUploaderProps {
  file: File | null;
  pdfStatus: string | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

export function PdfUploader({ file, pdfStatus, onFileSelect, onFileRemove }: PdfUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected && isPdfFile(selected)) {
      onFileSelect(selected);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-800">
        <FileText className="h-3.5 w-3.5" />
        PDF Context
        <span className="font-normal normal-case text-slate-400">(optional)</span>
      </label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
        accept=".pdf,application/pdf"
      />
      {!file ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-violet-50 px-4 py-4 text-sm text-blue-800 transition hover:border-blue-400 hover:from-blue-100 hover:to-violet-100"
        >
          <Upload className="h-4 w-4" />
          Upload a medical PDF
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-3">
          <FileText className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{file.name}</span>
          <button
            type="button"
            onClick={() => {
              onFileRemove();
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-red-500"
            aria-label="Remove PDF"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {file && pdfStatus && <p className="mt-2 text-xs text-emerald-700">{pdfStatus}</p>}
      {file && !pdfStatus && (
        <p className="mt-2 text-xs text-slate-500">
          Scanned PDFs are supported via OCR (first message may take longer).
        </p>
      )}
    </div>
  );
}
