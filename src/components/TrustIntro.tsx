import Reveal from './ui/Reveal'
import Counter from './ui/Counter'
import { trustStats } from '../data/content'

export default function TrustIntro() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Prepare smarter. <span className="text-gradient">Interview better.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            AI Interview Mentor simulates realistic interview experiences and analyzes
            your performance to help you continuously improve.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {trustStats.map((stat, i) => (
            <Reveal key={stat.label} delay={0.12 * i}>
              <div className="glass card-glow hairline-glow mx-auto w-full max-w-xs rounded-2xl px-6 py-8">
                <div className="font-display text-4xl font-bold text-white sm:text-5xl">
                  {stat.isClock ? (
                    stat.value
                  ) : (
                    <>
                      <Counter target={stat.target} suffix={stat.suffix} />
                    </>
                  )}
                </div>
                <div className="mt-2 text-sm font-medium text-slate-400">
                  {stat.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}