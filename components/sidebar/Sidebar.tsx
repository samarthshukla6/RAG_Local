import { motion } from "framer-motion";
import { AppHeader } from "./AppHeader";
import { ModelSelector } from "./ModelSelector";
import { PdfUploader } from "./PdfUploader";
import { TerminalSetup } from "./TerminalSetup";
import { HowItWorks } from "./HowItWorks";
import { Disclaimer } from "./Disclaimer";
import type { ModelOption } from "@/types/chat";

interface SidebarProps {
  model: string;
  modelOptions: ModelOption[];
  selectedModel?: ModelOption;
  connected: boolean | null;
  hasInstalledModels: boolean;
  file: File | null;
  pdfStatus: string | null;
  onModelChange: (id: string) => void;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

export function Sidebar({
  model,
  modelOptions,
  selectedModel,
  connected,
  hasInstalledModels,
  file,
  pdfStatus,
  onModelChange,
  onFileSelect,
  onFileRemove,
}: SidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full shrink-0 flex-col gap-4 lg:w-80"
    >
      <div className="rounded-3xl border border-blue-100/80 bg-white/80 p-5 shadow-sm backdrop-blur-md">
        <AppHeader />
        <div className="space-y-4">
          <ModelSelector
            model={model}
            modelOptions={modelOptions}
            selectedModel={selectedModel}
            connected={connected}
            hasInstalledModels={hasInstalledModels}
            onModelChange={onModelChange}
          />
          <PdfUploader
            file={file}
            pdfStatus={pdfStatus}
            onFileSelect={onFileSelect}
            onFileRemove={onFileRemove}
          />
        </div>
      </div>

      <TerminalSetup
        model={model}
        visible={connected === false || !hasInstalledModels}
      />

      <HowItWorks />
      <Disclaimer />
    </motion.aside>
  );
}
