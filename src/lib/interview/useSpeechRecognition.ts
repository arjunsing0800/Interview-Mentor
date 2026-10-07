import { useCallback, useEffect, useRef, useState } from 'react'

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string, isFinal: boolean) => void
  onEnd?: () => void
  onError?: (error: string) => void
  continuous?: boolean
  language?: string
  enabled?: boolean
}

interface UseSpeechRecognitionReturn {
  isListening: boolean
  isSupported: boolean
  transcript: string
  start: () => void
  stop: () => void
  abort: () => void
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    onResult,
    onEnd,
    onError,
    continuous = true,
    language = 'en-US',
    enabled = true,
  } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const recognitionIdRef = useRef(0)

  const SpeechRecognitionRef = useRef<any>(null)
  if (typeof window !== 'undefined' && !SpeechRecognitionRef.current) {
    SpeechRecognitionRef.current =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
  }
  const SpeechRecognition = SpeechRecognitionRef.current

  const isSupported = Boolean(SpeechRecognition) && enabled

  const start = useCallback(() => {
    if (!isSupported || isListening) return

    const id = ++recognitionIdRef.current
    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      if (id !== recognitionIdRef.current) return
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: any) => {
      if (id !== recognitionIdRef.current) return
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript)
        onResult?.(finalTranscript.trim(), true)
      } else if (interimTranscript) {
        setTranscript(interimTranscript)
        onResult?.(interimTranscript.trim(), false)
      }
    }

    recognition.onerror = (event: any) => {
      if (id !== recognitionIdRef.current) return
      if (event.error === 'no-speech') {
        onEnd?.()
        return
      }
      if (event.error === 'aborted') return
      onError?.(event.error || 'Speech recognition error')
      setIsListening(false)
    }

    recognition.onend = () => {
      if (id !== recognitionIdRef.current) return
      setIsListening(false)
      onEnd?.()
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      onError?.('Failed to start speech recognition')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, isListening, continuous, language, onResult, onEnd, onError])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const abort = useCallback(() => {
    recognitionRef.current?.abort()
    setIsListening(false)
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      setIsListening(false)
    }
  }, [])

  return { isListening, isSupported, transcript, start, stop, abort }
}
