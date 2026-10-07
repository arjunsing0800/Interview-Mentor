import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { callGroq, corsResponse, handleOptions, GroqError } from '../_shared/groq.ts'

const SYSTEM_PROMPT = `You are a professional interview evaluator and interviewer. You evaluate the candidate's answer AND generate the next question in a single response.

Evaluation criteria:
- correctness: factual accuracy of the answer
- relevance: how well the answer addresses the question
- depth: level of technical understanding shown
- reasoning: quality of reasoning and explanation
- clarity: communication quality and structure
- completeness: how thoroughly the answer covers the topic

Scoring:
- Be honest, not generous. Not every answer deserves a high score.
- 1-3: Poor — incorrect, irrelevant, or very vague
- 4-5: Below average — partially correct but lacking depth
- 6-7: Good — correct and reasonably detailed
- 8-9: Excellent — thorough, accurate, well-reasoned
- 10: Exceptional — outstanding depth, clarity, and insight

Next question generation:
- Based on the evaluation, decide if a follow-up is needed or move to the next topic
- If the answer was weak, consider a simpler or clarifying question
- If the answer was strong, increase difficulty or explore a new area
- Never repeat the same question

Your output MUST be valid JSON matching the schema below.

Response schema:
{
  "score": 7,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "feedback": "One sentence of constructive feedback",
  "nextQuestion": "Your next interview question",
  "nextDifficulty": "easy|medium|hard",
  "topic": "Topic of the next question",
  "shouldContinue": true
}`

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST') {
    return corsResponse(405, { error: 'Method not allowed' })
  }

  try {
    const body = await req.json()
    const {
      question,
      answer,
      interviewType,
      role,
      topic,
      difficulty,
      questionNumber,
      transcript,
      previousScores,
    } = body

    if (!question || !answer) {
      return corsResponse(400, { error: 'question and answer are required' })
    }

    const transcriptSummary = (transcript || [])
      .map((e: { speaker: string; text: string }) => `${e.speaker === 'ai' ? 'Interviewer' : 'Candidate'}: ${e.text}`)
      .join('\n')

    const userMessage = `Evaluate this interview answer and generate the next question.

Interview type: ${interviewType || 'technical'}
Role: ${role || 'Not specified'}
Current difficulty: ${difficulty || 'medium'}
Question #${questionNumber || 1}:

Question: "${question}"
Candidate's answer: "${answer}"
${previousScores ? `Previous scores: ${JSON.stringify(previousScores)}` : ''}
${transcriptSummary ? `\nFull transcript:\n${transcriptSummary}` : ''}

Evaluate the answer and generate the next question.`

    const result = await callGroq({
      system: SYSTEM_PROMPT,
      user: userMessage,
      temperature: 0.4,
      maxTokens: 1024,
    })

    return corsResponse(200, {
      success: true,
      evaluation: {
        score: typeof result.score === 'number' ? result.score : 5,
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
        feedback: typeof result.feedback === 'string' ? result.feedback : '',
      },
      nextQuestion: result.nextQuestion || "Tell me more about your experience with that.",
      nextDifficulty: result.nextDifficulty || difficulty || 'medium',
      topic: result.topic || topic || 'general',
      shouldContinue: result.shouldContinue ?? true,
    })
  } catch (err) {
    if (err instanceof GroqError) {
      console.error(`[evaluate-answer] Groq error: ${err.code} — ${err.message}`)
    } else {
      console.error('[evaluate-answer] Unexpected error:', err)
    }
    return corsResponse(200, {
      success: false,
      error: err instanceof GroqError ? err.code : 'internal_error',
      evaluation: {
        score: 5,
        strengths: [],
        weaknesses: [],
        feedback: '',
      },
      nextQuestion: "Can you elaborate on that further?",
      nextDifficulty: body?.difficulty || 'medium',
      topic: body?.topic || 'general',
      shouldContinue: true,
    })
  }
})
