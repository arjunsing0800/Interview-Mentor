import { Code, Users, Target, FileText, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { practiceModules } from '../../data/content'

const icons: Record<string, ReactNode> = {
  technical: <Code className="h-5 w-5" />,
  hr: <Users className="h-5 w-5" />,
  behavioral: <Target className="h-5 w-5" />,
  resume: <FileText className="h-5 w-5" />,
}

export default function PracticeModules() {
  return (
    <div>
      <h2 className="mb-4 font-display text-base font-semibold text-white">Continue Practicing</h2>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {practiceModules.map((mod) => (
          <Link
            key={mod.id}
            to={`/interview/${mod.id}`}
            className="glass group flex items-start gap-4 rounded-2xl p-4 text-left transition-all hover:bg-white/[0.06] hover:translate-y-[-2px] sm:p-5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-electric-soft transition-colors group-hover:bg-electric/15">
              {icons[mod.id]}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-white">{mod.title}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{mod.description}</p>
              <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-electric-soft transition-colors group-hover:text-electric">
                Practice <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
