import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell } from 'lucide-react'
import { dashboardUser } from '../../data/content'
import { useAuth } from '../../context/AuthContext'

export default function DashboardHeader() {
  const { user } = useAuth()
  const [searchFocused, setSearchFocused] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const userName =
    user?.user_metadata?.full_name?.split(' ')[0] || dashboardUser.name

  return (
    <header className="hidden items-center justify-between border-b border-white/[0.06] bg-ink-950/60 px-8 py-4 backdrop-blur-xl lg:flex">
      <div>
        <h1 className="font-display text-xl font-semibold text-white">
          Welcome back, {userName} 👋
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Your interview readiness is looking strong.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 transition-all ${
            searchFocused
              ? 'border-electric/40 bg-white/[0.06] ring-2 ring-electric/20'
              : 'border-white/10 bg-white/[0.03]'
          }`}
        >
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-44 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-electric-soft shadow-[0_0_6px_rgba(122,162,255,0.8)]" />
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-white/[0.08] bg-ink-900/95 p-3 shadow-2xl backdrop-blur-xl"
              >
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Notifications
                </p>
                <div className="space-y-1">
                  <div className="rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/[0.04]">
                    Your readiness score increased to 88%
                  </div>
                  <div className="rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/[0.04]">
                    New practice mode available: Case Study
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-glow to-violet-glow text-sm font-semibold text-white">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
