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
    maxWorkers: '50%',
    moduleNameMapping: {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    collectCoverageFrom: [
      'src/core/shared-learning-database.ts',
      'src/rules/coding-standard-engine.ts',
      'src/workflows/team-collaboration-workflow.ts',
      'src/workflows/knowledge-sharing-workflow.ts',
      'src/workflows/team-standards-workflow.ts',
      'src/mcp/enhanced-h2gnn-mcp-server.ts',
      'src/demo/team-collaboration-demo.ts'
    ]
  };