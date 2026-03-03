/**
 * User model (SQLite)
 */

const { getDatabase } = require('../config/database');

async function createUser({ email, passwordHash }) {
  const db = getDatabase();
  const result = await db.run(
    `INSERT INTO users (email, password_hash) VALUES (?, ?)`,
    [email, passwordHash]
  );
  return getUserById(result.lastID);
}

async function getUserByEmail(email) {
  const db = getDatabase();
  return db.get(`SELECT id, email, password_hash, created_at FROM users WHERE email = ?`, [email]);
}

async function getUserById(id) {
  const db = getDatabase();
  return db.get(`SELECT id, email, created_at FROM users WHERE id = ?`, [id]);
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById
};
