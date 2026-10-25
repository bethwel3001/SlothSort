# 🦥 SlothSort

SlothSort is a local, privacy-first AI agent that automatically organizes cluttered folders and messy download directories into clean, structured categories using local large language models.

## Tech Stack & Tools

- **Framework**: Next.js (App Router, React 19)
- **Styling**: Tailwind CSS (Mainstack-inspired minimalist black-and-white design)
- **Icons**: Lucide React
- **Agent Framework**: Mastra Agent Framework
- **Local LLM**: Google Gemma 2B via Ollama
- **Monitoring & Tracing**: Sentry Next.js SDK with custom AI inference spans

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/bethwel3001/SlothSort.git
cd SlothSort
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start local Ollama instance with Gemma 2B

Ensure Ollama is installed on your system, then pull and run Gemma 2B:

```bash
ollama run gemma:2b
```

By default, Ollama serves requests locally at `http://127.0.0.1:11434`.

### 4. Configure environment variables (optional)

Create a `.env.local` file in the root directory if you want to connect Sentry or customize the Ollama endpoint:

```env
# Sentry DSN for performance tracing
NEXT_PUBLIC_SENTRY_DSN=https://your-public-key@o0.ingest.sentry.io/0

# Ollama Configuration (defaults to http://127.0.0.1:11434 and gemma:2b)
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma:2b
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tweaks & Customization

### Changing the Target Directory

By default, SlothSort monitors and sorts files inside `./target_folder` located at the project root. You can customize this path by editing the `TARGET_DIR` constant in:
- `app/api/files/route.ts`
- `app/api/sort/route.ts`
- `scripts/generate-dummy-files.js`

### Customizing Folder Categories

To modify or add destination categories:
1. Update `SYSTEM_PROMPT` and `ALLOWED_CATEGORIES` in `lib/agent.ts` with your desired folders (for example: `Archive`, `Projects`, `Media`, `Receipts`).
2. Update the heuristic categorization rules in `lib/agent.ts` to match your new categories.

## Troubleshooting

- **Ollama connection errors (`ECONNREFUSED`)**: Make sure Ollama is running in your terminal (`ollama serve` or `ollama run gemma:2b`). If Ollama is unreachable, SlothSort automatically falls back to local heuristic categorization so sorting never breaks.
- **Model not found**: Run `ollama list` to verify that `gemma:2b` is available locally. If missing, pull it with `ollama pull gemma:2b`.
- **Sentry DSN issues**: If you see telemetry initialization warnings, verify that your DSN in `.env.local` matches the format provided in your Sentry project settings. When omitted, placeholder DSNs prevent runtime exceptions.
- **Port 3000 already in use**: Start the Next.js server on an alternative port with `npm run dev -- -p 3001`.

## Alternatives

- **Agent Orchestration**: You can swap the Mastra Agent Framework for alternatives such as LangChain.js, LlamaIndex.ts, or the Vercel AI SDK.
- **Local Models**: You can replace Google Gemma 2B with other compact local models in Ollama, such as Meta Llama 3.2 (1B or 3B), Mistral 7B, or Microsoft Phi-3 Mini.
- **Tracing**: Sentry spans can be paired with or swapped for OpenTelemetry collectors, Langfuse, or Helicone for specialized LLM observability.
