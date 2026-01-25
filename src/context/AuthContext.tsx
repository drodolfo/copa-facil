import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string
  team_name: string
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
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>
  signUp: (email: string, password: string, fullName: string, phone: string, teamName: string) => Promise<{ user: User | null; session: Session | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = async (authUser: User | null): Promise<ExtendedUser | null> => {
    console.log('loadUserProfile called with:', authUser)
    if (!authUser) {
      console.log('loadUserProfile: authUser is null')
      return null
    }

    try {
      console.log('loadUserProfile: Fetching profile from users table...')
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      console.log('loadUserProfile: Profile query result:', { profile, error })

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      if (profile) {
        console.log('loadUserProfile: Profile found, returning extended user')
        return {
          ...authUser,
          profile: profile as UserProfile,
        }
      } else {
        console.log('Profile not found, returning user without profile')
        return {
          ...authUser,
          profile: null,
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      return {
        ...authUser,
        profile: null,
      }
    }
  }

  useEffect(() => {
    console.log('AuthContext mounted')
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'NOT SET')

    let mounted = true

    const getSession = async () => {
      try {
        console.log('Getting current session...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Current session:', session)
        setSession(session)

        if (session?.user) {
          const extendedUser = {
            ...session.user,
            profile: null,
          }
          setUser(extendedUser)

          loadUserProfile(session.user).then((profile) => {
            console.log('Profile loaded in background:', profile)
            if (profile) {
              setUser(profile)
            }
          })
        } else {
          setUser(null)
        }

        if (mounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session)
      setSession(session)

      if (session?.user) {
        const extendedUser = {
          ...session.user,
          profile: null,
        }
        setUser(extendedUser)

        loadUserProfile(session.user).then((profile) => {
          console.log('Profile loaded in background:', profile)
          if (profile) {
            setUser(profile)
          }
        })
      } else {
        setUser(null)
      }

      if (mounted) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<{ user: User | null; session: Session | null }> => {
    console.log('Attempting to sign in...', { email })
    setLoading(true)

    try {
      const response = await supabase.auth.signInWithPassword({ email, password })
      console.log('Supabase response:', response)

      if (response.error) {
        console.error('Sign in error:', response.error)
        setLoading(false)
        throw response.error
      }

      console.log('Sign in successful:', response.data)
      console.log('User:', response.data.user)
      console.log('Session:', response.data.session)

      const result = { user: response.data.user || null, session: response.data.session || null }
      setLoading(false)
      return result
    } catch (error) {
      console.error('Sign in caught error:', error)
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName: string, phone: string, teamName: string) => {
    console.log('Attempting to sign up...')
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          team_name: teamName,
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
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
