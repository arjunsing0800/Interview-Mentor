import { Suspense, lazy } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Users, MessageSquareText, FileText, ArrowRight, ArrowLeft, Mic } from 'lucide-react'
import type { InterviewMode } from '../lib/interview/types'
import { useAuth } from '../context/AuthContext'
import MagicRings from '../components/reactbits/MagicRings'

const AvatarScene = lazy(() => import('../components/three/AvatarScene'))

const modes: {
  mode: InterviewMode
  icon: typeof Brain
  title: string
  description: string
  color: string
}[] = [
  {
    mode: 'technical',
    icon: Brain,
    title: 'Technical Interview',
    description: 'Data structures, algorithms, system design, APIs, and coding fundamentals.',
    color: 'from-blue-500/15 to-cyan-500/15 border-blue-500/20',
  },
  {
    mode: 'hr',
    icon: Users,
    title: 'HR Interview',
    description: 'Your background, strengths, weaknesses, goals, and workplace fit.',
    color: 'from-violet-500/15 to-purple-500/15 border-violet-500/20',
  },
  {
    mode: 'behavioral',
    icon: MessageSquareText,
    title: 'Behavioral Interview',
    description: 'Real experiences: leadership, failure, conflict, and teamwork.',
    color: 'from-amber-500/15 to-orange-500/15 border-amber-500/20',
  },
  {
    mode: 'resume',
    icon: FileText,
    title: 'Resume Interview',
    description: 'Deep dive into your projects, experience, and resume details.',
    color: 'from-emerald-500/15 to-teal-500/15 border-emerald-500/20',
  },
]

export default function InterviewSetup() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Candidate'

  return (
    <div className="relative min-h-screen bg-ink-950 overflow-hidden">
      {/* MagicRings background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <MagicRings
          color="#3b5bdb"
          colorTwo="#7c3aed"
          ringCount={4}
          attenuation={10}
          lineThickness={1.5}
          baseRadius={0.3}
          radiusStep={0.1}
          opacity={0.4}
          noiseAmount={0.05}
          speed={0.4}
        />
      </div>
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(4,5,13,0.85)_100%)]" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 border-b border-white/[0.06] bg-ink-950/60 backdrop-blur-xl"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-ink-400 hover:text-ink-200 text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <span className="text-ink-700">|</span>
          <Mic className="w-4 h-4 text-electric" />
          <span className="text-ink-200 font-medium text-sm">Choose Interview Mode</span>
        </div>
      </motion.header>

      {/* Small bot preview */}
      <div className="relative z-10 flex justify-center pt-8 sm:pt-12">
        <div className="w-28 h-28 sm:w-36 sm:h-36 [transform:rotateX(5deg)]">
          <Suspense fallback={null}>
            <AvatarScene lite />
          </Suspense>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-100 mb-3 font-display">
            Start Your Interview
          </h1>
          <p className="text-ink-400 text-sm max-w-md mx-auto leading-relaxed">
            Choose your interview type. You'll have a voice conversation with your AI interviewer.
            The interview adapts to your responses in real time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8">
          {modes.map(({ mode, icon: Icon, title, description, color }, i) => (
            <motion.button
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
              onClick={() => navigate(`/interview/${mode}`)}
              className={`
                group relative text-left p-5 sm:p-6 rounded-2xl border bg-gradient-to-br
                ${color}
                hover:brightness-110 hover:translate-y-[-2px] transition-all duration-200 cursor-pointer
              `}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-ink-900/50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-ink-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-ink-100 font-semibold mb-1 text-sm sm:text-base">{title}</h3>
                  <p className="text-ink-400 text-xs sm:text-sm leading-relaxed">{description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-ink-500 group-hover:text-ink-300 transition-colors shrink-0 mt-1" />
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="glass rounded-2xl p-5 text-center"
        >
          <p className="text-ink-400 text-sm">
            Welcome <span className="text-ink-200 font-medium">{name}</span>. Each interview is ~10 questions
            and takes about 5–10 minutes. Your responses are evaluated for communication,
            technical knowledge, and confidence.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
