"use client"
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

interface AffiliateStats {
  totalEarnings: number
  currentBalance: number
  totalSales: number
  totalReferrals: number
  commissionRate: number
  pendingCommissions: number
}

interface Commission {
  id: string
  amount: number
  commission_rate: number
  status: string
  created_at: string
  course: {
    title: string
  }
  payment: {
    amount: number
    status: string
    paid_at: string
  }
}

interface Payout {
  id: string
  amount: number
  status: string
  created_at: string
  processed_at?: string
  reference?: string
}

interface AffiliateProfile {
  commission_rate: number
  total_earnings: number
  total_referrals: number
  [key: string]: any
}

interface AffiliateDashboardData {
  stats: AffiliateStats
  recentCommissions: Commission[]
  recentPayouts: Payout[]
  affiliateProfile: AffiliateProfile | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export const useAffiliateData = (): AffiliateDashboardData => {
  const { user, profile } = useAuth()
  const pathname = usePathname()
  const [stats, setStats] = useState<AffiliateStats>({
    totalEarnings: 0,
    currentBalance: 0,
    totalSales: 0,
    totalReferrals: 0,
    commissionRate: 100,
    pendingCommissions: 0
  })
  const [recentCommissions, setRecentCommissions] = useState<Commission[]>([])
  const [recentPayouts, setRecentPayouts] = useState<Payout[]>([])
  const [affiliateProfile, setAffiliateProfile] = useState<AffiliateProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoized fetch function that can be called manually
  const fetchAffiliateData = useCallback(async () => {
    if (!user || !profile) {
      setLoading(false)
      return
    }

    // If not an affiliate, use mock data immediately
    if (profile.role !== 'affiliate') {
      setStats({
        totalEarnings: 2500.00,
        currentBalance: 750.00,
        totalSales: 15,
        totalReferrals: 42,
        commissionRate: 100,
        pendingCommissions: 3
      })
      setRecentCommissions([])
      setRecentPayouts([])
      setAffiliateProfile({ commission_rate: 100, total_earnings: 2500, total_referrals: 42 } as AffiliateProfile)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Use Promise.allSettled to fetch all data in parallel and handle failures gracefully
      const [profileResult, commissionsResult, payoutsResult] = await Promise.allSettled([
        // Fetch affiliate profile
        (supabase as any)
          .from('affiliate_profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        
        // Fetch commissions (simplified query for speed)
        (supabase as any)
          .from('commissions')
          .select('*')
          .eq('affiliate_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Fetch payouts
        (supabase as any)
          .from('payouts')
          .select('*')
          .eq('affiliate_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      // Handle affiliate profile
      let affiliateProfileData = null
      if (profileResult.status === 'fulfilled' && !profileResult.value.error) {
        affiliateProfileData = profileResult.value.data
        setAffiliateProfile(affiliateProfileData)
      } else {
        console.warn('Failed to fetch affiliate profile, using defaults')
        affiliateProfileData = { total_earnings: 0, total_referrals: 0, commission_rate: 100 } as AffiliateProfile
        setAffiliateProfile(affiliateProfileData)
      }

      // Handle commissions
      let commissions = []
      if (commissionsResult.status === 'fulfilled' && !commissionsResult.value.error) {
        commissions = commissionsResult.value.data || []
        setRecentCommissions(commissions)
      } else {
        console.warn('Failed to fetch commissions, using empty array')
        setRecentCommissions([])
      }

      // Handle payouts
      let payouts = []
      if (payoutsResult.status === 'fulfilled' && !payoutsResult.value.error) {
        payouts = payoutsResult.value.data || []
        setRecentPayouts(payouts)
      } else {
        console.warn('Failed to fetch payouts, using empty array')
        setRecentPayouts([])
      }

      // Calculate stats with fallback values
      const totalEarnings = affiliateProfileData?.total_earnings || 0
      const totalReferrals = affiliateProfileData?.total_referrals || 0
      const commissionRate = affiliateProfileData?.commission_rate || 100

      const totalSales = commissions.length || 0
      const pendingCommissions = commissions.filter((c: any) => c.status === 'pending').length || 0
      
      // Calculate current balance (simplified calculation)
      const approvedCommissions = commissions.filter((c: any) => c.status === 'approved').reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
      const totalPayouts = payouts.filter((p: any) => p.status === 'completed').reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
      const currentBalance = Math.max(0, approvedCommissions - totalPayouts)

      setStats({
        totalEarnings,
        currentBalance,
        totalSales,
        totalReferrals,
        commissionRate,
        pendingCommissions
      })

    } catch (err: any) {
      console.error('Error fetching affiliate data:', err)
      
      // Set fallback data on error to prevent blank dashboard
      setStats({
        totalEarnings: 0,
        currentBalance: 0,
        totalSales: 0,
        totalReferrals: 0,
        commissionRate: 100,
        pendingCommissions: 0
      })
      setRecentCommissions([])
      setRecentPayouts([])
      setAffiliateProfile({ commission_rate: 100, total_earnings: 0, total_referrals: 0 } as AffiliateProfile)
      
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, profile])

  // Initial fetch on mount or when user/profile changes
  useEffect(() => {
    fetchAffiliateData()
  }, [fetchAffiliateData])

  // Refetch when route changes
  useEffect(() => {
    fetchAffiliateData()
  }, [pathname, fetchAffiliateData])

  // Refetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📱 Tab became visible, refreshing affiliate data...')
        fetchAffiliateData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchAffiliateData])

  return {
    stats,
    recentCommissions,
    recentPayouts,
    affiliateProfile,
    loading,
    error,
    refresh: fetchAffiliateData
  }
}
