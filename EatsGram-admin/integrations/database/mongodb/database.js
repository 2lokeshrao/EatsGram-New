/**
 * MongoDB Database Class
 * Handles all MongoDB database operations
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

class MongoDBDatabase {
  constructor() {
    this.connection = null;
    this.models = {};
  }

  /**
   * Connect to MongoDB Database
   */
  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 
        `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`;

      this.connection = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });

      console.log('✅ MongoDB Connection Authenticated');

      // Load models
      await this.loadModels();

      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB Connection Error:', error.message);
      throw error;
    }
  }

  /**
   * Load all models
   */
  async loadModels() {
    try {
      // Import models
      const User = require('./models/User');
      const Restaurant = require('./models/Restaurant');
      const FoodItem = require('./models/FoodItem');
      const Order = require('./models/Order');
      const OrderItem = require('./models/OrderItem');
      const Payment = require('./models/Payment');
      const Review = require('./models/Review');

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

      console.log('✅ All Models Loaded Successfully');
    } catch (error) {
      console.error('❌ Error Loading Models:', error.message);
      throw error;
    }
  }

  /**
   * Execute query
   */
  async query(collection, query = {}, options = {}) {
    try {
      const model = this.models[collection];
      if (!model) {
        throw new Error(`Model ${collection} not found`);
      }

      return await model.find(query, options);
    } catch (error) {
      console.error('❌ Query Error:', error.message);
      throw error;
    }
  }

  /**
   * Start transaction
   */
  async startTransaction() {
    const session = await mongoose.startSession();
    session.startTransaction();
    return session;
  }

  /**
   * Commit transaction
   */
  async commitTransaction(session) {
    if (session) {
      await session.commitTransaction();
      await session.endSession();
    }
  }

  /**
   * Rollback transaction
   */
  async rollbackTransaction(session) {
    if (session) {
      await session.abortTransaction();
      await session.endSession();
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('✅ MongoDB Connection Closed');
    }
  }
}

module.exports = MongoDBDatabase;
