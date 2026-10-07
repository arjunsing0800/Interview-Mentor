import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Mic, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from './ui/Reveal'

function Particles() {
  const reduce = useReducedMotion()
  if (reduce) return null
  const dots = Array.from({ length: 22 })
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((_, i) => {
        const left = (i * 47) % 100
        const top = (i * 31) % 70
        const size = 2 + (i % 3)
        const dur = 9 + (i % 6) * 2
        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-electric-soft/80 shadow-[0_0_12px_rgba(122,162,255,0.8)]"
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
            animate={{
              y: [0, -42, 0],
              opacity: [0.15, 0.7, 0.15],
            }}
            transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.24 }}
          />
        )
      })}
    </div>
  )
}

export default function CTA() {
  const reduce = useReducedMotion()

  return (
    <section id="start" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="glass-strong hairline-glow relative overflow-hidden rounded-[2.5rem] px-6 py-20 text-center sm:px-12 sm:py-24">
            {/* futuristic grid */}
            <div className="absolute inset-0 grid-lines opacity-[0.14] [mask-image:radial-gradient(ellipse_at_center,_black_30%,_transparent_75%)]" />

            {/* glowing AI orb */}
            <motion.div
              animate={reduce ? {} : { scale: [1, 1.12, 1], opacity: [0.5, 0.95, 0.5] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(79,124,255,0.35),_rgba(139,92,246,0.12)_45%,_transparent_68%)] blur-2xl"
            />
            <div className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-electric/15" />
            <div className="animate-spin-slower pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-electric/10" />

            <Particles />

            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-electric/25 bg-electric/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-electric-soft">
                <Sparkles className="h-3.5 w-3.5" />
                Ready when you are
              </span>

              <h2 className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Your Next Interview Shouldn&apos;t Be{' '}
                <span className="text-gradient">Your First Practice.</span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                Practice with your AI mentor today and walk into your next interview with
                confidence.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/signup" className="btn-primary w-full px-8 py-4 text-base sm:w-auto">
                  <Mic className="h-4.5 w-4.5" />
                  Start Your First Interview
                </Link>
                <a
                  href="#practice"
                  className="btn-ghost w-full px-8 py-4 text-base sm:w-auto"
                >
                  Explore Interview Modes
                  <ArrowRight className="h-4.5 w-4.5" />
                </a>
              </div>

              <p className="mt-8 text-xs font-medium uppercase tracking-[0.28em] text-slate-600">
                Free to start · No credit card required
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}