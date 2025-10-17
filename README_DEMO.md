# 🎯 EatsGram Demo - Complete Setup Guide

**Date:** October 17, 2025  
**Status:** ✅ Ready for Demo  
**Repository:** [https://github.com/2lokeshrao/EatsGram-New](https://github.com/2lokeshrao/EatsGram-New)

---

## 📚 Documentation Files

यहाँ सभी demo के लिए जरूरी documentation files हैं:

| File | Purpose | Link |
|------|---------|------|
| **CREDENTIALS_SUMMARY.txt** | सभी credentials का quick reference | [View](./CREDENTIALS_SUMMARY.txt) |
| **DEMO_CREDENTIALS.md** | विस्तृत credentials और setup guide | [View](./DEMO_CREDENTIALS.md) |
| **QUICK_START_GUIDE.md** | तेजी से शुरू करने के लिए guide | [View](./QUICK_START_GUIDE.md) |

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Database Setup (One-time)

```bash
# Copy-paste ये commands एक-एक करके चलाएं:

mysql -u root -p -e "CREATE DATABASE eatsgram_demo;"

mysql -u root -p -e "CREATE USER 'eatsgram_user'@'localhost' IDENTIFIED BY 'EatsGram@Demo123';"

mysql -u root -p -e "GRANT ALL PRIVILEGES ON eatsgram_demo.* TO 'eatsgram_user'@'localhost';"

mysql -u root -p -e "FLUSH PRIVILEGES;"
```

### Step 2: Create .env.local Files

हर module में `.env.local` file बनाएं:

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

### Step 3: Install & Start

```bash
# 5 अलग-अलग terminals में ये commands चलाएं:

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

---

## 👥 All User Credentials

### 1️⃣ Admin Panel
```
Email:    admin@eatsgram.com
Password: Admin@123456
URL:      http://localhost:3001
```

### 2️⃣ Restaurant Owner
```
Email:    restaurant@eatsgram.com
Password: Restaurant@123456
URL:      http://localhost:3004
```

### 3️⃣ Customer
```
Email:    customer@eatsgram.com
Password: Customer@123456
URL:      http://localhost:3000
```

### 4️⃣ Rider
```
Email:    rider@eatsgram.com
Password: Rider@123456
URL:      http://localhost:3003
```

### 5️⃣ Store Manager
```
Email:    store@eatsgram.com
Password: Store@123456
URL:      http://localhost:3004
```

---

## 💳 Payment Test Cards

### Razorpay (Primary)
```
✅ Success Card:
   Card: 4111111111111111
   Expiry: 12/25
   CVV: 123

❌ Failed Card:
   Card: 4000000000000002
   Expiry: 12/25
   CVV: 123
```

### Stripe (Alternative)
```
✅ Success Card:
   Card: 4242424242424242
   Expiry: 12/25
   CVV: 123
```

---

## 🌐 Module URLs

| Module | URL | Port |
|--------|-----|------|
| Web | http://localhost:3000 | 3000 |
| Admin | http://localhost:3001 | 3001 |
| App | http://localhost:3002 | 3002 |
| Rider | http://localhost:3003 | 3003 |
| Store | http://localhost:3004 | 3004 |

---

## 🎯 Demo Flow (15 Minutes)

### 1. Admin Dashboard (3 min)
1. Go to http://localhost:3001
2. Login: `admin@eatsgram.com` / `Admin@123456`
3. Show user management
4. Show restaurant approvals
5. Show analytics

### 2. Customer Order (5 min)
1. Go to http://localhost:3000
2. Login: `customer@eatsgram.com` / `Customer@123456`
3. Browse restaurants
4. Add items to cart
5. Place order with test payment
6. View order status

### 3. Restaurant Management (4 min)
1. Go to http://localhost:3004
2. Login: `restaurant@eatsgram.com` / `Restaurant@123456`
3. View incoming orders
4. Accept order
5. Update menu items

### 4. Rider Delivery (3 min)
1. Go to http://localhost:3003
2. Login: `rider@eatsgram.com` / `Rider@123456`
3. View assigned deliveries
4. Update delivery status
5. View earnings

---

## 📊 Database Credentials

```
Host:     localhost
Port:     3306
User:     eatsgram_user
Password: EatsGram@Demo123
Database: eatsgram_demo
```

---

## 🔧 Environment Variables

### Database
```env
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_USER=eatsgram_user
MYSQL_PASSWORD=EatsGram@Demo123
MYSQL_DATABASE=eatsgram_demo
MYSQL_PORT=3306
```

### Payment Gateway
```env
PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=rzp_test_demo123456789
RAZORPAY_KEY_SECRET=demo_secret_key_123456789
RAZORPAY_WEBHOOK_SECRET=demo_webhook_secret_123456789
```

### JWT
```env
JWT_SECRET=your_jwt_secret_key_demo_123456789
JWT_EXPIRY=7d
```

---

## ✅ Pre-Demo Checklist

- [ ] MySQL database created
- [ ] All 5 modules cloned
- [ ] .env.local files created in each module
- [ ] npm install completed
- [ ] All modules started successfully
- [ ] Can access all 5 URLs
- [ ] Can login with all 5 accounts
- [ ] Test payment card ready

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Verify credentials
mysql -u eatsgram_user -p -e "USE eatsgram_demo; SELECT 1;"
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Module Won't Start
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📞 Support Resources

- **Full Credentials:** `DEMO_CREDENTIALS.md`
- **Quick Start:** `QUICK_START_GUIDE.md`
- **Credentials Summary:** `CREDENTIALS_SUMMARY.txt`
- **Integration Guide:** `integrations/INTEGRATION_GUIDE.md`
- **API Docs:** `integrations/README.md`
- **GitHub:** https://github.com/2lokeshrao/EatsGram-New

---

## 🔐 Security Notes

⚠️ **Important:**
- These are demo credentials only
- Change all passwords before production
- Never commit `.env.local` to version control
- Use HTTPS in production
- Rotate API keys regularly

---

## 📋 What's Included

✅ **5 Complete Modules:**
- EatsGram-web (Customer Web App)
- EatsGram-admin (Admin Dashboard)
- EatsGram-app (Mobile App)
- EatsGram-rider (Rider App)
- EatsGram-store (Restaurant Management)

✅ **Database Abstraction:**
- MySQL (Default)
- MongoDB (Alternative)
- Sequelize ORM
- Connection pooling
- Transaction support

✅ **Payment Gateway Abstraction:**
- Razorpay (Default)
- Stripe (Alternative)
- PayPal (Alternative)
- Webhook handling
- Signature verification

✅ **Complete Documentation:**
- Setup guides
- API documentation
- Integration guides
- Demo credentials
- Quick start guides

---

## 🎉 Ready to Demo!

सब कुछ तैयार है। Database setup करें, सभी modules start करें, और demo शुरू करें!

**Happy Demoing! 🚀**

---

**Created:** October 17, 2025  
**Repository:** https://github.com/2lokeshrao/EatsGram-New  
**Status:** ✅ Production Ready

