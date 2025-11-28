"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Eye, EyeOff, ArrowLeft, Check, X, Users, GraduationCap, Mail, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'

interface PasswordRequirement {
  text: string
  met: boolean
}

const SignupPage = () => {
  const [step, setStep] = useState<'details' | 'password' | 'account-type'>('details')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'Ghana',
    countryCode: '+233',
    phoneNumber: '',
    accountType: '' as 'learner' | 'affiliate' | ''
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

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const { signUp, updateProfile, addRole, switchRole } = useAuth()

  // Password validation requirements
  const getPasswordRequirements = (password: string): PasswordRequirement[] => [
    { text: 'Must contain 8 characters', met: password.length >= 8 },
    { text: 'Must contain a letter', met: /[a-zA-Z]/.test(password) },
    { text: 'Must contain a number', met: /\d/.test(password) }
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.password) {
      setError('Please enter a password')
      return
    }
    
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements')
      return
    }
    
    setError('')
    setStep('account-type')
  }

  const handleAccountTypeSelect = (type: 'learner' | 'affiliate') => {
    setFormData(prev => ({ ...prev, accountType: type }))
  }

  const handleFinalSubmit = async () => {
    if (!formData.accountType) {
      setError('Please select an account type')
      return
    }
    
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
      
      // Step 4: Switch to the selected role
      console.log(`🔄 Switching to ${formData.accountType} role...`)
      const switchResult = await switchRole(formData.accountType)
      if (switchResult.error) {
        console.error('❌ Error switching role:', switchResult.error)
        // Continue anyway, will redirect to dashboard
      }
      
      // Step 5: Redirect to appropriate dashboard based on role
      setError('')
      const dashboardRoute = formData.accountType === 'affiliate' 
        ? '/dashboard/affiliate' 
        : '/dashboard/learner/membership'
      
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
    } else if (step === 'account-type') {
      setStep('password')
    }
    setError('')
  }

  const getStepProgress = () => {
    switch (step) {
      case 'details': return 33
      case 'password': return 66
      case 'account-type': return 100
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
        <h1 className="text-3xl font-bold text-[#4A0D66] mb-2 text-center">
          {step === 'details' ? 'Sign up' : step === 'password' ? 'Sign up' : 'Choose your path'}
        </h1>
      </div>


      <Card className={`w-full ${step === 'account-type' ? 'max-w-4xl' : 'max-w-md'} mx-auto rounded-2xl shadow-2xl border-0 bg-white`}>
        <CardHeader className="pb-2" />
        <CardContent className="flex flex-col gap-6 pt-2">
          {step === 'details' ? (
            <form className="flex flex-col gap-4" onSubmit={handleDetailsSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="font-semibold text-[#4A0D66] text-left">
                    First name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Your first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="bg-[#ed874a]/5 border-[#ed874a]/20 text-gray-900 focus:ring-[#ed874a] focus:border-[#ed874a]"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="font-semibold text-[#4A0D66] text-left">
                    Last name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Your last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="bg-[#ed874a]/5 border-[#ed874a]/20 text-gray-900 focus:ring-[#ed874a] focus:border-[#ed874a]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="font-semibold text-[#4A0D66] text-left">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-[#ed874a]/5 border-[#ed874a]/20 text-gray-900 focus:ring-[#ed874a] focus:border-[#ed874a]"
                />
              </div>

              <div>
                <label htmlFor="country" className="font-semibold text-[#4A0D66] text-left">
                  Country
                </label>
                <div className="relative" ref={countryDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full p-2 bg-[#ed874a]/5 border border-[#ed874a]/20 text-gray-900 focus:ring-[#ed874a] focus:border-[#ed874a] rounded-md flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {formData.country ? (
                        <>
                          <img 
                            src={countries.find(c => c.name === formData.country)?.flag} 
                            alt={formData.country}
                            className="w-5 h-4 object-cover rounded-sm"
                          />
                          <span>{formData.country} ({countries.find(c => c.name === formData.country)?.code})</span>
                        </>
                      ) : (
                        <span className="text-gray-500">Select your country</span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#ed874a]/20 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {countries.map((country) => (
                        <button
                          key={country.name}
                          type="button"
                          onClick={() => {
                            handleCountryChange({ target: { value: country.name } } as any)
                            setShowCountryDropdown(false)
                          }}
                          className="w-full p-2 text-left hover:bg-[#ed874a]/5 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                        >
                          <img 
                            src={country.flag} 
                            alt={country.name}
                            className="w-5 h-4 object-cover rounded-sm"
                          />
                          <span>{country.name} ({country.code})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="font-semibold text-[#4A0D66] text-left">
                  Phone number
                </label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-[#ed874a]/10 border border-r-0 border-[#ed874a]/20 rounded-l-md text-[#4A0D66]">
                    <span className="text-sm font-medium min-w-[60px] text-center">
                      {formData.countryCode}
                    </span>
                  </div>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Your phone number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="flex-1 bg-[#ed874a]/5 border-[#ed874a]/20 text-gray-900 focus:ring-[#ed874a] focus:border-[#ed874a] rounded-l-none border-l-0"
                  />
                </div>
              </div>


              <Button
                type="submit"
                className="w-full bg-[#ed874a] hover:bg-[#d76f32] text-white text-lg py-3 mt-2 font-semibold rounded-xl"
              >
                Continue
              </Button>

              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-[#ed874a]/20" />
                <span className="text-[#ed874a]/60 text-sm">OR</span>
                <div className="flex-1 h-px bg-[#ed874a]/20" />
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-2 bg-white border-[#ed874a]/20 text-[#4A0D66] hover:bg-[#ed874a]/5 rounded-xl text-base font-semibold"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" /> 
                Continue with Google
              </Button>

              <div className="text-center text-[#4A0D66] text-sm mt-4 mb-2">
                Already have an account?{' '}
                <Link 
                  href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'} 
                  className="underline text-[#ed874a] font-semibold hover:text-[#d76f32]"
                >
                  Sign in
                </Link>
              </div>

              {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}

              <div className="text-center text-xs text-gray-500 mt-4">
                By signing up, you agree to our{' '}
                <Link href="/legal-policies" className="text-[#ed874a] hover:underline">
                  privacy policy
                </Link>{' '}
                and{' '}
                <Link href="/legal-policies" className="text-[#ed874a] hover:underline">
                  terms & conditions
                </Link>
              </div>
            </form>
          ) : step === 'password' ? (
            <form className="flex flex-col gap-4" onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className="font-semibold text-[#4A0D66] text-left block mb-2">
                  Email
                </label>
                <div className="text-[#4A0D66]/70 text-base">{formData.email}</div>
              </div>

              <div>
                <label htmlFor="password" className="font-semibold text-[#4A0D66] text-left">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="bg-[#ed874a]/5 border-[#ed874a]/20 text-gray-900 focus:ring-[#ed874a] focus:border-[#ed874a] pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ed874a]/70 hover:text-[#ed874a]"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        {req.met ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className={req.met ? 'text-green-600' : 'text-red-600'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>


              <Button
                type="submit"
                className="w-full bg-[#ed874a] hover:bg-[#d76f32] text-white text-lg py-3 mt-2 font-semibold rounded-xl"
                disabled={!isPasswordValid}
              >
                Continue
              </Button>

              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-[#ed874a]/20" />
                <span className="text-[#ed874a]/60 text-sm">OR</span>
                <div className="flex-1 h-px bg-[#ed874a]/20" />
              </div>

              <Button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-white border-[#ed874a]/20 text-[#4A0D66] hover:bg-[#ed874a]/5 rounded-xl text-base font-semibold"
              >
                <Mail className="w-5 h-5 mr-2" /> Continue with email code
              </Button>

              <div className="w-full flex justify-center mt-4">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="flex items-center gap-1 text-[#ed874a] hover:underline text-base"
                >
                  <ArrowLeft className="w-4 h-4" /> Go back
                </button>
              </div>

              {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
            </form>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="text-center mb-2">
                <h2 className="text-2xl font-semibold text-[#4A0D66] mb-1">
                  How do you plan to use DigiAfriq today?
                </h2>
                <p className="text-[#ed874a]">
                  Don&apos;t worry, you can switch between profiles anytime.
                </p>
              </div>

              {/* Options grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 max-w-4xl mx-auto">
                {/* Learner Card */}
                <button
                  type="button"
                  onClick={() => handleAccountTypeSelect('learner')}
                  className={`relative group w-full text-left rounded-2xl border transition-all duration-200 p-8 bg-white shadow-sm ${
                    formData.accountType === 'learner'
                      ? 'border-[#ed874a] ring-2 ring-[#ed874a]/20'
                      : 'border-[#ed874a]/20 hover:border-[#ed874a]/40 hover:shadow-md'
                  }`}
                >
                  {/* Radio indicator */}
                  <span className={`absolute top-6 right-6 h-6 w-6 rounded-full border-2 ${
                    formData.accountType === 'learner' ? 'border-[#ed874a] bg-[#ed874a]' : 'border-gray-300 bg-white'
                  }`} />

                  <div className="flex flex-col items-center text-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-[#ed874a]/10 text-[#ed874a]`}>
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[#4A0D66] text-lg leading-relaxed">
                        I&apos;m a <span className="font-semibold">learner</span>, I want access to digital skills courses.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Affiliate Card */}
                <button
                  type="button"
                  onClick={() => handleAccountTypeSelect('affiliate')}
                  className={`relative group w-full text-left rounded-2xl border transition-all duration-200 p-8 bg-white shadow-sm ${
                    formData.accountType === 'affiliate'
                      ? 'border-[#ed874a] ring-2 ring-[#ed874a]/20'
                      : 'border-[#ed874a]/20 hover:border-[#ed874a]/40 hover:shadow-md'
                  }`}
                >
                  {/* Radio indicator */}
                  <span className={`absolute top-6 right-6 h-6 w-6 rounded-full border-2 ${
                    formData.accountType === 'affiliate' ? 'border-[#ed874a] bg-[#ed874a]' : 'border-gray-300 bg-white'
                  }`} />

                  <div className="flex flex-col items-center text-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-[#ed874a]/10 text-[#ed874a]`}>
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[#4A0D66] text-lg leading-relaxed">
                        I&apos;m an <span className="font-semibold">affiliate</span>, I want to earn income by promoting courses.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
              {/* Dynamic CTA */}
              <Button
                onClick={handleFinalSubmit}
                disabled={!formData.accountType || loading}
                className={`${
                  !formData.accountType || loading
                    ? 'w-full bg-gray-300 text-white text-lg py-3 mt-2 font-semibold rounded-xl cursor-not-allowed'
                    : 'w-full bg-[#ed874a] hover:bg-[#d76f32] text-white text-lg py-3 mt-2 font-semibold rounded-xl'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  formData.accountType
                    ? `Continue as a ${formData.accountType === 'learner' ? 'learner' : 'affiliate'}`
                    : 'Choose a profile'
                )}
              </Button>

              <div className="w-full flex justify-center mt-2">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="flex items-center gap-1 text-[#ed874a] hover:underline text-base"
                >
                  <ArrowLeft className="w-4 h-4" /> Go back
                </button>
              </div>

              {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
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

export default SignupPage
