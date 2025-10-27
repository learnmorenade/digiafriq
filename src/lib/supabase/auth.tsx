'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from './client'
import { Database } from './types'

type Profile = Database['public']['Tables']['profiles']['Row']
type UserRole = Database['public']['Enums']['user_role']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  switchRole: (newRole: UserRole) => Promise<{ error: Error | null }>
  addRole: (newRole: UserRole) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user ID:', userId)
      
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No profile found for user (this is normal for new users):', userId)
        } else {
          console.error('❌ Error fetching profile:', {
            error,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
        }
        return null
      }

      console.log('✅ Profile fetched successfully:', data)
      return data
    } catch (error) {
      console.error('💥 Unexpected error fetching profile:', error)
      return null
    }
  }

  // Create profile for new user
  const createProfile = async (user: User, fullName?: string) => {
    try {
      // Get full_name from user metadata if not provided
      const name = fullName || user.user_metadata?.full_name || null
      
      console.log('👤 Creating profile for user:', {
        id: user.id,
        email: user.email,
        full_name: name,
        user_metadata: user.user_metadata
      })
      
      const profileData = {
        id: user.id,
        email: user.email!,
        full_name: name,
        role: 'learner' as const
      }
      
      console.log('📝 Profile data to insert:', profileData)
      
      const { data, error } = await (supabase as any)
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating profile:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          profileData
        })
        return null
      }

      console.log('✅ Profile created successfully:', data)
      return data
    } catch (error) {
      console.error('💥 Unexpected error creating profile:', error)
      return null
    }
  }

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('🔄 Starting sign-up process for:', email)
      console.log('📝 Full name provided:', fullName)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: undefined // Disable email confirmation
        }
      })

      if (error) {
        console.error('❌ Supabase sign-up error:', error)
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        })
        return { error }
      }

      console.log('✅ Supabase sign-up successful:', {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
          created_at: data.user.created_at
        } : null,
        session: data.session ? 'Session created' : 'No session (email confirmation required)'
      })

      // Profile creation will be handled in the auth state change listener
      // when the user confirms their email and signs in
      return { error: null }
    } catch (error) {
      console.error('💥 Unexpected error during sign-up:', error)
      return { error: error as AuthError }
    }
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      console.log('🔄 Starting sign-out process...')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Sign-out error:', error)
        return { error }
      }
      
      console.log('✅ Sign-out successful, clearing state...')
      setUser(null)
      setProfile(null)
      setSession(null)
      
      // Clear any pending data
      localStorage.removeItem('pendingRole')
      localStorage.removeItem('pendingUserData')
      
      console.log('✅ State cleared successfully')
      return { error: null }
    } catch (error) {
      console.error('💥 Unexpected sign-out error:', error)
      return { error: error as AuthError }
    }
  }

  // Update profile function
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) return { error: new Error(error.message) }

      setProfile(data)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Switch active role function
  const switchRole = async (newRole: UserRole) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      console.log('🔄 Switching role to:', newRole)
      
      const { error } = await (supabase as any).rpc('switch_active_role', {
        user_id: user.id,
        new_active_role: newRole
      })

      if (error) {
        console.error('❌ Error switching role:', error)
        return { error: new Error(error.message) }
      }

      // Refresh profile to get updated role
      await refreshProfile()
      
      console.log('✅ Role switched successfully to:', newRole)
      return { error: null }
    } catch (error) {
      console.error('💥 Unexpected error switching role:', error)
      return { error: error as Error }
    }
  }

  // Add role to user function
  const addRole = async (newRole: UserRole) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      console.log('➕ Adding role:', newRole)
      
      const { error } = await (supabase as any).rpc('add_role_to_user', {
        user_id: user.id,
        new_role: newRole
      })

      if (error) {
        console.error('❌ Error adding role:', error)
        return { error: new Error(error.message) }
      }

      // Refresh profile to get updated available roles
      await refreshProfile()
      
      console.log('✅ Role added successfully:', newRole)
      return { error: null }
    } catch (error) {
      console.error('💥 Unexpected error adding role:', error)
      return { error: error as Error }
    }
  }

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔄 Getting initial session...')
      
      const { data: { session } } = await supabase.auth.getSession()
      
      console.log('📊 Initial session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        emailConfirmed: session?.user?.email_confirmed_at
      })
      
      if (session) {
        setSession(session)
        setUser(session.user)
        
        console.log('👤 Initial session found, fetching/creating profile...')
        
        // Fetch or create profile
        let profileData = await fetchProfile(session.user.id)
        if (!profileData) {
          console.log('🎆 No profile found during initial load, creating one...')
          profileData = await createProfile(session.user)
        }
        setProfile(profileData)
      } else {
        console.log('🚪 No initial session found')
      }
      
      setLoading(false)
      console.log('✅ Initial session check complete')
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change detected:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          emailConfirmed: session?.user?.email_confirmed_at
        })
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          console.log('👤 User session found, managing profile...')
          
          // Fetch or create profile
          let profileData = await fetchProfile(session.user.id)
          
          if (!profileData) {
            console.log('🔄 No profile found, creating one now...')
            
            // Create profile for any user without one (regardless of event type)
            // Check if there's a pending role from signup
            const pendingRole = localStorage.getItem('pendingRole')
            const pendingUserData = localStorage.getItem('pendingUserData')
            const defaultRole = pendingRole || 'learner'
            
            let additionalData = {}
            if (pendingUserData) {
              try {
                additionalData = JSON.parse(pendingUserData)
              } catch (e) {
                console.error('Error parsing pending user data:', e)
              }
            }
            
            console.log('📝 Creating profile with role:', defaultRole)
            console.log('📝 Additional user data:', additionalData)
            
            // Create profile with the selected role and additional data
            const userData = additionalData as { country?: string; phoneNumber?: string }
            const profileToCreate = {
              id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name || null,
              role: defaultRole as 'learner' | 'affiliate',
              country: userData.country || null,
              phone: userData.phoneNumber || null
            }
            
            console.log('💾 Inserting profile into database:', profileToCreate)
            
            const { data, error } = await (supabase as any)
              .from('profiles')
              .insert([profileToCreate])
              .select()
              .single()
            
            if (error) {
              console.error('❌ Error creating profile:', error)
              console.error('Error details:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
              })
            } else {
              console.log('✅ Profile created successfully:', data)
              profileData = data
              // Clear the pending data
              localStorage.removeItem('pendingRole')
              localStorage.removeItem('pendingUserData')
            }
          }
          
          setProfile(profileData)
          console.log('📊 Profile state updated:', profileData ? 'Profile set' : 'No profile')
        } else {
          console.log('🚪 No user session, clearing profile')
          setProfile(null)
        }

        setLoading(false)
        console.log('✅ Auth state change processing complete')
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    switchRole,
    addRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Role-based hooks
export function useRequireAuth(redirectTo = '/auth/signin') {
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = redirectTo
    }
  }, [user, loading, redirectTo])

  return { user, loading }
}

export function useRequireRole(requiredRole: UserRole, redirectTo = '/dashboard') {
  const { profile, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && profile && profile.role !== requiredRole) {
      window.location.href = redirectTo
    }
  }, [profile, loading, requiredRole, redirectTo])

  return { profile, loading }
}

export function useIsAdmin() {
  const { profile } = useAuth()
  return profile?.role === 'admin'
}

export function useIsAffiliate() {
  const { profile } = useAuth()
  return profile?.role === 'affiliate'
}

export function useIsLearner() {
  const { profile } = useAuth()
  return profile?.role === 'learner'
}
