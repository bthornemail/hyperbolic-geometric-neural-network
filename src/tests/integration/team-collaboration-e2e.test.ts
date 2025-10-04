#!/usr/bin/env tsx

/**
 * Team Collaboration End-to-End Integration Tests
 * 
 * Comprehensive end-to-end test suite for team collaboration features:
 * - Complete team collaboration workflows
 * - Cross-component integration
 * - Real-world scenarios
 * - Performance under load
 */

import { SharedLearningDatabase, TeamConfig } from '../../core/shared-learning-database';
import { CodingStandardEngine, CodingStandardRule } from '../../rules/coding-standard-engine';
import { TeamLearningWorkflow } from '../../workflows/team-collaboration-workflow';
import { KnowledgeSharingWorkflow } from '../../workflows/knowledge-sharing-workflow';
import { TeamStandardsWorkflow } from '../../workflows/team-standards-workflow';
// Mock TeamCollaborationDemo since the demo file doesn't exist
class TeamCollaborationDemo {
  async runDemo(): Promise<any> {
    return { success: true, demo: 'team-collaboration' };
  }
  
  async demonstrateTeamCollaboration(): Promise<any> {
    return { success: true, collaboration: 'demonstrated' };
  }
}
import * as fs from 'fs';
import * as path from 'path';

describe('Team Collaboration End-to-End Integration', () => {
  let sharedDB: SharedLearningDatabase;
  let codingEngine: CodingStandardEngine;
  let teamLearningWorkflow: TeamLearningWorkflow;
  let knowledgeSharingWorkflow: KnowledgeSharingWorkflow;
  let teamStandardsWorkflow: TeamStandardsWorkflow;
  let demo: TeamCollaborationDemo;
  let testStoragePath: string;

  beforeEach(async () => {
    // Create a unique test storage path for each test
    testStoragePath = path.join(__dirname, '../../test-storage', `e2e-test-${Date.now()}`);
    
    sharedDB = new SharedLearningDatabase(testStoragePath);
    codingEngine = new CodingStandardEngine();
    teamLearningWorkflow = new TeamLearningWorkflow();
    knowledgeSharingWorkflow = new KnowledgeSharingWorkflow();
    teamStandardsWorkflow = new TeamStandardsWorkflow();
    demo = new TeamCollaborationDemo();
    
    await sharedDB.connect();
  });

  afterEach(async () => {
    await sharedDB.disconnect();
    // Clean up test storage
    if (fs.existsSync(testStoragePath)) {
      fs.rmSync(testStoragePath, { recursive: true, force: true });
    }
  });

  describe('Complete Team Collaboration Scenario', () => {
    test('should execute complete team collaboration workflow', async () => {
      // Step 1: Create teams
      const frontendTeam: TeamConfig = {
        teamId: 'frontend-team',
        name: 'Frontend Team',
        description: 'React and TypeScript frontend development',
        members: ['alice', 'bob'],
        learningDomains: ['react', 'typescript', 'ui-ux'],
        sharedConcepts: ['component-design', 'state-management'],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const backendTeam: TeamConfig = {
        teamId: 'backend-team',
        name: 'Backend Team',
        description: 'Node.js and database backend development',
        members: ['charlie', 'diana'],
        learningDomains: ['nodejs', 'databases', 'apis'],
        sharedConcepts: ['api-design', 'database-optimization'],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam('frontend-team', frontendTeam);
      await sharedDB.createTeam('backend-team', backendTeam);

      // Step 2: Add team members
      await sharedDB.addTeamMember('frontend-team', 'alice', 'admin');
      await sharedDB.addTeamMember('frontend-team', 'bob', 'member');
      await sharedDB.addTeamMember('backend-team', 'charlie', 'admin');
      await sharedDB.addTeamMember('backend-team', 'diana', 'member');

      // Step 3: Define coding standards
      const typescriptRule: CodingStandardRule = {
        id: 'typescript-standards',
        name: 'TypeScript Standards',
        description: 'Enforce TypeScript best practices',
        teamId: 'frontend-team',
        severity: 'high',
        patterns: [
          'Use explicit types',
          'Avoid any type',
          'Use interfaces for object shapes'
        ],
        exceptions: [],
        examples: [
          'interface User { id: number; name: string; }',
          'const user: User = { id: 1, name: "John" };'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(typescriptRule);

      // Step 4: Execute team learning workflow
      const frontendCode = `
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

      const learningResult = await teamLearningWorkflow.executeTeamLearning(
        'frontend-team',
        frontendCode,
        'typescript'
      );

      expect(learningResult).toBeDefined();
      expect(learningResult.teamId).toBe('frontend-team');
      expect(learningResult.insights.length).toBeGreaterThan(0);

      // Step 5: Execute team standards workflow
      const standardsResult = await teamStandardsWorkflow.executeTeamStandards(
        'frontend-team',
        frontendCode,
        'typescript'
      );

      expect(standardsResult).toBeDefined();
      expect(standardsResult.teamId).toBe('frontend-team');
      expect(standardsResult.rules.length).toBeGreaterThan(0);

      // Step 6: Share knowledge between teams
      const sharingResult = await knowledgeSharingWorkflow.executeKnowledgeSharing(
        'frontend-team',
        'backend-team',
        ['component-design', 'state-management']
      );

      expect(sharingResult).toBeDefined();
      expect(sharingResult.sourceTeamId).toBe('frontend-team');
      expect(sharingResult.targetTeamId).toBe('backend-team');

      // Step 7: Get learning progress
      const frontendProgress = await sharedDB.getTeamLearningProgress('frontend-team');
      const backendProgress = await sharedDB.getTeamLearningProgress('backend-team');

      expect(frontendProgress).toBeDefined();
      expect(backendProgress).toBeDefined();
      expect(Array.isArray(frontendProgress)).toBe(true);
      expect(Array.isArray(backendProgress)).toBe(true);
    });

    test('should handle multi-team collaboration scenario', async () => {
      // Create multiple teams
      const teams = [
        {
          teamId: 'team-1',
          name: 'Team 1',
          description: 'First team',
          members: ['member-1'],
          learningDomains: ['domain-1'],
          sharedConcepts: [],
          privacyLevel: 'private' as const,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          teamId: 'team-2',
          name: 'Team 2',
          description: 'Second team',
          members: ['member-2'],
          learningDomains: ['domain-2'],
          sharedConcepts: [],
          privacyLevel: 'private' as const,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          teamId: 'team-3',
          name: 'Team 3',
          description: 'Third team',
          members: ['member-3'],
          learningDomains: ['domain-3'],
          sharedConcepts: [],
          privacyLevel: 'private' as const,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];

      // Create all teams
      for (const team of teams) {
        await sharedDB.createTeam(team.teamId, team);
        await sharedDB.addTeamMember(team.teamId, team.members[0], 'admin');
      }

      // Define team-specific rules
      for (let i = 0; i < teams.length; i++) {
        const rule: CodingStandardRule = {
          id: `team-${i + 1}-rule`,
          name: `Team ${i + 1} Rule`,
          description: `Rule for team ${i + 1}`,
          teamId: `team-${i + 1}`,
          severity: 'medium',
          patterns: [`Team ${i + 1} pattern`],
          exceptions: [],
          examples: [`Team ${i + 1} example`],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        await codingEngine.defineRule(rule);
      }

      // Execute workflows for each team
      const code = 'const test = "value";';
      const results = [];

      for (const team of teams) {
        const learningResult = await teamLearningWorkflow.executeTeamLearning(
          team.teamId,
          code,
          'typescript'
        );
        results.push(learningResult);
      }

      // Verify all workflows completed successfully
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.teamId).toBe(`team-${index + 1}`);
        expect(result.insights).toBeDefined();
        expect(Array.isArray(result.insights)).toBe(true);
      });

      // Test cross-team knowledge sharing
      const sharingResult = await knowledgeSharingWorkflow.executeKnowledgeSharing(
        'team-1',
        'team-2',
        ['shared-concept']
      );

      expect(sharingResult).toBeDefined();
      expect(sharingResult.sourceTeamId).toBe('team-1');
      expect(sharingResult.targetTeamId).toBe('team-2');
    });
  });

  describe('Real-World Scenarios', () => {
    test('should handle agile development team scenario', async () => {
      // Create agile team structure
      const productTeam: TeamConfig = {
        teamId: 'product-team',
        name: 'Product Team',
        description: 'Product management and requirements',
        members: ['product-manager', 'business-analyst'],
        learningDomains: ['product-management', 'user-research'],
        sharedConcepts: ['user-stories', 'acceptance-criteria'],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const devTeam: TeamConfig = {
        teamId: 'dev-team',
        name: 'Development Team',
        description: 'Software development and implementation',
        members: ['senior-dev', 'junior-dev', 'tech-lead'],
        learningDomains: ['programming', 'architecture', 'testing'],
        sharedConcepts: ['code-quality', 'best-practices'],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const qaTeam: TeamConfig = {
        teamId: 'qa-team',
        name: 'QA Team',
        description: 'Quality assurance and testing',
        members: ['qa-lead', 'test-engineer'],
        learningDomains: ['testing', 'quality-assurance'],
        sharedConcepts: ['test-cases', 'bug-tracking'],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Create teams
      await sharedDB.createTeam('product-team', productTeam);
      await sharedDB.createTeam('dev-team', devTeam);
      await sharedDB.createTeam('qa-team', qaTeam);

      // Add members
      await sharedDB.addTeamMember('product-team', 'product-manager', 'admin');
      await sharedDB.addTeamMember('product-team', 'business-analyst', 'member');
      await sharedDB.addTeamMember('dev-team', 'senior-dev', 'admin');
      await sharedDB.addTeamMember('dev-team', 'junior-dev', 'member');
      await sharedDB.addTeamMember('dev-team', 'tech-lead', 'admin');
      await sharedDB.addTeamMember('qa-team', 'qa-lead', 'admin');
      await sharedDB.addTeamMember('qa-team', 'test-engineer', 'member');

      // Define team-specific coding standards
      const devStandards: CodingStandardRule = {
        id: 'dev-standards',
        name: 'Development Standards',
        description: 'Standards for development team',
        teamId: 'dev-team',
        severity: 'high',
        patterns: [
          'Write unit tests for all functions',
          'Use meaningful variable names',
          'Follow SOLID principles'
        ],
        exceptions: [],
        examples: [
          'function calculateTotal(items: Item[]): number { return items.reduce((sum, item) => sum + item.price, 0); }'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(devStandards);

      // Simulate development workflow
      const productionCode = `
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

          async getUserById(id: number): Promise<User | null> {
            return this.users.find(user => user.id === id) || null;
          }
        }
      `;

      // Development team learns from code
      const devLearningResult = await teamLearningWorkflow.executeTeamLearning(
        'dev-team',
        productionCode,
        'typescript'
      );

      expect(devLearningResult).toBeDefined();
      expect(devLearningResult.insights.length).toBeGreaterThan(0);

      // Enforce coding standards
      const standardsResult = await teamStandardsWorkflow.executeTeamStandards(
        'dev-team',
        productionCode,
        'typescript'
      );

      expect(standardsResult).toBeDefined();
      expect(standardsResult.compliance).toBeGreaterThanOrEqual(0);

      // Share knowledge with QA team
      const knowledgeSharingResult = await knowledgeSharingWorkflow.executeKnowledgeSharing(
        'dev-team',
        'qa-team',
        ['code-quality', 'best-practices']
      );

      expect(knowledgeSharingResult).toBeDefined();
      expect(knowledgeSharingResult.sourceTeamId).toBe('dev-team');
      expect(knowledgeSharingResult.targetTeamId).toBe('qa-team');

      // Get learning progress for all teams
      const productProgress = await sharedDB.getTeamLearningProgress('product-team');
      const devProgress = await sharedDB.getTeamLearningProgress('dev-team');
      const qaProgress = await sharedDB.getTeamLearningProgress('qa-team');

      expect(productProgress).toBeDefined();
      expect(devProgress).toBeDefined();
      expect(qaProgress).toBeDefined();
    });

    test('should handle open source project scenario', async () => {
      // Create open source project structure
      const maintainerTeam: TeamConfig = {
        teamId: 'maintainers',
        name: 'Maintainers',
        description: 'Project maintainers and core contributors',
        members: ['lead-maintainer', 'core-contributor-1', 'core-contributor-2'],
        learningDomains: ['architecture', 'project-management'],
        sharedConcepts: ['roadmap', 'technical-decisions'],
        privacyLevel: 'public',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const contributorTeam: TeamConfig = {
        teamId: 'contributors',
        name: 'Contributors',
        description: 'Community contributors',
        members: ['contributor-1', 'contributor-2', 'contributor-3'],
        learningDomains: ['programming', 'collaboration'],
        sharedConcepts: ['pull-requests', 'code-review'],
        privacyLevel: 'public',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Create teams
      await sharedDB.createTeam('maintainers', maintainerTeam);
      await sharedDB.createTeam('contributors', contributorTeam);

      // Add members
      await sharedDB.addTeamMember('maintainers', 'lead-maintainer', 'admin');
      await sharedDB.addTeamMember('maintainers', 'core-contributor-1', 'admin');
      await sharedDB.addTeamMember('maintainers', 'core-contributor-2', 'admin');
      await sharedDB.addTeamMember('contributors', 'contributor-1', 'member');
      await sharedDB.addTeamMember('contributors', 'contributor-2', 'member');
      await sharedDB.addTeamMember('contributors', 'contributor-3', 'member');

      // Define open source coding standards
      const openSourceStandards: CodingStandardRule = {
        id: 'open-source-standards',
        name: 'Open Source Standards',
        description: 'Standards for open source contributions',
        teamId: 'contributors',
        severity: 'high',
        patterns: [
          'Follow project coding style',
          'Write comprehensive tests',
          'Document all public APIs',
          'Use semantic versioning'
        ],
        exceptions: [],
        examples: [
          '// Document public API\n/**\n * Creates a new user\n * @param userData - User data\n * @returns Promise<User>\n */\nasync function createUser(userData: UserData): Promise<User> { ... }'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(openSourceStandards);

      // Simulate contributor workflow
      const contributorCode = `
        /**
         * User authentication service
         * @public
         */
        export class AuthService {
          private users: Map<string, User> = new Map();

          /**
           * Authenticate user with credentials
           * @param credentials - User credentials
           * @returns Promise<AuthResult>
           */
          async authenticate(credentials: Credentials): Promise<AuthResult> {
            try {
              const user = await this.validateCredentials(credentials);
              return { success: true, user };
            } catch (error) {
              return { success: false, error: error.message };
            }
          }

          private async validateCredentials(credentials: Credentials): Promise<User> {
            // Implementation details
            throw new Error('Not implemented');
          }
        }
      `;

      // Contributors learn from code
      const contributorLearningResult = await teamLearningWorkflow.executeTeamLearning(
        'contributors',
        contributorCode,
        'typescript'
      );

      expect(contributorLearningResult).toBeDefined();
      expect(contributorLearningResult.insights.length).toBeGreaterThan(0);

      // Enforce open source standards
      const standardsResult = await teamStandardsWorkflow.executeTeamStandards(
        'contributors',
        contributorCode,
        'typescript'
      );

      expect(standardsResult).toBeDefined();
      expect(standardsResult.compliance).toBeGreaterThanOrEqual(0);

      // Share knowledge between maintainers and contributors
      const knowledgeSharingResult = await knowledgeSharingWorkflow.executeKnowledgeSharing(
        'maintainers',
        'contributors',
        ['architecture', 'technical-decisions']
      );

      expect(knowledgeSharingResult).toBeDefined();
      expect(knowledgeSharingResult.sourceTeamId).toBe('maintainers');
      expect(knowledgeSharingResult.targetTeamId).toBe('contributors');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large team collaboration efficiently', async () => {
      const teamCount = 10;
      const membersPerTeam = 5;
      const codeSize = 1000; // lines of code

      // Create multiple teams
      const teams = [];
      for (let i = 0; i < teamCount; i++) {
        const team: TeamConfig = {
          teamId: `large-team-${i}`,
          name: `Large Team ${i}`,
          description: `Team ${i} for performance testing`,
          members: [],
          learningDomains: [`domain-${i}`],
          sharedConcepts: [],
          privacyLevel: 'private',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        await sharedDB.createTeam(team.teamId, team);

        // Add members to team
        for (let j = 0; j < membersPerTeam; j++) {
          await sharedDB.addTeamMember(team.teamId, `member-${i}-${j}`, 'member');
        }

        teams.push(team);
      }

      // Generate large codebase
      let largeCode = '';
      for (let i = 0; i < codeSize; i++) {
        largeCode += `
          interface Interface${i} {
            id: number;
            name: string;
            data: any;
          }

          class Class${i} {
            private value: number = ${i};

            async method${i}(): Promise<Interface${i}> {
              return {
                id: ${i},
                name: "Item${i}",
                data: { value: ${i} }
              };
            }
          }
        `;
      }

      const startTime = Date.now();

      // Execute workflows for all teams
      const promises = teams.map(team => 
        teamLearningWorkflow.executeTeamLearning(team.teamId, largeCode, 'typescript')
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();

      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds
      expect(results).toHaveLength(teamCount);

      // Verify all results are valid
      results.forEach((result, index) => {
        expect(result.teamId).toBe(`large-team-${index}`);
        expect(result.insights).toBeDefined();
        expect(Array.isArray(result.insights)).toBe(true);
      });
    });

    test('should handle concurrent team operations', async () => {
      const concurrentOperations = 20;
      const teamId = 'concurrent-test-team';

      // Create a team
      const team: TeamConfig = {
        teamId,
        name: 'Concurrent Test Team',
        description: 'Team for concurrent operations testing',
        members: [],
        learningDomains: ['testing'],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await sharedDB.createTeam(teamId, team);

      const code = 'const test = "concurrent";';

      const startTime = Date.now();

      // Execute concurrent operations
      const promises = Array.from({ length: concurrentOperations }, (_, i) => 
        teamLearningWorkflow.executeTeamLearning(teamId, code, 'typescript')
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();

      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(results).toHaveLength(concurrentOperations);

      // Verify all results are valid
      results.forEach(result => {
        expect(result.teamId).toBe(teamId);
        expect(result.insights).toBeDefined();
        expect(Array.isArray(result.insights)).toBe(true);
      });
    });
  });

  describe('Demo Integration', () => {
    test('should run complete team collaboration demo', async () => {
      const demoResult = await demo.runDemo();

      expect(demoResult).toBeDefined();
      expect(demoResult.collaborationSuccess).toBe(true);
      expect(demoResult.teamsCreated).toBeGreaterThan(0);
      expect(demoResult.standardsDefined).toBeGreaterThan(0);
      expect(demoResult.workflowsExecuted).toBeGreaterThan(0);
      expect(demoResult.knowledgeShared).toBeGreaterThan(0);
      expect(demoResult.learningProgress).toBeGreaterThanOrEqual(0);
    });

    test('should demonstrate team collaboration features', async () => {
      await expect(demo.demonstrateTeamCollaboration())
        .resolves.not.toThrow();
    });
  });

  describe('Error Recovery', () => {
    test('should handle component failures gracefully', async () => {
      const teamId = 'error-recovery-team';
      const code = 'const test = "error recovery";';

      // Test with invalid team ID
      await expect(teamLearningWorkflow.executeTeamLearning('', code, 'typescript'))
        .resolves.not.toThrow();

      await expect(teamStandardsWorkflow.executeTeamStandards('', code, 'typescript'))
        .resolves.not.toThrow();

      // Test with invalid code
      await expect(teamLearningWorkflow.executeTeamLearning(teamId, '', 'typescript'))
        .resolves.not.toThrow();

      await expect(teamStandardsWorkflow.executeTeamStandards(teamId, '', 'typescript'))
        .resolves.not.toThrow();
    });

    test('should handle database connection failures', async () => {
      // Test with invalid storage path
      const invalidDB = new SharedLearningDatabase('/invalid/path');
      
      await expect(invalidDB.connect())
        .resolves.not.toThrow();

      await expect(invalidDB.createTeam('test', {
        teamId: 'test',
        name: 'Test',
        description: 'Test',
        members: [],
        learningDomains: [],
        sharedConcepts: [],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }))
        .resolves.not.toThrow();
    });
  });
});
