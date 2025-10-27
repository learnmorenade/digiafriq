'use client';

import { useAffiliatePaymentStatus } from '@/lib/hooks/useAffiliatePaymentStatus';
import { useLearnerPaymentStatus } from '@/lib/hooks/useLearnerPaymentStatus';
import AffiliateDashboardLayout from '@/components/dashboard/AffiliateDashboardLayout';
import AffiliateRequiresLearnerMembership from '@/components/AffiliateRequiresLearnerMembership';
import { Loader2 } from 'lucide-react';

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasPaid: affiliateHasPaid, loading: affiliateLoading } = useAffiliatePaymentStatus();
  const { hasPaid: learnerHasPaid, loading: learnerLoading } = useLearnerPaymentStatus();

  // Show loading state within dashboard layout
  if (affiliateLoading || learnerLoading) {
    return (
      <AffiliateDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#ed874a] mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AffiliateDashboardLayout>
    );
  }

  // First check: User must have learner membership to access affiliate features
  if (!learnerHasPaid) {
    return (
      <AffiliateDashboardLayout>
        <AffiliateRequiresLearnerMembership />
      </AffiliateDashboardLayout>
    );
  }

  // Second check: If user has learner membership but hasn't paid affiliate fee, show affiliate payment page
  if (!affiliateHasPaid) {
    return (
      <AffiliateDashboardLayout>
        <div className="p-6">
          {/* Pending Payment Content */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8 text-center">
              {/* Illustration */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  {/* Phone illustration with money symbols */}
                  <div className="w-48 h-48 bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100 rounded-full flex items-center justify-center relative">
                    <div className="w-32 h-40 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-[#ed874a] relative">
                      <div className="text-4xl">📱</div>
                      {/* Money symbols floating around */}
                      <div className="absolute -top-4 -right-4 text-2xl animate-bounce">💰</div>
                      <div className="absolute -bottom-2 -left-4 text-xl animate-pulse">💵</div>
                      <div className="absolute top-0 -left-6 text-lg animate-bounce delay-100">❤️</div>
                      <div className="absolute -top-2 right-8 text-xl animate-pulse delay-200">💸</div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#ed874a] rounded-full opacity-20"></div>
                    <div className="absolute bottom-4 right-0 w-20 h-20 bg-orange-400 rounded-full opacity-30"></div>
                  </div>
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                You don&apos;t have an affiliate link yet
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                Discover the world of affiliate marketing and find a variety of digital products to promote and earn money or give a creator your email to become their affiliate.
              </p>

              {/* Action Buttons */}
              <div className="space-y-4 max-w-md mx-auto">
                {/* Access Marketplace Button */}
                <button
                  onClick={() => window.location.href = '/dashboard/affiliate/network'}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#ed874a] to-orange-500 text-white rounded-lg hover:from-orange-600 hover:to-orange-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Complete Payment to Get Started
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-orange-100">
                <p className="text-sm text-gray-500">
                  Complete your payment to unlock your affiliate dashboard and start earning commissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AffiliateDashboardLayout>
    );
  }

  // Otherwise, render the requested page within dashboard layout (user has paid and has affiliate access)
  return <AffiliateDashboardLayout>{children}</AffiliateDashboardLayout>;
}
