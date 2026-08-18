# HealthXAI — Local RAG Medical Assistant

A Next.js app for medical Q&A powered by **local Ollama models**, with optional **PDF context** (text-based and scanned via OCR).

## Features

- Chat with local Ollama models (llama3.2, DeepSeek, etc.)
- Upload PDFs for document-grounded answers
- Automatic OCR for scanned/image PDFs (Tesseract.js)
- Auto-detects installed Ollama models
- In-app setup hints when Ollama isn't running

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Ollama](https://ollama.com/)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Ollama (separate terminal)
ollama serve

# 3. Pull a model
ollama pull llama3.2

# 4. Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.copy` to `.env` and add any API keys if using optional routes (Pinecone, Google AI, etc.). The main chat flow only requires Ollama.

## Scripts

| Command        | Description          |
|----------------|----------------------|
| `npm run dev`  | Start dev server     |
| `npm run build`| Production build     |
| `npm run start`| Start production     |
| `npm run lint` | Run ESLint           |

## Disclaimer

Not a substitute for professional medical advice. Always consult a licensed healthcare provider.
