#!/usr/bin/env tsx

/**
 * Knowledge Sharing Workflow
 * 
 * This module implements PocketFlow workflows for cross-team knowledge sharing:
 * - Extract team knowledge
 * - Share across teams
 * - Integrate team insights
 * - Collaborative learning
 */

import { BaseNode as Node, Flow } from '../pocketflow/core';
import { SharedLearningDatabase, TeamConfig } from '../core/shared-learning-database';
import { getSharedH2GNN } from '../core/centralized-h2gnn-config';

export interface KnowledgeSharingState {
  sourceTeamId: string;
  targetTeamId: string;
  concepts: string[];
  sharedKnowledge: SharedKnowledge[];
  integratedInsights: IntegratedInsight[];
  sharingComplete: boolean;
}

export interface SharedKnowledge {
  id: string;
  concept: string;
  knowledge: string;
  confidence: number;
  sourceTeam: string;
  targetTeam: string;
  timestamp: number;
  relevance: number;
}

export interface IntegratedInsight {
  id: string;
  concept: string;
  insight: string;
  source: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timestamp: number;
}

export interface KnowledgeSharingResult {
  sourceTeamId: string;
  targetTeamId: string;
  sharedKnowledge: SharedKnowledge[];
  integratedInsights: IntegratedInsight[];
  knowledgeTransferSuccess: number;
  learningProgress: number;
}

/**
 * Node: Extract Team Knowledge
 */
export class ExtractTeamKnowledgeNode extends Node<KnowledgeSharingState> {
  private sharedDB: SharedLearningDatabase;
  private h2gnn: any;

  constructor() {
    super();
    this.sharedDB = new SharedLearningDatabase();
    this.h2gnn = getSharedH2GNN();
  }

  async prep(shared: KnowledgeSharingState): Promise<[string, string[]]> {
    return [shared.sourceTeamId, shared.concepts];
  }

  async exec([sourceTeamId, concepts]: [string, string[]]): Promise<TeamKnowledgeExtractionResult> {
    console.warn(`📤 Extracting knowledge from team: ${sourceTeamId}`);
    
    // Retrieve team memories
    const teamMemories = await this.sharedDB.retrieveMemories(sourceTeamId);
    
    // Extract relevant knowledge
    const relevantKnowledge = this.extractRelevantKnowledge(teamMemories, concepts);
    
    // Analyze knowledge quality
    const qualityAnalysis = this.analyzeKnowledgeQuality(relevantKnowledge);
    
    // Generate knowledge summary
    const summary = this.generateKnowledgeSummary(relevantKnowledge);
    
    return {
      extractedKnowledge: relevantKnowledge,
      qualityAnalysis,
      summary,
      totalMemories: teamMemories.length,
      relevantMemories: relevantKnowledge.length
    };
  }

  async post(
    shared: KnowledgeSharingState,
    _: [string, string[]],
    result: TeamKnowledgeExtractionResult
  ): Promise<string> {
    // Store extracted knowledge
    shared.sharedKnowledge = result.extractedKnowledge;
    
    // Learn from knowledge extraction
    await this.learnFromKnowledgeExtraction(shared.sourceTeamId, result);
    
    return 'extracted';
  }

  private extractRelevantKnowledge(memories: any[], concepts: string[]): SharedKnowledge[] {
    const relevantKnowledge: SharedKnowledge[] = [];
    
    for (const memory of memories) {
      const relevance = this.calculateRelevance(memory, concepts);
      
      if (relevance > 0.3) { // Threshold for relevance
        const sharedKnowledge: SharedKnowledge = {
          id: `knowledge_${Date.now()}_${Math.random()}`,
          concept: memory.concept,
          knowledge: memory.insights || memory.data || 'No specific knowledge available',
          confidence: memory.confidence || 0.5,
          sourceTeam: 'unknown', // Will be set later
          targetTeam: 'unknown', // Will be set later
          timestamp: memory.timestamp || Date.now(),
          relevance
        };
        
        relevantKnowledge.push(sharedKnowledge);
      }
    }
    
    return relevantKnowledge;
  }

  private calculateRelevance(memory: any, concepts: string[]): number {
    let relevance = 0;
    
    // Check concept overlap
    for (const concept of concepts) {
      if (memory.concept && memory.concept.includes(concept)) {
        relevance += 0.5;
      }
    }
    
    // Check for keyword matches
    const memoryText = JSON.stringify(memory).toLowerCase();
    for (const concept of concepts) {
      if (memoryText.includes(concept.toLowerCase())) {
        relevance += 0.3;
      }
    }
    
    return Math.min(1, relevance);
  }

  private analyzeKnowledgeQuality(knowledge: SharedKnowledge[]): any {
    const avgConfidence = knowledge.reduce((sum, k) => sum + k.confidence, 0) / knowledge.length;
    const avgRelevance = knowledge.reduce((sum, k) => sum + k.relevance, 0) / knowledge.length;
    
    return {
      averageConfidence: avgConfidence,
      averageRelevance: avgRelevance,
      totalKnowledge: knowledge.length,
      highQualityKnowledge: knowledge.filter(k => k.confidence > 0.8).length
    };
  }

  private generateKnowledgeSummary(knowledge: SharedKnowledge[]): string {
    const concepts = knowledge.map(k => k.concept).join(', ');
    return `Extracted knowledge about: ${concepts}. Total items: ${knowledge.length}`;
  }

  private async learnFromKnowledgeExtraction(teamId: string, result: TeamKnowledgeExtractionResult): Promise<void> {
    const concept = `knowledge-extraction-${teamId}`;
    const data = {
      result,
      timestamp: Date.now()
    };
    const context = {
      teamId,
      domain: 'knowledge-sharing'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.7);
  }
}

/**
 * Node: Share Cross Team
 */
export class ShareCrossTeamNode extends Node<KnowledgeSharingState> {
  private sharedDB: SharedLearningDatabase;
  private h2gnn: any;

  constructor() {
    super();
    this.sharedDB = new SharedLearningDatabase();
    this.h2gnn = getSharedH2GNN();
  }

  async prep(shared: KnowledgeSharingState): Promise<[string, string, SharedKnowledge[]]> {
    return [shared.sourceTeamId, shared.targetTeamId, shared.sharedKnowledge];
  }

  async exec([sourceTeamId, targetTeamId, knowledge]: [string, string, SharedKnowledge[]]): Promise<CrossTeamSharingResult> {
    console.warn(`🤝 Sharing knowledge from team ${sourceTeamId} to team ${targetTeamId}`);
    
    // Prepare knowledge for sharing
    const preparedKnowledge = this.prepareKnowledgeForSharing(knowledge, sourceTeamId, targetTeamId);
    
    // Share knowledge between teams
    await this.shareKnowledgeBetweenTeams(sourceTeamId, targetTeamId, preparedKnowledge);
    
    // Analyze sharing success
    const sharingAnalysis = this.analyzeSharingSuccess(preparedKnowledge);
    
    return {
      sharedKnowledge: preparedKnowledge,
      sharingAnalysis,
      successRate: sharingAnalysis.successRate,
      knowledgeTransferred: preparedKnowledge.length
    };
  }

  async post(
    shared: KnowledgeSharingState,
    _: [string, string, SharedKnowledge[]],
    result: CrossTeamSharingResult
  ): Promise<string> {
    // Update shared knowledge with team information
    shared.sharedKnowledge = result.sharedKnowledge;
    
    // Learn from cross-team sharing
    await this.learnFromCrossTeamSharing(shared.sourceTeamId, shared.targetTeamId, result);
    
    return 'shared';
  }

  private prepareKnowledgeForSharing(knowledge: SharedKnowledge[], sourceTeamId: string, targetTeamId: string): SharedKnowledge[] {
    return knowledge.map(k => ({
      ...k,
      sourceTeam: sourceTeamId,
      targetTeam: targetTeamId,
      timestamp: Date.now()
    }));
  }

  private async shareKnowledgeBetweenTeams(sourceTeamId: string, targetTeamId: string, knowledge: SharedKnowledge[]): Promise<void> {
    // Use shared database to transfer knowledge
    const concepts = knowledge.map(k => k.concept);
    await this.sharedDB.shareKnowledge(sourceTeamId, targetTeamId, concepts);
    
    console.warn(`✅ Shared ${knowledge.length} knowledge items from ${sourceTeamId} to ${targetTeamId}`);
  }

  private analyzeSharingSuccess(knowledge: SharedKnowledge[]): any {
    const highQualityKnowledge = knowledge.filter(k => k.confidence > 0.8).length;
    const relevantKnowledge = knowledge.filter(k => k.relevance > 0.5).length;
    
    return {
      successRate: relevantKnowledge / knowledge.length,
      highQualityItems: highQualityKnowledge,
      relevantItems: relevantKnowledge,
      totalItems: knowledge.length
    };
  }

  private async learnFromCrossTeamSharing(sourceTeamId: string, targetTeamId: string, result: CrossTeamSharingResult): Promise<void> {
    const concept = `cross-team-sharing-${sourceTeamId}-${targetTeamId}`;
    const data = {
      result,
      timestamp: Date.now()
    };
    const context = {
      sourceTeamId,
      targetTeamId,
      domain: 'knowledge-sharing'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.8);
  }
}

/**
 * Node: Integrate Team Insights
 */
export class IntegrateTeamInsightsNode extends Node<KnowledgeSharingState> {
  private sharedDB: SharedLearningDatabase;
  private h2gnn: any;

  constructor() {
    super();
    this.sharedDB = new SharedLearningDatabase();
    this.h2gnn = getSharedH2GNN();
  }

  async prep(shared: KnowledgeSharingState): Promise<[string, SharedKnowledge[]]> {
    return [shared.targetTeamId, shared.sharedKnowledge];
  }

  async exec([targetTeamId, sharedKnowledge]: [string, SharedKnowledge[]]): Promise<TeamInsightIntegrationResult> {
    console.warn(`🔗 Integrating insights for team: ${targetTeamId}`);
    
    // Integrate shared knowledge
    const integratedInsights = await this.integrateSharedKnowledge(targetTeamId, sharedKnowledge);
    
    // Analyze integration success
    const integrationAnalysis = this.analyzeIntegrationSuccess(integratedInsights);
    
    // Generate integration summary
    const summary = this.generateIntegrationSummary(integratedInsights);
    
    return {
      integratedInsights,
      integrationAnalysis,
      summary,
      insightsIntegrated: integratedInsights.length
    };
  }

  async post(
    shared: KnowledgeSharingState,
    _: [string, SharedKnowledge[]],
    result: TeamInsightIntegrationResult
  ): Promise<string> {
    // Store integrated insights
    shared.integratedInsights = result.integratedInsights;
    shared.sharingComplete = true;
    
    // Learn from insight integration
    await this.learnFromInsightIntegration(shared.targetTeamId, result);
    
    return 'integrated';
  }

  private async integrateSharedKnowledge(targetTeamId: string, sharedKnowledge: SharedKnowledge[]): Promise<IntegratedInsight[]> {
    const integratedInsights: IntegratedInsight[] = [];
    
    for (const knowledge of sharedKnowledge) {
      // Create integrated insight
      const insight: IntegratedInsight = {
        id: `insight_${Date.now()}_${Math.random()}`,
        concept: knowledge.concept,
        insight: knowledge.knowledge,
        source: knowledge.sourceTeam,
        confidence: knowledge.confidence,
        impact: this.calculateImpact(knowledge),
        timestamp: Date.now()
      };
      
      integratedInsights.push(insight);
      
      // Store in target team's learning
      await this.storeIntegratedInsight(targetTeamId, insight);
    }
    
    return integratedInsights;
  }

  private calculateImpact(knowledge: SharedKnowledge): 'low' | 'medium' | 'high' {
    if (knowledge.confidence > 0.8 && knowledge.relevance > 0.7) return 'high';
    if (knowledge.confidence > 0.6 && knowledge.relevance > 0.5) return 'medium';
    return 'low';
  }

  private async storeIntegratedInsight(teamId: string, insight: IntegratedInsight): Promise<void> {
    const concept = `integrated-insight-${insight.concept}`;
    const data = {
      insight,
      source: insight.source,
      timestamp: insight.timestamp
    };
    const context = {
      teamId,
      domain: 'knowledge-sharing'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, insight.confidence);
  }

  private analyzeIntegrationSuccess(insights: IntegratedInsight[]): any {
    const highImpactInsights = insights.filter(i => i.impact === 'high').length;
    const highConfidenceInsights = insights.filter(i => i.confidence > 0.8).length;
    
    return {
      totalInsights: insights.length,
      highImpactInsights,
      highConfidenceInsights,
      integrationSuccess: highImpactInsights / insights.length
    };
  }

  private generateIntegrationSummary(insights: IntegratedInsight[]): string {
    const concepts = insights.map(i => i.concept).join(', ');
    const highImpactCount = insights.filter(i => i.impact === 'high').length;
    
    return `Integrated ${insights.length} insights about: ${concepts}. High impact: ${highImpactCount}`;
  }

  private async learnFromInsightIntegration(teamId: string, result: TeamInsightIntegrationResult): Promise<void> {
    const concept = `insight-integration-${teamId}`;
    const data = {
      result,
      timestamp: Date.now()
    };
    const context = {
      teamId,
      domain: 'knowledge-sharing'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.9);
  }
}

/**
 * Knowledge Sharing Workflow
 */
export class KnowledgeSharingWorkflow extends Flow<KnowledgeSharingState> {
  private extractTeamKnowledge: ExtractTeamKnowledgeNode;
  private shareCrossTeam: ShareCrossTeamNode;
  private integrateTeamInsights: IntegrateTeamInsightsNode;

  constructor() {
    super({ start: new ExtractTeamKnowledgeNode() });
    
    // Create nodes
    this.extractTeamKnowledge = new ExtractTeamKnowledgeNode();
    this.shareCrossTeam = new ShareCrossTeamNode();
    this.integrateTeamInsights = new IntegrateTeamInsightsNode();
    
    // Connect workflow
    this.extractTeamKnowledge
      .next(this.shareCrossTeam)
      .next(this.integrateTeamInsights);
  }

  /**
   * Execute knowledge sharing workflow
   */
  async executeKnowledgeSharing(
    sourceTeamId: string, 
    targetTeamId: string, 
    concepts: string[]
  ): Promise<KnowledgeSharingResult> {
    console.warn(`🚀 Starting knowledge sharing from ${sourceTeamId} to ${targetTeamId}`);
    
    const state: KnowledgeSharingState = {
      sourceTeamId,
      targetTeamId,
      concepts,
      sharedKnowledge: [],
      integratedInsights: [],
      sharingComplete: false
    };
    
    // Run workflow
    await this.run(state);
    
    // Calculate knowledge transfer success
    const knowledgeTransferSuccess = this.calculateKnowledgeTransferSuccess(state.sharedKnowledge);
    
    // Calculate learning progress
    const learningProgress = this.calculateLearningProgress(state.integratedInsights);
    
    return {
      sourceTeamId,
      targetTeamId,
      sharedKnowledge: state.sharedKnowledge,
      integratedInsights: state.integratedInsights,
      knowledgeTransferSuccess,
      learningProgress
    };
  }

  private calculateKnowledgeTransferSuccess(sharedKnowledge: SharedKnowledge[]): number {
    if (sharedKnowledge.length === 0) return 0;
    
    const highQualityKnowledge = sharedKnowledge.filter(k => k.confidence > 0.8).length;
    const relevantKnowledge = sharedKnowledge.filter(k => k.relevance > 0.5).length;
    
    return Math.round(((highQualityKnowledge + relevantKnowledge) / 2) / sharedKnowledge.length * 100);
  }

  private calculateLearningProgress(insights: IntegratedInsight[]): number {
    if (insights.length === 0) return 0;
    
    const highImpactInsights = insights.filter(i => i.impact === 'high').length;
    const highConfidenceInsights = insights.filter(i => i.confidence > 0.8).length;
    
    return Math.round(((highImpactInsights + highConfidenceInsights) / 2) / insights.length * 100);
  }
}

// Type definitions for workflow results
interface TeamKnowledgeExtractionResult {
  extractedKnowledge: SharedKnowledge[];
  qualityAnalysis: any;
  summary: string;
  totalMemories: number;
  relevantMemories: number;
}

interface CrossTeamSharingResult {
  sharedKnowledge: SharedKnowledge[];
  sharingAnalysis: any;
  successRate: number;
  knowledgeTransferred: number;
}

interface TeamInsightIntegrationResult {
  integratedInsights: IntegratedInsight[];
  integrationAnalysis: any;
  summary: string;
  insightsIntegrated: number;
}
