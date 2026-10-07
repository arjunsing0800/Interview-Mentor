import { Sparkles } from 'lucide-react'
import { footerLinks } from '../data/content'

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.02 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.1 11.1 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  )
}

function footerHref(link: string): string {
  switch (link) {
    case 'Practice':
    case 'Interview Modes':
      return '#practice'
    case 'Feedback':
    case 'History':
      return '#history'
    case 'About':
    case 'How It Works':
    case 'FAQ':
    case 'Contact':
      return '#about'
    default:
      return '#start'
  }
}

export default function Footer() {
  return (
    <footer className="relative mt-8 border-t border-white/[0.06] bg-ink-950/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* brand */}
          <div>
            <a href="#home" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric via-indigo-glow to-violet-glow shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]">
                <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
              </span>
              <span className="font-display text-base font-semibold tracking-tight text-white">
                AI Interview Mentor
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Your personal AI-powered interview coach.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#home"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:border-electric/40 hover:text-white"
              >
                <GithubIcon />
              </a>
              <a
                href="#home"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:border-electric/40 hover:text-white"
              >
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {(['product', 'resources', 'legal'] as const).map((col) => (
            <div key={col}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {col === 'product' ? 'Product' : col === 'resources' ? 'Resources' : 'Legal'}
              </h4>
              <ul className="mt-4 space-y-3">
                {footerLinks[col].map((link) => (
                  <li key={link}>
                    <a
                      href={footerHref(link)}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            © 2026 AI Interview Mentor. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-600">
            Crafted with <span className="text-electric-soft">⚡</span> for confident
            candidates
          </p>
        </div>
      </div>
    </footer>
  )
}