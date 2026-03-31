#!/usr/bin/env node

/**
 * Simple Node.js Assert test runner
 * Runs unit tests without Jest for demonstration purposes
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Import models and initialize database
const ticketModel = require('./src/models/ticketModel');
const { initializeDatabase, closeDatabase } = require('./src/config/database');

async function runTests() {
  console.log('=== Running Unit Tests with Node.js Assert ===\n');

  // Initialize test database
  process.env.DATABASE_URL = './data/test-unit.db';
  await initializeDatabase();
  
  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Create Ticket
    console.log('Test 1: Creating a new ticket...');
    const created = await ticketModel.createTicket({
      title: 'Unit Test Ticket',
      description: 'Created for testing',
      priority: '1'
    });
    
    assert.strictEqual(created.title, 'Unit Test Ticket', 'Ticket title should match');
    assert.strictEqual(created.priority, '1', 'Ticket priority should match');
    assert(created.id > 0, 'Ticket should have a valid ID');
    console.log('✓ Test 1 passed: Ticket created successfully\n');
    passed++;
    
    const testTicketId = created.id;

    // Test 2: Get Ticket by ID
    console.log('Test 2: Retrieving ticket by ID...');
    const retrieved = await ticketModel.getTicketById(testTicketId);
    
    assert.strictEqual(retrieved.id, testTicketId, 'Retrieved ticket ID should match');
    assert.strictEqual(retrieved.title, 'Unit Test Ticket', 'Retrieved ticket title should match');
    console.log('✓ Test 2 passed: Ticket retrieved successfully\n');
    passed++;

    // Test 3: Update Ticket
    console.log('Test 3: Updating ticket...');
    const updated = await ticketModel.updateTicket(testTicketId, {
      title: 'Updated Unit Test Ticket',
      status: 'closed'
    });
    
    assert.strictEqual(updated.title, 'Updated Unit Test Ticket', 'Updated title should match');
    assert.strictEqual(updated.status, 'closed', 'Updated status should match');
    console.log('✓ Test 3 passed: Ticket updated successfully\n');
    passed++;

    // Test 4: Get All Tickets
    console.log('Test 4: Getting all tickets...');
    const allTickets = await ticketModel.getAllTickets({});
    
    assert(Array.isArray(allTickets.data), 'Should return an array');
    assert(allTickets.data.length > 0, 'Should have at least one ticket');
    console.log('✓ Test 4 passed: Retrieved all tickets\n');
    passed++;

    // Test 5: Delete Ticket
    console.log('Test 5: Deleting ticket...');
    const deleted = await ticketModel.deleteTicket(testTicketId);
    
    assert.strictEqual(deleted, true, 'Should return true for successful deletion');
    
    // Verify deletion
    const shouldBeNull = await ticketModel.getTicketById(testTicketId);
    assert.strictEqual(shouldBeNull, null, 'Deleted ticket should not be found');
    console.log('✓ Test 5 passed: Ticket deleted successfully\n');
    passed++;

    // Test 6: Non-existent ticket operations
    console.log('Test 6: Testing non-existent ticket operations...');
    const nonExistent = await ticketModel.getTicketById(99999);
    assert.strictEqual(nonExistent, null, 'Should return null for non-existent ticket');
    
    const updateNonExistent = await ticketModel.updateTicket(99999, { title: 'Should not update' });
    assert.strictEqual(updateNonExistent, null, 'Should return null when updating non-existent ticket');
    
    const deleteNonExistent = await ticketModel.deleteTicket(99999);
    assert.strictEqual(deleteNonExistent, false, 'Should return false when deleting non-existent ticket');
    console.log('✓ Test 6 passed: Non-existent ticket operations handled correctly\n');
    passed++;

  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error(error.stack);
    failed++;
  } finally {
    await closeDatabase();
    
    // Clean up test database file
    const dbPath = path.join(__dirname, 'data', 'test-unit.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    
    console.log('=== Test Summary ===');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n❌ Some tests failed.');
      process.exit(1);
    }
  }
}

runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});