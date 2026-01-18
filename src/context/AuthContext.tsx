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
  signIn: (email: string, password: string) => Promise<{ user: User; session: Session }>
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ user: User | null; session: Session | null }>
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
      } else {
        console.log('Profile not found, attempting to create...')
        try {
          const { error: insertError } = await supabase.from('users').insert([{
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || 'Usuario',
            phone: authUser.user_metadata?.phone || 'Sin teléfono',
            role: 'user',
          }])

          if (insertError) {
            console.error('Error creating user profile:', insertError)
          } else {
            console.log('Profile created successfully')
            const { data: newProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .single()
            return newProfile ? {
              ...authUser,
              profile: newProfile as UserProfile,
            } : null
          }
        } catch (error) {
          console.error('Error creating missing profile:', error)
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

  const signIn = async (email: string, password: string): Promise<{ user: User; session: Session }> => {
    console.log('Attempting to sign in...')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Sign in error:', error)
      setLoading(false)
      throw error
    }
    console.log('Sign in successful:', data)

    if (data.user) {
      const profile = await loadUserProfile(data.user)
      setUser(profile)
    }

    setLoading(false)
    return { user: data.user, session: data.session }
  }

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    console.log('Attempting to sign up...')
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      console.error('Sign up error:', error)
      setLoading(false)
      throw error
    }

    console.log('Sign up successful:', data)
    console.log('Profile will be created automatically by trigger')

    setLoading(false)
    return data
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
