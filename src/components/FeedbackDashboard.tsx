import { motion, useInView } from 'framer-motion'
import { BrainCircuit, CheckCircle2, Sparkles } from 'lucide-react'
import { useRef } from 'react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import { dashboardMetrics, improvementAreas } from '../data/content'

function ScoreRing() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const size = 196
  const stroke = 14
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const score = 88

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset: circumference * (1 - score / 100) } : {}}
          transition={{ duration: 1.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: 'drop-shadow(0 0 14px rgba(99,102,241,0.6))' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f7cff" />
            <stop offset="55%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Overall Score
        </span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-display text-5xl font-bold text-white">{score}</span>
          <span className="text-base font-medium text-slate-500">/100</span>
        </div>
        <span className="mt-1.5 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
          Excellent
        </span>
      </div>
    </div>
  )
}

function MetricBar({
  label,
  value,
  index,
}: {
  label: string
  value: number
  index: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="font-display font-semibold text-white">{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.1, delay: 0.25 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-electric via-indigo-glow to-violet-glow shadow-[0_0_10px_rgba(99,102,241,0.6)]"
        />
      </div>
    </div>
  )
}

export default function FeedbackDashboard() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="AI Feedback"
          title={
            <>
              Know Exactly How <span className="text-gradient">You Performed</span>
            </>
          }
          sub="Every answer is scored and explained the moment you finish speaking."
        />

        <Reveal>
          <div className="glass-strong hairline-glow overflow-hidden rounded-[2rem]">
            {/* panel top bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 sm:px-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Sparkles className="h-4 w-4 text-electric-soft" />
                Session Report — React Developer
              </div>
              <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:block">
                Generated in 2.1s
              </span>
            </div>

            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[auto_1fr]">
              {/* score ring */}
              <div className="flex justify-center lg:pr-8 lg:border-r lg:border-white/[0.06]">
                <ScoreRing />
              </div>

              {/* metrics */}
              <div className="grid content-center gap-6 sm:grid-cols-2">
                {dashboardMetrics.map((m, i) => (
                  <MetricBar key={m.label} label={m.label} value={m.value} index={i} />
                ))}
              </div>
            </div>

            {/* feedback + improve */}
            <div className="grid gap-6 border-t border-white/[0.06] p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-violet-glow/20 bg-gradient-to-br from-violet-glow/[0.08] to-transparent p-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-glow/30 to-electric/30 ring-1 ring-violet-glow/30">
                    <BrainCircuit className="h-4.5 w-4.5 text-violet-glow" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">AI Mentor Feedback</div>
                    <div className="text-[11px] text-slate-500">What to keep doing</div>
                  </div>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
                  “Your answer was structured clearly and demonstrated strong technical
                  understanding. Try giving a more specific example to make your response
                  more convincing.”
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                <div className="text-sm font-semibold text-white">Areas to Improve</div>
                <ul className="mt-4 space-y-3">
                  {improvementAreas.map((area) => (
                    <li key={area} className="flex items-center gap-2.5 text-sm text-slate-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-electric-soft" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}