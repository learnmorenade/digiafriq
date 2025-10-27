import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify Paystack signature
    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()
    
    if (!signature) {
      return new Response('No signature provided', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Verify webhook signature
    const hash = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(paystackSecretKey + body)
    )
    const expectedSignature = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedSignature) {
      return new Response('Invalid signature', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    const event = JSON.parse(body)
    console.log('Paystack webhook event:', event.event)

    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data)
        break
      
      case 'charge.failed':
        await handleFailedPayment(event.data)
        break
      
      default:
        console.log('Unhandled event type:', event.event)
    }

    return new Response('Webhook processed', {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders
    })
  }
})

async function handleSuccessfulPayment(data: any) {
  try {
    const { reference, amount, customer, metadata } = data
    
    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        paystack_transaction_id: data.id,
        payment_method: data.channel,
        paid_at: new Date().toISOString()
      })
      .eq('paystack_reference', reference)
      .select('*')
      .single()

    if (paymentError) {
      console.error('Error updating payment:', paymentError)
      return
    }

    if (!payment) {
      console.error('Payment not found for reference:', reference)
      return
    }

    // Create enrollment
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .insert({
        user_id: payment.user_id,
        course_id: payment.course_id
      })

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError)
    }

    // Create notification for user
    await supabase.rpc('create_notification', {
      user_id_param: payment.user_id,
      title_param: 'Payment Successful!',
      message_param: 'Your course enrollment has been confirmed.',
      type_param: 'success',
      action_url_param: `/dashboard/learner/courses/${payment.course_id}`
    })

    // If there's an affiliate, create notification for them too
    if (payment.affiliate_id) {
      await supabase.rpc('create_notification', {
        user_id_param: payment.affiliate_id,
        title_param: 'New Commission Earned!',
        message_param: 'You earned a commission from a successful referral.',
        type_param: 'success',
        action_url_param: '/dashboard/affiliate/commissions'
      })
    }

    console.log('Payment processed successfully:', reference)

  } catch (error) {
    console.error('Error handling successful payment:', error)
  }
}

async function handleFailedPayment(data: any) {
  try {
    const { reference } = data
    
    // Update payment record
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        paystack_transaction_id: data.id
      })
      .eq('paystack_reference', reference)

    if (error) {
      console.error('Error updating failed payment:', error)
      return
    }

    console.log('Failed payment processed:', reference)

  } catch (error) {
    console.error('Error handling failed payment:', error)
  }
}
