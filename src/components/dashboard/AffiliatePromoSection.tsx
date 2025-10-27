"use client"
import React from 'react'
import { 
  TrendingUp, 
  ArrowRight,
  DollarSign
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const AffiliatePromoSection = () => {
  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 mb-8 shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#ed874a]" />
              <span className="bg-[#ed874a] text-white text-xs font-semibold px-2 py-1 rounded-full">
                100% PROFIT
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900">
              Start Earning <span className="text-[#ed874a]">100% Profit</span>
            </h3>
            
            <p className="text-sm text-gray-700 max-w-md">
              Your referrer earns <strong>100% profit</strong> from you. Join our affiliate program and earn the same from your referrals.
            </p>
          </div>
          
          {/* Right Content - CTA */}
          <div className="flex-shrink-0">
            <Link href="/dashboard/learner/affiliate-upgrade">
              <Button 
                className="bg-[#ed874a] hover:bg-[#d76f32] text-white px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Earning Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AffiliatePromoSection
