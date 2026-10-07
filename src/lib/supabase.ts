import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey)
export { hasSupabase }

if (!hasSupabase) {
  console.warn(
    '[AI Interview Mentor] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — auth is disabled. Copy .env.example → .env and fill in your Supabase credentials.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  { auth: { persistSession: hasSupabase } }
)