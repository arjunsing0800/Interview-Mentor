import { AnimatePresence, motion, useScroll } from 'framer-motion'
import { Menu, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { navLinks } from '../data/content'

function Logo() {
  return (
    <a href="#home" className="group flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric via-indigo-glow to-violet-glow shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)] transition-transform duration-300 group-hover:scale-105">
        <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
      </span>
      <span className="font-display text-[15px] font-semibold tracking-tight text-white sm:text-base">
        AI Interview
        <span className="text-gradient ml-1.5">Mentor</span>
      </span>
    </a>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    return scrollY.on('change', (v) => setScrolled(v > 24))
  }, [scrollY])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:px-6"
    >
      <div
        className={`flex w-full max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300 sm:px-5 ${
          scrolled
            ? 'glass-strong shadow-[0_18px_50px_-24px_rgba(4,6,20,0.95)]'
            : 'border border-transparent bg-transparent'
        }`}
      >
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href={
                link === 'Home'
                  ? '#home'
                  : link === 'Practice'
                    ? '#practice'
                    : link === 'History'
                      ? '#history'
                      : '#about'
              }
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="btn-primary px-5 py-2.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_30px_-12px_rgba(99,102,241,0.75)]"
          >
            <Sparkles className="h-4 w-4" />
            Start Interview
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/signup"
            className="btn-primary px-4 py-2 text-[13px]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Start Interview
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-[72px] z-40 bg-ink-950/80 backdrop-blur-xl lg:hidden"
          >
            <motion.nav
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="mx-4 mt-3 flex flex-col gap-1 rounded-2xl p-3 glass-strong"
            >
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={
                    link === 'Home'
                      ? '#home'
                      : link === 'Practice'
                        ? '#practice'
                        : link === 'History'
                          ? '#history'
                          : '#about'
                  }
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3.5 text-base font-medium text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link}
                </a>
              ))}
              <div className="my-2 h-px bg-white/10" />
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="btn-ghost px-4 py-3 text-base"
              >
                Sign In
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}