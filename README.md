# AI Research Summarizer + RAG Chat 🚀

Turn dense research papers into bite‑size insights in seconds — then ask follow‑up questions powered by a tiny RAG system. Built for hackathon speed, demo‑ready polish, and real usefulness.

Preview (drop your own PDF/TXT!)

- Demo GIF/Screenshot (placeholder): `docs/demo.gif`

## ✨ Why It Rocks (Hackathon Pitch)

- ⚡ Instant value: upload → Summary, Key Points, ELI5, Action Items
- 🧠 Actually useful: ask questions grounded in your paper with RAG
- 🧭 Friendly UX: copy, download Markdown, quick “Learn More” links
- 🔧 Simple stack: Flask + React + Gemini; easy to run and extend

## ✅ Features

- Summary: clear 2–3 paragraph overview
- Key Points: concise bullets for skimming
- ELI5: explain like I’m 5, in plain language
- Action Items: concrete, imperative takeaways
- Learn More: YouTube/StackOverflow/GfG/Wikipedia links seeded from results
- Copy/Download: one‑click copy or export to Markdown
- RAG Chat: asks Gemini with top‑k chunks from your doc (+ optional refs)

## ⏱️ 60‑Second Demo

- One‑time setup
  - Windows: `powershell -ExecutionPolicy Bypass -File scripts/setup.ps1`
  - macOS/Linux: `bash scripts/setup.sh`
- Start both
  - Windows: `powershell -ExecutionPolicy Bypass -File scripts/start.ps1`
  - macOS/Linux: `bash scripts/start.sh`
- Open the Vite URL → upload a PDF/TXT → read results → switch to Chat → ask questions

## 🛠️ Run Locally

- Backend
  - Windows: `cd backend && ./.venv/Scripts/Activate.ps1 && python app.py`
  - macOS/Linux: `cd backend && source .venv/bin/activate && python app.py`
- Frontend
  - `cd frontend && npm run dev`

## ⚙️ Configuration

- Backend: create `backend/.env` → `GEMINI_API_KEY=...` (Google AI Studio key)
- Frontend (optional): `frontend/.env` → `VITE_API_BASE_URL=http://127.0.0.1:5000`

## 🧩 How It Works

1) Upload a `.pdf` or `.txt` to `/api/summarize` (PDFs parsed via PyMuPDF)
   - Conservatively skip obvious cover/permission pages on the first 1–2 pages; fall back to all pages if filtering would remove everything
2) Call Gemini to produce strict‑JSON sections: `summary`, `key_points`, `eli5`, `action_items`
3) Chunk + embed your paper (`text-embedding-004`) into an in‑memory index; best‑effort fetch reference URLs/DOIs to extend the index
4) `/api/ask` retrieves the most relevant chunks and asks Gemini to answer using only those sources → answer + simple source tags

## 🧱 Tech Stack

- Backend: Flask, flask‑cors, python‑dotenv, PyMuPDF, requests, Gemini (Google Generative Language API)
- Frontend: React + Vite

## 🔌 API (with cURL)

- Health: `GET /api/health`
  - `curl http://127.0.0.1:5000/api/health`

- Summarize: `POST /api/summarize` (multipart `file`)
  - `curl -F file=@/path/paper.pdf http://127.0.0.1:5000/api/summarize`
  - Returns JSON: `summary`, `key_points[]`, `eli5`, `action_items[]`, optionally `references_used[]`

- Ask: `POST /api/ask` (JSON)
  - `curl -H "Content-Type: application/json" -d '{"question":"What is the main contribution?"}' http://127.0.0.1:5000/api/ask`
  - Returns: `{ "answer": string, "sources": string[] }`

## 🧠 Architecture (Tiny RAG)

- Upload → Parse (PyMuPDF/UTF‑8) → Chunk (+overlap) → Embed (Gemini) → In‑memory index
- Ask → Embed Q → Retrieve top‑k → Compose prompt with sources → Gemini → Answer + source tags

## 🧪 Judging Cheat‑Sheet

- Innovation: lightweight RAG + summarization pipeline with reference augmentation
- Impact: turns hours of reading into minutes; great for literature reviews
- Polish: fast setup scripts, clean UI, copy/download, friendly errors, fallback parsing

## 🛟 Troubleshooting

- “Could not summarize document”
  - Check the backend console. If a PDF has boilerplate on every page (e.g., some IEEE exports), we now fall back to parsing all pages
- 400 “Unsupported file type”
  - Only `.pdf` and `.txt` are supported by `/api/summarize`
- Missing `GEMINI_API_KEY`
  - You’ll still get a 200 with placeholder content; add a valid key for real summaries
- CORS or wrong URL
  - Frontend defaults to `http://127.0.0.1:5000`. Override via `frontend/.env`

## 🗺️ Roadmap (Nice‑To‑Haves)

- Snippet‑level citations with hover previews
- Chunk viewer + relevance scores
- Streaming chat responses
- Multi‑document workspaces and persistence

## 💙 Team / Credits

- Current direction: evolving toward a C++-based RAG implementation

