# ✅ Razorpay Integration Implementation Checklist

यह checklist आपको Razorpay integration को step-by-step implement करने में मदद करेगा।

---

## 📋 Phase 1: Setup और Configuration

### Razorpay Account Setup
- [ ] Razorpay account बनाएं: https://razorpay.com
- [ ] Email verify करें
- [ ] KYC complete करें
- [ ] Dashboard access प्राप्त करें

### API Keys प्राप्त करें
- [ ] Dashboard → Settings → API Keys खोलें
- [ ] Test Mode Keys copy करें:
  - [ ] Key ID (Public Key)
  - [ ] Key Secret (Secret Key)
- [ ] Webhook Secret generate करें

### Environment Variables Setup
- [ ] `.env.razorpay.example` को `.env.razorpay` में rename करें
- [ ] Test Keys को `.env` में add करें:
  ```
  RAZORPAY_KEY_ID=your_test_key_id
  RAZORPAY_KEY_SECRET=your_test_key_secret
  RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
  ```
- [ ] `.env` file को `.gitignore` में add करें

---

## 🔧 Phase 2: Backend Implementation

### Package Installation
- [ ] `npm install razorpay` करें
- [ ] `npm install crypto` (अगर पहले से नहीं है)
- [ ] Dependencies verify करें: `npm list razorpay`

### Service Layer बनाएं
- [ ] `src/services/razorpay.service.js` file बनाएं
- [ ] `RAZORPAY_SERVICE_TEMPLATE.js` से code copy करें
- [ ] Environment variables को properly configure करें
- [ ] Service methods को test करें

### GraphQL Integration
- [ ] `src/graphql/typeDefs/razorpay.typeDefs.js` बनाएं
- [ ] `src/graphql/resolvers/razorpay.resolver.js` बनाएं
- [ ] `RAZORPAY_GRAPHQL_TEMPLATE.js` से code reference लें
- [ ] Type definitions को schema में merge करें
- [ ] Resolvers को schema में merge करें

### Webhook Handler Setup
- [ ] `src/routes/webhooks/razorpay.webhook.js` बनाएं
- [ ] `RAZORPAY_WEBHOOK_TEMPLATE.js` से code copy करें
- [ ] Express app में webhook route register करें:
  ```javascript
  app.use('/api/webhooks', razorpayWebhook);
  ```
- [ ] Webhook endpoint को test करें

### Database Schema Updates
- [ ] Order model में payment fields add करें:
  ```javascript
  {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paymentStatus: String, // pending, authorized, captured, failed
    paymentAmount: Number,
    paymentMethod: String,
    paymentTimestamp: Date
  }
  ```
- [ ] Refund model बनाएं (अगर नहीं है)
- [ ] Payment transaction log model बनाएं

---

## 🎨 Phase 3: Admin Dashboard Integration

### Razorpay Configuration Form
- [ ] Directory बनाएं: `EatsGram-admin/lib/ui/screen-components/protected/super-admin/configuration/add-form/razorpay`
- [ ] `index.tsx` file बनाएं
- [ ] Form validation schema बनाएं
- [ ] GraphQL mutation integrate करें
- [ ] Form styling करें

### Configuration Page में Add करें
- [ ] Admin configuration page में Razorpay form add करें
- [ ] Navigation menu में link add करें
- [ ] Form submission test करें

### Payment Management Dashboard
- [ ] Payment history page बनाएं
- [ ] Payment status display करें
- [ ] Refund functionality add करें
- [ ] Payment analytics dashboard बनाएं

---

## 💻 Phase 4: Web App Integration

### Payment Component बनाएं
- [ ] Directory बनाएं: `EatsGram-web/lib/ui/useable-components/razorpay-payment`
- [ ] `index.tsx` component बनाएं
- [ ] Razorpay script को HTML में add करें:
  ```html
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  ```
- [ ] Component styling करें

### Checkout Page Integration
- [ ] Checkout page में payment component add करें
- [ ] Order summary display करें
- [ ] Payment method selection add करें
- [ ] Success/Failure handling implement करें

### Payment Flow
- [ ] Order creation flow implement करें
- [ ] Razorpay order creation करें
- [ ] Checkout modal open करें
- [ ] Payment verification करें
- [ ] Order status update करें
- [ ] Success page redirect करें

### Error Handling
- [ ] Payment failure handling
- [ ] Network error handling
- [ ] Timeout handling
- [ ] User-friendly error messages

---

## 📱 Phase 5: Mobile App Integration

### React Native Setup
- [ ] `npm install react-native-razorpay` करें
- [ ] Native linking setup करें (iOS/Android)
- [ ] Permissions configure करें

### Payment Component बनाएं
- [ ] `src/components/RazorpayPayment.js` बनाएं
- [ ] `RAZORPAY_SERVICE_TEMPLATE.js` से reference लें
- [ ] Component styling करें

### Mobile Checkout Flow
- [ ] Checkout screen में payment button add करें
- [ ] Payment initiation implement करें
- [ ] Payment verification करें
- [ ] Success/Failure handling करें

### Testing
- [ ] iOS simulator में test करें
- [ ] Android emulator में test करें
- [ ] Real device में test करें

---

## 🧪 Phase 6: Testing

### Unit Tests
- [ ] Razorpay service methods के लिए tests लिखें
- [ ] Payment verification logic test करें
- [ ] Refund logic test करें
- [ ] Webhook signature verification test करें

### Integration Tests
- [ ] GraphQL mutations test करें
- [ ] Webhook endpoints test करें
- [ ] Database updates verify करें

### Manual Testing - Test Cards

#### Success Cases
- [ ] Card: 4111 1111 1111 1111
  - [ ] Expiry: Any future date
  - [ ] CVV: Any 3 digits
  - [ ] Expected: Payment success

#### Failure Cases
- [ ] Card: 4000 0000 0000 0002
  - [ ] Expected: Payment decline

#### 3D Secure
- [ ] Card: 4000 0000 0000 3220
  - [ ] OTP: 123456
  - [ ] Expected: 3D Secure flow

### Test Scenarios
- [ ] Small amount payment (₹1)
- [ ] Large amount payment (₹10,000+)
- [ ] Partial refund
- [ ] Full refund
- [ ] Multiple payments
- [ ] Payment timeout
- [ ] Network failure recovery

---

## 🔐 Phase 7: Security Implementation

### API Key Security
- [ ] Keys को environment variables में store करें
- [ ] Keys को code में hardcode न करें
- [ ] Keys को git history से remove करें
- [ ] Keys को regularly rotate करें

### Signature Verification
- [ ] Payment signature verification implement करें
- [ ] Webhook signature verification implement करें
- [ ] Signature verification को हमेशा करें

### Data Encryption
- [ ] Sensitive payment data को encrypt करें
- [ ] Database में encrypted data store करें
- [ ] HTTPS use करें

### CORS Configuration
- [ ] Razorpay domain को CORS whitelist में add करें
- [ ] Frontend domain को properly configure करें

### Rate Limiting
- [ ] Payment endpoint पर rate limiting add करें
- [ ] Webhook endpoint पर rate limiting add करें

---

## 📊 Phase 8: Monitoring और Logging

### Logging Setup
- [ ] Payment requests को log करें
- [ ] Payment responses को log करें
- [ ] Errors को log करें
- [ ] Webhook events को log करें

### Monitoring
- [ ] Payment success rate monitor करें
- [ ] Payment failure rate monitor करें
- [ ] Webhook delivery status monitor करें
- [ ] Error rates monitor करें

### Alerts
- [ ] High failure rate के लिए alert setup करें
- [ ] Webhook failures के लिए alert setup करें
- [ ] Unusual payment patterns के लिए alert setup करें

---

## 🚀 Phase 9: Production Deployment

### Pre-Production Testing
- [ ] सभी features को test करें
- [ ] Performance testing करें
- [ ] Load testing करें
- [ ] Security audit करें

### Live Keys Setup
- [ ] Razorpay dashboard में live mode enable करें
- [ ] Live API keys generate करें
- [ ] Live webhook secret generate करें
- [ ] Production environment में keys add करें

### Webhook Configuration
- [ ] Razorpay dashboard में webhook URL add करें
- [ ] Webhook events subscribe करें:
  - [ ] payment.authorized
  - [ ] payment.failed
  - [ ] payment.captured
  - [ ] refund.created
  - [ ] refund.failed
  - [ ] order.paid

### Deployment
- [ ] Code को production में deploy करें
- [ ] Environment variables verify करें
- [ ] Database migrations run करें
- [ ] Webhook endpoint test करें

### Post-Deployment
- [ ] Live payments test करें
- [ ] Webhook delivery verify करें
- [ ] Monitoring setup verify करें
- [ ] Support team को train करें

---

## 📝 Phase 10: Documentation

### Developer Documentation
- [ ] API documentation लिखें
- [ ] Integration guide लिखें
- [ ] Code examples add करें
- [ ] Troubleshooting guide लिखें

### User Documentation
- [ ] Payment process documentation
- [ ] Refund process documentation
- [ ] FAQ document बनाएं

### Maintenance Documentation
- [ ] Monitoring guide लिखें
- [ ] Troubleshooting guide लिखें
- [ ] Backup/Recovery procedures document करें

---

## 🎯 Quick Reference

### Important Files
```
RAZORPAY_INTEGRATION_GUIDE.md          # Main integration guide
RAZORPAY_SERVICE_TEMPLATE.js           # Backend service
RAZORPAY_GRAPHQL_TEMPLATE.js           # GraphQL mutations
RAZORPAY_WEBHOOK_TEMPLATE.js           # Webhook handler
.env.razorpay.example                  # Environment variables
```

### Test Credentials
```
Key ID: rzp_test_1DP5gbNptcWd65
Key Secret: (Razorpay Dashboard से प्राप्त करें)
```

### Useful Links
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Dashboard](https://dashboard.razorpay.com)
- [Razorpay Support](https://razorpay.com/support/)

---

## ✨ Completion Status

- [ ] Phase 1: Setup और Configuration - **0%**
- [ ] Phase 2: Backend Implementation - **0%**
- [ ] Phase 3: Admin Dashboard Integration - **0%**
- [ ] Phase 4: Web App Integration - **0%**
- [ ] Phase 5: Mobile App Integration - **0%**
- [ ] Phase 6: Testing - **0%**
- [ ] Phase 7: Security Implementation - **0%**
- [ ] Phase 8: Monitoring और Logging - **0%**
- [ ] Phase 9: Production Deployment - **0%**
- [ ] Phase 10: Documentation - **0%**

**Overall Progress**: 0% ✅

---

**Last Updated**: October 16, 2025
**Maintained by**: EatsGram Team
**Status**: Ready for Implementation
