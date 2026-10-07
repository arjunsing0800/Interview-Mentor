import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  LayoutDashboard,
  Code,
  CalendarCheck,
  BarChart3,
  BookOpen,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react'
import { dashboardUser } from '../../data/content'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Practice', icon: Code },
  { label: 'Interview Plans', icon: CalendarCheck },
  { label: 'Progress', icon: BarChart3 },
  { label: 'Resources', icon: BookOpen },
]

type SidebarProps = { onNavigate?: () => void }

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { user, signOut } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const displayName =
    user?.user_metadata?.full_name || dashboardUser.name

  useEffect(() => {
    if (!userMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const planPercent = Math.round(
    ((dashboardUser.interviewsTotal - dashboardUser.interviewsRemaining) /
      dashboardUser.interviewsTotal) *
      100
  )

  return (
    <aside className="flex h-full flex-col">
      {/* Logo */}
      <Link to="/" className="mb-8 flex items-center gap-2.5 px-1">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-electric via-indigo-glow to-violet-glow shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]">
          <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
        </span>
        <span className="font-display text-[15px] font-semibold tracking-tight text-white">
          AI Interview<span className="ml-1 text-gradient">Mentor</span>
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              item.active
                ? 'bg-white/[0.08] text-white'
                : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom area */}
      <div className="mt-auto border-t border-white/[0.06] pt-5 space-y-4">
        {/* Current Plan */}
        <div className="rounded-xl bg-white/[0.03] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-white">{dashboardUser.plan}</span>
            <span className="text-[11px] text-slate-500">
              {dashboardUser.interviewsRemaining} remaining
            </span>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-electric to-indigo-glow"
              style={{ width: `${planPercent}%` }}
            />
          </div>
          <button
            type="button"
            className="btn-primary w-full py-2 text-[12px]"
          >
            <Zap className="h-3 w-3" />
            Upgrade
          </button>
        </div>

        {/* User Profile */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex w-full items-center gap-3 rounded-xl px-1 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-glow to-violet-glow text-sm font-semibold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <p className="truncate text-[11px] text-slate-500">{dashboardUser.plan}</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                userMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-xl border border-white/[0.08] bg-ink-900/95 p-1.5 shadow-2xl backdrop-blur-xl">
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <div className="my-1 h-px bg-white/[0.06]" />
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
