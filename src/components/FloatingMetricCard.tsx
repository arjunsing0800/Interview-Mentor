import { motion, useReducedMotion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

type FloatingMetricCardProps = {
  label: string
  value: number
  tint: string
  delay?: number
  className?: string
  icon?: LucideIcon
  float?: 'float' | 'float-slow'
  depth?: string
}

/** Hero floating glass stat card with animated bar + soft float. */
export default function FloatingMetricCard({
  label,
  value,
  tint,
  delay = 0,
  className,
  icon: Icon,
  float = 'float',
  depth,
}: FloatingMetricCardProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.86, y: reduce ? 0 : 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <div
        className={`glass card-glow rounded-2xl p-4 ${
          reduce ? '' : `animate-${float}`
        } ${depth ?? ''}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/8">
                <Icon className="h-3.5 w-3.5 text-electric-soft" />
              </span>
            )}
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
              {label}
            </span>
          </div>
          <span className="font-display text-sm font-bold text-white">{value}%</span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1.3, delay: delay + 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full rounded-full bg-gradient-to-r ${tint} shadow-[0_0_12px_rgba(99,102,241,0.7)]`}
          />
        </div>
      </div>
    </motion.div>
  )
}