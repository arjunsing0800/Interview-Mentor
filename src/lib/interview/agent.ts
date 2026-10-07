/* ------------------------------------------------------------------ */
/*  OFFLINE FALLBACK ONLY — not AI.                                  */
/*  Deterministic templates + hardcoded banks + Math.random().       */
/*  Production interview flow uses the local Ollama engine first     */
/*  (src/lib/ai/aiService.ts) with Groq as fallback; this module is  */
/*  only an emergency, clearly-labeled offline seed via              */
/*  getSeedGreeting()/getSeedQuestion(). Never present its output    */
/*  as AI-generated analysis or scores.                              */
/* ------------------------------------------------------------------ */
import type { Difficulty, InterviewMode, TranscriptEntry } from './types'

interface AgentContext {
  mode: InterviewMode
  candidateName: string
  transcript: TranscriptEntry[]
  questionNumber: number
  difficulty: Difficulty
  topicsCovered: string[]
}

/* ──────────────────────────────────────────────────────────────── */
/*  Mode-specific system instructions (for future LLM integration) */
/* ──────────────────────────────────────────────────────────────── */
export const modeInstructions: Record<InterviewMode, string> = {
  technical: `You are a senior software engineer conducting a technical interview. Ask about programming, CS fundamentals, data structures, algorithms, APIs, databases, system design, and problem-solving. Probe for implementation details and trade-offs. Evaluate technical depth and clarity of explanation.`,
  hr: `You are an HR professional conducting a behavioral screening. Ask about background, strengths, weaknesses, career goals, teamwork, and motivation. Listen for self-awareness, communication skills, and cultural fit. Probe for specific examples.`,
  behavioral: `You are an interviewer using behavioral questions. Ask about real past experiences using the STAR method (Situation, Task, Action, Result). Push for specific details. If the candidate gives a hypothetical answer, redirect to a real experience.`,
  resume: `You are an interviewer reviewing the candidate's resume. Ask about specific projects, technologies used, challenges faced, decisions made, and contributions. Connect questions to what they've listed on their resume.`,
}

/* ──────────────────────────────────────────────────────────────── */
/*  Natural spoken acknowledgments (NOT praise)                    */
/* ──────────────────────────────────────────────────────────────── */
const acknowledgments = [
  'Okay.',
  'I see.',
  'Right.',
  'Got it.',
  'Understood.',
  'Mm-hmm.',
  'Fair enough.',
  'That makes sense.',
  'Alright.',
]

function pickAck(): string {
  return acknowledgments[Math.floor(Math.random() * acknowledgments.length)]
}

/* ──────────────────────────────────────────────────────────────── */
/*  Topic detection                                               */
/* ──────────────────────────────────────────────────────────────── */
function detectTopics(text: string): string[] {
  const lower = text.toLowerCase()
  const topicMap: [string, string[]][] = [
    ['REST APIs', ['rest', 'api', 'endpoint', 'http', 'crud']],
    ['Data Structures', ['array', 'linked list', 'tree', 'graph', 'hash', 'stack', 'queue']],
    ['Algorithms', ['sort', 'search', 'algorithm', 'complexity', 'big o', 'recursive']],
    ['Databases', ['database', 'sql', 'nosql', 'query', 'schema', 'index']],
    ['System Design', ['scale', 'distributed', 'cache', 'load balancer', 'microservice']],
    ['Concurrency', ['thread', 'async', 'concurrent', 'parallel', 'mutex', 'lock']],
    ['Web Development', ['react', 'frontend', 'backend', 'css', 'html', 'javascript', 'typescript']],
    ['Behavioral', ['team', 'conflict', 'leader', 'failure', 'challenge', 'difficult']],
    ['Career Goals', ['goal', 'career', 'future', 'plan', 'passion', 'interest']],
    ['Communication', ['communicate', 'present', 'explain', 'describe', 'tell me about']],
    ['Leadership', ['lead', 'leadership', 'manage', 'mentored', 'guided', 'direction']],
    ['Projects', ['project', 'built', 'developed', 'shipped', 'launched', 'implemented']],
    ['Testing', ['test', 'testing', 'qa', 'unit test', 'integration', 'coverage']],
    ['Cloud', ['aws', 'cloud', 'deploy', 'infrastructure', 'docker', 'kubernetes']],
    ['Architecture', ['architecture', 'design pattern', 'design', 'refactor', 'modular']],
  ]
  const found: string[] = []
  for (const [topic, keywords] of topicMap) {
    if (keywords.some((k) => lower.includes(k))) found.push(topic)
  }
  return found
}

/* ──────────────────────────────────────────────────────────────── */
/*  Assessment helpers                                            */
/* ──────────────────────────────────────────────────────────────── */
type AnswerQuality = 'strong' | 'average' | 'weak'

function assessAnswer(transcript: TranscriptEntry[]): AnswerQuality {
  const recentUser = transcript.filter((e) => e.speaker === 'user').slice(-3)
  if (recentUser.length === 0) return 'average'
  const avgLen = recentUser.reduce((s, e) => s + e.text.length, 0) / recentUser.length
  if (avgLen > 150) return 'strong'
  if (avgLen < 40) return 'weak'
  return 'average'
}

function assessDetailLevel(text: string): 'detailed' | 'moderate' | 'vague' {
  const len = text.length
  const hasExample = /\b(example|for instance|such as|like when|one time)\b/i.test(text)
  const hasReasoning = /\b(because|since|so that|in order to|the reason)\b/i.test(text)
  const hasSpecifics = /\b(first|second|then|after that|finally|specifically)\b/i.test(text)
  const score = (hasExample ? 1 : 0) + (hasReasoning ? 1 : 0) + (hasSpecifics ? 1 : 0) + (len > 100 ? 1 : 0)
  if (score >= 3 || len > 200) return 'detailed'
  if (score >= 1 || len > 60) return 'moderate'
  return 'vague'
}

/* ──────────────────────────────────────────────────────────────── */
/*  Greeting                                                      */
/* ──────────────────────────────────────────────────────────────── */
function getGreeting(name: string, mode: InterviewMode): string {
  const modeDesc: Record<InterviewMode, string> = {
    technical: "We'll dig into some technical topics — programming concepts, system design, and problem-solving.",
    hr: "We'll go through some questions about your background, goals, and how you work with others.",
    behavioral: "I'll ask about specific situations from your past — leadership, challenges, and teamwork.",
    resume: "I'll ask you about your projects, experience, and the details on your resume.",
  }
  return `Hi ${name}, welcome. I'll be conducting your ${mode} interview today. ${modeDesc[mode]} Let's start simple — tell me about yourself.`
}

function getClosing(): string {
  return "That's all I wanted to cover today. Thanks for your time — I'll prepare your feedback now."
}

/* ──────────────────────────────────────────────────────────────── */
/*  Contextual follow-up generation                               */
/* ──────────────────────────────────────────────────────────────── */
function generateContextualFollowUp(
  lastUserText: string,
  difficulty: Difficulty,
  mode: InterviewMode,
  detailLevel: 'detailed' | 'moderate' | 'vague',
  topics: string[]
): string {
  // Bare yes/no or single-word answers → ask for elaboration
  const trimmed = lastUserText.trim().toLowerCase()
  if (trimmed.length <= 12 && /^(yes|no|yeah|yep|nope|nah|correct|right|ok|okay|sure|maybe|absolutely|not really|i don't know|idk|true|false)$/.test(trimmed)) {
    return 'Can you elaborate on that a bit more?'
  }

  // Vague answers → ask for specificity
  if (detailLevel === 'vague') {
    const vagueFollowUps: Record<InterviewMode, string[]> = {
      technical: [
        'Can you walk me through the specifics of that?',
        'What exactly did the implementation look like?',
        'Can you give me a concrete example?',
      ],
      hr: [
        'Can you tell me more about that?',
        'What specifically did you do in that situation?',
        'Can you walk me through it step by step?',
      ],
      behavioral: [
        'Can you give me a specific example of that?',
        'What exactly happened? Walk me through the details.',
        'Can you describe the situation in more detail?',
      ],
      resume: [
        'Can you walk me through the technical details of that?',
        'What specifically was your role in that project?',
        'What technologies did you use and why?',
      ],
    }
    const pool = vagueFollowUps[mode]
    return pool[Math.floor(Math.random() * pool.length)]
  }

  // Detailed answers → probe deeper or explore reasoning
  if (detailLevel === 'detailed') {
    const deepFollowUps: Record<InterviewMode, string[]> = {
      technical: [
        'What alternatives did you consider before settling on that approach?',
        'What would you change if you had to redo it?',
        'How would that scale if the requirements doubled?',
        'What edge cases did you have to handle?',
      ],
      hr: [
        'Looking back, would you do anything differently?',
        'How did that experience shape how you work now?',
        'What would you say was the key takeaway from that?',
      ],
      behavioral: [
        'What would you have done differently in that situation?',
        'How did that experience change your approach going forward?',
        'What was the most difficult part of that for you personally?',
      ],
      resume: [
        'What was the biggest technical challenge in that project?',
        'If you had more time, what would you improve?',
        'How did you measure success for that project?',
      ],
    }
    const pool = deepFollowUps[mode]
    return pool[Math.floor(Math.random() * pool.length)]
  }

  // Moderate answers → standard probes
  const moderateFollowUps: Record<InterviewMode, string[]> = {
    technical: [
      'Can you elaborate on that?',
      'Why did you choose that particular approach?',
      'How does that compare to other options you considered?',
    ],
    hr: [
      'Can you expand on that a little?',
      'How did that make you feel?',
      'What did you learn from that experience?',
    ],
    behavioral: [
      'What was the outcome of that situation?',
      'How did others involved react?',
      'What would you say you learned from that?',
    ],
    resume: [
      'Can you tell me more about your specific contributions?',
      'What did you learn from working on that?',
      'How did you decide on that technical approach?',
    ],
  }

  // Hard difficulty → probe deeper than the standard moderate pool
  if (difficulty === 'hard') {
    const hardProbes: Record<InterviewMode, string[]> = {
      technical: [
        'What trade-offs did you consider there?',
        'What edge cases did you have to handle?',
        'How would that behave under higher load?',
      ],
      hr: [
        'What was the outcome of that, and what did you learn?',
        'How would you approach that differently next time?',
        'What feedback did you receive, and how did you act on it?',
      ],
      behavioral: [
        'What was the hardest part of that for you?',
        'How did you know your approach was working?',
        'What would you do differently in hindsight?',
      ],
      resume: [
        'What was the most technically difficult decision in that?',
        'How did you validate that approach worked?',
        'What would you improve if you rebuilt it today?',
      ],
    }
    const pool = hardProbes[mode]
    return pool[Math.floor(Math.random() * pool.length)]
  }

  // Topic-aware follow-ups
  if (topics.includes('React') || topics.includes('Web Development')) {
    return 'How did you decide on that architecture for the frontend?'
  }
  if (topics.includes('Databases')) {
    return 'How did you handle data consistency in that setup?'
  }
  if (topics.includes('System Design')) {
    return 'What would break first if traffic doubled?'
  }
  if (topics.includes('Leadership')) {
    return 'How did the team respond to that approach?'
  }
  if (topics.includes('Conflict')) {
    return 'How did you work toward resolution after that point?'
  }

  const pool = moderateFollowUps[mode]
  return pool[Math.floor(Math.random() * pool.length)]
}

/* ──────────────────────────────────────────────────────────────── */
/*  Question banks                                                */
/* ──────────────────────────────────────────────────────────────── */
function getTechnicalQuestion(difficulty: string, covered: string[]): string {
  const easy = [
    'What is the difference between an array and a linked list?',
    'Explain what a REST API is and how it works.',
    'What is the difference between SQL and NoSQL databases?',
    'How does HTTP differ from HTTPS?',
    'What is the purpose of a hash table?',
    'What is the difference between a stack and a queue?',
    'Explain what a variable is in programming.',
    'What is an API?',
    'What is the difference between front-end and back-end?',
    'What is version control and why is it important?',
  ]
  const medium = [
    'When would you use a graph data structure over a tree?',
    'Explain database indexing and when you would use it.',
    'How would you design a URL shortener like bit.ly?',
    'What are the trade-offs between microservices and monolithic architecture?',
    'Explain the CAP theorem in your own words.',
    'What happens when you type a URL into a browser?',
    'Explain the concept of middleware in a web application.',
    'How does garbage collection work?',
    'What is the difference between concurrency and parallelism?',
    'Explain how a hash map handles collisions.',
  ]
  const hard = [
    'Design a real-time chat application. Walk me through the architecture.',
    'How would you handle caching invalidation in a distributed system?',
    'Explain how you would implement rate limiting for an API.',
    'Design a notification system that handles millions of users.',
    'How would you optimize a slow database query that joins multiple large tables?',
    'Design a ride-sharing service like Uber. Walk me through the system.',
    'How would you implement a distributed lock? What are the trade-offs?',
    'Explain the consistency vs availability trade-off with a real example.',
    'How would you design a search autocomplete feature?',
    'How would you handle data migration with zero downtime?',
  ]
  const pool = difficulty === 'easy' ? easy : difficulty === 'hard' ? hard : medium
  const unused = pool.filter((q) => !covered.some((t) => q.toLowerCase().includes(t.toLowerCase())))
  const pick = unused.length > 0 ? unused : pool
  return pick[Math.floor(Math.random() * pick.length)]
}

function getHRQuestion(covered: string[]): string {
  const questions = [
    'Tell me about yourself.',
    'What are your greatest strengths?',
    'What is something you are working to improve?',
    'Why are you interested in this role?',
    'Where do you see yourself in five years?',
    'How do you handle pressure or stressful situations?',
    'Tell me about a time you had to work with a difficult team member.',
    'Why should we hire you over other candidates?',
    'What motivates you in your work?',
    'Describe your ideal work environment.',
    'How do you handle feedback?',
    'Tell me about a time you had to adapt to a major change.',
    'What questions do you have for us?',
  ]
  const unused = questions.filter((q) => !covered.some((t) => q.toLowerCase().includes(t.toLowerCase())))
  const pick = unused.length > 0 ? unused : questions
  return pick[Math.floor(Math.random() * pick.length)]
}

function getBehavioralQuestion(covered: string[]): string {
  const questions = [
    'Tell me about a time you had to lead a team through a difficult project.',
    'Describe a situation where you had to make a decision with incomplete information.',
    'Tell me about a time you failed. What did you learn?',
    'Give me an example of a time you resolved a conflict within your team.',
    'Describe a time you went above and beyond for a project.',
    'Tell me about a time you had to persuade someone to see things your way.',
    'Describe a situation where you had to manage competing priorities.',
    'Tell me about a time you received constructive criticism. How did you respond?',
    'Give me an example of a time you had to learn something quickly.',
    'Describe a time when your initial approach didn\'t work. What did you do?',
    'Tell me about a difficult decision you had to make at work.',
    'Describe a time you had to give someone difficult feedback.',
  ]
  const unused = questions.filter((q) => !covered.some((t) => q.toLowerCase().includes(t.toLowerCase())))
  const pick = unused.length > 0 ? unused : questions
  return pick[Math.floor(Math.random() * pick.length)]
}

function getResumeQuestion(covered: string[]): string {
  const questions = [
    'Walk me through one of the projects on your resume and explain the technical decisions you made.',
    'What was the most challenging project you\'ve listed here? Why?',
    'Tell me about a specific technology you used on a project and why you chose it.',
    'What would you do differently if you were to rebuild one of your projects today?',
    'Describe your role in your most recent project. What was your specific contribution?',
    'What was the biggest lesson you learned from your work experience?',
    'How did you handle testing and quality assurance in your projects?',
    'Tell me about a time you had to debug a complex issue in one of your projects.',
    'What technologies from your resume are you most confident with?',
    'Describe how you managed deadlines and deliverables in your projects.',
  ]
  const unused = questions.filter((q) => !covered.some((t) => q.toLowerCase().includes(t.toLowerCase())))
  const pick = unused.length > 0 ? unused : questions
  return pick[Math.floor(Math.random() * pick.length)]
}

/* ──────────────────────────────────────────────────────────────── */
/*  Main agent response                                           */
/* ──────────────────────────────────────────────────────────────── */
export function generateAgentResponse(ctx: AgentContext): string {
  const { mode, candidateName, transcript, questionNumber, difficulty, topicsCovered } = ctx

  // Greeting
  if (questionNumber === 0) {
    return getGreeting(candidateName, mode)
  }

  // Closing
  if (questionNumber >= 10) {
    return getClosing()
  }

  const lastUserEntry = [...transcript].reverse().find((e) => e.speaker === 'user')
  const lastUserText = lastUserEntry?.text || ''

  if (!lastUserText) {
    return 'Take your time — I\'m listening.'
  }

  // Detect topics from user response
  const newTopics = detectTopics(lastUserText)

  // Assess answer quality
  const quality = assessAnswer(transcript)
  const detailLevel = assessDetailLevel(lastUserText)

  // Check if previous question was answered — determine if we should follow up or move on
  const consecutiveFollowUps = transcript
    .filter((e) => e.speaker === 'ai')
    .slice(-2)
    .filter((e) =>
      e.text.includes('Can you') ||
      e.text.includes('How did') ||
      e.text.includes('What would') ||
      e.text.includes('Why did') ||
      e.text.includes('Tell me more') ||
      e.text.includes('elaborate') ||
      e.text.includes('expand') ||
      e.text.includes('specific')
    ).length

  // Weak answer → probe for more
  if (quality === 'weak' && consecutiveFollowUps < 2) {
    return generateContextualFollowUp(lastUserText, difficulty, mode, detailLevel, newTopics)
  }

  // Strong answer + low follow-up count → one deeper follow-up
  if (quality === 'strong' && consecutiveFollowUps < 1 && Math.random() < 0.6) {
    const ack = pickAck()
    const followUp = generateContextualFollowUp(lastUserText, difficulty, mode, detailLevel, newTopics)
    return `${ack} ${followUp}`
  }

  // Moderate answer → sometimes follow up
  if (quality === 'average' && consecutiveFollowUps < 1 && Math.random() < 0.3) {
    return generateContextualFollowUp(lastUserText, difficulty, mode, detailLevel, newTopics)
  }

  // Move to next question
  const ack = pickAck()
  let question: string

  switch (mode) {
    case 'technical':
      question = getTechnicalQuestion(difficulty, topicsCovered)
      break
    case 'hr':
      question = getHRQuestion(topicsCovered)
      break
    case 'behavioral':
      question = getBehavioralQuestion(topicsCovered)
      break
    case 'resume':
      question = getResumeQuestion(topicsCovered)
      break
    default:
      question = getTechnicalQuestion(difficulty, topicsCovered)
  }

  return `${ack} ${question}`
}

/* ──────────────────────────────────────────────────────────────── */
/*  Difficulty assessment                                         */
/* ──────────────────────────────────────────────────────────────── */
export function assessDifficulty(transcript: TranscriptEntry[]): Difficulty {
  const userEntries = transcript.filter((e) => e.speaker === 'user')
  if (userEntries.length < 3) return 'medium'
  const avgLen = userEntries.reduce((s, e) => s + e.text.length, 0) / userEntries.length
  if (avgLen > 120) return 'hard'
  if (avgLen < 50) return 'easy'
  return 'medium'
}

/* ──────────────────────────────────────────────────────────────── */
/*  Export topic detection for use in InterviewPage                */
/* ──────────────────────────────────────────────────────────────── */
export { detectTopics as _detectTopics }

/* ──────────────────────────────────────────────────────────────── */
/*  Clearly-labeled offline seeds (emergency fallback only —        */
/*  callers must show the offline notice; see InterviewPage).       */
/* ──────────────────────────────────────────────────────────────── */
export function getSeedGreeting(name: string, mode: InterviewMode): string {
  return getGreeting(name, mode)
}

export function getSeedQuestion(mode: InterviewMode, difficulty: Difficulty): string {
  switch (mode) {
    case 'hr':
      return getHRQuestion([])
    case 'behavioral':
      return getBehavioralQuestion([])
    case 'resume':
      return getResumeQuestion([])
    case 'technical':
    default:
      return getTechnicalQuestion(difficulty, [])
  }
}
