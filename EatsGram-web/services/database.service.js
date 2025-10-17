const { initializeDatabase } = require('../config/database');

let db = null;

async function getDatabase() {
  if (!db) {
    db = await initializeDatabase();
  }
  return db;
}

async function getModels() {
  const database = await getDatabase();
  return database.getModels();
}

async function createUser(userData) {
  const { User } = await getModels();
  return await User.create(userData);
}

async function getUserById(userId) {
  const { User } = await getModels();
  return await User.findByPk(userId);
}

async function updateUser(userId, userData) {
  const { User } = await getModels();
  return await User.update(userData, { where: { id: userId } });
}

async function deleteUser(userId) {
  const { User } = await getModels();
  return await User.destroy({ where: { id: userId } });
}

module.exports = {
  getDatabase,
  getModels,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
