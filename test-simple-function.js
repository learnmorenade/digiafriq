// Test the simple payment function
const testSimpleFunction = async () => {
  console.log('🚀 Testing simple function...');
  
  try {
    const response = await fetch('https://vcoztfitypxiwhhfdenj.supabase.co/functions/v1/test-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        membership_package_id: 'test-id',
        payment_type: 'membership'
      }),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    console.log('📥 Status:', response.status);
    const data = await response.json();
    console.log('📊 Response:', data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'AbortError') {
      console.log('⏰ Function timed out');
    }
  }
};

testSimpleFunction();
