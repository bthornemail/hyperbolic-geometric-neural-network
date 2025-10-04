#!/usr/bin/env tsx

/**
 * Test Setup for Phase 3 Team Collaboration Features
 * 
 * This setup file provides:
 * - Global test configuration
 * - Mock implementations
 * - Test utilities
 * - Environment setup
 */

import * as fs from 'fs';
import * as path from 'path';
import { vi } from 'vitest';

// Global test configuration
const TEST_CONFIG = {
  storagePath: path.join(__dirname, '../test-storage'),
  timeout: 30000,
  cleanup: true
};

// Ensure test storage directory exists
if (!fs.existsSync(TEST_CONFIG.storagePath)) {
  fs.mkdirSync(TEST_CONFIG.storagePath, { recursive: true });
}

// Global test utilities
global.testUtils = {
  /**
   * Create a unique test storage path
   */
  createTestStoragePath: (testName: string): string => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    return path.join(TEST_CONFIG.storagePath, `${testName}-${timestamp}-${randomId}`);
  },

  /**
   * Clean up test storage
   */
  cleanupTestStorage: (storagePath: string): void => {
    if (TEST_CONFIG.cleanup && fs.existsSync(storagePath)) {
      try {
        fs.rmSync(storagePath, { recursive: true, force: true });
      } catch (error) {
        console.warn(`Warning: Could not clean up test storage: ${error.message}`);
      }
    }
  },

  /**
   * Wait for async operations to complete
   */
  waitFor: async (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Generate mock team data
   */
  generateMockTeam: (overrides: any = {}) => ({
    teamId: `test-team-${Date.now()}`,
    name: 'Test Team',
    description: 'A test team for unit testing',
    members: [],
    learningDomains: ['testing'],
    sharedConcepts: [],
    privacyLevel: 'private',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides
  }),

  /**
   * Generate mock learning memory
   */
  generateMockMemory: (overrides: any = {}) => ({
    id: `test-memory-${Date.now()}`,
    timestamp: Date.now(),
    concept: 'test-concept',
    embedding: [0.1, 0.2, 0.3],
    context: { team: 'test-team' },
    performance: 0.8,
    confidence: 0.9,
    relationships: ['test'],
    consolidated: false,
    ...overrides
  }),

  /**
   * Generate mock coding standard rule
   */
  generateMockRule: (overrides: any = {}) => ({
    id: `test-rule-${Date.now()}`,
    name: 'Test Rule',
    description: 'A test rule for unit testing',
    teamId: 'test-team',
    severity: 'medium',
    patterns: ['Test pattern'],
    exceptions: [],
    examples: ['Test example'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides
  }),

  /**
   * Generate mock code for testing
   */
  generateMockCode: (type: 'clean' | 'violations' | 'complex' = 'clean'): string => {
    switch (type) {
      case 'clean':
        return `
          interface User {
            id: number;
            name: string;
          }

          class UserService {
            async createUser(userData: Partial<User>): Promise<User> {
              return {
                id: Date.now(),
                name: userData.name || ''
              };
            }
          }
        `;

      case 'violations':
        return `
          const user_name = "john"; // snake_case violation
          function veryLongFunction() {
            // This function is too long
            return "complex";
          }
        `;

      case 'complex':
        return `
          interface ComplexInterface {
            id: number;
            name: string;
            data: any;
            metadata: {
              created: Date;
              updated: Date;
              version: string;
            };
          }

          class ComplexService {
            private cache: Map<string, ComplexInterface> = new Map();
            private config: any;

            async processComplexData(data: ComplexInterface[]): Promise<ComplexInterface[]> {
              try {
                const results = await Promise.all(
                  data.map(async (item) => {
                    const processed = await this.processItem(item);
                    this.cache.set(item.id.toString(), processed);
                    return processed;
                  })
                );
                return results;
              } catch (error) {
                console.error('Processing failed:', error);
                throw new Error('Complex processing failed');
              }
            }

            private async processItem(item: ComplexInterface): Promise<ComplexInterface> {
              // Complex processing logic
              return item;
            }
          }
        `;

      default:
        return 'const test = "value";';
    }
  }
};

// Mock implementations for external dependencies
global.mocks = {
  /**
   * Mock H2GNN instance
   */
  mockH2GNN: {
    learnWithMemory: vi.fn().mockResolvedValue(undefined),
    getMemories: vi.fn().mockResolvedValue([]),
    consolidateMemories: vi.fn().mockResolvedValue(undefined),
    getSystemStatus: vi.fn().mockResolvedValue({
      totalMemories: 0,
      understandingSnapshots: 0,
      learningDomains: 0,
      averageConfidence: 0
    })
  },

  /**
   * Mock file system operations
   */
  mockFileSystem: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
    rmSync: vi.fn()
  },

  /**
   * Mock console operations
   */
  mockConsole: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
};

// Global test hooks
beforeAll(() => {
  console.log('🚀 Setting up Phase 3 Team Collaboration Tests');
});

afterAll(() => {
  console.log('🧹 Cleaning up test environment');
  
  // Clean up test storage
  if (TEST_CONFIG.cleanup && fs.existsSync(TEST_CONFIG.storagePath)) {
    try {
      fs.rmSync(TEST_CONFIG.storagePath, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Warning: Could not clean up test storage: ${error.message}`);
    }
  }
});

// Global test timeout
// Note: Vitest handles timeouts differently, this is for Jest compatibility
if (typeof jest !== 'undefined') {
  jest.setTimeout(TEST_CONFIG.timeout);
}

// Export test utilities for use in tests
export { TEST_CONFIG };
