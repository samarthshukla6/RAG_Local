import { motion } from "framer-motion";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  loading: boolean;
  disabled: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatInput({ input, loading, disabled, inputRef, onChange, onSubmit }: ChatInputProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-blue-100 bg-gradient-to-r from-blue-50/80 to-violet-50/50 px-4 py-4 sm:px-5"
    >
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe symptoms, ask about a condition, or reference your PDF..."
          disabled={loading}
          className="flex-1 rounded-xl border border-blue-200 bg-white px-4 py-3.5 text-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
        />
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.03 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          type="submit"
          disabled={disabled}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3.5 text-sm font-medium text-white shadow-md shadow-blue-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </motion.button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        Press Enter to send · Requires Ollama running locally
      </p>
    </form>
  );
}
