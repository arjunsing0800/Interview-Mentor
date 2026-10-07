/* ------------------------------------------------------------------ */
/*  Central AI service — the ONLY place that talks to Ollama.        */
/*                                                                   */
/*  Feature code (InterviewPage, Results, api.ts) calls these        */
/*  functions; they never touch fetch/UI themselves. Structured      */
/*  output is validated; failures throw (no fabricated results).     */
/* ------------------------------------------------------------------ */

import type { Difficulty, InterviewMode, TranscriptEntry } from '../interview/types'
import { chatJSON, OllamaError } from './ollamaClient'
import { ollamaConfig } from './config'
import {
  START_SYSTEM,
  EVALUATE_SYSTEM,
  FINAL_SYSTEM,
  buildStartUser,
  buildEvaluateUser,
  buildFinalUser,
  summarizeTranscript,
} from './prompts'
import {
  validateStart,
  validateEvaluate,
  validateFinal,
  type ValidStart,
  type ValidEvaluation,
  type ValidFinal,
} from './validate'

function toMode(value: string): InterviewMode {
  return value === 'hr' || value === 'behavioral' || value === 'resume' ? value : 'technical'
}

function toDifficulty(value: unknown): Difficulty {
  return value === 'easy' || value === 'hard' ? value : 'medium'
}

/** Retry once on structured-output parse errors (small-model schema drift). */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let last: unknown = null
  for (let attempt = 0; attempt < ollamaConfig.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      last = err
      if (!(err instanceof OllamaError) || err.code !== 'parse_error') throw err
    }
  }
  throw last instanceof Error ? last : new OllamaError('parse_error', 'Invalid model output')
}

/* ------------------------- start-interview ------------------------ */

export interface LocalStartInput {
  candidateName: string
  interviewType: string
  difficulty?: string
  role?: string
  topic?: string
}

export async function startInterviewLocal(input: LocalStartInput): Promise<ValidStart> {
  const mode = toMode(input.interviewType)
  const fallbackDifficulty = toDifficulty(input.difficulty)
  const raw = await withRetry(() =>
    chatJSON<unknown>({
      system: START_SYSTEM,
      user: buildStartUser({ ...input, mode }),
      temperature: ollamaConfig.temperature.start,
      maxTokens: ollamaConfig.maxTokens.start,
    }),
  )
  return validateStart(raw, fallbackDifficulty)
}

/* ------------------------- evaluate-answer ------------------------ */

export interface LocalEvaluateInput {
  question: string
  answer: string
  interviewType: string
  role?: string
  difficulty?: Difficulty
  questionNumber?: number
  transcript: TranscriptEntry[]
  previousScores?: number[]
}

export async function evaluateAnswerLocal(input: LocalEvaluateInput): Promise<ValidEvaluation> {
  const mode = toMode(input.interviewType)
  const fallbackDifficulty = input.difficulty || 'medium'
  const previousQuestions = input.transcript.filter((e) => e.speaker === 'ai').map((e) => e.text)
  const raw = await withRetry(() =>
    chatJSON<unknown>({
      system: EVALUATE_SYSTEM,
      user: buildEvaluateUser({
        question: input.question,
        answer: input.answer,
        interviewType: input.interviewType,
        role: input.role,
        difficulty: fallbackDifficulty,
        questionNumber: input.questionNumber,
        previousQuestions,
        transcriptSummary: summarizeTranscript(input.transcript),
        previousScores: input.previousScores,
        mode,
      }),
      temperature: ollamaConfig.temperature.evaluate,
      maxTokens: ollamaConfig.maxTokens.evaluate,
    }),
  )
  return validateEvaluate(raw, fallbackDifficulty)
}

/* ------------------------- final-evaluation ----------------------- */

export interface LocalFinalInput {
  candidateName: string
  interviewType: string
  role?: string
  difficulty?: string
  transcript: TranscriptEntry[]
  questionEvaluations?: Array<{ score: number; feedback: string }>
}

export async function finalEvaluationLocal(input: LocalFinalInput): Promise<ValidFinal> {
  const evalSummary = (input.questionEvaluations || [])
    .map((e, i) => `Q${i + 1} (Score: ${e.score}): ${e.feedback || 'no feedback'}`)
    .join('\n')
  const raw = await withRetry(() =>
    chatJSON<unknown>({
      system: FINAL_SYSTEM,
      user: buildFinalUser({
        candidateName: input.candidateName,
        interviewType: input.interviewType,
        role: input.role,
        difficulty: input.difficulty,
        transcriptSummary: summarizeTranscript(input.transcript, 30, 500),
        evalSummary,
      }),
      temperature: ollamaConfig.temperature.final,
      maxTokens: ollamaConfig.maxTokens.final,
    }),
  )
  return validateFinal(raw)
}
