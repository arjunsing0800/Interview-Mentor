import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const DEMO_USER: User = {
  id: 'demo-user-id',
  email: 'arjun@demo.com',
  user_metadata: { full_name: 'Arjun' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  demoLogin: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const hasSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hasSupabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!hasSupabase) return { error: new Error('Supabase not configured. Use Demo Login.') }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? new Error(error.message) : null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (!hasSupabase) return { error: new Error('Supabase not configured. Use Demo Login.') }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    return { error: error ? new Error(error.message) : null }
  }

  const signInWithGoogle = async () => {
    if (!hasSupabase) return { error: new Error('Supabase not configured. Use Demo Login.') }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    return { error: error ? new Error(error.message) : null }
  }

  const demoLogin = useCallback(() => {
    setUser(DEMO_USER)
    setSession({ user: DEMO_USER, access_token: 'demo', token_type: 'bearer', expires_in: 999999, expires_at: 999999 } as Session)
  }, [])

  const signOut = async () => {
    if (hasSupabase) await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, demoLogin, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}