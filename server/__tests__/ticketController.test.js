// Unit tests for Ticket Controller using Node.js Assert
const assert = require('assert');
const ticketController = require('../src/controllers/ticketController');
const ticketModel = require('../src/models/ticketModel');

// Mock the ticketModel to avoid database dependency
jest.mock('../src/models/ticketModel', () => ({
  getAllTickets: async () => [
    { id: 1, title: 'Test Ticket 1', status: 'open', priority: '3' },
    { id: 2, title: 'Test Ticket 2', status: 'closed', priority: '1' }
  ],
  getTicketById: async (id) => {
    if (id === '1') {
      return { id: 1, title: 'Test Ticket 1', status: 'open', priority: '3' };
    }
    return null;
  },
  createTicket: async (data) => ({
    id: 3,
    title: data.title,
    description: data.description,
    priority: data.priority,
    category: data.category
  }),
  updateTicket: async (id, data) => ({
    id: Number(id),
    title: data.title || 'Updated Ticket',
    status: data.status || 'open'
  }),
  deleteTicket: async (id) => {
    if (id === '999') return false;
    return true;
  }
}));

describe('Ticket Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('listTickets', () => {
    it('should return all tickets', async () => {
      await ticketController.listTickets(req, res, next);
      
      assert.strictEqual(res.json.mock.calls.length, 1);
      const result = res.json.mock.calls[0][0];
      assert(Array.isArray(result));
      assert.strictEqual(result.length, 2);
    });

    it('should handle errors', async () => {
      const originalGetAll = ticketModel.getAllTickets;
      ticketModel.getAllTickets = async () => { throw new Error('DB error'); };
      
      await ticketController.listTickets(req, res, next);
      
      assert.strictEqual(next.mock.calls.length, 1);
      assert(next.mock.calls[0][0] instanceof Error);
      
      // Restore
      ticketModel.getAllTickets = originalGetAll;
    });
  });

  describe('getTicket', () => {
    it('should return a ticket by ID', async () => {
      req.params.id = '1';
      
      await ticketController.getTicket(req, res, next);
      
      assert.strictEqual(res.json.mock.calls.length, 1);
      const result = res.json.mock.calls[0][0];
      assert.strictEqual(result.id, 1);
      assert.strictEqual(result.title, 'Test Ticket 1');
    });

    it('should return 404 for non-existent ticket', async () => {
      req.params.id = '999';
      
      await ticketController.getTicket(req, res, next);
      
      assert.strictEqual(res.status.mock.calls[0][0], 404);
      assert(res.json.mock.calls[0][0].error === 'Not Found');
    });

    it('should return 400 for invalid ID', async () => {
      req.params.id = '';
      
      await ticketController.getTicket(req, res, next);
      
      assert.strictEqual(res.status.mock.calls[0][0], 400);
      assert(res.json.mock.calls[0][0].error === 'Invalid ID');
    });
  });

  describe('createTicket', () => {
    it('should create a new ticket', async () => {
      req.body = {
        title: 'New Test Ticket',
        description: 'Test description',
        priority: '2'
      };
      
      await ticketController.createTicket(req, res, next);
      
      assert.strictEqual(res.status.mock.calls[0][0], 201);
      const result = res.json.mock.calls[0][0];
      assert.strictEqual(result.title, 'New Test Ticket');
      assert.strictEqual(result.id, 3);
    });

    it('should return 400 for missing title', async () => {
      req.body = {
        description: 'Test description'
      };
      
      await ticketController.createTicket(req, res, next);
      
      assert.strictEqual(res.status.mock.calls[0][0], 400);
      assert(res.json.mock.calls[0][0].error === 'Validation Error');
    });
  });

  describe('updateTicket', () => {
    it('should update a ticket', async () => {
      req.params.id = '1';
      req.body = {
        title: 'Updated Title',
        status: 'closed'
      };
      
      await ticketController.updateTicket(req, res, next);
      
      assert.strictEqual(res.json.mock.calls.length, 1);
      const result = res.json.mock.calls[0][0];
      assert(result.before);
      assert(result.after);
      assert.strictEqual(result.after.title, 'Updated Title');
    });

    it('should return 404 for non-existent ticket', async () => {
      req.params.id = '999';
      req.body = { title: 'Updated Title' };
      
      await ticketController.updateTicket(req, res, next);
      
      assert.strictEqual(res.status.mock.calls[0][0], 404);
    });
  });

  describe('deleteTicket', () => {
    it('should delete a ticket', async () => {
      req.params.id = '1';
      
      await ticketController.deleteTicket(req, res, next);
      
      assert.strictEqual(res.json.mock.calls.length, 1);
      const result = res.json.mock.calls[0][0];
      assert.strictEqual(result.message, 'Ticket deleted successfully');
      assert.strictEqual(result.id, 1);
    });

    it('should return 404 for non-existent ticket', async () => {
      req.params.id = '999';
      
      await ticketController.deleteTicket(req, res, next);
      
      assert.strictEqual(res.status.mock.calls[0][0], 404);
    });
  });
});