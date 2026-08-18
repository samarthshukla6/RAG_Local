"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useOllamaModels } from "@/hooks/useOllamaModels";
import { useChat } from "@/hooks/useChat";

export default function HomePage() {
  const {
    model,
    setModel,
    modelOptions,
    connected,
    hasInstalledModels,
    selectedModel,
  } = useOllamaModels();

  const {
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
  } = useChat(model, hasInstalledModels);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_#dbeafe,_#f8fafc_45%,_#ede9fe)] text-slate-800">
      <div className="mx-auto flex h-screen max-w-7xl flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
        <Sidebar
          model={model}
          modelOptions={modelOptions}
          selectedModel={selectedModel}
          connected={connected}
          hasInstalledModels={hasInstalledModels}
          file={file}
          pdfStatus={pdfStatus}
          onModelChange={setModel}
          onFileSelect={setFile}
          onFileRemove={removeFile}
        />
        <ChatPanel
          messages={messages}
          input={input}
          loading={loading}
          file={file}
          pdfStatus={pdfStatus}
          hasInstalledModels={hasInstalledModels}
          inputRef={inputRef}
          onInputChange={setInput}
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          onSendPrompt={sendMessage}
          onClearChat={clearChat}
        />
      </div>
    </div>
  );
}
