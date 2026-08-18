"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { MessageList } from "./MessageList";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { LoadingIndicator } from "./LoadingIndicator";
import { ChatInput } from "./ChatInput";
import type { ChatMessage } from "@/types/chat";

interface ChatPanelProps {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  file: File | null;
  pdfStatus: string | null;
  hasInstalledModels: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSendPrompt: (prompt: string) => void;
  onClearChat: () => void;
}

export function ChatPanel({
  messages,
  input,
  loading,
  file,
  pdfStatus,
  hasInstalledModels,
  inputRef,
  onInputChange,
  onSubmit,
  onSendPrompt,
  onClearChat,
}: ChatPanelProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadingLabel = file
    ? pdfStatus || "Reading document (OCR for scanned PDFs) and generating response..."
    : "Generating response...";

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-blue-100/80 bg-white/80 shadow-sm backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-blue-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-800">Consultation</h2>
          <p className="text-xs text-slate-500">
            {file ? `Using context from ${file.name}` : "General medical Q&A"}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClearChat}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New chat
          </button>
        )}
      </div>

      <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 && !loading && (
          <SuggestedPrompts onSelect={onSendPrompt} />
        )}
        <MessageList messages={messages} />
        {loading && <LoadingIndicator label={loadingLabel} />}
        <div ref={chatEndRef} />
      </div>

      <ChatInput
        input={input}
        loading={loading}
        disabled={loading || !input.trim() || !hasInstalledModels}
        inputRef={inputRef}
        onChange={onInputChange}
        onSubmit={onSubmit}
      />
    </motion.main>
  );
}
