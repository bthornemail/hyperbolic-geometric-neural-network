/**
 * Test suite for Enhanced H²GNN MCP Server
 * Tests MCP server functionality and tool execution
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedH2GNNMCPServer } from '../../mcp/enhanced-h2gnn-mcp-server';

describe('Enhanced H²GNN MCP Server', () => {
  let server: EnhancedH2GNNMCPServer;

  beforeEach(async () => {
    server = new EnhancedH2GNNMCPServer({
      storagePath: './test-mcp-persistence',
      maxMemories: 1000,
      consolidationThreshold: 100
    });
    await server.initialize();
  });

  afterEach(async () => {
    await server.cleanup();
    // Clean up test files
    try {
      const fs = await import('fs/promises');
      await fs.rm('./test-mcp-persistence', { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Server Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(server).toBeDefined();
      expect(server.isInitialized()).toBe(true);
    });

    it('should register all required tools', () => {
      const tools = server.getRegisteredTools();
      
      expect(tools).toContain('initialize_enhanced_h2gnn_hd');
      expect(tools).toContain('learn_concept_hd');
      expect(tools).toContain('retrieve_memories_hd');
      expect(tools).toContain('get_system_status_hd');
      expect(tools).toContain('get_learning_progress_hd');
    });

    it('should handle initialization errors gracefully', async () => {
      const invalidServer = new EnhancedH2GNNMCPServer({
        storagePath: '/invalid/path/that/does/not/exist'
      });
      
      await expect(invalidServer.initialize())
        .rejects.toThrow();
    });
  });

  describe('Tool Execution', () => {
    it('should execute initialize_enhanced_h2gnn_hd tool', async () => {
      const result = await server.executeTool('initialize_enhanced_h2gnn_hd', {
        storagePath: './test-persistence',
        maxMemories: 1000,
        consolidationThreshold: 100,
        embeddingDim: 8,
        numLayers: 2,
        curvature: -1
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.h2gnnAddress).toBeDefined();
      expect(result.rpcEndpoint).toBeDefined();
    });

    it('should execute learn_concept_hd tool', async () => {
      const result = await server.executeTool('learn_concept_hd', {
        concept: 'test_concept',
        data: { examples: [], relationships: [] },
        context: { domain: 'test' },
        performance: 0.8
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.memoryId).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should execute retrieve_memories_hd tool', async () => {
      // First learn a concept
      await server.executeTool('learn_concept_hd', {
        concept: 'retrieval_test',
        data: { examples: [] },
        context: { domain: 'test' }
      });
      
      const result = await server.executeTool('retrieve_memories_hd', {
        query: 'retrieval test',
        maxResults: 5
      });
      
      expect(result).toBeDefined();
      expect(result.memories).toBeDefined();
      expect(Array.isArray(result.memories)).toBe(true);
    });

    it('should execute get_system_status_hd tool', async () => {
      const result = await server.executeTool('get_system_status_hd', {});
      
      expect(result).toBeDefined();
      expect(result.totalMemories).toBeGreaterThanOrEqual(0);
      expect(result.understandingSnapshots).toBeGreaterThanOrEqual(0);
      expect(result.learningDomains).toBeGreaterThanOrEqual(0);
      expect(result.averageConfidence).toBeGreaterThanOrEqual(0);
    });

    it('should execute get_learning_progress_hd tool', async () => {
      const result = await server.executeTool('get_learning_progress_hd', {});
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.domains)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tool names', async () => {
      await expect(server.executeTool('invalid_tool', {}))
        .rejects.toThrow('Tool not found: invalid_tool');
    });

    it('should handle invalid tool parameters', async () => {
      await expect(server.executeTool('learn_concept_hd', {
        concept: '', // Invalid empty concept
        data: null
      })).rejects.toThrow('Invalid parameters');
    });

    it('should handle tool execution errors', async () => {
      // Simulate an error by passing invalid data
      await expect(server.executeTool('learn_concept_hd', {
        concept: null,
        data: null
      })).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent tool executions', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        server.executeTool('learn_concept_hd', {
          concept: `concurrent_concept_${i}`,
          data: { examples: [] },
          context: { domain: 'concurrent' }
        })
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle large data payloads', async () => {
      const largeData = {
        examples: Array.from({ length: 1000 }, (_, i) => ({
          input: `example_${i}`,
          output: `result_${i}`
        })),
        relationships: Array.from({ length: 500 }, (_, i) => ({
          source: `node_${i}`,
          target: `node_${i + 1}`,
          type: 'related'
        }))
      };
      
      const startTime = Date.now();
      const result = await server.executeTool('learn_concept_hd', {
        concept: 'large_data_concept',
        data: largeData,
        context: { domain: 'large_data' }
      });
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Integration', () => {
    it('should integrate with core H²GNN functionality', async () => {
      // Initialize the system
      await server.executeTool('initialize_enhanced_h2gnn_hd', {
        storagePath: './test-integration',
        maxMemories: 1000
      });
      
      // Learn a concept
      const learnResult = await server.executeTool('learn_concept_hd', {
        concept: 'integration_test',
        data: { examples: [] },
        context: { domain: 'integration' }
      });
      
      expect(learnResult.success).toBe(true);
      
      // Retrieve memories
      const retrieveResult = await server.executeTool('retrieve_memories_hd', {
        query: 'integration test'
      });
      
      expect(retrieveResult.memories).toBeDefined();
    });

    it('should maintain state across tool executions', async () => {
      // Learn multiple concepts
      await server.executeTool('learn_concept_hd', {
        concept: 'concept_1',
        data: { examples: [] },
        context: { domain: 'state_test' }
      });
      
      await server.executeTool('learn_concept_hd', {
        concept: 'concept_2',
        data: { examples: [] },
        context: { domain: 'state_test' }
      });
      
      // Check system status
      const status = await server.executeTool('get_system_status_hd', {});
      
      expect(status.totalMemories).toBeGreaterThanOrEqual(2);
    });
  });
});
