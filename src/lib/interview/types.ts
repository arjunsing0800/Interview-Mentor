export type InterviewMode = 'technical' | 'hr' | 'behavioral' | 'resume'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type InterviewStatus = 'setup' | 'active' | 'completed' | 'error'

export type SpeakerState = 'idle' | 'listening' | 'speaking' | 'thinking' | 'processing'

export interface TranscriptEntry {
  speaker: 'ai' | 'user'
  text: string
  timestamp: number
}

export interface InterviewState {
  id: string
  mode: InterviewMode
  candidateName: string
  status: InterviewStatus
  speakerState: SpeakerState
  questionNumber: number
  difficulty: Difficulty
  transcript: TranscriptEntry[]
  topicsCovered: string[]
  strengths: string[]
  weaknesses: string[]
  startTime: number
  endTime: number | null
  isMuted: boolean
  showTranscript: boolean
  showEndConfirm: boolean
}

export const initialInterviewState: InterviewState = {
  id: '',
  mode: 'technical',
  candidateName: '',
  status: 'setup',
  speakerState: 'idle',
  questionNumber: 0,
  difficulty: 'medium',
  transcript: [],
  topicsCovered: [],
  strengths: [],
  weaknesses: [],
  startTime: 0,
  endTime: null,
  isMuted: false,
  showTranscript: false,
  showEndConfirm: false,
}

export type InterviewAction =
  | { type: 'START_INTERVIEW'; mode: InterviewMode; name: string }
  | { type: 'SET_SPEAKER_STATE'; state: SpeakerState }
  | { type: 'ADD_TRANSCRIPT_ENTRY'; entry: TranscriptEntry }
  | { type: 'NEXT_QUESTION'; topic?: string }
  | { type: 'SET_DIFFICULTY'; difficulty: InterviewState['difficulty'] }
  | { type: 'ADD_TOPIC'; topic: string }
  | { type: 'ADD_STRENGTH'; strength: string }
  | { type: 'ADD_WEAKNESS'; weakness: string }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_TRANSCRIPT' }
  | { type: 'TOGGLE_END_CONFIRM' }
  | { type: 'END_INTERVIEW' }
  | { type: 'RESET' }

export function interviewReducer(
  state: InterviewState,
  action: InterviewAction
): InterviewState {
  switch (action.type) {
    case 'START_INTERVIEW':
      return {
        ...initialInterviewState,
        id: `interview-${Date.now()}`,
        mode: action.mode,
        candidateName: action.name,
        status: 'active',
        speakerState: 'thinking',
        startTime: Date.now(),
      }

    case 'SET_SPEAKER_STATE':
      return { ...state, speakerState: action.state }

    case 'ADD_TRANSCRIPT_ENTRY':
      return { ...state, transcript: [...state.transcript, action.entry] }

    case 'NEXT_QUESTION':
      return {
        ...state,
        questionNumber: state.questionNumber + 1,
        topicsCovered: action.topic
          ? [...state.topicsCovered, action.topic]
          : state.topicsCovered,
      }

    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.difficulty }

    case 'ADD_TOPIC':
      return { ...state, topicsCovered: [...state.topicsCovered, action.topic] }

    case 'ADD_STRENGTH':
      return { ...state, strengths: [...state.strengths, action.strength] }

    case 'ADD_WEAKNESS':
      return { ...state, weaknesses: [...state.weaknesses, action.weakness] }

    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted }

    case 'TOGGLE_TRANSCRIPT':
      return { ...state, showTranscript: !state.showTranscript }

    case 'TOGGLE_END_CONFIRM':
      return { ...state, showEndConfirm: !state.showEndConfirm }

    case 'END_INTERVIEW':
      return { ...state, status: 'completed', endTime: Date.now(), speakerState: 'idle' }

    case 'RESET':
      return initialInterviewState

    default:
      return state
  }
}

export function getDuration(state: InterviewState): number {
  if (!state.startTime) return 0
  const end = state.endTime || Date.now()
  return Math.floor((end - state.startTime) / 1000)
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const modeLabels: Record<InterviewMode, string> = {
  technical: 'Technical Interview',
  hr: 'HR Interview',
  behavioral: 'Behavioral Interview',
  resume: 'Resume Interview',
}
