import { supabase, hasSupabase } from '../supabase'
import type { Difficulty, InterviewMode, TranscriptEntry } from './types'
import {
  startInterviewLocal,
  evaluateAnswerLocal,
  finalEvaluationLocal,
} from '../ai/aiService'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StartInterviewResponse {
  success: boolean
  greeting: string
  firstQuestion: string
  difficulty: string
  topic: string
  interviewType: string
  error?: string
}

interface NextQuestionResponse {
  success: boolean
  question: string
  questionNumber: number
  topic: string
  difficulty: string
  followUp: boolean
  error?: string
}

interface EvaluateAnswerResponse {
  success: boolean
  evaluation: {
    score: number
    strengths: string[]
    weaknesses: string[]
    feedback: string
  }
  nextQuestion: string
  nextDifficulty: string
  topic: string
  shouldContinue: boolean
  error?: string
}

interface FinalEvaluationResponse {
  success: boolean
  scores: {
    technicalKnowledge: number
    problemSolving: number
    communication: number
    confidence: number
    overall: number
  }
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  topicsToRevise: string[]
  summary: string
  recommendation: string
  error?: string
}

/* ------------------------------------------------------------------ */
/*  Shared invoke helper with timeout                                  */
/* ------------------------------------------------------------------ */

const TIMEOUT_MS = 30_000

async function invokeFn<T>(
  fnName: string,
  body: Record<string, unknown>,
): Promise<T> {
  if (!hasSupabase) {
    throw new ApiError('supabase_not_configured', 'Supabase not configured')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const { data, error } = await supabase.functions.invoke(fnName, {
      body,
      signal: controller.signal,
    })

    if (error) {
      throw new ApiError('function_error', error.message || `Edge function ${fnName} failed`)
    }

    if (!data) {
      throw new ApiError('empty_response', `Empty response from ${fnName}`)
    }

    return data as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('timeout', `Request to ${fnName} timed out`)
    }
    const message = err instanceof Error ? err.message : String(err)
    throw new ApiError('network_error', `Network error calling ${fnName}: ${message}`)
  } finally {
    clearTimeout(timer)
  }
}

class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/* ------------------------------------------------------------------ */
/*  Interview context (what the caller passes)                         */
/* ------------------------------------------------------------------ */

export interface InterviewContext {
  mode: InterviewMode
  candidateName: string
  difficulty: Difficulty
  questionNumber: number
  transcript: TranscriptEntry[]
  topicsCovered: string[]
  /** Per-question 1-10 scores so far (lets the model adapt difficulty/topic). */
  previousScores?: number[]
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/* Provider policy: LOCAL OLLAMA → existing Groq → HONEST error.
   Never fabricate interview content. PII stays local when Ollama serves. */
function logFallback(stage: string, err: unknown) {
  const code =
    err instanceof ApiError ? err.code : err instanceof Error ? err.name : String(err)
  console.warn(`[ai] local Ollama failed at ${stage} (${code}); trying Groq fallback`)
}

export async function startInterview(ctx: {
  candidateName: string
  interviewType: string
  difficulty?: string
  role?: string
  topic?: string
}): Promise<StartInterviewResponse> {
  try {
    const local = await startInterviewLocal(ctx)
    return {
      success: true,
      greeting: local.greeting,
      firstQuestion: local.firstQuestion,
      difficulty: local.difficulty,
      topic: local.topic,
      interviewType: ctx.interviewType,
    }
  } catch (err) {
    logFallback('start-interview', err)
  }
  try {
    return await invokeFn<StartInterviewResponse>('start-interview', ctx)
  } catch {
    throw new ApiError(
      'ai_unavailable',
      'AI interview service is unavailable (local and cloud). Showing offline mode.',
    )
  }
}

export async function getNextQuestion(ctx: InterviewContext): Promise<NextQuestionResponse> {
  const lastUserEntry = [...ctx.transcript].reverse().find((e) => e.speaker === 'user')
  return invokeFn<NextQuestionResponse>('next-question', {
    interviewType: ctx.mode,
    role: ctx.mode,
    difficulty: ctx.difficulty,
    questionNumber: ctx.questionNumber,
    previousQuestions: ctx.transcript
      .filter((e) => e.speaker === 'ai')
      .map((e) => e.text),
    transcript: ctx.transcript.slice(-10),
    lastAnswer: lastUserEntry?.text || '',
  })
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  ctx: InterviewContext,
): Promise<EvaluateAnswerResponse> {
  try {
    const local = await evaluateAnswerLocal({
      question,
      answer,
      interviewType: ctx.mode,
      role: ctx.mode,
      difficulty: ctx.difficulty,
      questionNumber: ctx.questionNumber,
      transcript: ctx.transcript,
      previousScores: ctx.previousScores,
    })
    return {
      success: true,
      evaluation: {
        score: local.score,
        strengths: local.strengths,
        weaknesses: local.weaknesses,
        feedback: local.feedback,
      },
      nextQuestion: local.nextQuestion,
      nextDifficulty: local.nextDifficulty,
      topic: local.topic,
      shouldContinue: local.shouldContinue,
    }
  } catch (err) {
    logFallback('evaluate-answer', err)
  }
  try {
    return await invokeFn<EvaluateAnswerResponse>('evaluate-answer', {
      question,
      answer,
      interviewType: ctx.mode,
      role: ctx.mode,
      difficulty: ctx.difficulty,
      questionNumber: ctx.questionNumber,
      transcript: ctx.transcript.slice(-10),
      previousScores: ctx.previousScores,
    })
  } catch {
    throw new ApiError(
      'ai_unavailable',
      'AI evaluation is unavailable (local and cloud). Using labeled offline mode.',
    )
  }
}

export async function getFinalEvaluation(ctx: {
  candidateName: string
  interviewType: string
  role?: string
  topic?: string
  difficulty?: string
  transcript: TranscriptEntry[]
  questionEvaluations?: Array<{ score: number; feedback: string; question: string; answer: string }>
}): Promise<FinalEvaluationResponse> {
  try {
    const local = await finalEvaluationLocal({
      candidateName: ctx.candidateName,
      interviewType: ctx.interviewType,
      role: ctx.role,
      difficulty: ctx.difficulty,
      transcript: ctx.transcript,
      questionEvaluations: ctx.questionEvaluations,
    })
    return {
      success: true,
      scores: {
        technicalKnowledge: local.technicalKnowledge,
        problemSolving: local.problemSolving,
        communication: local.communication,
        confidence: local.confidence,
        overall: local.overall,
      },
      strengths: local.strengths,
      weaknesses: local.weaknesses,
      improvements: local.improvements,
      topicsToRevise: local.topicsToRevise,
      summary: local.summary,
      recommendation: local.recommendation,
    }
  } catch (err) {
    logFallback('final-evaluation', err)
  }
  try {
    return await invokeFn<FinalEvaluationResponse>('final-evaluation', ctx)
  } catch {
    throw new ApiError(
      'ai_unavailable',
      'AI evaluation is unavailable (local and cloud). No fabricated scores returned.',
    )
  }
}
