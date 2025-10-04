#!/usr/bin/env tsx

/**
 * Team Collaboration Workflow Tests
 * 
 * Comprehensive test suite for team collaboration workflows:
 * - Team learning workflow
 * - Knowledge sharing workflow
 * - Team standards workflow
 * - End-to-end collaboration scenarios
 */

import { TeamLearningWorkflow, TeamLearningState } from '../../workflows/team-collaboration-workflow';
import { KnowledgeSharingWorkflow, KnowledgeSharingState } from '../../workflows/knowledge-sharing-workflow';
import { TeamStandardsWorkflow, TeamStandardsState } from '../../workflows/team-standards-workflow';
import { SharedLearningDatabase } from '../../core/shared-learning-database';
import { CodingStandardEngine } from '../../rules/coding-standard-engine';
import * as fs from 'fs';
import * as path from 'path';

describe('Team Collaboration Workflows', () => {
  let teamLearningWorkflow: TeamLearningWorkflow;
  let knowledgeSharingWorkflow: KnowledgeSharingWorkflow;
  let teamStandardsWorkflow: TeamStandardsWorkflow;
  let sharedDB: SharedLearningDatabase;
  let codingEngine: CodingStandardEngine;
  let testStoragePath: string;

  beforeEach(async () => {
    // Create a unique test storage path for each test
    testStoragePath = path.join(__dirname, '../../test-storage', `workflow-test-${Date.now()}`);
    
    teamLearningWorkflow = new TeamLearningWorkflow();
    knowledgeSharingWorkflow = new KnowledgeSharingWorkflow();
    teamStandardsWorkflow = new TeamStandardsWorkflow();
    sharedDB = new SharedLearningDatabase(testStoragePath);
    codingEngine = new CodingStandardEngine();
    
    await sharedDB.connect();
  });

  afterEach(async () => {
    await sharedDB.disconnect();
    // Clean up test storage
    if (fs.existsSync(testStoragePath)) {
      fs.rmSync(testStoragePath, { recursive: true, force: true });
    }
  });

  describe('Team Learning Workflow', () => {
    test('should execute team learning workflow successfully', async () => {
      const teamId = 'test-learning-team';
      const code = `
        interface User {
          id: number;
          name: string;
          email: string;
        }

        class UserService {
          private users: User[] = [];

          async createUser(userData: Partial<User>): Promise<User> {
            try {
              const user: User = {
                id: Date.now(),
                name: userData.name || '',
                email: userData.email || ''
              };
              
              this.users.push(user);
              return user;
            } catch (error) {
              console.error('Failed to create user:', error);
              throw new Error('User creation failed');
            }
          }
        }
      `;

      const result = await teamLearningWorkflow.executeTeamLearning(teamId, code, 'typescript');

      expect(result).toBeDefined();
      expect(result.teamId).toBe(teamId);
      expect(result.insights).toBeDefined();
      expect(Array.isArray(result.insights)).toBe(true);
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.violations).toBeDefined();
      expect(Array.isArray(result.violations)).toBe(true);
      expect(typeof result.compliance).toBe('number');
      expect(typeof result.learningProgress).toBe('number');
    });

    test('should generate insights from team code analysis', async () => {
      const teamId = 'insights-test-team';
      const code = `
        // Async programming example
        async function fetchUserData(userId: number): Promise<User> {
          const response = await fetch(\`/api/users/\${userId}\`);
          return response.json();
        }

        // Error handling example
        try {
          const user = await fetchUserData(123);
          console.log(user);
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      `;

      const result = await teamLearningWorkflow.executeTeamLearning(teamId, code, 'typescript');

      expect(result.insights.length).toBeGreaterThan(0);
      
      // Should have insights about async programming and error handling
      const asyncInsights = result.insights.filter(insight => 
        insight.concept.includes('async') || insight.insight.includes('async')
      );
      const errorHandlingInsights = result.insights.filter(insight => 
        insight.concept.includes('error') || insight.insight.includes('error')
      );

      expect(asyncInsights.length + errorHandlingInsights.length).toBeGreaterThan(0);
    });

    test('should generate refactoring suggestions', async () => {
      const teamId = 'suggestions-test-team';
      const code = `
        function calculateTotal(items) {
          let total = 0;
          for (let i = 0; i < items.length; i++) {
            total += items[i].price;
          }
          return total;
        }
      `;

      const result = await teamLearningWorkflow.executeTeamLearning(teamId, code, 'javascript');

      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    test('should handle different programming languages', async () => {
      const teamId = 'language-test-team';
      
      const typescriptCode = `
        interface User {
          id: number;
          name: string;
        }
      `;

      const pythonCode = `
        def calculate_total(items):
            return sum(item.price for item in items)
      `;

      const tsResult = await teamLearningWorkflow.executeTeamLearning(teamId, typescriptCode, 'typescript');
      const pyResult = await teamLearningWorkflow.executeTeamLearning(teamId, pythonCode, 'python');

      expect(tsResult).toBeDefined();
      expect(pyResult).toBeDefined();
      expect(tsResult.teamId).toBe(teamId);
      expect(pyResult.teamId).toBe(teamId);
    });
  });

  describe('Knowledge Sharing Workflow', () => {
    test('should execute knowledge sharing workflow successfully', async () => {
      const sourceTeamId = 'source-team';
      const targetTeamId = 'target-team';
      const concepts = ['async-programming', 'error-handling'];

      const result = await knowledgeSharingWorkflow.executeKnowledgeSharing(
        sourceTeamId,
        targetTeamId,
        concepts
      );

      expect(result).toBeDefined();
      expect(result.sourceTeamId).toBe(sourceTeamId);
      expect(result.targetTeamId).toBe(targetTeamId);
      expect(result.sharedKnowledge).toBeDefined();
      expect(Array.isArray(result.sharedKnowledge)).toBe(true);
      expect(result.integratedInsights).toBeDefined();
      expect(Array.isArray(result.integratedInsights)).toBe(true);
      expect(typeof result.knowledgeTransferSuccess).toBe('number');
      expect(typeof result.learningProgress).toBe('number');
    });

    test('should handle knowledge sharing with empty concepts', async () => {
      const sourceTeamId = 'empty-source-team';
      const targetTeamId = 'empty-target-team';
      const concepts: string[] = [];

      const result = await knowledgeSharingWorkflow.executeKnowledgeSharing(
        sourceTeamId,
        targetTeamId,
        concepts
      );

      expect(result).toBeDefined();
      expect(result.sharedKnowledge).toEqual([]);
      expect(result.integratedInsights).toEqual([]);
    });

    test('should calculate knowledge transfer success correctly', async () => {
      const sourceTeamId = 'success-test-source';
      const targetTeamId = 'success-test-target';
      const concepts = ['test-concept'];

      const result = await knowledgeSharingWorkflow.executeKnowledgeSharing(
        sourceTeamId,
        targetTeamId,
        concepts
      );

      expect(result.knowledgeTransferSuccess).toBeGreaterThanOrEqual(0);
      expect(result.knowledgeTransferSuccess).toBeLessThanOrEqual(100);
    });

    test('should handle knowledge sharing between same team', async () => {
      const teamId = 'self-sharing-team';
      const concepts = ['self-concept'];

      const result = await knowledgeSharingWorkflow.executeKnowledgeSharing(
        teamId,
        teamId,
        concepts
      );

      expect(result).toBeDefined();
      expect(result.sourceTeamId).toBe(teamId);
      expect(result.targetTeamId).toBe(teamId);
    });
  });

  describe('Team Standards Workflow', () => {
    test('should execute team standards workflow successfully', async () => {
      const teamId = 'standards-test-team';
      const code = `
        const user_name = "john"; // snake_case violation
        function veryLongFunction() {
          // This function is too long
          return "complex";
        }
      `;

      const result = await teamStandardsWorkflow.executeTeamStandards(teamId, code, 'typescript');

      expect(result).toBeDefined();
      expect(result.teamId).toBe(teamId);
      expect(result.rules).toBeDefined();
      expect(Array.isArray(result.rules)).toBe(true);
      expect(result.violations).toBeDefined();
      expect(Array.isArray(result.violations)).toBe(true);
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(typeof result.compliance).toBe('number');
      expect(typeof result.learningProgress).toBe('number');
    });

    test('should define language-specific rules', async () => {
      const teamId = 'language-rules-team';
      const typescriptCode = 'const user: User = { id: 1, name: "John" };';
      const pythonCode = 'def calculate_total(items: List[Item]) -> float:';

      const tsResult = await teamStandardsWorkflow.executeTeamStandards(teamId, typescriptCode, 'typescript');
      const pyResult = await teamStandardsWorkflow.executeTeamStandards(teamId, pythonCode, 'python');

      expect(tsResult).toBeDefined();
      expect(pyResult).toBeDefined();
      expect(tsResult.rules.length).toBeGreaterThan(0);
      expect(pyResult.rules.length).toBeGreaterThan(0);
    });

    test('should adapt rules to team patterns', async () => {
      const teamId = 'pattern-adaptation-team';
      const code = `
        // Team uses async/await patterns
        async function fetchData() {
          const response = await api.get('/data');
          return response.data;
        }
      `;

      const result = await teamStandardsWorkflow.executeTeamStandards(teamId, code, 'typescript');

      expect(result).toBeDefined();
      expect(result.rules.length).toBeGreaterThan(0);
      
      // Should have rules adapted to async patterns
      const asyncRules = result.rules.filter(rule => 
        rule.patterns.some(pattern => pattern.includes('async'))
      );
      expect(asyncRules.length).toBeGreaterThan(0);
    });

    test('should calculate compliance correctly', async () => {
      const teamId = 'compliance-test-team';
      
      const cleanCode = `
        const userName = "john";
        function calculateTotal(items: Item[]): number {
          return items.reduce((sum, item) => sum + item.price, 0);
        }
      `;

      const dirtyCode = `
        const user_name = "john";
        function veryLongFunction() {
          // Many lines of complex code...
          return "complex";
        }
      `;

      const cleanResult = await teamStandardsWorkflow.executeTeamStandards(teamId, cleanCode, 'typescript');
      const dirtyResult = await teamStandardsWorkflow.executeTeamStandards(teamId, dirtyCode, 'typescript');

      expect(cleanResult.compliance).toBeGreaterThan(dirtyResult.compliance);
    });
  });

  describe('Workflow Integration', () => {
    test('should integrate all workflows in sequence', async () => {
      const teamId = 'integration-test-team';
      const code = `
        interface User {
          id: number;
          name: string;
        }

        class UserService {
          async createUser(userData: Partial<User>): Promise<User> {
            const user: User = {
              id: Date.now(),
              name: userData.name || '',
            };
            return user;
          }
        }
      `;

      // Execute team learning workflow
      const learningResult = await teamLearningWorkflow.executeTeamLearning(teamId, code, 'typescript');
      expect(learningResult).toBeDefined();

      // Execute team standards workflow
      const standardsResult = await teamStandardsWorkflow.executeTeamStandards(teamId, code, 'typescript');
      expect(standardsResult).toBeDefined();

      // Execute knowledge sharing workflow
      const sharingResult = await knowledgeSharingWorkflow.executeKnowledgeSharing(
        teamId,
        'target-team',
        ['user-management', 'async-programming']
      );
      expect(sharingResult).toBeDefined();

      // All workflows should complete successfully
      expect(learningResult.insights.length).toBeGreaterThanOrEqual(0);
      expect(standardsResult.rules.length).toBeGreaterThan(0);
      expect(sharingResult.sharedKnowledge.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle workflow failures gracefully', async () => {
      const teamId = 'failure-test-team';
      const invalidCode = 'invalid syntax {';

      // Should not throw errors, even with invalid code
      await expect(teamLearningWorkflow.executeTeamLearning(teamId, invalidCode, 'typescript'))
        .resolves.not.toThrow();

      await expect(teamStandardsWorkflow.executeTeamStandards(teamId, invalidCode, 'typescript'))
        .resolves.not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should handle large codebases efficiently', async () => {
      const teamId = 'performance-test-team';
      
      // Generate large codebase
      let largeCode = '';
      for (let i = 0; i < 50; i++) {
        largeCode += `
          interface Interface${i} {
            id: number;
            name: string;
          }

          class Class${i} {
            async method${i}(): Promise<Interface${i}> {
              return { id: ${i}, name: "Item${i}" };
            }
          }
        `;
      }

      const startTime = Date.now();
      const result = await teamLearningWorkflow.executeTeamLearning(teamId, largeCode, 'typescript');
      const endTime = Date.now();

      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(result).toBeDefined();
    });

    test('should handle multiple concurrent workflows', async () => {
      const teamIds = ['concurrent-team-1', 'concurrent-team-2', 'concurrent-team-3'];
      const code = 'const userName = "john";';

      const startTime = Date.now();
      
      const promises = teamIds.map(teamId => 
        teamLearningWorkflow.executeTeamLearning(teamId, code, 'typescript')
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();

      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(3000); // 3 seconds
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.teamId).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty code', async () => {
      const teamId = 'empty-code-team';
      const emptyCode = '';

      const learningResult = await teamLearningWorkflow.executeTeamLearning(teamId, emptyCode, 'typescript');
      const standardsResult = await teamStandardsWorkflow.executeTeamStandards(teamId, emptyCode, 'typescript');

      expect(learningResult).toBeDefined();
      expect(standardsResult).toBeDefined();
    });

    test('should handle code with only comments', async () => {
      const teamId = 'comments-only-team';
      const commentCode = `
        // This is just a comment
        /* Multi-line comment */
      `;

      const learningResult = await teamLearningWorkflow.executeTeamLearning(teamId, commentCode, 'typescript');
      const standardsResult = await teamStandardsWorkflow.executeTeamStandards(teamId, commentCode, 'typescript');

      expect(learningResult).toBeDefined();
      expect(standardsResult).toBeDefined();
    });

    test('should handle invalid team IDs', async () => {
      const invalidTeamId = '';
      const code = 'const x = 1;';

      await expect(teamLearningWorkflow.executeTeamLearning(invalidTeamId, code, 'typescript'))
        .resolves.not.toThrow();

      await expect(teamStandardsWorkflow.executeTeamStandards(invalidTeamId, code, 'typescript'))
        .resolves.not.toThrow();
    });
  });
});
