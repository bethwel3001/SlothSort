import { Agent } from "@mastra/core/agent";

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma:2b";

const SYSTEM_PROMPT =
  "You are a file sorting assistant. I will give you a filename. You must reply with exactly ONE word representing the best folder category from this list: Documents, Images, Finances, Code, or Trash. Do not say anything else.";

export type Category = "Documents" | "Images" | "Finances" | "Code" | "Trash";

const ALLOWED_CATEGORIES: Category[] = [
  "Documents",
  "Images",
  "Finances",
  "Code",
  "Trash",
];

/**
 * Heuristic fallback if local Ollama instance is not reachable
 */
export function heuristicCategory(filename: string): Category {
  const lower = filename.toLowerCase();

  // Finances
  if (
    lower.includes("invoice") ||
    lower.includes("tax") ||
    lower.includes("receipt") ||
    lower.includes("finan") ||
    lower.includes("budget") ||
    lower.includes("payroll") ||
    lower.includes("expense") ||
    lower.includes("bill")
  ) {
    return "Finances";
  }

  // Images
  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".svg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".fig") ||
    lower.includes("screenshot") ||
    lower.includes("photo") ||
    lower.includes("diagram")
  ) {
    return "Images";
  }

  // Code
  if (
    lower.endsWith(".ts") ||
    lower.endsWith(".tsx") ||
    lower.endsWith(".js") ||
    lower.endsWith(".jsx") ||
    lower.endsWith(".py") ||
    lower.endsWith(".rs") ||
    lower.endsWith(".go") ||
    lower.endsWith(".html") ||
    lower.endsWith(".css") ||
    lower.endsWith(".json") ||
    lower.endsWith(".sh") ||
    lower.endsWith(".sql")
  ) {
    return "Code";
  }

  // Trash
  if (
    lower.includes("temp") ||
    lower.includes("junk") ||
    lower.includes("trash") ||
    lower.endsWith(".tmp") ||
    lower.endsWith(".bak") ||
    lower.startsWith("~$")
  ) {
    return "Trash";
  }

  // Default to Documents
  return "Documents";
}

/**
 * Clean & match raw LLM output to strictly one of the allowed categories
 */
export function cleanCategory(rawText: string, filenameFallback?: string): Category {
  const sanitized = rawText
    .trim()
    .replace(/^[^a-zA-Z]+/, "")
    .replace(/[^a-zA-Z]+$/, "");

  for (const cat of ALLOWED_CATEGORIES) {
    if (new RegExp(`^${cat}$`, "i").test(sanitized)) {
      return cat;
    }
  }

  const lower = sanitized.toLowerCase();
  if (lower.includes("financ")) return "Finances";
  if (lower.includes("imag") || lower.includes("photo") || lower.includes("pic")) return "Images";
  if (lower.includes("code") || lower.includes("dev") || lower.includes("script")) return "Code";
  if (lower.includes("trash") || lower.includes("junk") || lower.includes("delete")) return "Trash";
  if (lower.includes("doc")) return "Documents";

  return filenameFallback ? heuristicCategory(filenameFallback) : "Documents";
}

/**
 * Custom LanguageModel connecting to the local Ollama instance
 */
const ollamaGemmaModel = {
  specificationVersion: "v2" as const,
  provider: "ollama",
  modelId: OLLAMA_MODEL,
  supportedUrls: [] as string[],
  async doGenerate({ prompt }: { prompt?: any }) {
    let userPrompt = "";
    if (typeof prompt === "string") {
      userPrompt = prompt;
    } else if (Array.isArray(prompt)) {
      const lastMsg = prompt[prompt.length - 1];
      userPrompt =
        typeof lastMsg?.content === "string"
          ? lastMsg.content
          : JSON.stringify(lastMsg?.content || "");
    }

    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          system: SYSTEM_PROMPT,
          prompt: userPrompt,
          stream: false,
          options: {
            temperature: 0.1,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const data = await response.json();
      const outputText = data.response?.trim() || "";

      return {
        content: [{ type: "text" as const, text: outputText }],
        finishReason: "stop" as const,
        usage: { promptTokens: 0, completionTokens: 0 },
      };
    } catch (err) {
      console.warn(
        `[SlothSort Agent] Local Ollama (${OLLAMA_BASE_URL}) not accessible, using heuristic:`,
        err instanceof Error ? err.message : err
      );

      const fallbackCat = heuristicCategory(userPrompt);
      return {
        content: [{ type: "text" as const, text: fallbackCat }],
        finishReason: "stop" as const,
        usage: { promptTokens: 0, completionTokens: 0 },
      };
    }
  },
};

/**
 * Basic Mastra Agent for file categorization
 */
export const fileSortingAgent = new Agent({
  id: "file-sorting-assistant",
  name: "File Sorting Assistant",
  instructions: SYSTEM_PROMPT,
  model: ollamaGemmaModel as any,
});

/**
 * Helper to categorize a filename using the Mastra Agent
 */
export async function categorizeFilename(filename: string): Promise<Category> {
  try {
    const result = await fileSortingAgent.generate(filename);
    const raw = result.text || "";
    return cleanCategory(raw, filename);
  } catch (error) {
    console.warn(`[SlothSort Agent] Agent generate failed for ${filename}, applying heuristic fallback:`, error);
    return heuristicCategory(filename);
  }
}
