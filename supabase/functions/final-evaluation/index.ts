import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { callGroq, corsResponse, handleOptions, GroqError } from '../_shared/groq.ts'

const SYSTEM_PROMPT = `You are a professional interview evaluator generating a comprehensive final interview report.

Evaluate the entire interview based on the transcript and per-question evaluations.

Scoring criteria for each metric (0-100):
- technicalKnowledge: factual accuracy, depth of technical understanding
- problemSolving: reasoning quality, analytical approach
- communication: clarity, structure, articulation
- confidence: directness, certainty, composure under pressure
- overall: weighted average reflecting total performance

Rules:
- Be honest and calibrated — not generous
- Strengths and weaknesses must be SPECIFIC to this interview
- Improvements must be actionable
- Topics to practice must relate to gaps found
- Summary must be 2-3 sentences max
- Recommendation must be one of: "Strong Hire", "Hire", "Borderline", "No Hire"

Your output MUST be valid JSON matching the schema below.

Response schema:
{
  "technicalKnowledge": 75,
  "problemSolving": 70,
  "communication": 80,
  "confidence": 72,
  "overall": 74,
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
  "improvements": ["Actionable improvement 1", "Actionable improvement 2"],
  "topicsToRevise": ["Topic 1", "Topic 2", "Topic 3"],
  "summary": "2-3 sentence summary of performance",
  "recommendation": "Hire"
}`

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST') {
    return corsResponse(405, { error: 'Method not allowed' })
  }

  try {
    const body = await req.json()
    const {
      candidateName,
      interviewType,
      role,
      topic,
      difficulty,
      transcript,
      questionEvaluations,
    } = body

    const transcriptSummary = (transcript || [])
      .map((e: { speaker: string; text: string }) => `${e.speaker === 'ai' ? 'Interviewer' : 'Candidate'}: ${e.text}`)
      .join('\n')

    const evalSummary = (questionEvaluations || [])
      .map((e: { score: number; feedback: string }, i: number) => `Q${i + 1} (Score: ${e.score}): ${e.feedback}`)
      .join('\n')

    const userMessage = `Generate the final evaluation report for this interview.

Candidate: ${candidateName || 'Candidate'}
Interview type: ${interviewType || 'technical'}
Role: ${role || 'Not specified'}
Topic: ${topic || 'Not specified'}
Difficulty: ${difficulty || 'medium'}

Per-question evaluations:
${evalSummary || 'No per-question evaluations available.'}

Full transcript:
${transcriptSummary || 'No transcript available.'}

Generate a comprehensive final evaluation report.`

    const result = await callGroq({
      system: SYSTEM_PROMPT,
      user: userMessage,
      temperature: 0.3,
      maxTokens: 1024,
    })

    const clamp = (v: unknown, fallback: number) => {
      const n = Number(v)
      return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : fallback
    }

    return corsResponse(200, {
      success: true,
      scores: {
        technicalKnowledge: clamp(result.technicalKnowledge, 70),
        problemSolving: clamp(result.problemSolving, 65),
        communication: clamp(result.communication, 75),
        confidence: clamp(result.confidence, 70),
        overall: clamp(result.overall, 70),
      },
      strengths: Array.isArray(result.strengths) ? result.strengths : ['Completed the interview'],
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : ['Minor areas for improvement'],
      improvements: Array.isArray(result.improvements) ? result.improvements : ['Practice with more mock interviews'],
      topicsToRevise: Array.isArray(result.topicsToRevise) ? result.topicsToRevise : [],
      summary: typeof result.summary === 'string' ? result.summary : 'Interview completed.',
      recommendation: typeof result.recommendation === 'string' ? result.recommendation : 'Borderline',
    })
  } catch (err) {
    if (err instanceof GroqError) {
      console.error(`[final-evaluation] Groq error: ${err.code} — ${err.message}`)
    } else {
      console.error('[final-evaluation] Unexpected error:', err)
    }

    return corsResponse(200, {
      success: false,
      error: err instanceof GroqError ? err.code : 'internal_error',
      scores: {
        technicalKnowledge: 65,
        problemSolving: 60,
        communication: 70,
        confidence: 65,
        overall: 65,
      },
      strengths: ['Completed the interview session'],
      weaknesses: ['Unable to generate detailed analysis — fallback evaluation'],
      improvements: ['Practice answering with more structure and detail'],
      topicsToRevise: ['Review core concepts'],
      summary: 'The interview was completed. Detailed evaluation was unavailable due to a service issue. Scores are estimated.',
      recommendation: 'Borderline',
    })
  }
})
