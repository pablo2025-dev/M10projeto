/**
 * API Acceptance Tests
 * 
 * These tests verify that the API endpoints work correctly from an external consumer perspective
 * They test the complete request/response cycle including authentication and data validation
 */

const request = require('supertest');
const app = require('../../src/app');
const { initializeDatabase, closeDatabase } = require('../../src/config/database');

describe('API Acceptance Tests', () => {
  beforeAll(async () => {
    // Set test database URL before requiring app
    process.env.DATABASE_URL = './data/test-acceptance.db';
    process.env.NODE_ENV = 'test';
    
    // Initialize database
    const { initializeDatabase } = require('../../src/config/database');
    await initializeDatabase();
  });

  afterAll(async () => {
    const { closeDatabase } = require('../../src/config/database');
    await closeDatabase();
  });

  beforeEach(async () => {
    // Clean up test data between tests
    const db = require('../../src/config/database').getDatabase();
    await db.run(`DELETE FROM users`);
    await db.run(`DELETE FROM tickets`);
  });

  // Increase test timeout
  jest.setTimeout(30000);

  describe('Health Endpoint', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('Authentication Flow', () => {
    let authToken;
    const testUser = {
      email: 'auth-test-' + Date.now() + '@example.com',
      password: 'TestPassword#123'
    };

    it('should allow user registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testUser.email);
    });

    it('should allow user login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });

    it('should protect authenticated routes', async () => {
      // Try to access protected route without token
      await request(app)
        .get('/api/tickets')
        .expect(401);

      // Access with valid token
      await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Ticket Management', () => {
    let authToken;
    const testUser = {
      email: 'ticket-test-' + Date.now() + '@example.com',
      password: 'TestPassword#123'
    };

    beforeAll(async () => {
      // Register and login user
      await request(app).post('/api/auth/register').send(testUser);
      const response = await request(app).post('/api/auth/login').send(testUser);
      authToken = response.body.token;
    });

    it('should create a new ticket', async () => {
      const ticketData = {
        title: 'Acceptance Test Ticket',
        description: 'Created through acceptance test',
        priority: '2',
        category: 'feature'
      };

      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ticketData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(ticketData.title);
      expect(response.body.status).toBe('Open');
    });

    it('should list all tickets', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should retrieve a specific ticket', async () => {
      // First create a ticket
      const createResponse = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Specific Ticket',
          description: 'For retrieval test'
        });

      const ticketId = createResponse.body.id;

      // Then retrieve it
      const response = await request(app)
        .get(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(ticketId);
      expect(response.body.title).toBe('Specific Ticket');
    });

    it('should update a ticket', async () => {
      // Create a ticket
      const createResponse = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Update Test Ticket',
          description: 'Original description'
        });

      const ticketId = createResponse.body.id;

      // Update it
      const response = await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Ticket Title',
          status: 'closed'
        })
        .expect(200);

      expect(response.body.after.title).toBe('Updated Ticket Title');
      expect(response.body.after.status).toBe('closed');
    });

    it('should delete a ticket', async () => {
      // Create a ticket
      const createResponse = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Delete Test Ticket'
        });

      const ticketId = createResponse.body.id;

      // Delete it
      await request(app)
        .delete(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      await request(app)
        .get('/non-existent-route')
        .expect(404);
    });

    it('should validate input data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'short'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should handle authentication errors', async () => {
      await request(app)
        .get('/api/tickets')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('API Documentation', () => {
    it('should serve API documentation', async () => {
      const response = await request(app)
        .get('/api-docs/')
        .expect(200);

      expect(response.text).toContain('Swagger UI');
    });

    it('should provide API info', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });
});