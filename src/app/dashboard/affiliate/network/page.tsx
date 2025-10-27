'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AffiliateDashboardLayout from '@/components/dashboard/AffiliateDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth';

export default function AffiliateNetworkPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'info' | 'payment' | 'processing'>('info');

  // Affiliate activation fee
  const ACTIVATION_FEE = 50.00;

  const handleInitiatePayment = async () => {
    if (!user) {
      setError('Please log in to continue');
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentStep('payment');

    try {
      // Initialize Paystack payment
      const response = await fetch('/api/initialize-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          amount: ACTIVATION_FEE * 100, // Convert to kobo/cents
          metadata: {
            user_id: user.id,
            payment_type: 'affiliate_activation',
          },
        }),
      });

      const data = await response.json();

      if (data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError('Failed to initialize payment. Please try again.');
      setPaymentStep('info');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankDetails = () => {
    router.push('/dashboard/affiliate/settings');
  };

  return (
    <AffiliateDashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join the Affiliate Network
          </h1>
          <p className="text-gray-600">
            Complete your payment to unlock your affiliate dashboard and start earning commissions
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Payment Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Activation Fee Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#ed874a]" />
                Activation Fee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ${ACTIVATION_FEE.toFixed(2)}
                </div>
                <p className="text-gray-600 text-sm">One-time payment</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Access to affiliate marketplace
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Unique affiliate tracking links
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Real-time commission tracking
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Marketing resources and support
                  </span>
                </li>
              </ul>
              <Button
                onClick={handleInitiatePayment}
                disabled={loading || paymentStep !== 'info'}
                className="w-full bg-gradient-to-r from-purple-900 to-purple-800 hover:from-purple-800 hover:to-purple-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Bank Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#ed874a]" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-6">
                <p className="text-gray-600 mb-6">
                  Add your bank details to receive commission payouts directly to your account.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Secure and encrypted storage
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Fast payout processing
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Update anytime in settings
                    </span>
                  </li>
                </ul>
                <Button
                  onClick={handleAddBankDetails}
                  variant="outline"
                  className="w-full border-2"
                >
                  Add Bank Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-900">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Complete Payment
                </h3>
                <p className="text-sm text-gray-600">
                  Pay the one-time activation fee to unlock your affiliate account
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-900">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Get Your Links
                </h3>
                <p className="text-sm text-gray-600">
                  Receive unique tracking links to promote products and courses
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-900">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Start Earning
                </h3>
                <p className="text-sm text-gray-600">
                  Share your links and earn commissions on every sale
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@digiafriq.com" className="text-[#ed874a] hover:underline">
              support@digiafriq.com
            </a>
          </p>
        </div>
      </div>
    </AffiliateDashboardLayout>
  );
}
