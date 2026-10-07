/* ------------------------------------------------------------------ */
/*  OFFLINE HEURISTIC ONLY — not AI. Length/regex scoring.           */
/*  No longer used in the production results path (Results.tsx uses  */
/*  the local Ollama final evaluation with an honest error state).   */
/*  Kept for reference/tests; do not present its output as AI.       */
/* ------------------------------------------------------------------ */
import type { TranscriptEntry } from '../../lib/interview/types'

interface EvaluationResult {
  overallScore: number
  communicationScore: number
  technicalScore: number
  confidenceScore: number
  problemSolvingScore: number
  answerQualityScore: number
  strengths: string[]
  weaknesses: string[]
  recommendedImprovements: string[]
  topicsToPractice: string[]
  summary: string
}

export function evaluateInterview(
  transcript: TranscriptEntry[],
  mode: string,
  questionNumber: number
): EvaluationResult {
  const userEntries = transcript.filter((e) => e.speaker === 'user')
  const aiEntries = transcript.filter((e) => e.speaker === 'ai')

  const avgResponseLength =
    userEntries.reduce((s, e) => s + e.text.length, 0) / Math.max(userEntries.length, 1)

  // Check for detailed response indicators
  const hasExamples = userEntries.some((e) =>
    /\b(example|for instance|such as|like when|one time)\b/i.test(e.text)
  )
  const hasReasoning = userEntries.some((e) =>
    /\b(because|since|so that|in order to|the reason)\b/i.test(e.text)
  )
  const hasSpecifics = userEntries.some((e) =>
    /\b(first|second|then|after that|finally|specifically)\b/i.test(e.text)
  )
  const engagement = userEntries.length / Math.max(aiEntries.length, 1)

  /* ---- Communication Score ---- */
  const communicationScore = Math.min(100, Math.round(
    50
    + (avgResponseLength > 120 ? 20 : avgResponseLength > 60 ? 10 : 0)
    + (engagement >= 0.8 ? 15 : 5)
    + (avgResponseLength < 250 ? 15 : 5)
    + (hasSpecifics ? 5 : 0)
  ))

  /* ---- Technical Score ---- */
  const technicalScore = Math.min(100, Math.round(
    40
    + (avgResponseLength > 150 ? 25 : avgResponseLength > 70 ? 15 : 0)
    + (questionNumber >= 5 ? 20 : questionNumber * 4)
    + (mode === 'technical' ? 10 : 5)
    + (hasReasoning ? 5 : 0)
  ))

  /* ---- Confidence Score ---- */
  const confidenceScore = Math.min(100, Math.round(
    55
    + (avgResponseLength > 100 ? 20 : 5)
    + (userEntries.length >= 4 ? 15 : 5)
    + (avgResponseLength < 350 ? 10 : 0)
  ))

  /* ---- Problem Solving Score ---- */
  const problemSolvingScore = Math.min(100, Math.round(
    45
    + (hasReasoning ? 25 : 10)
    + (hasExamples ? 15 : 5)
    + (avgResponseLength > 100 ? 15 : 5)
    + (questionNumber >= 4 ? 5 : 0)
  ))

  /* ---- Answer Quality Score ---- */
  const answerQualityScore = Math.min(100, Math.round(
    50
    + (hasExamples ? 15 : 5)
    + (hasReasoning ? 15 : 5)
    + (hasSpecifics ? 10 : 0)
    + (avgResponseLength > 80 ? 10 : 0)
  ))

  /* ---- Overall Score ---- */
  const overallScore = Math.round(
    communicationScore * 0.25
    + technicalScore * 0.25
    + confidenceScore * 0.15
    + problemSolvingScore * 0.2
    + answerQualityScore * 0.15
  )

  /* ---- Strengths ---- */
  const strengths: string[] = []
  if (avgResponseLength > 120) strengths.push('Provides detailed and comprehensive responses')
  if (userEntries.length >= 4) strengths.push('Engages actively with questions')
  if (communicationScore >= 75) strengths.push('Clear and structured communication style')
  if (hasExamples) strengths.push('Uses real examples to support answers')
  if (hasReasoning) strengths.push('Demonstrates strong analytical thinking')
  if (hasSpecifics) strengths.push('Provides specific and actionable details')
  if (engagement > 0.8) strengths.push('Maintains good conversational flow')
  if (strengths.length === 0) strengths.push('Completed the interview session')

  /* ---- Weaknesses ---- */
  const weaknesses: string[] = []
  if (avgResponseLength < 50) weaknesses.push('Responses could be more detailed')
  if (userEntries.length < 3) weaknesses.push('Could engage more with questions')
  if (technicalScore < 60) weaknesses.push('Technical depth could be improved')
  if (!hasExamples) weaknesses.push('Could use more concrete examples')
  if (!hasReasoning) weaknesses.push('Could explain reasoning behind decisions')
  if (!hasSpecifics) weaknesses.push('Answers could be more specific')
  if (communicationScore < 60) weaknesses.push('Communication clarity needs improvement')
  if (weaknesses.length === 0) weaknesses.push('Minor areas for refinement')

  /* ---- Recommended Improvements ---- */
  const recommendedImprovements: string[] = []
  if (!hasExamples) recommendedImprovements.push('Practice the STAR method: structure answers with Situation, Task, Action, Result')
  if (avgResponseLength < 80) recommendedImprovements.push('Aim for 1-2 minute responses that cover context, action, and outcome')
  if (!hasReasoning) recommendedImprovements.push('Always explain the "why" behind your decisions')
  if (avgResponseLength > 300) recommendedImprovements.push('Keep responses focused and concise — avoid going off on tangents')
  if (engagement < 0.6) recommendedImprovements.push('Try to answer each question fully before moving on')
  if (recommendedImprovements.length === 0) recommendedImprovements.push('Continue practicing with varied question types')

  /* ---- Topics to Practice ---- */
  const topicsToPractice: string[] = []
  if (mode === 'technical') {
    topicsToPractice.push('Data Structures & Algorithms')
    topicsToPractice.push('System Design fundamentals')
    topicsToPractice.push('API design and REST principles')
    if (!hasReasoning) topicsToPractice.push('Explaining technical trade-offs')
  } else if (mode === 'hr') {
    topicsToPractice.push('STAR method for behavioral questions')
    topicsToPractice.push('Self-assessment and growth mindset')
    topicsToPractice.push('Career goal articulation')
  } else if (mode === 'behavioral') {
    topicsToPractice.push('STAR method framework')
    topicsToPractice.push('Conflict resolution strategies')
    topicsToPractice.push('Leadership and decision-making examples')
  } else {
    topicsToPractice.push('Project deep-dives and technical decisions')
    topicsToPractice.push('Quantifying impact and achievements')
    topicsToPractice.push('Technology choice justification')
  }
  if (!hasSpecifics) topicsToPractice.push('Adding concrete details to answers')

  /* ---- Summary ---- */
  let summary: string
  if (overallScore >= 80) {
    summary = `Strong performance. You demonstrated ${strengths[0]?.toLowerCase() || 'excellent communication skills'} and handled the interview with confidence. Keep refining your responses with more specific examples.`
  } else if (overallScore >= 65) {
    summary = `Good performance. You showed solid understanding and ${strengths[0]?.toLowerCase() || 'good engagement'}. Focus on ${recommendedImprovements[0]?.toLowerCase() || 'adding more depth to your answers'} to reach the next level.`
  } else if (overallScore >= 50) {
    summary = `Decent performance. You demonstrated baseline competency but could improve on ${weaknesses[0]?.toLowerCase() || 'providing more detailed responses'}. Practice with the recommended topics to build confidence.`
  } else {
    summary = `There's room for improvement. Focus on ${recommendedImprovements[0]?.toLowerCase() || 'developing your responses more fully'} and practice answering with the STAR method for behavioral questions.`
  }

  return {
    overallScore,
    communicationScore,
    technicalScore,
    confidenceScore,
    problemSolvingScore,
    answerQualityScore,
    strengths,
    weaknesses,
    recommendedImprovements,
    topicsToPractice,
    summary,
  }
}
