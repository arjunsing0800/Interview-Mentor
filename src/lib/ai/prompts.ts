/* ------------------------------------------------------------------ */
/*  Centralized prompts for the local Ollama interview engine.       */
/*  Mirrors the Supabase/Groq edge prompts so cloud ↔ local parity   */
/*  is preserved; mode behavior reuses `modeInstructions` from       */
/*  ../interview/agent.ts instead of duplicating it.                 */
/* ------------------------------------------------------------------ */

import type { InterviewMode } from '../interview/types'
import { modeInstructions } from '../interview/agent'

const JSON_ONLY =
  'Return ONLY one valid JSON object. No markdown, no code fences, no explanations. ' +
  'You MUST include EVERY field in the schema.'

export const START_SYSTEM =
  'You are a professional AI interviewer. You conduct structured, realistic interviews. ' +
  'Be professional, concise, and direct. Ask ONE question at a time. ' +
  'Adapt difficulty based on the interview type and role. Never ask more than one question per response. ' +
  `${JSON_ONLY} Schema: {"greeting": "brief professional greeting, 1-2 sentences", ` +
  '"firstQuestion": "first interview question adapted to the role and type", ' +
  '"difficulty": "one of easy|medium|hard", "topic": "main topic of the first question"}.'

export function buildStartUser(input: {
  candidateName: string
  interviewType: string
  difficulty?: string
  role?: string
  topic?: string
  mode: InterviewMode
}): string {
  return (
    `${modeInstructions[input.mode]}\n\n` +
    `Start a new ${input.interviewType} interview.\n` +
    `Candidate: ${input.candidateName}\n` +
    `Role: ${input.role || 'Not specified'}\n` +
    `Topic: ${input.topic || 'Not specified'}\n` +
    `Difficulty: ${input.difficulty || 'medium'}\n\n` +
    'Generate the greeting AND the first question. Both fields are required.'
  )
}

export const EVALUATE_SYSTEM =
  'You are a professional interview evaluator and interviewer. You evaluate the candidate\'s answer ' +
  'AND generate the next question in a single response. Score honestly, not generously: ' +
  '1-3 poor, 4-5 below average, 6-7 good, 8-9 excellent, 10 exceptional. ' +
  'If the answer was weak, ask a simpler or clarifying question. If strong, increase difficulty or explore a new area. ' +
  'Never repeat a previous question. Base the score on technical accuracy, relevance, depth, reasoning, ' +
  'clarity and completeness — NOT on answer length alone. ' +
  `${JSON_ONLY} Schema: {"score": number 1-10, "strengths": string[], "weaknesses": string[], ` +
  '"feedback": "one sentence of constructive feedback", "nextQuestion": "next interview question", ' +
  '"nextDifficulty": "one of easy|medium|hard", "topic": "topic of the next question", ' +
  '"shouldContinue": boolean}.'

export function buildEvaluateUser(input: {
  question: string
  answer: string
  interviewType: string
  role?: string
  difficulty?: string
  questionNumber?: number
  previousQuestions: string[]
  transcriptSummary: string
  previousScores?: number[]
  mode: InterviewMode
}): string {
  const prev =
    input.previousQuestions.length > 0
      ? `Previous questions (DO NOT repeat any): ${JSON.stringify(input.previousQuestions)}\n`
      : ''
  const scores =
    input.previousScores && input.previousScores.length > 0
      ? `Previous scores: ${JSON.stringify(input.previousScores)}\n`
      : ''
  return (
    `${modeInstructions[input.mode]}\n\n` +
    `Evaluate this interview answer and generate the next question.\n` +
    `Interview type: ${input.interviewType}\n` +
    `Role: ${input.role || 'Not specified'}\n` +
    `Current difficulty: ${input.difficulty || 'medium'}\n` +
    `Question #${input.questionNumber || 1}:\n` +
    `Question: "${input.question}"\n` +
    `Candidate's answer: "${input.answer}"\n` +
    scores +
    prev +
    (input.transcriptSummary ? `Recent transcript:\n${input.transcriptSummary}\n` : '') +
    '\nEvaluate the answer and generate the next question. All schema fields are required.'
  )
}

export const FINAL_SYSTEM =
  'You are a professional interview evaluator generating a comprehensive final interview report. ' +
  'Score EACH metric on a 0-100 scale (for example 72 or 45 — NEVER single digits like 7 or 5; ' +
  'a weak interview is around 40, an average one around 65, a strong one around 85). ' +
  'Score honestly and calibrated, not generously. Strengths and weaknesses must be SPECIFIC to this ' +
  'interview, improvements actionable, topics tied to observed gaps, summary 2-3 sentences. ' +
  'Recommendation MUST be exactly one of: Strong Hire, Hire, Borderline, No Hire. ' +
  'Derive EVERYTHING from the transcript evidence. ' +
  `${JSON_ONLY} Schema: {"technicalKnowledge": number 0-100, "problemSolving": number 0-100, ` +
  '"communication": number 0-100, "confidence": number 0-100, "overall": number 0-100, ' +
  '"strengths": string[], "weaknesses": string[], ' +
  '"improvements": string[], "topicsToRevise": string[], "summary": string, "recommendation": string}.'
export function buildFinalUser(input: {
  candidateName: string
  interviewType: string
  role?: string
  difficulty?: string
  transcriptSummary: string
  evalSummary: string
}): string {
  return (
    `Generate the final evaluation report for this interview.\n` +
    `Candidate: ${input.candidateName}\n` +
    `Interview type: ${input.interviewType}\n` +
    `Role: ${input.role || 'Not specified'}\n` +
    `Difficulty: ${input.difficulty || 'medium'}\n\n` +
    `Per-question evaluations:\n${input.evalSummary || 'No per-question evaluations available.'}\n\n` +
    `Full transcript:\n${input.transcriptSummary || 'No transcript available.'}\n\n` +
    'Generate the report. All schema fields are required.'
  )
}

/** Compact "Interviewer:/Candidate:" transcript slice for prompts (caps PII/length). */
export function summarizeTranscript(
  transcript: Array<{ speaker: string; text: string }>,
  maxEntries = 10,
  maxCharsPerEntry = 600,
): string {
  return transcript
    .slice(-maxEntries)
    .map((e) => {
      const who = e.speaker === 'ai' ? 'Interviewer' : 'Candidate'
      const text =
        e.text.length > maxCharsPerEntry ? `${e.text.slice(0, maxCharsPerEntry)}…` : e.text
      return `${who}: ${text}`
    })
    .join('\n')
}
