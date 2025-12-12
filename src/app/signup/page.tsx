"use client"
import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Eye, EyeOff, ArrowLeft, Check, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'
import { processReferral } from '@/lib/supabase/referrals'

interface PasswordRequirement {
  text: string
  met: boolean
}

function SignupPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const referralCode = searchParams.get('ref')
  const referralType = searchParams.get('type') as 'learner' | 'affiliate' | undefined
  const { signUp, updateProfile, addRole, switchRole } = useAuth()
  
  const [step, setStep] = useState<'details' | 'password'>('details')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'Ghana',
    countryCode: '+233',
    phoneNumber: '',
    accountType: 'learner' as 'learner' | 'affiliate'
  })

  // Country data with codes and flag images from CDN - All payment-supported countries
  const countries = [
    // West Africa
    { name: 'Ghana', code: '+233', flag: 'https://flagcdn.com/w20/gh.png', iso: 'GH' },
    { name: 'Nigeria', code: '+234', flag: 'https://flagcdn.com/w20/ng.png', iso: 'NG' },
    { name: 'Benin', code: '+229', flag: 'https://flagcdn.com/w20/bj.png', iso: 'BJ' },
    { name: 'Burkina Faso', code: '+226', flag: 'https://flagcdn.com/w20/bf.png', iso: 'BF' },
    { name: "Côte d'Ivoire", code: '+225', flag: 'https://flagcdn.com/w20/ci.png', iso: 'CI' },
    { name: 'Guinea-Bissau', code: '+245', flag: 'https://flagcdn.com/w20/gw.png', iso: 'GW' },
    { name: 'Mali', code: '+223', flag: 'https://flagcdn.com/w20/ml.png', iso: 'ML' },
    { name: 'Niger', code: '+227', flag: 'https://flagcdn.com/w20/ne.png', iso: 'NE' },
    { name: 'Senegal', code: '+221', flag: 'https://flagcdn.com/w20/sn.png', iso: 'SN' },
    { name: 'Togo', code: '+228', flag: 'https://flagcdn.com/w20/tg.png', iso: 'TG' },
    
    // Central Africa
    { name: 'Cameroon', code: '+237', flag: 'https://flagcdn.com/w20/cm.png', iso: 'CM' },
    { name: 'Central African Republic', code: '+236', flag: 'https://flagcdn.com/w20/cf.png', iso: 'CF' },
    { name: 'Chad', code: '+235', flag: 'https://flagcdn.com/w20/td.png', iso: 'TD' },
    { name: 'Republic of the Congo', code: '+242', flag: 'https://flagcdn.com/w20/cg.png', iso: 'CG' },
    { name: 'Congo', code: '+242', flag: 'https://flagcdn.com/w20/cd.png', iso: 'CD' },
    { name: 'Equatorial Guinea', code: '+240', flag: 'https://flagcdn.com/w20/gq.png', iso: 'GQ' },
    { name: 'Gabon', code: '+241', flag: 'https://flagcdn.com/w20/ga.png', iso: 'GA' },
    
    // East Africa
    { name: 'Kenya', code: '+254', flag: 'https://flagcdn.com/w20/ke.png', iso: 'KE' },
    { name: 'South Africa', code: '+27', flag: 'https://flagcdn.com/w20/za.png', iso: 'ZA' },
    
    // North America
    { name: 'United States', code: '+1', flag: 'https://flagcdn.com/w20/us.png', iso: 'US' },
  ]
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const countryDropdownRef = useRef<HTMLDivElement>(null)

  // Password validation requirements
  const getPasswordRequirements = (password: string): PasswordRequirement[] => [
    { text: 'Minimum 8 characters', met: password.length >= 8 },
    { text: 'At least 1 uppercase letter (A–Z)', met: /[A-Z]/.test(password) },
    { text: 'At least 1 lowercase letter (a–z)', met: /[a-z]/.test(password) },
    { text: 'At least 1 number (0–9)', met: /\d/.test(password) },
    { text: 'At least 1 symbol (! @ # $ % ^ & *)', met: /[!@#$%^&*]/.test(password) }
  ]

  const passwordRequirements = getPasswordRequirements(formData.password)
  const isPasswordValid = passwordRequirements.every(req => req.met)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ''

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'phoneNumber') {
      // Only allow digits and spaces, don't change country code
      let cleanValue = value.replace(/[^\d\s]/g, '')
      
      // Remove leading zero if present
      cleanValue = cleanValue.replace(/^0+/, '')
      
      setFormData(prev => ({
        ...prev,
        [name]: cleanValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    setError('')
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value
    const countryData = countries.find(c => c.name === selectedCountry)
    
    setFormData(prev => ({
      ...prev,
      country: selectedCountry,
      countryCode: countryData?.code || '+233',
      phoneNumber: '' // Reset phone number when country changes
    }))
    setError('')
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.country || !formData.phoneNumber) {
      setError('Please fill in all fields')
      return
    }
    
    // Validate phone number length
    if (formData.phoneNumber.replace(/\s/g, '').length < 6) {
      setError('Please enter a valid phone number')
      return
    }
    
    setError('')
    setStep('password')
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.password) {
      setError('Please enter a password')
      return
    }
    
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }
    
    setError('')
    // Directly submit the form since all users are learners
    await handleFinalSubmit()
  }

  const handleFinalSubmit = async () => {
    
    setLoading(true)
    setError('')
    
    try {
      console.log('🚀 Starting real Supabase signup process...')
      
      // Store additional user data for profile creation
      // Clean phone number by removing leading zeros before storage
      const cleanedPhoneNumber = formData.phoneNumber.replace(/^0+/, '')
      const fullPhoneNumber = formData.countryCode + ' ' + cleanedPhoneNumber
      localStorage.setItem('pendingUserData', JSON.stringify({
        country: formData.country,
        phoneNumber: fullPhoneNumber.trim(),
        countryCode: formData.countryCode
      }))
      
      // Store the role selection for profile creation
      localStorage.setItem('pendingRole', formData.accountType)
      
      // Step 1: Sign up with Supabase (no email confirmation required)
      const fullName = `${formData.firstName} ${formData.lastName}`
      const { error: signUpError } = await signUp(formData.email, formData.password, fullName)
      
      if (signUpError) {
        console.error('❌ Signup error:', signUpError)
        setError(`Signup failed: ${signUpError.message}`)
        return
      }
      
      console.log('✅ Supabase signup successful!')
      
      // Step 2: Wait for profile creation to complete
      // The auth state change listener will create the profile
      // We need to wait for it to be created before proceeding
      let profileCreated = false
      let attempts = 0
      const maxAttempts = 30 // 30 attempts × 200ms = 6 seconds
      
      while (!profileCreated && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Check if profile exists
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            console.error('❌ User not found')
            break
          }
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            console.log('✅ Profile created successfully')
            profileCreated = true
            break
          }
        } catch (e) {
          // Profile not found yet, continue waiting
        }
        
        attempts++
      }
      
      if (!profileCreated) {
        console.error('❌ Profile creation timeout')
        setError('Profile creation failed. Please try signing up again.')
        return
      }
      
      // Step 3: Add the selected role to available_roles
      console.log(`➕ Adding ${formData.accountType} to available roles...`)
      const addResult = await addRole(formData.accountType)
      if (addResult.error) {
        console.error('❌ Error adding role:', addResult.error)
        // Continue anyway, role might already exist
      }
      
      // Step 4: Process referral if applicable
      if (referralCode && referralType) {
        console.log(`🔗 Processing referral: ${referralCode} (${referralType})`)
        
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const referral = await processReferral(user.id, referralCode, referralType)
            if (referral) {
              console.log('✅ Referral processed successfully:', referral)
            } else {
              console.log('⚠️ Referral processing failed, but continuing signup')
            }
          }
        } catch (referralError) {
          console.error('❌ Error processing referral:', referralError)
          // Don't fail the signup if referral processing fails
        }
      }
      
      // Step 5: Switch to the selected role
      console.log(`🔄 Switching to ${formData.accountType} role...`)
      const switchResult = await switchRole(formData.accountType)
      if (switchResult.error) {
        console.error('❌ Error switching role:', switchResult.error)
        // Continue anyway, will redirect to dashboard
      }
      
      // Step 6: Redirect to learner dashboard
      setError('')
      const dashboardRoute = '/dashboard/learner'
      
      console.log(`🎉 Redirecting to dashboard: ${dashboardRoute}`)
      
      // Small delay to ensure auth state is fully updated before redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(dashboardRoute)
      
    } catch (err: any) {
      console.error('💥 Unexpected signup error:', err)
      setError(`An unexpected error occurred: ${err.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    // Placeholder for Google OAuth integration
    console.log('Google signup clicked')
  }

  const handleGoBack = () => {
    if (step === 'password') {
      setStep('details')
    }
    setError('')
  }

  const getStepProgress = () => {
    switch (step) {
      case 'details': return 50
      case 'password': return 100
      default: return 0
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#ed874a]/5 via-white to-[#d76f32]/5 px-4 py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="mb-4">
          <Image
            src="/digiafriqlogo.png"
            alt="Digiafriq logo"
            width={130}
            height={30}
            className="h-auto w-auto"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600 text-center max-w-md">
          Join Digiafriq to learn digital skills and earn affiliate income
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className={`flex items-center ${step === 'details' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'details' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 text-sm">Details</span>
          </div>
          <div className={`flex items-center ${step === 'password' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'password' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 text-sm">Password</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getStepProgress()}%` }}
          ></div>
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'details' && 'Personal Information'}
            {step === 'password' && 'Create Password'}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john.doe@example.com"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleCountryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {countries.map(country => (
                    <option key={country.name} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                    <span className="text-sm text-gray-600">{formData.countryCode}</span>
                  </div>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="123 456 7890"
                    className="flex-1 rounded-l-none"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                Continue to Password
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center text-xs">
                      {req.met ? (
                        <Check className="w-3 h-3 text-green-500 mr-2" />
                      ) : (
                        <X className="w-3 h-3 text-red-500 mr-2" />
                      )}
                      <span className={req.met ? 'text-green-600' : 'text-red-600'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="mt-1">
                    {passwordsMatch ? (
                      <div className="flex items-center text-xs text-green-600">
                        <Check className="w-3 h-3 mr-2" />
                        Passwords match
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-red-600">
                        <X className="w-3 h-3 mr-2" />
                        Passwords do not match
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoBack}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </form>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="w-full flex justify-center mt-8 mb-8">
        <Link 
          href="/legal-policies" 
          className="text-[#ed874a] underline text-sm hover:text-[#d76f32] transition"
        >
          Terms of Service and Privacy Policy
        </Link>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#ed874a]/5 via-white to-[#d76f32]/5">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#ed874a] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignupPageInner />
    </Suspense>
  )
}
