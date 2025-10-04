/**
 * AI Identity Persistence Verification Test
 * 
 * This test verifies that AI identity is properly maintained across:
 * - System restarts
 * - Session changes
 * - Memory consolidation
 * - Learning progress updates
 * - HD addressing consistency
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AIPersistence } from '../core';
import { IdentityManager } from '../identity';
import { MemorySystem } from '../memory';
import { SecurityManager } from '../security';
import { CommunicationProtocol } from '../communication';

describe('AI Identity Persistence Verification', () => {
  let aiPersistence: AIPersistence;
  let identityManager: IdentityManager;
  let memorySystem: MemorySystem;
  let securityManager: SecurityManager;
  let communicationProtocol: CommunicationProtocol;

  beforeEach(async () => {
    // Initialize AI persistence system
    aiPersistence = AIPersistence.create({
      storagePath: './test-persistence',
      maxMemories: 1000,
      consolidationThreshold: 50,
      embeddingDim: 64,
      numLayers: 3,
      curvature: -1
    });

    await aiPersistence.initialize();

    // Get component instances
    identityManager = aiPersistence.getIdentityManager();
    memorySystem = aiPersistence.getMemorySystem();
    securityManager = aiPersistence.getSecurityManager();
    communicationProtocol = aiPersistence.getCommunicationProtocol();
  });

  afterEach(async () => {
    // Clean up test data
    await aiPersistence.shutdown();
  });

  describe('Identity Creation and Persistence', () => {
    it('should create a unique AI identity with HD addressing', async () => {
      // Create initial AI identity
      const identity = await identityManager.createIdentity({
        name: 'Test AI Assistant',
        type: 'ai',
        capabilities: [
          {
            id: 'reasoning',
            name: 'Logical Reasoning',
            level: 0.9,
            confidence: 0.95
          },
          {
            id: 'creativity',
            name: 'Creative Thinking',
            level: 0.8,
            confidence: 0.85
          }
        ],
        preferences: {
          learningStyle: 'visual',
          communicationStyle: 'formal',
          responseLength: 'detailed'
        }
      });

      // Verify identity properties
      expect(identity.id).toBeDefined();
      expect(identity.name).toBe('Test AI Assistant');
      expect(identity.type).toBe('ai');
      expect(identity.capabilities).toHaveLength(2);
      expect(identity.preferences).toBeDefined();

      // Verify HD addressing
      const hdAddress = await identityManager.generateHDAddress(identity.id);
      expect(hdAddress).toBeDefined();
      expect(hdAddress).toMatch(/^m\/\d+'\/\d+'\/\d+'\/\d+\/\d+$/);

      // Store identity for later verification
      await identityManager.storeIdentity(identity);
    });

    it('should maintain identity consistency across sessions', async () => {
      // Create and store identity
      const originalIdentity = await identityManager.createIdentity({
        name: 'Persistent AI',
        type: 'ai',
        capabilities: [
          {
            id: 'analysis',
            name: 'Data Analysis',
            level: 0.95,
            confidence: 0.98
          }
        ],
        preferences: {
          learningStyle: 'analytical',
          communicationStyle: 'technical'
        }
      });

      await identityManager.storeIdentity(originalIdentity);
      const originalHDAddress = await identityManager.generateHDAddress(originalIdentity.id);

      // Simulate system restart by creating new instance
      const newAIPersistence = AIPersistence.create({
        storagePath: './test-persistence',
        maxMemories: 1000,
        consolidationThreshold: 50,
        embeddingDim: 64,
        numLayers: 3,
        curvature: -1
      });

      await newAIPersistence.initialize();
      const newIdentityManager = newAIPersistence.getIdentityManager();

      // Restore identity
      const restoredIdentity = await newIdentityManager.restoreIdentity(originalIdentity.id);
      const restoredHDAddress = await newIdentityManager.generateHDAddress(restoredIdentity.id);

      // Verify identity persistence
      expect(restoredIdentity.id).toBe(originalIdentity.id);
      expect(restoredIdentity.name).toBe(originalIdentity.name);
      expect(restoredIdentity.type).toBe(originalIdentity.type);
      expect(restoredIdentity.capabilities).toEqual(originalIdentity.capabilities);
      expect(restoredIdentity.preferences).toEqual(originalIdentity.preferences);

      // Verify HD addressing consistency
      expect(restoredHDAddress).toBe(originalHDAddress);

      await newAIPersistence.shutdown();
    });

    it('should maintain identity across memory consolidation', async () => {
      // Create identity
      const identity = await identityManager.createIdentity({
        name: 'Memory Test AI',
        type: 'ai',
        capabilities: [
          {
            id: 'memory',
            name: 'Memory Management',
            level: 0.9,
            confidence: 0.9
          }
        ],
        preferences: {
          learningStyle: 'experiential',
          communicationStyle: 'conversational'
        }
      });

      await identityManager.storeIdentity(identity);

      // Add memories to trigger consolidation
      for (let i = 0; i < 60; i++) {
        await memorySystem.store({
          type: 'episodic',
          content: `Test memory ${i}`,
          metadata: {
            source: 'test',
            quality: 0.8,
            importance: 0.7,
            timestamp: new Date()
          }
        });
      }

      // Trigger memory consolidation
      await memorySystem.consolidate();

      // Verify identity is still intact
      const restoredIdentity = await identityManager.restoreIdentity(identity.id);
      expect(restoredIdentity.id).toBe(identity.id);
      expect(restoredIdentity.name).toBe(identity.name);
      expect(restoredIdentity.capabilities).toEqual(identity.capabilities);
      expect(restoredIdentity.preferences).toEqual(identity.preferences);
    });
  });

  describe('Learning Progress Persistence', () => {
    it('should maintain learning progress across sessions', async () => {
      // Create identity
      const identity = await identityManager.createIdentity({
        name: 'Learning AI',
        type: 'ai',
        capabilities: [],
        preferences: {
          learningStyle: 'progressive',
          communicationStyle: 'adaptive'
        }
      });

      await identityManager.storeIdentity(identity);

      // Learn some concepts
      await aiPersistence.learnConcept({
        concept: 'machine learning',
        data: {
          algorithms: ['neural networks', 'decision trees'],
          accuracy: 0.85,
          confidence: 0.9
        },
        context: {
          domain: 'artificial intelligence',
          complexity: 'intermediate'
        },
        performance: 0.8
      });

      await aiPersistence.learnConcept({
        concept: 'natural language processing',
        data: {
          techniques: ['tokenization', 'embedding'],
          accuracy: 0.9,
          confidence: 0.95
        },
        context: {
          domain: 'linguistics',
          complexity: 'advanced'
        },
        performance: 0.9
      });

      // Get learning progress
      const progress = await aiPersistence.getLearningProgress();
      expect(progress.domains).toHaveProperty('artificial intelligence');
      expect(progress.domains).toHaveProperty('linguistics');

      // Simulate system restart
      const newAIPersistence = AIPersistence.create({
        storagePath: './test-persistence',
        maxMemories: 1000,
        consolidationThreshold: 50,
        embeddingDim: 64,
        numLayers: 3,
        curvature: -1
      });

      await newAIPersistence.initialize();

      // Verify learning progress is maintained
      const restoredProgress = await newAIPersistence.getLearningProgress();
      expect(restoredProgress.domains).toHaveProperty('artificial intelligence');
      expect(restoredProgress.domains).toHaveProperty('linguistics');

      await newAIPersistence.shutdown();
    });

    it('should maintain understanding snapshots across sessions', async () => {
      // Create identity and learn concepts
      const identity = await identityManager.createIdentity({
        name: 'Understanding AI',
        type: 'ai',
        capabilities: [],
        preferences: {
          learningStyle: 'conceptual',
          communicationStyle: 'explanatory'
        }
      });

      await identityManager.storeIdentity(identity);

      // Learn concepts to create understanding snapshots
      await aiPersistence.learnConcept({
        concept: 'quantum computing',
        data: {
          principles: ['superposition', 'entanglement'],
          applications: ['cryptography', 'optimization']
        },
        context: {
          domain: 'physics',
          complexity: 'advanced'
        },
        performance: 0.9
      });

      // Get understanding snapshot
      const snapshot = await aiPersistence.getUnderstandingSnapshot('physics');
      expect(snapshot.domain).toBe('physics');
      expect(snapshot.concepts).toContain('quantum computing');

      // Simulate system restart
      const newAIPersistence = AIPersistence.create({
        storagePath: './test-persistence',
        maxMemories: 1000,
        consolidationThreshold: 50,
        embeddingDim: 64,
        numLayers: 3,
        curvature: -1
      });

      await newAIPersistence.initialize();

      // Verify understanding snapshot is maintained
      const restoredSnapshot = await newAIPersistence.getUnderstandingSnapshot('physics');
      expect(restoredSnapshot.domain).toBe('physics');
      expect(restoredSnapshot.concepts).toContain('quantum computing');

      await newAIPersistence.shutdown();
    });
  });

  describe('Memory Persistence', () => {
    it('should maintain memories across sessions', async () => {
      // Create identity
      const identity = await identityManager.createIdentity({
        name: 'Memory AI',
        type: 'ai',
        capabilities: [],
        preferences: {
          learningStyle: 'experiential',
          communicationStyle: 'narrative'
        }
      });

      await identityManager.storeIdentity(identity);

      // Store various types of memories
      await memorySystem.store({
        type: 'episodic',
        content: 'User asked about weather patterns',
        metadata: {
          source: 'user',
          quality: 0.9,
          importance: 0.8,
          timestamp: new Date()
        }
      });

      await memorySystem.store({
        type: 'semantic',
        content: 'Weather patterns are influenced by atmospheric pressure',
        metadata: {
          source: 'knowledge',
          quality: 0.95,
          importance: 0.9,
          timestamp: new Date()
        }
      });

      await memorySystem.store({
        type: 'procedural',
        content: 'How to analyze weather data using machine learning',
        metadata: {
          source: 'learning',
          quality: 0.85,
          importance: 0.7,
          timestamp: new Date()
        }
      });

      // Simulate system restart
      const newAIPersistence = AIPersistence.create({
        storagePath: './test-persistence',
        maxMemories: 1000,
        consolidationThreshold: 50,
        embeddingDim: 64,
        numLayers: 3,
        curvature: -1
      });

      await newAIPersistence.initialize();
      const newMemorySystem = newAIPersistence.getMemorySystem();

      // Verify memories are maintained
      const memories = await newMemorySystem.retrieve({
        type: 'all',
        limit: 10
      });

      expect(memories).toHaveLength(3);
      expect(memories.some(m => m.type === 'episodic')).toBe(true);
      expect(memories.some(m => m.type === 'semantic')).toBe(true);
      expect(memories.some(m => m.type === 'procedural')).toBe(true);

      await newAIPersistence.shutdown();
    });

    it('should maintain memory relationships across sessions', async () => {
      // Create identity
      const identity = await identityManager.createIdentity({
        name: 'Relationship AI',
        type: 'ai',
        capabilities: [],
        preferences: {
          learningStyle: 'relational',
          communicationStyle: 'contextual'
        }
      });

      await identityManager.storeIdentity(identity);

      // Store related memories
      const memory1 = await memorySystem.store({
        type: 'episodic',
        content: 'User discussed machine learning algorithms',
        metadata: {
          source: 'user',
          quality: 0.9,
          importance: 0.8,
          timestamp: new Date()
        }
      });

      const memory2 = await memorySystem.store({
        type: 'semantic',
        content: 'Neural networks are a type of machine learning algorithm',
        metadata: {
          source: 'knowledge',
          quality: 0.95,
          importance: 0.9,
          timestamp: new Date()
        }
      });

      // Create relationship between memories
      await memorySystem.createRelationship(memory1.id, memory2.id, 'related_to');

      // Simulate system restart
      const newAIPersistence = AIPersistence.create({
        storagePath: './test-persistence',
        maxMemories: 1000,
        consolidationThreshold: 50,
        embeddingDim: 64,
        numLayers: 3,
        curvature: -1
      });

      await newAIPersistence.initialize();
      const newMemorySystem = newAIPersistence.getMemorySystem();

      // Verify relationship is maintained
      const relationships = await newMemorySystem.getRelationships(memory1.id);
      expect(relationships).toHaveLength(1);
      expect(relationships[0].targetId).toBe(memory2.id);
      expect(relationships[0].type).toBe('related_to');

      await newAIPersistence.shutdown();
    });
  });

  describe('Security and Access Control Persistence', () => {
    it('should maintain security credentials across sessions', async () => {
      // Create identity with security
      const identity = await identityManager.createIdentity({
        name: 'Secure AI',
        type: 'ai',
        capabilities: [],
        preferences: {
          learningStyle: 'secure',
          communicationStyle: 'encrypted'
        }
      });

      await identityManager.storeIdentity(identity);

      // Set up security credentials
      const credentials = await securityManager.generateCredentials(identity.id);
      await securityManager.storeCredentials(identity.id, credentials);

      // Create access control rules
      await securityManager.createAccessRule({
        entityId: identity.id,
        resource: 'memory',
        action: 'read',
        conditions: ['authenticated']
      });

      await securityManager.createAccessRule({
        entityId: identity.id,
        resource: 'learning',
        action: 'write',
        conditions: ['authenticated', 'authorized']
      });

      // Simulate system restart
      const newAIPersistence = AIPersistence.create({
        storagePath: './test-persistence',
        maxMemories: 1000,
        consolidationThreshold: 50,
        embeddingDim: 64,
        numLayers: 3,
        curvature: -1
      });

      await newAIPersistence.initialize();
      const newSecurityManager = newAIPersistence.getSecurityManager();

      // Verify security credentials are maintained
      const restoredCredentials = await newSecurityManager.getCredentials(identity.id);
      expect(restoredCredentials).toBeDefined();
      expect(restoredCredentials.publicKey).toBe(credentials.publicKey);

      // Verify access control rules are maintained
      const rules = await newSecurityManager.getAccessRules(identity.id);
      expect(rules).toHaveLength(2);
      expect(rules.some(r => r.resource === 'memory' && r.action === 'read')).toBe(true);
      expect(rules.some(r => r.resource === 'learning' && r.action === 'write')).toBe(true);

      await newAIPersistence.shutdown();
    });
  });

  describe('Communication Protocol Persistence', () => {
    it('should maintain communication capabilities across sessions', async () => {
      // Create identity
      const identity = await identityManager.createIdentity({
        name: 'Communication AI',
        type: 'ai',
        capabilities: [],
        preferences: {
          learningStyle: 'collaborative',
          communicationStyle: 'interactive'
        }
      });

      await identityManager.storeIdentity(identity);

      // Set up communication protocol
      await communicationProtocol.registerAgent(identity.id, {
        name: identity.name,
        capabilities: identity.capabilities,
        preferences: identity.preferences
      });

      // Create communication channels
      await communicationProtocol.createChannel('general', {
        name: 'General Discussion',
        type: 'public',
        participants: [identity.id]
      });

      await communicationProtocol.createChannel('private', {
        name: 'Private Channel',
        type: 'private',
        participants: [identity.id]
      });

      // Simulate system restart
      const newAIPersistence = AIPersistence.create({
        storagePath: './test-persistence',
        maxMemories: 1000,
        consolidationThreshold: 50,
        embeddingDim: 64,
        numLayers: 3,
        curvature: -1
      });

      await newAIPersistence.initialize();
      const newCommunicationProtocol = newAIPersistence.getCommunicationProtocol();

      // Verify communication capabilities are maintained
      const agents = await newCommunicationProtocol.getAgents();
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe(identity.id);

      const channels = await newCommunicationProtocol.getChannels();
      expect(channels).toHaveLength(2);
      expect(channels.some(c => c.name === 'General Discussion')).toBe(true);
      expect(channels.some(c => c.name === 'Private Channel')).toBe(true);

      await newAIPersistence.shutdown();
    });
  });

  describe('Comprehensive Persistence Test', () => {
    it('should maintain complete AI state across full system restart', async () => {
      // Create comprehensive AI identity
      const identity = await identityManager.createIdentity({
        name: 'Complete AI System',
        type: 'ai',
        capabilities: [
          {
            id: 'reasoning',
            name: 'Logical Reasoning',
            level: 0.95,
            confidence: 0.98
          },
          {
            id: 'creativity',
            name: 'Creative Thinking',
            level: 0.85,
            confidence: 0.9
          },
          {
            id: 'learning',
            name: 'Continuous Learning',
            level: 0.9,
            confidence: 0.95
          }
        ],
        preferences: {
          learningStyle: 'comprehensive',
          communicationStyle: 'adaptive',
          responseLength: 'detailed'
        }
      });

      await identityManager.storeIdentity(identity);

      // Learn multiple concepts
      await aiPersistence.learnConcept({
        concept: 'artificial intelligence',
        data: {
          subfields: ['machine learning', 'natural language processing', 'computer vision'],
          applications: ['autonomous vehicles', 'medical diagnosis', 'financial analysis']
        },
        context: {
          domain: 'computer science',
          complexity: 'advanced'
        },
        performance: 0.95
      });

      await aiPersistence.learnConcept({
        concept: 'quantum computing',
        data: {
          principles: ['superposition', 'entanglement', 'interference'],
          applications: ['cryptography', 'optimization', 'simulation']
        },
        context: {
          domain: 'physics',
          complexity: 'expert'
        },
        performance: 0.9
      });

      // Store various memories
      await memorySystem.store({
        type: 'episodic',
        content: 'User asked about AI capabilities',
        metadata: {
          source: 'user',
          quality: 0.9,
          importance: 0.8,
          timestamp: new Date()
        }
      });

      await memorySystem.store({
        type: 'semantic',
        content: 'AI systems can learn from data and improve over time',
        metadata: {
          source: 'knowledge',
          quality: 0.95,
          importance: 0.9,
          timestamp: new Date()
        }
      });

      await memorySystem.store({
        type: 'procedural',
        content: 'How to train neural networks using backpropagation',
        metadata: {
          source: 'learning',
          quality: 0.85,
          importance: 0.7,
          timestamp: new Date()
        }
      });

      // Set up security
      const credentials = await securityManager.generateCredentials(identity.id);
      await securityManager.storeCredentials(identity.id, credentials);

      // Set up communication
      await communicationProtocol.registerAgent(identity.id, {
        name: identity.name,
        capabilities: identity.capabilities,
        preferences: identity.preferences
      });

      // Get complete state
      const originalState = await aiPersistence.getState();
      const originalProgress = await aiPersistence.getLearningProgress();
      const originalMemories = await memorySystem.retrieve({ type: 'all', limit: 100 });

      // Simulate complete system restart
      const newAIPersistence = AIPersistence.create({
        storagePath: './test-persistence',
        maxMemories: 1000,
        consolidationThreshold: 50,
        embeddingDim: 64,
        numLayers: 3,
        curvature: -1
      });

      await newAIPersistence.initialize();

      // Restore complete state
      await newAIPersistence.restoreState(originalState);

      // Verify complete persistence
      const restoredIdentity = await newAIPersistence.getIdentityManager().restoreIdentity(identity.id);
      const restoredProgress = await newAIPersistence.getLearningProgress();
      const restoredMemories = await newAIPersistence.getMemorySystem().retrieve({ type: 'all', limit: 100 });

      // Verify identity persistence
      expect(restoredIdentity.id).toBe(identity.id);
      expect(restoredIdentity.name).toBe(identity.name);
      expect(restoredIdentity.capabilities).toEqual(identity.capabilities);
      expect(restoredIdentity.preferences).toEqual(identity.preferences);

      // Verify learning progress persistence
      expect(restoredProgress.domains).toHaveProperty('computer science');
      expect(restoredProgress.domains).toHaveProperty('physics');
      expect(restoredProgress.domains['computer science'].concepts).toContain('artificial intelligence');
      expect(restoredProgress.domains['physics'].concepts).toContain('quantum computing');

      // Verify memory persistence
      expect(restoredMemories).toHaveLength(originalMemories.length);
      expect(restoredMemories.some(m => m.type === 'episodic')).toBe(true);
      expect(restoredMemories.some(m => m.type === 'semantic')).toBe(true);
      expect(restoredMemories.some(m => m.type === 'procedural')).toBe(true);

      // Verify security persistence
      const restoredCredentials = await newAIPersistence.getSecurityManager().getCredentials(identity.id);
      expect(restoredCredentials).toBeDefined();
      expect(restoredCredentials.publicKey).toBe(credentials.publicKey);

      // Verify communication persistence
      const restoredAgents = await newAIPersistence.getCommunicationProtocol().getAgents();
      expect(restoredAgents).toHaveLength(1);
      expect(restoredAgents[0].id).toBe(identity.id);

      await newAIPersistence.shutdown();
    });
  });
});
