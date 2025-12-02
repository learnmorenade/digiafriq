'use client';

import { useMembershipStatus } from '@/lib/hooks/useMembershipStatus';
import AffiliateDashboardLayout from '@/components/dashboard/AffiliateDashboardLayout';
import AffiliateRequiresLearnerMembership from '@/components/AffiliateRequiresLearnerMembership';
import { Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth';
import React, { useState, useEffect } from 'react';

interface AffiliateLayoutProps {
  children: React.ReactNode;
}

const AffiliateLayout: React.FC<AffiliateLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { hasLearnerMembership, hasAffiliateMembership, loading: membershipLoading } = useMembershipStatus();
  const [affiliatePackageId, setAffiliatePackageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch affiliate packages
  useEffect(() => {
    const fetchAffiliatePackages = async () => {
      try {
        const response = await fetch('/api/memberships?member_type=affiliate')
        if (response.ok) {
          const data = await response.json()
          // Use the first available affiliate package (like learner membership page does)
          const affiliatePackages = data.packages || []
          if (affiliatePackages.length > 0) {
            setAffiliatePackageId(affiliatePackages[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch affiliate packages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAffiliatePackages()
  }, [])

  const handleUpgradeClick = () => {
    if (affiliatePackageId) {
      // Go directly to checkout for the $7 package
      router.push(`/dashboard/learner/membership/checkout?membershipId=${affiliatePackageId}&upgrade=true`);
    } else {
      // Fallback to membership page if package not found
      router.push('/dashboard/learner/membership');
    }
  };

  // Show loading state within dashboard layout
  if (membershipLoading || loading) {
    return (
      <AffiliateDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#ed874a] mx-auto mb-4" />
            <p className="text-gray-600">Checking membership status...</p>
          </div>
        </div>
      </AffiliateDashboardLayout>
    );
  }

  // First check: User must have learner membership to access affiliate features
  if (!hasLearnerMembership) {
    return (
      <AffiliateDashboardLayout>
        <AffiliateRequiresLearnerMembership />
      </AffiliateDashboardLayout>
    );
  }

  // Second check: If user has learner membership but no affiliate membership, show upgrade prompt
  if (hasLearnerMembership && !hasAffiliateMembership) {
    return (
      <AffiliateDashboardLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-8 text-center">
              {/* Illustration */}
              <div className="mb-8 flex justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full flex items-center justify-center">
                  <Crown className="w-24 h-24 text-purple-600" />
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Upgrade to Affiliate
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                You have an active learner membership! Upgrade to affiliate for just $7 and start earning commissions on course sales.
              </p>

              {/* Price Display */}
              <div className="mb-8 p-6 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-sm text-purple-700 font-medium mb-2">💰 Special Upgrade Price</div>
                <div className="text-3xl font-bold text-purple-900 mb-1">$7</div>
                <div className="text-sm text-purple-600">One-time payment for lifetime access</div>
              </div>

              {/* Action Button */}
              <div className="max-w-md mx-auto">
                <Button
                  onClick={handleUpgradeClick}
                  className="w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Upgrade for $7
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-purple-100">
                <p className="text-sm text-gray-500">
                  Complete your upgrade to unlock your affiliate dashboard and start earning commissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AffiliateDashboardLayout>
    );
  }

  // Otherwise, render the requested page within dashboard layout (user has both memberships)
  return <AffiliateDashboardLayout>{children}</AffiliateDashboardLayout>;
}

export default AffiliateLayout;
