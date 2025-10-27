'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';

// Currency conversion rates
const CURRENCY_RATES = {
  USD: { rate: 1, symbol: '$', name: 'US Dollar' },
  GHS: { rate: 10, symbol: '₵', name: 'Ghanaian Cedi' },
  NGN: { rate: 1400, symbol: '₦', name: 'Nigerian Naira' },
};

type Currency = keyof typeof CURRENCY_RATES;
type PaymentGateway = 'paystack' | 'stripe' | 'flutterwave';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Get plan details from URL params
  const plan = searchParams.get('plan') as 'learner' | 'bundle' || 'learner';
  const baseAmount = plan === 'learner' ? 10 : 17;

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phoneNumber: '',
    country: '',
  });

  const [currency, setCurrency] = useState<Currency>('USD');
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>('paystack');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate converted amount
  const convertedAmount = baseAmount * CURRENCY_RATES[currency].rate;

  // Plan details
  const planDetails = {
    learner: {
      name: 'Learner Plan',
      features: [
        'Unlimited access to all courses',
        'Premium video content',
        'Certificates of completion',
        'Priority support',
      ],
    },
    bundle: {
      name: 'Bundle Plan',
      features: [
        'All Learner features ($10/year)',
        'Lifetime affiliate access ($7 one-time)',
        'Unique tracking links',
        '100% commission on sales',
      ],
    },
  };

  const currentPlan = planDetails[plan];

  // Auto-set country based on currency
  useEffect(() => {
    if (currency === 'GHS' && !formData.country) {
      setFormData(prev => ({ ...prev, country: 'Ghana' }));
    } else if (currency === 'NGN' && !formData.country) {
      setFormData(prev => ({ ...prev, country: 'Nigeria' }));
    }
  }, [currency]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubscribe = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please log in to continue');
        return;
      }

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          email: formData.email,
          amount: convertedAmount * 100, // Convert to smallest unit
          currency: currency,
          metadata: {
            user_id: user?.id,
            payment_type: plan === 'learner' ? 'learner_membership' : 'bundle_membership',
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
            country: formData.country,
            payment_gateway: paymentGateway,
            original_amount_usd: baseAmount,
          },
        },
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        alert(`Payment error: ${error.message || 'Unknown error'}`);
        throw error;
      }

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        console.error('No authorization URL in response:', data);
        throw new Error('Failed to initialize payment - no authorization URL');
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configure your plan</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed874a] focus:border-transparent"
              >
                <option value="USD">🇺🇸 USD - US Dollar</option>
                <option value="GHS">🇬🇭 GHS - Ghanaian Cedi</option>
                <option value="NGN">🇳🇬 NGN - Nigerian Naira</option>
              </select>
            </div>

            {/* Payment Gateway */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Gateway
              </label>
              <select
                value={paymentGateway}
                onChange={(e) => setPaymentGateway(e.target.value as PaymentGateway)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed874a] focus:border-transparent"
              >
                <option value="paystack">Paystack</option>
                <option value="stripe">Stripe</option>
                <option value="flutterwave">Flutterwave</option>
              </select>
            </div>

            {/* Billing Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing details</h2>
              
              {/* Full Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#ed874a] focus:border-transparent ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#ed874a] focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#ed874a] focus:border-transparent ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Country */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country or region
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Ghana"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#ed874a] focus:border-transparent ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Plan Summary */}
          <div>
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentPlan.name}</h2>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Top features</h3>
                <ul className="space-y-3">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#ed874a] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex justify-between text-gray-700 mb-2">
                  <span>Base price (USD)</span>
                  <span>${baseAmount}.00</span>
                </div>
                <div className="flex justify-between text-gray-700 mb-2">
                  <span>Currency</span>
                  <span>{CURRENCY_RATES[currency].name}</span>
                </div>
                <div className="flex justify-between text-gray-700 mb-4">
                  <span>Conversion rate</span>
                  <span>1 USD = {CURRENCY_RATES[currency].rate} {currency}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm mb-2">
                  <span>Tax (0%)</span>
                  <span>{CURRENCY_RATES[currency].symbol}0.00</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t-2 border-gray-300 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Due today</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {CURRENCY_RATES[currency].symbol}{convertedAmount.toLocaleString()}
                  </span>
                </div>
                {currency !== 'USD' && (
                  <p className="text-sm text-gray-500 mt-2 text-right">
                    (${baseAmount} USD)
                  </p>
                )}
              </div>

              {/* Subscribe Button */}
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Subscribe'}
              </button>

              {/* Info */}
              <p className="text-xs text-gray-500 text-center mt-4">
                {plan === 'learner' 
                  ? 'Annual subscription. Renews automatically.'
                  : 'Annual learner subscription + one-time affiliate fee.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
