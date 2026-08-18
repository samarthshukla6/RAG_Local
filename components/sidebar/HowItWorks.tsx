import { Stethoscope } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "@/constants/prompts";

export function HowItWorks() {
  return (
    <div className="rounded-3xl border border-blue-100/80 bg-white/70 p-5 shadow-sm backdrop-blur-md">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Stethoscope className="h-4 w-4 text-violet-500" />
        How it works
      </h2>
      <ol className="space-y-2.5 text-sm text-slate-600">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <li key={step} className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
