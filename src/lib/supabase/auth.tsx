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
      
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No profile found for user (this is normal for new users):', userId)
        } else {
          console.warn('⚠️ Error fetching profile:', {
            code: error.code,
            message: error.message
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

  // Create profile for new user with retry logic
  const createProfile = async (user: User, fullName?: string) => {
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Get full_name from user metadata if not provided
        const name = fullName || user.user_metadata?.full_name || null
        
        console.log(`👤 Creating profile (attempt ${attempt}/${maxRetries}) for user:`, {
          id: user.id,
          email: user.email,
          full_name: name
        })
        
        const profileData = {
          id: user.id,
          email: user.email!,
          full_name: name,
          role: 'learner' as const,
          active_role: 'learner' as const,
          available_roles: ['learner']
        }
        
        const { data, error } = await (supabase as any)
          .from('profiles')
          .insert([profileData])
          .select()
          .single()

        if (error) {
          console.warn(`⚠️ Error creating profile (attempt ${attempt}):`, {
            code: error.code,
            message: error.message
          })
          
          // Don't retry on duplicate key errors
          if (error.code === '23505') {
            console.log('ℹ️ Profile already exists, fetching it instead')
            return await fetchProfile(user.id)
          }
          
          // Retry on network errors
          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in 1 second...`)
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          }
          
          return null
        }

        console.log('✅ Profile created successfully:', data)
        return data
      } catch (error) {
        console.warn(`⚠️ Exception creating profile (attempt ${attempt}):`, error)
        
        // Retry on network errors
        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in 1 second...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
        
        return null
      }
    }
    
    return null
  }

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile for user:', user.id)
      const profileData = await fetchProfile(user.id)
      if (profileData) {
        console.log('✅ Profile refreshed:', profileData.id)
        setProfile(profileData)
      } else {
        console.warn('⚠️ Profile refresh returned null, keeping existing profile state')
      }
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

  // Sign in function with retry logic
  const signIn = async (email: string, password: string) => {
    const maxRetries = 3
    let lastError: AuthError | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempting sign-in (attempt ${attempt}/${maxRetries}) for:`, email)
        console.log('📋 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          console.error(`❌ Sign-in error (attempt ${attempt}):`, {
            message: error.message,
            status: error.status,
            name: error.name
          })
          lastError = error
          
          // Don't retry on auth errors (invalid credentials)
          if (error.status === 400 || error.message.includes('Invalid')) {
            return { error }
          }
          
          // Retry on network errors
          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in 1 second...`)
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          }
        } else {
          console.log('✅ Sign-in successful')
          return { error: null }
        }
      } catch (error) {
        console.error(`💥 Sign-in exception (attempt ${attempt}):`, error)
        lastError = error as AuthError
        
        // Retry on network errors
        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in 1 second...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
      }
    }

    return { error: lastError }
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

        let profileData: Profile | null = null
        
        if (session?.user) {
          console.log('👤 User session found, managing profile...')
          console.log('📋 Session details:', {
            userId: session.user.id,
            email: session.user.email,
            hasAccessToken: !!session.access_token
          })
          
          // Try to fetch existing profile first
          console.log('🔍 Attempting to fetch existing profile...')
          profileData = await fetchProfile(session.user.id)
          
          // If we have a profile in state and fetch failed, use the existing one
          if (!profileData && profile) {
            console.log('✅ Using existing profile from state:', profile.id)
            profileData = profile
          }
          
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
              active_role: defaultRole as 'learner' | 'affiliate',
              available_roles: [defaultRole as 'learner' | 'affiliate'],
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
              console.warn('⚠️ Error creating profile:', {
                code: error?.code,
                message: error?.message,
                details: error?.details,
                hint: error?.hint
              })
              
              // Try to fetch the profile in case it was created despite the error
              console.log('🔄 Attempting to fetch profile after error...')
              const { data: existingProfile, error: fetchError } = await (supabase as any)
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              if (existingProfile) {
                console.log('✅ Profile exists despite error, using it:', existingProfile)
                profileData = existingProfile
              } else {
                console.error('❌ Profile still not found after error:', fetchError)
                profileData = null
              }
            } else {
              console.log('✅ Profile created successfully:', data)
              profileData = data
              // Clear the pending data
              localStorage.removeItem('pendingRole')
              localStorage.removeItem('pendingUserData')
            }
          }
          
          if (profileData) {
            setProfile(profileData)
            console.log('📊 Profile state updated:', `Profile set: ${profileData.id}`)
          } else {
            console.warn('⚠️ No profile data available, profile state not updated')
          }
        } else {
          console.log('🚪 No user session, clearing profile')
          setProfile(null)
        }

        setLoading(false)
        console.log('✅ Auth state change processing complete', {
          hasProfile: !!profileData,
          profileId: profileData?.id,
          profileRole: profileData?.role
        })
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
