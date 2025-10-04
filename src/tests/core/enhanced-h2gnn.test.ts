/**
 * Test suite for Enhanced H²GNN System
 * Tests advanced learning capabilities, persistence, and memory management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  EnhancedH2GNN, 
  LearningMemory, 
  UnderstandingSnapshot,
  LearningProgress,
  LearningSession 
} from '../../core/enhanced-h2gnn';
import { createVector } from '../../math/hyperbolic-arithmetic';

describe('Enhanced H²GNN System', () => {
  let enhancedH2GNN: EnhancedH2GNN;
  const testStoragePath = './test-persistence';

  beforeEach(async () => {
    enhancedH2GNN = new EnhancedH2GNN({
      storagePath: testStoragePath,
      maxMemories: 1000,
      consolidationThreshold: 100,
      embeddingDim: 8,
      numLayers: 2,
      curvature: -1
    });
    await enhancedH2GNN.initialize();
  });

  afterEach(async () => {
    await enhancedH2GNN.cleanup();
    // Clean up test files
    try {
      const fs = await import('fs/promises');
      await fs.rm(testStoragePath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Initialization', () => {
    it('should initialize with valid configuration', () => {
      expect(enhancedH2GNN).toBeDefined();
      expect(enhancedH2GNN.isInitialized()).toBe(true);
    });

    it('should create storage directories', async () => {
      const fs = await import('fs/promises');
      const stats = await fs.stat(testStoragePath);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should initialize with default configuration', async () => {
      const defaultH2GNN = new EnhancedH2GNN();
      await defaultH2GNN.initialize();
      
      expect(defaultH2GNN).toBeDefined();
      expect(defaultH2GNN.isInitialized()).toBe(true);
    });
  });

  describe('Learning Capabilities', () => {
    it('should learn new concepts', async () => {
      const concept = 'machine_learning';
      const data = {
        examples: [
          { input: 'neural networks', output: 'deep learning' },
          { input: 'supervised learning', output: 'classification' }
        ],
        relationships: [
          { source: 'neural networks', target: 'deep learning', type: 'is_a' }
        ]
      };
      const context = { domain: 'artificial_intelligence', complexity: 0.7 };
      
      const result = await enhancedH2GNN.learnConcept(concept, data, context, 0.8);
      
      expect(result.success).toBe(true);
      expect(result.memoryId).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle concept learning with different data types', async () => {
      const concept = 'mathematics';
      const data = {
        formulas: ['E = mc²', 'a² + b² = c²'],
        concepts: ['algebra', 'geometry', 'calculus'],
        relationships: [
          { source: 'algebra', target: 'calculus', type: 'prerequisite' }
        ]
      };
      
      const result = await enhancedH2GNN.learnConcept(concept, data, { domain: 'mathematics' });
      
      expect(result.success).toBe(true);
      expect(result.memoryId).toBeDefined();
    });

    it('should validate learning data', async () => {
      const invalidData = null;
      
      await expect(enhancedH2GNN.learnConcept('test', invalidData as any))
        .rejects.toThrow('Learning data cannot be null or undefined');
    });
  });

  describe('Memory Management', () => {
    beforeEach(async () => {
      // Learn some concepts for testing
      await enhancedH2GNN.learnConcept('ai', { examples: [] }, { domain: 'technology' });
      await enhancedH2GNN.learnConcept('machine_learning', { examples: [] }, { domain: 'technology' });
      await enhancedH2GNN.learnConcept('neural_networks', { examples: [] }, { domain: 'technology' });
    });

    it('should retrieve relevant memories', async () => {
      const memories = await enhancedH2GNN.retrieveMemories('artificial intelligence', 5);
      
      expect(memories).toBeDefined();
      expect(memories.length).toBeGreaterThan(0);
      expect(memories.length).toBeLessThanOrEqual(5);
    });

    it('should retrieve memories by domain', async () => {
      const technologyMemories = await enhancedH2GNN.retrieveMemoriesByDomain('technology');
      
      expect(technologyMemories).toBeDefined();
      expect(technologyMemories.length).toBeGreaterThan(0);
    });

    it('should consolidate memories when threshold reached', async () => {
      // Add many memories to trigger consolidation
      for (let i = 0; i < 150; i++) {
        await enhancedH2GNN.learnConcept(`concept_${i}`, { examples: [] }, { domain: 'test' });
      }
      
      const consolidated = await enhancedH2GNN.consolidateMemories();
      expect(consolidated).toBeDefined();
      expect(consolidated.consolidatedCount).toBeGreaterThan(0);
    });

    it('should get memory statistics', async () => {
      const stats = await enhancedH2GNN.getMemoryStatistics();
      
      expect(stats).toBeDefined();
      expect(stats.totalMemories).toBeGreaterThan(0);
      expect(stats.domains).toBeDefined();
      expect(stats.averageConfidence).toBeGreaterThan(0);
    });
  });

  describe('Understanding Snapshots', () => {
    beforeEach(async () => {
      await enhancedH2GNN.learnConcept('physics', { examples: [] }, { domain: 'science' });
      await enhancedH2GNN.learnConcept('chemistry', { examples: [] }, { domain: 'science' });
    });

    it('should create understanding snapshots', async () => {
      const snapshot = await enhancedH2GNN.createUnderstandingSnapshot('science');
      
      expect(snapshot).toBeDefined();
      expect(snapshot.domain).toBe('science');
      expect(snapshot.knowledgeGraph).toBeDefined();
      expect(snapshot.embeddings).toBeDefined();
      expect(snapshot.confidence).toBeGreaterThan(0);
    });

    it('should retrieve understanding snapshots', async () => {
      await enhancedH2GNN.createUnderstandingSnapshot('science');
      const snapshots = await enhancedH2GNN.getUnderstandingSnapshots('science');
      
      expect(snapshots).toBeDefined();
      expect(snapshots.length).toBeGreaterThan(0);
    });

    it('should update understanding snapshots', async () => {
      const snapshot = await enhancedH2GNN.createUnderstandingSnapshot('science');
      await enhancedH2GNN.learnConcept('biology', { examples: [] }, { domain: 'science' });
      
      const updatedSnapshot = await enhancedH2GNN.updateUnderstandingSnapshot(snapshot.id);
      
      expect(updatedSnapshot).toBeDefined();
      expect(updatedSnapshot.timestamp).toBeGreaterThan(snapshot.timestamp);
    });
  });

  describe('Learning Sessions', () => {
    it('should start learning sessions', async () => {
      const session = await enhancedH2GNN.startLearningSession('test_session', 'technology');
      
      expect(session).toBeDefined();
      expect(session.sessionName).toBe('test_session');
      expect(session.focusDomain).toBe('technology');
      expect(session.isActive()).toBe(true);
    });

    it('should end learning sessions', async () => {
      const session = await enhancedH2GNN.startLearningSession('test_session', 'technology');
      await session.learnConcept('test_concept', { examples: [] });
      
      const result = await enhancedH2GNN.endLearningSession();
      
      expect(result).toBeDefined();
      expect(result.sessionName).toBe('test_session');
      expect(result.conceptsLearned).toBeGreaterThan(0);
    });

    it('should track learning progress', async () => {
      const session = await enhancedH2GNN.startLearningSession('progress_test', 'mathematics');
      await session.learnConcept('algebra', { examples: [] });
      await session.learnConcept('geometry', { examples: [] });
      
      const progress = await enhancedH2GNN.getLearningProgress();
      
      expect(progress).toBeDefined();
      expect(progress.length).toBeGreaterThan(0);
      
      const mathProgress = progress.find(p => p.domain === 'mathematics');
      expect(mathProgress).toBeDefined();
      expect(mathProgress.learnedConcepts).toBeGreaterThan(0);
    });
  });

  describe('Adaptive Learning', () => {
    it('should perform adaptive learning', async () => {
      await enhancedH2GNN.learnConcept('basic_math', { examples: [] }, { domain: 'mathematics' });
      
      const result = await enhancedH2GNN.adaptiveLearning('mathematics', 0.01);
      
      expect(result).toBeDefined();
      expect(result.domain).toBe('mathematics');
      expect(result.adaptations).toBeGreaterThan(0);
    });

    it('should adjust learning rates based on performance', async () => {
      const initialRate = enhancedH2GNN.getLearningRate();
      
      // Simulate poor performance
      await enhancedH2GNN.learnConcept('difficult_concept', { examples: [] }, { domain: 'test' }, 0.1);
      
      const adjustedRate = enhancedH2GNN.getLearningRate();
      expect(adjustedRate).not.toBe(initialRate);
    });
  });

  describe('System Status and Health', () => {
    it('should get system status', async () => {
      const status = await enhancedH2GNN.getSystemStatus();
      
      expect(status).toBeDefined();
      expect(status.totalMemories).toBeGreaterThanOrEqual(0);
      expect(status.understandingSnapshots).toBeGreaterThanOrEqual(0);
      expect(status.learningDomains).toBeGreaterThanOrEqual(0);
      expect(status.averageConfidence).toBeGreaterThanOrEqual(0);
    });

    it('should get HD addressing information', async () => {
      const hdInfo = await enhancedH2GNN.getHDAddressInfo();
      
      expect(hdInfo).toBeDefined();
      expect(hdInfo.h2gnnAddress).toBeDefined();
      expect(hdInfo.rpcEndpoint).toBeDefined();
    });

    it('should get MCP integration status', async () => {
      const mcpStatus = await enhancedH2GNN.getMCPIntegrationStatus();
      
      expect(mcpStatus).toBeDefined();
      expect(mcpStatus.healthy).toBeDefined();
      expect(mcpStatus.services).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid concept names', async () => {
      await expect(enhancedH2GNN.learnConcept('', { examples: [] }))
        .rejects.toThrow('Concept name cannot be empty');
    });

    it('should handle null learning data', async () => {
      await expect(enhancedH2GNN.learnConcept('test', null as any))
        .rejects.toThrow('Learning data cannot be null or undefined');
    });

    it('should handle retrieval with no memories', async () => {
      const newH2GNN = new EnhancedH2GNN({ storagePath: './empty-test' });
      await newH2GNN.initialize();
      
      const memories = await newH2GNN.retrieveMemories('nonexistent');
      expect(memories).toEqual([]);
      
      await newH2GNN.cleanup();
    });

    it('should handle storage errors gracefully', async () => {
      const invalidH2GNN = new EnhancedH2GNN({ 
        storagePath: '/invalid/path/that/does/not/exist' 
      });
      
      await expect(invalidH2GNN.initialize())
        .rejects.toThrow();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large numbers of concepts efficiently', async () => {
      const startTime = Date.now();
      
      // Learn many concepts
      for (let i = 0; i < 50; i++) {
        await enhancedH2GNN.learnConcept(`concept_${i}`, { examples: [] }, { domain: 'test' });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should maintain performance with many memories', async () => {
      // Add many memories
      for (let i = 0; i < 200; i++) {
        await enhancedH2GNN.learnConcept(`memory_${i}`, { examples: [] }, { domain: 'test' });
      }
      
      const startTime = Date.now();
      const memories = await enhancedH2GNN.retrieveMemories('test', 10);
      const endTime = Date.now();
      
      expect(memories).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should retrieve within 1 second
    });

    it('should handle concurrent learning operations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        enhancedH2GNN.learnConcept(`concurrent_${i}`, { examples: [] }, { domain: 'concurrent' })
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Integration with Core H²GNN', () => {
    it('should use core H²GNN for geometric operations', async () => {
      const testVector = createVector([0.1, 0.2, 0.3]);
      const isValid = enhancedH2GNN.validateHyperbolicConstraints(testVector);
      
      expect(isValid).toBe(true);
    });

    it('should maintain geometric consistency in learning', async () => {
      const concept = 'geometric_concept';
      const data = {
        points: [
          [0.1, 0.2],
          [0.3, 0.4],
          [0.5, 0.6]
        ],
        relationships: [
          { source: 'point1', target: 'point2', type: 'distance' }
        ]
      };
      
      const result = await enhancedH2GNN.learnConcept(concept, data);
      
      expect(result.success).toBe(true);
      expect(result.geometricConsistency).toBe(true);
    });
  });
});
