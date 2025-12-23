"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface AdminStats {
  totalUsers: number
  totalRevenue: number
  activeCourses: number
  activeAffiliates: number
  totalPayments: number
  totalCommissions: number
}

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

interface Payment {
  id: string
  amount: number
  status: string
  reference: string | null
  created_at: string
}

interface AdminData {
  stats: AdminStats
  recentUsers: User[]
  recentPayments: Payment[]
  loading: boolean
  error: string | null
}

export const useAdminData = (): AdminData => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRevenue: 0,
    activeCourses: 0,
    activeAffiliates: 0,
    totalPayments: 0,
    totalCommissions: 0
  })
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [recentPayments, setRecentPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [
          usersResult,
          paymentsResult,
          coursesResult,
          commissionsResult
        ] = await Promise.all([
          (supabase as any).from('profiles').select('*'),
          (supabase as any).from('payments').select('*').order('created_at', { ascending: false }),
          (supabase as any).from('courses').select('*'),
          (supabase as any).from('commissions').select('*')
        ])

        // Process users
        const users = usersResult.data || []
        const affiliates = users.filter((u: User) => u.role === 'affiliate')
        
        // Process payments
        const payments = paymentsResult.data || []
        const completedPayments = payments.filter((p: Payment) => p.status === 'completed')
        const totalRevenue = completedPayments.reduce((sum: number, p: Payment) => {
          // Use base_currency_amount if available (USD), otherwise fallback to amount with conversion
          const usdAmount = (p as any).base_currency_amount || (p.currency === 'USD' ? p.amount : p.amount / 10) // Approximate conversion
          return sum + usdAmount
        }, 0)

        // Process courses
        const courses = coursesResult.data || []

        // Process commissions
        const commissions = commissionsResult.data || []
        const totalCommissions = commissions.reduce((sum: number, c: any) => sum + c.amount, 0)

        // Set stats
        setStats({
          totalUsers: users.length,
          totalRevenue,
          activeCourses: courses.length,
          activeAffiliates: affiliates.length,
          totalPayments: payments.length,
          totalCommissions
        })

        // Set recent users (last 5)
        setRecentUsers(users.slice(0, 5))

        // Set recent payments (last 5)
        setRecentPayments(payments.slice(0, 5))

      } catch (err: any) {
        console.error('Error fetching admin data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  return {
    stats,
    recentUsers,
    recentPayments,
    loading,
    error
  }
}
