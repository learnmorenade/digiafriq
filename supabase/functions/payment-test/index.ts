import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('🚀 Payment test function called')
  
  try {
    const body = await req.json()
    console.log('📝 Request body:', body)
    
    // Mock successful payment response
    const mockResponse = {
      success: true,
      payment_id: 'test-payment-' + Date.now(),
      reference: 'digiafriq_test_' + Math.random().toString(36).substring(7),
      authorization_url: 'https://paystack.co/pay/test_mock',
      provider: 'paystack',
      amount: 1000,
      currency: 'USD',
      message: 'Mock payment for testing - function is working'
    }
    
    console.log('✅ Returning mock response:', mockResponse)
    
    return new Response(
      JSON.stringify(mockResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error:', error.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
