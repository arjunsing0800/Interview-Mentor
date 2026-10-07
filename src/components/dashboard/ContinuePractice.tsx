import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { continueSession } from '../../data/content'

export default function ContinuePractice() {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="mb-3 font-display text-base font-semibold text-white">
        Continue where you left off
      </h2>
      <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">{continueSession.type}</p>
          <p className="text-xs text-slate-500">
            Question {continueSession.question} of {continueSession.totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-electric-soft">
            {continueSession.percent}% complete
          </span>
          <Link to="/interview/technical" className="btn-primary px-4 py-2 text-[12px] inline-flex items-center">
            Continue
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
