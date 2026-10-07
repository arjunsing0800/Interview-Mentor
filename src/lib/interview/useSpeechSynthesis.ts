import { useCallback, useEffect, useRef, useState } from 'react'

interface UseSpeechSynthesisOptions {
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
  rate?: number
  pitch?: number
  voice?: string
  enabled?: boolean
}

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean
  isSupported: boolean
  speak: (text: string) => void
  stop: () => void
  pause: () => void
  resume: () => void
}

export function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const {
    onStart,
    onEnd,
    onError,
    rate = 1.0,
    pitch = 1.0,
    enabled = true,
  } = options

  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const cancelRef = useRef(false)

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window && enabled

  const getVoice = useCallback(() => {
    if (!isSupported) return null
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Alex') ||
          v.name.includes('Daniel'))
    )
    return preferred || voices.find((v) => v.lang.startsWith('en')) || null
  }, [isSupported])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return

      cancelRef.current = false
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      const voice = getVoice()
      if (voice) utterance.voice = voice
      utterance.rate = rate
      utterance.pitch = pitch

      utterance.onstart = () => {
        if (!cancelRef.current) {
          setIsSpeaking(true)
          onStart?.()
        }
      }

      utterance.onend = () => {
        if (!cancelRef.current) {
          setIsSpeaking(false)
          onEnd?.()
        }
      }

      utterance.onerror = (event) => {
        if (!cancelRef.current && event.error !== 'canceled') {
          setIsSpeaking(false)
          onError?.(event.error || 'Speech synthesis error')
        }
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [isSupported, getVoice, rate, pitch, onStart, onEnd, onError]
  )

  const stop = useCallback(() => {
    cancelRef.current = true
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
  }, [])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
  }, [])

  useEffect(() => {
    return () => {
      cancelRef.current = true
      window.speechSynthesis.cancel()
    }
  }, [])

  return { isSpeaking, isSupported, speak, stop, pause, resume }
}
