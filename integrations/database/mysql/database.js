/**
 * MySQL Database Class
 * Handles all MySQL database operations
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

class MySQLDatabase {
  constructor() {
    this.sequelize = null;
    this.models = {};
  }

  /**
   * Connect to MySQL Database
   */
  async connect() {
    try {
      this.sequelize = new Sequelize(
        process.env.MYSQL_DATABASE || 'eatsgram',
        process.env.MYSQL_USER || 'root',
        process.env.MYSQL_PASSWORD || '',
        {
          host: process.env.MYSQL_HOST || 'localhost',
          port: process.env.MYSQL_PORT || 3306,
          dialect: 'mysql',
          logging: process.env.NODE_ENV === 'development' ? console.log : false,
          pool: {
            max: parseInt(process.env.MYSQL_POOL_MAX || 10),
            min: parseInt(process.env.MYSQL_POOL_MIN || 2),
            acquire: parseInt(process.env.MYSQL_POOL_ACQUIRE || 30000),
            idle: parseInt(process.env.MYSQL_POOL_IDLE || 30000),
          },
          timezone: '+05:30', // IST
          define: {
            timestamps: true,
            underscored: true,
          },
        }
      );

      // Test connection
      await this.sequelize.authenticate();
      console.log('✅ MySQL Connection Authenticated');

      // Load models
      await this.loadModels();

      // Sync database
      if (process.env.MYSQL_SYNC === 'true') {
        await this.sequelize.sync({ alter: false });
        console.log('✅ MySQL Database Synced');
      }

      return this.sequelize;
    } catch (error) {
      console.error('❌ MySQL Connection Error:', error.message);
      throw error;
    }
  }

  /**
   * Load all models
   */
  async loadModels() {
    try {
      // Import models
      const User = require('./models/User')(this.sequelize);
      const Restaurant = require('./models/Restaurant')(this.sequelize);
      const FoodItem = require('./models/FoodItem')(this.sequelize);
      const Order = require('./models/Order')(this.sequelize);
      const OrderItem = require('./models/OrderItem')(this.sequelize);
      const Payment = require('./models/Payment')(this.sequelize);
      const Review = require('./models/Review')(this.sequelize);

      // Store models
      this.models = {
        User,
        Restaurant,
        FoodItem,
        Order,
        OrderItem,
        Payment,
        Review,
      };

      // Setup associations
      this.setupAssociations();

      console.log('✅ All Models Loaded Successfully');
    } catch (error) {
      console.error('❌ Error Loading Models:', error.message);
      throw error;
    }
  }

  /**
   * Setup model associations
   */
  setupAssociations() {
    const { User, Restaurant, FoodItem, Order, OrderItem, Payment, Review } = this.models;

    // User associations
    User.hasMany(Restaurant, { foreignKey: 'owner_id', as: 'restaurants' });
    User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
    User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });

    // Restaurant associations
    Restaurant.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
    Restaurant.hasMany(FoodItem, { foreignKey: 'restaurant_id', as: 'food_items' });
    Restaurant.hasMany(Order, { foreignKey: 'restaurant_id', as: 'orders' });
    Restaurant.hasMany(Review, { foreignKey: 'restaurant_id', as: 'reviews' });

    // FoodItem associations
    FoodItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    FoodItem.hasMany(OrderItem, { foreignKey: 'food_item_id', as: 'order_items' });

    // Order associations
    Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Order.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
    Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });

    // OrderItem associations
    OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
    OrderItem.belongsTo(FoodItem, { foreignKey: 'food_item_id', as: 'food_item' });

    // Payment associations
    Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

    // Review associations
    Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Review.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });

    console.log('✅ Model Associations Setup Complete');
  }

  /**
   * Execute raw query
   */
  async query(sql, params = []) {
    try {
      const result = await this.sequelize.query(sql, {
        replacements: params,
        type: 'SELECT',
      });
      return result;
    } catch (error) {
      console.error('❌ Query Error:', error.message);
      throw error;
    }
  }

  /**
   * Start transaction
   */
  async startTransaction() {
    return await this.sequelize.transaction();
  }

  /**
   * Commit transaction
   */
  async commitTransaction(transaction) {
    if (transaction) {
      await transaction.commit();
    }
  }

  /**
   * Rollback transaction
   */
  async rollbackTransaction(transaction) {
    if (transaction) {
      await transaction.rollback();
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    if (this.sequelize) {
      await this.sequelize.close();
      console.log('✅ MySQL Connection Closed');
    }
  }
}

module.exports = MySQLDatabase;
