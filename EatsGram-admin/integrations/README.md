# 🍽️ EatsGram Integrations

**Unified abstraction layer for Database और Payment Gateway integrations**

---

## 📌 Quick Overview

EatsGram में अब आप आसानी से **Database** और **Payment Gateway** को switch कर सकते हैं:

### ✅ Supported Databases
- **MongoDB** (Default) - NoSQL, flexible schema
- **MySQL** (Alternative) - Relational, structured data

### ✅ Supported Payment Gateways
- **Razorpay** (Default) - India-focused, easy integration
- **Stripe** (Alternative) - Global, powerful features
- **PayPal** (Alternative) - Worldwide, trusted

---

## 🗂️ Folder Structure

```
integrations/
│
├── database/                          # Database abstraction layer
│   ├── index.js                       # Main entry point
│   ├── mongodb/
│   │   ├── database.js                # MongoDB connection & models
│   │   └── models/                    # Mongoose models
│   └── mysql/
│       ├── database.js                # MySQL connection & models
│       ├── config.js                  # Sequelize configuration
│       ├── models.js                  # Sequelize models
│       ├── migration.js               # MongoDB to MySQL migration
│       ├── schema.sql                 # Database schema
│       ├── README.md                  # MySQL documentation
│       ├── QUICK_START.md             # 30-minute setup
│       ├── INTEGRATION_GUIDE.md       # Complete guide
│       ├── IMPLEMENTATION_CHECKLIST.md # Step-by-step checklist
│       ├── TROUBLESHOOTING.md         # Common issues & solutions
│       └── .env.example               # Environment variables
│
├── payment-gateways/                  # Payment gateway abstraction layer
│   ├── index.js                       # Main entry point
│   ├── razorpay/
│   │   ├── gateway.js                 # Razorpay implementation
│   │   ├── README.md                  # Razorpay documentation
│   │   └── .env.example               # Environment variables
│   ├── stripe/
│   │   ├── gateway.js                 # Stripe implementation
│   │   └── README.md                  # Stripe documentation
│   └── paypal/
│       ├── gateway.js                 # PayPal implementation
│       └── README.md                  # PayPal documentation
│
├── INTEGRATION_GUIDE.md               # Complete integration guide
└── README.md                          # This file
```

---

## 🚀 Getting Started

### 1️⃣ Database Setup

#### Option A: MongoDB (Default)

```javascript
const db = require('./integrations/database');

// Initialize
await db.initialize();

// Use models
const { User, Order, Payment } = db.getModels();
const user = await User.findById(userId);
```

**Environment Variables:**
```env
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/eatsgram
```

#### Option B: MySQL

```javascript
const db = require('./integrations/database');

// Initialize
await db.initialize();

// Use models (same API)
const { User, Order, Payment } = db.getModels();
const user = await User.findByPk(userId);
```

**Environment Variables:**
```env
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=eatsgram
```

---

### 2️⃣ Payment Gateway Setup

#### Option A: Razorpay (Default)

```javascript
const paymentGateway = require('./integrations/payment-gateways');

// Initialize
await paymentGateway.initialize();

// Create order
const order = await paymentGateway.createOrder(500, 'INR', {
  order_id: 'ORD123',
  user_id: 'USER123',
});

// Verify payment
const payment = await paymentGateway.verifyPayment({
  razorpay_order_id: order.orderId,
  razorpay_payment_id: paymentId,
  razorpay_signature: signature,
});
```

**Environment Variables:**
```env
PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

#### Option B: Stripe

```javascript
const paymentGateway = require('./integrations/payment-gateways');

// Initialize
await paymentGateway.initialize();

// Create payment intent
const paymentIntent = await paymentGateway.createOrder(500, 'inr', {
  order_id: 'ORD123',
});

// Verify payment
const payment = await paymentGateway.verifyPayment(paymentIntent.orderId);
```

**Environment Variables:**
```env
PAYMENT_GATEWAY=stripe
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

#### Option C: PayPal

```javascript
const paymentGateway = require('./integrations/payment-gateways');

// Initialize
await paymentGateway.initialize();

// Create payment
const payment = await paymentGateway.createOrder(500, 'USD', {
  order_id: 'ORD123',
});

// Execute payment
const executed = await paymentGateway.verifyPayment(payment.orderId, payerId);
```

**Environment Variables:**
```env
PAYMENT_GATEWAY=paypal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox
```

---

## 📚 Documentation

### Database Documentation
- **[MySQL README](./database/mysql/README.md)** - Complete MySQL setup
- **[MySQL Quick Start](./database/mysql/QUICK_START.md)** - 30-minute setup
- **[MySQL Integration Guide](./database/mysql/INTEGRATION_GUIDE.md)** - Detailed guide
- **[MySQL Checklist](./database/mysql/IMPLEMENTATION_CHECKLIST.md)** - Step-by-step
- **[MySQL Troubleshooting](./database/mysql/TROUBLESHOOTING.md)** - Common issues

### Payment Gateway Documentation
- **[Razorpay README](./payment-gateways/razorpay/README.md)** - Razorpay setup
- **[Stripe README](./payment-gateways/stripe/README.md)** - Stripe setup
- **[PayPal README](./payment-gateways/paypal/README.md)** - PayPal setup

### General Documentation
- **[Integration Guide](./INTEGRATION_GUIDE.md)** - Complete integration guide

---

## 🔄 API Reference

### Database API

```javascript
// Initialize database
await db.initialize();

// Get models
const { User, Order, Payment, Restaurant, FoodItem, Review, OrderItem } = db.getModels();

// Query examples
const user = await User.findById(userId);
const orders = await Order.find({ user_id: userId });
const restaurants = await Restaurant.findAll();

// Transactions
const transaction = await db.startTransaction();
try {
  // Do operations
  await db.commitTransaction(transaction);
} catch (error) {
  await db.rollbackTransaction(transaction);
}

// Close connection
await db.close();
```

### Payment Gateway API

```javascript
// Initialize payment gateway
await paymentGateway.initialize();

// Create order
const order = await paymentGateway.createOrder(
  amount,           // Payment amount
  currency,         // Currency code (INR, USD, etc.)
  metadata          // Additional data
);

// Verify payment
const payment = await paymentGateway.verifyPayment(paymentData);

// Refund payment
const refund = await paymentGateway.refundPayment(paymentId, amount);

// Get payment status
const status = await paymentGateway.getPaymentStatus(paymentId);

// Handle webhook
const result = await paymentGateway.handleWebhook(event, signature);
```

---

## 🎯 Switching Between Implementations

### Switch Database at Runtime

```bash
# Use MongoDB
export DATABASE_TYPE=mongodb

# Use MySQL
export DATABASE_TYPE=mysql
```

### Switch Payment Gateway at Runtime

```bash
# Use Razorpay
export PAYMENT_GATEWAY=razorpay

# Use Stripe
export PAYMENT_GATEWAY=stripe

# Use PayPal
export PAYMENT_GATEWAY=paypal
```

---

## 💡 Usage Examples

### Example 1: Create Order with Payment

```javascript
const db = require('./integrations/database');
const paymentGateway = require('./integrations/payment-gateways');

// Initialize
await db.initialize();
await paymentGateway.initialize();

// Create payment order
const paymentOrder = await paymentGateway.createOrder(500, 'INR', {
  order_id: `ORD_${Date.now()}`,
  user_id: 'USER123',
  restaurant_id: 'REST123',
});

// Save order to database
const { Order } = db.getModels();
const order = await Order.create({
  user_id: 'USER123',
  restaurant_id: 'REST123',
  amount: 500,
  payment_id: paymentOrder.orderId,
  status: 'pending',
});

console.log('✅ Order created:', order);
console.log('✅ Payment order:', paymentOrder);
```

### Example 2: Verify Payment

```javascript
// Verify payment
const payment = await paymentGateway.verifyPayment({
  razorpay_order_id: 'order_123',
  razorpay_payment_id: 'pay_123',
  razorpay_signature: 'signature_123',
});

// Update order status
const { Order } = db.getModels();
await Order.update(
  { status: 'completed', payment_status: 'success' },
  { where: { payment_id: payment.orderId } }
);

console.log('✅ Payment verified:', payment);
```

### Example 3: Refund Payment

```javascript
// Refund payment
const refund = await paymentGateway.refundPayment('pay_123', 500);

// Update order status
const { Order } = db.getModels();
await Order.update(
  { status: 'refunded', payment_status: 'refunded' },
  { where: { payment_id: 'order_123' } }
);

console.log('✅ Refund processed:', refund);
```

---

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use `.env.example` for reference
   - Keep secrets secure

2. **Payment Verification**
   - Always verify payment signatures
   - Validate webhook signatures
   - Use HTTPS for all payment endpoints

3. **Database Security**
   - Use strong passwords
   - Enable SSL/TLS connections
   - Regular backups
   - Limit database access

4. **API Security**
   - Validate all inputs
   - Use rate limiting
   - Implement authentication
   - Log all transactions

---

## 📊 Supported Models

### Core Models
- **User** - User accounts (customers, restaurants, riders, admins)
- **Restaurant** - Restaurant profiles
- **FoodItem** - Menu items
- **Order** - Customer orders
- **OrderItem** - Items in orders
- **Payment** - Payment records
- **Review** - Customer reviews

### Optional Models
- **Wallet** - User wallet balances
- **WalletTransaction** - Wallet transaction history
- **Coupon** - Discount coupons
- **Notification** - User notifications

---

## 🐛 Troubleshooting

### Database Connection Error

```javascript
try {
  await db.initialize();
} catch (error) {
  console.error('Database error:', error.message);
  // Check environment variables
  // Check database server is running
  // Check credentials
}
```

### Payment Gateway Error

```javascript
try {
  await paymentGateway.initialize();
} catch (error) {
  console.error('Payment gateway error:', error.message);
  // Check API keys
  // Check internet connection
  // Check webhook configuration
}
```

---

## 📞 Support & Resources

### Documentation
- [Integration Guide](./INTEGRATION_GUIDE.md)
- [MySQL Documentation](./database/mysql/README.md)
- [Razorpay Documentation](./payment-gateways/razorpay/README.md)

### External Resources
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Documentation](https://developer.paypal.com/docs/)

---

## 📈 Performance Tips

1. **Database**
   - Use connection pooling
   - Index frequently queried fields
   - Optimize queries
   - Use pagination for large datasets

2. **Payment Gateway**
   - Cache payment status
   - Use webhooks instead of polling
   - Implement retry logic
   - Monitor API rate limits

---

## 🔄 Migration Guide

### MongoDB to MySQL

```bash
# Run migration script
node integrations/database/mysql/migration.js
```

See [MySQL Migration Guide](./database/mysql/INTEGRATION_GUIDE.md#migration) for details.

---

## 📝 Environment Variables Template

```env
# Database
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/eatsgram
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=eatsgram

# Payment Gateway
PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
STRIPE_SECRET_KEY=your_secret_key
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
```

---

## ✅ Checklist

- [ ] Read this README
- [ ] Choose database (MongoDB or MySQL)
- [ ] Choose payment gateway (Razorpay, Stripe, or PayPal)
- [ ] Set environment variables
- [ ] Initialize database
- [ ] Initialize payment gateway
- [ ] Test payment flow
- [ ] Test database operations
- [ ] Deploy to production

---

## 📊 Statistics

- **Total Files:** 15+
- **Total Documentation:** ~200 KB
- **Supported Databases:** 2
- **Supported Payment Gateways:** 3
- **Core Models:** 7
- **Optional Models:** 4

---

## 🎉 Features

✅ **Abstraction Layer** - Switch databases/gateways easily
✅ **Production Ready** - Tested and optimized
✅ **Comprehensive Documentation** - Step-by-step guides
✅ **Error Handling** - Robust error management
✅ **Security** - Best practices implemented
✅ **Scalability** - Connection pooling & optimization
✅ **Webhook Support** - Real-time payment updates
✅ **Transaction Support** - ACID compliance

---

## 📄 License

This integration layer is part of the EatsGram project.

---

## 👥 Contributors

- EatsGram Development Team

---

## 📞 Contact

For questions or support, please refer to the documentation or contact the development team.

---

**Last Updated:** October 17, 2025
**Version:** 1.0
**Status:** Production Ready ✅

---

**Happy Coding! 🚀**
