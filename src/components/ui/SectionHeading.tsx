import type { ReactNode } from 'react'
import Reveal from './Reveal'

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  sub?: string
  center?: boolean
}

export default function SectionHeading({
  eyebrow,
  title,
  sub,
  center = true,
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-14 max-w-3xl ${center ? 'mx-auto text-center' : 'text-left'}`}
    >
      {eyebrow && (
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-glow/25 bg-indigo-glow/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-electric-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-electric-soft shadow-[0_0_10px_2px_rgba(122,162,255,0.7)]" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  )
}