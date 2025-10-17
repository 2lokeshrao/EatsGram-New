# EatsGram Integrations Guide

## 📋 Overview

यह guide आपको EatsGram में **Database** और **Payment Gateway** integrations को implement करने में मदद करेगा।

### Supported Databases
- ✅ **MongoDB** (Default)
- ✅ **MySQL** (Alternative)

### Supported Payment Gateways
- ✅ **Razorpay** (Default)
- ✅ **Stripe** (Alternative)
- ✅ **PayPal** (Alternative)

---

## 🗂️ Folder Structure

```
integrations/
├── database/
│   ├── index.js                 # Database abstraction layer
│   ├── mongodb/
│   │   ├── database.js          # MongoDB connection class
│   │   └── models/              # MongoDB models
│   └── mysql/
│       ├── database.js          # MySQL connection class
│       ├── config.js            # MySQL configuration
│       ├── models.js            # MySQL models
│       ├── migration.js         # MongoDB to MySQL migration
│       ├── schema.sql           # Database schema
│       └── README.md            # MySQL documentation
│
└── payment-gateways/
    ├── index.js                 # Payment gateway abstraction layer
    ├── razorpay/
    │   ├── gateway.js           # Razorpay implementation
    │   └── README.md            # Razorpay documentation
    ├── stripe/
    │   ├── gateway.js           # Stripe implementation
    │   └── README.md            # Stripe documentation
    └── paypal/
        ├── gateway.js           # PayPal implementation
        └── README.md            # PayPal documentation
```

---

## 🚀 Quick Start

### 1. Database Setup

#### Using MongoDB (Default)

```javascript
const db = require('./integrations/database');

// Initialize
await db.initialize();

// Get models
const { User, Order, Payment } = db.getModels();

// Use models
const user = await User.findById(userId);
const orders = await Order.find({ user_id: userId });
```

#### Using MySQL

```bash
# Set environment variable
export DATABASE_TYPE=mysql

# Or in .env file
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=eatsgram
```

```javascript
const db = require('./integrations/database');

// Initialize
await db.initialize();

// Get models
const { User, Order, Payment } = db.getModels();

// Use models (same API as MongoDB)
const user = await User.findByPk(userId);
const orders = await Order.findAll({ where: { user_id: userId } });
```

---

### 2. Payment Gateway Setup

#### Using Razorpay (Default)

```bash
# Set environment variables
export PAYMENT_GATEWAY=razorpay
export RAZORPAY_KEY_ID=your_key_id
export RAZORPAY_KEY_SECRET=your_key_secret
export RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

```javascript
const paymentGateway = require('./integrations/payment-gateways');

// Initialize
await paymentGateway.initialize();

// Create order
const order = await paymentGateway.createOrder(500, 'INR', {
  order_id: 'ORD123',
  user_id: 'USER123',
  restaurant_id: 'REST123',
});

// Verify payment
const payment = await paymentGateway.verifyPayment({
  razorpay_order_id: order.orderId,
  razorpay_payment_id: paymentId,
  razorpay_signature: signature,
});

// Refund
const refund = await paymentGateway.refundPayment(paymentId);
```

#### Using Stripe

```bash
# Set environment variables
export PAYMENT_GATEWAY=stripe
export STRIPE_SECRET_KEY=your_secret_key
export STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

```javascript
const paymentGateway = require('./integrations/payment-gateways');

// Initialize
await paymentGateway.initialize();

// Create payment intent
const paymentIntent = await paymentGateway.createOrder(500, 'inr', {
  order_id: 'ORD123',
  user_id: 'USER123',
});

// Verify payment
const payment = await paymentGateway.verifyPayment(paymentIntent.orderId);

// Refund
const refund = await paymentGateway.refundPayment(chargeId);
```

#### Using PayPal

```bash
# Set environment variables
export PAYMENT_GATEWAY=paypal
export PAYPAL_CLIENT_ID=your_client_id
export PAYPAL_CLIENT_SECRET=your_client_secret
export PAYPAL_MODE=sandbox
```

```javascript
const paymentGateway = require('./integrations/payment-gateways');

// Initialize
await paymentGateway.initialize();

// Create payment
const payment = await paymentGateway.createOrder(500, 'USD', {
  order_id: 'ORD123',
  user_id: 'USER123',
});

// Execute payment
const executed = await paymentGateway.verifyPayment(payment.orderId, payerId);

// Refund
const refund = await paymentGateway.refundPayment(saleId);
```

---

## 📝 Environment Variables

### Database Configuration

```env
# Database Type
DATABASE_TYPE=mongodb  # or mysql

# MongoDB
MONGODB_URI=mongodb://localhost:27017/eatsgram
MONGODB_USER=root
MONGODB_PASSWORD=password
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=eatsgram

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=eatsgram
MYSQL_POOL_MIN=2
MYSQL_POOL_MAX=10
MYSQL_POOL_ACQUIRE=30000
MYSQL_POOL_IDLE=30000
MYSQL_SYNC=false
```

### Payment Gateway Configuration

```env
# Payment Gateway Type
PAYMENT_GATEWAY=razorpay  # or stripe, paypal

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Stripe
STRIPE_SECRET_KEY=your_secret_key
STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox  # or live
PAYPAL_RETURN_URL=http://localhost:3000/payment/success
PAYPAL_CANCEL_URL=http://localhost:3000/payment/cancel
```

---

## 🔄 API Reference

### Database API

```javascript
// Initialize
await db.initialize();

// Get instance
const instance = db.getInstance();

// Get models
const models = db.getModels();

// Execute query
const result = await db.query(sql, params);

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
// Initialize
await paymentGateway.initialize();

// Get instance
const instance = paymentGateway.getInstance();

// Create order
const order = await paymentGateway.createOrder(amount, currency, metadata);

// Verify payment
const payment = await paymentGateway.verifyPayment(paymentData);

// Refund
const refund = await paymentGateway.refundPayment(paymentId, amount);

// Get status
const status = await paymentGateway.getPaymentStatus(paymentId);

// Handle webhook
const result = await paymentGateway.handleWebhook(event, signature);
```

---

## 🔌 Backend Integration Example

### Express.js Integration

```javascript
const express = require('express');
const db = require('./integrations/database');
const paymentGateway = require('./integrations/payment-gateways');

const app = express();

// Initialize on startup
app.listen(3000, async () => {
  try {
    await db.initialize();
    await paymentGateway.initialize();
    console.log('✅ All integrations initialized');
  } catch (error) {
    console.error('❌ Initialization error:', error);
    process.exit(1);
  }
});

// Create order endpoint
app.post('/api/orders', async (req, res) => {
  try {
    const { amount, items, user_id, restaurant_id } = req.body;

    // Create payment order
    const paymentOrder = await paymentGateway.createOrder(amount, 'INR', {
      order_id: `ORD_${Date.now()}`,
      user_id,
      restaurant_id,
    });

    // Save order to database
    const { Order } = db.getModels();
    const order = await Order.create({
      user_id,
      restaurant_id,
      amount,
      payment_id: paymentOrder.orderId,
      status: 'pending',
    });

    res.json({
      success: true,
      order,
      paymentOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify payment endpoint
app.post('/api/payments/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify payment
    const payment = await paymentGateway.verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // Update order status
    const { Order } = db.getModels();
    await Order.update(
      { status: 'completed', payment_status: 'success' },
      { where: { payment_id: razorpay_order_id } }
    );

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook endpoint
app.post('/api/webhooks/payment', async (req, res) => {
  try {
    const event = req.body;
    const signature = req.headers['x-razorpay-signature'];

    const result = await paymentGateway.handleWebhook(event, signature);

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 🎯 Switching Between Implementations

### Switch Database

```bash
# MongoDB (default)
export DATABASE_TYPE=mongodb

# MySQL
export DATABASE_TYPE=mysql
```

### Switch Payment Gateway

```bash
# Razorpay (default)
export PAYMENT_GATEWAY=razorpay

# Stripe
export PAYMENT_GATEWAY=stripe

# PayPal
export PAYMENT_GATEWAY=paypal
```

---

## 📚 Additional Resources

- [Database Documentation](./database/mysql/README.md)
- [Razorpay Documentation](./payment-gateways/razorpay/README.md)
- [Stripe Documentation](./payment-gateways/stripe/README.md)
- [PayPal Documentation](./payment-gateways/paypal/README.md)

---

## ❓ Troubleshooting

### Database Connection Issues

```javascript
// Check connection
try {
  const db = require('./integrations/database');
  await db.initialize();
  console.log('✅ Database connected');
} catch (error) {
  console.error('❌ Connection error:', error.message);
}
```

### Payment Gateway Issues

```javascript
// Check gateway
try {
  const paymentGateway = require('./integrations/payment-gateways');
  await paymentGateway.initialize();
  console.log('✅ Payment gateway initialized');
} catch (error) {
  console.error('❌ Gateway error:', error.message);
}
```

---

## 📞 Support

For issues or questions:
1. Check the specific integration documentation
2. Review environment variables
3. Check logs for error messages
4. Refer to official documentation of the service

---

**Last Updated:** October 17, 2025
**Version:** 1.0
**Status:** Production Ready
