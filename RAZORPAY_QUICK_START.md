# 🚀 Razorpay Integration - Quick Start Guide

यह guide आपको 30 मिनट में Razorpay को integrate करने में मदद करेगा।

---

## ⚡ 5-Minute Setup

### Step 1: Razorpay Account बनाएं (2 मिनट)

```bash
# 1. https://razorpay.com पर जाएं
# 2. "Sign Up" पर click करें
# 3. Email और password से account बनाएं
# 4. Email verify करें
```

### Step 2: API Keys प्राप्त करें (2 मिनट)

```bash
# 1. Dashboard में login करें
# 2. Settings → API Keys खोलें
# 3. Test Mode में Keys copy करें:
#    - Key ID: rzp_test_xxxxx
#    - Key Secret: xxxxx
```

### Step 3: Environment Variables Setup (1 मिनट)

```bash
# .env file में add करें:
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

---

## 🔧 Backend Setup (10 मिनट)

### Step 1: Package Install करें

```bash
cd EatsGram-backend  # या जहाँ backend है
npm install razorpay
```

### Step 2: Service File बनाएं

```bash
# File बनाएं
touch src/services/razorpay.service.js

# RAZORPAY_SERVICE_TEMPLATE.js से code copy करें
# और अपनी file में paste करें
```

### Step 3: GraphQL Mutations Add करें

```bash
# Files बनाएं
touch src/graphql/typeDefs/razorpay.typeDefs.js
touch src/graphql/resolvers/razorpay.resolver.js

# RAZORPAY_GRAPHQL_TEMPLATE.js से code copy करें
```

### Step 4: Schema में Merge करें

```javascript
// src/graphql/schema.js में add करें:

const { razorpayTypeDefs, razorpayResolvers } = require('./resolvers/razorpay.resolver');

const typeDefs = [
  baseTypeDefs,
  razorpayTypeDefs,  // Add करें
];

const resolvers = {
  ...baseResolvers,
  ...razorpayResolvers,  // Add करें
};
```

### Step 5: Webhook Setup करें

```bash
# File बनाएं
touch src/routes/webhooks/razorpay.webhook.js

# RAZORPAY_WEBHOOK_TEMPLATE.js से code copy करें
```

```javascript
// src/app.js में add करें:

const razorpayWebhook = require('./routes/webhooks/razorpay.webhook');
app.use('/api/webhooks', razorpayWebhook);
```

---

## 🎨 Frontend Setup (10 मिनट)

### Step 1: Razorpay Script Add करें

```html
<!-- public/index.html में add करें -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Step 2: Payment Component बनाएं

```bash
# Directory बनाएं
mkdir -p EatsGram-web/lib/ui/useable-components/razorpay-payment

# File बनाएं
touch EatsGram-web/lib/ui/useable-components/razorpay-payment/index.tsx

# RAZORPAY_INTEGRATION_GUIDE.md से Web App Integration section copy करें
```

### Step 3: Checkout Page में Add करें

```typescript
// pages/checkout.tsx में add करें:

import RazorpayPayment from '@/lib/ui/useable-components/razorpay-payment';

export default function CheckoutPage() {
  return (
    <div>
      {/* Other checkout content */}
      <RazorpayPayment
        amount={totalAmount}
        orderId={orderId}
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
}
```

---

## 🧪 Testing (5 मिनट)

### Test Payment करें

```bash
# 1. Application को start करें
npm run dev

# 2. Checkout page खोलें
# 3. "Pay" button पर click करें

# 4. Test Card Details:
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)

# 5. OTP: 123456
# 6. Payment complete होगा
```

### Success Response

```javascript
{
  razorpay_order_id: "order_xxxxx",
  razorpay_payment_id: "pay_xxxxx",
  razorpay_signature: "signature_xxxxx"
}
```

---

## 📊 Verify Payment

### GraphQL Query से Verify करें

```graphql
mutation {
  verifyRazorpayPayment(
    orderId: "order_xxxxx"
    paymentId: "pay_xxxxx"
    signature: "signature_xxxxx"
  ) {
    success
    message
    orderId
  }
}
```

### Response

```json
{
  "data": {
    "verifyRazorpayPayment": {
      "success": true,
      "message": "Payment verified successfully",
      "orderId": "order_xxxxx"
    }
  }
}
```

---

## 🔄 Webhook Testing

### Webhook URL को Razorpay में Add करें

```bash
# 1. Razorpay Dashboard खोलें
# 2. Settings → Webhooks खोलें
# 3. URL add करें:
https://your-domain.com/api/webhooks/razorpay-webhook

# 4. Events select करें:
- payment.authorized
- payment.captured
- payment.failed
- refund.created
```

### Local Testing के लिए

```bash
# ngrok use करें:
ngrok http 3000

# Webhook URL:
https://your-ngrok-url.ngrok.io/api/webhooks/razorpay-webhook
```

---

## 🚀 Production Deployment

### Step 1: Live Keys प्राप्त करें

```bash
# 1. Razorpay Dashboard में जाएं
# 2. Settings → API Keys खोलें
# 3. Live Mode enable करें
# 4. Live Keys copy करें
```

### Step 2: Environment Variables Update करें

```bash
# Production .env में update करें:
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret
```

### Step 3: Deploy करें

```bash
# Code को production में push करें
git add .
git commit -m "Add Razorpay payment integration"
git push origin main

# Production server में deploy करें
npm install
npm run build
npm start
```

### Step 4: Webhook Configure करें

```bash
# Razorpay Dashboard में:
# 1. Settings → Webhooks खोलें
# 2. Production URL add करें:
https://your-production-domain.com/api/webhooks/razorpay-webhook
```

---

## 🐛 Common Issues और Solutions

### Issue 1: "Invalid API Key"

```
❌ Error: Invalid API Key
✅ Solution:
   1. .env file में keys verify करें
   2. Keys को Razorpay Dashboard से copy करें
   3. Server को restart करें
```

### Issue 2: "Payment Verification Failed"

```
❌ Error: Payment verification failed
✅ Solution:
   1. RAZORPAY_KEY_SECRET verify करें
   2. Signature calculation check करें
   3. Order ID और Payment ID verify करें
```

### Issue 3: "Webhook Not Receiving"

```
❌ Error: Webhook events not received
✅ Solution:
   1. Webhook URL को Razorpay में verify करें
   2. Firewall/CORS settings check करें
   3. ngrok use करें local testing के लिए
   4. Webhook logs check करें
```

### Issue 4: "CORS Error"

```
❌ Error: CORS policy blocked
✅ Solution:
   1. Backend में CORS enable करें:
      app.use(cors());
   2. Razorpay domain को whitelist करें
```

---

## 📚 Next Steps

1. **Admin Dashboard में Configuration Add करें**
   - `RAZORPAY_INTEGRATION_GUIDE.md` → Admin Dashboard Setup section देखें

2. **Mobile App में Integration करें**
   - `RAZORPAY_INTEGRATION_GUIDE.md` → Mobile App Integration section देखें

3. **Advanced Features Add करें**
   - Payment Links
   - Subscriptions
   - Invoices
   - Settlements

4. **Monitoring Setup करें**
   - Payment analytics
   - Error tracking
   - Webhook monitoring

---

## 🎯 Checklist

- [ ] Razorpay account बनाया
- [ ] API Keys प्राप्त किए
- [ ] Environment variables setup किए
- [ ] Backend service implement किया
- [ ] GraphQL mutations add किए
- [ ] Webhook handler setup किया
- [ ] Frontend component बनाया
- [ ] Test payment किया
- [ ] Webhook testing की
- [ ] Production deployment की

---

## 📞 Support

### Razorpay Support
- **Website**: https://razorpay.com
- **Documentation**: https://razorpay.com/docs/
- **Support Email**: support@razorpay.com
- **Support Chat**: Available in Razorpay Dashboard

### EatsGram Support
- **Email**: lokeshrao050@gmail.com
- **GitHub**: https://github.com/2lokeshrao/EatsGram-New

---

**Last Updated**: October 16, 2025
**Time to Complete**: ~30 minutes
**Difficulty Level**: Beginner to Intermediate
