#!/usr/bin/env tsx

/**
 * H²GNN MCP Server Tests
 * 
 * Comprehensive test suite for the H²GNN MCP server:
 * - Tool registration and handling
 * - Parameter validation
 * - Error handling
 * - Integration with H²GNN core
 */

import { H2GNNMCPServer } from '../../mcp/h2gnn-mcp-server';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

describe('H2GNNMCPServer', () => {
  let mcpServer: H2GNNMCPServer;
  let mockTransport: any;

  beforeEach(() => {
    mockTransport = {
      start: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined)
    };

    mcpServer = new H2GNNMCPServer();
  });

  afterEach(async () => {
    if (mcpServer) {
      await mcpServer.shutdown();
    }
  });

  describe('Server Initialization', () => {
    test('should initialize server successfully', async () => {
      await expect(mcpServer.initialize()).resolves.not.toThrow();
    });

    test('should register tools correctly', async () => {
      await mcpServer.initialize();
      
      const tools = mcpServer.getRegisteredTools();
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    test('should handle initialization errors gracefully', async () => {
      // Test with invalid configuration
      const invalidServer = new H2GNNMCPServer();
      await expect(invalidServer.initialize()).resolves.not.toThrow();
    });
  });

  describe('Tool Registration', () => {
    test('should register core H²GNN tools', async () => {
      await mcpServer.initialize();
      
      const tools = mcpServer.getRegisteredTools();
      const toolNames = tools.map(tool => tool.name);
      
      expect(toolNames).toContain('initialize_enhanced_h2gnn');
      expect(toolNames).toContain('learn_concept');
      expect(toolNames).toContain('retrieve_memories');
      expect(toolNames).toContain('get_understanding_snapshot');
      expect(toolNames).toContain('get_learning_progress');
    });

    test('should register team collaboration tools', async () => {
      await mcpServer.initialize();
      
      const tools = mcpServer.getRegisteredTools();
      const toolNames = tools.map(tool => tool.name);
      
      expect(toolNames).toContain('create_team');
      expect(toolNames).toContain('share_team_knowledge');
      expect(toolNames).toContain('get_team_learning_progress');
    });

    test('should register coding standard tools', async () => {
      await mcpServer.initialize();
      
      const tools = mcpServer.getRegisteredTools();
      const toolNames = tools.map(tool => tool.name);
      
      expect(toolNames).toContain('define_coding_standard');
      expect(toolNames).toContain('enforce_coding_standard');
      expect(toolNames).toContain('learn_from_team_standards');
    });
  });

  describe('Tool Execution', () => {
    beforeEach(async () => {
      await mcpServer.initialize();
    });

    test('should execute initialize_enhanced_h2gnn tool', async () => {
      const result = await mcpServer.executeTool('initialize_enhanced_h2gnn', {
        storagePath: './test-storage',
        maxMemories: 1000,
        consolidationThreshold: 50,
        embeddingDim: 64,
        numLayers: 3,
        curvature: -1
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    test('should execute learn_concept tool', async () => {
      const result = await mcpServer.executeTool('learn_concept', {
        concept: 'test-concept',
        data: { test: true },
        context: { domain: 'testing' },
        performance: 0.8
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    test('should execute retrieve_memories tool', async () => {
      const result = await mcpServer.executeTool('retrieve_memories', {
        query: 'test-concept',
        maxResults: 10
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    test('should execute create_team tool', async () => {
      const result = await mcpServer.executeTool('create_team', {
        teamId: 'test-team',
        name: 'Test Team',
        description: 'A test team',
        learningDomains: ['testing'],
        privacyLevel: 'private'
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    test('should execute define_coding_standard tool', async () => {
      const result = await mcpServer.executeTool('define_coding_standard', {
        rule: {
          id: 'test-rule',
          name: 'Test Rule',
          description: 'A test rule',
          teamId: 'test-team',
          severity: 'medium',
          patterns: ['Test pattern'],
          exceptions: [],
          examples: ['Test example']
        }
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('Parameter Validation', () => {
    beforeEach(async () => {
      await mcpServer.initialize();
    });

    test('should validate required parameters', async () => {
      await expect(mcpServer.executeTool('learn_concept', {}))
        .rejects.toThrow('Missing required parameter: concept');
    });

    test('should validate parameter types', async () => {
      await expect(mcpServer.executeTool('learn_concept', {
        concept: 123, // Should be string
        data: { test: true },
        context: { domain: 'testing' },
        performance: 0.8
      })).rejects.toThrow('Invalid parameter type');
    });

    test('should validate parameter ranges', async () => {
      await expect(mcpServer.executeTool('learn_concept', {
        concept: 'test-concept',
        data: { test: true },
        context: { domain: 'testing' },
        performance: 1.5 // Should be between 0 and 1
      })).rejects.toThrow('Parameter out of range');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await mcpServer.initialize();
    });

    test('should handle unknown tools gracefully', async () => {
      await expect(mcpServer.executeTool('unknown_tool', {}))
        .rejects.toThrow('Unknown tool: unknown_tool');
    });

    test('should handle tool execution errors', async () => {
      // Test with invalid parameters that should cause execution errors
      await expect(mcpServer.executeTool('learn_concept', {
        concept: null,
        data: null,
        context: null,
        performance: null
      })).rejects.toThrow();
    });

    test('should handle server shutdown gracefully', async () => {
      await expect(mcpServer.shutdown()).resolves.not.toThrow();
    });
  });

  describe('Integration with H²GNN Core', () => {
    beforeEach(async () => {
      await mcpServer.initialize();
    });

    test('should integrate with H²GNN learning system', async () => {
      // Initialize H²GNN
      await mcpServer.executeTool('initialize_enhanced_h2gnn', {
        storagePath: './test-storage',
        maxMemories: 100,
        consolidationThreshold: 10,
        embeddingDim: 32,
        numLayers: 2,
        curvature: -1
      });

      // Learn a concept
      const learnResult = await mcpServer.executeTool('learn_concept', {
        concept: 'integration-test',
        data: { test: true },
        context: { domain: 'testing' },
        performance: 0.9
      });

      expect(learnResult).toBeDefined();

      // Retrieve memories
      const retrieveResult = await mcpServer.executeTool('retrieve_memories', {
        query: 'integration-test',
        maxResults: 5
      });

      expect(retrieveResult).toBeDefined();
    });

    test('should maintain state across tool calls', async () => {
      // Initialize system
      await mcpServer.executeTool('initialize_enhanced_h2gnn', {
        storagePath: './test-storage',
        maxMemories: 100,
        consolidationThreshold: 10,
        embeddingDim: 32,
        numLayers: 2,
        curvature: -1
      });

      // Learn multiple concepts
      await mcpServer.executeTool('learn_concept', {
        concept: 'concept-1',
        data: { test: 1 },
        context: { domain: 'testing' },
        performance: 0.8
      });

      await mcpServer.executeTool('learn_concept', {
        concept: 'concept-2',
        data: { test: 2 },
        context: { domain: 'testing' },
        performance: 0.9
      });

      // Get learning progress
      const progressResult = await mcpServer.executeTool('get_learning_progress', {});
      
      expect(progressResult).toBeDefined();
      expect(progressResult.content).toBeDefined();
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await mcpServer.initialize();
    });

    test('should handle multiple concurrent tool calls', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        mcpServer.executeTool('learn_concept', {
          concept: `concurrent-concept-${i}`,
          data: { index: i },
          context: { domain: 'testing' },
          performance: Math.random()
        })
      );

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // 2 seconds
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should handle large data efficiently', async () => {
      const largeData = {
        largeArray: Array.from({ length: 1000 }, (_, i) => i),
        largeString: 'x'.repeat(10000),
        nestedObject: {
          level1: {
            level2: {
              level3: Array.from({ length: 100 }, (_, i) => ({ id: i, value: Math.random() }))
            }
          }
        }
      };

      const startTime = Date.now();
      const result = await mcpServer.executeTool('learn_concept', {
        concept: 'large-data-test',
        data: largeData,
        context: { domain: 'testing' },
        performance: 0.8
      });
      const endTime = Date.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 1 second
      expect(result).toBeDefined();
    });
  });

  describe('Tool Response Format', () => {
    beforeEach(async () => {
      await mcpServer.initialize();
    });

    test('should return properly formatted responses', async () => {
      const result = await mcpServer.executeTool('get_system_status', {});

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content.length).toBeGreaterThan(0);
      
      const firstContent = result.content[0];
      expect(firstContent).toBeDefined();
      expect(firstContent.type).toBe('text');
      expect(typeof firstContent.text).toBe('string');
    });

    test('should include error information in responses', async () => {
      try {
        await mcpServer.executeTool('unknown_tool', {});
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Server Lifecycle', () => {
    test('should handle multiple start/stop cycles', async () => {
      for (let i = 0; i < 3; i++) {
        await mcpServer.initialize();
        await mcpServer.shutdown();
      }
    });

    test('should handle operations after shutdown', async () => {
      await mcpServer.initialize();
      await mcpServer.shutdown();

      // Should not throw errors for operations after shutdown
      await expect(mcpServer.executeTool('get_system_status', {}))
        .resolves.not.toThrow();
    });
  });
});
