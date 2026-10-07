/* ------------------------------------------------------------------ */
/*  Central configuration for the local Ollama intelligence layer    */
/*                                                                   */
/*  Local Ollama is the PRIMARY intelligence engine. The existing    */
/*  Groq/Supabase path is preserved as an opt-in fallback (see       */
/*  ../interview/api.ts). No UI/visual code depends on this file.    */
/* ------------------------------------------------------------------ */

function cleanEnv(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim().replace(/\/+$/, '')
  return trimmed.length > 0 ? trimmed : undefined
}

export const ollamaConfig = {
  /** Ollama base URL (browser must reach it; CORS preflight verified). */
  host: cleanEnv(import.meta.env.VITE_OLLAMA_HOST) || 'http://localhost:11434',
  /** Local model — must be pulled via `ollama pull <model>`. */
  model: cleanEnv(import.meta.env.VITE_OLLAMA_MODEL) || 'qwen3:1.7b',
  /** Local inference can be slower than cloud; fail honestly, not silently. */
  timeoutMs: 75_000,
  temperature: {
    start: 0.5,
    evaluate: 0.3,
    final: 0.2,
  },
  maxTokens: {
    start: 512,
    evaluate: 800,
    final: 1200,
  },
  /** One structured-output retry before falling back to Groq/honest error. */
  maxAttempts: 2,
} as const
