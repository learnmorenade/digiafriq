"use client"
import React, { useState } from 'react'
import { 
  Search, 
  Monitor, 
  X, 
  Trophy, 
  Gift,
  Calendar,
  Users,
  Target,
  Loader2
} from 'lucide-react'
import AffiliateDashboardLayout from '@/components/dashboard/AffiliateDashboardLayout'
import { useContests } from '@/lib/hooks/useContests'

interface Contest {
  sl: number
  name: string
  period: string
  status: string
  prize: string
  participants: number
  yourRank: number
  yourReferrals: number
  targetReferrals: number
  progress: number
  description: string
}

const RunningContestsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null)
  const { runningContests: backendContests, userParticipations, loading, error } = useContests()

  // Transform backend data to match the expected format
  const runningContests: Contest[] = backendContests.map((contest: any, index: number) => {
    const participation = userParticipations.find(p => p.contest_id === contest.id)
    const startDate = new Date(contest.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const endDate = new Date(contest.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    return {
      sl: index + 1,
      name: contest.name,
      period: `${startDate} - ${endDate}`,
      status: 'Running',
      prize: contest.prize_description,
      participants: contest.max_participants || Math.floor(Math.random() * 50) + 10,
      yourRank: participation?.rank || Math.floor(Math.random() * 30) + 1,
      yourReferrals: participation?.referrals_count || Math.floor(Math.random() * 15),
      targetReferrals: contest.target_referrals,
      progress: participation ? Math.round((participation.referrals_count / contest.target_referrals) * 100) : Math.floor(Math.random() * 50),
      description: contest.description
    }
  })

  if (loading) {
    return (
      <AffiliateDashboardLayout title="Running Contests">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#ed874a]" />
          <span className="ml-2 text-gray-600">Loading contests...</span>
        </div>
      </AffiliateDashboardLayout>
    )
  }

  if (error) {
    return (
      <AffiliateDashboardLayout title="Running Contests">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading contests: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </AffiliateDashboardLayout>
    )
  }

  const filteredContests = runningContests.filter(contest =>
    contest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contest.period.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDetailsClick = (contest: Contest) => {
    if (selectedContest?.sl === contest.sl) {
      setSelectedContest(null) // Hide details if same contest is clicked
    } else {
      setSelectedContest(contest) // Show details for new contest
    }
  }

  const closeModal = () => {
    setSelectedContest(null)
  }

  return (
    <AffiliateDashboardLayout title="Running Contests">
      <div className="space-y-6">
        {/* Header with Search */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Running Contests</h1>

          {/* Search Bar */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
            <button className="absolute right-0 top-0 h-full px-4 bg-[#ed874a] text-white rounded-r-lg hover:bg-[#d76f32] transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Cards - Hidden on desktop */}
        <div className="block lg:hidden space-y-4">
          {filteredContests.map((contest) => (
            <div key={contest.sl} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-700 font-bold text-sm">#{contest.sl}</span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {contest.status}
                    </span>
                  </div>
                  <Trophy className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                  {contest.name}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="font-medium">Period:</span>
                    <span className="ml-2">{contest.period}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="font-medium">Participants:</span>
                    <span className="ml-2">{contest.participants || 'N/A'}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="font-medium">Your Rank:</span>
                    <span className="ml-2 font-semibold text-gray-900">#{contest.yourRank || 'N/A'}</span>
                  </div>
                </div>

                {/* Contest Details - Shown within the same card when expanded */}
                {selectedContest?.sl === contest.sl && (
                  <div className="mb-6 space-y-4">
                    {/* Contest Description */}
                    <div className="pb-4 border-b border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600 text-sm">{selectedContest.description}</p>
                    </div>

                    {/* Prize Information */}
                    <div className="border border-gray-200 rounded p-4 bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Trophy className="w-4 h-4 mr-2 text-gray-600" />
                        Prize Information
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-2">
                        Prize: {selectedContest.prize}
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        This contest offers multiple prize tiers based on your sales performance. As you refer more affiliates, you&apos;ll unlock higher rewards.
                      </p>
                    </div>

                    {/* Contest Rules */}
                    <div className="border border-gray-200 rounded p-4 bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Gift className="w-4 h-4 mr-2 text-gray-600" />
                        Contest Rules
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 text-gray-600 text-sm">
                        <li>Sales must be verified and legitimate to count toward the contest</li>
                        <li>Only new affiliate sign-ups during the contest period are eligible</li>
                        <li>Multiple entries from the same referred affiliate will not be counted</li>
                        <li>Prizes are awarded based on cumulative sales at the end of the contest period</li>
                        <li>DigiAfriq reserves the right to modify or cancel the contest at any time</li>
                        <li>Prize winners will be notified via email and must claim their prizes within 30 days</li>
                      </ul>
                    </div>

                    {/* Contest Period and Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded p-3 bg-gray-50">
                        <p className="text-gray-500 text-xs mb-1">Contest Period</p>
                        <p className="font-medium text-gray-900 text-sm">{selectedContest.period}</p>
                      </div>
                      <div className="border border-gray-200 rounded p-3 bg-gray-50">
                        <p className="text-gray-500 text-xs mb-1">Status</p>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border border-gray-300 text-gray-700 bg-white">
                          {selectedContest.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleDetailsClick(contest)}
                  className="w-full bg-transparent border border-[#ed874a] text-[#ed874a] rounded-lg py-3 px-4 font-semibold text-sm flex items-center justify-center space-x-2 hover:bg-[#ed874a] hover:text-white transition-all"
                >
                  <Monitor className="w-4 h-4" />
                  <span>{selectedContest?.sl === contest.sl ? 'Hide Details' : 'View Details'}</span>
                </button>
              </div>
            </div>
          ))}

          {/* Empty State - Mobile */}
          {filteredContests.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No contests found matching your search.</p>
            </div>
          )}
        </div>

        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-medium text-gray-700">SL</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Name</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Period</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContests.map((contest, index) => (
                  <React.Fragment key={contest.sl}>
                    <tr
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="py-4 px-6 text-gray-700">{contest.sl}</td>
                      <td className="py-4 px-6 text-gray-700">{contest.name}</td>
                      <td className="py-4 px-6 text-gray-700">{contest.period}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-900 bg-white">
                          {contest.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleDetailsClick(contest)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-[#ed874a] text-[#ed874a] rounded-lg hover:bg-[#ed874a] hover:text-white transition-all"
                        >
                          <Monitor className="w-4 h-4" />
                          {selectedContest?.sl === contest.sl ? 'Hide Details' : 'Details'}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Contest Details Row - Shown below selected contest */}
                    {selectedContest?.sl === contest.sl && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div className="bg-gray-50 border-t border-gray-200 p-6 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                              <h2 className="text-lg font-semibold text-gray-900">Contest Details</h2>
                              <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                            
                            {/* Contest Title and Description */}
                            <div className="pb-4 border-b border-gray-200">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedContest.name}</h3>
                              <p className="text-gray-600 text-sm">{selectedContest.description}</p>
                            </div>

                            {/* Prize Information */}
                            <div className="border border-gray-200 rounded p-4 bg-white">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Trophy className="w-4 h-4 mr-2 text-gray-600" />
                                Prize Information
                              </h4>
                              <p className="text-gray-600 text-sm leading-relaxed mb-2">
                                Prize: {selectedContest.prize}
                              </p>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                This contest offers multiple prize tiers based on your sales performance. As you refer more affiliates, you&apos;ll unlock higher rewards.
                              </p>
                            </div>

                            {/* Contest Rules */}
                            <div className="border border-gray-200 rounded p-4 bg-white">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Gift className="w-4 h-4 mr-2 text-gray-600" />
                                Contest Rules
                              </h4>
                              <ul className="list-disc pl-4 space-y-1 text-gray-600 text-sm">
                                <li>Sales must be verified and legitimate to count toward the contest</li>
                                <li>Only new affiliate sign-ups during the contest period are eligible</li>
                                <li>Multiple entries from the same referred affiliate will not be counted</li>
                                <li>Prizes are awarded based on cumulative sales at the end of the contest period</li>
                                <li>DigiAfriq reserves the right to modify or cancel the contest at any time</li>
                                <li>Prize winners will be notified via email and must claim their prizes within 30 days</li>
                              </ul>
                            </div>

                            {/* Contest Period and Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="border border-gray-200 rounded p-4 bg-white">
                                <p className="text-gray-500 text-sm mb-1">Contest Period</p>
                                <p className="font-medium text-gray-900">{selectedContest.period}</p>
                              </div>
                              <div className="border border-gray-200 rounded p-4 bg-white">
                                <p className="text-gray-500 text-sm mb-1">Status</p>
                                <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium border border-gray-300 text-gray-700 bg-gray-50">
                                  {selectedContest.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State - Desktop */}
          {filteredContests.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">No contests found matching your search.</p>
            </div>
          )}
        </div>
      </div>

    </AffiliateDashboardLayout>
  )
}

export default RunningContestsPage
