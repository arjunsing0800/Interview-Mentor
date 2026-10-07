import { useEffect, useState } from 'react'
import { Mic, MicOff, PhoneOff } from 'lucide-react'
import type { SpeakerState } from '../../lib/interview/types'

interface MicButtonProps {
  speakerState: SpeakerState
  isMuted: boolean
  onToggleMute: () => void
  onEnd: () => void
  questionNumber: number
}

const stateConfig: Record<SpeakerState, { label: string; color: string; ringColor: string }> = {
  idle: { label: 'Waiting...', color: 'bg-ink-800', ringColor: 'ring-ink-600' },
  listening: { label: 'Listening...', color: 'bg-emerald-500', ringColor: 'ring-emerald-400' },
  speaking: { label: 'AI is speaking...', color: 'bg-electric', ringColor: 'ring-electric' },
  thinking: { label: 'Thinking...', color: 'bg-amber-500', ringColor: 'ring-amber-400' },
  processing: { label: 'Analyzing...', color: 'bg-violet-500', ringColor: 'ring-violet-400' },
}

export default function MicButton({
  speakerState,
  isMuted,
  onToggleMute,
  onEnd,
  questionNumber,
}: MicButtonProps) {
  const config = stateConfig[speakerState]
  const [pulseScale, setPulseScale] = useState(1)

  useEffect(() => {
    if (speakerState !== 'listening') {
      setPulseScale(1)
      return
    }
    let frame: number
    let t = 0
    const animate = () => {
      t += 0.03
      setPulseScale(1 + Math.sin(t) * 0.08)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [speakerState])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {speakerState === 'listening' && (
          <div
            className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"
            style={{ animationDuration: '2s' }}
          />
        )}
        {speakerState === 'speaking' && (
          <div className="absolute inset-0 rounded-full bg-electric/15 animate-pulse" />
        )}
        <button
          onClick={onToggleMute}
          disabled={speakerState !== 'listening'}
          className={`
            relative w-16 h-16 rounded-full flex items-center justify-center
            transition-all duration-200 cursor-pointer
            ${isMuted
              ? 'bg-red-500/80 hover:bg-red-500 text-white'
              : `${config.color} hover:brightness-110 text-white`
            }
            ring-4 ${config.ringColor}/30
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          style={{ transform: `scale(${pulseScale})` }}
        >
          {isMuted ? (
            <MicOff className="w-7 h-7" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-medium text-ink-300">{config.label}</span>
        <span className="text-[10px] text-ink-500">Question {questionNumber}</span>
      </div>

      <div className="flex gap-3 mt-2">
        <button
          onClick={onEnd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors cursor-pointer"
        >
          <PhoneOff className="w-4 h-4" />
          End
        </button>
      </div>
    </div>
  )
}
