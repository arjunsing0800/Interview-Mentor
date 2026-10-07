import { motion, useInView } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useRef } from 'react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import Counter from './ui/Counter'
import { performanceData, performanceStats } from '../data/content'

const W = 680
const H = 300
const PAD = { x: 56, top: 34, bottom: 52 }

const data = performanceData.map((d, i) => ({
  ...d,
  x: PAD.x + (i * (W - PAD.x * 2)) / (performanceData.length - 1),
  y: H - PAD.bottom - ((d.score - 50) / 50) * (H - PAD.top - PAD.bottom),
}))

function linePath() {
  return data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
}

function areaPath() {
  const first = data[0]
  const last = data[data.length - 1]
  return `${linePath()} L ${last.x} ${H - PAD.bottom} L ${first.x} ${H - PAD.bottom} Z`
}

export default function PerformanceChart() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="history" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Performance tracking"
          title={
            <>
              See Yourself <span className="text-gradient">Improve</span>
            </>
          }
          sub="Track your progress across multiple interviews and identify the skills that need the most improvement."
        />

        <Reveal>
          <div ref={ref} className="glass-strong hairline-glow rounded-[2rem] p-6 sm:p-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-electric/25 to-indigo-glow/25 ring-1 ring-electric/30">
                  <TrendingUp className="h-5 w-5 text-electric-soft" />
                </span>
                <div>
                  <div className="font-display text-base font-semibold text-white">
                    Interview Performance
                  </div>
                  <div className="text-xs text-slate-500">Last 4 sessions</div>
                </div>
              </div>
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                +26% vs first session
              </span>
            </div>

            {/* ===== Chart ===== */}
            <div className="relative mt-8">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Performance trend">
                <defs>
                  <linearGradient id="perfLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4f7cff" />
                    <stop offset="55%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                  <linearGradient id="perfArea" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(99,102,241,0.32)" />
                    <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                  </linearGradient>
                </defs>

                {/* horizontal grid */}
                {[50, 65, 80, 95].map((v) => {
                  const y = H - PAD.bottom - ((v - 50) / 50) * (H - PAD.top - PAD.bottom)
                  return (
                    <g key={v}>
                      <line
                        x1={PAD.x}
                        x2={W - PAD.x}
                        y1={y}
                        y2={y}
                        stroke="rgba(255,255,255,0.05)"
                        strokeDasharray="3 6"
                      />
                      <text
                        x={PAD.x - 14}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="11"
                        fill="#94a3b8"
                      >
                        {v}
                      </text>
                    </g>
                  )
                })}

                {/* area fill */}
                <motion.path
                  d={areaPath()}
                  fill="url(#perfArea)"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 1.4, delay: 0.9 }}
                />

                {/* main line */}
                <motion.path
                  d={linePath()}
                  fill="none"
                  stroke="url(#perfLine)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{ filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.8))' }}
                />

                {/* data points */}
                {data.map((p, i) => (
                  <g key={p.label}>
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r="5"
                      fill="#0b1026"
                      stroke="url(#perfLine)"
                      strokeWidth="2.5"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={inView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ delay: 0.5 + i * 0.22, type: 'spring', stiffness: 260, damping: 18 }}
                      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    />
                    <motion.text
                      x={p.x}
                      y={p.y - 16}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="700"
                      fill="#e2e8f0"
                      initial={{ opacity: 0, y: 6 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.6 + i * 0.22 }}
                    >
                      {p.score}
                    </motion.text>
                  </g>
                ))}

                {/* x labels */}
                {data.map((p) => (
                  <text
                    key={p.label}
                    x={p.x}
                    y={H - PAD.bottom + 30}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#94a3b8"
                  >
                    {p.label}
                  </text>
                ))}
              </svg>
            </div>

            {/* ===== Stats ===== */}
            <div className="mt-10 grid grid-cols-1 gap-6 border-t border-white/[0.06] pt-8 sm:grid-cols-3">
              {performanceStats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 text-center">
                  <div className="font-display text-3xl font-bold text-white">
                    {s.value === '+26%' ? (
                      s.value
                    ) : (
                      <Counter target={Number(s.value)} />
                    )}
                  </div>
                  <div className="mt-1.5 text-xs font-medium tracking-wide text-slate-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}