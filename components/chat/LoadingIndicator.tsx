import { motion } from "framer-motion";

interface LoadingIndicatorProps {
  label: string;
}

export function LoadingIndicator({ label }: LoadingIndicatorProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
      <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
        </div>
        <span className="text-sm text-blue-700">{label}</span>
      </div>
    </motion.div>
  );
}
