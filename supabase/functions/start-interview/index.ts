import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { callGroq, corsResponse, handleOptions, GroqError } from '../_shared/groq.ts'

const SYSTEM_PROMPT = `You are a professional AI interviewer. You conduct structured, realistic interviews.

Rules:
- Be professional, concise, and direct
- Ask ONE question at a time
- Adapt difficulty based on the interview type and role
- Never ask more than one question per response
- Your output MUST be valid JSON matching the schema below

Response schema:
{
  "greeting": "A brief professional greeting (1-2 sentences max)",
  "firstQuestion": "Your first interview question adapted to the role and type",
  "difficulty": "easy|medium|hard",
  "topic": "The main topic of the first question"
}`

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST') {
    return corsResponse(405, { error: 'Method not allowed' })
  }

  try {
    const body = await req.json()
    const { candidateName, interviewType, difficulty, role, topic } = body

    if (!candidateName || !interviewType) {
      return corsResponse(400, { error: 'candidateName and interviewType are required' })
    }

    const userMessage = `Start a new ${interviewType} interview.

Candidate: ${candidateName}
Role: ${role || 'Not specified'}
Topic: ${topic || 'Not specified'}
Difficulty: ${difficulty || 'medium'}

Generate a professional greeting and the first interview question.`

    const result = await callGroq({
      system: SYSTEM_PROMPT,
      user: userMessage,
      temperature: 0.5,
      maxTokens: 512,
    })

    return corsResponse(200, {
      success: true,
      greeting: result.greeting || `Hello ${candidateName}, welcome to your ${interviewType} interview. Let's begin.`,
      firstQuestion: result.firstQuestion || "Tell me about yourself and your background.",
      difficulty: result.difficulty || difficulty || 'medium',
      topic: result.topic || topic || 'general',
      interviewType,
    })
  } catch (err) {
    const fallbackName = 'Candidate'
    if (err instanceof GroqError) {
      console.error(`[start-interview] Groq error: ${err.code} — ${err.message}`)
      return corsResponse(err.status, {
        success: false,
        error: err.code,
        greeting: `Hello! Welcome to your interview. Let's get started.`,
        firstQuestion: "Tell me about yourself and your background.",
        difficulty: 'medium',
        topic: 'general',
      })
    }
    console.error('[start-interview] Unexpected error:', err)
    return corsResponse(500, {
      success: false,
      error: 'internal_error',
      greeting: `Hello! Welcome to your interview.`,
      firstQuestion: "Tell me about yourself.",
      difficulty: 'medium',
      topic: 'general',
    })
  }
})
