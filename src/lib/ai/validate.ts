/* ------------------------------------------------------------------ */
/*  Strict validation for local-model structured output.             */
/*  Critical fields missing/invalid → throw (caller falls back to    */
/*  Groq, then to an HONEST error — never fabricated scores).        */
/*  Minor fields fall back to neutral defaults (empty, not fake).    */
/* ------------------------------------------------------------------ */

import type { Difficulty } from '../interview/types'
import { OllamaError } from './ollamaClient'

type RawRecord = Record<string, unknown>

function asRecord(value: unknown): RawRecord {
  if (typeof value !== 'object' || value === null) {
    throw new OllamaError('parse_error', 'Model did not return a JSON object')
  }
  return value as RawRecord
}

function reqString(raw: RawRecord, field: string): string {
  const v = raw[field]
  if (typeof v !== 'string' || v.trim().length === 0) {
    throw new OllamaError('parse_error', `Model response missing required field: ${field}`)
  }
  return v.trim()
}

function optString(raw: RawRecord, field: string, fallback: string): string {
  const v = raw[field]
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : fallback
}

function strArray(raw: RawRecord, field: string): string[] {
  const v = raw[field]
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim())
}

function clampInt(v: unknown, min: number, max: number): number | null {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) return null
  return Math.max(min, Math.min(max, Math.round(n)))
}

function reqScore(raw: RawRecord, field: string, min: number, max: number): number {
  const n = clampInt(raw[field], min, max)
  if (n === null) {
    throw new OllamaError('parse_error', `Model response has invalid score: ${field}`)
  }
  return n
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

function difficultyOf(v: unknown, fallback: Difficulty): Difficulty {
  return DIFFICULTIES.includes(v as Difficulty) ? (v as Difficulty) : fallback
}

/* ------------------------- start-interview ------------------------ */

export interface ValidStart {
  greeting: string
  firstQuestion: string
  difficulty: Difficulty
  topic: string
}

export function validateStart(raw: unknown, fallbackDifficulty: Difficulty): ValidStart {
  const r = asRecord(raw)
  return {
    greeting: reqString(r, 'greeting'),
    firstQuestion: reqString(r, 'firstQuestion'),
    difficulty: difficultyOf(r['difficulty'], fallbackDifficulty),
    topic: optString(r, 'topic', 'general'),
  }
}

/* ------------------------- evaluate-answer ------------------------ */

export interface ValidEvaluation {
  score: number
  strengths: string[]
  weaknesses: string[]
  feedback: string
  nextQuestion: string
  nextDifficulty: Difficulty
  topic: string
  shouldContinue: boolean
}

export function validateEvaluate(raw: unknown, fallbackDifficulty: Difficulty): ValidEvaluation {
  const r = asRecord(raw)
  const shouldContinue = typeof r['shouldContinue'] === 'boolean' ? r['shouldContinue'] : true
  return {
    score: reqScore(r, 'score', 1, 10),
    strengths: strArray(r, 'strengths'),
    weaknesses: strArray(r, 'weaknesses'),
    feedback: optString(r, 'feedback', ''),
    nextQuestion: reqString(r, 'nextQuestion'),
    nextDifficulty: difficultyOf(r['nextDifficulty'], fallbackDifficulty),
    topic: optString(r, 'topic', 'general'),
    shouldContinue,
  }
}

/* ------------------------- final-evaluation ----------------------- */

export interface ValidFinal {
  technicalKnowledge: number
  problemSolving: number
  communication: number
  confidence: number
  overall: number
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  topicsToRevise: string[]
  summary: string
  recommendation: string
}

const RECOMMENDATIONS = ['Strong Hire', 'Hire', 'Borderline', 'No Hire']

export function validateFinal(raw: unknown): ValidFinal {
  const r = asRecord(raw)
  const rec = optString(r, 'recommendation', 'Borderline')
  return {
    technicalKnowledge: reqScore(r, 'technicalKnowledge', 0, 100),
    problemSolving: reqScore(r, 'problemSolving', 0, 100),
    communication: reqScore(r, 'communication', 0, 100),
    confidence: reqScore(r, 'confidence', 0, 100),
    overall: reqScore(r, 'overall', 0, 100),
    strengths: strArray(r, 'strengths'),
    weaknesses: strArray(r, 'weaknesses'),
    improvements: strArray(r, 'improvements'),
    topicsToRevise: strArray(r, 'topicsToRevise'),
    summary: reqString(r, 'summary'),
    recommendation: RECOMMENDATIONS.includes(rec) ? rec : 'Borderline',
  }
}
