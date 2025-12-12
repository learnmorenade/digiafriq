"use client"
import React, { Suspense } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  Activity,
  GraduationCap,
  Copy,
  Loader2,
  UserPlus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAffiliateData } from '@/lib/hooks/useAffiliateData'
import { useAuth } from '@/lib/supabase/auth'
import { useReferralCode, useReferralStats, useCommissions } from '@/hooks/useReferrals'
import { toast } from 'sonner'

const AffiliateDashboard = () => {
  const { stats: affiliateStats, recentCommissions, recentPayouts, affiliateProfile, loading: affiliateLoading, error } = useAffiliateData()
  const { user, profile } = useAuth()
  const { stats: referralStats, loading: referralStatsLoading } = useReferralStats()
  const { loading: commissionsLoading, getTotalEarnings, getAvailableEarnings } = useCommissions()
  const { referralCode, loading: referralCodeLoading, generateUrls } = useReferralCode()

  const urls = generateUrls()

  const totalEarnings = getTotalEarnings()
  const currentBalanceValue = getAvailableEarnings()
  const totalReferrals = referralStats.total_referrals

  const loading = affiliateLoading || referralStatsLoading || commissionsLoading || referralCodeLoading

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      toast.success('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
      toast.error('Failed to copy link')
    }
  }

  const statsCards = [
    {
      title: "Current Balance",
      value: loading ? "..." : `$${currentBalanceValue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100"
    },
    {
      title: "Total Earnings", 
      value: loading ? "..." : `$${totalEarnings.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50", 
      iconBg: "bg-blue-100"
    },
    {
      title: "Total Referrals",
      value: loading ? "..." : totalReferrals.toString(),
      icon: UserPlus,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100"
    }
  ]

  // Show skeleton loading instead of full screen loader for better UX
  const SkeletonCard = () => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gray-200 animate-pulse"></div>
        </div>
        <div className="flex justify-end mt-3 lg:mt-4">
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  )

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading dashboard: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <div className="p-6">
      {/* Compact Welcome Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Welcome, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Affiliate'}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">Track your affiliate performance</p>
          </div>
          {!loading && (
            <div className="text-right">
              <p className="text-base sm:text-lg font-bold text-gray-900">
                ${currentBalanceValue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Balance</p>
            </div>
          )}
        </div>

        {/* Simple Inline Filter */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
            <input 
              type="date"
              placeholder="Start date"
              className="flex-1 px-4 py-2.5 text-sm border-0 focus:outline-none focus:ring-0 text-gray-700"
            />
            <span className="text-gray-400 px-2">-</span>
            <input 
              type="date"
              placeholder="End date"
              className="flex-1 px-4 py-2.5 text-sm border-0 focus:outline-none focus:ring-0 text-gray-700"
            />
          </div>
          <Button className="bg-[#4ade80] hover:bg-[#22c55e] text-white px-6 py-2.5 rounded-lg font-medium whitespace-nowrap">
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Grid - Mobile optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {loading ? (
          // Show skeleton cards while loading
          Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : (
          statsCards.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex justify-end mt-3 lg:mt-4">
                  <Button variant="ghost" size="sm" className="text-orange-600 hover:text-[#d76f32] text-xs lg:text-sm">
                    View All
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Activity - Sales & Transactions */}
      <div className="mb-8">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : recentCommissions.length === 0 && recentPayouts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No recent activity to display</p>
                <p className="text-sm">Your recent sales and transactions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Recent Commissions (Sales) */}
                {recentCommissions.slice(0, 5).map((commission) => (
                  <div 
                    key={commission.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          Commission Earned
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          commission.status === 'approved' ? 'bg-green-100 text-green-700' :
                          commission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {commission.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(commission.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        +${commission.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Recent Payouts (Transactions) */}
                {recentPayouts.slice(0, 3).map((payout) => (
                  <div 
                    key={payout.id} 
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          Payout
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          payout.status === 'completed' ? 'bg-green-100 text-green-700' :
                          payout.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          payout.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {payout.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(payout.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {payout.reference && ` • Ref: ${payout.reference}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">
                        ${payout.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* View All Link */}
                {(recentCommissions.length > 5 || recentPayouts.length > 3) && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm" className="text-orange-600 hover:text-[#d76f32]">
                      View All Activity
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Referral Links Section - Mobile optimized */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
              Refer a Learner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 lg:space-y-4">
            <p className="text-sm text-gray-600">
              Earn 80% commission on learner memberships + 20% recurring on renewals.
            </p>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs font-medium text-gray-700 mb-1">Your Referral Link:</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <code className="flex-1 text-xs bg-white p-2 rounded border text-gray-800 font-mono break-all">
                  {urls.learnerUrl || 'Generating link...'}
                </code>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-gray-300 w-full sm:w-auto"
                  onClick={() => urls.learnerUrl && copyToClipboard(urls.learnerUrl)}
                  disabled={!urls.learnerUrl}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-green-600" />
              Refer an Affiliate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 lg:space-y-4">
            <p className="text-sm text-gray-600">
              Earn 80% on learner membership + $2 DCS addon bonus + 20% recurring.
            </p>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs font-medium text-gray-700 mb-1">Your Affiliate Link:</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <code className="flex-1 text-xs bg-white p-2 rounded border text-gray-800 font-mono break-all">
                  {urls.affiliateUrl || 'Generating link...'}
                </code>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-gray-300 w-full sm:w-auto"
                  onClick={() => urls.affiliateUrl && copyToClipboard(urls.affiliateUrl)}
                  disabled={!urls.affiliateUrl}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </Suspense>
  )
}

export default AffiliateDashboard
