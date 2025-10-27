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

        // Try to fetch real leaderboard data from affiliate_profiles
        try {
          const { data: affiliateProfiles, error: profilesError } = await (supabase as any)
            .from('affiliate_profiles')
            .select(`
              id,
              total_earnings,
              total_referrals,
              affiliate_level,
              profiles!inner(full_name, email, phone, country)
            `)
            .order('total_earnings', { ascending: false })
            .limit(50)

          if (profilesError) {
            console.warn('Failed to fetch affiliate profiles, using fallback data:', profilesError.message)
            console.warn('This usually means the affiliate_profiles table does not exist yet.')
            console.warn('Please apply the migration: 20241016000004_create_affiliate_profiles_table.sql')
            throw new Error('FALLBACK_DATA')
          }

          // Transform the data into leaderboard format
          const leaderboardData: LeaderboardEntry[] = affiliateProfiles?.map((profile: any, index: number) => {
            const rank = index + 1
            return {
              rank,
              user_id: profile.id,
              name: profile.profiles?.full_name || profile.profiles?.email?.split('@')[0] || 'Anonymous',
              level: profile.affiliate_level || getAffiliateLevel(rank), // Use database level first, fallback to calculated
              total_earnings: profile.total_earnings || 0,
              total_referrals: profile.total_referrals || 0,
              award: getAwardEmoji(rank),
              isCurrentUser: user ? profile.id === user.id : false
            }
          }) || []

          setLeaderboard(leaderboardData)

          // Find current user's rank
          if (user) {
            const userEntry = leaderboardData.find(entry => entry.user_id === user.id)
            setCurrentUserRank(userEntry?.rank || null)
          }

        } catch (dbError: any) {
          // If database error or table doesn't exist, use mock data
          if (dbError.message === 'FALLBACK_DATA' || 
              dbError.message.includes('relation') ||
              dbError.message.includes('table') ||
              dbError.message.includes('does not exist')) {
            
            console.log('Using mock leaderboard data as fallback')
            console.log('To use real data, apply the affiliate_profiles migration')
            
            // Mock leaderboard data
            const mockLeaderboard: LeaderboardEntry[] = [
              {
                rank: 1,
                user_id: 'mock-1',
                name: "Ezekiel Numo",
                level: "Legends",
                total_earnings: 75000,
                total_referrals: 150,
                award: "🏆"
              },
              {
                rank: 2,
                user_id: 'mock-2',
                name: "Okeke Vivian Vivian",
                level: "Legends",
                total_earnings: 68000,
                total_referrals: 136,
                award: "🥈"
              },
              {
                rank: 3,
                user_id: 'mock-3',
                name: "Amarachi Miracle Onwuka",
                level: "Legends",
                total_earnings: 62000,
                total_referrals: 124,
                award: "🥉"
              },
              {
                rank: 4,
                user_id: 'mock-4',
                name: "Mary Okine Andoh",
                level: "Champions",
                total_earnings: 58000,
                total_referrals: 116,
                award: "🏆"
              },
              {
                rank: 5,
                user_id: 'mock-5',
                name: "Chukwuekwu precious Cyril",
                level: "Champions",
                total_earnings: 55000,
                total_referrals: 110,
                award: "🏆"
              },
              {
                rank: 6,
                user_id: 'mock-6',
                name: "Belle ⭐ Graham ⭐",
                level: "Champions",
                total_earnings: 28000,
                total_referrals: 85,
                award: "🏆"
              },
              {
                rank: 7,
                user_id: 'mock-7',
                name: "Jennifer Asabea",
                level: "Elites",
                total_earnings: 15000,
                total_referrals: 65,
                award: "🏆"
              },
              {
                rank: 8,
                user_id: 'mock-8',
                name: "Tengen Joyceline Endam",
                level: "Elites",
                total_earnings: 8000,
                total_referrals: 45,
                award: "🏆"
              },
              {
                rank: 9,
                user_id: 'mock-9',
                name: "Louisa Donkor",
                level: "Elites",
                total_earnings: 6500,
                total_referrals: 38,
                award: "🏆"
              }
            ]

            // Add current user if they exist
            if (user && profile) {
              const userName = profile.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'You'
              mockLeaderboard.push({
                rank: 10,
                user_id: user.id,
                name: `You (${userName})`,
                level: "Elites",
                total_earnings: 58,
                total_referrals: 3,
                award: "🏆",
                isCurrentUser: true
              })
              setCurrentUserRank(10)
            }

            setLeaderboard(mockLeaderboard)
          } else {
            throw dbError
          }
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
