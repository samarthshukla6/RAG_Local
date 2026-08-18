import { Sparkles } from "lucide-react";
import type { ModelOption } from "@/types/chat";

interface ModelSelectorProps {
  model: string;
  modelOptions: ModelOption[];
  selectedModel?: ModelOption;
  connected: boolean | null;
  hasInstalledModels: boolean;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({
  model,
  modelOptions,
  selectedModel,
  connected,
  hasInstalledModels,
  onModelChange,
}: ModelSelectorProps) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-800">
        <Sparkles className="h-3.5 w-3.5" />
        AI Model
      </label>
      <select
        value={model}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {modelOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {selectedModel?.description && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{selectedModel.description}</p>
      )}
      {!hasInstalledModels && connected && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-relaxed text-amber-900">
          <p className="font-semibold">No models installed yet</p>
          <p className="mt-1">In a new terminal, run:</p>
          <code className="mt-1 block rounded bg-white/80 px-2 py-1 font-mono text-[11px]">
            ollama pull {model}
          </code>
        </div>
      )}
      {connected === false && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-800">
          Ollama is not reachable. Run <code className="font-mono">ollama serve</code> first.
        </div>
      )}
    </div>
  );
}
