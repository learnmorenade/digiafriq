'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMembershipStatus } from '@/lib/hooks/useMembershipStatus';
import LearnerDashboardLayout from '@/components/dashboard/LearnerDashboardLayout';
import { Loader2 } from 'lucide-react';

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasLearnerMembership, loading } = useMembershipStatus();

  // Membership and checkout pages should always be accessible
  const isMembershipPage = pathname === '/dashboard/learner/membership';
  const isCheckoutPage = pathname?.startsWith('/dashboard/learner/membership/checkout');
  const isPaymentRelatedPage = isMembershipPage || isCheckoutPage;

  useEffect(() => {
    // If user doesn't have learner membership and is not on payment-related pages, redirect to membership
    if (!loading && !hasLearnerMembership && !isPaymentRelatedPage) {
      router.push('/dashboard/learner/membership');
    }
  }, [hasLearnerMembership, loading, isPaymentRelatedPage, router]);

  // Show loading state within dashboard layout
  if (loading) {
    return (
      <LearnerDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#ed874a] mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </LearnerDashboardLayout>
    );
  }

  // If user doesn't have learner membership and tries to access non-payment pages, they'll be redirected by useEffect
  // But we still render payment-related pages or show loading during redirect
  if (!hasLearnerMembership && !isPaymentRelatedPage) {
    return (
      <LearnerDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#ed874a] mx-auto mb-4" />
            <p className="text-gray-600">Redirecting to membership...</p>
          </div>
        </div>
      </LearnerDashboardLayout>
    );
  }

  // Render checkout page without dashboard layout
  if (isCheckoutPage) {
    return <>{children}</>;
  }

  // Render other pages within dashboard layout
  return <LearnerDashboardLayout>{children}</LearnerDashboardLayout>;
}
