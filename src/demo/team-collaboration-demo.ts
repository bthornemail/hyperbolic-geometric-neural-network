#!/usr/bin/env tsx

/**
 * Team Collaboration Demo
 * 
 * This demo showcases Phase 3 collaborative features:
 * - Team creation and management
 * - Shared learning database
 * - Coding standards enforcement
 * - Cross-team knowledge sharing
 * - Team learning workflows
 */

import { SharedLearningDatabase, TeamConfig } from '../core/shared-learning-database';
import { CodingStandardEngine, CodingStandardRule } from '../rules/coding-standard-engine';
import { TeamLearningWorkflow } from '../workflows/team-collaboration-workflow';
import { KnowledgeSharingWorkflow } from '../workflows/knowledge-sharing-workflow';
import { TeamStandardsWorkflow } from '../workflows/team-standards-workflow';
import { getSharedH2GNN } from '../core/centralized-h2gnn-config';

export interface TeamCollaborationDemoResult {
  teamsCreated: number;
  standardsDefined: number;
  knowledgeShared: number;
  workflowsExecuted: number;
  learningProgress: number;
  collaborationSuccess: boolean;
}

export class TeamCollaborationDemo {
  private sharedDB: SharedLearningDatabase;
  private codingEngine: CodingStandardEngine;
  private h2gnn: any;
  private teamLearningWorkflow: TeamLearningWorkflow;
  private knowledgeSharingWorkflow: KnowledgeSharingWorkflow;
  private teamStandardsWorkflow: TeamStandardsWorkflow;

  constructor() {
    this.sharedDB = new SharedLearningDatabase();
    this.codingEngine = new CodingStandardEngine();
    this.h2gnn = getSharedH2GNN();
    this.teamLearningWorkflow = new TeamLearningWorkflow();
    this.knowledgeSharingWorkflow = new KnowledgeSharingWorkflow();
    this.teamStandardsWorkflow = new TeamStandardsWorkflow();
  }

  /**
   * Run the complete team collaboration demo
   */
  async runDemo(): Promise<TeamCollaborationDemoResult> {
    console.warn('🚀 Starting Team Collaboration Demo');
    console.warn('=====================================');

    try {
      // Initialize shared learning database
      await this.sharedDB.connect();

      // Create teams
      const teamsCreated = await this.createTeams();

      // Define coding standards
      const standardsDefined = await this.defineCodingStandards();

      // Execute team learning workflows
      const workflowsExecuted = await this.executeTeamWorkflows();

      // Share knowledge between teams
      const knowledgeShared = await this.shareKnowledgeBetweenTeams();

      // Get learning progress
      const learningProgress = await this.analyzeLearningProgress();

      console.warn('\n🎉 Team Collaboration Demo Complete!');
      console.warn('=====================================');
      console.warn(`✅ Teams created: ${teamsCreated}`);
      console.warn(`✅ Standards defined: ${standardsDefined}`);
      console.warn(`✅ Workflows executed: ${workflowsExecuted}`);
      console.warn(`✅ Knowledge shared: ${knowledgeShared}`);
      console.warn(`✅ Learning progress: ${learningProgress}%`);

      return {
        teamsCreated,
        standardsDefined,
        knowledgeShared,
        workflowsExecuted,
        learningProgress,
        collaborationSuccess: true
      };

    } catch (error) {
      console.error('❌ Team Collaboration Demo failed:', error);
      return {
        teamsCreated: 0,
        standardsDefined: 0,
        knowledgeShared: 0,
        workflowsExecuted: 0,
        learningProgress: 0,
        collaborationSuccess: false
      };
    } finally {
      await this.sharedDB.disconnect();
    }
  }

  /**
   * Create teams for collaboration
   */
  private async createTeams(): Promise<number> {
    console.warn('\n🤝 Creating Teams');
    console.warn('=================');

    const teams: TeamConfig[] = [
      {
        teamId: 'frontend-team',
        name: 'Frontend Development Team',
        description: 'React and TypeScript frontend development',
        members: ['alice', 'bob', 'charlie'],
        learningDomains: ['react', 'typescript', 'ui-ux', 'frontend-architecture'],
        sharedConcepts: ['component-design', 'state-management', 'performance-optimization'],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        teamId: 'backend-team',
        name: 'Backend Development Team',
        description: 'Node.js and database backend development',
        members: ['diana', 'eve', 'frank'],
        learningDomains: ['nodejs', 'databases', 'apis', 'backend-architecture'],
        sharedConcepts: ['api-design', 'database-optimization', 'security-patterns'],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        teamId: 'devops-team',
        name: 'DevOps and Infrastructure Team',
        description: 'Infrastructure and deployment automation',
        members: ['grace', 'henry', 'iris'],
        learningDomains: ['kubernetes', 'docker', 'ci-cd', 'monitoring'],
        sharedConcepts: ['infrastructure-as-code', 'deployment-strategies', 'observability'],
        privacyLevel: 'private',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    for (const team of teams) {
      await this.sharedDB.createTeam(team.teamId, team);
      console.warn(`✅ Created team: ${team.name} (${team.teamId})`);
    }

    return teams.length;
  }

  /**
   * Define coding standards for teams
   */
  private async defineCodingStandards(): Promise<number> {
    console.warn('\n📋 Defining Coding Standards');
    console.warn('============================');

    const standards: CodingStandardRule[] = [
      {
        id: 'typescript-best-practices',
        name: 'TypeScript Best Practices',
        description: 'Enforce TypeScript best practices across all teams',
        teamId: 'all-teams',
        severity: 'high',
        patterns: [
          'Use explicit types',
          'Avoid any type',
          'Use interfaces for object shapes',
          'Use enums for constants',
          'Prefer const assertions'
        ],
        exceptions: [],
        examples: [
          'interface User { id: number; name: string; }',
          'enum Status { ACTIVE, INACTIVE }',
          'const user: User = { id: 1, name: "John" };'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'error-handling-standards',
        name: 'Error Handling Standards',
        description: 'Consistent error handling patterns',
        teamId: 'all-teams',
        severity: 'critical',
        patterns: [
          'Use try-catch blocks for async operations',
          'Log errors with context',
          'Provide user-friendly error messages',
          'Handle promise rejections'
        ],
        exceptions: [],
        examples: [
          'try { const result = await apiCall(); } catch (error) { logger.error("API call failed:", error); }'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'frontend-performance',
        name: 'Frontend Performance Standards',
        description: 'Performance optimization for frontend code',
        teamId: 'frontend-team',
        severity: 'high',
        patterns: [
          'Use React.memo for expensive components',
          'Implement code splitting',
          'Optimize bundle size',
          'Use lazy loading for images'
        ],
        exceptions: [],
        examples: [
          'const ExpensiveComponent = React.memo(({ data }) => { ... });',
          'const LazyComponent = React.lazy(() => import("./LazyComponent"));'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'backend-security',
        name: 'Backend Security Standards',
        description: 'Security best practices for backend code',
        teamId: 'backend-team',
        severity: 'critical',
        patterns: [
          'Validate all inputs',
          'Use parameterized queries',
          'Implement rate limiting',
          'Sanitize user data'
        ],
        exceptions: [],
        examples: [
          'const user = await validateInput(req.body);',
          'const result = await db.query("SELECT * FROM users WHERE id = ?", [userId]);'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    for (const standard of standards) {
      await this.codingEngine.defineRule(standard);
      console.warn(`✅ Defined standard: ${standard.name} (${standard.severity})`);
    }

    return standards.length;
  }

  /**
   * Execute team learning workflows
   */
  private async executeTeamWorkflows(): Promise<number> {
    console.warn('\n🔄 Executing Team Workflows');
    console.warn('============================');

    const sampleCode = `
// Sample TypeScript code for analysis
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

    let workflowsExecuted = 0;

    // Team Learning Workflow
    console.warn('📚 Executing Team Learning Workflow...');
    const teamLearningResult = await this.teamLearningWorkflow.executeTeamLearning(
      'frontend-team',
      sampleCode,
      'typescript'
    );
    console.warn(`✅ Team learning complete: ${teamLearningResult.insights.length} insights generated`);

    // Team Standards Workflow
    console.warn('📋 Executing Team Standards Workflow...');
    const teamStandardsResult = await this.teamStandardsWorkflow.executeTeamStandards(
      'backend-team',
      sampleCode,
      'typescript'
    );
    console.warn(`✅ Team standards complete: ${teamStandardsResult.compliance}% compliance`);

    workflowsExecuted = 2;

    return workflowsExecuted;
  }

  /**
   * Share knowledge between teams
   */
  private async shareKnowledgeBetweenTeams(): Promise<number> {
    console.warn('\n🤝 Sharing Knowledge Between Teams');
    console.warn('===================================');

    // Share frontend knowledge with backend team
    console.warn('📤 Sharing frontend knowledge with backend team...');
    const frontendToBackendResult = await this.knowledgeSharingWorkflow.executeKnowledgeSharing(
      'frontend-team',
      'backend-team',
      ['component-design', 'state-management']
    );
    console.warn(`✅ Frontend → Backend: ${frontendToBackendResult.sharedKnowledge.length} knowledge items shared`);

    // Share backend knowledge with devops team
    console.warn('📤 Sharing backend knowledge with devops team...');
    const backendToDevopsResult = await this.knowledgeSharingWorkflow.executeKnowledgeSharing(
      'backend-team',
      'devops-team',
      ['api-design', 'database-optimization']
    );
    console.warn(`✅ Backend → DevOps: ${backendToDevopsResult.sharedKnowledge.length} knowledge items shared`);

    // Share devops knowledge with frontend team
    console.warn('📤 Sharing devops knowledge with frontend team...');
    const devopsToFrontendResult = await this.knowledgeSharingWorkflow.executeKnowledgeSharing(
      'devops-team',
      'frontend-team',
      ['deployment-strategies', 'monitoring']
    );
    console.warn(`✅ DevOps → Frontend: ${devopsToFrontendResult.sharedKnowledge.length} knowledge items shared`);

    return 3; // Three knowledge sharing operations
  }

  /**
   * Analyze learning progress across teams
   */
  private async analyzeLearningProgress(): Promise<number> {
    console.warn('\n📊 Analyzing Learning Progress');
    console.warn('==============================');

    const teams = ['frontend-team', 'backend-team', 'devops-team'];
    let totalProgress = 0;

    for (const teamId of teams) {
      const progress = await this.sharedDB.getTeamLearningProgress(teamId);
      const teamProgress = progress.reduce((sum, p) => sum + p.masteryLevel, 0) / progress.length || 0;
      totalProgress += teamProgress;
      
      console.warn(`📈 ${teamId}: ${progress.length} domains, ${Math.round(teamProgress * 100)}% mastery`);
    }

    const averageProgress = Math.round((totalProgress / teams.length) * 100);
    console.warn(`📊 Average team learning progress: ${averageProgress}%`);

    return averageProgress;
  }

  /**
   * Demonstrate team collaboration features
   */
  async demonstrateTeamCollaboration(): Promise<void> {
    console.warn('\n🎯 Team Collaboration Features Demo');
    console.warn('===================================');

    // Create a sample team
    const teamConfig: TeamConfig = {
      teamId: 'demo-team',
      name: 'Demo Team',
      description: 'Demonstration team for collaboration features',
      members: ['demo-user-1', 'demo-user-2'],
      learningDomains: ['collaboration', 'learning', 'standards'],
      sharedConcepts: ['team-work', 'knowledge-sharing'],
      privacyLevel: 'public',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.sharedDB.createTeam('demo-team', teamConfig);
    console.warn('✅ Demo team created');

    // Add team members
    await this.sharedDB.addTeamMember('demo-team', 'demo-user-1', 'admin');
    await this.sharedDB.addTeamMember('demo-team', 'demo-user-2', 'member');
    console.warn('✅ Team members added');

    // Define team-specific coding standards
    const teamStandard: CodingStandardRule = {
      id: 'demo-team-standards',
      name: 'Demo Team Standards',
      description: 'Standards for demo team collaboration',
      teamId: 'demo-team',
      severity: 'medium',
      patterns: [
        'Use descriptive variable names',
        'Add comments for complex logic',
        'Follow team naming conventions'
      ],
      exceptions: [],
      examples: [
        'const userAccountBalance = calculateBalance(account);',
        '// Calculate balance for user account'
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.codingEngine.defineRule(teamStandard);
    console.warn('✅ Team standards defined');

    // Learn from team standards
    await this.codingEngine.learnFromTeamStandards('demo-team');
    console.warn('✅ Learned from team standards');

    // Get team learning progress
    const progress = await this.sharedDB.getTeamLearningProgress('demo-team');
    console.warn(`📊 Demo team learning progress: ${progress.length} domains`);

    console.warn('\n🎉 Team collaboration features demonstrated successfully!');
  }
}

// Demo execution function
async function runTeamCollaborationDemo(): Promise<void> {
  console.warn('🚀 H²GNN Phase 3: Team Collaboration Demo');
  console.warn('==========================================');
  console.warn('This demo showcases collaborative learning features:');
  console.warn('- Team creation and management');
  console.warn('- Shared learning database');
  console.warn('- Coding standards enforcement');
  console.warn('- Cross-team knowledge sharing');
  console.warn('- Team learning workflows');
  console.warn('');

  const demo = new TeamCollaborationDemo();
  
  try {
    // Run the main demo
    const result = await demo.runDemo();
    
    if (result.collaborationSuccess) {
      console.warn('\n🎉 Phase 3 Team Collaboration Demo SUCCESS!');
      console.warn('===========================================');
      console.warn(`✅ Teams created: ${result.teamsCreated}`);
      console.warn(`✅ Standards defined: ${result.standardsDefined}`);
      console.warn(`✅ Workflows executed: ${result.workflowsExecuted}`);
      console.warn(`✅ Knowledge shared: ${result.knowledgeShared}`);
      console.warn(`✅ Learning progress: ${result.learningProgress}%`);
      console.warn('');
      console.warn('🚀 Phase 3: Collaborative & Team-Wide Learning is READY!');
    } else {
      console.warn('\n❌ Phase 3 Team Collaboration Demo FAILED');
      console.warn('Please check the implementation and try again.');
    }

    // Demonstrate additional features
    console.warn('\n🎯 Additional Team Collaboration Features');
    console.warn('==========================================');
    await demo.demonstrateTeamCollaboration();

  } catch (error) {
    console.error('\n❌ Demo execution failed:', error);
    console.warn('Please check the implementation and dependencies.');
  }
}

// Export for use in other modules
export { TeamCollaborationDemo, runTeamCollaborationDemo };

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTeamCollaborationDemo().catch(console.error);
}