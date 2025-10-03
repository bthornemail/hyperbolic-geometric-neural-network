#!/usr/bin/env tsx

/**
 * Centralized H²GNN Configuration
 * 
 * This module provides a single, centralized configuration for the EnhancedH2GNN
 * instance that can be shared across all MCP servers, ensuring consistency
 * and simplifying configuration management.
 */

import EnhancedH2GNN, { PersistenceConfig } from './enhanced-h2gnn';
import { HyperbolicGeometricHGN } from './H2GNN';
import { SharedLearningDatabase, TeamConfig, TeamMember } from './shared-learning-database';

export interface CentralizedH2GNNConfig {
  embeddingDim: number;
  numLayers: number;
  curvature: number;
  storagePath: string;
  maxMemories: number;
  consolidationThreshold: number;
  retrievalStrategy: 'semantic' | 'temporal' | 'hybrid';
  compressionEnabled: boolean;
  learningRate: number;
  batchSize: number;
  maxEpochs: number;
}

export class CentralizedH2GNNManager {
  private static instance: CentralizedH2GNNManager;
  private h2gnn: EnhancedH2GNN;
  private config: CentralizedH2GNNConfig;
  private sharedDb: SharedLearningDatabase;
  private currentTeamId: string | null = null;

  private constructor(config: CentralizedH2GNNConfig) {
    this.config = config;
    this.initializeH2GNN();
    this.initializeSharedDatabase();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(config?: CentralizedH2GNNConfig): CentralizedH2GNNManager {
    if (!CentralizedH2GNNManager.instance) {
      if (!config) {
        throw new Error('Configuration must be provided for first initialization');
      }
      CentralizedH2GNNManager.instance = new CentralizedH2GNNManager(config);
    }
    return CentralizedH2GNNManager.instance;
  }

  /**
   * Initialize the H²GNN instance
   */
  private initializeH2GNN(): void {
    const h2gnnConfig = {
      embeddingDim: this.config.embeddingDim,
      numLayers: this.config.numLayers,
      curvature: this.config.curvature
    };

    const persistenceConfig: PersistenceConfig = {
      storagePath: this.config.storagePath,
      maxMemories: this.config.maxMemories,
      consolidationThreshold: this.config.consolidationThreshold,
      retrievalStrategy: this.config.retrievalStrategy,
      compressionEnabled: this.config.compressionEnabled
    };

    this.h2gnn = new EnhancedH2GNN(h2gnnConfig, persistenceConfig);
  }

  /**
   * Get the H²GNN instance
   */
  public getH2GNN(): EnhancedH2GNN {
    return this.h2gnn;
  }

  /**
   * Get the current configuration
   */
  public getConfig(): CentralizedH2GNNConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (requires reinitialization)
   */
  public updateConfig(newConfig: Partial<CentralizedH2GNNConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeH2GNN();
  }

  /**
   * Get system status
   */
  public async getSystemStatus(): Promise<any> {
    return await this.h2gnn.getSystemStatus();
  }

  /**
   * Initialize shared database
   */
  private initializeSharedDatabase(): void {
    this.sharedDb = new SharedLearningDatabase(this.config.storagePath + '/shared-learning');
  }

  /**
   * Set current team for collaborative learning
   */
  public setCurrentTeam(teamId: string): void {
    this.currentTeamId = teamId;
    console.log(`🤝 Set current team: ${teamId}`);
  }

  /**
   * Create a new team
   */
  public async createTeam(teamId: string, config: TeamConfig): Promise<void> {
    await this.sharedDb.createTeam(teamId, config);
    console.log(`🤝 Created team: ${teamId}`);
  }

  /**
   * Add team member
   */
  public async addTeamMember(teamId: string, memberId: string, role: 'admin' | 'member' | 'viewer' = 'member'): Promise<void> {
    await this.sharedDb.addTeamMember(teamId, memberId, role);
    console.log(`🤝 Added member ${memberId} to team ${teamId}`);
  }

  /**
   * Learn with team context
   */
  public async learnWithTeamContext(
    concept: string,
    data: any,
    context: any,
    performance: number,
    teamId?: string
  ): Promise<any> {
    const effectiveTeamId = teamId || this.currentTeamId;
    
    if (effectiveTeamId) {
      // Store in shared database
      const memory = await this.h2gnn.learnWithMemory(concept, data, context, performance);
      await this.sharedDb.storeMemory(effectiveTeamId, memory);
      console.log(`🤝 Learned concept ${concept} for team ${effectiveTeamId}`);
      return memory;
    } else {
      // Fallback to individual learning
      return await this.h2gnn.learnWithMemory(concept, data, context, performance);
    }
  }

  /**
   * Retrieve team memories
   */
  public async getTeamMemories(teamId: string, concept?: string): Promise<any[]> {
    return await this.sharedDb.retrieveMemories(teamId, concept);
  }

  /**
   * Get team learning progress
   */
  public async getTeamLearningProgress(teamId: string): Promise<any[]> {
    return await this.sharedDb.getTeamLearningProgress(teamId);
  }

  /**
   * Share knowledge between teams
   */
  public async shareKnowledge(sourceTeamId: string, targetTeamId: string, concepts: string[]): Promise<void> {
    await this.sharedDb.shareKnowledge(sourceTeamId, targetTeamId, concepts);
    console.log(`🤝 Shared knowledge from ${sourceTeamId} to ${targetTeamId}`);
  }

  /**
   * Sync team memories
   */
  public async syncTeamMemories(teamId: string): Promise<void> {
    await this.sharedDb.syncMemories(teamId);
    console.log(`🤝 Synced memories for team ${teamId}`);
  }

  /**
   * Learn a concept with memory
   */
  public async learnWithMemory(
    concept: string,
    data: any,
    context: any,
    performance: number = 0.5
  ): Promise<void> {
    await this.h2gnn.learnWithMemory(concept, data, context, performance);
  }

  /**
   * Retrieve memories
   */
  public async retrieveMemories(
    query: string,
    maxResults: number = 10
  ): Promise<any[]> {
    return await this.h2gnn.retrieveMemories(query, maxResults);
  }

  /**
   * Get understanding snapshot
   */
  public async getUnderstandingSnapshot(domain: string): Promise<any> {
    return await this.h2gnn.getUnderstandingSnapshot(domain);
  }

  /**
   * Get learning progress
   */
  public async getLearningProgress(): Promise<any> {
    return await this.h2gnn.getLearningProgress();
  }

  /**
   * Consolidate memories
   */
  public async consolidateMemories(): Promise<void> {
    await this.h2gnn.consolidateMemories();
  }

  /**
   * Adaptive learning (placeholder - method not available in EnhancedH2GNN)
   */
  public async adaptiveLearning(domain: string, learningRate: number = 0.01): Promise<void> {
    // Note: adaptiveLearning method is not available in EnhancedH2GNN
    // This is a placeholder for future implementation
    console.log(`🎯 Adaptive learning requested for domain: ${domain}, learning rate: ${learningRate}`);
  }
}

/**
 * Default configuration
 */
export const DEFAULT_H2GNN_CONFIG: CentralizedH2GNNConfig = {
  embeddingDim: 64,
  numLayers: 3,
  curvature: -1.0,
  storagePath: './persistence',
  maxMemories: 10000,
  consolidationThreshold: 50,
  retrievalStrategy: 'hybrid',
  compressionEnabled: true,
  learningRate: 0.01,
  batchSize: 32,
  maxEpochs: 100
};

/**
 * Development configuration (smaller, faster)
 */
export const DEV_H2GNN_CONFIG: CentralizedH2GNNConfig = {
  embeddingDim: 32,
  numLayers: 2,
  curvature: -1.0,
  storagePath: './h2gnn-dev-persistence',
  maxMemories: 1000,
  consolidationThreshold: 20,
  retrievalStrategy: 'semantic',
  compressionEnabled: false,
  learningRate: 0.05,
  batchSize: 16,
  maxEpochs: 50
};

/**
 * Production configuration (larger, more capable)
 */
export const PROD_H2GNN_CONFIG: CentralizedH2GNNConfig = {
  embeddingDim: 128,
  numLayers: 4,
  curvature: -1.0,
  storagePath: './h2gnn-prod-persistence',
  maxMemories: 50000,
  consolidationThreshold: 100,
  retrievalStrategy: 'hybrid',
  compressionEnabled: true,
  learningRate: 0.005,
  batchSize: 64,
  maxEpochs: 200
};

/**
 * Initialize the centralized H²GNN manager
 */
export function initializeCentralizedH2GNN(config?: CentralizedH2GNNConfig): CentralizedH2GNNManager {
  const finalConfig = config || DEFAULT_H2GNN_CONFIG;
  return CentralizedH2GNNManager.getInstance(finalConfig);
}

/**
 * Get the shared H²GNN instance
 */
export function getSharedH2GNN(): EnhancedH2GNN {
  const manager = CentralizedH2GNNManager.getInstance();
  return manager.getH2GNN();
}


/**
 * Demo function to show centralized configuration
 */
async function demonstrateCentralizedH2GNN(): Promise<void> {
  console.log('🏗️ Centralized H²GNN Configuration Demo');
  console.log('=====================================');
  
  // Initialize with default config
  const manager = initializeCentralizedH2GNN();
  
  console.log('\n📊 Configuration:');
  console.log(JSON.stringify(manager.getConfig(), null, 2));
  
  // Learn some concepts
  console.log('\n🧠 Learning Concepts:');
  await manager.learnWithMemory(
    'centralized_config',
    { type: 'configuration', features: ['centralized', 'shared', 'consistent'] },
    { domain: 'system', type: 'learning' },
    0.9
  );
  
  await manager.learnWithMemory(
    'mcp_integration',
    { type: 'integration', features: ['mcp', 'lsp', 'ast'] },
    { domain: 'system', type: 'learning' },
    0.8
  );
  
  // Get system status
  console.log('\n📈 System Status:');
  const status = await manager.getSystemStatus();
  console.log(`- Total Memories: ${status.totalMemories}`);
  console.log(`- Domains: ${Object.keys(status.domains).join(', ')}`);
  console.log(`- Learning Progress: ${status.learningProgress.toFixed(3)}`);
  
  // Retrieve memories
  console.log('\n🔍 Memory Retrieval:');
  const memories = await manager.retrieveMemories('centralized', 3);
  for (const memory of memories) {
    console.log(`- ${memory.concept}: ${memory.confidence.toFixed(3)}`);
  }
  
  console.log('\n🎉 Centralized H²GNN Configuration Demo Complete!');
  console.log('✅ All components using shared configuration!');
}

// Run the demo (commented out for production)
// demonstrateCentralizedH2GNN().catch(console.error);

// Export is already done above in the class definition
