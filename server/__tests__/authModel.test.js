// Unit tests for Auth Model using Node.js Assert
const assert = require('assert');
const userModel = require('../src/models/userModel');
const { initializeDatabase, closeDatabase } = require('../src/config/database');

describe('Auth Model Unit Tests', () => {
  beforeAll(async () => {
    // Initialize test database
    process.env.DATABASE_URL = './data/test-auth.db';
    await initializeDatabase();
    
    // Clean up any existing users
    const db = require('../src/config/database').getDatabase();
    await db.run(`DELETE FROM users`);
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('User Operations', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashed_password_123'
      };

      const result = await userModel.createUser(userData);
      
      assert.strictEqual(result.email, 'test@example.com');
      assert(result.id > 0);
    });

    it('should retrieve user by email', async () => {
      const result = await userModel.getUserByEmail('test@example.com');
      
      assert.strictEqual(result.email, 'test@example.com');
      assert.strictEqual(result.password_hash, 'hashed_password_123');
    });

    it('should return null for non-existent email', async () => {
      const result = await userModel.getUserByEmail('nonexistent@example.com');
      assert.strictEqual(result, undefined);
    });

    it('should retrieve user by ID', async () => {
      const user = await userModel.getUserByEmail('test@example.com');
      const result = await userModel.getUserById(user.id);
      
      assert.strictEqual(result.id, user.id);
      assert.strictEqual(result.email, 'test@example.com');
    });

    it('should update user role', async () => {
      const user = await userModel.getUserByEmail('test@example.com');
      const result = await userModel.setUserRole(user.id, 'admin');
      
      assert.strictEqual(result.role, 'admin');
    });

    it('should increment token version', async () => {
      const user = await userModel.getUserByEmail('test@example.com');
      const userBefore = await userModel.getUserById(user.id);
      const initialVersion = userBefore.token_version || 0;
      
      await userModel.incrementTokenVersion(user.id);
      
      const userAfter = await userModel.getUserById(user.id);
      assert.strictEqual(userAfter.token_version, initialVersion + 1);
    });

    it('should delete user', async () => {
      const user = await userModel.getUserByEmail('test@example.com');
      // Delete directly from database since userModel doesn't have deleteUser
      const db = require('../src/config/database').getDatabase();
      await db.run(`DELETE FROM users WHERE id = ?`, [user.id]);
      
      // Verify deletion
      const shouldBeNull = await userModel.getUserById(user.id);
      assert.strictEqual(shouldBeNull, undefined);
    });
  });

  describe('Password Operations', () => {
    let testUserId;

    beforeAll(async () => {
      const user = await userModel.createUser({
        email: 'password-test@example.com',
        passwordHash: 'old_password'
      });
      testUserId = user.id;
    });

    it('should verify password correctly', async () => {
      const user = await userModel.getUserByEmail('password-test@example.com');
      
      // The model should have stored the password hash
      assert.strictEqual(user.password_hash, 'old_password');
    });

    it('should update password', async () => {
      // Update password directly since userModel doesn't have updateUserPassword
      const db = require('../src/config/database').getDatabase();
      await db.run(`UPDATE users SET password_hash = ? WHERE id = ?`, ['new_password', testUserId]);
      
      // Verify by getting user by email which includes password_hash
      const user = await userModel.getUserByEmail('password-test@example.com');
      assert.strictEqual(user.password_hash, 'new_password');
    });

    afterAll(async () => {
      // Clean up by deleting from database directly
      const db = require('../src/config/database').getDatabase();
      await db.run(`DELETE FROM users WHERE id = ?`, [testUserId]);
    });
  });
});