'use client';

import { useState } from 'react';
import { Check, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth';

export default function LearnerMembershipPage() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = (plan: 'learner' | 'bundle') => {
    if (!user) {
      alert('Please log in to continue');
      return;
    }

    // Redirect to checkout page with plan details
    window.location.href = `/dashboard/learner/membership/checkout?plan=${plan}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Upgrade your plan
          </h1>
          <p className="text-gray-600 text-lg">
            Choose the perfect plan for your learning journey
          </p>
        </div>


        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Learner Plan */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-[#ed874a] transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Learner</h2>
              <div className="flex items-center gap-2 bg-orange-50 text-[#ed874a] px-3 py-1 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Popular
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-500">$</span>
                <span className="text-5xl font-bold text-gray-900">10</span>
                <span className="text-gray-500">
                  USD / <br />year
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-2">Billed annually ($10/year)</p>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              Full year of unlimited learning access
            </p>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">Unlimited access to all courses</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">Premium video content and resources</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">Certificates of completion</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">Priority support</span>
              </li>
            </ul>

            {/* Button */}
            <button
              onClick={() => handleSelectPlan('learner')}
              disabled={loadingPlan !== null}
              className="w-full py-4 bg-white border-2 border-[#ed874a] text-[#ed874a] rounded-xl font-semibold hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPlan === 'learner' ? 'Processing...' : 'Get Learner'}
            </button>
          </div>

          {/* Bundle Plan (Learner + Affiliate) */}
          <div className="bg-gradient-to-br from-[#ed874a] to-orange-500 rounded-2xl border-2 border-[#ed874a] p-8 text-white hover:shadow-2xl transition-all relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Bundle</h2>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  Best Value
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm opacity-90">$</span>
                  <span className="text-5xl font-bold">10</span>
                  <span className="opacity-90">
                    /year
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-white/90 text-lg">+</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">$7</span>
                    <span className="text-white/80 text-sm">one-time</span>
                  </div>
                </div>
                <p className="text-white/80 text-sm mt-3">Annual learner access + one-time affiliate activation</p>
              </div>

              {/* Description */}
              <p className="mb-6 opacity-95">
                Full year of learning + lifetime affiliate access
              </p>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-medium">All Learner features ($10/year)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Lifetime affiliate access ($7 one-time)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Unique affiliate tracking links</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>100% commission on sales</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Marketing resources and support</span>
                </li>
              </ul>

              {/* Button */}
              <button
                onClick={() => handleSelectPlan('bundle')}
                disabled={loadingPlan !== null}
                className="w-full py-4 bg-white text-[#ed874a] rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loadingPlan === 'bundle' ? 'Processing...' : 'Get Bundle'}
              </button>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@digiafriq.com" className="text-[#ed874a] hover:underline font-medium">
              support@digiafriq.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
