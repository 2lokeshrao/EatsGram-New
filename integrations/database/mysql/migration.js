/**
 * MySQL Migration Script
 * 
 * MongoDB से MySQL में data migrate करने के लिए script।
 * 
 * Usage:
 * node MYSQL_MIGRATION_SCRIPT.js
 */

const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// ============================================
// Configuration
// ============================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eatsgram';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'eatsgram_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

// ============================================
// Migration Statistics
// ============================================

const stats = {
  users: 0,
  restaurants: 0,
  foodItems: 0,
  orders: 0,
  orderItems: 0,
  payments: 0,
  reviews: 0,
  errors: [],
};

// ============================================
// Helper Functions
// ============================================

const logProgress = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  }[type] || '📝';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// Migration Functions
// ============================================

/**
 * Migrate Users
 */
const migrateUsers = async (User, mongoUsers) => {
  logProgress('Starting user migration...', 'info');
  
  try {
    for (const user of mongoUsers) {
      try {
        await User.create({
          email: user.email,
          password: user.password,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          profileImage: user.profileImage || '',
          role: user.role || 'customer',
          isActive: user.isActive !== false,
          lastLogin: user.lastLogin || null,
        });
        stats.users++;
      } catch (error) {
        stats.errors.push(`User ${user.email}: ${error.message}`);
      }
    }
    
    logProgress(`Migrated ${stats.users} users`, 'success');
  } catch (error) {
    logProgress(`User migration error: ${error.message}`, 'error');
    throw error;
  }
};

/**
 * Migrate Restaurants
 */
const migrateRestaurants = async (Restaurant, User, mongoRestaurants) => {
  logProgress('Starting restaurant migration...', 'info');
  
  try {
    for (const restaurant of mongoRestaurants) {
      try {
        // Find user by email
        const user = await User.findOne({
          where: { email: restaurant.ownerEmail }
        });
        
        if (!user) {
          stats.errors.push(`Restaurant ${restaurant.name}: Owner not found`);
          continue;
        }
        
        await Restaurant.create({
          userId: user.id,
          name: restaurant.name,
          description: restaurant.description || '',
          address: restaurant.address || '',
          city: restaurant.city || '',
          latitude: restaurant.latitude || null,
          longitude: restaurant.longitude || null,
          phone: restaurant.phone || '',
          email: restaurant.email || '',
          logo: restaurant.logo || '',
          banner: restaurant.banner || '',
          rating: restaurant.rating || 0,
          totalOrders: restaurant.totalOrders || 0,
          isActive: restaurant.isActive !== false,
          cuisineType: restaurant.cuisineType || '',
          deliveryTime: restaurant.deliveryTime || 30,
          minimumOrder: restaurant.minimumOrder || 0,
        });
        stats.restaurants++;
      } catch (error) {
        stats.errors.push(`Restaurant ${restaurant.name}: ${error.message}`);
      }
    }
    
    logProgress(`Migrated ${stats.restaurants} restaurants`, 'success');
  } catch (error) {
    logProgress(`Restaurant migration error: ${error.message}`, 'error');
    throw error;
  }
};

/**
 * Migrate Food Items
 */
const migrateFoodItems = async (FoodItem, Restaurant, mongoFoodItems) => {
  logProgress('Starting food items migration...', 'info');
  
  try {
    for (const item of mongoFoodItems) {
      try {
        // Find restaurant
        const restaurant = await Restaurant.findOne({
          where: { name: item.restaurantName }
        });
        
        if (!restaurant) {
          stats.errors.push(`Food Item ${item.name}: Restaurant not found`);
          continue;
        }
        
        await FoodItem.create({
          restaurantId: restaurant.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image || '',
          category: item.category || '',
          isVegetarian: item.isVegetarian || false,
          isSpicy: item.isSpicy || false,
          preparationTime: item.preparationTime || 15,
          isActive: item.isActive !== false,
          rating: item.rating || 0,
        });
        stats.foodItems++;
      } catch (error) {
        stats.errors.push(`Food Item ${item.name}: ${error.message}`);
      }
    }
    
    logProgress(`Migrated ${stats.foodItems} food items`, 'success');
  } catch (error) {
    logProgress(`Food items migration error: ${error.message}`, 'error');
    throw error;
  }
};

/**
 * Migrate Orders
 */
const migrateOrders = async (Order, User, Restaurant, mongoOrders) => {
  logProgress('Starting orders migration...', 'info');
  
  try {
    for (const order of mongoOrders) {
      try {
        // Find customer
        const customer = await User.findOne({
          where: { email: order.customerEmail }
        });
        
        if (!customer) {
          stats.errors.push(`Order ${order._id}: Customer not found`);
          continue;
        }
        
        // Find restaurant
        const restaurant = await Restaurant.findOne({
          where: { name: order.restaurantName }
        });
        
        if (!restaurant) {
          stats.errors.push(`Order ${order._id}: Restaurant not found`);
          continue;
        }
        
        // Find rider if exists
        let riderId = null;
        if (order.riderEmail) {
          const rider = await User.findOne({
            where: { email: order.riderEmail }
          });
          riderId = rider ? rider.id : null;
        }
        
        await Order.create({
          customerId: customer.id,
          restaurantId: restaurant.id,
          riderId: riderId,
          totalAmount: order.totalAmount,
          deliveryFee: order.deliveryFee || 0,
          taxAmount: order.taxAmount || 0,
          discountAmount: order.discountAmount || 0,
          status: order.status || 'pending',
          paymentStatus: order.paymentStatus || 'pending',
          paymentMethod: order.paymentMethod || 'card',
          razorpayOrderId: order.razorpayOrderId || null,
          razorpayPaymentId: order.razorpayPaymentId || null,
          deliveryAddress: order.deliveryAddress || '',
          specialInstructions: order.specialInstructions || '',
          estimatedDeliveryTime: order.estimatedDeliveryTime || null,
          actualDeliveryTime: order.actualDeliveryTime || null,
        });
        stats.orders++;
      } catch (error) {
        stats.errors.push(`Order ${order._id}: ${error.message}`);
      }
    }
    
    logProgress(`Migrated ${stats.orders} orders`, 'success');
  } catch (error) {
    logProgress(`Orders migration error: ${error.message}`, 'error');
    throw error;
  }
};

/**
 * Migrate Payments
 */
const migratePayments = async (Payment, Order, mongoPayments) => {
  logProgress('Starting payments migration...', 'info');
  
  try {
    for (const payment of mongoPayments) {
      try {
        // Find order
        const order = await Order.findOne({
          where: { razorpayOrderId: payment.razorpayOrderId }
        });
        
        if (!order) {
          stats.errors.push(`Payment ${payment._id}: Order not found`);
          continue;
        }
        
        await Payment.create({
          orderId: order.id,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod || 'card',
          status: payment.status || 'pending',
          razorpayOrderId: payment.razorpayOrderId || null,
          razorpayPaymentId: payment.razorpayPaymentId || null,
          razorpaySignature: payment.razorpaySignature || null,
          transactionId: payment.transactionId || null,
          errorMessage: payment.errorMessage || null,
        });
        stats.payments++;
      } catch (error) {
        stats.errors.push(`Payment ${payment._id}: ${error.message}`);
      }
    }
    
    logProgress(`Migrated ${stats.payments} payments`, 'success');
  } catch (error) {
    logProgress(`Payments migration error: ${error.message}`, 'error');
    throw error;
  }
};

/**
 * Migrate Reviews
 */
const migrateReviews = async (Review, Order, User, Restaurant, mongoReviews) => {
  logProgress('Starting reviews migration...', 'info');
  
  try {
    for (const review of mongoReviews) {
      try {
        // Find order
        const order = await Order.findOne({
          where: { razorpayOrderId: review.orderId }
        });
        
        if (!order) {
          stats.errors.push(`Review ${review._id}: Order not found`);
          continue;
        }
        
        await Review.create({
          orderId: order.id,
          restaurantId: order.restaurantId,
          customerId: order.customerId,
          rating: review.rating,
          comment: review.comment || '',
        });
        stats.reviews++;
      } catch (error) {
        stats.errors.push(`Review ${review._id}: ${error.message}`);
      }
    }
    
    logProgress(`Migrated ${stats.reviews} reviews`, 'success');
  } catch (error) {
    logProgress(`Reviews migration error: ${error.message}`, 'error');
    throw error;
  }
};

// ============================================
// Main Migration Function
// ============================================

const runMigration = async () => {
  try {
    logProgress('Starting MongoDB to MySQL migration...', 'info');
    logProgress('='.repeat(50), 'info');
    
    // Connect to MongoDB
    logProgress('Connecting to MongoDB...', 'info');
    await mongoose.connect(MONGODB_URI);
    logProgress('Connected to MongoDB', 'success');
    
    // Connect to MySQL
    logProgress('Connecting to MySQL...', 'info');
    await sequelize.authenticate();
    logProgress('Connected to MySQL', 'success');
    
    // Define models
    const { DataTypes } = require('sequelize');
    
    const User = sequelize.define('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      phone: DataTypes.STRING,
      profileImage: DataTypes.STRING,
      role: { type: DataTypes.ENUM('customer', 'restaurant', 'rider', 'admin'), defaultValue: 'customer' },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      lastLogin: DataTypes.DATE,
    }, { tableName: 'users', timestamps: true });
    
    const Restaurant = sequelize.define('Restaurant', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      description: DataTypes.TEXT,
      address: DataTypes.STRING,
      city: DataTypes.STRING,
      latitude: DataTypes.DECIMAL(10, 8),
      longitude: DataTypes.DECIMAL(11, 8),
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      logo: DataTypes.STRING,
      banner: DataTypes.STRING,
      rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
      totalOrders: { type: DataTypes.INTEGER, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      cuisineType: DataTypes.STRING,
      deliveryTime: DataTypes.INTEGER,
      minimumOrder: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    }, { tableName: 'restaurants', timestamps: true });
    
    const FoodItem = sequelize.define('FoodItem', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      restaurantId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      description: DataTypes.TEXT,
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      image: DataTypes.STRING,
      category: DataTypes.STRING,
      isVegetarian: { type: DataTypes.BOOLEAN, defaultValue: false },
      isSpicy: { type: DataTypes.BOOLEAN, defaultValue: false },
      preparationTime: DataTypes.INTEGER,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    }, { tableName: 'food_items', timestamps: true });
    
    const Order = sequelize.define('Order', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      customerId: { type: DataTypes.INTEGER, allowNull: false },
      restaurantId: { type: DataTypes.INTEGER, allowNull: false },
      riderId: DataTypes.INTEGER,
      totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      deliveryFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      taxAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      discountAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      status: { type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'on_way', 'delivered', 'cancelled'), defaultValue: 'pending' },
      paymentStatus: { type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'), defaultValue: 'pending' },
      paymentMethod: { type: DataTypes.ENUM('card', 'wallet', 'cash', 'razorpay'), defaultValue: 'card' },
      razorpayOrderId: DataTypes.STRING,
      razorpayPaymentId: DataTypes.STRING,
      deliveryAddress: DataTypes.TEXT,
      specialInstructions: DataTypes.TEXT,
      estimatedDeliveryTime: DataTypes.DATE,
      actualDeliveryTime: DataTypes.DATE,
    }, { tableName: 'orders', timestamps: true });
    
    const Payment = sequelize.define('Payment', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      orderId: { type: DataTypes.INTEGER, allowNull: false },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      paymentMethod: { type: DataTypes.ENUM('card', 'wallet', 'cash', 'razorpay'), allowNull: false },
      status: { type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'), defaultValue: 'pending' },
      razorpayOrderId: DataTypes.STRING,
      razorpayPaymentId: DataTypes.STRING,
      razorpaySignature: DataTypes.STRING,
      transactionId: DataTypes.STRING,
      errorMessage: DataTypes.TEXT,
    }, { tableName: 'payments', timestamps: true });
    
    const Review = sequelize.define('Review', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      orderId: { type: DataTypes.INTEGER, allowNull: false },
      restaurantId: { type: DataTypes.INTEGER, allowNull: false },
      customerId: { type: DataTypes.INTEGER, allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false },
      comment: DataTypes.TEXT,
    }, { tableName: 'reviews', timestamps: true });
    
    // Sync tables
    logProgress('Syncing database tables...', 'info');
    await sequelize.sync({ alter: true });
    logProgress('Database tables synced', 'success');
    
    // Get MongoDB data
    logProgress('Fetching data from MongoDB...', 'info');
    const mongoUsers = await mongoose.model('User').find().lean();
    const mongoRestaurants = await mongoose.model('Restaurant').find().lean();
    const mongoFoodItems = await mongoose.model('FoodItem').find().lean();
    const mongoOrders = await mongoose.model('Order').find().lean();
    const mongoPayments = await mongoose.model('Payment').find().lean();
    const mongoReviews = await mongoose.model('Review').find().lean();
    
    logProgress(`Found ${mongoUsers.length} users`, 'info');
    logProgress(`Found ${mongoRestaurants.length} restaurants`, 'info');
    logProgress(`Found ${mongoFoodItems.length} food items`, 'info');
    logProgress(`Found ${mongoOrders.length} orders`, 'info');
    logProgress(`Found ${mongoPayments.length} payments`, 'info');
    logProgress(`Found ${mongoReviews.length} reviews`, 'info');
    
    // Migrate data
    logProgress('='.repeat(50), 'info');
    await migrateUsers(User, mongoUsers);
    await sleep(1000);
    
    await migrateRestaurants(Restaurant, User, mongoRestaurants);
    await sleep(1000);
    
    await migrateFoodItems(FoodItem, Restaurant, mongoFoodItems);
    await sleep(1000);
    
    await migrateOrders(Order, User, Restaurant, mongoOrders);
    await sleep(1000);
    
    await migratePayments(Payment, Order, mongoPayments);
    await sleep(1000);
    
    await migrateReviews(Review, Order, User, Restaurant, mongoReviews);
    
    // Print summary
    logProgress('='.repeat(50), 'info');
    logProgress('Migration Summary:', 'success');
    logProgress(`✅ Users: ${stats.users}`, 'success');
    logProgress(`✅ Restaurants: ${stats.restaurants}`, 'success');
    logProgress(`✅ Food Items: ${stats.foodItems}`, 'success');
    logProgress(`✅ Orders: ${stats.orders}`, 'success');
    logProgress(`✅ Payments: ${stats.payments}`, 'success');
    logProgress(`✅ Reviews: ${stats.reviews}`, 'success');
    
    if (stats.errors.length > 0) {
      logProgress(`⚠️ Errors: ${stats.errors.length}`, 'warning');
      stats.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
    
    logProgress('='.repeat(50), 'info');
    logProgress('Migration completed successfully!', 'success');
    
  } catch (error) {
    logProgress(`Migration failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  } finally {
    // Close connections
    await mongoose.disconnect();
    await sequelize.close();
    process.exit(0);
  }
};

// ============================================
// Run Migration
// ============================================

runMigration();
