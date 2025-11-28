import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Simple payment function called')
    
    const { membership_package_id, payment_type } = await req.json()
    console.log('📝 Request data:', { membership_package_id, payment_type })

    // Basic validation
    if (!membership_package_id || !payment_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mock response for testing
    return new Response(
      JSON.stringify({
        success: true,
        payment_id: 'test-payment-id',
        reference: 'test-reference-123',
        authorization_url: 'https://paystack.co/pay/test',
        provider: 'paystack',
        amount: 50000,
        currency: 'GHS',
        message: 'Test response - function is working'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error:', error.message)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
