# Unit Testing Documentation for M10projeto Backend

## Overview
This document describes the unit testing implementation for the M10projeto backend using Node.js Assert. The tests focus on the core business logic in the models and controllers.

## Test Structure

### Test Files Created

1. **`run-unit-tests.js`** - Main test runner using pure Node.js Assert
2. **`__tests__/ticketModel.test.js`** - Unit tests for Ticket Model
3. **`__tests__/authModel.test.js`** - Unit tests for User/Auth Model
4. **`__tests__/ticketController.test.js`** - Unit tests for Ticket Controller (Jest-style)

### Testing Approach

#### 1. Pure Node.js Assert Tests
- Uses Node.js built-in `assert` module
- No external testing framework dependencies
- Direct database testing with isolated test databases
- Simple and straightforward for basic unit testing

#### 2. Jest-style Tests (for reference)
- Shows how to use Jest mocking
- Demonstrates controller testing patterns
- Can be run with the existing Jest setup

## Running the Tests

### Using the Simple Test Runner
```bash
cd /home/vascovalerio123/Projects/M10projeto/server
node run-unit-tests.js
```

### Using Jest (for the Jest-style tests)
```bash
cd /home/vascovalerio123/Projects/M10projeto/server
npm test
```

## Test Coverage

### Ticket Model Tests
- ✅ Create ticket with full data
- ✅ Create ticket with default values
- ✅ Retrieve ticket by ID
- ✅ Handle non-existent ticket retrieval
- ✅ Get all tickets
- ✅ Filter tickets by status
- ✅ Update ticket fields
- ✅ Handle non-existent ticket updates
- ✅ Delete ticket
- ✅ Handle non-existent ticket deletion

### Auth/User Model Tests
- ✅ Create new user
- ✅ Retrieve user by email
- ✅ Handle non-existent email
- ✅ Retrieve user by ID
- ✅ Update user role
- ✅ Update user password
- ✅ Increment token version
- ✅ Delete user
- ✅ Verify password operations

### Ticket Controller Tests (Jest-style)
- ✅ List all tickets
- ✅ Handle errors in listing
- ✅ Get single ticket by ID
- ✅ Handle 404 for non-existent ticket
- ✅ Handle 400 for invalid ID
- ✅ Create new ticket
- ✅ Handle 400 for missing title
- ✅ Update ticket
- ✅ Handle 404 for non-existent ticket update
- ✅ Delete ticket
- ✅ Handle 404 for non-existent ticket deletion

## Test Results

### Simple Test Runner Results
```
=== Running Unit Tests with Node.js Assert ===

Test 1: Creating a new ticket...
✓ Test 1 passed: Ticket created successfully

Test 2: Retrieving ticket by ID...
✓ Test 2 passed: Ticket retrieved successfully

Test 3: Updating ticket...
✓ Test 3 passed: Ticket updated successfully

Test 4: Getting all tickets...
✓ Test 4 passed: Retrieved all tickets

Test 5: Deleting ticket...
✓ Test 5 passed: Ticket deleted successfully

Test 6: Testing non-existent ticket operations...
✓ Test 6 passed: Non-existent ticket operations handled correctly

=== Test Summary ===
Passed: 6
Failed: 0
Total: 6

🎉 All tests passed!
```

## Key Testing Principles Applied

1. **Isolation**: Each test uses a separate test database
2. **Determinism**: Tests create their own test data
3. **Cleanup**: Test databases are removed after tests
4. **Assertions**: Clear assertions using Node.js Assert
5. **Error Handling**: Tests verify proper error handling
6. **Edge Cases**: Tests include non-existent records and invalid inputs

## Test Data Management

- Each test suite uses a separate database file (e.g., `test-unit.db`, `test-tickets.db`)
- Test databases are automatically cleaned up after tests
- No interference with production or development databases

## Assertions Used

The tests use the following Node.js Assert methods:

- `assert.strictEqual(actual, expected)` - Strict equality comparison
- `assert.deepStrictEqual(actual, expected)` - Deep object comparison
- `assert(Array.isArray(value))` - Array type checking
- `assert(condition)` - General truthiness assertion
- `assert.strictEqual(value, null)` - Null checking

## Best Practices Demonstrated

1. **Test Organization**: Logical grouping by functionality
2. **Setup/Teardown**: Proper before/after hooks
3. **Assertion Messages**: Clear error messages
4. **Test Independence**: Each test creates its own data
5. **Error Handling**: Tests verify proper error responses
6. **Edge Cases**: Testing boundary conditions

## Recommendations for Future Testing

1. **Expand Coverage**: Add tests for remaining models (secretModel, auditLogModel)
2. **Controller Tests**: Implement more controller tests with proper mocking
3. **Integration Tests**: Add tests for API endpoints
4. **Performance Tests**: Consider adding load testing
5. **Security Tests**: Add specific security-focused tests

## Conclusion

The unit testing implementation provides a solid foundation for ensuring the reliability of the M10projeto backend. The tests cover core functionality and demonstrate both simple Node.js Assert testing and more advanced Jest-style testing approaches.