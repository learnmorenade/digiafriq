import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role client for payment verification (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Payment provider interfaces
interface PaymentProvider {
  verifyTransaction(reference: string): Promise<any>
  getProviderName(): string
}

// Paystack provider implementation
class PaystackProvider implements PaymentProvider {
  private secretKey: string

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  getProviderName(): string {
    return 'paystack'
  }

  async verifyTransaction(reference: string): Promise<any> {
    console.log('🌐 Verifying with Paystack API:', reference)
    
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('📊 Paystack verification response:', data)
    return data
  }
}

// Kora provider implementation
class KoraProvider implements PaymentProvider {
  private secretKey: string

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  getProviderName(): string {
    return 'kora'
  }

  async verifyTransaction(reference: string): Promise<any> {
    console.log('🌐 Verifying with Kora API:', reference)
    
    // Correct Kora API endpoint from documentation
    const endpoint = `https://api.korapay.com/merchant/api/v1/charges/${reference}`
    
    console.log(`🔍 Using Kora endpoint: ${endpoint}`)
    
    const response = await fetch(endpoint, {
      method: 'GET', // Kora uses GET for verification
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log(`📨 Kora API response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Kora API error (${response.status}):`, errorText)
      throw new Error(`Kora API error: ${response.status} - ${errorText}`)
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type')
    console.log(`📄 Response content type: ${contentType}`)

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error(`❌ Kora API returned non-JSON response:`, text.substring(0, 200))
      throw new Error(`Kora API returned invalid response format. Expected JSON, got ${contentType || 'unknown'}`)
    }

    const data = await response.json()
    console.log(`✅ Kora verification response:`, data)
    
    // Validate Kora response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid Kora response: not an object')
    }

    // Kora response should have data.status field according to documentation
    if (!data.data) {
      throw new Error('Invalid Kora response: missing data field')
    }

    // Normalize Kora response to match our expected format
    const normalizedResponse = {
      status: true, // Kora returns 200 for successful API calls
      message: 'Verification successful',
      data: {
        ...data.data,
        status: data.data.status, // success, failed, pending
        reference: data.data.reference || reference,
        amount: data.data.amount,
        currency: data.data.currency,
        paid_at: data.data.paid_at || data.data.created_at,
        id: data.data.id || data.data.transaction_id
      }
    }

    console.log(`✅ Normalized Kora response:`, normalizedResponse)
    return normalizedResponse
  }
}

// Payment provider factory
class PaymentProviderFactory {
  static create(provider: string): PaymentProvider {
    switch (provider.toLowerCase()) {
      case 'paystack':
        return new PaystackProvider(process.env.PAYSTACK_SECRET_KEY!)
      case 'kora':
        return new KoraProvider(process.env.KORA_SECRET_KEY!)
      default:
        throw new Error(`Unsupported payment provider: ${provider}`)
    }
  }
}

// Helper function to process membership creation
async function processMembershipCreation(payment: any, verificationData: any) {
  console.log('🎉 PAYMENT VERIFICATION COMPLETED SUCCESSFULLY')
  console.log('📋 Final payment record:', {
    id: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    membership_package_id: payment.membership_package_id
  })

  // Create user membership record
  const membershipPackageId = verificationData.data?.metadata?.membership_package_id || payment.membership_package_id
  console.log('🎫 Membership package ID:', membershipPackageId)
  
  if (membershipPackageId) {
    try {
      console.log('🔍 Looking up membership package details for ID:', membershipPackageId)
      
      // Get membership package details
      const { data: membershipPackage, error: membershipError } = await supabase
        .from('membership_packages')
        .select('duration_months, member_type')
        .eq('id', membershipPackageId)
        .maybeSingle() as any

      console.log('📊 Membership package query result:', {
        packageFound: !!membershipPackage,
        packageError: membershipError?.message,
        packageDetails: membershipPackage
      })

      if (!membershipError && membershipPackage) {
        console.log('✅ Membership package found:', {
          duration_months: membershipPackage.duration_months,
          member_type: membershipPackage.member_type
        })
        
        // Calculate expiry date
        const startDate = new Date()
        const expiryDate = new Date()
        expiryDate.setMonth(expiryDate.getMonth() + membershipPackage.duration_months)

        console.log('📅 Creating user membership:', {
          user_id: payment.user_id,
          membership_package_id: membershipPackageId,
          payment_id: payment.id,
          start_date: startDate.toISOString(),
          expiry_date: expiryDate.toISOString()
        })

        // Create user membership
        const { error: membershipCreateError } = await supabase
          .from('user_memberships')
          .insert({
            user_id: payment.user_id,
            membership_package_id: membershipPackageId,
            payment_id: payment.id,
            started_at: startDate.toISOString(),
            expires_at: expiryDate.toISOString(),
            is_active: true
          }) as any

        if (membershipCreateError) {
          console.error('❌ DATABASE ERROR: Failed to create user membership:', membershipCreateError)
          console.error('❌ Full membership creation error:', JSON.stringify(membershipCreateError, null, 2))
        } else {
          console.log('✅ User membership created successfully')
        }

        // Update user role based on membership type
        if (membershipPackage.member_type === 'affiliate') {
          console.log('👑 Affiliate membership detected, updating user role...')
          
          const { error: roleUpdateError } = await supabase
            .from('profiles')
            .update({ role: 'affiliate' })
            .eq('id', payment.user_id) as any

          if (roleUpdateError) {
            console.error('❌ DATABASE ERROR: Failed to update user role:', roleUpdateError)
            console.error('❌ Full role update error:', JSON.stringify(roleUpdateError, null, 2))
          } else {
            console.log('✅ User role updated to affiliate successfully')
          }
        } else {
          console.log('🎓 Learner membership detected, no role update needed')
        }
      } else {
        console.error('❌ DATABASE ERROR: Failed to fetch membership package:', membershipError)
        console.error('❌ Full package error:', JSON.stringify(membershipError, null, 2))
      }
    } catch (membershipError) {
      console.error('❌ ERROR: Exception during membership processing:', membershipError)
      console.error('❌ Full membership exception:', JSON.stringify(membershipError, null, 2))
    }
  } else {
    console.log('⚠️ WARNING: No membership package ID found')
  }

  return NextResponse.json({
    success: true,
    message: 'Payment verified successfully',
    payment: {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: 'completed',
      membership_package_id: payment.membership_package_id || null
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { reference, user_id } = await request.json()

    console.log('🔍 PAYMENT VERIFICATION STARTED')
    console.log('📥 Request data:', { reference, user_id })

    if (!reference) {
      console.log('❌ ERROR: No payment reference provided')
      return NextResponse.json(
        { success: false, message: 'Payment reference is required' },
        { status: 400 }
      )
    }

    console.log('✅ Reference validated:', reference)

    try {
      console.log('🔍 Looking up payment in database with reference:', reference)
      console.log('🔍 Search details:', { reference, user_id })

      // First, check if payment exists in our database (check provider_reference column)
      let payment: any = null
      let paymentError: any = null
      
      try {
        const { data: initialPayment, error: initialError } = await supabase
          .from('payments')
          .select(`
            id,
            user_id,
            membership_package_id,
            amount,
            currency,
            base_currency_amount,
            status,
            provider_reference,
            payment_provider,
            created_at
          `)
          .eq('provider_reference', reference)
          .maybeSingle() as any

        payment = initialPayment
        paymentError = initialError
      } catch (queryError) {
        console.error('❌ Database query error:', queryError)
        paymentError = queryError
      }

      console.log('📊 Database query result:', { 
        paymentFound: !!payment, 
        paymentError: paymentError?.message,
        paymentId: payment?.id,
        paymentStatus: payment?.status,
        paymentUserId: payment?.user_id,
        requestedUserId: user_id,
        paymentProvider: payment?.payment_provider,
        providerReference: payment?.provider_reference
      })

      // If payment not found with provider_reference, try to find it by user_id and recent creation
      if (!payment || paymentError) {
        console.log('🔍 Payment not found by reference, searching by user and recent creation...')
        
        let recentPayment: any = null
        let recentError: any = null
        
        try {
          const { data: foundRecentPayment, error: foundRecentError } = await supabase
            .from('payments')
            .select(`
              id,
              user_id,
              membership_package_id,
              amount,
              currency,
              base_currency_amount,
              status,
              provider_reference,
              payment_provider,
              created_at
            `)
            .eq('user_id', user_id)
            .eq('status', 'pending')
            .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle() as any

          recentPayment = foundRecentPayment
          recentError = foundRecentError
        } catch (recentQueryError) {
          console.error('❌ Recent payment query error:', recentQueryError)
          recentError = recentQueryError
        }

        console.log('📊 Recent payment search result:', {
          recentPaymentFound: !!recentPayment,
          recentError: recentError?.message,
          recentPaymentId: recentPayment?.id,
          recentPaymentStatus: recentPayment?.status,
          recentProviderReference: recentPayment?.provider_reference
        })

        if (recentPayment && !recentError) {
          console.log('✅ Found recent payment, using it for verification')
          
          // Update the payment with the provider reference if it's missing
          if (!recentPayment.provider_reference) {
            console.log('🔄 Updating recent payment with provider reference...')
            try {
              const { error: updateError } = await supabase
                .from('payments')
                .update({ provider_reference: reference })
                .eq('id', recentPayment.id)
              
              if (updateError) {
                console.error('❌ Failed to update provider reference:', updateError)
              } else {
                console.log('✅ Updated provider reference for recent payment')
                recentPayment.provider_reference = reference
              }
            } catch (updateError) {
              console.error('❌ Exception updating provider reference:', updateError)
            }
          }
          
          payment = recentPayment
          paymentError = null
        }
      }

      if (paymentError) {
        console.error('❌ DATABASE ERROR: Payment not found in database:', paymentError)
        console.error('❌ Full error details:', JSON.stringify(paymentError, null, 2))
        return NextResponse.json(
          { success: false, message: 'Payment not found', details: paymentError.message },
          { status: 404 }
        )
      }

      // If payment doesn't exist, we need to create it after verification
      if (!paymentError && !payment) {
        console.log('❌ PAYMENT RECORD NOT FOUND: No payment record exists in database for reference:', reference)
        console.log('🔄 Will create payment record if verification succeeds')
        
        // Try to verify with all providers to find which one has the transaction
        let verificationData = null
        let providerUsed = null

        // Try Paystack first
        try {
          const paystackProvider = PaymentProviderFactory.create('paystack')
          verificationData = await paystackProvider.verifyTransaction(reference)
          if (verificationData.status && verificationData.data.status === 'success') {
            providerUsed = 'paystack'
            console.log('✅ Transaction found in Paystack')
          }
        } catch (paystackError) {
          console.log('❌ Paystack verification failed:', (paystackError as Error).message)
        }

        // If Paystack failed, try Kora
        if (!verificationData || !verificationData.status || verificationData.data.status !== 'success') {
          try {
            const koraProvider = PaymentProviderFactory.create('kora')
            verificationData = await koraProvider.verifyTransaction(reference)
            if (verificationData.status && verificationData.data.status === 'success') {
              providerUsed = 'kora'
              console.log('✅ Transaction found in Kora')
            }
          } catch (koraError) {
            console.log('❌ Kora verification failed:', (koraError as Error).message)
          }
        }

        if (!verificationData || !verificationData.status) {
          console.log('❌ VERIFICATION FAILED: Transaction not found in any provider')
          return NextResponse.json({
            success: false,
            message: 'Payment verification failed - transaction not found in any payment provider',
            details: 'The reference was not found in Paystack or Kora systems'
          })
        }

        console.log('✅ VERIFICATION SUCCESSFUL with provider:', providerUsed)
        
        // Create payment record as fallback
        const membershipPackageId = verificationData.data?.metadata?.membership_package_id
        if (!membershipPackageId) {
          console.error('❌ Cannot create fallback payment: No membership_package_id in verification metadata')
          return NextResponse.json({
            success: false,
            message: 'Payment verification failed - missing membership information'
          })
        }

        console.log('🔄 Creating fallback payment record...')
        const { data: newPayment, error: createError } = await supabase
          .from('payments')
          .insert({
            user_id: user_id,
            membership_package_id: membershipPackageId,
            amount: verificationData.data.amount / 100, // Convert from kobo/cents
            currency: verificationData.data.currency,
            payment_provider: providerUsed,
            payment_type: 'membership',
            status: 'completed',
            provider_reference: reference, // Use provider_reference for all providers
            paid_at: verificationData.data.paid_at || new Date().toISOString()
          })
          .select()
          .single() as any

        if (createError) {
          console.error('❌ Failed to create fallback payment record:', createError)
          
          // Check if it's a duplicate key error - if so, try to find existing record
          if (createError.code === '23505') {
            console.log('🔄 Duplicate payment detected, trying to find existing record...')
            const { data: existingPayment } = await supabase
              .from('payments')
              .select('*')
              .eq('provider_reference', reference)
              .single() as any
              
            if (existingPayment) {
              console.log('✅ Found existing payment record:', existingPayment)
              return await processMembershipCreation(existingPayment, verificationData)
            } else {
              return NextResponse.json({
                success: false,
                message: 'Payment record conflict',
                details: 'Duplicate payment reference detected'
              })
            }
          } else {
            return NextResponse.json({
              success: false,
              message: 'Failed to create payment record',
              details: createError.message
            })
          }
        } else {
          console.log('✅ Fallback payment record created successfully:', newPayment)
          return await processMembershipCreation(newPayment, verificationData)
        }
      }

      if (!payment) {
        console.error('❌ PAYMENT RECORD NOT FOUND: No payment record exists in database for reference:', reference)
        console.error('❌ This means the payment initialization may have failed or the record was not saved')
        return NextResponse.json(
          { success: false, message: 'Payment record not found in database', details: 'Payment was successful but record not saved in system' },
          { status: 404 }
        )
      }

      // If payment is already completed, return success
      if (payment.status === 'completed') {
        console.log('✅ PAYMENT ALREADY VERIFIED - No action needed')
        console.log('📋 Payment details:', {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          membership_package_id: payment.membership_package_id
        })
        return NextResponse.json({
          success: true,
          message: 'Payment already verified',
          payment: {
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            membership_package_id: payment.membership_package_id || null
          }
        })
      }

      console.log('🔄 Payment not completed yet, proceeding with provider verification')
      console.log('💳 Current payment status:', payment.status)
      console.log('💳 Payment provider:', payment.payment_provider)

      // Verify with the appropriate payment provider
      let provider: PaymentProvider
      try {
        provider = PaymentProviderFactory.create(payment.payment_provider || 'paystack')
      } catch (providerError) {
        console.error('❌ CONFIGURATION ERROR: Unsupported payment provider:', payment.payment_provider)
        return NextResponse.json(
          { success: false, message: 'Unsupported payment provider', details: (providerError as Error).message },
          { status: 500 }
        )
      }

      console.log(`🌐 Starting verification with ${provider.getProviderName()} API...`)

      let verificationData
      try {
        verificationData = await provider.verifyTransaction(reference)
        console.log('📊 Provider verification response:', JSON.stringify(verificationData, null, 2))
      } catch (verificationError) {
        console.error('❌ ERROR: Failed to verify with provider:', verificationError)
        console.error('❌ Full verification error:', JSON.stringify(verificationError, null, 2))
        return NextResponse.json(
          { success: false, message: 'Payment verification failed with provider', details: (verificationError as Error).message },
          { status: 500 }
        )
      }

      if (!verificationData.status || verificationData.data.status !== 'success') {
        console.log('❌ PROVIDER VERIFICATION FAILED')
        console.log('❌ Provider response:', {
          status: verificationData.status,
          message: verificationData.message,
          dataStatus: verificationData.data.status,
          data: verificationData.data
        })
      
        console.log('🔄 Updating payment status to failed in database...')
        
        // Update payment status to failed
        const { error: updateError } = await supabase
          .from('payments')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.id) as any

        if (updateError) {
          console.error('❌ DATABASE ERROR: Failed to update payment status to failed:', updateError)
        }

        return NextResponse.json({
          success: false,
          message: 'Payment verification failed',
          details: `Payment status: ${verificationData.data.status || 'unknown'}`
        })
      }

      console.log('✅ PROVIDER VERIFICATION SUCCESSFUL')
      console.log('💰 Payment details from provider:', {
        amount: verificationData.data.amount,
        currency: verificationData.data.currency,
        paid_at: verificationData.data.paid_at,
        transaction_id: verificationData.data.id
      })

      console.log('🔄 Updating payment status to completed in database...')
      
      // Update payment status to completed
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          paid_at: verificationData.data.paid_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id) as any

      if (updateError) {
        console.error('❌ DATABASE ERROR: Failed to update payment status:', updateError)
        console.error('❌ Full update error:', JSON.stringify(updateError, null, 2))
        return NextResponse.json(
          { success: false, message: 'Failed to update payment status', details: updateError.message },
          { status: 500 }
        )
      }

      console.log('✅ Payment status updated to completed successfully')

      // Continue with membership creation
      return await processMembershipCreation(payment, verificationData)

    } catch (error) {
      console.error('💥 CRITICAL ERROR: Payment verification failed with exception:', error)
      console.error('💥 Full error details:', JSON.stringify(error, null, 2))
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('💥 CRITICAL ERROR: Request parsing failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Invalid request format',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    )
  }
}
