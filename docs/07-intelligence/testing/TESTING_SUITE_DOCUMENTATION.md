# Phase 3 Team Collaboration Testing Suite Documentation

## Overview

This document provides comprehensive documentation for the Phase 3 Team Collaboration testing suite. The testing suite ensures that all team collaboration features work correctly, perform well, and integrate properly with the H²GNN system.

## Table of Contents

1. [Testing Architecture](#testing-architecture)
2. [Test Categories](#test-categories)
3. [Running Tests](#running-tests)
4. [Test Configuration](#test-configuration)
5. [Test Results and Reporting](#test-results-and-reporting)
6. [Continuous Integration](#continuous-integration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Testing Architecture

### Test Structure

```
src/tests/
├── core/                           # Core component tests
│   ├── shared-learning-database.test.ts
│   └── enhanced-h2gnn.test.ts
├── rules/                          # Rule engine tests
│   └── coding-standard-engine.test.ts
├── workflows/                      # Workflow tests
│   └── team-collaboration-workflow.test.ts
├── mcp/                           # MCP tool tests
│   └── team-collaboration-mcp.test.ts
├── integration/                    # Integration tests
│   └── team-collaboration-e2e.test.ts
├── performance/                    # Performance tests
│   ├── large-team-creation.test.ts
│   ├── concurrent-operations.test.ts
│   └── memory-usage.test.ts
├── setup.ts                       # Test setup and utilities
└── test-runner.ts                 # Comprehensive test runner
```

### Test Categories

#### 1. Unit Tests
- **Purpose**: Test individual components in isolation
- **Coverage**: Core classes, methods, and functions
- **Examples**: SharedLearningDatabase, CodingStandardEngine, Workflow classes

#### 2. Integration Tests
- **Purpose**: Test component interactions
- **Coverage**: Cross-component communication, data flow
- **Examples**: Team collaboration workflows, knowledge sharing

#### 3. End-to-End Tests
- **Purpose**: Test complete user scenarios
- **Coverage**: Full workflow execution, real-world scenarios
- **Examples**: Agile development teams, open source projects

#### 4. Performance Tests
- **Purpose**: Test system performance under load
- **Coverage**: Large datasets, concurrent operations, memory usage
- **Examples**: Large team creation, concurrent workflows

#### 5. MCP Tool Tests
- **Purpose**: Test MCP server integration
- **Coverage**: Tool definitions, parameter validation, error handling
- **Examples**: define_coding_standard, create_team, share_team_knowledge

## Running Tests

### Quick Start

```bash
# Run all Phase 3 tests
npm run test:phase3

# Run with verbose output
npm run test:phase3:verbose

# Run with performance tests
npm run test:phase3:performance

# Run with coverage reporting
npm run test:phase3:coverage
```

### Individual Test Suites

```bash
# Run specific test categories
npm run test:team-collaboration

# Run unit tests only
npx jest src/tests/core/

# Run integration tests only
npx jest src/tests/integration/

# Run MCP tests only
npx jest src/tests/mcp/
```

### Test Runner Options

```bash
# Basic test runner
npx tsx src/tests/test-runner.ts

# With options
npx tsx src/tests/test-runner.ts --verbose --performance --coverage

# Custom output directory
npx tsx src/tests/test-runner.ts --output=./custom-results
```

## Test Configuration

### Jest Configuration

The Jest configuration is defined in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/src/tests/**/*.test.ts'
  ],
  collectCoverage: true,
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testTimeout: 30000,
  maxWorkers: '50%'
};
```

### Test Setup

The test setup file (`src/tests/setup.ts`) provides:

- Global test utilities
- Mock implementations
- Test environment configuration
- Cleanup procedures

### Environment Variables

```bash
# Test storage path
H2GNN_TEST_STORAGE_PATH=./test-storage

# Test timeout
H2GNN_TEST_TIMEOUT=30000

# Test cleanup
H2GNN_TEST_CLEANUP=true
```

## Test Results and Reporting

### Console Output

The test runner provides detailed console output:

```
🚀 Starting Phase 3 Team Collaboration Test Suite
================================================

📋 Running Shared Learning Database Tests
──────────────────────────────────────────────────
Tests for shared learning database functionality
✅ Shared Learning Database: 15/15 passed (1250ms)

📋 Running Coding Standard Engine Tests
──────────────────────────────────────────────────
Tests for coding standard engine functionality
✅ Coding Standard Engine: 12/12 passed (890ms)

📊 Overall Test Results
======================
Total Tests: 45
✅ Passed: 42
❌ Failed: 3
⏭️  Skipped: 0
⏱️  Duration: 5670ms
📈 Success Rate: 93%
```

### HTML Report

The test runner generates an HTML report with:

- Test summary metrics
- Individual test results
- Performance metrics
- Coverage information

### JSON Report

A machine-readable JSON report is generated for CI/CD integration:

```json
{
  "timestamp": "2025-10-04T00:48:42.895Z",
  "config": {
    "verbose": false,
    "coverage": true,
    "performance": true
  },
  "results": [...],
  "summary": {
    "totalTests": 45,
    "totalPassed": 42,
    "totalFailed": 3,
    "successRate": 93
  }
}
```

## Continuous Integration

### GitHub Actions

```yaml
name: Phase 3 Team Collaboration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run Phase 3 tests
      run: npm run test:phase3:coverage
      
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
```

### Docker Testing

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run test:phase3

CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

#### 1. Test Timeout Errors

```bash
# Increase timeout in jest.config.js
testTimeout: 60000

# Or set environment variable
H2GNN_TEST_TIMEOUT=60000
```

#### 2. Memory Issues

```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 src/tests/test-runner.ts
```

#### 3. Storage Cleanup Issues

```bash
# Disable cleanup for debugging
H2GNN_TEST_CLEANUP=false npm run test:phase3
```

#### 4. Coverage Threshold Failures

```bash
# Lower coverage thresholds temporarily
# Update jest.config.js coverageThreshold values
```

### Debug Mode

```bash
# Run tests with debug output
DEBUG=h2gnn:test npm run test:phase3

# Run specific test with debug
npx jest src/tests/core/shared-learning-database.test.ts --verbose
```

### Test Isolation

```bash
# Run tests in isolation
npx jest --runInBand src/tests/

# Run single test file
npx jest src/tests/core/shared-learning-database.test.ts
```

## Best Practices

### Writing Tests

1. **Use descriptive test names**
   ```typescript
   test('should create a team with valid configuration', async () => {
     // Test implementation
   });
   ```

2. **Test one thing at a time**
   ```typescript
   test('should store memory successfully', async () => {
     // Test only memory storage
   });
   
   test('should retrieve memory by concept', async () => {
     // Test only memory retrieval
   });
   ```

3. **Use proper setup and teardown**
   ```typescript
   beforeEach(async () => {
     // Setup test environment
   });
   
   afterEach(async () => {
     // Cleanup test environment
   });
   ```

4. **Mock external dependencies**
   ```typescript
   const mockH2GNN = {
     learnWithMemory: jest.fn().mockResolvedValue(undefined)
   };
   ```

### Test Data Management

1. **Use unique test data**
   ```typescript
   const teamId = `test-team-${Date.now()}`;
   ```

2. **Clean up test data**
   ```typescript
   afterEach(async () => {
     await sharedDB.disconnect();
     fs.rmSync(testStoragePath, { recursive: true, force: true });
   });
   ```

3. **Use realistic test scenarios**
   ```typescript
   const realWorldCode = `
     interface User {
       id: number;
       name: string;
     }
   `;
   ```

### Performance Testing

1. **Test with realistic data sizes**
   ```typescript
   const largeCodebase = generateLargeCodebase(1000); // 1000 lines
   ```

2. **Measure performance metrics**
   ```typescript
   const startTime = Date.now();
   await executeWorkflow();
   const duration = Date.now() - startTime;
   expect(duration).toBeLessThan(5000); // 5 seconds
   ```

3. **Test concurrent operations**
   ```typescript
   const promises = Array.from({ length: 10 }, () => 
     executeConcurrentOperation()
   );
   await Promise.all(promises);
   ```

### Error Handling

1. **Test error conditions**
   ```typescript
   test('should handle invalid team ID gracefully', async () => {
     await expect(sharedDB.retrieveMemories('invalid-team'))
       .resolves.not.toThrow();
   });
   ```

2. **Test edge cases**
   ```typescript
   test('should handle empty code', async () => {
     const result = await workflow.execute('');
     expect(result).toBeDefined();
   });
   ```

3. **Test with malformed data**
   ```typescript
   test('should handle malformed code gracefully', async () => {
     const malformedCode = 'function incompleteFunction() {';
     await expect(workflow.execute(malformedCode))
       .resolves.not.toThrow();
   });
   ```

## Conclusion

The Phase 3 Team Collaboration testing suite provides comprehensive coverage of all team collaboration features. It ensures that the system works correctly, performs well, and integrates properly with the H²GNN system.

For questions or issues, please refer to the troubleshooting section or contact the development team.

---

**Last Updated**: October 4, 2025  
**Version**: 1.0.0  
**Maintainer**: H²GNN Development Team
