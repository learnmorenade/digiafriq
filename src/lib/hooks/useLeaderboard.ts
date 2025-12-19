"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'

interface LeaderboardEntry {
  rank: number
  user_id: string
  name: string
  level: string
  total_earnings: number
  total_referrals: number
  award: string
  isCurrentUser?: boolean
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[]
  currentUserRank: number | null
  loading: boolean
  error: string | null
}

export const useLeaderboard = (): LeaderboardData => {
  const { user, profile } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to determine affiliate level based on rank
  const getAffiliateLevel = (rank: number): string => {
    if (rank >= 1 && rank <= 3) return 'Legends'
    if (rank >= 4 && rank <= 6) return 'Champions'
    if (rank >= 7 && rank <= 10) return 'Elites'
    if (rank >= 11 && rank <= 15) return 'Rising Stars'
    if (rank >= 16 && rank <= 20) return 'Dream Chasers'
    return 'Starter'
  }

  // Function to get award emoji based on rank
  const getAwardEmoji = (rank: number): string => {
    if (rank === 1) return '🏆'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return '🏆'
  }

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch affiliate profiles
        const { data: affiliateProfiles, error: profilesError } = await supabase
          .from('affiliate_profiles')
          .select(`
            id,
            total_earnings
          `)
          .order('total_earnings', { ascending: false })
          .limit(50)

        if (profilesError) {
          console.error('Failed to fetch affiliate profiles:', profilesError.message)
          setLeaderboard([])
          return
        }

        // Fetch profile names for these affiliates
        const affiliateIds = (affiliateProfiles || []).map((a: any) => a.id)
        
        let profilesMap = new Map<string, { full_name: string; email: string }>()
        
        if (affiliateIds.length > 0) {
          const { data: profiles, error: profilesFetchError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', affiliateIds)

          if (!profilesFetchError && profiles) {
            profilesMap = new Map(profiles.map((p: any) => [p.id, p]))
          }
        }

        // Transform the data into leaderboard format
        const leaderboardData: LeaderboardEntry[] = (affiliateProfiles || []).map((affiliate: any, index: number) => {
          const rank = index + 1
          const profileData = profilesMap.get(affiliate.id)
          return {
            rank,
            user_id: affiliate.id,
            name: profileData?.full_name || profileData?.email?.split('@')[0] || 'Anonymous Affiliate',
            level: getAffiliateLevel(rank), // Calculate level from rank
            total_earnings: affiliate.total_earnings || 0,
            total_referrals: 0, // Column doesn't exist in DB yet
            award: getAwardEmoji(rank),
            isCurrentUser: user ? affiliate.id === user.id : false
          }
        })

        setLeaderboard(leaderboardData)

        // Find current user's rank
        if (user) {
          const userEntry = leaderboardData.find(entry => entry.user_id === user.id)
          setCurrentUserRank(userEntry?.rank || null)
        }

      } catch (err: any) {
        console.error('Error fetching leaderboard:', err)
        setError(err.message)
        
        // Set empty leaderboard on error
        setLeaderboard([])
        setCurrentUserRank(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [user, profile])

  return {
    leaderboard,
    currentUserRank,
    loading,
    error
  }
}
