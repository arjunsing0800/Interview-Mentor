export const heroMetrics = [
  {
    id: 'confidence',
    label: 'Confidence',
    value: 87,
    tint: 'from-electric-soft to-indigo-glow',
    delay: 0,
  },
  {
    id: 'communication',
    label: 'Communication',
    value: 92,
    tint: 'from-indigo-glow to-violet-glow',
    delay: 0.3,
  },
  {
    id: 'technical',
    label: 'Technical Skills',
    value: 84,
    tint: 'from-cyan-soft to-electric',
    delay: 0.6,
  },
]

export const trustStats = [
  { value: '10K+', suffix: '+', target: 10, label: 'Practice Sessions' },
  { value: '95%', suffix: '%', target: 95, label: 'User Satisfaction' },
  { value: '24/7', suffix: '', target: 24, label: 'AI Practice', isClock: true },
]

export const steps = [
  {
    num: '01',
    title: 'Choose Your Interview',
    body:
      'Pick Technical, HR, Behavioral or Resume-based — each run is tuned to the way real hiring managers interview.',
  },
  {
    num: '02',
    title: 'Talk With Your AI Mentor',
    body:
      'Your mentor asks realistic questions and dynamically follows up based on exactly what you say.',
  },
  {
    num: '03',
    title: 'Get Personalized Feedback',
    body:
      'Receive detailed scoring on technical knowledge, communication, confidence, problem solving and answer quality.',
  },
]

export const interviewModes = [
  {
    id: 'technical',
    title: 'Technical Interview',
    body: 'Test your programming and technical knowledge.',
  },
  {
    id: 'hr',
    title: 'HR Interview',
    body: 'Practice common HR and introduction questions.',
  },
  {
    id: 'behavioral',
    title: 'Behavioral Interview',
    body: 'Prepare for real-world behavioral questions.',
  },
  {
    id: 'resume',
    title: 'Resume Interview',
    body: 'Practice questions based on your resume.',
  },
]

export const dashboardMetrics = [
  { label: 'Communication', value: 92 },
  { label: 'Technical Knowledge', value: 86 },
  { label: 'Confidence', value: 84 },
  { label: 'Problem Solving', value: 89 },
  { label: 'Answer Relevance', value: 91 },
]

export const improvementAreas = [
  'Be more concise',
  'Add specific examples',
  'Improve answer structure',
]

export const performanceData = [
  { label: 'Interview 1', score: 62 },
  { label: 'Interview 2', score: 71 },
  { label: 'Interview 3', score: 78 },
  { label: 'Interview 4', score: 88 },
]

export const performanceStats = [
  { value: '+26%', label: 'Overall improvement' },
  { value: '12', label: 'Interviews completed' },
  { value: '8', label: 'Skills improved' },
]

export const features = [
  {
    id: 'realistic',
    title: 'Realistic AI Interviews',
    body: 'Practice conversations that feel like real interviews.',
  },
  {
    id: 'instant',
    title: 'Instant Feedback',
    body: 'Understand what you did well and what you should improve.',
  },
  {
    id: 'personalized',
    title: 'Personalized Questions',
    body: 'Questions adapt to your role, experience and previous answers.',
  },
  {
    id: 'anytime',
    title: 'Practice Anytime',
    body: 'Your AI mentor is available whenever you want to practice.',
  },
]

export const footerLinks = {
  product: ['Practice', 'Interview Modes', 'Feedback', 'History'],
  resources: ['About', 'How It Works', 'FAQ', 'Contact'],
  legal: ['Privacy Policy', 'Terms of Service'],
}

export const navLinks = ['Home', 'Practice', 'History', 'About']

/* ─── Dashboard ─────────────────────────────────────────────── */

export const dashboardUser = {
  name: 'Arjun',
  email: 'arjun@example.com',
  plan: 'Free Plan',
  interviewsRemaining: 3,
  interviewsTotal: 10,
}

export const nextInterview = {
  company: 'Google',
  role: 'Software Engineering Intern',
  date: 'August 28, 2026',
  time: '10:30 AM',
  readiness: 88,
}

export const readinessMetrics = {
  overall: 88,
  status: 'Excellent',
  breakdown: [
    { label: 'Communication', value: 92 },
    { label: 'Technical Depth', value: 86 },
    { label: 'Confidence', value: 84 },
  ],
}

export const practiceModules = [
  {
    id: 'technical',
    title: 'Technical',
    description: 'Practice coding and technical questions.',
  },
  {
    id: 'hr',
    title: 'HR',
    description: 'Improve your introduction and HR answers.',
  },
  {
    id: 'behavioral',
    title: 'Behavioral',
    description: 'Improve STAR-based answers.',
  },
  {
    id: 'resume',
    title: 'Resume',
    description: 'Practice questions based on your resume.',
  },
]

export const continueSession = {
  type: 'Technical Interview',
  question: 7,
  totalQuestions: 10,
  percent: 70,
}

export const weeklyActivity = [
  { day: 'Mon', interviews: 2, minutes: 65 },
  { day: 'Tue', interviews: 1, minutes: 32 },
  { day: 'Wed', interviews: 3, minutes: 90 },
  { day: 'Thu', interviews: 0, minutes: 0 },
  { day: 'Fri', interviews: 2, minutes: 55 },
  { day: 'Sat', interviews: 1, minutes: 28 },
  { day: 'Sun', interviews: 0, minutes: 0 },
]

export const aiInsights = [
  'Your communication score improved by 12% this week. Try using more specific examples in behavioral answers.',
  'Strong progress on system design questions. Keep practicing distributed systems.',
  'Try reducing filler words — aim for under 3 per response.',
]

export const recentInterviews = [
  { company: 'Google', type: 'Technical', score: 88, status: 'completed' as const },
  { company: 'Startup HR', type: 'HR', score: 81, status: 'completed' as const },
  { company: 'Frontend Practice', type: 'Technical', score: 76, status: 'completed' as const },
]

export const dashboardStats = [
  { label: 'Total Interviews', value: '24', change: '+3 this week' },
  { label: 'Average Score', value: '82%', change: '+5% from last week' },
  { label: 'Current Streak', value: '7 days', change: 'Keep it going!' },
  { label: 'Hours Practiced', value: '18.5h', change: '+2.3h this week' },
]