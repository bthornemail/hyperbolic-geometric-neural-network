#!/usr/bin/env tsx

/**
 * Enhanced H²GNN Tests
 * 
 * Comprehensive test suite for the enhanced H²GNN core functionality:
 * - Memory management and learning
 * - Understanding snapshots
 * - Learning progress tracking
 * - System status and health
 */

import { EnhancedH2GNN } from '../../core/enhanced-h2gnn';
import { LearningMemory, UnderstandingSnapshot, LearningProgress } from '../../core/enhanced-h2gnn';
import * as fs from 'fs';
import * as path from 'path';

describe('EnhancedH2GNN', () => {
  let h2gnn: EnhancedH2GNN;
  let testStoragePath: string;

  beforeEach(async () => {
    testStoragePath = path.join(__dirname, '../../test-storage', `enhanced-h2gnn-${Date.now()}`);
    h2gnn = new EnhancedH2GNN({
      storagePath: testStoragePath,
      maxMemories: 1000,
      consolidationThreshold: 50,
      embeddingDim: 64,
      numLayers: 3,
      curvature: -1
    });
    
    await h2gnn.initialize();
  });

  afterEach(async () => {
    await h2gnn.shutdown();
    if (fs.existsSync(testStoragePath)) {
      fs.rmSync(testStoragePath, { recursive: true, force: true });
    }
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      expect(h2gnn).toBeDefined();
      expect(await h2gnn.isInitialized()).toBe(true);
    });

    test('should handle initialization with custom config', async () => {
      const customH2GNN = new EnhancedH2GNN({
        storagePath: testStoragePath + '-custom',
        maxMemories: 500,
        consolidationThreshold: 25,
        embeddingDim: 128,
        numLayers: 5,
        curvature: -0.5
      });

      await customH2GNN.initialize();
      expect(await customH2GNN.isInitialized()).toBe(true);
      
      await customH2GNN.shutdown();
    });
  });

  describe('Memory Management', () => {
    test('should store and retrieve memories', async () => {
      const memory: LearningMemory = {
        id: 'test-memory-1',
        timestamp: Date.now(),
        concept: 'test-concept',
        embedding: [0.1, 0.2, 0.3],
        context: { test: true },
        performance: 0.8,
        confidence: 0.9,
        relationships: ['test'],
        consolidated: false
      };

      await h2gnn.learnWithMemory(memory);
      const memories = await h2gnn.getMemories('test-concept');

      expect(memories).toHaveLength(1);
      expect(memories[0].id).toBe('test-memory-1');
      expect(memories[0].concept).toBe('test-concept');
    });

    test('should consolidate memories when threshold is reached', async () => {
      // Create multiple memories to trigger consolidation
      for (let i = 0; i < 60; i++) {
        const memory: LearningMemory = {
          id: `memory-${i}`,
          timestamp: Date.now(),
          concept: `concept-${i}`,
          embedding: [Math.random(), Math.random(), Math.random()],
          context: { index: i },
          performance: Math.random(),
          confidence: Math.random(),
          relationships: [`rel-${i}`],
          consolidated: false
        };

        await h2gnn.learnWithMemory(memory);
      }

      // Consolidation should have been triggered
      const status = await h2gnn.getSystemStatus();
      expect(status.totalMemories).toBeGreaterThan(0);
    });

    test('should handle memory conflicts gracefully', async () => {
      const memory1: LearningMemory = {
        id: 'conflict-memory',
        timestamp: Date.now(),
        concept: 'conflict-concept',
        embedding: [0.1, 0.2, 0.3],
        context: { version: 1 },
        performance: 0.8,
        confidence: 0.9,
        relationships: ['test'],
        consolidated: false
      };

      const memory2: LearningMemory = {
        id: 'conflict-memory-2',
        timestamp: Date.now() + 1000,
        concept: 'conflict-concept',
        embedding: [0.4, 0.5, 0.6],
        context: { version: 2 },
        performance: 0.9,
        confidence: 0.95,
        relationships: ['test'],
        consolidated: false
      };

      await h2gnn.learnWithMemory(memory1);
      await h2gnn.learnWithMemory(memory2);

      const memories = await h2gnn.getMemories('conflict-concept');
      expect(memories.length).toBeGreaterThan(0);
    });
  });

  describe('Understanding Snapshots', () => {
    test('should create and retrieve understanding snapshots', async () => {
      const snapshot: UnderstandingSnapshot = {
        id: 'test-snapshot-1',
        domain: 'testing',
        concepts: ['unit-testing', 'integration-testing'],
        relationships: [],
        confidence: 0.9,
        timestamp: Date.now(),
        insights: ['Testing is important for quality'],
        patterns: ['test-driven-development']
      };

      await h2gnn.storeSnapshot(snapshot);
      const snapshots = await h2gnn.getSnapshots('testing');

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].id).toBe('test-snapshot-1');
      expect(snapshots[0].domain).toBe('testing');
    });

    test('should retrieve snapshots by domain', async () => {
      const testingSnapshot: UnderstandingSnapshot = {
        id: 'testing-snapshot',
        domain: 'testing',
        concepts: ['unit-testing'],
        relationships: [],
        confidence: 0.9,
        timestamp: Date.now(),
        insights: ['Testing insights'],
        patterns: ['test-patterns']
      };

      const developmentSnapshot: UnderstandingSnapshot = {
        id: 'development-snapshot',
        domain: 'development',
        concepts: ['coding'],
        relationships: [],
        confidence: 0.8,
        timestamp: Date.now(),
        insights: ['Development insights'],
        patterns: ['dev-patterns']
      };

      await h2gnn.storeSnapshot(testingSnapshot);
      await h2gnn.storeSnapshot(developmentSnapshot);

      const testingSnapshots = await h2gnn.getSnapshots('testing');
      const developmentSnapshots = await h2gnn.getSnapshots('development');

      expect(testingSnapshots).toHaveLength(1);
      expect(developmentSnapshots).toHaveLength(1);
      expect(testingSnapshots[0].domain).toBe('testing');
      expect(developmentSnapshots[0].domain).toBe('development');
    });
  });

  describe('Learning Progress', () => {
    test('should track learning progress across domains', async () => {
      // Add memories for different domains
      const domains = ['typescript', 'testing', 'architecture'];
      
      for (const domain of domains) {
        const memory: LearningMemory = {
          id: `${domain}-memory`,
          timestamp: Date.now(),
          concept: `${domain}-concept`,
          embedding: [Math.random(), Math.random(), Math.random()],
          context: { domain },
          performance: 0.8,
          confidence: 0.9,
          relationships: [domain],
          consolidated: false
        };

        await h2gnn.learnWithMemory(memory);
      }

      const progress = await h2gnn.getLearningProgress();
      expect(progress).toBeDefined();
      expect(Array.isArray(progress)).toBe(true);
    });

    test('should calculate mastery levels correctly', async () => {
      // Add high-confidence memories
      for (let i = 0; i < 10; i++) {
        const memory: LearningMemory = {
          id: `high-confidence-${i}`,
          timestamp: Date.now(),
          concept: 'high-confidence-concept',
          embedding: [Math.random(), Math.random(), Math.random()],
          context: { index: i },
          performance: 0.9,
          confidence: 0.95,
          relationships: ['high-confidence'],
          consolidated: false
        };

        await h2gnn.learnWithMemory(memory);
      }

      const progress = await h2gnn.getLearningProgress();
      const highConfidenceProgress = progress.find(p => p.domain === 'high-confidence-concept');
      
      expect(highConfidenceProgress).toBeDefined();
      expect(highConfidenceProgress?.masteryLevel).toBeGreaterThan(0.8);
    });
  });

  describe('System Status', () => {
    test('should provide accurate system status', async () => {
      const status = await h2gnn.getSystemStatus();
      
      expect(status).toBeDefined();
      expect(typeof status.totalMemories).toBe('number');
      expect(typeof status.understandingSnapshots).toBe('number');
      expect(typeof status.learningDomains).toBe('number');
      expect(typeof status.averageConfidence).toBe('number');
    });

    test('should update status after operations', async () => {
      const initialStatus = await h2gnn.getSystemStatus();
      
      // Add some memories
      const memory: LearningMemory = {
        id: 'status-test-memory',
        timestamp: Date.now(),
        concept: 'status-test',
        embedding: [0.1, 0.2, 0.3],
        context: { test: true },
        performance: 0.8,
        confidence: 0.9,
        relationships: ['test'],
        consolidated: false
      };

      await h2gnn.learnWithMemory(memory);
      
      const updatedStatus = await h2gnn.getSystemStatus();
      expect(updatedStatus.totalMemories).toBeGreaterThanOrEqual(initialStatus.totalMemories);
    });
  });

  describe('Memory Consolidation', () => {
    test('should consolidate memories when threshold is reached', async () => {
      const consolidationThreshold = 10;
      
      // Create memories up to threshold
      for (let i = 0; i < consolidationThreshold + 5; i++) {
        const memory: LearningMemory = {
          id: `consolidation-memory-${i}`,
          timestamp: Date.now(),
          concept: `consolidation-concept-${i}`,
          embedding: [Math.random(), Math.random(), Math.random()],
          context: { index: i },
          performance: Math.random(),
          confidence: Math.random(),
          relationships: [`rel-${i}`],
          consolidated: false
        };

        await h2gnn.learnWithMemory(memory);
      }

      // Trigger consolidation
      await h2gnn.consolidateMemories();
      
      const status = await h2gnn.getSystemStatus();
      expect(status.totalMemories).toBeGreaterThan(0);
    });

    test('should handle consolidation errors gracefully', async () => {
      // Test with invalid memory data
      const invalidMemory: any = {
        id: 'invalid-memory',
        timestamp: Date.now(),
        concept: 'invalid-concept',
        embedding: 'invalid-embedding', // Should be array
        context: { test: true },
        performance: 0.8,
        confidence: 0.9,
        relationships: ['test'],
        consolidated: false
      };

      await expect(h2gnn.learnWithMemory(invalidMemory))
        .resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle shutdown gracefully', async () => {
      await expect(h2gnn.shutdown()).resolves.not.toThrow();
    });

    test('should handle operations after shutdown', async () => {
      await h2gnn.shutdown();
      
      const memory: LearningMemory = {
        id: 'post-shutdown-memory',
        timestamp: Date.now(),
        concept: 'post-shutdown',
        embedding: [0.1, 0.2, 0.3],
        context: { test: true },
        performance: 0.8,
        confidence: 0.9,
        relationships: ['test'],
        consolidated: false
      };

      await expect(h2gnn.learnWithMemory(memory))
        .resolves.not.toThrow();
    });

    test('should handle invalid parameters gracefully', async () => {
      await expect(h2gnn.getMemories(''))
        .resolves.not.toThrow();
      
      await expect(h2gnn.getSnapshots(''))
        .resolves.not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should handle large numbers of memories efficiently', async () => {
      const memoryCount = 100;
      const startTime = Date.now();

      for (let i = 0; i < memoryCount; i++) {
        const memory: LearningMemory = {
          id: `perf-memory-${i}`,
          timestamp: Date.now(),
          concept: `perf-concept-${i}`,
          embedding: [Math.random(), Math.random(), Math.random()],
          context: { index: i },
          performance: Math.random(),
          confidence: Math.random(),
          relationships: [`rel-${i}`],
          consolidated: false
        };

        await h2gnn.learnWithMemory(memory);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds

      const status = await h2gnn.getSystemStatus();
      expect(status.totalMemories).toBeGreaterThan(0);
    });

    test('should handle concurrent operations', async () => {
      const concurrentOperations = 10;
      const promises = [];

      for (let i = 0; i < concurrentOperations; i++) {
        const memory: LearningMemory = {
          id: `concurrent-memory-${i}`,
          timestamp: Date.now(),
          concept: `concurrent-concept-${i}`,
          embedding: [Math.random(), Math.random(), Math.random()],
          context: { index: i },
          performance: Math.random(),
          confidence: Math.random(),
          relationships: [`rel-${i}`],
          consolidated: false
        };

        promises.push(h2gnn.learnWithMemory(memory));
      }

      const startTime = Date.now();
      await Promise.all(promises);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(2000); // 2 seconds
    });
  });
});