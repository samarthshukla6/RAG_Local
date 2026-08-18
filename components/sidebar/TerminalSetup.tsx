interface TerminalSetupProps {
  model: string;
  visible: boolean;
}

export function TerminalSetup({ model, visible }: TerminalSetupProps) {
  if (!visible) return null;

  return (
    <div className="rounded-3xl border border-blue-200 bg-blue-50/80 p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-blue-900">Terminal setup</h2>
      <ol className="space-y-3 text-xs leading-relaxed text-blue-900">
        <li>
          <span className="font-medium">1. Start Ollama</span>
          <code className="mt-1 block rounded bg-white/90 px-2 py-1 font-mono text-[11px]">
            ollama serve
          </code>
        </li>
        <li>
          <span className="font-medium">2. Pull a model</span>
          <code className="mt-1 block rounded bg-white/90 px-2 py-1 font-mono text-[11px]">
            ollama pull {model}
          </code>
        </li>
      </ol>
    </div>
  );
}
