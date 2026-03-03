/**
 * Password helpers
 * - Strong password validation (server-side)
 * - Hash/verify using bcryptjs (pure JS)
 */

const bcrypt = require('bcryptjs');

const DEFAULT_COST = Number(process.env.BCRYPT_COST || 12);

function isStrongPassword(password) {
  if (typeof password !== 'string') return false;
  // Requirements (per M11 1.2): length, numbers, special characters
  const minLen = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return minLen && hasNumber && hasSpecial;
}

async function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password is required');
  }
  return bcrypt.hash(password, DEFAULT_COST);
}

async function verifyPassword(password, passwordHash) {
  if (typeof password !== 'string' || typeof passwordHash !== 'string') return false;
  return bcrypt.compare(password, passwordHash);
}

function looksLikeHash(value) {
  return typeof value === 'string' && (value.startsWith('$2') || value.startsWith('$2a$') || value.startsWith('$2b$'));
}

module.exports = {
  isStrongPassword,
  hashPassword,
  verifyPassword,
  looksLikeHash
};
