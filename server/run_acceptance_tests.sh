#!/bin/bash

echo "=== Running Acceptance Tests ==="
echo ""

# Run authentication tests
cd /home/vascovalerio123/Projects/M10projeto/server
echo "1. Running Authentication Flow Tests..."
npm test -- --testNamePattern="Authentication Flow" --verbose 2>&1 | grep -A 5 -B 5 "✓\|✕"

echo ""
echo "2. Running Ticket Management Tests..."
npm test -- --testNamePattern="Ticket Management" --verbose 2>&1 | grep -A 5 -B 5 "✓\|✕"

echo ""
echo "=== Test Execution Complete ==="