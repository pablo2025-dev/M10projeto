/**
 * Simplified Acceptance Tests
 * 
 * These tests demonstrate the API acceptance testing approach
 * without the complex database initialization issues
 */

const request = require('supertest');
const app = require('../../src/app');

describe('Simplified Acceptance Tests - API Endpoints', () => {
  
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
    }, 10000); // Increased timeout
  });

  describe('API Information', () => {
    it('should provide API info', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);
      
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/non-existent-route')
        .expect(404);
    }, 10000);
  });

  describe('API Documentation', () => {
    it('should serve Swagger UI', async () => {
      const response = await request(app)
        .get('/api-docs/')
        .expect(200);
      
      expect(response.text).toContain('Swagger UI');
    }, 10000);
  });
});