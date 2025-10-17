# 🚀 EatsGram Modules Integration Setup

**Complete Integration Guide for All 5 Modules**  
**Database:** MySQL  
**Payment Gateway:** Razorpay  
**Date:** October 17, 2025

---

## 📋 Integration Overview

यह guide सभी 5 modules में database और payment gateway integration के लिए है:

1. **EatsGram-web** - Web Application
2. **EatsGram-admin** - Admin Dashboard
3. **EatsGram-app** - Mobile App
4. **EatsGram-rider** - Rider App
5. **EatsGram-store** - Store Management

---

## 🎯 Step 1: Copy Integration Files to Each Module

### For Each Module:

```bash
# 1. Copy integrations folder
cp -r ../integrations ./integrations

# 2. Copy .env.example
cp ../.env.mysql.example .env.local
cp ../.env.razorpay.example .env.razorpay.local
```

---

## 🔧 Step 2: Setup Environment Variables

### Create `.env.local` in each module:

```env
# Database Configuration (MySQL)
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=eatsgram
MYSQL_PORT=3306

# Payment Gateway Configuration (Razorpay)
PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Application Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

---

## 📦 Step 3: Install Dependencies

### For Node.js/Express modules:

```bash
npm install
# or
yarn install
```

### Required packages (if not already installed):

```bash
npm install sequelize mysql2 razorpay dotenv
```

---

## 🔌 Step 4: Initialize Database and Payment Gateway

### Create `config/database.js`:

```javascript
const db = require('../integrations/database');

async function initializeDatabase() {
  try {
    await db.initialize();
    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

module.exports = { initializeDatabase };
```

### Create `config/payment.js`:

```javascript
const paymentGateway = require('../integrations/payment-gateways');

async function initializePaymentGateway() {
  try {
    await paymentGateway.initialize();
    console.log('✅ Payment gateway initialized successfully');
    return paymentGateway;
  } catch (error) {
    console.error('❌ Payment gateway initialization failed:', error);
    process.exit(1);
  }
}

module.exports = { initializePaymentGateway };
```

---

## 🏗️ Step 5: Create Service Layer

### Create `services/database.service.js`:

```javascript
const { initializeDatabase } = require('../config/database');

let db = null;

async function getDatabase() {
  if (!db) {
    db = await initializeDatabase();
  }
  return db;
}

async function getModels() {
  const database = await getDatabase();
  return database.getModels();
}

async function createUser(userData) {
  const { User } = await getModels();
  return await User.create(userData);
}

async function getUserById(userId) {
  const { User } = await getModels();
  return await User.findByPk(userId);
}

async function updateUser(userId, userData) {
  const { User } = await getModels();
  return await User.update(userData, { where: { id: userId } });
}

async function deleteUser(userId) {
  const { User } = await getModels();
  return await User.destroy({ where: { id: userId } });
}

module.exports = {
  getDatabase,
  getModels,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
```

### Create `services/payment.service.js`:

```javascript
const { initializePaymentGateway } = require('../config/payment');

let paymentGateway = null;

async function getPaymentGateway() {
  if (!paymentGateway) {
    paymentGateway = await initializePaymentGateway();
  }
  return paymentGateway;
}

async function createOrder(amount, currency, metadata) {
  const gateway = await getPaymentGateway();
  return await gateway.createOrder(amount, currency, metadata);
}

async function verifyPayment(paymentData) {
  const gateway = await getPaymentGateway();
  return await gateway.verifyPayment(paymentData);
}

async function refundPayment(paymentId, amount) {
  const gateway = await getPaymentGateway();
  return await gateway.refundPayment(paymentId, amount);
}

async function handleWebhook(webhookData) {
  const gateway = await getPaymentGateway();
  return await gateway.handleWebhook(webhookData);
}

module.exports = {
  getPaymentGateway,
  createOrder,
  verifyPayment,
  refundPayment,
  handleWebhook,
};
```

---

## 🛣️ Step 6: Create API Routes/Endpoints

### Create `routes/orders.js`:

```javascript
const express = require('express');
const router = express.Router();
const paymentService = require('../services/payment.service');
const databaseService = require('../services/database.service');

// Create Order
router.post('/create', async (req, res) => {
  try {
    const { amount, currency, userId, restaurantId } = req.body;

    // Create payment order
    const paymentOrder = await paymentService.createOrder(amount, currency, {
      user_id: userId,
      restaurant_id: restaurantId,
    });

    // Save to database
    const { Order } = await databaseService.getModels();
    const order = await Order.create({
      user_id: userId,
      restaurant_id: restaurantId,
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
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Verify Payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify payment
    const payment = await paymentService.verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // Update order status
    const { Order } = await databaseService.getModels();
    await Order.update(
      { status: 'completed', payment_status: 'success' },
      { where: { payment_id: razorpay_order_id } }
    );

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get Orders
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { Order } = await databaseService.getModels();
    const orders = await Order.findAll({ where: { user_id: userId } });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
```

---

## 🚀 Step 7: Initialize in Main App File

### For Express.js (server.js or app.js):

```javascript
const express = require('express');
const { initializeDatabase } = require('./config/database');
const { initializePaymentGateway } = require('./config/payment');
const ordersRouter = require('./routes/orders');

const app = express();

// Middleware
app.use(express.json());

// Initialize Database and Payment Gateway
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Initialize payment gateway
    await initializePaymentGateway();
    console.log('✅ Payment gateway initialized');

    // Routes
    app.use('/api/orders', ordersRouter);

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

### For Next.js (pages/api/orders.js):

```javascript
import { initializeDatabase } from '../../config/database';
import { initializePaymentGateway } from '../../config/payment';

export default async function handler(req, res) {
  try {
    const db = await initializeDatabase();
    const gateway = await initializePaymentGateway();

    if (req.method === 'POST') {
      const { amount, currency, userId, restaurantId } = req.body;

      // Create payment order
      const paymentOrder = await gateway.createOrder(amount, currency, {
        user_id: userId,
        restaurant_id: restaurantId,
      });

      // Save to database
      const { Order } = db.getModels();
      const order = await Order.create({
        user_id: userId,
        restaurant_id: restaurantId,
        amount,
        payment_id: paymentOrder.orderId,
        status: 'pending',
      });

      res.status(200).json({
        success: true,
        order,
        paymentOrder,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
```

---

## 📱 Step 8: Module-Specific Integration

### EatsGram-web (Next.js)

**Location:** `EatsGram-web/lib/services/`

```javascript
// lib/services/orders.ts
import { initializeDatabase } from '../../config/database';
import { initializePaymentGateway } from '../../config/payment';

export async function createOrder(amount: number, userId: string, restaurantId: string) {
  const db = await initializeDatabase();
  const gateway = await initializePaymentGateway();

  const paymentOrder = await gateway.createOrder(amount, 'INR', {
    user_id: userId,
    restaurant_id: restaurantId,
  });

  const { Order } = db.getModels();
  return await Order.create({
    user_id: userId,
    restaurant_id: restaurantId,
    amount,
    payment_id: paymentOrder.orderId,
    status: 'pending',
  });
}
```

### EatsGram-admin (React/Vue)

**Location:** `EatsGram-admin/src/services/`

```javascript
// src/services/orders.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL;

export async function getOrders() {
  const response = await axios.get(`${API_BASE}/api/orders`);
  return response.data;
}

export async function getOrderById(orderId) {
  const response = await axios.get(`${API_BASE}/api/orders/${orderId}`);
  return response.data;
}

export async function updateOrderStatus(orderId, status) {
  const response = await axios.put(`${API_BASE}/api/orders/${orderId}`, { status });
  return response.data;
}
```

### EatsGram-app (React Native)

**Location:** `EatsGram-app/src/services/`

```javascript
// src/services/orders.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL;

export async function createOrder(amount, userId, restaurantId) {
  const response = await axios.post(`${API_BASE}/api/orders/create`, {
    amount,
    userId,
    restaurantId,
  });
  return response.data;
}

export async function verifyPayment(paymentData) {
  const response = await axios.post(`${API_BASE}/api/orders/verify`, paymentData);
  return response.data;
}
```

### EatsGram-rider (React Native)

**Location:** `EatsGram-rider/src/services/`

```javascript
// src/services/deliveries.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL;

export async function getDeliveries(riderId) {
  const response = await axios.get(`${API_BASE}/api/deliveries/rider/${riderId}`);
  return response.data;
}

export async function updateDeliveryStatus(deliveryId, status) {
  const response = await axios.put(`${API_BASE}/api/deliveries/${deliveryId}`, { status });
  return response.data;
}
```

### EatsGram-store (React)

**Location:** `EatsGram-store/src/services/`

```javascript
// src/services/store.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL;

export async function getStoreOrders(storeId) {
  const response = await axios.get(`${API_BASE}/api/orders/store/${storeId}`);
  return response.data;
}

export async function updateOrderStatus(orderId, status) {
  const response = await axios.put(`${API_BASE}/api/orders/${orderId}`, { status });
  return response.data;
}
```

---

## ✅ Step 9: Verification Checklist

### For Each Module:

- [ ] Integration files copied
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Database initialized successfully
- [ ] Payment gateway initialized successfully
- [ ] Service layer created
- [ ] Routes/endpoints created
- [ ] Main app file updated
- [ ] Tests passing
- [ ] No console errors

---

## 🧪 Step 10: Testing

### Test Database Connection:

```bash
node -e "
const db = require('./integrations/database');
db.initialize().then(() => {
  console.log('✅ Database connected');
  process.exit(0);
}).catch(err => {
  console.error('❌ Database error:', err);
  process.exit(1);
});
"
```

### Test Payment Gateway:

```bash
node -e "
const gateway = require('./integrations/payment-gateways');
gateway.initialize().then(() => {
  console.log('✅ Payment gateway connected');
  process.exit(0);
}).catch(err => {
  console.error('❌ Payment gateway error:', err);
  process.exit(1);
});
"
```

---

## 📊 Integration Status

| Module | Database | Payment Gateway | Status |
|--------|----------|-----------------|--------|
| EatsGram-web | MySQL | Razorpay | ⏳ Ready |
| EatsGram-admin | MySQL | Razorpay | ⏳ Ready |
| EatsGram-app | MySQL | Razorpay | ⏳ Ready |
| EatsGram-rider | MySQL | Razorpay | ⏳ Ready |
| EatsGram-store | MySQL | Razorpay | ⏳ Ready |

---

## 🔗 Related Documentation

- [Main Integration Guide](./integrations/README.md)
- [Database Integration Guide](./integrations/database/mysql/README.md)
- [Payment Gateway Guide](./integrations/payment-gateways/razorpay/README.md)
- [Modules Implementation Guide](./MODULES_IMPLEMENTATION_GUIDE.md)

---

## 💡 Common Issues & Solutions

### Issue: Database Connection Failed

**Solution:**
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Check environment variables
echo $MYSQL_HOST
echo $MYSQL_USER
echo $MYSQL_DATABASE
```

### Issue: Payment Gateway Not Initialized

**Solution:**
```bash
# Check Razorpay credentials
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET

# Verify credentials are correct in Razorpay dashboard
```

### Issue: Models Not Found

**Solution:**
```bash
# Ensure integrations folder is copied
ls -la ./integrations/database/

# Check database.js is present
ls -la ./integrations/database/index.js
```

---

## 🚀 Next Steps

1. **Copy integration files** to each module
2. **Setup environment variables** in each module
3. **Install dependencies** in each module
4. **Create service layer** in each module
5. **Create routes/endpoints** in each module
6. **Test database and payment gateway** in each module
7. **Deploy to production** when ready

---

## 📞 Support

For issues or questions:
1. Check troubleshooting guide
2. Review error logs
3. Check GitHub issues
4. Create new issue if needed

---

**Status:** ✅ **READY FOR INTEGRATION**

**All modules are ready for integration!** 🎉

---

**Last Updated:** October 17, 2025  
**Version:** 1.0

