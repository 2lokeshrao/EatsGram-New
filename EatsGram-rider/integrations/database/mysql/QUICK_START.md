# 🚀 MySQL Integration - Quick Start Guide

EatsGram में MySQL को 30 मिनट में setup करने के लिए guide।

---

## ⚡ 5-Minute Setup

### Step 1: MySQL Install करें (5 मिनट)

#### Windows:
```bash
# Download करें: https://dev.mysql.com/downloads/mysql/
# या Chocolatey से:
choco install mysql
```

#### macOS:
```bash
brew install mysql
brew services start mysql
```

#### Linux:
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### Verify करें:
```bash
mysql --version
mysql -u root -p
```

---

## 🔧 Backend Setup (10 मिनट)

### Step 1: Packages Install करें

```bash
cd EatsGram-backend

# Sequelize के साथ (Recommended)
npm install sequelize mysql2

# या TypeORM के साथ
npm install typeorm mysql
```

### Step 2: Environment Variables Setup

```bash
# .env file में add करें:

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=eatsgram_db
DB_DIALECT=mysql
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_LOGGING=false
```

### Step 3: Database Create करें

```bash
# MySQL में login करें
mysql -u root -p

# Database बनाएं
CREATE DATABASE eatsgram_db;
USE eatsgram_db;

# Character set set करें
ALTER DATABASE eatsgram_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit करें
EXIT;
```

### Step 4: Configuration File बनाएं

```bash
# File बनाएं
touch src/config/database.js
```

```javascript
// src/config/database.js

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 30000,
    },
  }
);

module.exports = sequelize;
```

### Step 5: Models बनाएं

```bash
# Directory बनाएं
mkdir -p src/models
```

```javascript
// src/models/User.js

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
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  phone: DataTypes.STRING,
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

### Step 6: Sync करें

```javascript
// src/app.js में add करें

const sequelize = require('./config/database');

// Server start करने से पहले
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully!');
  })
  .catch((error) => {
    console.error('Database sync error:', error);
  });
```

---

## 📊 Database Tables Create करें

### SQL Script

```sql
-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  phone VARCHAR(20),
  role ENUM('customer', 'restaurant', 'rider', 'admin') DEFAULT 'customer',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Restaurants Table
CREATE TABLE restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500),
  city VARCHAR(100),
  phone VARCHAR(20),
  rating DECIMAL(3, 2) DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_city (city)
);

-- Orders Table
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customerId INT NOT NULL,
  restaurantId INT NOT NULL,
  totalAmount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'on_way', 'delivered', 'cancelled') DEFAULT 'pending',
  paymentStatus ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  paymentMethod ENUM('card', 'wallet', 'cash', 'razorpay') DEFAULT 'card',
  razorpayOrderId VARCHAR(255),
  razorpayPaymentId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_customerId (customerId)
);

-- Food Items Table
CREATE TABLE food_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  isVegetarian BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurantId (restaurantId)
);

-- Payments Table
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paymentMethod ENUM('card', 'wallet', 'cash', 'razorpay') NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  razorpayOrderId VARCHAR(255),
  razorpayPaymentId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_status (status)
);
```

---

## 🧪 Testing

### Test करें

```bash
# MySQL में login करें
mysql -u root -p eatsgram_db

# Tables verify करें
SHOW TABLES;

# User table structure देखें
DESCRIBE users;

# Sample data insert करें
INSERT INTO users (email, password, firstName, lastName, role)
VALUES ('test@example.com', 'hashed_password', 'John', 'Doe', 'customer');

# Data verify करें
SELECT * FROM users;
```

---

## 🔄 MongoDB से MySQL में Migrate करें

### Migration Script

```javascript
// scripts/migrate-to-mysql.js

const mongoose = require('mongoose');
const sequelize = require('../src/config/database');
const User = require('../src/models/User');

async function migrate() {
  try {
    // MongoDB से data fetch करें
    const mongoUsers = await mongoose.model('User').find();
    
    console.log(`Migrating ${mongoUsers.length} users...`);
    
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
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();
```

### Run करें

```bash
node scripts/migrate-to-mysql.js
```

---

## 🔑 GraphQL Integration

### Query बनाएं

```graphql
query {
  getUser(id: 1) {
    id
    email
    firstName
    lastName
    role
  }
}
```

### Resolver बनाएं

```javascript
// src/graphql/resolvers/user.resolver.js

const User = require('../../models/User');

const userResolvers = {
  Query: {
    getUser: async (_, { id }) => {
      return await User.findByPk(id);
    },
    
    getAllUsers: async () => {
      return await User.findAll();
    },
  },
  
  Mutation: {
    createUser: async (_, { email, password, firstName, lastName }) => {
      return await User.create({
        email,
        password,
        firstName,
        lastName,
      });
    },
    
    updateUser: async (_, { id, firstName, lastName }) => {
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');
      
      return await user.update({ firstName, lastName });
    },
    
    deleteUser: async (_, { id }) => {
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');
      
      await user.destroy();
      return true;
    },
  },
};

module.exports = userResolvers;
```

---

## 📈 Performance Tips

### 1. Indexes बनाएं

```sql
-- Frequently searched columns पर
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_status ON orders(status);
CREATE INDEX idx_customerId ON orders(customerId);
```

### 2. Connection Pooling

```javascript
// पहले से configured है config/database.js में
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

// ❌ Bad: Select all columns
const users = await User.findAll();
```

---

## 🐛 Common Issues

### Issue 1: Connection Refused

```
❌ Error: connect ECONNREFUSED 127.0.0.1:3306
✅ Solution:
   1. MySQL service start करें
   2. Host और port verify करें
   3. Credentials check करें
```

### Issue 2: Access Denied

```
❌ Error: Access denied for user 'root'@'localhost'
✅ Solution:
   1. Password verify करें
   2. MySQL restart करें
```

### Issue 3: Database Not Found

```
❌ Error: Unknown database 'eatsgram_db'
✅ Solution:
   1. Database create करें
   2. .env में correct name दें
```

---

## 📝 Checklist

- [ ] MySQL installed
- [ ] Database created
- [ ] Packages installed
- [ ] Environment variables setup
- [ ] Configuration file created
- [ ] Models defined
- [ ] Tables created
- [ ] Data migrated (अगर MongoDB से)
- [ ] GraphQL resolvers created
- [ ] Testing completed

---

## 🔗 Useful Commands

```bash
# MySQL service start करें
sudo systemctl start mysql

# MySQL में login करें
mysql -u root -p

# Database list देखें
SHOW DATABASES;

# Tables list देखें
SHOW TABLES;

# Table structure देखें
DESCRIBE table_name;

# Backup लें
mysqldump -u root -p eatsgram_db > backup.sql

# Restore करें
mysql -u root -p eatsgram_db < backup.sql
```

---

## 📚 Next Steps

1. ✅ MySQL install करें
2. ✅ Database create करें
3. ✅ Packages install करें
4. ✅ Configuration setup करें
5. ✅ Models define करें
6. ✅ Tables create करें
7. ✅ Data migrate करें (अगर MongoDB से)
8. ✅ GraphQL resolvers create करें
9. ✅ Testing करें
10. ✅ Production deploy करें

---

**Last Updated**: October 16, 2025
**Time to Complete**: ~30 minutes
**Difficulty Level**: Beginner to Intermediate
