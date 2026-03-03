#!/usr/bin/env node
/**
 * Rehash plaintext passwords in the users table.
 *
 * For the M11 1.1 exercise: reads the database and replaces any "password_hash"
 * values that don't look like a bcrypt hash with a fresh bcrypt hash.
 *
 * Usage:
 *   node scripts/rehash-plaintext-passwords.js
 */

require('dotenv').config();
const { initializeDatabase, closeDatabase, getDatabase } = require('../src/config/database');
const { hashPassword, looksLikeHash } = require('../src/utils/password');

(async () => {
  await initializeDatabase();
  const db = getDatabase();

  const users = await db.all(`SELECT id, email, password_hash FROM users`);

  let updated = 0;
  for (const u of users) {
    if (!u.password_hash || looksLikeHash(u.password_hash)) continue;

    const newHash = await hashPassword(u.password_hash);
    await db.run(`UPDATE users SET password_hash = ? WHERE id = ?`, [newHash, u.id]);
    updated++;
  }

  console.log(JSON.stringify({ users: users.length, updated }));

  await closeDatabase();
})().catch(async (err) => {
  console.error(err);
  try { await closeDatabase(); } catch {}
  process.exit(1);
});
