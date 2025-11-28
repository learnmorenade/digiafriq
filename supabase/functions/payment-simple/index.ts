import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Simple payment function called')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.get('Authorization')!.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { membership_package_id, payment_type } = await req.json()
    console.log('📝 Request data:', { membership_package_id, payment_type, userId: user.id })

    if (!membership_package_id || !payment_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get membership package
    const { data: membershipPackage, error: packageError } = await supabase
      .from('membership_packages')
      .select('*')
      .eq('id', membership_package_id)
      .eq('is_active', true)
      .single()

    if (packageError || !membershipPackage) {
      return new Response(
        JSON.stringify({ error: 'Membership package not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        membership_package_id,
        amount: membershipPackage.price,
        currency: membershipPackage.currency,
        payment_provider: 'paystack',
        payment_type,
        status: 'pending',
      })
      .select()
      .single()

    if (paymentError) {
      throw new Error(`Failed to create payment: ${paymentError.message}`)
    }

    // Initialize Paystack payment (simplified)
    const reference = `digiafriq_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: membershipPackage.price * 100, // Convert to kobo
        currency: membershipPackage.currency,
        reference,
        callback_url: `${supabaseUrl}/functions/v1/verify-payment`,
        metadata: {
          payment_id: payment.id,
          user_id: user.id,
          membership_package_id,
        },
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      throw new Error('Paystack initialization failed')
    }

    // Update payment with provider reference
    await supabase
      .from('payments')
      .update({ 
        provider_reference: reference,
        authorization_url: paystackData.data.authorization_url 
      })
      .eq('id', payment.id)

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        reference,
        authorization_url: paystackData.data.authorization_url,
        provider: 'paystack',
        amount: membershipPackage.price,
        currency: membershipPackage.currency,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Payment error:', errorMessage)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
