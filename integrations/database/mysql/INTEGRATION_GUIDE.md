# 🗄️ MySQL Database Integration Guide

EatsGram में MySQL database support add करने के लिए complete guide।

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Database Schema](#database-schema)
5. [ORM Setup (Sequelize/TypeORM)](#orm-setup)
6. [Migration Guide](#migration-guide)
7. [Connection Pooling](#connection-pooling)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### MySQL Installation

#### Windows:
```bash
# Download from: https://dev.mysql.com/downloads/mysql/
# या MySQL Community Server install करें
```

#### macOS:
```bash
brew install mysql
brew services start mysql
```

#### Linux (Ubuntu):
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### Verify Installation:
```bash
mysql --version
mysql -u root -p
```

---

## Installation

### Step 1: Required Packages Install करें

```bash
cd EatsGram-backend  # या जहाँ backend है

# Sequelize के साथ (Recommended)
npm install sequelize mysql2

# या TypeORM के साथ
npm install typeorm mysql

# Database migration के लिए
npm install db-migrate db-migrate-mysql
```

### Step 2: Environment Variables Setup

```bash
# .env file में add करें:

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=eatsgram_db
DB_DIALECT=mysql

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000

# Logging
DB_LOGGING=false  # true for development
```

---

## Configuration

### Sequelize Configuration

```javascript
// config/database.js

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: 30000,
      idle: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
    },
    timezone: '+05:30', // IST
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

module.exports = sequelize;
```

### TypeORM Configuration

```javascript
// config/database.ts

import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.DB_LOGGING === 'true',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});
```

---

## Database Schema

### Create Database

```sql
-- MySQL में database बनाएं
CREATE DATABASE IF NOT EXISTS eatsgram_db;
USE eatsgram_db;

-- Character set set करें
ALTER DATABASE eatsgram_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  phone VARCHAR(20),
  profileImage VARCHAR(500),
  role ENUM('customer', 'restaurant', 'rider', 'admin') DEFAULT 'customer',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

#### Restaurants Table
```sql
CREATE TABLE restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(255),
  logo VARCHAR(500),
  banner VARCHAR(500),
  rating DECIMAL(3, 2) DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_city (city),
  INDEX idx_active (isActive)
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customerId INT NOT NULL,
  restaurantId INT NOT NULL,
  riderId INT,
  totalAmount DECIMAL(10, 2) NOT NULL,
  deliveryFee DECIMAL(10, 2),
  taxAmount DECIMAL(10, 2),
  discountAmount DECIMAL(10, 2),
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'on_way', 'delivered', 'cancelled') DEFAULT 'pending',
  paymentStatus ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  paymentMethod ENUM('card', 'wallet', 'cash', 'razorpay') DEFAULT 'card',
  razorpayOrderId VARCHAR(255),
  razorpayPaymentId VARCHAR(255),
  deliveryAddress TEXT,
  specialInstructions TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (riderId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_paymentStatus (paymentStatus),
  INDEX idx_customerId (customerId),
  INDEX idx_restaurantId (restaurantId)
);
```

#### Order Items Table
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  foodItemId INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  specialInstructions TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_orderId (orderId)
);
```

#### Food Items Table
```sql
CREATE TABLE food_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(500),
  category VARCHAR(100),
  isVegetarian BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurantId (restaurantId),
  INDEX idx_category (category)
);
```

#### Payments Table
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paymentMethod ENUM('card', 'wallet', 'cash', 'razorpay') NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  razorpayOrderId VARCHAR(255),
  razorpayPaymentId VARCHAR(255),
  razorpaySignature VARCHAR(255),
  transactionId VARCHAR(255),
  errorMessage TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_orderId (orderId)
);
```

#### Reviews Table
```sql
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  restaurantId INT NOT NULL,
  customerId INT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_restaurantId (restaurantId),
  INDEX idx_customerId (customerId)
);
```

---

## ORM Setup

### Sequelize Models

#### User Model
```javascript
// models/User.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  phone: DataTypes.STRING,
  profileImage: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM('customer', 'restaurant', 'rider', 'admin'),
    defaultValue: 'customer',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
```

#### Order Model
```javascript
// models/Order.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'on_way', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.ENUM('card', 'wallet', 'cash', 'razorpay'),
    defaultValue: 'card',
  },
  razorpayOrderId: DataTypes.STRING,
  razorpayPaymentId: DataTypes.STRING,
}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;
```

---

## Migration Guide

### MongoDB से MySQL में Migrate करें

```javascript
// scripts/migrate-mongo-to-mysql.js

const mongoose = require('mongoose');
const sequelize = require('../config/database');
const User = require('../models/User');
const Order = require('../models/Order');

async function migrateData() {
  try {
    // MongoDB से data fetch करें
    const mongoUsers = await mongoose.model('User').find();
    
    // MySQL में insert करें
    for (const user of mongoUsers) {
      await User.create({
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      });
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrateData();
```

---

## Connection Pooling

### Connection Pool Configuration

```javascript
// config/pool.js

const pool = {
  max: 10,           // Maximum connections
  min: 2,            // Minimum connections
  acquire: 30000,    // Acquire timeout (ms)
  idle: 30000,       // Idle timeout (ms)
};

module.exports = pool;
```

### Health Check

```javascript
// middleware/dbHealthCheck.js

const sequelize = require('../config/database');

const dbHealthCheck = async (req, res, next) => {
  try {
    await sequelize.authenticate();
    next();
  } catch (error) {
    res.status(503).json({
      error: 'Database connection failed',
      message: error.message,
    });
  }
};

module.exports = dbHealthCheck;
```

---

## Best Practices

### 1. Connection Management
```javascript
// ✅ Good: Use connection pooling
const sequelize = new Sequelize(dbName, user, password, {
  pool: { max: 10, min: 2 },
});

// ❌ Bad: Create new connection for each query
const connection = mysql.createConnection({...});
```

### 2. Query Optimization
```javascript
// ✅ Good: Use indexes
CREATE INDEX idx_email ON users(email);

// ✅ Good: Use pagination
const users = await User.findAll({
  limit: 10,
  offset: 0,
});

// ❌ Bad: Fetch all records
const users = await User.findAll();
```

### 3. Error Handling
```javascript
// ✅ Good: Proper error handling
try {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error('User not found');
  }
} catch (error) {
  console.error('Database error:', error);
  res.status(500).json({ error: error.message });
}
```

### 4. Data Validation
```javascript
// ✅ Good: Validate before insert
const user = await User.create({
  email: req.body.email,
  password: hashedPassword,
}, {
  validate: true,
});
```

### 5. Transactions
```javascript
// ✅ Good: Use transactions for multiple operations
const transaction = await sequelize.transaction();
try {
  const order = await Order.create(orderData, { transaction });
  await Payment.create(paymentData, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

---

## Troubleshooting

### Issue 1: Connection Refused

```
❌ Error: connect ECONNREFUSED 127.0.0.1:3306
✅ Solution:
   1. MySQL service को start करें
   2. Host और port verify करें
   3. Credentials check करें
```

### Issue 2: Access Denied

```
❌ Error: Access denied for user 'root'@'localhost'
✅ Solution:
   1. Password verify करें
   2. User permissions check करें
   3. MySQL को restart करें
```

### Issue 3: Database Not Found

```
❌ Error: Unknown database 'eatsgram_db'
✅ Solution:
   1. Database create करें: CREATE DATABASE eatsgram_db;
   2. .env में correct database name दें
```

### Issue 4: Connection Pool Exhausted

```
❌ Error: Connection pool is exhausted
✅ Solution:
   1. Pool size increase करें
   2. Idle timeout check करें
   3. Connection leaks find करें
```

---

## Performance Tips

### 1. Indexing Strategy
```sql
-- Frequently searched columns पर index बनाएं
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_status ON orders(status);
CREATE INDEX idx_customerId ON orders(customerId);
```

### 2. Query Optimization
```javascript
// ✅ Good: Select specific columns
const users = await User.findAll({
  attributes: ['id', 'email', 'firstName'],
});

// ❌ Bad: Select all columns
const users = await User.findAll();
```

### 3. Caching
```javascript
// ✅ Good: Cache frequently accessed data
const redis = require('redis');
const client = redis.createClient();

const getUser = async (id) => {
  const cached = await client.get(`user:${id}`);
  if (cached) return JSON.parse(cached);
  
  const user = await User.findByPk(id);
  await client.setex(`user:${id}`, 3600, JSON.stringify(user));
  return user;
};
```

---

## MongoDB vs MySQL Comparison

| Feature | MongoDB | MySQL |
|---------|---------|-------|
| Type | NoSQL | Relational |
| Schema | Flexible | Fixed |
| Transactions | Limited | Full ACID |
| Scalability | Horizontal | Vertical |
| Query Language | MQL | SQL |
| Joins | Limited | Full support |
| Indexing | Supported | Supported |
| Performance | Fast reads | Fast writes |

---

## Migration Checklist

- [ ] MySQL installed और running
- [ ] Database created
- [ ] Tables created
- [ ] Sequelize/TypeORM configured
- [ ] Models defined
- [ ] Connection pooling setup
- [ ] Data migrated from MongoDB
- [ ] Indexes created
- [ ] Performance tested
- [ ] Backup strategy implemented

---

## Useful Links

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Sequelize Documentation](https://sequelize.org/)
- [TypeORM Documentation](https://typeorm.io/)
- [MySQL Best Practices](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)

---

**Last Updated**: October 16, 2025
**Maintained by**: EatsGram Team
