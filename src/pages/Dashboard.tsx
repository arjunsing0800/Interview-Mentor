import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Menu, X, Sparkles, MessageSquare, ChevronRight } from 'lucide-react'
import { Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import SplashCursor from '../components/reactbits/SplashCursor'
import AuroraBackground from '../components/AuroraBackground'
import Sidebar from '../components/dashboard/Sidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardHero from '../components/dashboard/DashboardHero'
import NextInterviewCard from '../components/dashboard/NextInterviewCard'
import ReadinessScore from '../components/dashboard/ReadinessScore'
import PracticeModules from '../components/dashboard/PracticeModules'
import ContinuePractice from '../components/dashboard/ContinuePractice'
import {
  dashboardStats,
  weeklyActivity,
  aiInsights,
  recentInterviews,
} from '../data/content'

const Starfield = lazy(() => import('../components/Starfield'))

const maxMinutes = Math.max(...weeklyActivity.map((d) => d.minutes), 1)

function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {dashboardStats.map((stat) => (
        <div key={stat.label} className="glass rounded-2xl p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500">{stat.label}</span>
          <p className="mt-1 font-display text-2xl font-semibold text-white">{stat.value}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">{stat.change}</p>
        </div>
      ))}
    </div>
  )
}

function WeeklyActivityChart() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-white">Your Progress</h2>
        <div className="flex gap-1">
          {['7D', '30D', 'All'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-colors ${
                tab === '7D'
                  ? 'bg-white/[0.08] text-white'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-2.5" style={{ height: 130 }}>
        {weeklyActivity.map((day) => (
          <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative w-full" style={{ height: 95 }}>
              <div
                className="absolute bottom-0 w-full rounded-lg bg-gradient-to-t from-electric/40 to-indigo-glow/20 transition-all duration-500"
                style={{
                  height: `${(day.minutes / maxMinutes) * 100}%`,
                  minHeight: day.minutes > 0 ? 6 : 0,
                }}
              />
            </div>
            <span className="text-[11px] font-medium text-slate-600">{day.day}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
        <span className="text-xs text-slate-500">This week</span>
        <span className="text-sm font-semibold text-white">
          {weeklyActivity.reduce((s, d) => s + d.interviews, 0)} interviews ·{' '}
          {weeklyActivity.reduce((s, d) => s + d.minutes, 0)} min
        </span>
      </div>
    </div>
  )
}

function AICoachInsights() {
  return (
    <div className="glass-strong hairline-glow rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric/20 to-indigo-glow/20">
          <MessageSquare className="h-4 w-4 text-electric-soft" />
        </div>
        <h2 className="font-display text-base font-semibold text-white">Your AI Coach Says</h2>
      </div>
      <div className="space-y-3">
        {aiInsights.map((insight, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/[0.03] px-4 py-3 text-[13px] leading-relaxed text-slate-300"
          >
            &ldquo;{insight}&rdquo;
          </div>
        ))}
      </div>
      <button type="button" className="btn-ghost mt-4 w-full py-2.5 text-xs">
        View Detailed Feedback
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function RecentInterviews() {
  return (
    <div>
      <h2 className="mb-4 font-display text-base font-semibold text-white">Recent Interviews</h2>
      <div className="glass overflow-hidden rounded-2xl">
        {recentInterviews.map((interview, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-white/[0.04] px-5 py-3.5 last:border-0 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-electric-soft shadow-[0_0_6px_rgba(122,162,255,0.6)]" />
              <div>
                <p className="text-sm font-medium text-white">{interview.company}</p>
                <p className="text-xs text-slate-500">{interview.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-white">{interview.score}</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                Completed
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const reduce = useReducedMotion()
  const [mobileOpen, setMobileOpen] = useState(false)

  const fadeIn = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <div className="relative min-h-dvh isolate bg-ink-950">
      <AuroraBackground />
      <Suspense fallback={null}>
        <Starfield />
      </Suspense>
      <SplashCursor zIndex={5} />

      <div className="relative z-10 flex min-h-dvh flex-col lg:flex-row">
        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-white/[0.06] lg:bg-ink-950/80 lg:backdrop-blur-xl lg:p-5">
          <Sidebar />
        </div>

        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-ink-950/80 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-electric via-indigo-glow to-violet-glow">
              <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2.2} />
            </span>
            <span className="font-display text-sm font-semibold text-white">
              AI Interview<span className="ml-1 text-gradient">Mentor</span>
            </span>
          </Link>
        </header>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/[0.06] bg-ink-950 p-5 lg:hidden"
              >
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
                <Sidebar onNavigate={() => setMobileOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main area */}
        <div className="flex min-h-dvh flex-1 flex-col lg:ml-60">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* AI Mentor Hero with 3D Bot */}
            <motion.div {...fadeIn(0)}>
              <DashboardHero />
            </motion.div>

            {/* Next Interview */}
            <motion.div {...fadeIn(0.05)} className="mb-6 sm:mb-8">
              <NextInterviewCard />
            </motion.div>

            {/* Continue Practice */}
            <motion.div {...fadeIn(0.1)} className="mb-6 sm:mb-8">
              <ContinuePractice />
            </motion.div>

            {/* Readiness + Stats */}
            <motion.div {...fadeIn(0.15)} className="mb-6 sm:mb-8">
              <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
                <ReadinessScore />
                <div className="flex flex-col gap-6">
                  <StatCards />
                </div>
              </div>
            </motion.div>

            {/* Practice Modules */}
            <motion.div {...fadeIn(0.2)} className="mb-6 sm:mb-8">
              <PracticeModules />
            </motion.div>

            {/* Activity + Insights */}
            <motion.div {...fadeIn(0.25)} className="mb-6 grid gap-6 xl:grid-cols-[1fr_380px] sm:mb-8">
              <WeeklyActivityChart />
              <AICoachInsights />
            </motion.div>

            {/* Recent Interviews */}
            <motion.div {...fadeIn(0.3)}>
              <RecentInterviews />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}
