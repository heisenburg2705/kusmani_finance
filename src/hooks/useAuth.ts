import { useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@lib/supabase'
import { Profile } from '@types'

interface UseAuthReturn {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>
}

/**
 * Authentication hook
 * Manage user session, profile, and auth operations
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get initial session
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      }

      setIsLoading(false)
    }

    getSession()
  }, [])

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  /**
   * Fetch user profile
   */
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setProfile(null)
    }
  }

  /**
   * Sign up new user
   */
  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ error: string | null }> => {
    try {
      // Step 1: Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError || !data.user) {
        return { error: signUpError?.message || 'Signup failed' }
      }

      // Step 2: Create profile using service role key (bypass RLS)
      // Need to create profile immediately before email verification
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: email.split('@')[0],
        display_name: displayName || email.split('@')[0],
      })

      if (profileError) {
        return { error: profileError.message }
      }

      return { error: null }
    } catch (error) {
      return { error: String(error) }
    }
  }

  /**
   * Sign in
   */
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: String(error) }
    }
  }

  /**
   * Sign out
   */
  const signOut = async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { error: error.message }
      }

      setUser(null)
      setProfile(null)
      setSession(null)

      return { error: null }
    } catch (error) {
      return { error: String(error) }
    }
  }

  /**
   * Update profile
   */
  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!user) {
      return { error: 'No authenticated user' }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        return { error: error.message }
      }

      setProfile((prev: Profile | null) => (prev ? { ...prev, ...updates } : null))
      return { error: null }
    } catch (error) {
      return { error: String(error) }
    }
  }

  return {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!session?.user,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }
}
