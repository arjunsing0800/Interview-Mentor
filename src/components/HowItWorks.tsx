import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { ListChecks, MessageSquareText, Gauge } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import { steps } from '../data/content'

const stepIcons = [ListChecks, MessageSquareText, Gauge]

export default function HowItWorks() {
  const connectorRef = useRef<HTMLDivElement>(null)
  const inView = useInView(connectorRef, { once: true, margin: '-100px' })

  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              How Your <span className="text-gradient">AI Interview Mentor</span> Works
            </>
          }
          sub="Three simple steps from nervous to prepared."
        />

        <div ref={connectorRef} className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          {/* connected line */}
          <div
            className={`pointer-events-none absolute left-[16%] right-[16%] top-7 hidden h-px transition-opacity duration-1000 md:block ${
              inView ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="connector-dotted h-px w-full" />
            <div
              className="absolute -top-[2px] h-[5px] w-[5px] rounded-full bg-electric-soft shadow-[0_0_10px_rgba(122,162,255,0.9)]"
              style={{ left: `${inView ? 100 : 0}%`, transition: 'left 1.4s ease 0.3s' }}
            />
          </div>

          {steps.map((step, i) => {
            const Icon = stepIcons[i]
            return (
              <Reveal key={step.num} delay={0.12 * (i + 1)}>
                <div className="group glass card-glow hairline-glow relative h-full rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_70px_-30px_rgba(99,102,241,0.5)]">
                  <div className="flex items-start justify-between">
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-electric/25 to-violet-glow/25 ring-1 ring-electric/30">
                      <Icon className="h-6 w-6 text-electric-soft" />
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-electric-soft opacity-70 shadow-[0_0_10px_rgba(122,162,255,0.9)] group-hover:opacity-100" />
                    </span>
                    <span className="font-display text-5xl font-bold leading-none text-white/[0.08]">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}