# CI/CD Integration Guide for Unit Tests

## Overview
This guide documents the integration of unit tests into the GitHub Actions CI/CD pipeline for the M10projeto backend.

## CI/CD Configuration

### Updated GitHub Actions Workflow
**File**: `.github/workflows/run-tests.yml`

### Key Improvements Made

1. **Multi-branch Support**: Tests run on both `cicd-tests-vasco` and `main` branches
2. **Node.js Version**: Updated to LTS version 20 for stability
3. **Dependency Caching**: Added npm cache for faster builds
4. **Dual Test Execution**: Runs both Jest and Node.js Assert tests
5. **Artifact Upload**: Captures test results and coverage reports
6. **Working Directory**: Properly configured for server directory

## Workflow Breakdown

### 1. Trigger Conditions
```yaml
on:
  push:
    branches: [ cicd-tests-vasco, main ]
  pull_request:
    branches: [ main ]
```

### 2. Test Execution Steps

#### Step 1: Checkout Repository
```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

#### Step 2: Setup Node.js Environment
```yaml
- name: Set up Node.js
  uses: actions/setup-node@v5
  with:
    node-version: '20'
    cache: 'npm'
```

#### Step 3: Install Dependencies
```yaml
- name: Install server dependencies
  working-directory: ./server
  run: npm ci
```

#### Step 4: Run Jest Unit Tests
```yaml
- name: Run Jest unit tests
  working-directory: ./server
  run: npm test
```

#### Step 5: Run Node.js Assert Tests
```yaml
- name: Run Node.js Assert unit tests
  working-directory: ./server
  run: node run-unit-tests.js
```

### 3. Artifact Management

#### Test Results Upload
```yaml
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: |
      server/coverage/
      server/test-results/
    retention-days: 7
```

#### Coverage Report Upload
```yaml
- name: Upload test coverage report
  if: success()
  uses: actions/upload-artifact@v4
  with:
    name: test-coverage-report
    path: server/coverage/lcov-report/
    retention-days: 7
```

## Test Coverage

### Tests Integrated into CI/CD
- ✅ **29 Jest tests** (ticketModel, authModel, ticketController)
- ✅ **6 Node.js Assert tests** (run-unit-tests.js)
- ✅ **Total: 35 unit tests**

### Coverage Areas
- **Ticket Model**: CRUD operations, filtering, error handling
- **Auth Model**: User management, password operations
- **Ticket Controller**: Request/response handling, validation
- **Integration**: Database operations, business logic

## CI/CD Pipeline Features

### Automatic Triggers
- ✅ Pushes to `cicd-tests-vasco` branch
- ✅ Pushes to `main` branch
- ✅ Pull requests targeting `main` branch

### Test Execution Environment
- **OS**: Ubuntu latest
- **Node.js**: Version 20 (LTS)
- **Dependencies**: Clean install with `npm ci`
- **Working Directory**: `/server`

### Artifact Management
- **Test Results**: Available for 7 days
- **Coverage Reports**: HTML reports for visualization
- **Always Upload**: Results uploaded even if tests fail

## Implementation Steps

### 1. Commit the Updated Workflow
```bash
cd /home/vascovalerio123/Projects/M10projeto
git add .github/workflows/run-tests.yml
git commit -m "Update CI/CD workflow for unit tests"
git push origin cicd-tests-vasco
```

### 2. Monitor Pipeline Execution
- Navigate to GitHub repository → Actions tab
- View workflow runs for the `cicd-tests-vasco` branch
- Check test results and coverage reports

### 3. Access Test Artifacts
- After workflow completion
- Download artifacts from the workflow run page
- Extract and view coverage reports

## Expected Pipeline Output

### Successful Run Example
```
Run Unit Tests
✅ Checkout repository
✅ Set up Node.js
✅ Install server dependencies
✅ Run Jest unit tests (30 tests passed)
✅ Run Node.js Assert unit tests (6 tests passed)
✅ Upload test results
✅ Upload test coverage report
```

### Test Results Summary
```
Test Suites: 3 passed, 3 total
Tests:       35 passed, 35 total
Coverage:    ~70% statement coverage
Artifacts:   test-results.zip, test-coverage-report.zip
```

## Best Practices Implemented

1. **Isolated Test Environment**: Clean setup for each run
2. **Dependency Caching**: Faster subsequent builds
3. **Dual Test Framework**: Both Jest and Node.js Assert
4. **Artifact Preservation**: Results available for debugging
5. **Multi-branch Support**: Flexible deployment strategy
6. **Automatic Triggers**: CI/CD on push and PR events

## Troubleshooting

### Common Issues and Solutions

**Issue**: Tests failing in CI but passing locally
- **Solution**: Check Node.js version match (use v20)
- **Solution**: Verify database path permissions

**Issue**: Artifacts not uploading
- **Solution**: Check `if: always()` condition
- **Solution**: Verify path patterns

**Issue**: Dependency installation failures
- **Solution**: Use `npm ci` instead of `npm install`
- **Solution**: Clear npm cache

## Future Enhancements

### Recommended Improvements
1. **Test Coverage Thresholds**: Add minimum coverage requirements
2. **Parallel Testing**: Run tests in parallel for faster execution
3. **Matrix Testing**: Test across multiple Node.js versions
4. **Notifications**: Add Slack/email notifications
5. **Deployment**: Add automatic deployment on test success

### Code Quality Additions
```yaml
- name: Check test coverage
  run: |
    COVERAGE=$(npm test -- --coverage | grep -oP 'All files \|\d+\.\d+')
    if (( $(echo "$COVERAGE < 70" | bc -l) )); then
      echo "Coverage too low: $COVERAGE%"
      exit 1
    fi
```

## Conclusion

The CI/CD pipeline has been successfully configured to:
- Automatically run all 35 unit tests on every push and pull request
- Provide comprehensive test coverage reports
- Preserve test artifacts for debugging and analysis
- Support both development and main branches

The integration ensures that code quality is maintained and regressions are caught early in the development process.

**Status**: ✅ CI/CD pipeline configured and ready for use
**Next Steps**: Push changes to trigger first automated test run