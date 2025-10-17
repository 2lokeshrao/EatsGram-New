# 🎯 EatsGram Demo Credentials

**Date:** October 17, 2025  
**Status:** ✅ Demo Ready  
**Repository:** [https://github.com/2lokeshrao/EatsGram-New](https://github.com/2lokeshrao/EatsGram-New)

---

## 📋 Database Credentials

### MySQL Database

```env
# Database Configuration
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_USER=eatsgram_user
MYSQL_PASSWORD=EatsGram@Demo123
MYSQL_DATABASE=eatsgram_demo
MYSQL_PORT=3306
```

**Setup Commands:**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE eatsgram_demo;"

# Create user
mysql -u root -p -e "CREATE USER 'eatsgram_user'@'localhost' IDENTIFIED BY 'EatsGram@Demo123';"

# Grant privileges
mysql -u root -p -e "GRANT ALL PRIVILEGES ON eatsgram_demo.* TO 'eatsgram_user'@'localhost';"

# Flush privileges
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

---

## 💳 Payment Gateway Credentials

### Razorpay (Primary)

```env
PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=rzp_test_demo123456789
RAZORPAY_KEY_SECRET=demo_secret_key_123456789
RAZORPAY_WEBHOOK_SECRET=demo_webhook_secret_123456789
```

**Test Mode:** ✅ Enabled  
**Webhook URL:** `https://your-domain.com/api/webhooks/razorpay`

### Stripe (Alternative)

```env
STRIPE_PUBLIC_KEY=pk_test_demo123456789abcdef
STRIPE_SECRET_KEY=sk_test_demo123456789abcdef
STRIPE_WEBHOOK_SECRET=whsec_demo123456789abcdef
```

**Test Mode:** ✅ Enabled  
**Webhook URL:** `https://your-domain.com/api/webhooks/stripe`

### PayPal (Alternative)

```env
PAYPAL_CLIENT_ID=demo_client_id_123456789
PAYPAL_CLIENT_SECRET=demo_client_secret_123456789
PAYPAL_MODE=sandbox
```

**Sandbox Mode:** ✅ Enabled  
**Webhook URL:** `https://your-domain.com/api/webhooks/paypal`

---

## 👥 User Credentials

### Admin User

```
Email:    admin@eatsgram.com
Password: Admin@123456
Role:     Admin
Status:   Active
```

### Restaurant Owner

```
Email:    restaurant@eatsgram.com
Password: Restaurant@123456
Role:     Restaurant Owner
Status:   Active
Restaurant: Demo Restaurant
```

### Customer

```
Email:    customer@eatsgram.com
Password: Customer@123456
Role:     Customer
Status:   Active
Phone:    +91-9876543210
```

### Rider

```
Email:    rider@eatsgram.com
Password: Rider@123456
Role:     Rider
Status:   Active
Phone:    +91-9876543211
```

### Store Manager

```
Email:    store@eatsgram.com
Password: Store@123456
Role:     Store Manager
Status:   Active
Store:    Demo Store
```

---

## 🔐 JWT Tokens (For Testing)

### Admin Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGVhdHNncmFtLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcyODEwMDAwMH0.demo_signature_admin
```

### Restaurant Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJlbWFpbCI6InJlc3RhdXJhbnRAZWF0c2dyYW0uY29tIiwicm9sZSI6InJlc3RhdXJhbnQiLCJpYXQiOjE3MjgxMDAwMDB9.demo_signature_restaurant
```

### Customer Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMiLCJlbWFpbCI6ImN1c3RvbWVyQGVhdHNncmFtLmNvbSIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTcyODEwMDAwMH0.demo_signature_customer
```

### Rider Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQiLCJlbWFpbCI6InJpZGVyQGVhdHNncmFtLmNvbSIsInJvbGUiOiJyaWRlciIsImlhdCI6MTcyODEwMDAwMH0.demo_signature_rider
```

### Store Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUiLCJlbWFpbCI6InN0b3JlQGVhdHNncmFtLmNvbSIsInJvbGUiOiJzdG9yZSIsImlhdCI6MTcyODEwMDAwMH0.demo_signature_store
```

---

## 🏪 Demo Data

### Restaurants

```json
{
  "id": "rest_001",
  "name": "Demo Restaurant",
  "email": "restaurant@eatsgram.com",
  "phone": "+91-9876543210",
  "address": "123 Main Street, City",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "cuisine": ["North Indian", "Chinese"],
  "rating": 4.5,
  "status": "active"
}
```

### Menu Items

```json
{
  "id": "item_001",
  "restaurant_id": "rest_001",
  "name": "Butter Chicken",
  "description": "Creamy butter chicken curry",
  "price": 350,
  "category": "Main Course",
  "image": "https://example.com/butter-chicken.jpg",
  "available": true
}
```

### Orders

```json
{
  "id": "order_001",
  "customer_id": "cust_001",
  "restaurant_id": "rest_001",
  "items": [
    {
      "item_id": "item_001",
      "quantity": 2,
      "price": 350
    }
  ],
  "total": 700,
  "delivery_fee": 50,
  "tax": 126,
  "grand_total": 876,
  "status": "pending",
  "payment_status": "pending",
  "delivery_address": "456 Demo Lane, City"
}
```

---

## 🔗 API Endpoints (For Testing)

### Authentication

```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@eatsgram.com",
  "password": "Admin@123456"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@eatsgram.com",
    "role": "admin"
  }
}
```

### Restaurants

```bash
# Get all restaurants
GET /api/restaurants
Authorization: Bearer {token}

# Get restaurant by ID
GET /api/restaurants/rest_001
Authorization: Bearer {token}

# Create restaurant
POST /api/restaurants
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Restaurant",
  "email": "new@restaurant.com",
  "phone": "+91-9876543210",
  "address": "123 Main Street"
}
```

### Orders

```bash
# Get all orders
GET /api/orders
Authorization: Bearer {token}

# Get order by ID
GET /api/orders/order_001
Authorization: Bearer {token}

# Create order
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_id": "cust_001",
  "restaurant_id": "rest_001",
  "items": [
    {
      "item_id": "item_001",
      "quantity": 2
    }
  ],
  "delivery_address": "456 Demo Lane"
}
```

### Payments

```bash
# Create payment order
POST /api/payments/create-order
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 876,
  "currency": "INR",
  "order_id": "order_001"
}

# Verify payment
POST /api/payments/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "razorpay_order_id": "order_123",
  "razorpay_payment_id": "pay_123",
  "razorpay_signature": "signature_123"
}
```

---

## 📱 Module URLs

### EatsGram Web
```
URL: http://localhost:3000
Admin Panel: http://localhost:3000/admin
Login: http://localhost:3000/login
```

### EatsGram Admin
```
URL: http://localhost:3001
Login: http://localhost:3001/login
Dashboard: http://localhost:3001/dashboard
```

### EatsGram App
```
URL: http://localhost:3002
Login: http://localhost:3002/login
Home: http://localhost:3002/home
```

### EatsGram Rider
```
URL: http://localhost:3003
Login: http://localhost:3003/login
Dashboard: http://localhost:3003/dashboard
```

### EatsGram Store
```
URL: http://localhost:3004
Login: http://localhost:3004/login
Dashboard: http://localhost:3004/dashboard
```

---

## 🧪 Test Scenarios

### Scenario 1: Complete Order Flow

1. **Customer Login**
   - Email: customer@eatsgram.com
   - Password: Customer@123456

2. **Browse Restaurants**
   - View Demo Restaurant
   - Check menu items

3. **Place Order**
   - Add items to cart
   - Enter delivery address
   - Proceed to payment

4. **Payment**
   - Use Razorpay test card
   - Card: 4111111111111111
   - Expiry: 12/25
   - CVV: 123

5. **Order Confirmation**
   - View order status
   - Track delivery

### Scenario 2: Restaurant Management

1. **Restaurant Login**
   - Email: restaurant@eatsgram.com
   - Password: Restaurant@123456

2. **View Orders**
   - See incoming orders
   - Accept/Reject orders

3. **Manage Menu**
   - Add new items
   - Update prices
   - Mark items unavailable

4. **View Analytics**
   - Order statistics
   - Revenue reports

### Scenario 3: Rider Delivery

1. **Rider Login**
   - Email: rider@eatsgram.com
   - Password: Rider@123456

2. **View Deliveries**
   - See assigned orders
   - View delivery location

3. **Update Status**
   - Mark as picked up
   - Mark as delivered

4. **View Earnings**
   - Daily earnings
   - Total deliveries

### Scenario 4: Admin Management

1. **Admin Login**
   - Email: admin@eatsgram.com
   - Password: Admin@123456

2. **Manage Users**
   - View all users
   - Activate/Deactivate users
   - View user details

3. **Manage Restaurants**
   - Approve restaurants
   - View restaurant details
   - Handle complaints

4. **View Reports**
   - Revenue reports
   - Order statistics
   - User analytics

---

## 🔧 Environment Setup

### Step 1: Create .env.local files

For each module, create `.env.local`:

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

# API
API_URL=http://localhost:3000
API_PORT=3000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Step 2: Install Dependencies

```bash
cd EatsGram-web && npm install
cd ../EatsGram-admin && npm install
cd ../EatsGram-app && npm install
cd ../EatsGram-rider && npm install
cd ../EatsGram-store && npm install
```

### Step 3: Setup Database

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE eatsgram_demo;"

# Create user
mysql -u root -p -e "CREATE USER 'eatsgram_user'@'localhost' IDENTIFIED BY 'EatsGram@Demo123';"

# Grant privileges
mysql -u root -p -e "GRANT ALL PRIVILEGES ON eatsgram_demo.* TO 'eatsgram_user'@'localhost';"

# Run migrations
cd EatsGram-web
npm run migrate
```

### Step 4: Seed Demo Data

```bash
npm run seed
```

### Step 5: Start Modules

```bash
# Terminal 1: Web
cd EatsGram-web && npm start

# Terminal 2: Admin
cd EatsGram-admin && npm start

# Terminal 3: App
cd EatsGram-app && npm start

# Terminal 4: Rider
cd EatsGram-rider && npm start

# Terminal 5: Store
cd EatsGram-store && npm start
```

---

## 🧪 Postman Collection

### Import Collection

```json
{
  "info": {
    "name": "EatsGram Demo API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Admin Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"admin@eatsgram.com\",\"password\":\"Admin@123456\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## ⚠️ Important Notes

1. **Test Mode Only**: These credentials are for demo/testing purposes only
2. **Change Passwords**: Change all passwords before production deployment
3. **Secure Secrets**: Never commit secrets to version control
4. **Use .env.local**: Always use `.env.local` for sensitive data
5. **Test Cards**: Use Razorpay test cards for payment testing
6. **Webhook Testing**: Use ngrok for local webhook testing

---

## 🔐 Security Checklist

- ✅ Use strong passwords in production
- ✅ Enable HTTPS in production
- ✅ Rotate API keys regularly
- ✅ Use environment variables for secrets
- ✅ Enable rate limiting
- ✅ Implement CORS properly
- ✅ Validate all inputs
- ✅ Use prepared statements
- ✅ Enable logging and monitoring
- ✅ Regular security audits

---

## 📞 Support

For issues or questions:
- Check documentation: `./integrations/README.md`
- Review API docs: `./integrations/INTEGRATION_GUIDE.md`
- Check logs: `npm run logs`

---

## 🎉 Ready to Test!

All credentials are set up and ready for testing. Start with the admin login and explore all modules!

**Happy Testing! 🚀**

