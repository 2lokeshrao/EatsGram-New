/**
 * EatsGram MySQL Database Schema
 * 
 * यह file में सभी tables के लिए SQL statements हैं।
 * इसे MySQL में run करें।
 */

-- ============================================
-- Database Creation
-- ============================================

CREATE DATABASE IF NOT EXISTS eatsgram_db;
USE eatsgram_db;

-- Set character set
ALTER DATABASE eatsgram_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- Users Table
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  phone VARCHAR(20),
  profileImage VARCHAR(500),
  role ENUM('customer', 'restaurant', 'rider', 'admin') DEFAULT 'customer',
  isActive BOOLEAN DEFAULT true,
  lastLogin TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Restaurants Table
-- ============================================

CREATE TABLE IF NOT EXISTS restaurants (
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
  totalOrders INT DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  cuisineType VARCHAR(100),
  deliveryTime INT,
  minimumOrder DECIMAL(10, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_city (city),
  INDEX idx_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Food Items Table
-- ============================================

CREATE TABLE IF NOT EXISTS food_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(500),
  category VARCHAR(100),
  isVegetarian BOOLEAN DEFAULT false,
  isSpicy BOOLEAN DEFAULT false,
  preparationTime INT,
  isActive BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurantId (restaurantId),
  INDEX idx_category (category),
  INDEX idx_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Orders Table
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customerId INT NOT NULL,
  restaurantId INT NOT NULL,
  riderId INT,
  totalAmount DECIMAL(10, 2) NOT NULL,
  deliveryFee DECIMAL(10, 2) DEFAULT 0,
  taxAmount DECIMAL(10, 2) DEFAULT 0,
  discountAmount DECIMAL(10, 2) DEFAULT 0,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'on_way', 'delivered', 'cancelled') DEFAULT 'pending',
  paymentStatus ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  paymentMethod ENUM('card', 'wallet', 'cash', 'razorpay') DEFAULT 'card',
  razorpayOrderId VARCHAR(255),
  razorpayPaymentId VARCHAR(255),
  deliveryAddress TEXT,
  specialInstructions TEXT,
  estimatedDeliveryTime TIMESTAMP NULL,
  actualDeliveryTime TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (riderId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_customerId (customerId),
  INDEX idx_restaurantId (restaurantId),
  INDEX idx_riderId (riderId),
  INDEX idx_status (status),
  INDEX idx_paymentStatus (paymentStatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Order Items Table
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  foodItemId INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  specialInstructions TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (foodItemId) REFERENCES food_items(id) ON DELETE CASCADE,
  INDEX idx_orderId (orderId),
  INDEX idx_foodItemId (foodItemId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Payments Table
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
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
  INDEX idx_orderId (orderId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Reviews Table
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  restaurantId INT NOT NULL,
  customerId INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_restaurantId (restaurantId),
  INDEX idx_customerId (customerId),
  INDEX idx_orderId (orderId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Wallet Table (Optional)
-- ============================================

CREATE TABLE IF NOT EXISTS wallets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Wallet Transactions Table (Optional)
-- ============================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  walletId INT NOT NULL,
  orderId INT,
  type ENUM('credit', 'debit') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (walletId) REFERENCES wallets(id) ON DELETE CASCADE,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_walletId (walletId),
  INDEX idx_orderId (orderId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Coupons Table (Optional)
-- ============================================

CREATE TABLE IF NOT EXISTS coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discountType ENUM('percentage', 'fixed') DEFAULT 'percentage',
  discountValue DECIMAL(10, 2) NOT NULL,
  maxDiscount DECIMAL(10, 2),
  minOrderAmount DECIMAL(10, 2),
  maxUsage INT,
  usageCount INT DEFAULT 0,
  expiryDate TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_code (code),
  INDEX idx_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Notifications Table (Optional)
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  orderId INT,
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Indexes for Performance
-- ============================================

-- Orders by date
CREATE INDEX idx_orders_createdAt ON orders(createdAt);

-- Food items by restaurant and category
CREATE INDEX idx_food_items_restaurant_category ON food_items(restaurantId, category);

-- Reviews by restaurant
CREATE INDEX idx_reviews_restaurant_rating ON reviews(restaurantId, rating);

-- Payments by date
CREATE INDEX idx_payments_createdAt ON payments(createdAt);

-- ============================================
-- Views (Optional)
-- ============================================

-- Restaurant Statistics View
CREATE OR REPLACE VIEW restaurant_stats AS
SELECT 
  r.id,
  r.name,
  COUNT(DISTINCT o.id) as total_orders,
  AVG(r.rating) as avg_rating,
  SUM(o.totalAmount) as total_revenue,
  COUNT(DISTINCT o.customerId) as unique_customers
FROM restaurants r
LEFT JOIN orders o ON r.id = o.restaurantId
GROUP BY r.id, r.name;

-- Customer Order History View
CREATE OR REPLACE VIEW customer_order_history AS
SELECT 
  u.id,
  u.email,
  u.firstName,
  COUNT(o.id) as total_orders,
  SUM(o.totalAmount) as total_spent,
  MAX(o.createdAt) as last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.customerId
WHERE u.role = 'customer'
GROUP BY u.id, u.email, u.firstName;

-- ============================================
-- Stored Procedures (Optional)
-- ============================================

-- Get restaurant details with stats
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetRestaurantDetails(IN restaurantId INT)
BEGIN
  SELECT 
    r.*,
    COUNT(DISTINCT o.id) as total_orders,
    AVG(rv.rating) as avg_rating
  FROM restaurants r
  LEFT JOIN orders o ON r.id = o.restaurantId
  LEFT JOIN reviews rv ON r.id = rv.restaurantId
  WHERE r.id = restaurantId
  GROUP BY r.id;
END //
DELIMITER ;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert sample user
INSERT INTO users (email, password, firstName, lastName, phone, role, isActive)
VALUES ('admin@eatsgram.com', 'hashed_password_here', 'Admin', 'User', '+91-9999999999', 'admin', true);

-- Insert sample restaurant
INSERT INTO restaurants (userId, name, description, address, city, phone, email, rating, isActive, cuisineType, deliveryTime, minimumOrder)
VALUES (1, 'Sample Restaurant', 'A sample restaurant for testing', '123 Main St', 'Mumbai', '+91-8888888888', 'restaurant@eatsgram.com', 4.5, true, 'Indian', 30, 100);

-- ============================================
-- Backup and Restore Commands
-- ============================================

/*
-- Backup database
mysqldump -u root -p eatsgram_db > eatsgram_backup.sql

-- Restore database
mysql -u root -p eatsgram_db < eatsgram_backup.sql

-- Backup specific table
mysqldump -u root -p eatsgram_db orders > orders_backup.sql

-- Restore specific table
mysql -u root -p eatsgram_db < orders_backup.sql
*/

-- ============================================
-- End of Schema
-- ============================================
