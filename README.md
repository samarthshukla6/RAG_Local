# HealthXAI

**HealthXAI** is a privacy-first, local AI medical assistant web app. It runs entirely on your machine using [Ollama](https://ollama.com) — no cloud API keys required for chat. Upload a medical PDF (lab report, prescription, discharge summary) and ask questions grounded in that document.

![HealthXAI dashboard](https://github.com/user-attachments/assets/202c1b88-5211-4735-81d1-ad41a308a0a8)

> **Live demo:** [rag-local-samarth-shuklas-projects-ea712626.vercel.app](https://rag-local-samarth-shuklas-projects-ea712626.vercel.app)  
> **Repository:** [github.com/samarthshukla6/RAG_Local](https://github.com/samarthshukla6/RAG_Local)

> **Note:** The deployed demo hosts the UI only. Chat and PDF RAG require Ollama running on your machine (`npm run dev` locally) or a remote Ollama server with `OLLAMA_BASE_URL` set in Vercel.

---

## What it does

| Feature | Description |
|---------|-------------|
| **Local LLM chat** | Talk to any Ollama model installed on your machine (Llama 3.2, DeepSeek, Gemma, etc.) |
| **PDF RAG** | Attach a PDF and ask questions — the model answers using extracted document text |
| **Scanned PDF OCR** | Image-only PDFs are automatically processed with Tesseract OCR |
| **Model auto-discovery** | Detects installed Ollama models on startup |
| **Setup guidance** | In-app hints for `ollama serve` and `ollama pull` when not configured |
| **Markdown responses** | AI replies render with syntax highlighting and GFM support |

### UI overview

- **Sidebar** — model picker, optional PDF upload, terminal setup steps, disclaimer
- **Chat panel** — suggested prompts, message history, streaming-style loading states
- **Error handling** — clear messages for missing models, unreachable Ollama, or unreadable PDFs

---

## Tech stack

### Frontend

| Technology | Version | Role |
|------------|---------|------|
| [Next.js](https://nextjs.org) | 16 | App Router, API routes, SSR |
| [React](https://react.dev) | 19 | UI framework |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Type-safe codebase (strict mode) |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first styling (CSS-first config) |
| [Framer Motion](https://www.framer.com/motion) | 13 | Page and message animations |
| [Lucide React](https://lucide.dev) | 1.x | Icons |
| [React Markdown](https://github.com/remarkjs/react-markdown) | 10 | Render AI responses |
| [remark-gfm](https://github.com/remarkjs/remark-gfm) | 4 | GitHub-flavored markdown |
| [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) | 16 | Code blocks in responses |

### Backend / AI

| Technology | Role |
|------------|------|
| [Ollama](https://ollama.com) | Local LLM runtime (Llama, DeepSeek, etc.) |
| Ollama HTTP API | Direct `/api/generate` streaming (no cloud SDK) |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse) | PDF text extraction (pdf.js under the hood) |
| [Tesseract.js](https://tesseract.projectnaptha.com) | OCR for scanned/image PDFs |
| [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | REST API (`/api/ragchat`, `/api/ollama/models`) |

### Tooling

| Tool | Role |
|------|------|
| ESLint 9 (flat config) | Linting with `eslint-config-next` |
| Turbopack / Webpack | Turbopack for dev; Webpack for production builds (Vercel) |
| GitHub Actions | CI — typecheck, lint, build |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (React)                       │
│  page.tsx → Sidebar + ChatPanel                             │
│  hooks: useOllamaModels, useChat                            │
└──────────────┬──────────────────────────┬───────────────────┘
               │ GET /api/ollama/models    │ POST /api/ragchat
               ▼                           ▼
┌──────────────────────────┐  ┌───────────────────────────────┐
│  lib/ai/ollama.ts        │  │  app/api/ragchat/route.ts     │
│  → Ollama /api/tags      │  │  → lib/pdf/extractPdfText.ts  │
└──────────────────────────┘  │  → lib/ai/ollama.ts (stream)  │
                               └───────────────┬───────────────┘
                                               ▼
                               ┌───────────────────────────────┐
                               │  Ollama (localhost:11434)     │
                               └───────────────────────────────┘
```

### RAG pipeline (PDF + chat)

1. User uploads a PDF in the sidebar (optional).
2. On send, the PDF is base64-encoded and posted to `/api/ragchat`.
3. **Text extraction** — `pdf-parse` reads selectable text from the PDF.
4. **OCR fallback** — if extracted text is under 80 characters (scanned doc), pages are rendered to images and processed with Tesseract.js.
5. Document text is truncated to 12,000 characters and injected into the prompt under `DOCUMENT CONTENT`.
6. **Ollama** streams a response using a medical-assistant system prompt.
7. Response is cleaned (thinking tags stripped) and returned as JSON with optional `pdfMeta` (OCR used, char count).

### Prompt strategy

- **Without PDF** — general medical Q&A with a disclaimer to consult a licensed provider.
- **With PDF** — instructs the model that document content is already provided; must not ask the user to re-share the file.

---

## Project structure

```
RAG/
├── app/
│   ├── layout.tsx              # Root layout + metadata
│   ├── page.tsx                # Main page shell
│   ├── globals.css             # Tailwind v4 theme
│   └── api/
│       ├── ollama/models/route.ts   # List installed models
│       └── ragchat/route.ts         # Chat + PDF RAG
├── components/
│   ├── chat/                   # ChatPanel, MessageBubble, MarkdownRenderer, …
│   └── sidebar/                # ModelSelector, PdfUploader, TerminalSetup, …
├── hooks/
│   ├── useChat.ts              # Messages, PDF attach, API calls
│   └── useOllamaModels.ts      # Model discovery on mount
├── lib/
│   ├── ai/
│   │   ├── config.ts           # Ollama URL, context limits
│   │   ├── ollama.ts           # Model listing, streaming, errors
│   │   └── prompts.ts          # System prompts + context builder
│   ├── pdf/
│   │   ├── extractPdfText.ts   # Text extract + OCR pipeline
│   │   └── pdfParse.ts         # pdf.js worker configuration
│   └── utils/
│       ├── files.ts            # Base64 conversion, PDF validation
│       └── text.ts             # Response cleaning, truncation
├── types/                      # ChatMessage, API request/response types
├── constants/                  # Fallback models, suggested prompts
└── public/                     # Static assets (uploaded PDFs gitignored)
```

---

## API reference

### `GET /api/ollama/models`

Returns installed Ollama models and connection status.

```json
{
  "connected": true,
  "models": [{ "id": "llama3.2", "name": "llama3.2", "size": 2019393189 }]
}
```

### `POST /api/ragchat`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | yes | User's question |
| `modelSelected` | string | yes | Ollama model name |
| `pdf` | string | no | Base64-encoded PDF |

**Success (200):**

```json
{
  "text": "Based on your lab report…",
  "pdfMeta": { "usedOcr": false, "charCount": 3010 }
}
```

**Errors:** `400` (missing fields) · `422` (unreadable PDF) · `503` (Ollama unreachable / model missing)

---

## Getting started

### Prerequisites

- **Node.js** 20+ (22 recommended for CI parity)
- **Ollama** — [install guide](https://ollama.com/download)

### Install & run

```bash
git clone https://github.com/samarthshukla6/RAG_Local.git
cd RAG_Local
npm install

# Terminal 1 — start Ollama
ollama serve

# Terminal 2 — pull a model (first time only)
ollama pull llama3.2

# Terminal 3 — start the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env` (optional):

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Ollama server URL |

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build (Webpack) |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

---

## Recommended models

| Model | Size | Best for |
|-------|------|----------|
| `llama3.2` | ~2 GB | General medical Q&A (recommended) |
| `deepseek-r1:1.5b` | ~1 GB | Lightweight reasoning on low RAM |
| `gemma2:2b` | ~1.6 GB | Compact general assistant |

On Apple Silicon (M1/M2/M3), Ollama uses Metal GPU acceleration automatically.

---

## Privacy & limitations

- **All inference runs locally** — chat data and PDFs never leave your machine (unless you deploy to a remote server).
- **Not medical advice** — outputs are AI-generated and must not replace consultation with a licensed healthcare provider.
- **OCR accuracy** — scanned documents depend on image quality; text-based PDFs work best.
- **Context limit** — documents are truncated to ~12,000 characters to fit smaller local models.

---

## Deployment

**Live:** [https://rag-local-samarth-shuklas-projects-ea712626.vercel.app](https://rag-local-samarth-shuklas-projects-ea712626.vercel.app) (Vercel)

This app is designed for **local use** with Ollama on the same machine. The Vercel deployment serves the frontend and API routes, but Ollama defaults to `http://127.0.0.1:11434` — which only works when Ollama runs on the same host as the server (i.e. your laptop via `npm run dev`).

To enable chat on the live deployment:

1. Run Ollama on a reachable server (VPS, Railway, Fly.io, etc.).
2. Set `OLLAMA_BASE_URL` in Vercel → Project → Settings → Environment Variables.
3. Redeploy.

PDF/OCR processing adds cold-start time on serverless platforms. See `vercel.json` for function memory and timeout settings.

---

## License

Private project — see repository owner for usage terms.
