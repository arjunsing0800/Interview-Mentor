import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { lazy, Suspense } from 'react'
import AuroraBackground from './components/AuroraBackground'
import SplashCursor from './components/reactbits/SplashCursor'
import Header from './components/Header'
import Hero from './components/Hero'
import TrustIntro from './components/TrustIntro'
import HowItWorks from './components/HowItWorks'
import InterviewModes from './components/InterviewModes'
import InterviewDemo from './components/InterviewDemo'
import FeedbackDashboard from './components/FeedbackDashboard'
import PerformanceChart from './components/PerformanceChart'
import Features from './components/Features'
import CTA from './components/CTA'
import Footer from './components/Footer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { ProtectedRoute } from './components/ProtectedRoute'

const Starfield = lazy(() => import('./components/Starfield'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const InterviewSetup = lazy(() => import('./pages/InterviewSetup'))
const InterviewPage = lazy(() => import('./pages/InterviewPage'))
const Results = lazy(() => import('./pages/Results'))

function LandingPage() {
  return (
    <div className="relative min-h-screen isolate">
      <AuroraBackground />

      {/* Layer 1 (lowest visual layer) — starfield behind everything */}
      <Suspense fallback={null}>
        <Starfield />
      </Suspense>

      {/* Layer 2 — splash cursor effect (pointer-events: none, doesn't block clicks) */}
      <SplashCursor zIndex={5} />

      {/* Layer 3 — page content (above stars + splash) */}
      <div className="relative z-10">
        <Header />

        <main>
          <Hero />
          <TrustIntro />
          <HowItWorks />
          <InterviewModes />
          <InterviewDemo />
          <FeedbackDashboard />
          <PerformanceChart />
          <Features />
          <CTA />
        </main>

        <Footer />
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen bg-ink-950 flex items-center justify-center text-ink-400 text-sm">Loading...</div>}>
              <InterviewSetup />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/results"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen bg-ink-950 flex items-center justify-center text-ink-400 text-sm">Evaluating...</div>}>
              <Results />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/:mode"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen bg-ink-950 flex items-center justify-center text-ink-400 text-sm">Starting interview...</div>}>
              <InterviewPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App