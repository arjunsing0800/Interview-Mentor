import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { callGroq, corsResponse, handleOptions, GroqError } from '../_shared/groq.ts'

const SYSTEM_PROMPT = `You are a professional AI interviewer conducting an adaptive interview.

Rules:
- Generate the NEXT question based on the candidate's previous answer
- Do NOT repeat previous questions
- If the candidate gave a strong answer, ask a deeper follow-up
- If the candidate gave a weak/incomplete answer, ask a clarifying question
- If the candidate made a mistake, test their understanding
- If the candidate was vague, ask for a concrete example
- Adapt difficulty based on performance
- Be concise — do NOT explain or comment between questions
- Your output MUST be valid JSON matching the schema below

Response schema:
{
  "question": "Your next interview question",
  "topic": "The topic this question covers",
  "difficulty": "easy|medium|hard",
  "reason": "Brief reason for this question (1 sentence)",
  "followUp": true|false
}`

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST') {
    return corsResponse(405, { error: 'Method not allowed' })
  }

  try {
    const body = await req.json()
    const {
      interviewType,
      role,
      topic,
      difficulty,
      questionNumber,
      previousQuestions,
      transcript,
      lastAnswer,
    } = body

    const transcriptSummary = (transcript || [])
      .map((e: { speaker: string; text: string }) => `${e.speaker === 'ai' ? 'Interviewer' : 'Candidate'}: ${e.text}`)
      .join('\n')

    const userMessage = `Generate question #${(questionNumber || 0) + 1} for this interview.

Interview type: ${interviewType || 'technical'}
Role: ${role || 'Not specified'}
Current difficulty: ${difficulty || 'medium'}
Previous questions: ${JSON.stringify(previousQuestions || [])}
${lastAnswer ? `Candidate's last answer: "${lastAnswer}"` : 'No previous answers yet.'}
${transcriptSummary ? `\nFull transcript so far:\n${transcriptSummary}` : ''}

Generate the next interview question.`

    const result = await callGroq({
      system: SYSTEM_PROMPT,
      user: userMessage,
      temperature: 0.5,
      maxTokens: 512,
    })

    return corsResponse(200, {
      success: true,
      question: result.question || "Can you tell me about a challenging project you've worked on?",
      questionNumber: (questionNumber || 0) + 1,
      topic: result.topic || topic || 'general',
      difficulty: result.difficulty || difficulty || 'medium',
      followUp: result.followUp ?? false,
    })
  } catch (err) {
    if (err instanceof GroqError) {
      console.error(`[next-question] Groq error: ${err.code} — ${err.message}`)
    } else {
      console.error('[next-question] Unexpected error:', err)
    }
    return corsResponse(200, {
      success: false,
      error: err instanceof GroqError ? err.code : 'internal_error',
      question: "Can you tell me about a challenging problem you've solved recently?",
      questionNumber: 1,
      topic: 'general',
      difficulty: 'medium',
      followUp: false,
    })
  }
})
