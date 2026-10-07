import { Clock, Target, Video, Zap } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import { features } from '../data/content'

const featureIcons = {
  realistic: Video,
  instant: Zap,
  personalized: Target,
  anytime: Clock,
} as const

export default function Features() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why AI Interview Mentor"
          title={
            <>
              Built to Make You <span className="text-gradient">Hire-Ready</span>
            </>
          }
          sub="Everything you need to walk into any interview with real confidence."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = featureIcons[f.id as keyof typeof featureIcons]
            return (
              <Reveal key={f.id} delay={0.08 * i}>
                <div className="group glass card-glow hairline-glow relative h-full overflow-hidden rounded-3xl p-7 transition-all duration-400 hover:-translate-y-2 hover:bg-white/[0.05]">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-electric/0 blur-2xl transition-all duration-500 group-hover:bg-electric/15" />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] ring-1 ring-white/10 transition-all duration-500 group-hover:scale-110 group-hover:ring-electric/40">
                    <Icon className="h-5.5 w-5.5 text-electric-soft" />
                  </span>
                  <h3 className="relative mt-5 font-display text-lg font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="relative mt-2.5 text-sm leading-relaxed text-slate-400">
                    {f.body}
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