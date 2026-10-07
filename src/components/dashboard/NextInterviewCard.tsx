import { ArrowRight } from 'lucide-react'
import { nextInterview } from '../../data/content'

export default function NextInterviewCard() {
  return (
    <div className="glass-strong hairline-glow overflow-hidden rounded-2xl">
      <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-electric/[0.06] via-indigo-glow/[0.04] to-transparent" />
        <div className="relative flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Your Next Interview
          </p>
          <h2 className="font-display text-lg font-semibold text-white">
            {nextInterview.company} — {nextInterview.role}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {nextInterview.date} · {nextInterview.time}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-500">Readiness</span>
                <span className="font-semibold text-white">{nextInterview.readiness}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-electric to-indigo-glow"
                  style={{ width: `${nextInterview.readiness}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-3">
          <button type="button" className="btn-primary px-6 py-3 text-sm">
            Start Practice
            <ArrowRight className="h-4 w-4" />
          </button>
          <button type="button" className="btn-ghost px-5 py-3 text-sm">
            View Plan
          </button>
        </div>
      </div>
    </div>
  )
}
