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
        branches: 70,
        functions: 75,
        lines: 75,
        statements: 75
      },
      // Stricter thresholds for core components
      'src/core/': {
        branches: 85,
        functions: 90,
        lines: 90,
        statements: 90
      },
      'src/math/': {
        branches: 80,
        functions: 85,
        lines: 85,
        statements: 85
      },
      'src/workflows/': {
        branches: 80,
        functions: 85,
        lines: 85,
        statements: 85
      },
      'src/mcp/': {
        branches: 75,
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
      // Core H²GNN components
      'src/core/**/*.ts',
      'src/core/transports/**/*.ts',
      
      // Analysis and intelligence
      'src/analysis/**/*.ts',
      'src/intelligence/**/*.ts',
      
      // Math and geometric components
      'src/math/**/*.ts',
      'src/layers/**/*.ts',
      
      // MCP servers and integration
      'src/mcp/**/*.ts',
      'src/integration/**/*.ts',
      
      // Workflows and automation
      'src/workflows/**/*.ts',
      'src/agent-workflows/**/*.ts',
      
      // Rules and standards
      'src/rules/**/*.ts',
      
      // Generation and training
      'src/generation/**/*.ts',
      'src/training/**/*.ts',
      'src/transfer/**/*.ts',
      
      // Visualization
      'src/visualization/**/*.ts',
      
      // LLM and AI components
      'src/llm/**/*.ts',
      
      // Refactoring tools
      'src/refactoring/**/*.ts',
      
      // Demo components (exclude from coverage if needed)
      // 'src/demo/**/*.ts',
      
      // Exclude test files and configuration
      '!src/**/*.test.ts',
      '!src/**/*.spec.ts',
      '!src/tests/**/*.ts',
      '!src/**/*.config.ts',
      '!src/**/*.setup.ts',
      '!src/vite-env.d.ts',
      '!src/main.tsx',
      '!src/App.tsx',
      '!src/index.css'
    ]
  };