# Quick Testing Guide - Phase 3 Team Collaboration

## 🚀 Quick Start

### Run All Tests
```bash
npm run test:phase3
```

### Run with Verbose Output
```bash
npm run test:phase3:verbose
```

### Run with Performance Tests
```bash
npm run test:phase3:performance
```

## 📋 Test Categories

### 1. Core Components
- **Shared Learning Database**: Team management, memory storage, knowledge sharing
- **Coding Standard Engine**: Rule definition, enforcement, team learning

### 2. Workflows
- **Team Learning Workflow**: Code analysis, insight generation, refactoring suggestions
- **Knowledge Sharing Workflow**: Cross-team knowledge transfer
- **Team Standards Workflow**: Standards definition and enforcement

### 3. MCP Tools
- **define_coding_standard**: Define team coding rules
- **create_team**: Create collaborative teams
- **share_team_knowledge**: Share knowledge between teams

### 4. Integration Tests
- **End-to-End Scenarios**: Complete team collaboration workflows
- **Real-World Scenarios**: Agile teams, open source projects

## 🔧 Test Commands

```bash
# Run specific test suites
npm run test:team-collaboration

# Run individual test files
npx jest src/tests/core/shared-learning-database.test.ts
npx jest src/tests/rules/coding-standard-engine.test.ts
npx jest src/tests/workflows/team-collaboration-workflow.test.ts
npx jest src/tests/mcp/team-collaboration-mcp.test.ts
npx jest src/tests/integration/team-collaboration-e2e.test.ts

# Run with coverage
npm run test:phase3:coverage

# Run in watch mode
npx jest --watch src/tests/
```

## 📊 Test Results

### Console Output
```
🚀 Starting Phase 3 Team Collaboration Test Suite
================================================

📋 Running Shared Learning Database Tests
✅ Shared Learning Database: 15/15 passed (1250ms)

📋 Running Coding Standard Engine Tests  
✅ Coding Standard Engine: 12/12 passed (890ms)

📊 Overall Test Results
======================
Total Tests: 45
✅ Passed: 42
❌ Failed: 3
📈 Success Rate: 93%
```

### HTML Report
- Location: `./test-results/test-report.html`
- Includes: Test results, performance metrics, coverage information

### JSON Report
- Location: `./test-results/test-report.json`
- Format: Machine-readable for CI/CD integration

## 🐛 Troubleshooting

### Common Issues

#### Test Timeout
```bash
# Increase timeout
H2GNN_TEST_TIMEOUT=60000 npm run test:phase3
```

#### Memory Issues
```bash
# Increase Node.js memory
node --max-old-space-size=4096 src/tests/test-runner.ts
```

#### Storage Cleanup
```bash
# Disable cleanup for debugging
H2GNN_TEST_CLEANUP=false npm run test:phase3
```

### Debug Mode
```bash
# Run with debug output
DEBUG=h2gnn:test npm run test:phase3

# Run specific test with verbose output
npx jest src/tests/core/shared-learning-database.test.ts --verbose
```

## 📈 Coverage Requirements

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 🔄 Continuous Integration

### GitHub Actions
```yaml
- name: Run Phase 3 tests
  run: npm run test:phase3:coverage
```

### Docker
```bash
docker run --rm -v $(pwd):/app -w /app node:18 npm run test:phase3
```

## 📚 Documentation

- **Full Documentation**: `docs/07-intelligence/testing/TESTING_SUITE_DOCUMENTATION.md`
- **Test Setup**: `src/tests/setup.ts`
- **Test Runner**: `src/tests/test-runner.ts`

## 🎯 Success Criteria

✅ All tests pass  
✅ Coverage thresholds met  
✅ Performance benchmarks achieved  
✅ No memory leaks  
✅ Clean test isolation  

---

**Need Help?** Check the full documentation or contact the development team.
