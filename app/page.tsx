"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Send,
  Upload,
  User,
  Bot,
  FileText,
  Cross,
  X,
  RotateCcw,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Stethoscope,
} from "lucide-react";

const fallbackModels = [
  { id: "llama3.2", name: "llama3.2", description: "Recommended starter model (~2GB)" },
  { id: "deepseek-r1:1.5b", name: "deepseek-r1:1.5b", description: "Lightweight reasoning model" },
  { id: "gemma2:2b", name: "gemma2:2b", description: "Compact general assistant" },
];

type ModelOption = { id: string; name: string; description?: string };

const suggestedPrompts = [
  "What are common symptoms of seasonal allergies?",
  "Explain this lab report in plain language",
  "What questions should I ask my doctor about this medication?",
  "Summarize the key findings from my uploaded document",
];

type Message = {
  role: "user" | "ai" | "error";
  content: string;
};

function extractValidInformation(text: string) {
  const endOfTextIndex = text.indexOf("<|end_of_text|>");
  if (endOfTextIndex !== -1) {
    const validInformation = text.slice(0, endOfTextIndex).trim();
    return validInformation.replace(/https?:\/\/[^\s]+/g, "").trim();
  }
  return text.trim();
}

function extractMessage(response: string) {
  return response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

const MarkdownRenderer = ({ content }: { content: string }) => (
  <div className="prose-chat text-[15px] leading-relaxed text-slate-700">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match;
          return isInline ? (
            <code className="rounded bg-blue-50 px-1 py-0.5 text-sm text-blue-900" {...props}>
              {children}
            </code>
          ) : (
            <SyntaxHighlighter
              style={oneLight}
              language={match[1]}
              PreTag="div"
              className="rounded-lg !my-2"
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default function HealthXAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [modelOptions, setModelOptions] = useState<ModelOption[]>(fallbackModels);
  const [model, setModel] = useState(fallbackModels[0].id);
  const [ollamaConnected, setOllamaConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const installedModels = modelOptions.filter((option) => option.description === "Installed locally");
  const hasInstalledModels = installedModels.length > 0;
  const selectedModel = modelOptions.find((option) => option.id === model);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    fetch("/api/ollama/models")
      .then((res) => res.json())
      .then((data) => {
        setOllamaConnected(Boolean(data.connected));
        if (data.models?.length) {
          const installed = data.models.map((entry: ModelOption) => ({
            id: entry.id,
            name: entry.name,
            description: "Installed locally",
          }));
          setModelOptions(installed);
          setModel(installed[0].id);
        }
      })
      .catch(() => setOllamaConnected(false));
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    const isPdf =
      selectedFile &&
      (selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf"));

    if (isPdf && selectedFile) {
      setFile(selectedFile);
      setPdfStatus(null);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const convertFileToBase64 = (uploadedFile: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(uploadedFile);
    });

  const startChat = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setPdfStatus(file ? "Reading document (OCR may run for scanned PDFs)…" : null);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    try {
      const pdfBase64 = file ? await convertFileToBase64(file) : null;

      const response = await fetch("/api/ragchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          modelSelected: model,
          pdf: pdfBase64,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Request failed (${response.status})`);
      }

      if (result.pdfMeta?.usedOcr) {
        setPdfStatus(`Scanned PDF detected — read ${result.pdfMeta.charCount} characters via OCR.`);
      } else if (result.pdfMeta?.charCount) {
        setPdfStatus(`Document loaded (${result.pdfMeta.charCount} characters).`);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: extractValidInformation(extractMessage(result.text)),
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
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startChat(input);
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
    setPdfStatus(null);
    inputRef.current?.focus();
  };

  const removeFile = () => {
    setFile(null);
    setPdfStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_#dbeafe,_#f8fafc_45%,_#ede9fe)] text-slate-800">
      <div className="mx-auto flex h-screen max-w-7xl flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full shrink-0 flex-col gap-4 lg:w-80"
        >
          <div className="rounded-3xl border border-blue-100/80 bg-white/80 p-5 shadow-sm backdrop-blur-md">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 p-3 shadow-md shadow-blue-200">
                <Cross className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-blue-700 to-violet-700 bg-clip-text text-2xl font-bold text-transparent">
                  HealthXAI
                </h1>
                <p className="text-xs text-slate-500">Local AI medical assistant</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-800">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Model
                </label>
                <select
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className="w-full rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {modelOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {selectedModel && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {selectedModel.description}
                  </p>
                )}
                {!hasInstalledModels && ollamaConnected && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-relaxed text-amber-900">
                    <p className="font-semibold">No models installed yet</p>
                    <p className="mt-1">In a new terminal, run:</p>
                    <code className="mt-1 block rounded bg-white/80 px-2 py-1 font-mono text-[11px]">
                      ollama pull {model}
                    </code>
                  </div>
                )}
                {ollamaConnected === false && (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-800">
                    Ollama is not reachable. Run <code className="font-mono">ollama serve</code> first.
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-800">
                  <FileText className="h-3.5 w-3.5" />
                  PDF Context
                  <span className="font-normal normal-case text-slate-400">(optional)</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
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
                      onClick={removeFile}
                      className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-red-500"
                      aria-label="Remove PDF"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {file && pdfStatus && (
                  <p className="mt-2 text-xs text-emerald-700">{pdfStatus}</p>
                )}
                {file && !pdfStatus && (
                  <p className="mt-2 text-xs text-slate-500">
                    Scanned PDFs are supported via OCR (first message may take longer).
                  </p>
                )}
              </div>
            </div>
          </div>

          {(ollamaConnected === false || !hasInstalledModels) && (
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
          )}

          <div className="rounded-3xl border border-blue-100/80 bg-white/70 p-5 shadow-sm backdrop-blur-md">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Stethoscope className="h-4 w-4 text-violet-500" />
              How it works
            </h2>
            <ol className="space-y-2.5 text-sm text-slate-600">
              {[
                "Choose a local Ollama model",
                "Optionally attach a PDF for context",
                "Ask your health question below",
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <p className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-xs leading-relaxed text-amber-900">
            Not a substitute for professional medical advice. Always consult a licensed healthcare provider.
          </p>
        </motion.aside>

        {/* Chat */}
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
                onClick={clearChat}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                New chat
              </button>
            )}
          </div>

          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
            {messages.length === 0 && !loading && (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 p-4">
                  <Bot className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-800">
                  What would you like to know?
                </h3>
                <p className="mb-6 max-w-md text-sm text-slate-500">
                  Ask a health question or upload a PDF lab report, prescription, or medical document for contextual answers.
                </p>
                <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => startChat(prompt)}
                      className="group flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <span>{prompt}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-blue-400 opacity-0 transition group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={`${index}-${message.role}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[88%] items-start gap-3 rounded-2xl px-4 py-3 sm:max-w-[80%] ${
                      message.role === "user"
                        ? "border border-blue-200 bg-gradient-to-br from-blue-100 to-violet-100"
                        : message.role === "error"
                          ? "border border-red-200 bg-red-50"
                          : "border border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 rounded-full p-2 ${
                        message.role === "user"
                          ? "bg-blue-200/80"
                          : message.role === "error"
                            ? "bg-red-200/80"
                            : "bg-violet-200/80"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-blue-800" />
                      ) : message.role === "error" ? (
                        <AlertCircle className="h-4 w-4 text-red-700" />
                      ) : (
                        <Bot className="h-4 w-4 text-violet-800" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {message.role === "error" ? (
                        <p className="text-sm leading-relaxed text-red-800">{message.content}</p>
                      ) : (
                        <MarkdownRenderer content={message.content} />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                  </div>
                  <span className="text-sm text-blue-700">
                    {file
                      ? pdfStatus || "Reading document (OCR for scanned PDFs) and generating response..."
                      : "Generating response..."}
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-blue-100 bg-gradient-to-r from-blue-50/80 to-violet-50/50 px-4 py-4 sm:px-5"
          >
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Describe symptoms, ask about a condition, or reference your PDF..."
                disabled={loading}
                className="flex-1 rounded-xl border border-blue-200 bg-white px-4 py-3.5 text-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
              />
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.03 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                type="submit"
                disabled={loading || !input.trim() || !hasInstalledModels}
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
        </motion.main>
      </div>
    </div>
  );
}
