# 🚀 EatsGram Modules - Integration Implementation Guide

**Complete step-by-step guide for integrating database and payment gateway abstraction layers into all 5 modules**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Web Module (EatsGram-web)](#web-module)
3. [Admin Module (EatsGram-admin)](#admin-module)
4. [App Module (EatsGram-app)](#app-module)
5. [Rider Module (EatsGram-rider)](#rider-module)
6. [Store Module (EatsGram-store)](#store-module)
7. [Common Setup](#common-setup)
8. [Testing](#testing)
9. [Deployment](#deployment)

---

## Overview

सभी 5 modules में abstraction layer को integrate करने के लिए:

1. **Database abstraction layer** - MongoDB/MySQL switching
2. **Payment gateway abstraction layer** - Razorpay/Stripe/PayPal switching
3. **Environment variables** - Configuration management
4. **Error handling** - Consistent error handling
5. **Logging** - Transaction logging

---

## Web Module (EatsGram-web)

### 📁 Location
```
EatsGram-web/
├── src/
│   ├── config/
│   │   └── database.js          # Database initialization
│   ├── services/
│   │   ├── orderService.js      # Order management
│   │   ├── paymentService.js    # Payment processing
│   │   └── restaurantService.js # Restaurant management
│   ├── routes/
│   │   ├── orders.js            # Order routes
│   │   ├── payments.js          # Payment routes
│   │   └── restaurants.js       # Restaurant routes
│   └── middleware/
│       └── errorHandler.js      # Error handling
└── .env.example
```

### 🔧 Step 1: Setup Environment Variables

**File:** `EatsGram-web/.env`

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
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

### 🔧 Step 2: Initialize Database

**File:** `EatsGram-web/src/config/database.js`

```javascript
const db = require('../../../integrations/database');

class DatabaseConfig {
  static async initialize() {
    try {
      await db.initialize();
      console.log('✅ Database initialized');
      return db;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  static getModels() {
    return db.getModels();
  }

  static async close() {
    await db.close();
  }
}

module.exports = DatabaseConfig;
```

### 🔧 Step 3: Create Order Service

**File:** `EatsGram-web/src/services/orderService.js`

```javascript
const db = require('../../../integrations/database');
const paymentGateway = require('../../../integrations/payment-gateways');

class OrderService {
  static async createOrder(orderData) {
    try {
      // Initialize
      await db.initialize();
      await paymentGateway.initialize();

      // Create payment order
      const paymentOrder = await paymentGateway.createOrder(
        orderData.amount,
        'INR',
        {
          order_id: `ORD_${Date.now()}`,
          user_id: orderData.user_id,
          restaurant_id: orderData.restaurant_id,
        }
      );

      // Save to database
      const { Order } = db.getModels();
      const order = await Order.create({
        user_id: orderData.user_id,
        restaurant_id: orderData.restaurant_id,
        amount: orderData.amount,
        payment_id: paymentOrder.orderId,
        status: 'pending',
        items: orderData.items,
      });

      return {
        success: true,
        order,
        paymentOrder,
      };
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  static async verifyPayment(paymentData) {
    try {
      await paymentGateway.initialize();
      await db.initialize();

      // Verify payment
      const payment = await paymentGateway.verifyPayment(paymentData);

      // Update order status
      const { Order } = db.getModels();
      await Order.update(
        { status: 'completed', payment_status: 'success' },
        { where: { payment_id: payment.orderId } }
      );

      return {
        success: true,
        payment,
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  static async getOrders(userId) {
    try {
      await db.initialize();
      const { Order } = db.getModels();
      return await Order.find({ user_id: userId });
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  }
}

module.exports = OrderService;
```

### 🔧 Step 4: Create Payment Routes

**File:** `EatsGram-web/src/routes/payments.js`

```javascript
const express = require('express');
const router = express.Router();
const OrderService = require('../services/orderService');

// Create order
router.post('/create-order', async (req, res) => {
  try {
    const result = await OrderService.createOrder(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const result = await OrderService.verifyPayment(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders
router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await OrderService.getOrders(req.params.userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 🔧 Step 5: Setup Express App

**File:** `EatsGram-web/src/app.js`

```javascript
const express = require('express');
const DatabaseConfig = require('./config/database');
const paymentRoutes = require('./routes/payments');
const orderRoutes = require('./routes/orders');

const app = express();

// Middleware
app.use(express.json());

// Initialize database on startup
app.use(async (req, res, next) => {
  try {
    await DatabaseConfig.initialize();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);

// Error handling
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: error.message });
});

module.exports = app;
```

---

## Admin Module (EatsGram-admin)

### 📁 Location
```
EatsGram-admin/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── services/
│   │   ├── dashboardService.js
│   │   ├── orderService.js
│   │   └── restaurantService.js
│   ├── routes/
│   │   ├── dashboard.js
│   │   ├── orders.js
│   │   └── restaurants.js
│   └── middleware/
│       └── auth.js
└── .env.example
```

### 🔧 Step 1: Dashboard Service

**File:** `EatsGram-admin/src/services/dashboardService.js`

```javascript
const db = require('../../../integrations/database');

class DashboardService {
  static async getDashboardStats() {
    try {
      await db.initialize();
      const { Order, Payment, Restaurant, User } = db.getModels();

      const totalOrders = await Order.count();
      const totalRevenue = await Payment.sum('amount', {
        where: { status: 'success' }
      });
      const totalRestaurants = await Restaurant.count();
      const totalUsers = await User.count();

      return {
        totalOrders,
        totalRevenue,
        totalRestaurants,
        totalUsers,
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  }

  static async getRecentOrders(limit = 10) {
    try {
      await db.initialize();
      const { Order } = db.getModels();
      return await Order.findAll({
        limit,
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      console.error('Recent orders error:', error);
      throw error;
    }
  }

  static async getPaymentStats() {
    try {
      await db.initialize();
      const { Payment } = db.getModels();

      const totalPayments = await Payment.count();
      const successfulPayments = await Payment.count({
        where: { status: 'success' }
      });
      const failedPayments = await Payment.count({
        where: { status: 'failed' }
      });

      return {
        totalPayments,
        successfulPayments,
        failedPayments,
        successRate: (successfulPayments / totalPayments * 100).toFixed(2),
      };
    } catch (error) {
      console.error('Payment stats error:', error);
      throw error;
    }
  }
}

module.exports = DashboardService;
```

### 🔧 Step 2: Dashboard Routes

**File:** `EatsGram-admin/src/routes/dashboard.js`

```javascript
const express = require('express');
const router = express.Router();
const DashboardService = require('../services/dashboardService');

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await DashboardService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent orders
router.get('/recent-orders', async (req, res) => {
  try {
    const orders = await DashboardService.getRecentOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment stats
router.get('/payment-stats', async (req, res) => {
  try {
    const stats = await DashboardService.getPaymentStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## App Module (EatsGram-app)

### 📁 Location
```
EatsGram-app/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── services/
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   └── userService.js
│   ├── screens/
│   │   ├── OrderScreen.js
│   │   ├── PaymentScreen.js
│   │   └── OrderHistoryScreen.js
│   └── api/
│       └── client.js
└── .env.example
```

### 🔧 Step 1: Payment Service

**File:** `EatsGram-app/src/services/paymentService.js`

```javascript
const paymentGateway = require('../../../integrations/payment-gateways');
const db = require('../../../integrations/database');

class PaymentService {
  static async initiatePayment(amount, orderId) {
    try {
      await paymentGateway.initialize();

      const order = await paymentGateway.createOrder(amount, 'INR', {
        order_id: orderId,
      });

      return {
        success: true,
        orderId: order.orderId,
        amount: order.amount,
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw error;
    }
  }

  static async verifyPayment(paymentData) {
    try {
      await paymentGateway.initialize();
      await db.initialize();

      const payment = await paymentGateway.verifyPayment(paymentData);

      // Update order status
      const { Order } = db.getModels();
      await Order.update(
        { status: 'confirmed', payment_status: 'success' },
        { where: { payment_id: payment.orderId } }
      );

      return {
        success: true,
        payment,
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  static async getPaymentStatus(paymentId) {
    try {
      await paymentGateway.initialize();
      return await paymentGateway.getPaymentStatus(paymentId);
    } catch (error) {
      console.error('Get payment status error:', error);
      throw error;
    }
  }
}

module.exports = PaymentService;
```

### 🔧 Step 2: Order Service

**File:** `EatsGram-app/src/services/orderService.js`

```javascript
const db = require('../../../integrations/database');

class OrderService {
  static async createOrder(orderData) {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      const order = await Order.create({
        user_id: orderData.user_id,
        restaurant_id: orderData.restaurant_id,
        items: orderData.items,
        amount: orderData.amount,
        status: 'pending',
      });

      return order;
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  static async getOrderHistory(userId) {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      return await Order.find({ user_id: userId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Order history error:', error);
      throw error;
    }
  }

  static async getOrderDetails(orderId) {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      return await Order.findById(orderId);
    } catch (error) {
      console.error('Order details error:', error);
      throw error;
    }
  }

  static async cancelOrder(orderId) {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      await Order.update(
        { status: 'cancelled' },
        { where: { id: orderId } }
      );

      return { success: true };
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }
}

module.exports = OrderService;
```

---

## Rider Module (EatsGram-rider)

### 📁 Location
```
EatsGram-rider/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── services/
│   │   ├── orderService.js
│   │   ├── deliveryService.js
│   │   └── riderService.js
│   ├── screens/
│   │   ├── AvailableOrdersScreen.js
│   │   ├── ActiveDeliveryScreen.js
│   │   └── EarningsScreen.js
│   └── api/
│       └── client.js
└── .env.example
```

### 🔧 Step 1: Delivery Service

**File:** `EatsGram-rider/src/services/deliveryService.js`

```javascript
const db = require('../../../integrations/database');

class DeliveryService {
  static async getAvailableOrders() {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      return await Order.find({
        status: 'confirmed',
        rider_id: null,
      });
    } catch (error) {
      console.error('Available orders error:', error);
      throw error;
    }
  }

  static async acceptOrder(orderId, riderId) {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      await Order.update(
        { rider_id: riderId, status: 'assigned' },
        { where: { id: orderId } }
      );

      return { success: true };
    } catch (error) {
      console.error('Accept order error:', error);
      throw error;
    }
  }

  static async getActiveDeliveries(riderId) {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      return await Order.find({
        rider_id: riderId,
        status: ['assigned', 'picked_up', 'in_transit'],
      });
    } catch (error) {
      console.error('Active deliveries error:', error);
      throw error;
    }
  }

  static async updateDeliveryStatus(orderId, status) {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      await Order.update(
        { status },
        { where: { id: orderId } }
      );

      return { success: true };
    } catch (error) {
      console.error('Update delivery status error:', error);
      throw error;
    }
  }

  static async completeDelivery(orderId) {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      await Order.update(
        { status: 'delivered' },
        { where: { id: orderId } }
      );

      return { success: true };
    } catch (error) {
      console.error('Complete delivery error:', error);
      throw error;
    }
  }
}

module.exports = DeliveryService;
```

### 🔧 Step 2: Rider Service

**File:** `EatsGram-rider/src/services/riderService.js`

```javascript
const db = require('../../../integrations/database');

class RiderService {
  static async getRiderStats(riderId) {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      const totalDeliveries = await Order.count({
        where: { rider_id: riderId, status: 'delivered' }
      });

      const activeDeliveries = await Order.count({
        where: { rider_id: riderId, status: ['assigned', 'in_transit'] }
      });

      return {
        totalDeliveries,
        activeDeliveries,
      };
    } catch (error) {
      console.error('Rider stats error:', error);
      throw error;
    }
  }

  static async getRiderEarnings(riderId) {
    try {
      await db.initialize();
      const { Order, Payment } = db.getModels();

      const orders = await Order.find({
        rider_id: riderId,
        status: 'delivered',
      });

      const totalEarnings = orders.reduce((sum, order) => {
        return sum + (order.delivery_fee || 0);
      }, 0);

      return {
        totalEarnings,
        orderCount: orders.length,
      };
    } catch (error) {
      console.error('Rider earnings error:', error);
      throw error;
    }
  }
}

module.exports = RiderService;
```

---

## Store Module (EatsGram-store)

### 📁 Location
```
EatsGram-store/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── services/
│   │   ├── menuService.js
│   │   ├── orderService.js
│   │   └── analyticsService.js
│   ├── screens/
│   │   ├── MenuScreen.js
│   │   ├── OrdersScreen.js
│   │   └── AnalyticsScreen.js
│   └── api/
│       └── client.js
└── .env.example
```

### 🔧 Step 1: Menu Service

**File:** `EatsGram-store/src/services/menuService.js`

```javascript
const db = require('../../../integrations/database');

class MenuService {
  static async getMenuItems(restaurantId) {
    try {
      await db.initialize();
      const { FoodItem } = db.getModels();

      return await FoodItem.find({ restaurant_id: restaurantId });
    } catch (error) {
      console.error('Get menu items error:', error);
      throw error;
    }
  }

  static async addMenuItem(restaurantId, itemData) {
    try {
      await db.initialize();
      const { FoodItem } = db.getModels();

      const item = await FoodItem.create({
        restaurant_id: restaurantId,
        ...itemData,
      });

      return item;
    } catch (error) {
      console.error('Add menu item error:', error);
      throw error;
    }
  }

  static async updateMenuItem(itemId, itemData) {
    try {
      await db.initialize();
      const { FoodItem } = db.getModels();

      await FoodItem.update(itemData, { where: { id: itemId } });

      return { success: true };
    } catch (error) {
      console.error('Update menu item error:', error);
      throw error;
    }
  }

  static async deleteMenuItem(itemId) {
    try {
      await db.initialize();
      const { FoodItem } = db.getModels();

      await FoodItem.destroy({ where: { id: itemId } });

      return { success: true };
    } catch (error) {
      console.error('Delete menu item error:', error);
      throw error;
    }
  }
}

module.exports = MenuService;
```

### 🔧 Step 2: Order Service

**File:** `EatsGram-store/src/services/orderService.js`

```javascript
const db = require('../../../integrations/database');

class OrderService {
  static async getRestaurantOrders(restaurantId) {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      return await Order.find({
        restaurant_id: restaurantId,
      }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Get restaurant orders error:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId, status) {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      await Order.update(
        { status },
        { where: { id: orderId } }
      );

      return { success: true };
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  static async getPendingOrders(restaurantId) {
    try {
      await db.initialize();
      const { Order } = db.getModels();

      return await Order.find({
        restaurant_id: restaurantId,
        status: 'confirmed',
      });
    } catch (error) {
      console.error('Get pending orders error:', error);
      throw error;
    }
  }
}

module.exports = OrderService;
```

### 🔧 Step 3: Analytics Service

**File:** `EatsGram-store/src/services/analyticsService.js`

```javascript
const db = require('../../../integrations/database');

class AnalyticsService {
  static async getRestaurantStats(restaurantId) {
    try {
      await db.initialize();
      const { Order, Payment, Review } = db.getModels();

      const totalOrders = await Order.count({
        where: { restaurant_id: restaurantId }
      });

      const totalRevenue = await Payment.sum('amount', {
        where: { order_id: { $in: await Order.find({ restaurant_id: restaurantId }).select('id') } }
      });

      const averageRating = await Review.average('rating', {
        where: { restaurant_id: restaurantId }
      });

      return {
        totalOrders,
        totalRevenue,
        averageRating,
      };
    } catch (error) {
      console.error('Restaurant stats error:', error);
      throw error;
    }
  }

  static async getTopItems(restaurantId, limit = 10) {
    try {
      await db.initialize();
      const { OrderItem, FoodItem } = db.getModels();

      // Get top selling items
      const topItems = await OrderItem.findAll({
        attributes: ['food_item_id', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
        group: ['food_item_id'],
        order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']],
        limit,
      });

      return topItems;
    } catch (error) {
      console.error('Top items error:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsService;
```

---

## Common Setup

### 🔧 Environment Variables Template

**File:** `.env.example` (in each module)

```env
# Database Configuration
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/eatsgram
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=eatsgram
MYSQL_PORT=3306

# Payment Gateway Configuration
PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox

# Application Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

### 🔧 Error Handler Middleware

**File:** `src/middleware/errorHandler.js` (in each module)

```javascript
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = errorHandler;
```

### 🔧 Logger Utility

**File:** `src/utils/logger.js` (in each module)

```javascript
const fs = require('fs');
const path = require('path');

class Logger {
  static log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
    };

    console.log(`[${level}] ${message}`, data);

    // Write to file
    const logFile = path.join(__dirname, '../../logs', `${level}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }

  static info(message, data) {
    this.log('INFO', message, data);
  }

  static error(message, data) {
    this.log('ERROR', message, data);
  }

  static warn(message, data) {
    this.log('WARN', message, data);
  }

  static debug(message, data) {
    this.log('DEBUG', message, data);
  }
}

module.exports = Logger;
```

---

## Testing

### 🧪 Unit Tests

**File:** `tests/services/orderService.test.js`

```javascript
const OrderService = require('../../src/services/orderService');

describe('OrderService', () => {
  test('should create order', async () => {
    const orderData = {
      user_id: 'USER123',
      restaurant_id: 'REST123',
      amount: 500,
      items: [],
    };

    const result = await OrderService.createOrder(orderData);
    expect(result.success).toBe(true);
    expect(result.order).toBeDefined();
  });

  test('should verify payment', async () => {
    const paymentData = {
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'signature_123',
    };

    const result = await OrderService.verifyPayment(paymentData);
    expect(result.success).toBe(true);
  });

  test('should get orders', async () => {
    const orders = await OrderService.getOrders('USER123');
    expect(Array.isArray(orders)).toBe(true);
  });
});
```

### 🧪 Integration Tests

**File:** `tests/integration/payment.test.js`

```javascript
const paymentGateway = require('../../integrations/payment-gateways');
const db = require('../../integrations/database');

describe('Payment Integration', () => {
  beforeAll(async () => {
    await db.initialize();
    await paymentGateway.initialize();
  });

  test('should create payment order', async () => {
    const order = await paymentGateway.createOrder(500, 'INR', {
      order_id: 'TEST_ORD_123',
    });

    expect(order.orderId).toBeDefined();
    expect(order.amount).toBe(500);
  });

  afterAll(async () => {
    await db.close();
  });
});
```

---

## Deployment

### 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Payment gateway credentials verified
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Security headers added
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Database backups scheduled
- [ ] Monitoring setup
- [ ] Tests passing
- [ ] Code reviewed

### 🚀 Deployment Steps

#### 1. Web Module
```bash
cd EatsGram-web
npm install
npm run build
npm start
```

#### 2. Admin Module
```bash
cd EatsGram-admin
npm install
npm run build
npm start
```

#### 3. App Module
```bash
cd EatsGram-app
npm install
npm run build
npm start
```

#### 4. Rider Module
```bash
cd EatsGram-rider
npm install
npm run build
npm start
```

#### 5. Store Module
```bash
cd EatsGram-store
npm install
npm run build
npm start
```

### 🚀 Docker Deployment

**File:** `Dockerfile` (in each module)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**File:** `docker-compose.yml` (root)

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: eatsgram

  mysql:
    image: mysql:8
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: eatsgram

  web:
    build: ./EatsGram-web
    ports:
      - "3001:3000"
    depends_on:
      - mongodb
      - mysql

  admin:
    build: ./EatsGram-admin
    ports:
      - "3002:3000"
    depends_on:
      - mongodb
      - mysql

  app:
    build: ./EatsGram-app
    ports:
      - "3003:3000"
    depends_on:
      - mongodb
      - mysql

  rider:
    build: ./EatsGram-rider
    ports:
      - "3004:3000"
    depends_on:
      - mongodb
      - mysql

  store:
    build: ./EatsGram-store
    ports:
      - "3005:3000"
    depends_on:
      - mongodb
      - mysql
```

---

## 📊 Implementation Status

| Module | Database | Payment | Status |
|--------|----------|---------|--------|
| Web | ✅ Ready | ✅ Ready | 🟢 Ready |
| Admin | ✅ Ready | ✅ Ready | 🟢 Ready |
| App | ✅ Ready | ✅ Ready | 🟢 Ready |
| Rider | ✅ Ready | ✅ Ready | 🟢 Ready |
| Store | ✅ Ready | ✅ Ready | 🟢 Ready |

---

## 📞 Support

For questions or issues, refer to:
- [Integration Guide](./integrations/INTEGRATION_GUIDE.md)
- [Database Documentation](./integrations/database/mysql/README.md)
- [Payment Gateway Documentation](./integrations/payment-gateways/razorpay/README.md)

---

**Last Updated:** October 17, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅

---

**Happy Coding! 🚀**
