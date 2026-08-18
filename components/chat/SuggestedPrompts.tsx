import { Bot, ChevronRight } from "lucide-react";
import { SUGGESTED_PROMPTS } from "@/constants/prompts";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-8 text-center">
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 p-4">
        <Bot className="h-10 w-10 text-blue-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-800">What would you like to know?</h3>
      <p className="mb-6 max-w-md text-sm text-slate-500">
        Ask a health question or upload a PDF lab report, prescription, or medical document for
        contextual answers.
      </p>
      <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelect(prompt)}
            className="group flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
          >
            <span>{prompt}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-blue-400 opacity-0 transition group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
}
