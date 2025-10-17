# 🗄️ MySQL Database Integration for EatsGram

EatsGram में MySQL database support add किया गया है। यह MongoDB के alternative के रूप में काम करता है।

---

## 📚 Documentation Files

### 1. **MYSQL_QUICK_START.md** ⚡
**30-minute quick start guide**
- 5-minute MySQL setup
- Backend configuration
- Database creation
- Testing procedures
- Migration from MongoDB
- GraphQL integration

👉 **Start here if you want to get up and running quickly!**

---

### 2. **MYSQL_INTEGRATION_GUIDE.md** 📖
**Complete integration guide**
- Prerequisites and installation
- Configuration setup
- Database schema details
- ORM setup (Sequelize/TypeORM)
- Migration guide
- Connection pooling
- Best practices
- Troubleshooting

👉 **Read this for detailed information about MySQL integration.**

---

### 3. **MYSQL_IMPLEMENTATION_CHECKLIST.md** ✅
**10-phase implementation checklist**
- Planning & preparation
- Installation & setup
- Backend configuration
- Schema & tables
- Data migration
- API integration
- Testing procedures
- Security measures
- Monitoring & optimization
- Production deployment

👉 **Use this to track your implementation progress.**

---

### 4. **MYSQL_TROUBLESHOOTING.md** 🔧
**Comprehensive troubleshooting guide**
- Connection issues & solutions
- Performance troubleshooting
- Data integrity issues
- Migration problems
- Security concerns
- Backup & recovery
- Emergency procedures

👉 **Refer to this when you encounter issues.**

---

### 5. **MYSQL_SUMMARY.txt** 📋
**Summary document**
- Overview of MySQL integration
- Files created
- Database schema
- Implementation steps
- Quick reference
- Statistics

👉 **Quick reference for all MySQL-related information.**

---

## 💻 Code Template Files

### 1. **MYSQL_CONFIG_TEMPLATE.js**
Sequelize configuration template with:
- Connection setup
- Connection testing
- Database synchronization

```javascript
const { sequelize, testConnection, syncDatabase } = require('./config/database');

// Test connection
testConnection();

// Sync database
syncDatabase({ alter: true });
```

---

### 2. **MYSQL_MODELS_TEMPLATE.js**
Complete model definitions for:
- User model
- Restaurant model
- Food Item model
- Order model
- Order Item model
- Payment model
- Review model

```javascript
const {
  createUserModel,
  createRestaurantModel,
  createFoodItemModel,
  createOrderModel,
  createOrderItemModel,
  createPaymentModel,
  createReviewModel,
} = require('./models/templates');
```

---

### 3. **MYSQL_MIGRATION_SCRIPT.js**
MongoDB to MySQL migration script with:
- Data transformation
- Error handling
- Progress tracking
- Statistics reporting

```bash
node MYSQL_MIGRATION_SCRIPT.js
```

---

## 🗄️ Database Schema File

### **MYSQL_SCHEMA.sql**
Complete database schema with:
- 7 core tables (users, restaurants, food_items, orders, order_items, payments, reviews)
- 4 optional tables (wallets, wallet_transactions, coupons, notifications)
- Indexes for performance
- Foreign keys for relationships
- Views for analytics
- Stored procedures

```bash
mysql -u root -p eatsgram_db < MYSQL_SCHEMA.sql
```

---

## ⚙️ Configuration File

### **.env.mysql.example**
Environment variables template with:
- Database connection settings
- Connection pool configuration
- Logging settings
- SSL configuration
- Backup settings
- Performance tuning
- Replication settings
- Monitoring configuration

```bash
cp .env.mysql.example .env
# Edit .env with your configuration
```

---

## 🚀 Quick Start (30 minutes)

### Step 1: Install MySQL (5 minutes)

**Windows:**
```bash
# Download from https://dev.mysql.com/downloads/mysql/
# Or use Chocolatey
choco install mysql
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### Step 2: Create Database (5 minutes)

```bash
mysql -u root -p

CREATE DATABASE eatsgram_db;
ALTER DATABASE eatsgram_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'eatsgram_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON eatsgram_db.* TO 'eatsgram_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### Step 3: Backend Setup (10 minutes)

```bash
cd EatsGram-backend

# Install packages
npm install sequelize mysql2

# Copy environment file
cp .env.mysql.example .env

# Edit .env with your configuration
# DB_HOST=localhost
# DB_USER=eatsgram_user
# DB_PASSWORD=your_password
# DB_NAME=eatsgram_db

# Create tables
mysql -u root -p eatsgram_db < MYSQL_SCHEMA.sql

# Start server
npm start
```

### Step 4: Verify Connection (5 minutes)

```bash
# Test in your application
const { sequelize } = require('./config/database');

sequelize.authenticate()
  .then(() => console.log('✅ Connected to MySQL'))
  .catch(err => console.error('❌ Connection failed:', err));
```

---

## 📊 Database Schema Overview

### Core Tables (7)

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **users** | User accounts | id, email, password, role |
| **restaurants** | Restaurant profiles | id, userId, name, city, rating |
| **food_items** | Menu items | id, restaurantId, name, price |
| **orders** | Customer orders | id, customerId, restaurantId, status |
| **order_items** | Items in orders | id, orderId, foodItemId, quantity |
| **payments** | Payment records | id, orderId, amount, status |
| **reviews** | Customer reviews | id, orderId, restaurantId, rating |

### Optional Tables (4)

| Table | Purpose |
|-------|---------|
| **wallets** | User wallet balances |
| **wallet_transactions** | Wallet transaction history |
| **coupons** | Discount coupons |
| **notifications** | User notifications |

---

## 🔄 Migration from MongoDB

### Automatic Migration

```bash
# Run migration script
node MYSQL_MIGRATION_SCRIPT.js

# Output:
# ✅ Users: 1000
# ✅ Restaurants: 50
# ✅ Food Items: 5000
# ✅ Orders: 10000
# ✅ Payments: 10000
# ✅ Reviews: 5000
```

### Manual Migration

```sql
-- Backup MongoDB
mongodump --db eatsgram

-- Migrate data
-- Use MYSQL_MIGRATION_SCRIPT.js

-- Verify
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders;
```

---

## 🔌 API Integration

### GraphQL Example

```graphql
query {
  getUser(id: 1) {
    id
    email
    firstName
    role
  }
}

mutation {
  createOrder(input: {
    customerId: 1
    restaurantId: 1
    totalAmount: 500
  }) {
    id
    status
  }
}
```

### REST API Example

```bash
# Get user
GET /api/users/1

# Create order
POST /api/orders
{
  "customerId": 1,
  "restaurantId": 1,
  "totalAmount": 500
}

# Get orders
GET /api/orders?customerId=1
```

---

## ⚡ Performance Tips

### 1. Indexing
```sql
-- Create indexes on frequently searched columns
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_status ON orders(status);
CREATE INDEX idx_customerId ON orders(customerId);
```

### 2. Connection Pooling
```javascript
pool: {
  max: 10,      // Maximum connections
  min: 2,       // Minimum connections
  acquire: 30000,
  idle: 30000,
}
```

### 3. Query Optimization
```javascript
// ✅ Good: Select specific columns
const users = await User.findAll({
  attributes: ['id', 'email', 'firstName'],
});

// ✅ Good: Use pagination
const orders = await Order.findAll({
  limit: 10,
  offset: 0,
});

// ✅ Good: Eager loading
const orders = await Order.findAll({
  include: [{ model: User, as: 'customer' }]
});
```

---

## 🔐 Security Best Practices

✅ Use strong passwords
✅ Limit user privileges
✅ Use parameterized queries
✅ Validate input data
✅ Enable SSL connections
✅ Encrypt sensitive data
✅ Hash passwords
✅ Rotate credentials regularly
✅ Monitor access logs
✅ Use environment variables for secrets

---

## 🆘 Troubleshooting

### Connection Refused
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql
```

### Access Denied
```bash
# Verify credentials
mysql -u eatsgram_user -p eatsgram_db

# Reset password
ALTER USER 'eatsgram_user'@'localhost' IDENTIFIED BY 'new_password';
```

### Slow Queries
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Analyze query
EXPLAIN SELECT * FROM orders WHERE customerId = 1;

-- Add index
CREATE INDEX idx_customerId ON orders(customerId);
```

For more troubleshooting, see **MYSQL_TROUBLESHOOTING.md**

---

## 📞 Support & Resources

### Documentation
- [MYSQL_QUICK_START.md](./MYSQL_QUICK_START.md) - 30-minute quick start
- [MYSQL_INTEGRATION_GUIDE.md](./MYSQL_INTEGRATION_GUIDE.md) - Complete guide
- [MYSQL_IMPLEMENTATION_CHECKLIST.md](./MYSQL_IMPLEMENTATION_CHECKLIST.md) - Implementation checklist
- [MYSQL_TROUBLESHOOTING.md](./MYSQL_TROUBLESHOOTING.md) - Troubleshooting guide
- [MYSQL_SUMMARY.txt](./MYSQL_SUMMARY.txt) - Summary document

### External Resources
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Sequelize Documentation](https://sequelize.org/)
- [Stack Overflow MySQL](https://stackoverflow.com/questions/tagged/mysql)
- [MySQL Community Forums](https://forums.mysql.com/)

---

## 📋 Checklist

- [ ] MySQL installed
- [ ] Database created
- [ ] User created with privileges
- [ ] Packages installed (sequelize, mysql2)
- [ ] Environment variables configured
- [ ] Database schema created
- [ ] Models defined
- [ ] Connection tested
- [ ] Data migrated (if from MongoDB)
- [ ] APIs tested
- [ ] Performance optimized
- [ ] Security measures implemented
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Production deployment ready

---

## 🎯 Next Steps

1. **Read** [MYSQL_QUICK_START.md](./MYSQL_QUICK_START.md) for 30-minute setup
2. **Follow** [MYSQL_IMPLEMENTATION_CHECKLIST.md](./MYSQL_IMPLEMENTATION_CHECKLIST.md) for complete implementation
3. **Use** [MYSQL_CONFIG_TEMPLATE.js](./MYSQL_CONFIG_TEMPLATE.js) for configuration
4. **Use** [MYSQL_MODELS_TEMPLATE.js](./MYSQL_MODELS_TEMPLATE.js) for models
5. **Run** [MYSQL_MIGRATION_SCRIPT.js](./MYSQL_MIGRATION_SCRIPT.js) for data migration
6. **Refer** [MYSQL_TROUBLESHOOTING.md](./MYSQL_TROUBLESHOOTING.md) for issues
7. **Review** [MYSQL_INTEGRATION_GUIDE.md](./MYSQL_INTEGRATION_GUIDE.md) for detailed information

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Files Created | 10 |
| Total Size | ~98 KB |
| Documentation | 5 files (~53 KB) |
| Code Templates | 3 files (~32 KB) |
| Configuration | 1 file (~3.5 KB) |
| Database Schema | 1 file (~8 KB) |
| Core Tables | 7 |
| Optional Tables | 4 |
| Total Indexes | 20+ |
| Foreign Keys | 15+ |
| Implementation Time | 4-6 hours |
| Difficulty Level | Intermediate |

---

## 🎉 Features

✅ Complete MySQL schema with 7 core tables
✅ Sequelize ORM integration
✅ Connection pooling configured
✅ Migration script from MongoDB to MySQL
✅ GraphQL & REST API support
✅ Comprehensive documentation
✅ Troubleshooting guide
✅ Performance optimization tips
✅ Security best practices
✅ Backup & recovery procedures
✅ Production deployment guide
✅ Monitoring & alerting setup

---

## 📝 License

This MySQL integration is part of the EatsGram project.

---

## 👥 Contributing

Contributions are welcome! Please refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📞 Contact

For questions or support, please open an issue on GitHub or contact the EatsGram team.

---

**Last Updated**: October 16, 2025
**Status**: Ready for Implementation
**Version**: 1.0

---

## 🚀 Ready to Get Started?

👉 **Start with [MYSQL_QUICK_START.md](./MYSQL_QUICK_START.md) for a 30-minute setup!**

