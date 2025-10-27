"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'

const LoginPage = () => {
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const { signIn, user, profile, updateProfile, signOut } = useAuth()
  const [hasJustLoggedIn, setHasJustLoggedIn] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      // Double-check with Supabase directly to ensure session is valid
      const { data: { session } } = await supabase.auth.getSession()
      
      console.log('🔍 Login page session check:', {
        hasUser: !!user,
        hasProfile: !!profile,
        hasSupabaseSession: !!session,
        hasJustLoggedIn
      })
      
      // Only redirect if we have a valid session from Supabase AND user/profile in context
      if (session && user && profile && !hasJustLoggedIn) {
        // User already has an active session, redirect to role selection
        console.log('👤 Valid active session detected, redirecting to role selection...')
        router.push('/choose-role')
      } else {
        console.log('✅ No active session, showing login form')
        setIsCheckingSession(false)
      }
    }
    
    // Add a longer delay to ensure logout has completed
    const timer = setTimeout(checkSession, 800)
    return () => clearTimeout(timer)
  }, [user, profile, router, hasJustLoggedIn])

  // Handle redirect to role selection page after successful login
  useEffect(() => {
    const handlePostLogin = async () => {
      // Only redirect if user just logged in, not if they already have a session
      if (user && profile && hasJustLoggedIn) {
        console.log('✅ Login successful, redirecting to role selection page...')
        
        // Always redirect to role selection page (no matter if they have active_role or not)
        if (redirectParam) {
          router.push(redirectParam)
        } else {
          router.push('/choose-role')
        }
      }
    }
    
    handlePostLogin()
  }, [user, profile, router, redirectParam, hasJustLoggedIn])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setError('')
    setStep('password')
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setError('Please enter your password')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      console.log('🚀 Starting real Supabase login process...')
      
      const { error: signInError } = await signIn(email, password)
      
      if (signInError) {
        console.error('❌ Login error:', signInError)
        setError(`Login failed: ${signInError.message}`)
        return
      }
      
      console.log('✅ Supabase login successful!')
      // Set flag to trigger redirect in useEffect
      setHasJustLoggedIn(true)
      
    } catch (err: any) {
      console.error('💥 Unexpected login error:', err)
      setError(`An unexpected error occurred: ${err.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) {
      setResetError('Please enter your email address')
      return
    }
    
    setResetLoading(true)
    setResetError('')
    
    // Simulate password reset API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResetSuccess(true)
      setTimeout(() => {
        setShowReset(false)
        setResetEmail('')
        setResetSuccess(false)
      }, 3000)
    } catch (err) {
      setResetError('Failed to send reset email. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  const handleGoBack = () => {
    setStep('email')
    setPassword('')
    setError('')
  }

  const handleGoogleLogin = () => {
    // Placeholder for Google OAuth integration
    console.log('Google login clicked')
  }

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#ed874a]/10 via-white to-[#d76f32]/10 px-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#ed874a]" />
        <p className="mt-4 text-gray-600">Checking session...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#ed874a]/10 via-white to-[#d76f32]/10 px-4">
      <div className="flex flex-col items-center mb-6 mt-8">
        <div className="mb-4">
          <Image 
            src="/digiafriqlogo.png" 
            alt="DigiAfriq logo" 
            width={130} 
            height={30} 
            className="h-auto w-auto" 
          />
        </div>
        <h1 className="text-3xl font-bold text-[#ed874a] mb-2">Sign in</h1>
      </div>

      <Card className="w-full max-w-md mx-auto rounded-2xl shadow-2xl border-0 bg-white">
        <CardHeader className="pb-2" />
        <CardContent className="flex flex-col gap-6 pt-2">
          {showReset ? (
            <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
              <label htmlFor="resetEmail" className="font-semibold text-[#ed874a] text-left">
                Enter your email to reset password
              </label>
              <Input
                id="resetEmail"
                name="resetEmail"
                type="email"
                placeholder="Your email address"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
                className="bg-[#ed874a]/5 border-[#ed874a]/20 text-gray-900 focus:ring-[#ed874a] focus:border-[#ed874a]"
              />
              <Button
                className="w-full bg-gradient-to-r from-[#ed874a] to-[#d76f32] hover:from-[#d76f32] hover:to-[#ed874a] text-white text-lg py-3 mt-2 font-semibold rounded-xl"
                type="submit"
                disabled={resetLoading}
              >
                {resetLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
              </Button>
              {resetError && <div className="text-red-600 text-sm text-center mt-2">{resetError}</div>}
              {resetSuccess && (
                <div className="text-green-600 text-sm text-center mt-2">
                  Reset email sent! Check your inbox for instructions.
                </div>
              )}
              <div className="w-full flex justify-center mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowReset(false)} 
                  className="flex items-center gap-1 text-[#ed874a] hover:underline text-base"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </button>
              </div>
            </form>
          ) : step === 'email' ? (
            <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
              <label htmlFor="email" className="font-semibold text-[#ed874a] text-left">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="bg-[#ed874a]/5 border-[#ed874a]/20 text-gray-900 focus:ring-[#ed874a] focus:border-[#ed874a]"
              />
              <Button
                className="w-full bg-gradient-to-r from-[#ed874a] to-[#d76f32] hover:from-[#d76f32] hover:to-[#ed874a] text-white text-lg py-3 mt-2 font-semibold rounded-xl"
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
              </Button>
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-[#ed874a]/20" />
                <span className="text-[#ed874a]/60 text-sm">OR</span>
                <div className="flex-1 h-px bg-[#ed874a]/20" />
              </div>
              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white border-[#ed874a]/20 text-[#ed874a] hover:bg-[#ed874a]/5 rounded-xl text-base font-semibold"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" /> 
                Continue with Google
              </Button>
              {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
              <div className="text-center text-[#ed874a] text-sm mt-4 mb-2">
                Don&apos;t have an account?{' '}
                <Link 
                  href={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : '/signup'} 
                  className="underline text-[#d76f32] font-semibold hover:text-[#ed874a]"
                >
                  Sign up
                </Link>
              </div>
            </form>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handlePasswordSubmit}>
              <label className="font-semibold text-[#ed874a] text-left">Email</label>
              <div className="text-[#ed874a]/70 text-base mb-2">{email}</div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="font-semibold text-[#ed874a]">Password</label>
                <button 
                  type="button" 
                  className="text-[#ed874a]/70 text-sm hover:underline bg-transparent border-none p-0" 
                  onClick={() => setShowReset(true)}
                >
                  Forgot your password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="bg-[#ed874a]/5 border-[#ed874a]/20 text-gray-900 focus:ring-[#ed874a] focus:border-[#ed874a] pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ed874a]/70 hover:text-[#ed874a]"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-[#ed874a] to-[#d76f32] hover:from-[#d76f32] hover:to-[#ed874a] text-white text-lg py-3 mt-2 font-semibold rounded-xl"
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
              </Button>
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-[#ed874a]/20" />
                <span className="text-[#ed874a]/60 text-sm">OR</span>
                <div className="flex-1 h-px bg-[#ed874a]/20" />
              </div>
              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white border-[#ed874a]/20 text-[#ed874a] hover:bg-[#ed874a]/5 rounded-xl text-base font-semibold"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" /> 
                Continue with Google
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
          )}
        </CardContent>
      </Card>

      <div className="w-full flex justify-center mt-8 mb-4">
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

export default LoginPage
