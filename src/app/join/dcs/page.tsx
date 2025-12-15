'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Check, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  Star,
  Loader2,
  Zap,
  Target,
  Wallet,
  Gift,
  BookOpen,
  GraduationCap
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface MembershipPackage {
  id: string
  name: string
  price: number
  currency: string
  duration_months: number
  features: string[]
  is_active: boolean
  has_digital_cashflow?: boolean
  digital_cashflow_price?: number
}

export default function DCSSalesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const referralCode = searchParams.get('ref')
  
  const [membership, setMembership] = useState<MembershipPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [referrerName, setReferrerName] = useState<string | null>(null)

  // DCS addon price is fetched from database

  useEffect(() => {
    // Store referral code in localStorage for tracking
    if (referralCode) {
      localStorage.setItem('referral_code', referralCode)
      localStorage.setItem('referral_type', 'affiliate')
      
      // Track affiliate link click
      trackAffiliateClick(referralCode, 'dcs')
    }
    fetchReferrerInfo(referralCode)
    fetchLearnerMembership()
  }, [referralCode])

  const trackAffiliateClick = async (code: string, linkType: string) => {
    try {
      await fetch('/api/affiliate/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_code: code, link_type: linkType })
      })
      console.log('📊 Affiliate click tracked')
    } catch (error) {
      console.error('Failed to track affiliate click:', error)
    }
  }

  const fetchReferrerInfo = async (code: string | null) => {
    if (!code) return
    try {
      // Get referrer info from affiliate_profiles
      const { data: affiliateProfile } = await supabase
        .from('affiliate_profiles')
        .select('id')
        .eq('referral_code', code)
        .single()

      if (affiliateProfile) {
        // Get the referrer's name from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', affiliateProfile.id)
          .single()

        if (profile?.full_name) {
          setReferrerName(profile.full_name.split(' ')[0]) // First name only
        }
      }
    } catch (error) {
      console.log('Could not fetch referrer info')
    }
  }

  const fetchLearnerMembership = async () => {
    try {
      // Fetch active learner membership package (DCS is an addon to learner membership)
      const { data, error } = await supabase
        .from('membership_packages')
        .select('*')
        .eq('member_type', 'learner')
        .eq('is_active', true)
        .order('price', { ascending: true })
        .limit(1)
        .single()

      if (data) {
        setMembership(data)
      }
    } catch (error) {
      console.error('Error fetching membership:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetStarted = () => {
    if (membership) {
      const checkoutUrl = `/checkout/guest/${membership.id}?type=dcs&addon=digital-cashflow${referralCode ? `&ref=${referralCode}` : ''}`
      router.push(checkoutUrl)
    }
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      GHS: '₵',
      NGN: '₦',
    }
    return symbols[currency] || currency
  }

  // Get DCS addon price from database
  const dcsAddonPrice = membership?.digital_cashflow_price || 0
  const totalPrice = membership ? membership.price + dcsAddonPrice : 0

  const earningBenefits = [
    {
      icon: DollarSign,
      title: '80% Commission',
      description: 'Earn 80% commission on every learner you refer to DigiAfriq'
    },
    {
      icon: TrendingUp,
      title: '20% Recurring',
      description: 'Get 20% on all renewals from your referrals - passive income!'
    },
    {
      icon: Gift,
      title: '$2 Affiliate Bonus',
      description: 'Earn an extra $2 for every affiliate you bring to the platform'
    },
    {
      icon: Wallet,
      title: 'Easy Withdrawals',
      description: 'Withdraw your earnings directly to your bank or mobile money'
    }
  ]

  const learningBenefits = [
    {
      icon: BookOpen,
      title: 'All Premium Courses',
      description: 'Full access to our entire course library on digital skills'
    },
    {
      icon: GraduationCap,
      title: 'Certificates',
      description: 'Earn recognized certificates upon course completion'
    },
    {
      icon: Users,
      title: 'Community Access',
      description: 'Join our exclusive community of learners and earners'
    },
    {
      icon: Target,
      title: 'Affiliate Dashboard',
      description: 'Track your referrals, commissions, and earnings in real-time'
    }
  ]

  const testimonials = [
    {
      name: 'Emmanuel K.',
      role: 'Affiliate Partner',
      content: 'I made my first $500 within the first month! The DCS system is a game-changer for anyone looking to earn online.',
      rating: 5,
      earnings: '$2,500+'
    },
    {
      name: 'Fatima B.',
      role: 'Top Earner',
      content: 'The 80% commission is unreal. I share my link on social media and the money keeps coming in.',
      rating: 5,
      earnings: '$5,000+'
    },
    {
      name: 'Samuel O.',
      role: 'Affiliate Partner',
      content: 'Best decision I ever made. Learning AND earning at the same time. The recurring commissions are amazing!',
      rating: 5,
      earnings: '$1,800+'
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'Join Today',
      description: 'Sign up with the Digital Cashflow System addon'
    },
    {
      number: '2',
      title: 'Get Your Links',
      description: 'Access your unique referral links from your dashboard'
    },
    {
      number: '3',
      title: 'Share & Earn',
      description: 'Share your links and earn 80% on every sale'
    },
    {
      number: '4',
      title: 'Withdraw',
      description: 'Cash out your earnings to your bank or mobile money'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="py-4 px-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image
              src="/digiafriqlogo.png"
              alt="DigiAfriq"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <Button 
            onClick={handleGetStarted}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Start Earning
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container max-w-6xl mx-auto text-center">
          {referrerName && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>{referrerName} invited you to start earning!</span>
            </div>
          )}

          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>Digital Cashflow System - Learn & Earn</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Learn Digital Skills <span className="text-green-600">& Earn 80%</span> Commission
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get full access to all courses PLUS unlock the affiliate program. 
            Earn 80% commission on every referral and 20% on renewals!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Start Earning for {membership ? `${getCurrencySymbol(membership.currency)}${totalPrice}` : 'Loading...'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Secure Payment via Paystack</span>
            </div>
          </div>

          {/* Earning Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-700">
            <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-semibold">80% Commission</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">20% Recurring</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
              <Gift className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">$2 Affiliate Bonus</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Start earning in 4 simple steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-green-200" />
                )}
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earning Benefits */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
            Your Earning Potential
          </h2>
          <p className="text-green-100 text-center max-w-2xl mx-auto mb-12">
            Multiple ways to earn with the Digital Cashflow System
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {earningBenefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/10 backdrop-blur-sm">
                <CardContent className="p-6 text-center text-white">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-green-100 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Benefits */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Plus Full Learning Access
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Everything from the Learner membership, plus affiliate features
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningBenefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      {membership && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container max-w-4xl mx-auto">
            <Card className="border-2 border-green-600 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white text-center">
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Zap className="w-4 h-4" />
                  <span>Best Value</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Learner + Digital Cashflow System</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold">{getCurrencySymbol(membership.currency)}{totalPrice}</span>
                  <span className="text-green-100">/ {membership.duration_months} months</span>
                </div>
                <p className="text-green-100 mt-2 text-sm">
                  {getCurrencySymbol(membership.currency)}{membership.price} membership + {getCurrencySymbol(membership.currency)}{dcsAddonPrice} DCS addon
                </p>
              </div>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#ed874a]" />
                      Learning Features
                    </h4>
                    <ul className="space-y-3">
                      {membership.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Earning Features
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">80% commission on referrals</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">20% recurring on renewals</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">$2 bonus per affiliate referral</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Affiliate dashboard access</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold rounded-xl"
                >
                  Start Learning & Earning Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Real people earning real money with the Digital Cashflow System
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {testimonial.earnings}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join DigiAfriq with the Digital Cashflow System and start earning today
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-lg"
          >
            Get Started for {membership ? `${getCurrencySymbol(membership.currency)}${totalPrice}` : 'Loading...'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <div className="flex items-center justify-center gap-4 mt-6 text-green-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Start Earning Today</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="container max-w-6xl mx-auto text-center">
          <Image
            src="/digiafriqlogo.png"
            alt="DigiAfriq"
            width={100}
            height={33}
            className="mx-auto mb-4 brightness-0 invert"
          />
          <p className="text-sm">
            © {new Date().getFullYear()} DigiAfriq. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
