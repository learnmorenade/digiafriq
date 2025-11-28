// Simple test for the payment function
const testFunction = async () => {
  try {
    console.log('🚀 Testing payment function...');
    
    const response = await fetch('https://vcoztfitypxiwhhfdenj.supabase.co/functions/v1/initialize-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test', // Replace with real token
      },
      body: JSON.stringify({
        membership_package_id: 'test-id',
        payment_type: 'membership',
        metadata: {}
      }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📊 Response data:', data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testFunction();
