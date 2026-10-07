import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getFinalEvaluation } from '../lib/interview/api'
import type { TranscriptEntry } from '../lib/interview/types'
import { modeLabels } from '../lib/interview/types'
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  Lightbulb,
  BookOpen,
  ArrowLeft,
} from 'lucide-react'

interface StoredInterview {
  transcript: TranscriptEntry[]
  mode: string
  questionNumber: number
  duration: number
  finalEvaluation?: {
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
  }
}

interface EvaluationData {
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

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171'
  const label =
    score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Work'

  return (
    <div className="relative flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={6}
          fill="none"
          className="text-ink-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={6}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-ink-100">{score}</span>
        <span className="text-[10px] text-ink-400">{label}</span>
      </div>
    </div>
  )
}

function MetricBar({ label, score, delay }: { label: string; score: number; delay: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-ink-300">{label}</span>
        <span className="text-sm font-medium text-ink-200">{score}/100</span>
      </div>
      <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${score}%`,
            backgroundColor:
              score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171',
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  )
}

export default function Results() {
  const navigate = useNavigate()

  const stored = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('lastInterview')
      if (!raw) return null
      return JSON.parse(raw) as StoredInterview
    } catch {
      return null
    }
  }, [])

  /* AI-produced evaluation only — never fabricated heuristic scores. */
  const storedEvaluation: EvaluationData | null = useMemo(() => {
    if (!stored) return null
    if (stored.finalEvaluation?.success && stored.finalEvaluation.scores) {
      const fe = stored.finalEvaluation
      return {
        overallScore: fe.scores.overall,
        communicationScore: fe.scores.communication,
        technicalScore: fe.scores.technicalKnowledge,
        confidenceScore: fe.scores.confidence,
        problemSolvingScore: fe.scores.problemSolving,
        answerQualityScore: Math.round((fe.scores.technicalKnowledge + fe.scores.problemSolving) / 2),
        strengths: fe.strengths,
        weaknesses: fe.weaknesses,
        recommendedImprovements: fe.improvements,
        topicsToPractice: fe.topicsToRevise,
        summary: fe.summary,
      }
    }
    return null
  }, [stored])

  /* Honest retry: if the interview ended while AI was offline, try the
     local Ollama engine (then Groq) once more instead of inventing scores. */
  const [liveEvaluation, setLiveEvaluation] = useState<EvaluationData | null>(null)
  const [evalError, setEvalError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!stored || storedEvaluation || stored.transcript.length === 0) return
    let cancelled = false
    setRetrying(true)
    setEvalError(null)
    getFinalEvaluation({
      candidateName: 'Candidate',
      interviewType: stored.mode,
      role: stored.mode,
      transcript: stored.transcript,
    })
      .then((fe) => {
        if (cancelled) return
        if (fe?.success && fe.scores) {
          setLiveEvaluation({
            overallScore: fe.scores.overall,
            communicationScore: fe.scores.communication,
            technicalScore: fe.scores.technicalKnowledge,
            confidenceScore: fe.scores.confidence,
            problemSolvingScore: fe.scores.problemSolving,
            answerQualityScore: Math.round((fe.scores.technicalKnowledge + fe.scores.problemSolving) / 2),
            strengths: fe.strengths,
            weaknesses: fe.weaknesses,
            recommendedImprovements: fe.improvements,
            topicsToPractice: fe.topicsToRevise,
            summary: fe.summary,
          })
        } else {
          setEvalError(
            'The AI evaluation service is unavailable (local and cloud). Your transcript is intact — no fabricated scores are shown.',
          )
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEvalError(
            'The AI evaluation service is unavailable (local and cloud). Your transcript is intact — no fabricated scores are shown.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setRetrying(false)
      })
    return () => {
      cancelled = true
    }
  }, [stored, storedEvaluation, retryCount])

  const evaluation = storedEvaluation ?? liveEvaluation

  useEffect(() => {
    if (!stored) {
      navigate('/dashboard')
    }
  }, [stored, navigate])

  if (!stored) return null

  /* Honest error state — same layout shell, no invented scores. */
  if (!evaluation) {
    return (
      <div className="min-h-screen bg-ink-950">
        <header className="border-b border-ink-800 bg-ink-950/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-electric" />
              <span className="text-ink-200 font-medium">Interview Results</span>
            </div>
            <span className="text-ink-500 text-sm">{modeLabels[stored.mode as keyof typeof modeLabels] || stored.mode}</span>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="bg-ink-900/60 border border-ink-800 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-medium text-ink-200">AI evaluation unavailable</h3>
            </div>
            <p className="text-ink-300 leading-relaxed text-sm">
              {retrying
                ? 'Contacting the AI service for your evaluation…'
                : evalError}
            </p>
            {!retrying && (
              <button
                onClick={() => setRetryCount((c) => c + 1)}
                className="mt-5 flex items-center gap-2 px-6 py-3 bg-white/[0.04] hover:bg-white/[0.08] text-ink-300 rounded-xl text-sm font-medium border border-white/[0.08] transition-all cursor-pointer"
              >
                Retry AI evaluation
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-8 py-3 bg-electric hover:bg-electric/80 text-white rounded-xl font-medium transition-colors cursor-pointer"
            >
              Back to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/interview')}
              className="flex items-center gap-2 px-6 py-3 bg-white/[0.04] hover:bg-white/[0.08] text-ink-300 rounded-xl text-sm font-medium border border-white/[0.08] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Start New Interview
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Header */}
      <header className="border-b border-ink-800 bg-ink-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-electric" />
            <span className="text-ink-200 font-medium">Interview Results</span>
          </div>
          <span className="text-ink-500 text-sm">{modeLabels[stored.mode as keyof typeof modeLabels] || stored.mode}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-10"
        >
          <div className="bg-ink-900/60 border border-ink-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center">
            <Clock className="w-5 h-5 text-ink-400 mb-2 sm:mb-3" />
            <span className="text-lg sm:text-2xl font-bold text-ink-100">{Math.floor(stored.duration / 60)}m {stored.duration % 60}s</span>
            <span className="text-[10px] sm:text-xs text-ink-500">Duration</span>
          </div>
          <div className="bg-ink-900/60 border border-ink-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center">
            <Target className="w-5 h-5 text-ink-400 mb-2 sm:mb-3" />
            <span className="text-lg sm:text-2xl font-bold text-ink-100">{stored.questionNumber}</span>
            <span className="text-[10px] sm:text-xs text-ink-500">Questions Covered</span>
          </div>
          <div className="bg-ink-900/60 border border-ink-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center">
            <TrendingUp className="w-5 h-5 text-ink-400 mb-2 sm:mb-3" />
            <span className="text-lg sm:text-2xl font-bold text-ink-100">{evaluation.overallScore}</span>
            <span className="text-[10px] sm:text-xs text-ink-500">Overall Score</span>
          </div>
        </motion.div>

        {/* Score ring + breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10"
        >
          <div className="bg-ink-900/60 border border-ink-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center">
            <h3 className="text-sm font-medium text-ink-400 mb-6">Overall Score</h3>
            <ScoreRing score={evaluation.overallScore} size={140} />
          </div>

          <div className="bg-ink-900/60 border border-ink-800 rounded-2xl p-6 sm:p-8">
            <h3 className="text-sm font-medium text-ink-400 mb-6">Score Breakdown</h3>
            <div className="space-y-4 sm:space-y-5">
              <MetricBar label="Communication" score={evaluation.communicationScore} delay={200} />
              <MetricBar label="Technical Knowledge" score={evaluation.technicalScore} delay={400} />
              <MetricBar label="Confidence" score={evaluation.confidenceScore} delay={600} />
              <MetricBar label="Problem Solving" score={evaluation.problemSolvingScore} delay={800} />
              <MetricBar label="Answer Quality" score={evaluation.answerQualityScore} delay={1000} />
            </div>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-ink-900/60 border border-ink-800 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8"
        >
          <h3 className="text-sm font-medium text-ink-400 mb-4">AI Coach Summary</h3>
          <p className="text-ink-200 leading-relaxed">{evaluation.summary}</p>
        </motion.div>

        {/* Strengths + Weaknesses */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-medium text-emerald-400">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-300">
                  <span className="text-emerald-400 mt-0.5">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-medium text-amber-400">Areas to Improve</h3>
            </div>
            <ul className="space-y-2">
              {evaluation.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-300">
                  <span className="text-amber-400 mt-0.5">!</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Recommended Improvements + Topics to Practice */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <div className="bg-electric/5 border border-electric/15 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-electric-soft" />
              <h3 className="text-sm font-medium text-electric-soft">Recommended Improvements</h3>
            </div>
            <ul className="space-y-2">
              {evaluation.recommendedImprovements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-300">
                  <span className="text-electric-soft mt-0.5">&#8250;</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-violet-500/5 border border-violet-500/15 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-violet-400" />
              <h3 className="text-sm font-medium text-violet-400">Topics to Practice</h3>
            </div>
            <ul className="space-y-2">
              {evaluation.topicsToPractice.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-300">
                  <span className="text-violet-400 mt-0.5">&#9679;</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Transcript */}
        {stored.transcript.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-ink-900/60 border border-ink-800 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-10"
          >
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-ink-400" />
              <h3 className="text-sm font-medium text-ink-400">Full Transcript</h3>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stored.transcript.map((entry, i) => (
                <div key={i} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      entry.speaker === 'user'
                        ? 'bg-electric/10 text-electric-soft border border-electric/15'
                        : 'bg-ink-800/60 text-ink-200 border border-ink-700/40'
                    }`}
                  >
                    <span className="text-[10px] font-medium text-ink-500 block mb-1">
                      {entry.speaker === 'ai' ? 'AI Interviewer' : 'You'}
                    </span>
                    {entry.text}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-8 py-3 bg-electric hover:bg-electric/80 text-white rounded-xl font-medium transition-colors cursor-pointer"
          >
            Back to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/interview')}
            className="flex items-center gap-2 px-6 py-3 bg-white/[0.04] hover:bg-white/[0.08] text-ink-300 rounded-xl text-sm font-medium border border-white/[0.08] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Start New Interview
          </button>
        </motion.div>
      </main>
    </div>
  )
}
