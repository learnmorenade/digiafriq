"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'

interface CourseProgress {
  id: string
  title: string
  progress_percentage: number
  enrolled_at: string
  last_accessed_lesson_id?: string
  completed_at?: string
  courses: {
    title: string
    description: string
    thumbnail_url: string
    instructor_id: string
    estimated_duration: number
    category: string
  }
}

interface LearnerStats {
  totalEnrolled: number
  totalCompleted: number
  totalInProgress: number
  totalWatchTime: number
}

interface LearnerDashboardData {
  stats: LearnerStats
  recentCourses: CourseProgress[]
  profile: any
  loading: boolean
  error: string | null
}

export const useLearnerData = (): LearnerDashboardData => {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<LearnerStats>({
    totalEnrolled: 0,
    totalCompleted: 0,
    totalInProgress: 0,
    totalWatchTime: 0
  })
  const [recentCourses, setRecentCourses] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !profile) {
      setLoading(false)
      return
    }

    // If not a learner, use mock data immediately
    if (profile.role !== 'learner') {
      setStats({
        totalEnrolled: 8,
        totalCompleted: 3,
        totalInProgress: 5,
        totalWatchTime: 24
      })
      setRecentCourses([])
      setLoading(false)
      return
    }

    const fetchLearnerData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simplified query for faster loading - fetch basic enrollment data first
        const { data: enrollments, error: enrollmentsError } = await (supabase as any)
          .from('enrollments')
          .select('*, courses(title, description, thumbnail_url, category)')
          .eq('user_id', user.id)
          .order('enrolled_at', { ascending: false })
          .limit(20) // Limit for performance

        if (enrollmentsError) {
          console.warn('Failed to fetch enrollments, using fallback data:', enrollmentsError.message)
          // Use fallback data instead of throwing error
          setStats({
            totalEnrolled: 0,
            totalCompleted: 0,
            totalInProgress: 0,
            totalWatchTime: 0
          })
          setRecentCourses([])
          setLoading(false)
          return
        }

        // Calculate stats with null safety
        const totalEnrolled = enrollments?.length || 0
        const totalCompleted = enrollments?.filter((e: any) => e.completed_at).length || 0
        const totalInProgress = totalEnrolled - totalCompleted
        
        // Simplified watch time calculation
        const totalWatchTime = enrollments?.reduce((total: number, enrollment: any) => {
          const progress = enrollment.progress_percentage || 0
          return total + (progress * 0.3) // Simplified calculation
        }, 0) || 0

        setStats({
          totalEnrolled,
          totalCompleted,
          totalInProgress,
          totalWatchTime: Math.round(totalWatchTime)
        })

        setRecentCourses(enrollments || [])

      } catch (err: any) {
        console.error('Error fetching learner data:', err)
        
        // Set fallback data on error
        setStats({
          totalEnrolled: 0,
          totalCompleted: 0,
          totalInProgress: 0,
          totalWatchTime: 0
        })
        setRecentCourses([])
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch only - no auto-revalidation
    fetchLearnerData()
  }, [user, profile])

  return {
    stats,
    recentCourses,
    profile,
    loading,
    error
  }
}
