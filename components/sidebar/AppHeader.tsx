import { Cross } from "lucide-react";

export function AppHeader() {
  return (
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
  );
}
