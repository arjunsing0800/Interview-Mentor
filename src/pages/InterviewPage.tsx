import { Component, type ErrorInfo, type ReactNode, Suspense, lazy, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import type { InterviewMode, InterviewState, TranscriptEntry } from '../lib/interview/types'
import { getDuration, formatDuration, modeLabels, interviewReducer } from '../lib/interview/types'
import { getSeedGreeting, getSeedQuestion, assessDifficulty } from '../lib/interview/agent'
import { startInterview, evaluateAnswer, getFinalEvaluation, type InterviewContext } from '../lib/interview/api'
import { useSpeechRecognition } from '../lib/interview/useSpeechRecognition'
import { useSpeechSynthesis } from '../lib/interview/useSpeechSynthesis'
import MagicRings from '../components/reactbits/MagicRings'
import SceneFallback from '../components/three/SceneFallback'
import EndConfirmModal from '../components/interview/EndConfirmModal'
import {
  ArrowLeft,
  Clock,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  X,
  Send,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Error Boundary — catches render crashes so page stays visible      */
/* ------------------------------------------------------------------ */
class InterviewErrorBoundary extends Component<
  { children: ReactNode; fallbackLabel: string },
  { error: Error | null }
> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.fallbackLabel}] render error:`, error, info.componentStack)
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
          <p className="text-sm text-red-400 font-medium">{this.props.fallbackLabel} failed to load</p>
          <p className="text-xs text-ink-500 mt-1">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}

const AvatarScene = lazy(() => import('../components/three/AvatarScene'))

/* ------------------------------------------------------------------ */
/*  State config — maps SpeakerState to visual + text                  */
/* ------------------------------------------------------------------ */
const stateVisuals: Record<string, { label: string; sub: string; ring: string; pulse: boolean }> = {
  idle: { label: 'Ready', sub: 'Ready when you are.', ring: 'ring-ink-600', pulse: false },
  listening: { label: 'Listening', sub: 'Listening to your answer...', ring: 'ring-emerald-400', pulse: true },
  speaking: { label: 'Speaking', sub: 'AI Interviewer is speaking...', ring: 'ring-electric', pulse: false },
  thinking: { label: 'Thinking', sub: 'Processing your response...', ring: 'ring-amber-400', pulse: false },
  processing: { label: 'Processing', sub: 'Analyzing your answer...', ring: 'ring-violet-400', pulse: true },
}

/* ------------------------------------------------------------------ */
/*  Transcript side panel                                              */
/* ------------------------------------------------------------------ */
function TranscriptDrawer({
  entries,
  isOpen,
  onClose,
}: {
  entries: TranscriptEntry[]
  isOpen: boolean
  onClose: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:bg-black/20"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md border-l border-white/[0.08] bg-ink-950/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <span className="text-sm font-semibold text-ink-200">Transcript</span>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-ink-400 hover:text-ink-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
              {entries.map((entry, i) => (
                <div
                  key={i}
                  className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      entry.speaker === 'user'
                        ? 'bg-electric/12 text-electric-soft border border-electric/15'
                        : 'bg-white/[0.05] text-ink-200 border border-white/[0.06]'
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500 block mb-1">
                      {entry.speaker === 'ai' ? 'AI Interviewer' : 'You'}
                    </span>
                    {entry.text}
                  </div>
                </div>
              ))}
              {entries.length === 0 && (
                <p className="text-center text-ink-500 text-sm py-12">No conversation yet</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/*  Mic button with animated ring                                       */
/* ------------------------------------------------------------------ */
function InterviewMicButton({
  speakerState,
  isMuted,
  onToggleMute,
}: {
  speakerState: string
  isMuted: boolean
  onToggleMute: () => void
}) {
  const visual = stateVisuals[speakerState] || stateVisuals.idle
  const [pulseScale, setPulseScale] = useState(1)

  useEffect(() => {
    if (speakerState !== 'listening') {
      setPulseScale(1)
      return
    }
    let frame: number
    let t = 0
    const animate = () => {
      t += 0.03
      setPulseScale(1 + Math.sin(t) * 0.06)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [speakerState])

  const isActive = speakerState === 'listening' && !isMuted

  return (
    <button
      onClick={onToggleMute}
      className="relative group cursor-pointer"
      aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
    >
      {/* Pulse rings */}
      {isActive && (
        <>
          <span className="absolute inset-0 rounded-full bg-emerald-400/15 animate-ping" style={{ animationDuration: '2.5s' }} />
          <span className="absolute -inset-2 rounded-full border border-emerald-400/10 animate-pulse" />
        </>
      )}
      {speakerState === 'speaking' && (
        <span className="absolute inset-0 rounded-full bg-electric/10 animate-pulse" />
      )}
      {speakerState === 'processing' && (
        <span className="absolute inset-0 rounded-full bg-violet-400/10 animate-pulse" />
      )}

      <div
        className={`
          relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center
          transition-all duration-300
          ${isMuted
            ? 'bg-red-500/80 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)]'
            : isActive
            ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.3)]'
            : speakerState === 'speaking'
            ? 'bg-electric/80 text-white shadow-[0_0_30px_rgba(79,124,255,0.3)]'
            : speakerState === 'processing'
            ? 'bg-violet-500/80 text-white shadow-[0_0_30px_rgba(139,92,246,0.3)]'
            : 'bg-white/[0.08] text-ink-300 border border-white/[0.1]'
          }
          ring-4 ${visual.ring}/20
        `}
        style={{ transform: `scale(${pulseScale})` }}
      >
        {isMuted ? (
          <MicOff className="w-8 h-8 sm:w-9 sm:h-9" />
        ) : (
          <Mic className="w-8 h-8 sm:w-9 sm:h-9" />
        )}
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Text input fallback                                                */
/* ------------------------------------------------------------------ */
function TextInputFallback({
  onSubmit,
  disabled,
}: {
  onSubmit: (text: string) => void
  disabled: boolean
}) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (!text.trim() || disabled) return
    onSubmit(text.trim())
    setText('')
  }

  return (
    <div className="w-full max-w-md flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit()
        }}
        placeholder="Type your answer..."
        disabled={disabled}
        className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-ink-200 placeholder:text-ink-500 focus:outline-none focus:border-electric/30 focus:ring-1 focus:ring-electric/20 transition-all disabled:opacity-40"
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || disabled}
        className="p-2.5 rounded-xl bg-electric/80 hover:bg-electric text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Submit answer"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Interview Page                                                */
/* ------------------------------------------------------------------ */
export default function InterviewPage() {
  const { mode: urlMode } = useParams<{ mode: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const validModes: InterviewMode[] = ['technical', 'hr', 'behavioral', 'resume']
  const mode: InterviewMode = validModes.includes(urlMode as InterviewMode)
    ? (urlMode as InterviewMode)
    : 'technical'

  /* ---- State ---- */
  const [state, dispatch] = useReducer(interviewReducer, {
    id: '',
    mode,
    candidateName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Candidate',
    status: 'active',
    speakerState: 'thinking',
    questionNumber: 0,
    difficulty: 'medium',
    transcript: [],
    topicsCovered: [],
    strengths: [],
    weaknesses: [],
    startTime: Date.now(),
    endTime: null,
    isMuted: false,
    showTranscript: false,
    showEndConfirm: false,
  })

  const [userText, setUserText] = useState('')
  const [elapsedTime, setElapsedTime] = useState(0)
  /* Honest offline indicator: seed-bank questions are NOT presented as AI output */
  const [aiOffline, setAiOffline] = useState(false)
  const processingRef = useRef(false)
  const greetingSentRef = useRef(false)
  const lastTranscriptLen = useRef(0)
  const questionCountRef = useRef(0)
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastQuestionRef = useRef('')
  const questionEvaluationsRef = useRef<Array<{ score: number; feedback: string; question: string; answer: string }>>([])

  /* ---- Speech recognition ---- */
  const handleAIResult = useCallback((text: string, isFinal: boolean) => {
    // Show live interim transcript while the user is speaking
    if (!isFinal) {
      setUserText(text)
      return
    }
    // Guard against double-submit (e.g. rapid final results)
    if (processingRef.current) return
    processingRef.current = true
    if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current)
    setUserText('')
    const entry: TranscriptEntry = { speaker: 'user', text, timestamp: Date.now() }
    dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', entry })
    dispatch({ type: 'SET_SPEAKER_STATE', state: 'processing' })
    // Brief processing delay for natural feel
    processingTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'SET_SPEAKER_STATE', state: 'thinking' })
      dispatch({ type: 'NEXT_QUESTION' })
      processingRef.current = false
    }, 600)
  }, [])

  const handleAIEnd = useCallback(() => {
    if (processingRef.current) return
    setUserText('')
  }, [])

  const speechRecognition = useSpeechRecognition({
    onResult: handleAIResult,
    onEnd: handleAIEnd,
    enabled: state.status === 'active' && state.speakerState === 'listening' && !state.isMuted,
  })

  /* ---- Auto-start mic when entering listening state ---- */
  useEffect(() => {
    const shouldListen =
      state.status === 'active' &&
      state.speakerState === 'listening' &&
      !state.isMuted &&
      speechRecognition.isSupported
    if (shouldListen) {
      speechRecognition.start()
    } else if (speechRecognition.isListening) {
      speechRecognition.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.speakerState, state.isMuted, speechRecognition.isSupported])

  /* ---- Text input handler ---- */
  const handleTextSubmit = useCallback((text: string) => {
    if (processingRef.current) return
    processingRef.current = true
    if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current)
    const entry: TranscriptEntry = { speaker: 'user', text, timestamp: Date.now() }
    dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', entry })
    dispatch({ type: 'SET_SPEAKER_STATE', state: 'processing' })
    processingTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'SET_SPEAKER_STATE', state: 'thinking' })
      dispatch({ type: 'NEXT_QUESTION' })
      processingRef.current = false
    }, 600)
  }, [])

  /* ---- Speech synthesis ---- */
  const handleSpeakStart = useCallback(() => {
    dispatch({ type: 'SET_SPEAKER_STATE', state: 'speaking' })
  }, [])

  const handleSpeakEnd = useCallback(() => {
    if (state.status === 'completed') return
    dispatch({ type: 'SET_SPEAKER_STATE', state: 'listening' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status])

  const speechSynthesis = useSpeechSynthesis({
    onStart: handleSpeakStart,
    onEnd: handleSpeakEnd,
  })

  /* ---- Agent response effect (Groq-powered, with fallback) ---- */
  useEffect(() => {
    if (state.transcript.length <= lastTranscriptLen.current) return
    lastTranscriptLen.current = state.transcript.length
    const lastEntry = state.transcript[state.transcript.length - 1]
    if (!lastEntry || lastEntry.speaker === 'ai') return
    // Only process when a USER entry was just added
    if (lastEntry.speaker !== 'user') return

    questionCountRef.current++
    const userAnswer = lastEntry.text
    const currentQuestion = lastQuestionRef.current

    const ctx: InterviewContext = {
      mode: state.mode,
      candidateName: state.candidateName,
      difficulty: state.difficulty,
      questionNumber: state.questionNumber,
      transcript: state.transcript,
      topicsCovered: state.topicsCovered,
      previousScores: questionEvaluationsRef.current.map((e) => e.score),
    }

    ;(async () => {
      try {
        const res = await evaluateAnswer(currentQuestion, userAnswer, ctx)
        setAiOffline(false)
        // Store evaluation
        questionEvaluationsRef.current.push({
          score: res.evaluation.score,
          feedback: res.evaluation.feedback,
          question: currentQuestion,
          answer: userAnswer,
        })

        // Check if interview should end
        if (!res.shouldContinue || questionCountRef.current > 10) {
          setTimeout(() => dispatch({ type: 'END_INTERVIEW' }), 800)
          return
        }

        const nextQ = res.nextQuestion || 'Tell me more about that.'
        lastQuestionRef.current = nextQ
        dispatch({ type: 'SET_DIFFICULTY', difficulty: (res.nextDifficulty as InterviewState['difficulty']) || state.difficulty })
        dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', entry: { speaker: 'ai', text: nextQ, timestamp: Date.now() } })
        setTimeout(() => speechSynthesis.speak(nextQ), 400)
        return
      } catch {
        // Labeled offline mode: seed-bank question + persistent notice (never fake AI scores)
        setAiOffline(true)
      }

      if (questionCountRef.current > 10) {
        setTimeout(() => dispatch({ type: 'END_INTERVIEW' }), 800)
        return
      }
      const seed = getSeedQuestion(state.mode, state.difficulty)
      lastQuestionRef.current = seed
      dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', entry: { speaker: 'ai', text: seed, timestamp: Date.now() } })
      setTimeout(() => speechSynthesis.speak(seed), 400)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.transcript.length])

  /* ---- Greeting on mount ---- */
  useEffect(() => {
    if (!greetingSentRef.current && state.status === 'active') {
      greetingSentRef.current = true
      ;(async () => {
        try {
          const res = await startInterview({
            candidateName: state.candidateName,
            interviewType: state.mode,
            difficulty: state.difficulty,
            role: modeLabels[state.mode],
          })
          if (res.greeting) {
            dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', entry: { speaker: 'ai', text: res.greeting, timestamp: Date.now() } })
            setTimeout(() => speechSynthesis.speak(res.greeting), 300)
          }
          if (res.firstQuestion) {
            lastQuestionRef.current = res.firstQuestion
            dispatch({ type: 'SET_DIFFICULTY', difficulty: (res.difficulty as InterviewState['difficulty']) || 'medium' })
            // First question counts as Q1 so the counter starts correctly
            dispatch({ type: 'NEXT_QUESTION' })
            setTimeout(() => {
              dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', entry: { speaker: 'ai', text: res.firstQuestion, timestamp: Date.now() } })
            }, 1000)
          } else if (res.greeting) {
            lastQuestionRef.current = res.greeting
            dispatch({ type: 'NEXT_QUESTION' })
          }
          setAiOffline(false)
          return
        } catch {
          // Labeled offline mode: static seed greeting (notice shown below)
          setAiOffline(true)
        }
        const greeting = getSeedGreeting(state.candidateName, state.mode)
        lastQuestionRef.current = greeting
        dispatch({ type: 'NEXT_QUESTION' })
        dispatch({ type: 'ADD_TRANSCRIPT_ENTRY', entry: { speaker: 'ai', text: greeting, timestamp: Date.now() } })
        setTimeout(() => speechSynthesis.speak(greeting), 600)
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---- Timer ---- */
  useEffect(() => {
    const interval = setInterval(() => setElapsedTime(getDuration(state)), 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.startTime])

  /* ---- Difficulty adjustment ---- */
  useEffect(() => {
    if (state.transcript.length > 0) {
      dispatch({ type: 'SET_DIFFICULTY', difficulty: assessDifficulty(state.transcript) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.transcript.length])

  /* ---- End → navigate ---- */
  useEffect(() => {
    if (state.status === 'completed') {
      speechSynthesis.stop()
      speechRecognition.stop()
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current)

      const duration = getDuration(state)
      const base = {
        transcript: state.transcript,
        mode: state.mode,
        questionNumber: state.questionNumber,
        duration,
      }

      ;(async () => {
        try {
          const finalEval = await getFinalEvaluation({
            candidateName: state.candidateName,
            interviewType: state.mode,
            role: modeLabels[state.mode],
            difficulty: state.difficulty,
            transcript: state.transcript,
            questionEvaluations: questionEvaluationsRef.current,
          })
          sessionStorage.setItem('lastInterview', JSON.stringify({ ...base, finalEvaluation: finalEval }))
        } catch {
          sessionStorage.setItem('lastInterview', JSON.stringify(base))
        }
        navigate('/interview/results')
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status])

  /* ---- Cleanup processing timeout ---- */
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current)
    }
  }, [])

  /* ---- Derived ---- */
  const lastAIEntry = useMemo(
    () => [...state.transcript].reverse().find((e) => e.speaker === 'ai'),
    [state.transcript]
  )

  const visual = stateVisuals[state.speakerState] || stateVisuals.idle
  const questionDisplay = Math.min(Math.max(state.questionNumber, lastAIEntry ? 1 : 0), 10)

  const handleEnd = useCallback(() => dispatch({ type: 'END_INTERVIEW' }), [])

  /* ---- Render ---- */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-dvh min-h-screen flex flex-col overflow-hidden bg-ink-950"
    >
      {/* ── MagicRings background ── */}
      <div className="absolute inset-0 z-0">
        <InterviewErrorBoundary fallbackLabel="MagicRings">
          <MagicRings
            color="#A855F7"
            colorTwo="#6366F1"
            ringCount={6}
            speed={1}
            attenuation={10}
            lineThickness={2}
            baseRadius={0.35}
            radiusStep={0.1}
            scaleRate={0.1}
            opacity={1}
            blur={0}
            noiseAmount={0.1}
            rotation={0}
            ringGap={1.5}
            fadeIn={0.7}
            fadeOut={0.5}
            followMouse={false}
            mouseInfluence={0.2}
            hoverScale={1.2}
            parallax={0.05}
            clickBurst={false}
          />
        </InterviewErrorBoundary>
      </div>

      {/* ── Dark vignette overlay ── */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(4,5,13,0.75)_100%)]" />

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative z-20 border-b border-white/[0.06] bg-ink-950/60 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Left: exit + label */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_END_CONFIRM' })}
              className="flex items-center gap-1.5 text-ink-400 hover:text-ink-200 text-sm transition-colors cursor-pointer"
              aria-label="Exit interview"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Interview</span>
            </button>
            <span className="text-ink-700 hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-sm font-semibold text-ink-200 tracking-wide">LIVE INTERVIEW</span>
            </div>
          </div>

          {/* Right: mode + question + timer */}
          <div className="flex items-center gap-3 sm:gap-5 text-sm">
            <span className="text-ink-400 hidden md:inline">{modeLabels[mode]}</span>
            <span className="text-ink-600 hidden md:inline">|</span>
            <span className="text-ink-300 font-medium tabular-nums">
              Q{questionDisplay} / 10
            </span>
            <div className="flex items-center gap-1.5 text-ink-400 tabular-nums">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(elapsedTime)}
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between px-4 sm:px-6 py-6 sm:py-10 gap-4 sm:gap-6">

        {/* ── 3D Bot ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 flex-shrink-0"
        >
          <div className="w-full h-full [transform:rotateX(5deg)]">
            <InterviewErrorBoundary fallbackLabel="3D Bot">
              <Suspense fallback={<SceneFallback />}>
                <AvatarScene lite />
              </Suspense>
            </InterviewErrorBoundary>
          </div>

          {/* Floating state indicator */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-900/80 border border-white/[0.08] backdrop-blur-sm">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                state.speakerState === 'listening'
                  ? 'bg-emerald-400'
                  : state.speakerState === 'speaking'
                  ? 'bg-electric'
                  : state.speakerState === 'processing'
                  ? 'bg-violet-400'
                  : state.speakerState === 'thinking'
                  ? 'bg-amber-400'
                  : 'bg-ink-500'
              } ${visual.pulse ? 'animate-pulse' : ''}`}
            />
            <span className="text-[11px] font-medium text-ink-300">{visual.label}</span>
          </div>
        </motion.div>

        {/* ── Interviewer message panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="glass-strong rounded-2xl px-5 py-4 sm:px-6 sm:py-5 text-center">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-electric-soft mb-2">
              AI Interviewer
            </p>
            {lastAIEntry ? (
              <p className="text-sm sm:text-base leading-relaxed text-ink-200">
                {lastAIEntry.text}
              </p>
            ) : (
              <p className="text-sm sm:text-base leading-relaxed text-ink-400 italic">
                {visual.sub}
              </p>
            )}
            {/* Interim user text */}
            {speechRecognition.isListening && userText && (
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/70 mb-1">
                  You (speaking...)
                </p>
                <p className="text-sm text-ink-300">{userText}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Bottom controls ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col items-center gap-4 sm:gap-5 pb-4 sm:pb-8"
        >
          <InterviewMicButton
            speakerState={state.speakerState}
            isMuted={state.isMuted}
            onToggleMute={() => dispatch({ type: 'TOGGLE_MUTE' })}
          />

          {/* Voice unsupported hint */}
          {!speechRecognition.isSupported && state.status === 'active' && (
            <p className="text-xs text-amber-400/80 text-center max-w-md">
              Voice input isn&apos;t supported in this browser — type your answer below. Chrome works best for voice.
            </p>
          )}

          {/* Honest offline notice — seed questions are not AI output */}
          {aiOffline && state.status === 'active' && (
            <p className="text-xs text-amber-400/80 text-center max-w-md">
              AI service is offline — showing offline practice questions. Answers won&apos;t be AI-scored until the service reconnects.
            </p>
          )}

          {/* Text input — always available during an active interview */}
          {state.status === 'active' && (
            <TextInputFallback
              onSubmit={handleTextSubmit}
              disabled={state.speakerState !== 'listening'}
            />
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_TRANSCRIPT' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                state.showTranscript
                  ? 'bg-electric/15 text-electric border border-electric/20'
                  : 'bg-white/[0.04] text-ink-400 border border-white/[0.08] hover:bg-white/[0.08] hover:text-ink-200'
              }`}
              aria-label="Toggle transcript"
            >
              <MessageSquare className="w-4 h-4" />
              Transcript
            </button>

            <button
              onClick={() => dispatch({ type: 'TOGGLE_END_CONFIRM' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 transition-all cursor-pointer"
              aria-label="End interview"
            >
              <PhoneOff className="w-4 h-4" />
              End Interview
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Transcript drawer ── */}
      <TranscriptDrawer
        entries={state.transcript}
        isOpen={state.showTranscript}
        onClose={() => dispatch({ type: 'TOGGLE_TRANSCRIPT' })}
      />

      {/* ── End confirm modal ── */}
      <EndConfirmModal
        isOpen={state.showEndConfirm}
        questionNumber={state.questionNumber}
        mode={state.mode}
        onConfirm={handleEnd}
        onCancel={() => dispatch({ type: 'TOGGLE_END_CONFIRM' })}
      />
    </motion.div>
  )
}
