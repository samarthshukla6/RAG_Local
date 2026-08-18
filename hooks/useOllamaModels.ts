"use client";

import { useEffect, useState } from "react";
import { FALLBACK_MODELS, INSTALLED_LABEL } from "@/constants/models";
import type { OllamaModelsResponse } from "@/types/api";
import type { ModelOption } from "@/types/chat";

export function useOllamaModels() {
  const [modelOptions, setModelOptions] = useState<ModelOption[]>(FALLBACK_MODELS);
  const [model, setModel] = useState(FALLBACK_MODELS[0].id);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      setLoading(true);
      try {
        const res = await fetch("/api/ollama/models");
        const data: OllamaModelsResponse = await res.json();
        if (cancelled) return;

        setConnected(Boolean(data.connected));

        if (data.models?.length) {
          const installed = data.models.map((entry) => ({
            id: entry.id,
            name: entry.name,
            description: INSTALLED_LABEL,
          }));
          setModelOptions(installed);
          setModel(installed[0].id);
        }
      } catch {
        if (!cancelled) setConnected(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadModels();
    return () => {
      cancelled = true;
    };
  }, []);

  const installedModels = modelOptions.filter((m) => m.description === INSTALLED_LABEL);
  const hasInstalledModels = installedModels.length > 0;
  const selectedModel = modelOptions.find((m) => m.id === model);

  return {
    model,
    setModel,
    modelOptions,
    connected,
    loading,
    hasInstalledModels,
    selectedModel,
  };
}
