import { User, Bot, AlertCircle } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[88%] items-start gap-3 rounded-2xl px-4 py-3 sm:max-w-[80%] ${
          isUser
            ? "border border-blue-200 bg-gradient-to-br from-blue-100 to-violet-100"
            : isError
              ? "border border-red-200 bg-red-50"
              : "border border-slate-200 bg-slate-50"
        }`}
      >
        <div
          className={`mt-0.5 rounded-full p-2 ${
            isUser ? "bg-blue-200/80" : isError ? "bg-red-200/80" : "bg-violet-200/80"
          }`}
        >
          {isUser ? (
            <User className="h-4 w-4 text-blue-800" />
          ) : isError ? (
            <AlertCircle className="h-4 w-4 text-red-700" />
          ) : (
            <Bot className="h-4 w-4 text-violet-800" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {isError ? (
            <p className="text-sm leading-relaxed text-red-800">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
      </div>
    </div>
  );
}
