import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import {
  ArrowRight,
  Activity,
  Bot,
  BrainCircuit,
  MessageSquareText,
  Mic,
  Sparkles,
} from 'lucide-react'
import { lazy, Suspense, useCallback } from 'react'
import FloatingMetricCard from './FloatingMetricCard'
import SceneFallback from './three/SceneFallback'

const AvatarScene = lazy(() => import('./three/AvatarScene'))

function HeroVisual({ sx, sy }: { sx: MotionValue<number>; sy: MotionValue<number> }) {
  const card1x = useTransform(sx, (v) => v * 22)
  const card1y = useTransform(sy, (v) => v * 16)
  const card2x = useTransform(sx, (v) => v * -18)
  const card2y = useTransform(sy, (v) => v * -20)
  const card3x = useTransform(sx, (v) => v * 30)
  const card3y = useTransform(sy, (v) => v * 24)
  const card4x = useTransform(sx, (v) => v * -34)
  const card4y = useTransform(sy, (v) => v * -28)
  const sceneX = useTransform(sx, (v) => v * 10)
  const sceneY = useTransform(sy, (v) => v * 7)
  const lightX = useTransform(sx, (v) => v * -16)
  const lightY = useTransform(sy, (v) => v * -12)

  return (
    <div className="relative z-0 mx-auto w-full max-w-[560px] lg:max-w-none">
      {/* radial light behind avatar */}
      <motion.div
        style={{ x: lightX, y: lightY }}
        className="absolute left-1/2 top-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(79,124,255,0.24),_transparent_62%)] blur-2xl"
      />

      {/* primary 3D stage — moves softly with mouse */}
      <motion.div style={{ x: sceneX, y: sceneY }} className="relative aspect-square w-full">
        <div className="absolute inset-0 [transform:rotateX(7deg)] [-webkit-mask-image:radial-gradient(ellipse_58%_58%_at_center,black_58%,transparent_88%)] [mask-image:radial-gradient(ellipse_58%_58%_at_center,black_58%,transparent_88%)]">
          <Suspense fallback={<SceneFallback />}>
            <AvatarScene />
          </Suspense>
        </div>
      </motion.div>

      {/* floating metric cards — deeper parallax */}
      <motion.div
        style={{ x: card1x, y: card1y }}
        className="absolute left-[-2%] top-[12%] hidden md:block lg:top-[16%]"
      >
            <FloatingMetricCard
              label="Confidence"
              value={87}
              tint="from-electric-soft to-indigo-glow"
              icon={BrainCircuit}
            />
          </motion.div>

          <motion.div
            style={{ x: card2x, y: card2y }}
            className="absolute right-[-1%] top-[30%] hidden md:block lg:right-[-4%]"
          >
            <FloatingMetricCard
              label="Communication"
              value={92}
              delay={0.25}
              tint="from-indigo-glow to-violet-glow"
              icon={MessageSquareText}
              float="float-slow"
            />
          </motion.div>

          <motion.div
            style={{ x: card3x, y: card3y }}
            className="absolute bottom-[22%] left-[4%] hidden md:block"
          >
            <FloatingMetricCard
              label="Technical Skills"
              value={84}
              delay={0.45}
              tint="from-cyan-soft to-electric"
              icon={Activity}
              float="float-slow"
            />
          </motion.div>

          {/* AI feedback card — deepest layer */}
          <motion.div
            style={{ x: card4x, y: card4y }}
            className="absolute bottom-[8%] right-[0%] lg:right-[-3%]"
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="animate-float-slow glass card-glow w-44 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/8">
                  <Bot className="h-3.5 w-3.5 text-cyan-soft" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                  AI Feedback
                </span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-200">
                “Strong answer structure”
              </p>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-soft shadow-[0_0_8px_rgba(63,216,255,0.9)]" />
                <span className="text-[10px] font-medium tracking-wide text-slate-400">
                  Analyzing · live
                </span>
              </div>
            </motion.div>
          </motion.div>
    </div>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 55, damping: 18, mass: 0.7 })
  const sy = useSpring(my, { stiffness: 55, damping: 18, mass: 0.7 })

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reduce) return
      const rect = e.currentTarget.getBoundingClientRect()
      mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2)
      my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2)
    },
    [mx, my, reduce],
  )

  const onLeave = useCallback(() => {
    mx.set(0)
    my.set(0)
  }, [mx, my])

  return (
    <section
      id="home"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative overflow-hidden pt-32 pb-10 sm:pt-36 lg:pt-40"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        {/* ================= LEFT — copy ================= */}
        <div className="relative z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-electric/25 bg-electric/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-electric-soft"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Interview Coach
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-[4rem]"
          >
            Ace Your Next Interview With Your{' '}
            <span className="text-gradient">AI Mentor</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0"
          >
            Practice realistic interviews, receive instant AI feedback, and build the
            confidence you need to perform at your best.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <a
              href="#start"
              className="btn-primary w-full px-7 py-4 text-base sm:w-auto"
            >
              <Mic className="h-4.5 w-4.5" />
              Start Mock Interview
            </a>
            <a href="#practice" className="btn-ghost w-full px-7 py-4 text-base sm:w-auto">
              Explore Platform
              <ArrowRight className="h-4.5 w-4.5" />
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.55 }}
            className="mt-7 text-xs font-medium uppercase tracking-[0.28em] text-slate-500"
          >
            Practice • Analyze • Improve • Repeat
          </motion.p>
        </div>

        {/* ================= RIGHT — 3D visual ================= */}
        <HeroVisual sx={sx} sy={sy} />
      </div>
    </section>
  )
}