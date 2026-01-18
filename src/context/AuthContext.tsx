import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string
  role: 'user' | 'admin'
  created_at: string
}

interface ExtendedUser extends User {
  profile: UserProfile | null
}

interface AuthContextType {
  user: ExtendedUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = async (authUser: User | null): Promise<ExtendedUser | null> => {
    if (!authUser) return null

    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        return {
          ...authUser,
          profile: profile as UserProfile,
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }

    return {
      ...authUser,
      profile: null,
    }
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        const extendedUser = await loadUserProfile(session?.user ?? null)
        setUser(extendedUser)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      const extendedUser = await loadUserProfile(session?.user ?? null)
      setUser(extendedUser)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    })

    if (error) throw error

    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert([{
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        phone: phone,
        role: 'user',
      }])
      if (profileError) throw profileError
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider')
    return {
      user: null,
      session: null,
      loading: false,
      signIn: async () => {},
      signUp: async () => {},
      signOut: async () => {},
    }
  }
  return context
}
