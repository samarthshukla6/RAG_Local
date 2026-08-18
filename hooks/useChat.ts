"use client";

import { useCallback, useRef, useState } from "react";
import { extractValidInformation, stripThinkingTags } from "@/lib/utils/text";
import { fileToBase64 } from "@/lib/utils/files";
import type { RagChatResponse } from "@/types/api";
import type { ChatMessage } from "@/types/chat";

export function useChat(model: string, hasInstalledModels: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || loading || !hasInstalledModels) return;

      setLoading(true);
      setPdfStatus(file ? "Reading document (OCR may run for scanned PDFs)…" : null);
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");

      try {
        const pdfBase64 = file ? await fileToBase64(file) : null;
        const response = await fetch("/api/ragchat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed, modelSelected: model, pdf: pdfBase64 }),
        });

        const result: RagChatResponse = await response.json();
        if (!response.ok) throw new Error(result.error ?? `Request failed (${response.status})`);

        if (result.pdfMeta?.usedOcr) {
          setPdfStatus(`Scanned PDF detected — read ${result.pdfMeta.charCount} characters via OCR.`);
        } else if (result.pdfMeta?.charCount) {
          setPdfStatus(`Document loaded (${result.pdfMeta.charCount} characters).`);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: extractValidInformation(stripThinkingTags(result.text ?? "")),
          },
        ]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred while processing your request.";
        setMessages((prev) => [...prev, { role: "error", content: message }]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [file, hasInstalledModels, loading, model]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setInput("");
    setPdfStatus(null);
    inputRef.current?.focus();
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setPdfStatus(null);
  }, []);

  return {
    messages,
    input,
    setInput,
    loading,
    file,
    setFile,
    pdfStatus,
    inputRef,
    sendMessage,
    clearChat,
    removeFile,
  };
}
