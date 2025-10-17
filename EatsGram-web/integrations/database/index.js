/**
 * Database Abstraction Layer
 * Supports both MongoDB and MySQL
 * 
 * Usage:
 * const db = require('./index');
 * await db.initialize();
 * const user = await db.models.User.findById(id);
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DB_TYPE = process.env.DATABASE_TYPE || 'mongodb'; // 'mongodb' or 'mysql'

let dbInstance = null;

/**
 * Initialize Database Connection
 */
async function initialize() {
  if (dbInstance) {
    console.log('✅ Database already initialized');
    return dbInstance;
  }

  try {
    if (DB_TYPE === 'mysql') {
      console.log('🔄 Initializing MySQL Database...');
      const MySQLDatabase = require('./mysql/database');
      dbInstance = new MySQLDatabase();
      await dbInstance.connect();
      console.log('✅ MySQL Database Connected Successfully');
    } else if (DB_TYPE === 'mongodb') {
      console.log('🔄 Initializing MongoDB Database...');
      const MongoDBDatabase = require('./mongodb/database');
      dbInstance = new MongoDBDatabase();
      await dbInstance.connect();
      console.log('✅ MongoDB Database Connected Successfully');
    } else {
      throw new Error(`Invalid DATABASE_TYPE: ${DB_TYPE}. Use 'mongodb' or 'mysql'`);
    }

    return dbInstance;
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    throw error;
  }
}

/**
 * Get Database Instance
 */
function getInstance() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initialize() first.');
  }
  return dbInstance;
}

/**
 * Close Database Connection
 */
async function close() {
  if (dbInstance) {
    await dbInstance.disconnect();
    dbInstance = null;
    console.log('✅ Database Connection Closed');
  }
}

/**
 * Get Models
 */
function getModels() {
  return getInstance().models;
}

/**
 * Execute Query
 */
async function query(sql, params = []) {
  return getInstance().query(sql, params);
}

/**
 * Start Transaction
 */
async function startTransaction() {
  return getInstance().startTransaction();
}

/**
 * Commit Transaction
 */
async function commitTransaction(transaction) {
  return getInstance().commitTransaction(transaction);
}

/**
 * Rollback Transaction
 */
async function rollbackTransaction(transaction) {
  return getInstance().rollbackTransaction(transaction);
}

module.exports = {
  initialize,
  getInstance,
  close,
  getModels,
  query,
  startTransaction,
  commitTransaction,
  rollbackTransaction,
  DB_TYPE,
};
