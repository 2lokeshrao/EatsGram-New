/**
 * MySQL Models Template
 * 
 * यह file में सभी core models के लिए Sequelize definitions हैं।
 * इन्हें अपने project में use करें।
 */

const { DataTypes } = require('sequelize');

// ============================================
// User Model
// ============================================

const createUserModel = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('customer', 'restaurant', 'rider', 'admin'),
      defaultValue: 'customer',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] },
      { fields: ['isActive'] },
    ],
  });

  return User;
};

// ============================================
// Restaurant Model
// ============================================

const createRestaurantModel = (sequelize) => {
  const Restaurant = sequelize.define('Restaurant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    banner: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    cuisineType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    deliveryTime: {
      type: DataTypes.INTEGER, // minutes
      allowNull: true,
    },
    minimumOrder: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
  }, {
    tableName: 'restaurants',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['city'] },
      { fields: ['isActive'] },
    ],
  });

  return Restaurant;
};

// ============================================
// Food Item Model
// ============================================

const createFoodItemModel = (sequelize) => {
  const FoodItem = sequelize.define('FoodItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isVegetarian: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isSpicy: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    preparationTime: {
      type: DataTypes.INTEGER, // minutes
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
  }, {
    tableName: 'food_items',
    timestamps: true,
    indexes: [
      { fields: ['restaurantId'] },
      { fields: ['category'] },
      { fields: ['isActive'] },
    ],
  });

  return FoodItem;
};

// ============================================
// Order Model
// ============================================

const createOrderModel = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    riderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'on_way',
        'delivered',
        'cancelled'
      ),
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
    razorpayOrderId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    razorpayPaymentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estimatedDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actualDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'orders',
    timestamps: true,
    indexes: [
      { fields: ['customerId'] },
      { fields: ['restaurantId'] },
      { fields: ['riderId'] },
      { fields: ['status'] },
      { fields: ['paymentStatus'] },
    ],
  });

  return Order;
};

// ============================================
// Order Item Model
// ============================================

const createOrderItemModel = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    foodItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'food_items',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'order_items',
    timestamps: true,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['foodItemId'] },
    ],
  });

  return OrderItem;
};

// ============================================
// Payment Model
// ============================================

const createPaymentModel = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM('card', 'wallet', 'cash', 'razorpay'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    razorpayOrderId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    razorpayPaymentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    razorpaySignature: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    transactionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'payments',
    timestamps: true,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['status'] },
    ],
  });

  return Payment;
};

// ============================================
// Review Model
// ============================================

const createReviewModel = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'reviews',
    timestamps: true,
    indexes: [
      { fields: ['restaurantId'] },
      { fields: ['customerId'] },
      { fields: ['orderId'] },
    ],
  });

  return Review;
};

// ============================================
// Export All Models
// ============================================

module.exports = {
  createUserModel,
  createRestaurantModel,
  createFoodItemModel,
  createOrderModel,
  createOrderItemModel,
  createPaymentModel,
  createReviewModel,
};

/**
 * Usage in models/index.js:
 * 
 * const sequelize = require('../config/database');
 * const {
 *   createUserModel,
 *   createRestaurantModel,
 *   createFoodItemModel,
 *   createOrderModel,
 *   createOrderItemModel,
 *   createPaymentModel,
 *   createReviewModel,
 * } = require('./templates');
 * 
 * // Create models
 * const User = createUserModel(sequelize);
 * const Restaurant = createRestaurantModel(sequelize);
 * const FoodItem = createFoodItemModel(sequelize);
 * const Order = createOrderModel(sequelize);
 * const OrderItem = createOrderItemModel(sequelize);
 * const Payment = createPaymentModel(sequelize);
 * const Review = createReviewModel(sequelize);
 * 
 * // Define associations
 * User.hasMany(Restaurant, { foreignKey: 'userId' });
 * Restaurant.belongsTo(User, { foreignKey: 'userId' });
 * 
 * Restaurant.hasMany(FoodItem, { foreignKey: 'restaurantId' });
 * FoodItem.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
 * 
 * Order.hasMany(OrderItem, { foreignKey: 'orderId' });
 * OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
 * 
 * Order.hasMany(Payment, { foreignKey: 'orderId' });
 * Payment.belongsTo(Order, { foreignKey: 'orderId' });
 * 
 * module.exports = {
 *   User,
 *   Restaurant,
 *   FoodItem,
 *   Order,
 *   OrderItem,
 *   Payment,
 *   Review,
 * };
 */
