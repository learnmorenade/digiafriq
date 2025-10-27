"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Tutorial {
  id: string
  title: string
  description: string
  type: 'video' | 'article' | 'webinar'
  duration: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  views: number
  rating: number
  thumbnail_url?: string
  video_url?: string
  content?: string
  is_featured: boolean
  created_at: string
}

interface TutorialsData {
  tutorials: Tutorial[]
  featuredTutorial: Tutorial | null
  loading: boolean
  error: string | null
}

export const useTutorials = (): TutorialsData => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [featuredTutorial, setFeaturedTutorial] = useState<Tutorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to fetch real tutorials data
        try {
          const { data: tutorialsData, error: tutorialsError } = await (supabase as any)
            .from('tutorials')
            .select('*')
            .order('created_at', { ascending: false })

          if (tutorialsError) {
            console.warn('Failed to fetch tutorials, using fallback data:', tutorialsError.message)
            console.warn('This usually means the tutorials table does not exist yet.')
            console.warn('Please apply the migration: create_tutorials_table.sql')
            throw new Error('FALLBACK_DATA')
          }

          setTutorials(tutorialsData || [])
          
          // Find featured tutorial
          const featured = tutorialsData?.find((t: Tutorial) => t.is_featured)
          setFeaturedTutorial(featured || null)

        } catch (dbError: any) {
          // If database error or table doesn't exist, show error
          if (dbError.message === 'FALLBACK_DATA' || 
              dbError.message.includes('relation') ||
              dbError.message.includes('table') ||
              dbError.message.includes('does not exist')) {
            
            console.error('Tutorials table does not exist. Please apply the migration.')
            setError('Tutorials table not found. Please contact administrator.')
            setTutorials([])
            setFeaturedTutorial(null)
          } else {
            throw dbError
          }
        }

      } catch (err: any) {
        console.error('Error fetching tutorials:', err)
        setError(err.message)
        
        // Set empty tutorials on error
        setTutorials([])
        setFeaturedTutorial(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTutorials()
  }, [])

  return {
    tutorials,
    featuredTutorial,
    loading,
    error
  }
}
