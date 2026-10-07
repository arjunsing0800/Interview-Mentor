import { Bot, Mic, UserRound } from 'lucide-react'
import { lazy, Suspense } from 'react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import SceneFallback from './three/SceneFallback'

const AvatarScene = lazy(() => import('./three/AvatarScene'))

function Waveform() {
  const bars = Array.from({ length: 26 })
  return (
    <div className="flex h-10 items-center gap-[3px]">
      {bars.map((_, i) => (
        <span
          key={i}
          className="animate-eq w-[3px] origin-center rounded-full bg-gradient-to-t from-electric to-cyan-soft"
          style={{
            height: `${30 + ((i * 37) % 62)}%`,
            animationDelay: `${(i % 8) * 0.09}s`,
            animationDuration: `${0.9 + ((i % 5) * 0.07)}s`,
          }}
        />
      ))}
    </div>
  )
}

function ProcessingIndicator() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-electric-soft opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-electric-soft" />
      </span>
      <span className="font-medium text-slate-300">AI is analyzing your response</span>
      <span className="flex items-end gap-0.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-electric-soft" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-electric-soft [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-electric-soft [animation-delay:400ms]" />
      </span>
    </div>
  )
}

export default function InterviewDemo() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,_rgba(99,102,241,0.1),_transparent_65%)] blur-2xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The experience"
          title={
            <>
              Step Inside the <span className="text-gradient">Interview Room</span>
            </>
          }
          sub="This is what a live session with your AI mentor actually feels like."
        />

        <div className="grid items-stretch gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* ===== Left: AI interviewer avatar panel ===== */}
          <Reveal>
            <div className="glass-strong hairline-glow relative h-full overflow-hidden rounded-[2rem] p-4 sm:p-6">
              <div className="flex items-center justify-between px-2 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric/30 to-violet-glow/30 ring-1 ring-electric/30">
                    <Bot className="h-4.5 w-4.5 text-electric-soft" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">AI Interviewer</div>
                    <div className="text-[11px] text-slate-400">Live session</div>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  REC
                </span>
              </div>

              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/[0.06]">
                <div className="absolute left-1/2 top-1/2 -z-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(79,124,255,0.18),_transparent_60%)] blur-xl" />
                <Suspense fallback={<SceneFallback />}>
                  <AvatarScene lite />
                </Suspense>
              </div>

              {/* caption */}
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                <span className="h-1 w-1 rounded-full bg-electric-soft" />
                Virtual interview environment
                <span className="h-1 w-1 rounded-full bg-electric-soft" />
              </div>
            </div>
          </Reveal>

          {/* ===== Right: live conversation interface ===== */}
          <Reveal delay={0.15}>
            <div className="glass-strong hairline-glow flex h-full flex-col rounded-[2rem] p-5 sm:p-7">
              {/* AI interviewer question */}
              <div className="flex items-start gap-3.5">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-electric/30 to-violet-glow/30 ring-1 ring-electric/30">
                  <Bot className="h-5 w-5 text-electric-soft" />
                </span>
                <div className="flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    AI Interviewer
                  </div>
                  <div className="mt-1.5 rounded-2xl rounded-tl-md border border-white/[0.07] bg-white/[0.04] px-4 py-3.5 text-[15px] leading-relaxed text-slate-100">
                    “Tell me about a challenging project you worked on.”
                  </div>
                </div>
              </div>

              {/* divider */}
              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Your response
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* your mic response */}
              <div className="flex items-start gap-3.5">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/15">
                  <UserRound className="h-5 w-5 text-slate-300" />
                </span>
                <div className="flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    You
                  </div>
                  <div className="mt-1.5 rounded-2xl rounded-tl-md border border-electric/25 bg-electric/[0.07] px-4 py-3.5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Mic className="h-4 w-4 text-electric-soft" />
                      Speak your answer
                    </div>
                    <div className="mt-3">
                      <Waveform />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Your voice is transcribed and analyzed in real time.
                  </p>
                </div>
              </div>

              {/* analyzing */}
              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5">
                <ProcessingIndicator />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}