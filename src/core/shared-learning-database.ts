#!/usr/bin/env tsx

/**
 * Shared Learning Database
 * 
 * This module provides distributed learning capabilities for team collaboration:
 * - Multi-instance memory synchronization
 * - Team-based learning isolation
 * - Conflict resolution for concurrent learning
 * - Cross-team knowledge sharing
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { LearningMemory, UnderstandingSnapshot, LearningProgress } from './enhanced-h2gnn';

export interface TeamConfig {
  teamId: string;
  name: string;
  description: string;
  members: string[];
  learningDomains: string[];
  sharedConcepts: string[];
  privacyLevel: 'public' | 'private' | 'restricted';
  createdAt: number;
  updatedAt: number;
}

export interface TeamMember {
  memberId: string;
  teamId: string;
  role: 'admin' | 'member' | 'viewer';
  permissions: string[];
  joinedAt: number;
  lastActive: number;
}

export interface SharedLearningState {
  teamId: string;
  totalMemories: number;
  totalSnapshots: number;
  lastSync: number;
  conflicts: number;
  sharedConcepts: string[];
  learningProgress: LearningProgress[];
}

export interface MemoryConflict {
  id: string;
  teamId: string;
  concept: string;
  conflictingMemories: LearningMemory[];
  resolution: 'merge' | 'replace' | 'manual';
  resolved: boolean;
  createdAt: number;
}

export interface TeamLearningInsight {
  teamId: string;
  concept: string;
  insight: string;
  confidence: number;
  contributors: string[];
  createdAt: number;
}

export class SharedLearningDatabase {
  private storagePath: string;
  private teams: Map<string, TeamConfig> = new Map();
  private members: Map<string, TeamMember> = new Map();
  private conflicts: Map<string, MemoryConflict> = new Map();
  private insights: Map<string, TeamLearningInsight> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  private syncFrequency: number = parseInt(process.env.H2GNN_SYNC_FREQUENCY || '300000', 10); // 5 minutes (configurable via env)

  constructor(storagePath?: string) {
    this.storagePath = storagePath || process.env.H2GNN_SHARED_LEARNING_PATH || './shared-learning';
    this.initializeDatabase();
  }

  /**
   * Initialize the shared learning database
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
      await fs.mkdir(path.join(this.storagePath, 'teams'), { recursive: true });
      await fs.mkdir(path.join(this.storagePath, 'memories'), { recursive: true });
      await fs.mkdir(path.join(this.storagePath, 'snapshots'), { recursive: true });
      await fs.mkdir(path.join(this.storagePath, 'conflicts'), { recursive: true });
      await fs.mkdir(path.join(this.storagePath, 'insights'), { recursive: true });
      
      await this.loadTeams();
      await this.loadMembers();
      await this.loadConflicts();
      await this.loadInsights();
      
      this.startSyncProcess();
      console.warn('🤝 Shared Learning Database initialized');
    } catch (error) {
      console.warn('Warning: Could not initialize shared learning database:', error);
    }
  }

  /**
   * Connect to the database
   */
  async connect(): Promise<void> {
    console.warn('🤝 Connecting to Shared Learning Database...');
    // In a real implementation, this would connect to Redis/PostgreSQL
    console.warn('✅ Connected to Shared Learning Database');
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.warn('🤝 Disconnected from Shared Learning Database');
  }

  /**
   * Create a new team
   */
  async createTeam(teamId: string, config: TeamConfig): Promise<void> {
    console.warn(`🤝 Creating team: ${teamId}`);
    
    this.teams.set(teamId, config);
    await this.persistTeam(teamId, config);
    
    // Create team directories
    await fs.mkdir(path.join(this.storagePath, 'teams', teamId), { recursive: true });
    await fs.mkdir(path.join(this.storagePath, 'memories', teamId), { recursive: true });
    await fs.mkdir(path.join(this.storagePath, 'snapshots', teamId), { recursive: true });
    
    console.warn(`✅ Team ${teamId} created successfully`);
  }

  /**
   * Add a team member
   */
  async addTeamMember(teamId: string, memberId: string, role: 'admin' | 'member' | 'viewer' = 'member'): Promise<void> {
    console.warn(`🤝 Adding member ${memberId} to team ${teamId}`);
    
    const member: TeamMember = {
      memberId,
      teamId,
      role,
      permissions: this.getRolePermissions(role),
      joinedAt: Date.now(),
      lastActive: Date.now()
    };
    
    this.members.set(memberId, member);
    await this.persistMember(memberId, member);
    
    // Update team config
    const team = this.teams.get(teamId);
    if (team) {
      team.members.push(memberId);
      team.updatedAt = Date.now();
      await this.persistTeam(teamId, team);
    }
    
    console.warn(`✅ Member ${memberId} added to team ${teamId}`);
  }

  /**
   * Store a learning memory for a team
   */
  async storeMemory(teamId: string, memory: LearningMemory): Promise<void> {
    console.warn(`🤝 Storing memory for team ${teamId}: ${memory.concept}`);
    
    // Check for conflicts
    const conflicts = await this.detectMemoryConflicts(teamId, memory);
    if (conflicts.length > 0) {
      await this.handleMemoryConflicts(teamId, memory, conflicts);
    }
    
    // Store memory
    const memoryPath = path.join(this.storagePath, 'memories', teamId, `${memory.id}.json`);
    await fs.writeFile(memoryPath, JSON.stringify(memory, null, 2));
    
    console.warn(`✅ Memory stored for team ${teamId}: ${memory.concept}`);
  }

  /**
   * Retrieve memories for a team
   */
  async retrieveMemories(teamId: string, concept?: string): Promise<LearningMemory[]> {
    console.warn(`🤝 Retrieving memories for team ${teamId}${concept ? ` (concept: ${concept})` : ''}`);
    
    const memories: LearningMemory[] = [];
    const teamMemoriesPath = path.join(this.storagePath, 'memories', teamId);
    
    try {
      const files = await fs.readdir(teamMemoriesPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const memoryPath = path.join(teamMemoriesPath, file);
          const memoryData = await fs.readFile(memoryPath, 'utf-8');
          const memory: LearningMemory = JSON.parse(memoryData);
          
          if (!concept || memory.concept.includes(concept)) {
            memories.push(memory);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not retrieve memories for team ${teamId}:`, error);
    }
    
    console.warn(`✅ Retrieved ${memories.length} memories for team ${teamId}`);
    return memories;
  }

  /**
   * Store an understanding snapshot for a team
   */
  async storeSnapshot(teamId: string, snapshot: UnderstandingSnapshot): Promise<void> {
    console.warn(`🤝 Storing snapshot for team ${teamId}: ${snapshot.id}`);
    
    const snapshotPath = path.join(this.storagePath, 'snapshots', teamId, `${snapshot.id}.json`);
    await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2));
    
    console.warn(`✅ Snapshot stored for team ${teamId}: ${snapshot.id}`);
  }

  /**
   * Retrieve understanding snapshots for a team
   */
  async retrieveSnapshots(teamId: string, domain?: string): Promise<UnderstandingSnapshot[]> {
    console.warn(`🤝 Retrieving snapshots for team ${teamId}${domain ? ` (domain: ${domain})` : ''}`);
    
    const snapshots: UnderstandingSnapshot[] = [];
    const teamSnapshotsPath = path.join(this.storagePath, 'snapshots', teamId);
    
    try {
      const files = await fs.readdir(teamSnapshotsPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const snapshotPath = path.join(teamSnapshotsPath, file);
          const snapshotData = await fs.readFile(snapshotPath, 'utf-8');
          const snapshot: UnderstandingSnapshot = JSON.parse(snapshotData);
          
          if (!domain || snapshot.domain === domain) {
            snapshots.push(snapshot);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not retrieve snapshots for team ${teamId}:`, error);
    }
    
    console.warn(`✅ Retrieved ${snapshots.length} snapshots for team ${teamId}`);
    return snapshots;
  }

  /**
   * Sync memories across team instances
   */
  async syncMemories(teamId: string): Promise<void> {
    console.warn(`🤝 Syncing memories for team ${teamId}`);
    
    const memories = await this.retrieveMemories(teamId);
    const snapshots = await this.retrieveSnapshots(teamId);
    
    // Check for conflicts
    const conflicts = await this.detectSyncConflicts(teamId, memories);
    if (conflicts.length > 0) {
      await this.resolveSyncConflicts(teamId, conflicts);
    }
    
    console.warn(`✅ Synced ${memories.length} memories and ${snapshots.length} snapshots for team ${teamId}`);
  }

  /**
   * Get team learning progress
   */
  async getTeamLearningProgress(teamId: string): Promise<LearningProgress[]> {
    console.warn(`🤝 Getting learning progress for team ${teamId}`);
    
    const memories = await this.retrieveMemories(teamId);
    const snapshots = await this.retrieveSnapshots(teamId);
    
    // Calculate learning progress by domain
    const progressMap = new Map<string, LearningProgress>();
    
    for (const memory of memories) {
      const domain = this.extractDomain(memory.concept);
      if (!progressMap.has(domain)) {
        progressMap.set(domain, {
          domain,
          totalConcepts: 0,
          learnedConcepts: 0,
          masteryLevel: 0,
          lastUpdated: memory.timestamp,
          learningCurve: [],
          weakAreas: [],
          strongAreas: []
        });
      }
      
      const progress = progressMap.get(domain)!;
      progress.totalConcepts++;
      progress.learnedConcepts++;
      progress.masteryLevel += memory.confidence;
      progress.lastUpdated = Math.max(progress.lastUpdated, memory.timestamp);
      progress.learningCurve.push({
        timestamp: memory.timestamp,
        performance: memory.performance
      });
    }
    
    const progress = Array.from(progressMap.values());
    console.warn(`✅ Retrieved learning progress for team ${teamId}: ${progress.length} domains`);
    return progress;
  }

  /**
   * Share knowledge between teams
   */
  async shareKnowledge(sourceTeamId: string, targetTeamId: string, concepts: string[]): Promise<void> {
    console.warn(`🤝 Sharing knowledge from team ${sourceTeamId} to team ${targetTeamId}`);
    
    const sourceMemories = await this.retrieveMemories(sourceTeamId);
    const relevantMemories = sourceMemories.filter(m => 
      concepts.some(concept => m.concept.includes(concept))
    );
    
    for (const memory of relevantMemories) {
      // Create a shared version of the memory
      const sharedMemory: LearningMemory = {
        ...memory,
        id: `shared_${memory.id}_${Date.now()}`,
        timestamp: Date.now(),
        context: {
          ...memory.context,
          sharedFrom: sourceTeamId,
          sharedTo: targetTeamId,
          originalId: memory.id
        }
      };
      
      await this.storeMemory(targetTeamId, sharedMemory);
    }
    
    console.warn(`✅ Shared ${relevantMemories.length} memories from team ${sourceTeamId} to team ${targetTeamId}`);
  }

  /**
   * Detect memory conflicts
   */
  private async detectMemoryConflicts(teamId: string, newMemory: LearningMemory): Promise<LearningMemory[]> {
    const existingMemories = await this.retrieveMemories(teamId, newMemory.concept);
    return existingMemories.filter(m => 
      m.concept === newMemory.concept && 
      Math.abs(m.timestamp - newMemory.timestamp) < 60000 // Within 1 minute
    );
  }

  /**
   * Handle memory conflicts
   */
  private async handleMemoryConflicts(teamId: string, newMemory: LearningMemory, conflicts: LearningMemory[]): Promise<void> {
    console.warn(`🤝 Handling memory conflicts for team ${teamId}: ${newMemory.concept}`);
    
    const conflict: MemoryConflict = {
      id: `conflict_${Date.now()}_${newMemory.concept}`,
      teamId,
      concept: newMemory.concept,
      conflictingMemories: [newMemory, ...conflicts],
      resolution: 'merge',
      resolved: false,
      createdAt: Date.now()
    };
    
    this.conflicts.set(conflict.id, conflict);
    await this.persistConflict(conflict.id, conflict);
    
    // Auto-resolve simple conflicts
    if (conflicts.length === 1) {
      await this.autoResolveConflict(conflict);
    }
  }

  /**
   * Auto-resolve simple conflicts
   */
  private async autoResolveConflict(conflict: MemoryConflict): Promise<void> {
    console.warn(`🤝 Auto-resolving conflict: ${conflict.id}`);
    
    const memories = conflict.conflictingMemories;
    const bestMemory = memories.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
    
    // Keep the best memory, discard others
    for (const memory of memories) {
      if (memory.id !== bestMemory.id) {
        // Mark as resolved/merged
        memory.consolidated = true;
      }
    }
    
    conflict.resolved = true;
    await this.persistConflict(conflict.id, conflict);
    
    console.warn(`✅ Auto-resolved conflict: ${conflict.id}`);
  }

  /**
   * Detect sync conflicts
   */
  private async detectSyncConflicts(teamId: string, memories: LearningMemory[]): Promise<MemoryConflict[]> {
    const conflicts: MemoryConflict[] = [];
    const conceptGroups = new Map<string, LearningMemory[]>();
    
    for (const memory of memories) {
      if (!conceptGroups.has(memory.concept)) {
        conceptGroups.set(memory.concept, []);
      }
      conceptGroups.get(memory.concept)!.push(memory);
    }
    
    for (const [concept, conceptMemories] of conceptGroups) {
      if (conceptMemories.length > 1) {
        const conflict: MemoryConflict = {
          id: `sync_conflict_${Date.now()}_${concept}`,
          teamId,
          concept,
          conflictingMemories: conceptMemories,
          resolution: 'merge',
          resolved: false,
          createdAt: Date.now()
        };
        conflicts.push(conflict);
      }
    }
    
    return conflicts;
  }

  /**
   * Resolve sync conflicts
   */
  private async resolveSyncConflicts(teamId: string, conflicts: MemoryConflict[]): Promise<void> {
    console.warn(`🤝 Resolving ${conflicts.length} sync conflicts for team ${teamId}`);
    
    for (const conflict of conflicts) {
      await this.autoResolveConflict(conflict);
    }
    
    console.warn(`✅ Resolved ${conflicts.length} sync conflicts for team ${teamId}`);
  }

  /**
   * Start the sync process
   */
  private startSyncProcess(): void {
    if (this.syncFrequency > 0) {
      this.syncInterval = setInterval(async () => {
        if (process.env.H2GNN_DEBUG === 'true') {
          console.warn('🤝 Running periodic sync...');
        }
        
        for (const teamId of this.teams.keys()) {
          await this.syncMemories(teamId);
        }
      }, this.syncFrequency);
    }
  }

  /**
   * Get role permissions
   */
  private getRolePermissions(role: string): string[] {
    switch (role) {
      case 'admin':
        return ['read', 'write', 'delete', 'manage_team', 'share_knowledge'];
      case 'member':
        return ['read', 'write', 'share_knowledge'];
      case 'viewer':
        return ['read'];
      default:
        return ['read'];
    }
  }

  /**
   * Extract domain from concept
   */
  private extractDomain(concept: string): string {
    const conceptLower = concept.toLowerCase();
    
    if (conceptLower.includes('neural') || conceptLower.includes('network')) {
      return 'neural_networks';
    } else if (conceptLower.includes('hyperbolic') || conceptLower.includes('geometric')) {
      return 'hyperbolic_geometry';
    } else if (conceptLower.includes('wordnet') || conceptLower.includes('semantic')) {
      return 'semantic_processing';
    } else if (conceptLower.includes('graph') || conceptLower.includes('hierarchy')) {
      return 'graph_structures';
    } else {
      return 'general_concepts';
    }
  }

  // Persistence methods
  private async persistTeam(teamId: string, team: TeamConfig): Promise<void> {
    const teamPath = path.join(this.storagePath, 'teams', `${teamId}.json`);
    await fs.writeFile(teamPath, JSON.stringify(team, null, 2));
  }

  private async persistMember(memberId: string, member: TeamMember): Promise<void> {
    const memberPath = path.join(this.storagePath, 'teams', 'members', `${memberId}.json`);
    await fs.mkdir(path.dirname(memberPath), { recursive: true });
    await fs.writeFile(memberPath, JSON.stringify(member, null, 2));
  }

  private async persistConflict(conflictId: string, conflict: MemoryConflict): Promise<void> {
    const conflictPath = path.join(this.storagePath, 'conflicts', `${conflictId}.json`);
    await fs.writeFile(conflictPath, JSON.stringify(conflict, null, 2));
  }

  private async persistInsight(insightId: string, insight: TeamLearningInsight): Promise<void> {
    const insightPath = path.join(this.storagePath, 'insights', `${insightId}.json`);
    await fs.writeFile(insightPath, JSON.stringify(insight, null, 2));
  }

  // Load methods
  private async loadTeams(): Promise<void> {
    try {
      const teamsPath = path.join(this.storagePath, 'teams');
      const files = await fs.readdir(teamsPath);
      
      for (const file of files) {
        if (file.endsWith('.json') && !file.includes('members')) {
          const teamPath = path.join(teamsPath, file);
          const teamData = await fs.readFile(teamPath, 'utf-8');
          const team: TeamConfig = JSON.parse(teamData);
          this.teams.set(team.teamId, team);
        }
      }
    } catch (error) {
      console.warn('Warning: Could not load teams:', error);
    }
  }

  private async loadMembers(): Promise<void> {
    try {
      const membersPath = path.join(this.storagePath, 'teams', 'members');
      const files = await fs.readdir(membersPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const memberPath = path.join(membersPath, file);
          const memberData = await fs.readFile(memberPath, 'utf-8');
          const member: TeamMember = JSON.parse(memberData);
          this.members.set(member.memberId, member);
        }
      }
    } catch (error) {
      console.warn('Warning: Could not load members:', error);
    }
  }

  private async loadConflicts(): Promise<void> {
    try {
      const conflictsPath = path.join(this.storagePath, 'conflicts');
      const files = await fs.readdir(conflictsPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const conflictPath = path.join(conflictsPath, file);
          const conflictData = await fs.readFile(conflictPath, 'utf-8');
          const conflict: MemoryConflict = JSON.parse(conflictData);
          this.conflicts.set(conflict.id, conflict);
        }
      }
    } catch (error) {
      console.warn('Warning: Could not load conflicts:', error);
    }
  }

  private async loadInsights(): Promise<void> {
    try {
      const insightsPath = path.join(this.storagePath, 'insights');
      const files = await fs.readdir(insightsPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const insightPath = path.join(insightsPath, file);
          const insightData = await fs.readFile(insightPath, 'utf-8');
          const insight: TeamLearningInsight = JSON.parse(insightData);
          this.insights.set(insight.teamId, insight);
        }
      }
    } catch (error) {
      console.warn('Warning: Could not load insights:', error);
    }
  }
}

// Demo function
async function demonstrateSharedLearningDatabase(): Promise<void> {
  console.warn('🤝 Shared Learning Database Demo');
  console.warn('================================');
  
  const db = new SharedLearningDatabase('./persistence/shared-learning');
  await db.connect();
  
  // Create teams
  const team1: TeamConfig = {
    teamId: 'frontend-team',
    name: 'Frontend Team',
    description: 'Frontend development team',
    members: [],
    learningDomains: ['react', 'typescript', 'ui-ux'],
    sharedConcepts: ['component-design', 'state-management'],
    privacyLevel: 'private',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  const team2: TeamConfig = {
    teamId: 'backend-team',
    name: 'Backend Team',
    description: 'Backend development team',
    members: [],
    learningDomains: ['nodejs', 'databases', 'apis'],
    sharedConcepts: ['api-design', 'database-optimization'],
    privacyLevel: 'private',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  await db.createTeam('frontend-team', team1);
  await db.createTeam('backend-team', team2);
  
  // Add team members
  await db.addTeamMember('frontend-team', 'alice', 'admin');
  await db.addTeamMember('frontend-team', 'bob', 'member');
  await db.addTeamMember('backend-team', 'charlie', 'admin');
  await db.addTeamMember('backend-team', 'diana', 'member');
  
  // Store some learning memories
  const memory1: LearningMemory = {
    id: 'memory_1',
    timestamp: Date.now(),
    concept: 'react-hooks',
    embedding: [0.1, 0.2, 0.3],
    context: { team: 'frontend-team', contributor: 'alice' },
    performance: 0.8,
    confidence: 0.9,
    relationships: ['react', 'hooks'],
    consolidated: false
  };
  
  const memory2: LearningMemory = {
    id: 'memory_2',
    timestamp: Date.now(),
    concept: 'database-optimization',
    embedding: [0.4, 0.5, 0.6],
    context: { team: 'backend-team', contributor: 'charlie' },
    performance: 0.9,
    confidence: 0.95,
    relationships: ['database', 'performance'],
    consolidated: false
  };
  
  await db.storeMemory('frontend-team', memory1);
  await db.storeMemory('backend-team', memory2);
  
  // Retrieve memories
  const frontendMemories = await db.retrieveMemories('frontend-team');
  const backendMemories = await db.retrieveMemories('backend-team');
  
  console.warn(`\n📊 Frontend Team Memories: ${frontendMemories.length}`);
  console.warn(`📊 Backend Team Memories: ${backendMemories.length}`);
  
  // Get learning progress
  const frontendProgress = await db.getTeamLearningProgress('frontend-team');
  const backendProgress = await db.getTeamLearningProgress('backend-team');
  
  console.warn(`\n📈 Frontend Team Learning Progress: ${frontendProgress.length} domains`);
  console.warn(`📈 Backend Team Learning Progress: ${backendProgress.length} domains`);
  
  // Share knowledge between teams
  await db.shareKnowledge('frontend-team', 'backend-team', ['react-hooks']);
  
  console.warn('\n🎉 Shared Learning Database Demo Complete!');
  console.warn('✅ Team collaboration and knowledge sharing working!');
  
  await db.disconnect();
}

// Run the demo (commented out for production)
// demonstrateSharedLearningDatabase().catch(console.error);

// Exports are already defined above in the class and interface definitions
