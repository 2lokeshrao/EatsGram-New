# 🚀 EatsGram Demo - Quick Start Guide

**Last Updated:** October 17, 2025  
**Status:** ✅ Ready for Demo

---

## 📋 Quick Credentials Reference

### 🔐 All User Logins

| Role | Email | Password | Module |
|------|-------|----------|--------|
| **Admin** | admin@eatsgram.com | Admin@123456 | Admin Panel |
| **Restaurant** | restaurant@eatsgram.com | Restaurant@123456 | Store Management |
| **Customer** | customer@eatsgram.com | Customer@123456 | Web/App |
| **Rider** | rider@eatsgram.com | Rider@123456 | Rider App |
| **Store Manager** | store@eatsgram.com | Store@123456 | Store Panel |

---

## 💾 Database Setup (One-Time)

```bash
# 1. Create Database
mysql -u root -p -e "CREATE DATABASE eatsgram_demo;"

# 2. Create User
mysql -u root -p -e "CREATE USER 'eatsgram_user'@'localhost' IDENTIFIED BY 'EatsGram@Demo123';"

# 3. Grant Privileges
mysql -u root -p -e "GRANT ALL PRIVILEGES ON eatsgram_demo.* TO 'eatsgram_user'@'localhost';"

# 4. Flush Privileges
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

---

## 🔧 Environment Variables

Create `.env.local` in each module:

```env
# Database
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_USER=eatsgram_user
MYSQL_PASSWORD=EatsGram@Demo123
MYSQL_DATABASE=eatsgram_demo
MYSQL_PORT=3306

# Payment Gateway
PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=rzp_test_demo123456789
RAZORPAY_KEY_SECRET=demo_secret_key_123456789
RAZORPAY_WEBHOOK_SECRET=demo_webhook_secret_123456789

# JWT
JWT_SECRET=your_jwt_secret_key_demo_123456789
JWT_EXPIRY=7d
```

---

## 🚀 Start All Modules

### Option 1: Individual Terminals

```bash
# Terminal 1: Web (Port 3000)
cd EatsGram-web && npm install && npm start

# Terminal 2: Admin (Port 3001)
cd EatsGram-admin && npm install && npm start

# Terminal 3: App (Port 3002)
cd EatsGram-app && npm install && npm start

# Terminal 4: Rider (Port 3003)
cd EatsGram-rider && npm install && npm start

# Terminal 5: Store (Port 3004)
cd EatsGram-store && npm install && npm start
```

### Option 2: Using npm-run-all (Single Terminal)

```bash
npm install -g npm-run-all

# From root directory
npm-run-all --parallel "cd EatsGram-web && npm start" "cd EatsGram-admin && npm start" "cd EatsGram-app && npm start" "cd EatsGram-rider && npm start" "cd EatsGram-store && npm start"
```

---

## 🌐 Access URLs

| Module | URL | Login |
|--------|-----|-------|
| **Web** | http://localhost:3000 | customer@eatsgram.com |
| **Admin** | http://localhost:3001 | admin@eatsgram.com |
| **App** | http://localhost:3002 | customer@eatsgram.com |
| **Rider** | http://localhost:3003 | rider@eatsgram.com |
| **Store** | http://localhost:3004 | restaurant@eatsgram.com |

---

## 🧪 Test Scenarios (5 Minutes Each)

### Scenario 1: Customer Order Flow ⏱️ 5 min

1. Go to http://localhost:3000
2. Login: `customer@eatsgram.com` / `Customer@123456`
3. Browse restaurants
4. Add items to cart
5. Checkout with test payment

**Test Card:** 4111111111111111 | Expiry: 12/25 | CVV: 123

### Scenario 2: Restaurant Management ⏱️ 5 min

1. Go to http://localhost:3004
2. Login: `restaurant@eatsgram.com` / `Restaurant@123456`
3. View incoming orders
4. Accept/Reject orders
5. Update menu items

### Scenario 3: Rider Delivery ⏱️ 5 min

1. Go to http://localhost:3003
2. Login: `rider@eatsgram.com` / `Rider@123456`
3. View assigned deliveries
4. Update delivery status
5. View earnings

### Scenario 4: Admin Dashboard ⏱️ 5 min

1. Go to http://localhost:3001
2. Login: `admin@eatsgram.com` / `Admin@123456`
3. View all users
4. Manage restaurants
5. View analytics

---

## 💳 Payment Gateway Test Cards

### Razorpay Test Cards

```
✅ Success Card
Card: 4111111111111111
Expiry: 12/25
CVV: 123

❌ Failed Card
Card: 4000000000000002
Expiry: 12/25
CVV: 123
```

### Stripe Test Cards

```
✅ Success Card
Card: 4242424242424242
Expiry: 12/25
CVV: 123

❌ Failed Card
Card: 4000000000000002
Expiry: 12/25
CVV: 123
```

---

## 🔗 API Testing with cURL

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eatsgram.com",
    "password": "Admin@123456"
  }'
```

### Get Restaurants

```bash
curl -X GET http://localhost:3000/api/restaurants \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "cust_001",
    "restaurant_id": "rest_001",
    "items": [
      {
        "item_id": "item_001",
        "quantity": 2
      }
    ],
    "delivery_address": "123 Main Street"
  }'
```

---

## 🐛 Troubleshooting

### Issue: Database Connection Failed

```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Verify credentials
mysql -u eatsgram_user -p -e "USE eatsgram_demo; SELECT 1;"
```

### Issue: Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Issue: Module Won't Start

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for errors
npm start 2>&1 | head -50
```

### Issue: Payment Gateway Error

```bash
# Verify credentials in .env.local
cat .env.local | grep RAZORPAY

# Test payment endpoint
curl -X POST http://localhost:3000/api/payments/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "INR"}'
```

---

## 📊 Demo Data Summary

### Restaurants
- **Demo Restaurant** (rest_001)
  - Cuisines: North Indian, Chinese
  - Rating: 4.5/5
  - Status: Active

### Menu Items
- **Butter Chicken** (item_001) - ₹350
- **Biryani** (item_002) - ₹300
- **Paneer Tikka** (item_003) - ₹250

### Sample Order
- Order ID: order_001
- Total: ₹876 (including tax & delivery)
- Status: Pending

---

## ✅ Pre-Demo Checklist

- [ ] MySQL database created and running
- [ ] All 5 modules cloned from GitHub
- [ ] `.env.local` files created in each module
- [ ] `npm install` completed in all modules
- [ ] All modules started successfully
- [ ] Can access all 5 URLs
- [ ] Can login with all 5 user accounts
- [ ] Test payment card ready

---

## 🎯 Demo Flow (15 Minutes)

### 1. Admin Dashboard (3 min)
- Login as admin
- Show user management
- Show restaurant approvals
- Show analytics

### 2. Customer Journey (5 min)
- Login as customer
- Browse restaurants
- Add items to cart
- Place order with payment
- View order status

### 3. Restaurant Management (4 min)
- Login as restaurant owner
- View incoming orders
- Accept order
- Update menu

### 4. Rider Delivery (3 min)
- Login as rider
- View assigned delivery
- Update status
- View earnings

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| **Full Credentials** | `DEMO_CREDENTIALS.md` |
| **Integration Guide** | `integrations/INTEGRATION_GUIDE.md` |
| **API Documentation** | `integrations/README.md` |
| **GitHub Repository** | https://github.com/2lokeshrao/EatsGram-New |

---

## 🔐 Security Notes

⚠️ **Important:**
- These are demo credentials only
- Change all passwords before production
- Never commit `.env.local` to version control
- Use HTTPS in production
- Rotate API keys regularly

---

## 🎉 Ready to Demo!

Everything is set up and ready to go. Start with the database setup, then launch all modules and begin testing!

**Happy Demoing! 🚀**

---

**Created:** October 17, 2025  
**Repository:** https://github.com/2lokeshrao/EatsGram-New  
**Status:** ✅ Production Ready

