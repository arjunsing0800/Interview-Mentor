import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { InterviewMode } from '../../lib/interview/types'

interface EndConfirmModalProps {
  isOpen: boolean
  questionNumber: number
  mode: InterviewMode
  onConfirm: () => void
  onCancel: () => void
}

export default function EndConfirmModal({
  isOpen,
  questionNumber,
  mode,
  onConfirm,
  onCancel,
}: EndConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-ink-900/95 border border-white/[0.08] rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink-100">End this interview?</h3>
                  <p className="text-xs text-ink-400">You've answered {questionNumber} questions</p>
                </div>
              </div>

              <p className="text-sm text-ink-300 mb-6 leading-relaxed">
                You will receive your performance analysis after ending.
                Your {mode} interview will be evaluated based on what you've covered so far.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-ink-200 text-sm font-medium border border-white/[0.08] transition-all cursor-pointer"
                >
                  Continue Interview
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition-all cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  End Interview
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
