"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'

interface ProfileData {
  id: string
  email: string
  full_name: string | null
  avatar_url?: string | null
  phone?: string | null
  country?: string | null
  role: 'learner' | 'affiliate' | 'admin'
  created_at: string
  updated_at: string
}

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  gender: string
  dateOfBirth: string
  bio: string
}

interface UseProfileReturn {
  profile: ProfileData | null
  profileForm: ProfileFormData
  loading: boolean
  error: string | null
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  updateProfileForm: (field: string, value: string) => void
  saveProfile: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

export const useProfile = (): UseProfileReturn => {
  const { user, profile: authProfile } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    gender: '',
    dateOfBirth: '',
    bio: ''
  })

  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile)
      
      // Parse full name into first and last name
      const nameParts = authProfile.full_name?.split(' ') || ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      setProfileForm({
        firstName,
        lastName,
        email: authProfile.email || '',
        phone: authProfile.phone || '',
        country: authProfile.country || '',
        city: '', // We don't have city in the current schema
        gender: '', // We don't have gender in the current schema
        dateOfBirth: '', // We don't have date of birth in the current schema
        bio: '' // We don't have bio in the current schema
      })
      
      setLoading(false)
    } else if (user) {
      // If we have user but no profile, try to fetch it
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [user, authProfile])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        throw new Error(`Failed to fetch profile: ${fetchError.message}`)
      }

      setProfile(data as ProfileData)
      
      // Parse full name into first and last name
      const nameParts = (data as any).full_name?.split(' ') || ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      setProfileForm({
        firstName,
        lastName,
        email: (data as any).email || '',
        phone: (data as any).phone || '',
        country: (data as any).country || '',
        city: '',
        gender: '',
        dateOfBirth: '',
        bio: ''
      })

    } catch (err: any) {
      console.error('Error fetching profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfileForm = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveProfile = async () => {
    if (!user || !profile) {
      throw new Error('No user or profile found')
    }

    try {
      setLoading(true)
      setError(null)

      // Combine first and last name
      const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim()

      const updates = {
        full_name: fullName,
        phone: profileForm.phone || null,
        country: profileForm.country || null,
        updated_at: new Date().toISOString()
      }

      const { data, error: updateError } = await (supabase as any)
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`)
      }

      setProfile(data)
      setIsEditing(false)

    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('No user found')
    }

    try {
      setLoading(true)
      setError(null)

      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (passwordError) {
        throw new Error(`Failed to change password: ${passwordError.message}`)
      }

    } catch (err: any) {
      console.error('Error changing password:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    profileForm,
    loading,
    error,
    isEditing,
    setIsEditing,
    updateProfileForm,
    saveProfile,
    changePassword
  }
}
