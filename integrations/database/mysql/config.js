/**
 * MySQL Configuration Template
 * 
 * यह file आपके backend में database configuration के लिए है।
 * इसे अपने project structure के अनुसार modify करें।
 */

// ============================================
// Sequelize Configuration
// ============================================

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'eatsgram_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    
    // Logging
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    
    // Connection Pool
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: 30000,
      idle: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
    },
    
    // Timezone
    timezone: '+05:30', // IST
    
    // Model defaults
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    
    // SSL (Production के लिए)
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? 'Amazon RDS' : false,
    },
  }
);

// ============================================
// Connection Test
// ============================================

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

// ============================================
// Sync Database
// ============================================

const syncDatabase = async (options = {}) => {
  try {
    const { force = false, alter = false } = options;
    
    await sequelize.sync({
      force,  // Drop tables if they exist
      alter,  // Alter tables to match models
    });
    
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Database sync error:', error);
    process.exit(1);
  }
};

// ============================================
// Export
// ============================================

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
};

/**
 * Usage in app.js:
 * 
 * const { sequelize, testConnection, syncDatabase } = require('./config/database');
 * 
 * // Test connection
 * testConnection();
 * 
 * // Sync database
 * syncDatabase({ alter: true });
 * 
 * // Start server
 * app.listen(3000, () => {
 *   console.log('Server running on port 3000');
 * });
 */
