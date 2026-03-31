// Unit tests for Ticket Model using Node.js Assert
const assert = require('assert');
const ticketModel = require('../src/models/ticketModel');
const { initializeDatabase, closeDatabase } = require('../src/config/database');

describe('Ticket Model Unit Tests', () => {
  beforeAll(async () => {
    // Initialize test database
    process.env.DATABASE_URL = './data/test-tickets.db';
    await initializeDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('createTicket', () => {
    it('should create a new ticket', async () => {
      const ticketData = {
        title: 'Test Ticket',
        description: 'Test description',
        priority: '2',
        category: 'incident'
      };

      const result = await ticketModel.createTicket(ticketData);
      
      assert.strictEqual(result.title, 'Test Ticket');
      assert.strictEqual(result.description, 'Test description');
      assert.strictEqual(result.priority, '2');
      assert.strictEqual(result.category, 'incident');
      assert(result.id > 0);
    });

    it('should create ticket with default values', async () => {
      const ticketData = {
        title: 'Minimal Ticket'
      };

      const result = await ticketModel.createTicket(ticketData);
      
      assert.strictEqual(result.title, 'Minimal Ticket');
      assert.strictEqual(result.priority, '3'); // default priority
      assert.strictEqual(result.category, 'incident'); // default category
    });
  });

  describe('getTicketById', () => {
    let testTicketId;

    beforeAll(async () => {
      const ticket = await ticketModel.createTicket({
        title: 'Ticket for retrieval',
        description: 'Test'
      });
      testTicketId = ticket.id;
    });

    it('should retrieve a ticket by ID', async () => {
      const result = await ticketModel.getTicketById(testTicketId);
      
      assert.strictEqual(result.id, testTicketId);
      assert.strictEqual(result.title, 'Ticket for retrieval');
    });

    it('should return null for non-existent ticket', async () => {
      const result = await ticketModel.getTicketById(99999);
      assert.strictEqual(result, null);
    });
  });

  describe('getAllTickets', () => {
    it('should return an array of tickets', async () => {
      const result = await ticketModel.getAllTickets({});
      
      assert(Array.isArray(result.data));
      assert(result.data.length > 0);
    });

    it('should filter tickets by status', async () => {
      const result = await ticketModel.getAllTickets({ status: 'open' });
      
      assert(Array.isArray(result.data));
      result.data.forEach(ticket => {
        assert.strictEqual(ticket.status, 'open');
      });
    });
  });

  describe('updateTicket', () => {
    let testTicketId;

    beforeAll(async () => {
      const ticket = await ticketModel.createTicket({
        title: 'Ticket for update',
        description: 'Original description'
      });
      testTicketId = ticket.id;
    });

    it('should update ticket fields', async () => {
      const updates = {
        title: 'Updated Title',
        status: 'closed',
        description: 'Updated description'
      };

      const result = await ticketModel.updateTicket(testTicketId, updates);
      
      assert.strictEqual(result.title, 'Updated Title');
      assert.strictEqual(result.status, 'closed');
      assert.strictEqual(result.description, 'Updated description');
    });

    it('should return null for non-existent ticket', async () => {
      const result = await ticketModel.updateTicket(99999, { title: 'Should not update' });
      assert.strictEqual(result, null);
    });
  });

  describe('deleteTicket', () => {
    let testTicketId;

    beforeAll(async () => {
      const ticket = await ticketModel.createTicket({
        title: 'Ticket for deletion'
      });
      testTicketId = ticket.id;
    });

    it('should delete a ticket', async () => {
      const result = await ticketModel.deleteTicket(testTicketId);
      assert.strictEqual(result, true);
    });

    it('should return false for non-existent ticket', async () => {
      const result = await ticketModel.deleteTicket(99999);
      assert.strictEqual(result, false);
    });
  });
});