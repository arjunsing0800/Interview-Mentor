import { ArrowUpRight, Briefcase, Code2, FileText, MessagesSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import { interviewModes } from '../data/content'

const modeIcons = {
  technical: Code2,
  hr: Briefcase,
  behavioral: MessagesSquare,
  resume: FileText,
} as const

export default function InterviewModes() {
  return (
    <section id="practice" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Interview modes"
          title={
            <>
              Practice <span className="text-gradient">Any Interview</span>
            </>
          }
          sub="Pick the format that matches the role you are targeting — the mentor adapts to you."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {interviewModes.map((mode, i) => {
            const Icon = modeIcons[mode.id as keyof typeof modeIcons]
            return (
              <Reveal key={mode.id} delay={0.08 * i}>
                <Link
                  to={`/interview/${mode.id}`}
                  className="group glass card-glow hairline-glow relative flex h-full flex-col rounded-3xl p-7 transition-all duration-400 will-change-transform hover:-translate-y-2.5 hover:shadow-[0_34px_80px_-32px_rgba(99,102,241,0.55)]"
                  style={{
                    transform: 'perspective(800px)',
                    transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s ease',
                  }}
                >
                  {/* hover glow pool */}
                  <div className="absolute inset-x-6 top-4 h-20 rounded-full bg-electric/0 blur-2xl transition-all duration-500 group-hover:bg-electric/20" />

                  <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-electric/20 to-violet-glow/20 ring-1 ring-electric/25 transition-all duration-500 group-hover:scale-110 group-hover:ring-electric/60">
                    <Icon className="h-6 w-6 text-electric-soft transition-colors duration-500 group-hover:text-white" />
                  </div>

                  <h3 className="relative mt-6 font-display text-lg font-semibold text-white">
                    {mode.title}
                  </h3>
                  <p className="relative mt-2.5 flex-1 text-sm leading-relaxed text-slate-400">
                    {mode.body}
                  </p>

                  <div className="relative mt-6 flex items-center gap-1.5 text-sm font-semibold text-electric-soft transition-colors duration-300 group-hover:text-white">
                    Practice now
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}