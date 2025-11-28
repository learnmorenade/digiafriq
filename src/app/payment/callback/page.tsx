'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'error';

interface PaymentVerification {
  status: PaymentStatus;
  membershipType?: 'learner' | 'affiliate';
  membershipName?: string;
  amount?: number;
  currency?: string;
  reference?: string;
}

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [verification, setVerification] = useState<PaymentVerification>({
    status: 'verifying'
  });

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment reference from URL params
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');
        const paymentRef = reference || trxref;

        if (!paymentRef) {
          setVerification({ status: 'error' });
          toast.error('No payment reference found');
          return;
        }

        console.log('Verifying payment with reference:', paymentRef);

        // Verify payment with backend
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference: paymentRef,
            user_id: user?.id
          }),
        });

        const data = await response.json();
        console.log('Payment verification response:', data);

        if (data.success && data.payment) {
          // Payment successful - get membership details
          const { data: membershipData, error: membershipError } = await supabase
            .from('membership_packages')
            .select('name, member_type, price, currency')
            .eq('id', data.payment.membership_package_id)
            .single();

          if (membershipError) {
            console.error('Error fetching membership details:', membershipError);
          }

          setVerification({
            status: 'success',
            membershipType: membershipData?.member_type || 'learner',
            membershipName: membershipData?.name || 'Membership',
            amount: data.payment.amount,
            currency: data.payment.currency,
            reference: paymentRef
          });

          // Show success toast
          toast.success('Payment verified successfully!');

          // Redirect after 3 seconds
          setTimeout(() => {
            redirectToAppropriateDashboard(membershipData?.member_type || 'learner');
          }, 3000);

        } else {
          setVerification({ status: 'failed' });
          toast.error(data.message || 'Payment verification failed');
        }

      } catch (error) {
        console.error('Payment verification error:', error);
        setVerification({ status: 'error' });
        toast.error('Failed to verify payment');
      }
    };

    if (user) {
      verifyPayment();
    }
  }, [user, searchParams]);

  const redirectToAppropriateDashboard = (membershipType: 'learner' | 'affiliate') => {
    if (membershipType === 'affiliate') {
      router.push('/dashboard/affiliate');
    } else {
      router.push('/dashboard/learner');
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/dashboard/learner/membership');
  };

  const renderVerificationContent = () => {
    switch (verification.status) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verifying Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">
                {verification.membershipName} Activated
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Type:</strong> {verification.membershipType?.charAt(0).toUpperCase()}{verification.membershipType?.slice(1)} Membership</p>
                <p><strong>Amount:</strong> {verification.currency} {verification.amount}</p>
                <p><strong>Reference:</strong> {verification.reference}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Redirecting you to your {verification.membershipType} dashboard...
            </p>
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't verify your payment. This might be due to a cancelled transaction or payment processing issue.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Verification
              </button>
              <button
                onClick={handleGoHome}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Memberships
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Error
            </h2>
            <p className="text-gray-600 mb-6">
              An error occurred while verifying your payment. Please contact support if this persists.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleGoHome}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Memberships
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderVerificationContent()}
        </div>
        
        {/* Support Info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help? Contact{' '}
            <a href="mailto:support@digiafriq.com" className="text-blue-600 hover:underline">
              support@digiafriq.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
