# Enhanced Payment System Testing Guide - Part 1

## Overview
This guide will help you test the enhanced payment system with multi-country, multi-currency support and provider abstraction.

## Prerequisites

### 1. Database Migration
Run the migration to create the enhanced database schema:

```bash
# In your Supabase project
supabase db push
```

Or run the SQL manually in the Supabase SQL editor:
- File: `20241127000000_enhanced_payment_system.sql`

### 2. Environment Variables
Set these environment variables in your Supabase Edge Functions:

```bash
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payment Providers (at least one required)
PAYSTACK_SECRET_KEY=sk_test_xxx  # For Ghana/US payments
KORA_SECRET_KEY=sk_test_xxx      # For Nigeria payments
```

### 3. Deploy Edge Functions
Deploy the new Edge Functions:

```bash
supabase functions deploy enhanced-payment
supabase functions deploy enhanced-webhook
```

## Testing Scenarios

### Test 1: Database Schema Validation

#### 1.1 Check Currency Rates
```sql
-- Verify currency rates are populated
SELECT * FROM currency_rates;

-- Should return:
-- USD -> GHS: 10.0
-- USD -> NGN: 1200.0  
-- USD -> USD: 1.0
```

#### 1.2 Check Country Provider Mappings
```sql
-- Verify country-provider mappings
SELECT * FROM country_payment_providers;

-- Should return:
-- GH: paystack/paystack/GHS
-- NG: kora/kora/NGN
-- US: paystack/paystack/USD
```

#### 1.3 Test Currency Conversion Function
```sql
-- Test currency conversion
SELECT convert_currency(100, 'USD', 'GHS'); -- Should return 1000.0
SELECT convert_currency(100, 'USD', 'NGN'); -- Should return 120000.0
SELECT convert_currency(100, 'USD', 'USD'); -- Should return 100.0

-- Test local price calculation
SELECT calculate_local_price(100, 'USD', 'GHS', 'GH');
SELECT calculate_local_price(100, 'USD', 'NGN', 'NG');
```

### Test 2: Provider Abstraction

#### 2.1 Test Provider Factory
Create a test function to verify provider creation:

```typescript
// Test in browser console or Node.js
import { PaymentProviderFactory } from './payment-providers/index.ts'

// Test provider creation
const paystack = PaymentProviderFactory.create('paystack', { 
  apiKey: 'sk_test_xxx' 
});

const kora = PaymentProviderFactory.create('kora', { 
  apiKey: 'sk_test_xxx' 
});

console.log('Providers created successfully');
```

#### 2.2 Test Currency Conversion
```typescript
import { CurrencyConverter, CountryUtils } from './payment-providers/index.ts'

// Test currency conversion
const result = await CurrencyConverter.convertAmount(100, 'USD', 'GHS');
console.log(result); // { amount: 1000, rate: 10.0 }

// Test country utilities
const currency = CountryUtils.getCurrencyForCountry('GH');
console.log(currency); // 'GHS'

const provider = CountryUtils.getProviderForCountry('GH', 'payment');
console.log(provider); // 'paystack'
```

### Test 3: Enhanced Payment Function

#### 3.1 Test Membership Payment
Create a test request:

```javascript
const testMembershipPayment = async () => {
  const response = await fetch('https://your-project.supabase.co/functions/v1/enhanced-payment', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      membership_package_id: 'your-membership-id',
      payment_type: 'membership',
      affiliate_code: 'optional-affiliate-code'
    })
  });

  const result = await response.json();
  console.log('Payment Response:', result);
};
```

#### 3.2 Test Course Payment
```javascript
const testCoursePayment = async () => {
  const response = await fetch('https://your-project.supabase.co/functions/v1/enhanced-payment', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      course_id: 'your-course-id',
      payment_type: 'course'
    })
  });

  const result = await response.json();
  console.log('Payment Response:', result);
};
```

### Test 4: Multi-Country Scenarios

#### 4.1 Ghana User (Paystack + GHS)
1. Set user profile country to 'GH'
2. Make a payment request
3. Verify:
   - Provider: 'paystack'
   - Currency: 'GHS'
   - Amount converted from USD to GHS

#### 4.2 Nigeria User (Kora + NGN)
1. Set user profile country to 'NG'
2. Make a payment request
3. Verify:
   - Provider: 'kora'
   - Currency: 'NGN'
   - Amount converted from USD to NGN

#### 4.3 US User (Paystack + USD)
1. Set user profile country to 'US'
2. Make a payment request
3. Verify:
   - Provider: 'paystack'
   - Currency: 'USD'
   - No conversion needed

### Test 5: Database Record Validation

After successful payment, verify database records:

#### 5.1 Check Payment Record
```sql
SELECT * FROM payments 
WHERE paystack_reference = 'your-reference'
ORDER BY created_at DESC LIMIT 1;

-- Verify:
-- - base_amount (USD)
-- - paid_amount (local currency)
-- - exchange_rate
-- - provider
-- - country_code
-- - payment_type
```

#### 5.2 Check Transaction Log
```sql
SELECT * FROM transaction_log 
WHERE payment_id = 'your-payment-id'
ORDER BY created_at DESC;

-- Should show:
-- - payment_initiated
-- - webhook_received
-- - payment_completed
```

#### 5.3 Check Subscription (for membership payments)
```sql
SELECT * FROM subscriptions 
WHERE payment_id = 'your-payment-id';

-- Verify:
-- - user_id
-- - membership_package_id
-- - status: 'active'
-- - expires_at (correct duration)
```

### Test 6: Webhook Processing

#### 6.1 Simulate Paystack Webhook
```bash
# Test webhook endpoint
curl -X POST https://your-project.supabase.co/functions/v1/enhanced-webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: test-signature" \
  -d '{
    "event": "charge.success",
    "data": {
      "reference": "your-payment-reference",
      "status": "success",
      "amount": 10000,
      "currency": "GHS",
      "paid_at": "2024-11-27T10:00:00.000Z",
      "metadata": {
        "payment_id": "your-payment-id"
      }
    }
  }'
```

#### 6.2 Verify Webhook Processing
Check that the webhook:
1. Updates payment status to 'completed'
2. Creates subscription (for membership)
3. Creates enrollment (for course)
4. Processes affiliate commission (if applicable)
5. Logs all events in transaction_log

## Expected Results

### Successful Payment Flow
1. **Request**: Enhanced payment function called
2. **Country Detection**: User's country determines provider and currency
3. **Currency Conversion**: Amount converted from USD to local currency
4. **Payment Record**: Created with all currency information
5. **Provider Initialization**: Payment initialized with correct provider
6. **User Redirect**: User sent to provider payment page
7. **Webhook**: Payment completion webhook received
8. **Database Updates**: Payment status updated, subscription/enrollment created
9. **Commission**: Affiliate commission processed (if applicable)

### Database Schema Validation
- ✅ Currency rates populated
- ✅ Country-provider mappings configured
- ✅ Enhanced payments table with new columns
- ✅ Subscriptions table created
- ✅ Transaction logging functional
- ✅ Currency conversion functions working

### Provider Abstraction
- ✅ Paystack provider functional
- ✅ Kora provider functional
- ✅ Factory pattern working
- ✅ Easy to add new providers

## Troubleshooting

### Common Issues

#### 1. Migration Errors
```sql
-- Check if columns already exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments';
```

#### 2. Function Deployment Issues
```bash
# Check function logs
supabase functions serve --no-verify-jwt
supabase functions logs enhanced-payment
```

#### 3. Provider API Errors
- Verify API keys are correct
- Check provider service status
- Validate webhook URLs in provider dashboards

#### 4. Currency Conversion Issues
```sql
-- Check currency rates
SELECT * FROM currency_rates WHERE is_fixed = TRUE;

-- Test conversion functions
SELECT convert_currency(100, 'USD', 'GHS');
```

## Next Steps

After completing Part 1 testing:

1. ✅ Verify all tests pass
2. ✅ Confirm database schema is correct
3. ✅ Test payment flow end-to-end
4. ✅ Validate webhook processing
5. 🔄 Move to Part 2: Payout System & Commission Management

## Performance Considerations

- Monitor Edge Function execution times
- Check database query performance
- Verify webhook processing speed
- Test concurrent payment processing

## Security Checklist

- ✅ Webhook signature validation
- ✅ JWT authentication
- ✅ Input validation
- ✅ SQL injection protection (RLS)
- ✅ Rate limiting considerations

---

**Part 1 Complete**: Enhanced payment system with multi-country, multi-currency support and provider abstraction is ready for testing!
