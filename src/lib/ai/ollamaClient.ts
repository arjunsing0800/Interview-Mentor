/* ------------------------------------------------------------------ */
/*  Minimal Ollama chat client (browser → local Ollama, JSON mode).  */
/*  No secrets: the local daemon needs no API key and interview      */
/*  data never leaves the machine on this path.                      */
/* ------------------------------------------------------------------ */

import { ollamaConfig } from './config'

export type OllamaErrorCode =
  | 'unavailable'
  | 'timeout'
  | 'model_error'
  | 'empty_response'
  | 'parse_error'

export class OllamaError extends Error {
  code: OllamaErrorCode
  constructor(code: OllamaErrorCode, message: string) {
    super(message)
    this.name = 'OllamaError'
    this.code = code
  }
}

interface ChatJsonOptions {
  system: string
  user: string
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
}

/** Extract the first JSON object from model text (strips fences/thinking). */
export function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new OllamaError('parse_error', 'Model did not return valid JSON')
  }
}

function readContent(data: unknown): string {
  if (typeof data !== 'object' || data === null) return ''
  const message = (data as { message?: unknown }).message
  if (typeof message !== 'object' || message === null) return ''
  const content = (message as { content?: unknown }).content
  return typeof content === 'string' ? content : ''
}

/**
 * Single non-streaming chat completion constrained to a JSON object.
 * Throws OllamaError — never returns fabricated data.
 */
export async function chatJSON<T>(options: ChatJsonOptions): Promise<T> {
  const {
    system,
    user,
    temperature = 0.3,
    maxTokens = 800,
    timeoutMs = ollamaConfig.timeoutMs,
  } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(`${ollamaConfig.host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaConfig.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        stream: false,
        format: 'json',
        think: false,
        options: { temperature, num_predict: maxTokens },
      }),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new OllamaError('timeout', `Local AI timed out after ${timeoutMs}ms`)
    }
    throw new OllamaError(
      'unavailable',
      'Local AI is not reachable. Start it with `ollama serve` and pull the model.',
    )
  }
  clearTimeout(timer)

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new OllamaError('model_error', `Local AI error ${res.status}: ${body.slice(0, 200)}`)
  }

  const data: unknown = await res.json().catch(() => null)
  const content = readContent(data)
  if (!content.trim()) {
    throw new OllamaError('empty_response', 'Local AI returned an empty response')
  }
  return extractJson(content) as T
}
