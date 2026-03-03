/**
 * Session model (SQLite)
 *
 * Stores opaque bearer tokens.
 */

const crypto = require('crypto');
const { getDatabase } = require('../config/database');

const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || (24 * 60 * 60 * 1000));

function generateToken() {
  // URL-safe token
  return crypto.randomBytes(32).toString('base64url');
}

async function createSession(userId, { ip = null, userAgent = null } = {}) {
  const db = getDatabase();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  await db.run(
    `INSERT INTO sessions (token, user_id, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)` ,
    [token, userId, expiresAt, ip, userAgent]
  );

  return { token, expiresAt };
}

async function getSessionByToken(token) {
  const db = getDatabase();
  const row = await db.get(
    `SELECT token, user_id, created_at, expires_at, ip, user_agent FROM sessions WHERE token = ?`,
    [token]
  );
  if (!row) return null;

  const now = Date.now();
  const exp = Date.parse(row.expires_at);
  if (Number.isNaN(exp) || exp <= now) {
    await deleteSession(token);
    return null;
  }

  return row;
}

async function deleteSession(token) {
  const db = getDatabase();
  await db.run(`DELETE FROM sessions WHERE token = ?`, [token]);
}

module.exports = {
  createSession,
  getSessionByToken,
  deleteSession,
  SESSION_TTL_MS
};
