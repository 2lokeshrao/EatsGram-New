const db = require('../integrations/database');

async function initializeDatabase() {
  try {
    await db.initialize();
    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

module.exports = { initializeDatabase };
