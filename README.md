# HealthXAI — Local RAG Medical Assistant

Next.js app for medical Q&A with **local Ollama models** and optional **PDF context** (text + OCR for scanned documents).

## Stack

- **Next.js 16** · **React 19** · **TypeScript**
- **Tailwind CSS v4**
- **Ollama** + LangChain Ollama integration
- **pdf-parse** + **Tesseract.js** for document extraction

## Project structure

```
app/
  layout.tsx          # Root layout
  page.tsx            # Main page (thin shell)
  api/
    ollama/models/    # List installed models
    ragchat/          # Chat + PDF RAG endpoint
components/
  chat/               # Chat UI components
  sidebar/            # Model selector, PDF upload, setup
hooks/
  useChat.ts          # Chat state & API calls
  useOllamaModels.ts  # Model discovery
lib/
  ai/                 # Ollama client, prompts, config
  pdf/                # PDF text extraction + OCR
  utils/              # Shared helpers
types/                # Shared TypeScript types
constants/            # Static config & prompts
```

## Setup

```bash
npm install
ollama serve              # separate terminal
ollama pull llama3.2
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Environment

Optional: set `OLLAMA_BASE_URL` (default `http://127.0.0.1:11434`).

## Disclaimer

Not a substitute for professional medical advice. Always consult a licensed healthcare provider.
