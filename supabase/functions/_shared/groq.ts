/* ------------------------------------------------------------------ */
/*  Shared Groq helper for Supabase Edge Functions                    */
/* ------------------------------------------------------------------ */

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'
const DEFAULT_MODEL = 'openai/gpt-oss-120b'
const TIMEOUT_MS = 30_000

/* ---- CORS helpers ---- */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function corsResponse(status: number, body?: unknown): Response {
  return new Response(body !== undefined ? JSON.stringify(body) : null, {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: corsHeaders })
}

/* ---- JSON extraction ---- */
function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Failed to parse JSON from Groq response')
  }
}

/* ---- Groq API call ---- */
interface CallGroqOptions {
  system: string
  user: string
  temperature?: number
  maxTokens?: number
  model?: string
}

export async function callGroq<T = Record<string, unknown>>(
  options: CallGroqOptions,
): Promise<T> {
  const apiKey = Deno.env.get('GROQ_API_KEY')
  if (!apiKey) {
    throw new GroqError(500, 'GROQ_API_KEY not configured', 'config_error')
  }

  const {
    system,
    user,
    temperature = 0.4,
    maxTokens = 1024,
    model = DEFAULT_MODEL,
  } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      throw mapGroqError(res.status, errBody)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new GroqError(502, 'Empty response from Groq', 'empty_response')

    return extractJson(content) as T
  } catch (err) {
    if (err instanceof GroqError) throw err
    if (err.name === 'AbortError') {
      throw new GroqError(408, 'Groq API request timed out', 'timeout')
    }
    throw new GroqError(502, `Groq request failed: ${err.message}`, 'network_error')
  } finally {
    clearTimeout(timer)
  }
}

/* ---- Error types ---- */
export class GroqError extends Error {
  status: number
  code: string
  constructor(status: number, message: string, code: string) {
    super(message)
    this.name = 'GroqError'
    this.status = status
    this.code = code
  }
}

function mapGroqError(status: number, body: string): GroqError {
  const detail = body.slice(0, 200)
  switch (status) {
    case 400:
      return new GroqError(400, `Bad request: ${detail}`, 'bad_request')
    case 401:
      return new GroqError(401, 'Invalid or missing Groq API key', 'auth_error')
    case 403:
      return new GroqError(403, 'Groq API access forbidden', 'forbidden')
    case 429:
      return new GroqError(429, 'Rate limit exceeded — try again soon', 'rate_limit')
    case 502:
      return new GroqError(502, 'Groq upstream error', 'upstream_error')
    case 503:
      return new GroqError(503, 'Groq service unavailable', 'unavailable')
    default:
      return new GroqError(status, `Groq API error ${status}: ${detail}`, 'api_error')
  }
}
