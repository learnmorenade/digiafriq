import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { reference, user_id } = await request.json()

    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Payment reference is required' },
        { status: 400 }
      )
    }

    console.log('Verifying payment with reference:', reference)

    // First, check if payment exists in our database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        id,
        user_id,
        amount,
        currency,
        status,
        paystack_reference,
        paystack_transaction_id,
        created_at
      `)
      .eq('paystack_reference', reference)
      .single()

    if (paymentError) {
      console.error('Payment not found in database:', paymentError)
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      )
    }

    // If payment is already completed, return success
    if (payment.status === 'completed') {
      console.log('Payment already verified:', payment.id)
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          membership_package_id: membershipPackageId || null
        }
      })
    }

    // Verify with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      console.error('Paystack secret key not configured')
      return NextResponse.json(
        { success: false, message: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json'
      }
    })

    const paystackData = await paystackResponse.json()
    console.log('Paystack verification response:', paystackData)

    if (!paystackData.status || paystackData.data.status !== 'success') {
      console.log('Payment verification failed:', paystackData)
      
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({ 
          status: 'failed',
          paystack_transaction_id: paystackData.data?.id || null
        })
        .eq('id', payment.id)

      return NextResponse.json({
        success: false,
        message: 'Payment verification failed'
      })
    }

    // Payment successful - update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        paystack_transaction_id: paystackData.data.id,
        paid_at: new Date().toISOString()
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('Error updating payment status:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update payment status' },
        { status: 500 }
      )
    }

    // Create user membership record
    // Get membership_package_id from Paystack metadata
    const membershipPackageId = paystackData.data?.metadata?.membership_package_id;
    
    if (membershipPackageId) {
      try {
        // Get membership package details
        const { data: membershipPackage, error: membershipError } = await supabase
          .from('membership_packages')
          .select('duration_months, member_type')
          .eq('id', membershipPackageId)
          .single()

        if (!membershipError && membershipPackage) {
          // Calculate expiry date
          const startDate = new Date()
          const expiryDate = new Date()
          expiryDate.setMonth(expiryDate.getMonth() + membershipPackage.duration_months)

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
            })

          if (membershipCreateError) {
            console.error('Error creating user membership:', membershipCreateError)
          } else {
            console.log('User membership created successfully')
          }

          // Update user role based on membership type
          if (membershipPackage.member_type === 'affiliate') {
            const { error: roleUpdateError } = await supabase
              .from('profiles')
              .update({ role: 'affiliate' })
              .eq('id', payment.user_id)

            if (roleUpdateError) {
              console.error('Error updating user role:', roleUpdateError)
            }
          }
        }
      } catch (membershipError) {
        console.error('Error processing membership:', membershipError)
      }
    }

    console.log('Payment verification successful:', payment.id)

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: 'completed',
        membership_package_id: payment.metadata || null
      }
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
