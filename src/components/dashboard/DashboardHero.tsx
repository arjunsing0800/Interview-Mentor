import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { dashboardUser } from '../../data/content'
import SceneFallback from '../three/SceneFallback'

const AvatarScene = lazy(() => import('../three/AvatarScene'))

export default function DashboardHero() {
  const { user } = useAuth()
  const userName =
    user?.user_metadata?.full_name?.split(' ')[0] || dashboardUser.name

  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] sm:mb-8">
      <div className="grid items-center gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1fr_28rem] lg:gap-8 xl:grid-cols-[1fr_32rem]">
        {/* Left — welcome + CTAs */}
        <div className="relative z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric/25 bg-electric/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-electric-soft">
              <Sparkles className="h-3 w-3" />
              AI-Powered Mentor
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl"
          >
            Welcome back, {userName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            Your AI Interview Mentor is ready. Practice smarter, improve faster,
            and become interview-ready.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            <Link to="/interview/technical" className="btn-primary w-full px-6 py-3.5 text-sm sm:w-auto inline-flex items-center justify-center">
              Start Interview
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/interview/resume" className="btn-ghost w-full px-6 py-3.5 text-sm sm:w-auto inline-flex items-center justify-center">
              Continue Practice
            </Link>
          </motion.div>
        </div>

        {/* Right — 3D AI Bot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-64 sm:w-72 lg:w-full lg:mx-0"
        >
          <div className="aspect-square w-full [transform:rotateX(7deg)]">
            <Suspense fallback={<SceneFallback />}>
              <AvatarScene lite />
            </Suspense>
          </div>

          {/* Floating mentor message */}
          <div className="absolute bottom-2 left-1/2 z-20 w-56 -translate-x-1/2 sm:bottom-4 sm:left-auto sm:right-0 sm:translate-x-0 lg:-left-4 lg:translate-x-0">
            <div className="glass rounded-xl px-4 py-3 shadow-lg">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-electric-soft">
                AI Mentor
              </p>
              <p className="text-xs leading-relaxed text-slate-300">
                &ldquo;Ready for your next interview?&rdquo;
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
