import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { TranscriptEntry } from '../../lib/interview/types'

interface TranscriptPanelProps {
  entries: TranscriptEntry[]
  isOpen: boolean
  onClose: () => void
}

export default function TranscriptPanel({ entries, isOpen, onClose }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  if (!isOpen) return null

  return (
    <div className="w-full max-w-lg border border-ink-800 rounded-2xl bg-ink-950/80 backdrop-blur-sm overflow-hidden flex flex-col max-h-[60vh]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-800">
        <span className="text-sm font-medium text-ink-200">Transcript</span>
        <button onClick={onClose} className="p-1 hover:bg-ink-800 rounded-lg transition-colors cursor-pointer">
          <X className="w-4 h-4 text-ink-400" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {entries.map((entry, i) => (
          <div key={i} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`
                max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                ${entry.speaker === 'user'
                  ? 'bg-electric/15 text-electric-soft border border-electric/20'
                  : 'bg-ink-800/60 text-ink-200 border border-ink-700/50'
                }
              `}
            >
              <span className="text-[10px] font-medium text-ink-400 block mb-0.5">
                {entry.speaker === 'ai' ? 'AI Interviewer' : 'You'}
              </span>
              {entry.text}
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-ink-500 text-sm py-8">No conversation yet</p>
        )}
      </div>
    </div>
  )
}
