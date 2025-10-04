#!/usr/bin/env tsx

/**
 * Team Collaboration Demo
 * 
 * This demo showcases the Phase 3: Collaborative & Team-Wide Learning features:
 * - Shared learning database
 * - Team-based learning
 * - Knowledge sharing between teams
 * - Collaborative code improvement
 */

import { CentralizedH2GNNManager } from '../core/centralized-h2gnn-config';
import { TeamConfig } from '../core/shared-learning-database';

async function demonstrateTeamCollaboration(): Promise<void> {
  console.warn('🤝 Team Collaboration Demo');
  console.warn('==========================');
  
  // Initialize the centralized manager
  const manager = CentralizedH2GNNManager.getInstance();
  
  console.warn('\n📊 Phase 1: Creating Teams');
  console.warn('----------------------------');
  
  // Create frontend team
  const frontendTeam: TeamConfig = {
    teamId: 'frontend-team',
    name: 'Frontend Team',
    description: 'Frontend development team specializing in React and TypeScript',
    members: [],
    learningDomains: ['react', 'typescript', 'ui-ux', 'frontend-architecture'],
    sharedConcepts: ['component-design', 'state-management', 'performance-optimization'],
    privacyLevel: 'private',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  // Create backend team
  const backendTeam: TeamConfig = {
    teamId: 'backend-team',
    name: 'Backend Team',
    description: 'Backend development team specializing in Node.js and databases',
    members: [],
    learningDomains: ['nodejs', 'databases', 'apis', 'backend-architecture'],
    sharedConcepts: ['api-design', 'database-optimization', 'security-patterns'],
    privacyLevel: 'private',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  // Create DevOps team
  const devopsTeam: TeamConfig = {
    teamId: 'devops-team',
    name: 'DevOps Team',
    description: 'DevOps team specializing in infrastructure and deployment',
    members: [],
    learningDomains: ['docker', 'kubernetes', 'ci-cd', 'monitoring'],
    sharedConcepts: ['containerization', 'orchestration', 'automation'],
    privacyLevel: 'private',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  await manager.createTeam('frontend-team', frontendTeam);
  await manager.createTeam('backend-team', backendTeam);
  await manager.createTeam('devops-team', devopsTeam);
  
  console.warn('\n👥 Phase 2: Adding Team Members');
  console.warn('---------------------------------');
  
  // Add frontend team members
  await manager.addTeamMember('frontend-team', 'alice', 'admin');
  await manager.addTeamMember('frontend-team', 'bob', 'member');
  await manager.addTeamMember('frontend-team', 'carol', 'member');
  
  // Add backend team members
  await manager.addTeamMember('backend-team', 'david', 'admin');
  await manager.addTeamMember('backend-team', 'eve', 'member');
  await manager.addTeamMember('backend-team', 'frank', 'member');
  
  // Add DevOps team members
  await manager.addTeamMember('devops-team', 'grace', 'admin');
  await manager.addTeamMember('devops-team', 'henry', 'member');
  await manager.addTeamMember('devops-team', 'ivy', 'member');
  
  console.warn('\n🧠 Phase 3: Team Learning Sessions');
  console.warn('-----------------------------------');
  
  // Frontend team learning
  manager.setCurrentTeam('frontend-team');
  
  console.warn('\n🎨 Frontend Team Learning:');
  await manager.learnWithTeamContext(
    'react-hooks',
    { 
      type: 'frontend-pattern', 
      features: ['state-management', 'lifecycle', 'performance'],
      complexity: 'intermediate',
      bestPractices: ['useCallback', 'useMemo', 'custom-hooks']
    },
    { domain: 'frontend', team: 'frontend-team', contributor: 'alice' },
    0.9
  );
  
  await manager.learnWithTeamContext(
    'typescript-advanced',
    { 
      type: 'language-feature', 
      features: ['generics', 'utility-types', 'decorators'],
      complexity: 'advanced',
      bestPractices: ['type-safety', 'code-reusability']
    },
    { domain: 'frontend', team: 'frontend-team', contributor: 'bob' },
    0.85
  );
  
  await manager.learnWithTeamContext(
    'component-architecture',
    { 
      type: 'architecture-pattern', 
      features: ['composition', 'inheritance', 'props-drilling'],
      complexity: 'advanced',
      bestPractices: ['compound-components', 'render-props', 'context-api']
    },
    { domain: 'frontend', team: 'frontend-team', contributor: 'carol' },
    0.92
  );
  
  // Backend team learning
  manager.setCurrentTeam('backend-team');
  
  console.warn('\n⚙️ Backend Team Learning:');
  await manager.learnWithTeamContext(
    'api-design-patterns',
    { 
      type: 'backend-pattern', 
      features: ['rest', 'graphql', 'versioning'],
      complexity: 'intermediate',
      bestPractices: ['resource-based', 'stateless', 'cacheable']
    },
    { domain: 'backend', team: 'backend-team', contributor: 'david' },
    0.88
  );
  
  await manager.learnWithTeamContext(
    'database-optimization',
    { 
      type: 'performance-pattern', 
      features: ['indexing', 'query-optimization', 'connection-pooling'],
      complexity: 'advanced',
      bestPractices: ['query-analysis', 'index-strategy', 'connection-management']
    },
    { domain: 'backend', team: 'backend-team', contributor: 'eve' },
    0.91
  );
  
  await manager.learnWithTeamContext(
    'microservices-architecture',
    { 
      type: 'architecture-pattern', 
      features: ['service-discovery', 'load-balancing', 'circuit-breaker'],
      complexity: 'advanced',
      bestPractices: ['domain-driven-design', 'event-sourcing', 'saga-pattern']
    },
    { domain: 'backend', team: 'backend-team', contributor: 'frank' },
    0.87
  );
  
  // DevOps team learning
  manager.setCurrentTeam('devops-team');
  
  console.warn('\n🔧 DevOps Team Learning:');
  await manager.learnWithTeamContext(
    'container-orchestration',
    { 
      type: 'infrastructure-pattern', 
      features: ['kubernetes', 'docker-swarm', 'service-mesh'],
      complexity: 'advanced',
      bestPractices: ['pod-design', 'resource-limits', 'health-checks']
    },
    { domain: 'devops', team: 'devops-team', contributor: 'grace' },
    0.93
  );
  
  await manager.learnWithTeamContext(
    'ci-cd-pipelines',
    { 
      type: 'automation-pattern', 
      features: ['jenkins', 'gitlab-ci', 'github-actions'],
      complexity: 'intermediate',
      bestPractices: ['pipeline-as-code', 'environment-promotion', 'rollback-strategy']
    },
    { domain: 'devops', team: 'devops-team', contributor: 'henry' },
    0.89
  );
  
  await manager.learnWithTeamContext(
    'monitoring-observability',
    { 
      type: 'observability-pattern', 
      features: ['metrics', 'logging', 'tracing'],
      complexity: 'intermediate',
      bestPractices: ['three-pillars', 'distributed-tracing', 'alerting']
    },
    { domain: 'devops', team: 'devops-team', contributor: 'ivy' },
    0.86
  );
  
  console.warn('\n📊 Phase 4: Team Learning Progress');
  console.warn('----------------------------------');
  
  // Get learning progress for each team
  const frontendProgress = await manager.getTeamLearningProgress('frontend-team');
  const backendProgress = await manager.getTeamLearningProgress('backend-team');
  const devopsProgress = await manager.getTeamLearningProgress('devops-team');
  
  console.warn(`\n🎨 Frontend Team Progress: ${frontendProgress.length} domains`);
  frontendProgress.forEach(progress => {
    console.warn(`  • ${progress.domain}: ${progress.learnedConcepts}/${progress.totalConcepts} concepts (${progress.masteryLevel.toFixed(2)} mastery)`);
  });
  
  console.warn(`\n⚙️ Backend Team Progress: ${backendProgress.length} domains`);
  backendProgress.forEach(progress => {
    console.warn(`  • ${progress.domain}: ${progress.learnedConcepts}/${progress.totalConcepts} concepts (${progress.masteryLevel.toFixed(2)} mastery)`);
  });
  
  console.warn(`\n🔧 DevOps Team Progress: ${devopsProgress.length} domains`);
  devopsProgress.forEach(progress => {
    console.warn(`  • ${progress.domain}: ${progress.learnedConcepts}/${progress.totalConcepts} concepts (${progress.masteryLevel.toFixed(2)} mastery)`);
  });
  
  console.warn('\n🤝 Phase 5: Cross-Team Knowledge Sharing');
  console.warn('----------------------------------------');
  
  // Share knowledge between teams
  console.warn('\n📤 Sharing Frontend → Backend Knowledge:');
  await manager.shareKnowledge('frontend-team', 'backend-team', ['react-hooks', 'component-architecture']);
  
  console.warn('\n📤 Sharing Backend → DevOps Knowledge:');
  await manager.shareKnowledge('backend-team', 'devops-team', ['api-design-patterns', 'microservices-architecture']);
  
  console.warn('\n📤 Sharing DevOps → Frontend Knowledge:');
  await manager.shareKnowledge('devops-team', 'frontend-team', ['monitoring-observability', 'ci-cd-pipelines']);
  
  console.warn('\n🔄 Phase 6: Team Memory Synchronization');
  console.warn('---------------------------------------');
  
  // Sync memories for each team
  await manager.syncTeamMemories('frontend-team');
  await manager.syncTeamMemories('backend-team');
  await manager.syncTeamMemories('devops-team');
  
  console.warn('\n📈 Phase 7: Collaborative Learning Insights');
  console.warn('--------------------------------------------');
  
  // Get shared memories from cross-team learning
  const frontendMemories = await manager.getTeamMemories('frontend-team');
  const backendMemories = await manager.getTeamMemories('backend-team');
  const devopsMemories = await manager.getTeamMemories('devops-team');
  
  console.warn(`\n📊 Team Memory Summary:`);
  console.warn(`  • Frontend Team: ${frontendMemories.length} memories`);
  console.warn(`  • Backend Team: ${backendMemories.length} memories`);
  console.warn(`  • DevOps Team: ${devopsMemories.length} memories`);
  
  // Show cross-team learning
  const sharedMemories = frontendMemories.filter(m => m.context?.sharedFrom);
  console.warn(`\n🤝 Cross-Team Learning: ${sharedMemories.length} shared memories`);
  
  sharedMemories.forEach(memory => {
    console.warn(`  • ${memory.concept} (shared from ${memory.context.sharedFrom} to ${memory.context.sharedTo})`);
  });
  
  console.warn('\n🎉 Team Collaboration Demo Complete!');
  console.warn('=====================================');
  console.warn('✅ Team creation and member management');
  console.warn('✅ Team-based learning sessions');
  console.warn('✅ Cross-team knowledge sharing');
  console.warn('✅ Collaborative memory synchronization');
  console.warn('✅ Learning progress tracking');
  console.warn('\n🚀 Phase 3: Collaborative & Team-Wide Learning is working!');
}

// Run the demo only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateTeamCollaboration().catch(console.error);
}

