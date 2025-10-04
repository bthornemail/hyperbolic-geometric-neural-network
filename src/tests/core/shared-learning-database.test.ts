#!/usr/bin/env tsx

/**
 * Shared Learning Database Tests
 * 
 * Comprehensive test suite for the shared learning database functionality:
 * - Team creation and management
 * - Memory storage and retrieval
 * - Conflict resolution
 * - Cross-team knowledge sharing
 * - Learning progress tracking
 */

import { SharedLearningDatabase, TeamConfig, TeamMember, MemoryConflict } from '../../core/shared-learning-database';
import { LearningMemory, UnderstandingSnapshot } from '../../core/enhanced-h2gnn';
import * as fs from 'fs';
import * as path from 'path';

describe('SharedLearningDatabase', () => {
  let sharedDB: SharedLearningDatabase;
  let testStoragePath: string;

  beforeEach(async () => {
    // Create a unique test storage path for each test
    testStoragePath = path.join(__dirname, '../../test-storage', `test-${Date.now()}`);
    sharedDB = new SharedLearningDatabase(testStoragePath);
    await sharedDB.connect();
  });

  afterEach(async () => {
    await sharedDB.disconnect();
    // Clean up test storage
    if (fs.existsSync(testStoragePath)) {
      fs.rmSync(testStoragePath, { recursive: true, force: true });
    }
  });

  describe('Team Management', () => {
    test('should create a team successfully', async () => {
      const teamConfig: TeamConfig = {
        teamId: 'test-team-1',
        name: 'Test Team 1',
        description: 'A test team for unit testing',
        members: [],
        learningDomains: ['testing', 'development'],
        sharedConcepts: ['unit-testing', 'integration-testing'],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam('test-team-1', teamConfig);
      
      // Verify team was created
      const progress = await sharedDB.getTeamLearningProgress('test-team-1');
      expect(progress).toBeDefined();
      expect(Array.isArray(progress)).toBe(true);
    });

    test('should add team members successfully', async () => {
      const teamConfig: TeamConfig = {
        teamId: 'test-team-2',
        name: 'Test Team 2',
        description: 'A test team for member testing',
        members: [],
        learningDomains: ['testing'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam('test-team-2', teamConfig);
      await sharedDB.addTeamMember('test-team-2', 'member-1', 'admin');
      await sharedDB.addTeamMember('test-team-2', 'member-2', 'member');

      // Verify members were added
      const progress = await sharedDB.getTeamLearningProgress('test-team-2');
      expect(progress).toBeDefined();
    });

    test('should handle multiple teams independently', async () => {
      const team1Config: TeamConfig = {
        teamId: 'team-1',
        name: 'Team 1',
        description: 'First team',
        members: [],
        learningDomains: ['domain-1'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const team2Config: TeamConfig = {
        teamId: 'team-2',
        name: 'Team 2',
        description: 'Second team',
        members: [],
        learningDomains: ['domain-2'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam('team-1', team1Config);
      await sharedDB.createTeam('team-2', team2Config);

      const progress1 = await sharedDB.getTeamLearningProgress('team-1');
      const progress2 = await sharedDB.getTeamLearningProgress('team-2');

      expect(progress1).toBeDefined();
      expect(progress2).toBeDefined();
      expect(progress1).not.toEqual(progress2);
    });
  });

  describe('Memory Management', () => {
    test('should store and retrieve memories', async () => {
      const teamId = 'memory-test-team';
      const teamConfig: TeamConfig = {
        teamId,
        name: 'Memory Test Team',
        description: 'Team for testing memory operations',
        members: [],
        learningDomains: ['testing'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam(teamId, teamConfig);

      const memory: LearningMemory = {
        id: 'test-memory-1',
        timestamp: Date.now(),
        concept: 'test-concept',
        embedding: [0.1, 0.2, 0.3],
        context: { team: teamId },
        performance: 0.8,
        confidence: 0.9,
        relationships: ['test'],
        consolidated: false
      };

      await sharedDB.storeMemory(teamId, memory);
      const retrievedMemories = await sharedDB.retrieveMemories(teamId);

      expect(retrievedMemories).toHaveLength(1);
      expect(retrievedMemories[0].id).toBe('test-memory-1');
      expect(retrievedMemories[0].concept).toBe('test-concept');
    });

    test('should retrieve memories by concept', async () => {
      const teamId = 'concept-test-team';
      const teamConfig: TeamConfig = {
        teamId,
        name: 'Concept Test Team',
        description: 'Team for testing concept retrieval',
        members: [],
        learningDomains: ['testing'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam(teamId, teamConfig);

      const memory1: LearningMemory = {
        id: 'memory-1',
        timestamp: Date.now(),
        concept: 'javascript',
        embedding: [0.1, 0.2, 0.3],
        context: { team: teamId },
        performance: 0.8,
        confidence: 0.9,
        relationships: ['programming'],
        consolidated: false
      };

      const memory2: LearningMemory = {
        id: 'memory-2',
        timestamp: Date.now(),
        concept: 'typescript',
        embedding: [0.4, 0.5, 0.6],
        context: { team: teamId },
        performance: 0.9,
        confidence: 0.95,
        relationships: ['programming'],
        consolidated: false
      };

      await sharedDB.storeMemory(teamId, memory1);
      await sharedDB.storeMemory(teamId, memory2);

      const javascriptMemories = await sharedDB.retrieveMemories(teamId, 'javascript');
      const typescriptMemories = await sharedDB.retrieveMemories(teamId, 'typescript');

      expect(javascriptMemories).toHaveLength(1);
      expect(typescriptMemories).toHaveLength(1);
      expect(javascriptMemories[0].concept).toBe('javascript');
      expect(typescriptMemories[0].concept).toBe('typescript');
    });

    test('should handle memory conflicts', async () => {
      const teamId = 'conflict-test-team';
      const teamConfig: TeamConfig = {
        teamId,
        name: 'Conflict Test Team',
        description: 'Team for testing memory conflicts',
        members: [],
        learningDomains: ['testing'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam(teamId, teamConfig);

      const memory1: LearningMemory = {
        id: 'conflict-memory-1',
        timestamp: Date.now(),
        concept: 'conflict-concept',
        embedding: [0.1, 0.2, 0.3],
        context: { team: teamId },
        performance: 0.8,
        confidence: 0.9,
        relationships: ['test'],
        consolidated: false
      };

      const memory2: LearningMemory = {
        id: 'conflict-memory-2',
        timestamp: Date.now() + 1000, // 1 second later
        concept: 'conflict-concept',
        embedding: [0.4, 0.5, 0.6],
        context: { team: teamId },
        performance: 0.9,
        confidence: 0.95,
        relationships: ['test'],
        consolidated: false
      };

      await sharedDB.storeMemory(teamId, memory1);
      await sharedDB.storeMemory(teamId, memory2);

      // The system should handle conflicts automatically
      const retrievedMemories = await sharedDB.retrieveMemories(teamId, 'conflict-concept');
      expect(retrievedMemories.length).toBeGreaterThan(0);
    });
  });

  describe('Snapshot Management', () => {
    test('should store and retrieve understanding snapshots', async () => {
      const teamId = 'snapshot-test-team';
      const teamConfig: TeamConfig = {
        teamId,
        name: 'Snapshot Test Team',
        description: 'Team for testing snapshots',
        members: [],
        learningDomains: ['testing'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam(teamId, teamConfig);

      const snapshot: UnderstandingSnapshot = {
        id: 'test-snapshot-1',
        domain: 'testing',
        knowledgeGraph: {},
        embeddings: new Map(),
        concepts: ['unit-testing', 'integration-testing'],
        relationships: [],
        confidence: 0.9,
        timestamp: Date.now(),
        insights: ['Testing is important for quality'],
        patterns: ['test-driven-development']
      };

      await sharedDB.storeSnapshot(teamId, snapshot);
      const retrievedSnapshots = await sharedDB.retrieveSnapshots(teamId);

      expect(retrievedSnapshots).toHaveLength(1);
      expect(retrievedSnapshots[0].id).toBe('test-snapshot-1');
      expect(retrievedSnapshots[0].domain).toBe('testing');
    });

    test('should retrieve snapshots by domain', async () => {
      const teamId = 'domain-snapshot-team';
      const teamConfig: TeamConfig = {
        teamId,
        name: 'Domain Snapshot Team',
        description: 'Team for testing domain snapshots',
        members: [],
        learningDomains: ['testing', 'development'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam(teamId, teamConfig);

      const testingSnapshot: UnderstandingSnapshot = {
        id: 'testing-snapshot',
        domain: 'testing',
        knowledgeGraph: {},
        embeddings: new Map(),
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
        knowledgeGraph: {},
        embeddings: new Map(),
        concepts: ['coding'],
        relationships: [],
        confidence: 0.8,
        timestamp: Date.now(),
        insights: ['Development insights'],
        patterns: ['dev-patterns']
      };

      await sharedDB.storeSnapshot(teamId, testingSnapshot);
      await sharedDB.storeSnapshot(teamId, developmentSnapshot);

      const testingSnapshots = await sharedDB.retrieveSnapshots(teamId, 'testing');
      const developmentSnapshots = await sharedDB.retrieveSnapshots(teamId, 'development');

      expect(testingSnapshots).toHaveLength(1);
      expect(developmentSnapshots).toHaveLength(1);
      expect(testingSnapshots[0].domain).toBe('testing');
      expect(developmentSnapshots[0].domain).toBe('development');
    });
  });

  describe('Knowledge Sharing', () => {
    test('should share knowledge between teams', async () => {
      const sourceTeamId = 'source-team';
      const targetTeamId = 'target-team';

      const sourceTeamConfig: TeamConfig = {
        teamId: sourceTeamId,
        name: 'Source Team',
        description: 'Team that shares knowledge',
        members: [],
        learningDomains: ['sharing'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const targetTeamConfig: TeamConfig = {
        teamId: targetTeamId,
        name: 'Target Team',
        description: 'Team that receives knowledge',
        members: [],
        learningDomains: ['receiving'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam(sourceTeamId, sourceTeamConfig);
      await sharedDB.createTeam(targetTeamId, targetTeamConfig);

      // Add some memories to source team
      const sourceMemory: LearningMemory = {
        id: 'source-memory-1',
        timestamp: Date.now(),
        concept: 'shared-knowledge',
        embedding: [0.1, 0.2, 0.3],
        context: { team: sourceTeamId },
        performance: 0.9,
        confidence: 0.95,
        relationships: ['knowledge'],
        consolidated: false
      };

      await sharedDB.storeMemory(sourceTeamId, sourceMemory);

      // Share knowledge
      await sharedDB.shareKnowledge(sourceTeamId, targetTeamId, ['shared-knowledge']);

      // Verify knowledge was shared
      const targetMemories = await sharedDB.retrieveMemories(targetTeamId);
      expect(targetMemories.length).toBeGreaterThan(0);
    });
  });

  describe('Learning Progress', () => {
    test('should calculate learning progress correctly', async () => {
      const teamId = 'progress-test-team';
      const teamConfig: TeamConfig = {
        teamId,
        name: 'Progress Test Team',
        description: 'Team for testing learning progress',
        members: [],
        learningDomains: ['testing'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam(teamId, teamConfig);

      // Add memories with different confidence levels
      const highConfidenceMemory: LearningMemory = {
        id: 'high-confidence-memory',
        timestamp: Date.now(),
        concept: 'high-confidence-concept',
        embedding: [0.1, 0.2, 0.3],
        context: { team: teamId },
        performance: 0.9,
        confidence: 0.95,
        relationships: ['high-confidence'],
        consolidated: false
      };

      const mediumConfidenceMemory: LearningMemory = {
        id: 'medium-confidence-memory',
        timestamp: Date.now(),
        concept: 'medium-confidence-concept',
        embedding: [0.4, 0.5, 0.6],
        context: { team: teamId },
        performance: 0.7,
        confidence: 0.7,
        relationships: ['medium-confidence'],
        consolidated: false
      };

      await sharedDB.storeMemory(teamId, highConfidenceMemory);
      await sharedDB.storeMemory(teamId, mediumConfidenceMemory);

      const progress = await sharedDB.getTeamLearningProgress(teamId);
      expect(progress).toBeDefined();
      expect(Array.isArray(progress)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent team gracefully', async () => {
      const nonExistentTeamId = 'non-existent-team';
      
      const memories = await sharedDB.retrieveMemories(nonExistentTeamId);
      const snapshots = await sharedDB.retrieveSnapshots(nonExistentTeamId);
      const progress = await sharedDB.getTeamLearningProgress(nonExistentTeamId);

      expect(memories).toEqual([]);
      expect(snapshots).toEqual([]);
      expect(progress).toEqual([]);
    });

    test('should handle invalid team operations gracefully', async () => {
      // Try to add member to non-existent team
      await expect(sharedDB.addTeamMember('non-existent-team', 'member-1', 'member'))
        .resolves.not.toThrow();

      // Try to share knowledge with non-existent teams
      await expect(sharedDB.shareKnowledge('non-existent-source', 'non-existent-target', ['concept']))
        .resolves.not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should handle large numbers of memories efficiently', async () => {
      const teamId = 'performance-test-team';
      const teamConfig: TeamConfig = {
        teamId,
        name: 'Performance Test Team',
        description: 'Team for testing performance',
        members: [],
        learningDomains: ['performance'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam(teamId, teamConfig);

      const startTime = Date.now();
      const memoryCount = 100;

      // Create and store many memories
      for (let i = 0; i < memoryCount; i++) {
        const memory: LearningMemory = {
          id: `performance-memory-${i}`,
          timestamp: Date.now(),
          concept: `concept-${i}`,
          embedding: [Math.random(), Math.random(), Math.random()],
          context: { team: teamId, index: i },
          performance: Math.random(),
          confidence: Math.random(),
          relationships: [`relationship-${i}`],
          consolidated: false
        };

        await sharedDB.storeMemory(teamId, memory);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds

      // Verify all memories were stored
      const retrievedMemories = await sharedDB.retrieveMemories(teamId);
      expect(retrievedMemories).toHaveLength(memoryCount);
    });
  });
});
