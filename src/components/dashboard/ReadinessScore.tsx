import { readinessMetrics } from '../../data/content'

const SIZE = 140
const STROKE = 8
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const OFFSET = CIRCUMFERENCE * (1 - readinessMetrics.overall / 100)

export default function ReadinessScore() {
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="mb-5 font-display text-base font-semibold text-white">Your Readiness</h2>
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={STROKE}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={OFFSET}
              className="transition-[stroke-dashoffset] duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f7cff" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold text-white">
              {readinessMetrics.overall}
            </span>
            <span className="text-[11px] text-slate-500">/100</span>
          </div>
        </div>
        <span className="mt-3 rounded-full bg-electric/10 px-3 py-1 text-xs font-semibold text-electric-soft">
          {readinessMetrics.status}
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {readinessMetrics.breakdown.map((m) => (
          <div key={m.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">{m.label}</span>
              <span className="font-medium text-white">{m.value}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-electric/60 to-indigo-glow/60"
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
