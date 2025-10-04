#!/usr/bin/env tsx

/**
 * Team Collaboration Workflow
 * 
 * This module implements PocketFlow workflows for team-based learning and collaboration:
 * - Multi-developer concept learning
 * - Shared knowledge consolidation
 * - Team-based refactoring suggestions
 * - Collaborative code improvement
 */

import { BaseNode as Node, Flow } from '../pocketflow/core';
import { SharedLearningDatabase, TeamConfig } from '../core/shared-learning-database';
import { CodingStandardEngine, RuleViolation } from '../rules/coding-standard-engine';
import { getSharedH2GNN } from '../core/centralized-h2gnn-config';

export interface TeamLearningState {
  teamId: string;
  code: string;
  language: string;
  filePath?: string;
  teamMembers: string[];
  sharedConcepts: string[];
  learningInsights: TeamLearningInsight[];
  refactoringSuggestions: RefactoringSuggestion[];
  standardViolations: RuleViolation[];
  collaborationComplete: boolean;
}

export interface TeamLearningInsight {
  id: string;
  concept: string;
  insight: string;
  confidence: number;
  sharedBy: string;
  timestamp: number;
}

export interface RefactoringSuggestion {
  id: string;
  type: 'performance' | 'readability' | 'maintainability' | 'security';
  description: string;
  code: string;
  suggestedFix: string;
  confidence: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  suggestedBy: string;
}

export interface TeamLearningResult {
  teamId: string;
  insights: TeamLearningInsight[];
  suggestions: RefactoringSuggestion[];
  violations: RuleViolation[];
  compliance: number;
  learningProgress: number;
}

/**
 * Node: Analyze Team Code
 */
export class AnalyzeTeamCodeNode extends Node<TeamLearningState> {
  private sharedDB: SharedLearningDatabase;
  private h2gnn: any;

  constructor() {
    super();
    this.sharedDB = new SharedLearningDatabase();
    this.h2gnn = getSharedH2GNN();
  }

  async prep(shared: TeamLearningState): Promise<[string, string, string]> {
    return [shared.code, shared.language, shared.teamId];
  }

  async exec([code, language, teamId]: [string, string, string]): Promise<TeamAnalysisResult> {
    console.warn(`🔍 Analyzing team code for team: ${teamId}`);
    
    // Analyze code structure
    const structure = this.analyzeCodeStructure(code, language);
    
    // Extract concepts
    const concepts = this.extractConcepts(code, language);
    
    // Analyze patterns
    const patterns = this.analyzePatterns(code, language);
    
    return {
      structure,
      concepts,
      patterns,
      complexity: this.calculateComplexity(code),
      maintainability: this.calculateMaintainability(code)
    };
  }

  async post(
    shared: TeamLearningState,
    _: [string, string, string],
    result: TeamAnalysisResult
  ): Promise<string> {
    // Store analysis results
    shared.sharedConcepts = result.concepts;
    
    // Learn from team code patterns
    await this.learnFromTeamCode(shared.teamId, result);
    
    return 'analyzed';
  }

  private analyzeCodeStructure(code: string, language: string): any {
    // Analyze code structure based on language
    const lines = code.split('\n');
    const functions = code.match(/function\s+\w+/g) || [];
    const classes = code.match(/class\s+\w+/g) || [];
    const imports = code.match(/import\s+.*from/g) || [];
    
    return {
      lines: lines.length,
      functions: functions.length,
      classes: classes.length,
      imports: imports.length,
      language
    };
  }

  private extractConcepts(code: string, language: string): string[] {
    // Extract programming concepts from code
    const concepts: string[] = [];
    
    // Common patterns
    if (code.includes('async') || code.includes('await')) concepts.push('async-programming');
    if (code.includes('try') && code.includes('catch')) concepts.push('error-handling');
    if (code.includes('class')) concepts.push('object-oriented');
    if (code.includes('function')) concepts.push('functional-programming');
    if (code.includes('import') || code.includes('require')) concepts.push('modular-design');
    
    return concepts;
  }

  private analyzePatterns(code: string, language: string): any {
    // Analyze coding patterns
    return {
      asyncPatterns: (code.match(/async/g) || []).length,
      errorHandling: (code.match(/try|catch|throw/g) || []).length,
      functionalPatterns: (code.match(/map|filter|reduce/g) || []).length,
      oopPatterns: (code.match(/class|extends|implements/g) || []).length
    };
  }

  private calculateComplexity(code: string): number {
    // Simple complexity calculation
    const lines = code.split('\n').length;
    const functions = (code.match(/function/g) || []).length;
    const conditionals = (code.match(/if|else|switch/g) || []).length;
    const loops = (code.match(/for|while|do/g) || []).length;
    
    return lines + functions * 2 + conditionals * 3 + loops * 4;
  }

  private calculateMaintainability(code: string): number {
    // Simple maintainability score
    const complexity = this.calculateComplexity(code);
    const lines = code.split('\n').length;
    
    // Higher score = more maintainable
    return Math.max(0, 100 - (complexity / lines) * 10);
  }

  private async learnFromTeamCode(teamId: string, analysis: TeamAnalysisResult): Promise<void> {
    const concept = `team-code-patterns-${teamId}`;
    const data = {
      analysis,
      timestamp: Date.now()
    };
    const context = {
      teamId,
      domain: 'team-collaboration'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.7);
  }
}

/**
 * Node: Share Team Knowledge
 */
export class ShareTeamKnowledgeNode extends Node<TeamLearningState> {
  private sharedDB: SharedLearningDatabase;
  private h2gnn: any;

  constructor() {
    super();
    this.sharedDB = new SharedLearningDatabase();
    this.h2gnn = getSharedH2GNN();
  }

  async prep(shared: TeamLearningState): Promise<[string, string[]]> {
    return [shared.teamId, shared.sharedConcepts];
  }

  async exec([teamId, concepts]: [string, string[]]): Promise<TeamKnowledgeSharingResult> {
    console.warn(`🤝 Sharing team knowledge for team: ${teamId}`);
    
    // Retrieve team memories
    const teamMemories = await this.sharedDB.retrieveMemories(teamId);
    
    // Share concepts with team
    const sharedInsights: TeamLearningInsight[] = [];
    
    for (const concept of concepts) {
      const relevantMemories = teamMemories.filter(m => 
        m.concept.includes(concept) || concept.includes(m.concept)
      );
      
      if (relevantMemories.length > 0) {
        const insight = await this.generateTeamInsight(concept, relevantMemories);
        sharedInsights.push(insight);
      }
    }
    
    return {
      sharedInsights,
      teamMemories: teamMemories.length,
      conceptsShared: concepts.length
    };
  }

  async post(
    shared: TeamLearningState,
    _: [string, string[]],
    result: TeamKnowledgeSharingResult
  ): Promise<string> {
    // Store shared insights
    shared.learningInsights = result.sharedInsights;
    
    // Learn from team knowledge sharing
    await this.learnFromTeamSharing(shared.teamId, result);
    
    return 'shared';
  }

  private async generateTeamInsight(concept: string, memories: any[]): Promise<TeamLearningInsight> {
    // Generate insight from team memories
    const combinedInsights = memories.map(m => m.insights || []).flat();
    const insight = combinedInsights.join('; ');
    
    return {
      id: `insight_${Date.now()}`,
      concept,
      insight: insight || `Team knowledge about ${concept}`,
      confidence: 0.8,
      sharedBy: 'team-collaboration',
      timestamp: Date.now()
    };
  }

  private async learnFromTeamSharing(teamId: string, result: TeamKnowledgeSharingResult): Promise<void> {
    const concept = `team-knowledge-sharing-${teamId}`;
    const data = {
      result,
      timestamp: Date.now()
    };
    const context = {
      teamId,
      domain: 'team-collaboration'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.8);
  }
}

/**
 * Node: Consolidate Team Learning
 */
export class ConsolidateTeamLearningNode extends Node<TeamLearningState> {
  private sharedDB: SharedLearningDatabase;
  private h2gnn: any;

  constructor() {
    super();
    this.sharedDB = new SharedLearningDatabase();
    this.h2gnn = getSharedH2GNN();
  }

  async prep(shared: TeamLearningState): Promise<[string, TeamLearningInsight[]]> {
    return [shared.teamId, shared.learningInsights];
  }

  async exec([teamId, insights]: [string, TeamLearningInsight[]]): Promise<TeamLearningConsolidationResult> {
    console.warn(`🧠 Consolidating team learning for team: ${teamId}`);
    
    // Consolidate insights
    const consolidatedInsights = this.consolidateInsights(insights);
    
    // Generate team learning summary
    const summary = this.generateTeamLearningSummary(consolidatedInsights);
    
    // Calculate learning progress
    const progress = this.calculateLearningProgress(teamId, consolidatedInsights);
    
    return {
      consolidatedInsights,
      summary,
      progress,
      teamId
    };
  }

  async post(
    shared: TeamLearningState,
    _: [string, TeamLearningInsight[]],
    result: TeamLearningConsolidationResult
  ): Promise<string> {
    // Store consolidated learning
    shared.learningInsights = result.consolidatedInsights;
    
    // Learn from team consolidation
    await this.learnFromTeamConsolidation(shared.teamId, result);
    
    return 'consolidated';
  }

  private consolidateInsights(insights: TeamLearningInsight[]): TeamLearningInsight[] {
    // Group insights by concept
    const conceptGroups = new Map<string, TeamLearningInsight[]>();
    
    for (const insight of insights) {
      if (!conceptGroups.has(insight.concept)) {
        conceptGroups.set(insight.concept, []);
      }
      conceptGroups.get(insight.concept)!.push(insight);
    }
    
    // Consolidate each group
    const consolidated: TeamLearningInsight[] = [];
    
    for (const [concept, groupInsights] of conceptGroups) {
      const consolidatedInsight: TeamLearningInsight = {
        id: `consolidated_${Date.now()}`,
        concept,
        insight: groupInsights.map(i => i.insight).join(' | '),
        confidence: Math.max(...groupInsights.map(i => i.confidence)),
        sharedBy: 'team-consolidation',
        timestamp: Date.now()
      };
      
      consolidated.push(consolidatedInsight);
    }
    
    return consolidated;
  }

  private generateTeamLearningSummary(insights: TeamLearningInsight[]): string {
    const concepts = insights.map(i => i.concept).join(', ');
    return `Team has learned about: ${concepts}. Total insights: ${insights.length}`;
  }

  private calculateLearningProgress(teamId: string, insights: TeamLearningInsight[]): number {
    // Simple progress calculation
    const totalConcepts = insights.length;
    const highConfidenceInsights = insights.filter(i => i.confidence > 0.8).length;
    
    return totalConcepts > 0 ? (highConfidenceInsights / totalConcepts) * 100 : 0;
  }

  private async learnFromTeamConsolidation(teamId: string, result: TeamLearningConsolidationResult): Promise<void> {
    const concept = `team-learning-consolidation-${teamId}`;
    const data = {
      result,
      timestamp: Date.now()
    };
    const context = {
      teamId,
      domain: 'team-collaboration'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.9);
  }
}

/**
 * Node: Apply Team Insights
 */
export class ApplyTeamInsightsNode extends Node<TeamLearningState> {
  private codingEngine: CodingStandardEngine;
  private h2gnn: any;

  constructor() {
    super();
    this.codingEngine = new CodingStandardEngine();
    this.h2gnn = getSharedH2GNN();
  }

  async prep(shared: TeamLearningState): Promise<[string, string, TeamLearningInsight[]]> {
    return [shared.teamId, shared.code, shared.learningInsights];
  }

  async exec([teamId, code, insights]: [string, string, TeamLearningInsight[]]): Promise<TeamInsightApplicationResult> {
    console.warn(`💡 Applying team insights for team: ${teamId}`);
    
    // Generate refactoring suggestions based on insights
    const suggestions = await this.generateRefactoringSuggestions(code, insights);
    
    // Check coding standards
    const violations = await this.codingEngine.enforceRules(code, teamId);
    
    // Apply insights to improve code
    const improvedCode = await this.applyInsightsToCode(code, insights);
    
    return {
      suggestions,
      violations,
      improvedCode,
      insightsApplied: insights.length
    };
  }

  async post(
    shared: TeamLearningState,
    _: [string, string, TeamLearningInsight[]],
    result: TeamInsightApplicationResult
  ): Promise<string> {
    // Store results
    shared.refactoringSuggestions = result.suggestions;
    shared.standardViolations = result.violations;
    shared.collaborationComplete = true;
    
    // Learn from insight application
    await this.learnFromInsightApplication(shared.teamId, result);
    
    return 'applied';
  }

  private async generateRefactoringSuggestions(code: string, insights: TeamLearningInsight[]): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];
    
    for (const insight of insights) {
      const suggestion = await this.createRefactoringSuggestion(code, insight);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
    
    return suggestions;
  }

  private async createRefactoringSuggestion(code: string, insight: TeamLearningInsight): Promise<RefactoringSuggestion | null> {
    // Generate suggestion based on insight
    if (insight.concept.includes('async') && !code.includes('async')) {
      return {
        id: `suggestion_${Date.now()}`,
        type: 'performance',
        description: `Consider using async/await for ${insight.concept}`,
        code: code.substring(0, 100) + '...',
        suggestedFix: '// Add async/await pattern',
        confidence: insight.confidence,
        effort: 'medium',
        impact: 'high',
        suggestedBy: insight.sharedBy
      };
    }
    
    return null;
  }

  private async applyInsightsToCode(code: string, insights: TeamLearningInsight[]): Promise<string> {
    // Apply insights to improve code
    let improvedCode = code;
    
    for (const insight of insights) {
      if (insight.concept.includes('error-handling') && !code.includes('try')) {
        // Add error handling suggestion
        improvedCode += '\n// TODO: Add proper error handling';
      }
    }
    
    return improvedCode;
  }

  private async learnFromInsightApplication(teamId: string, result: TeamInsightApplicationResult): Promise<void> {
    const concept = `team-insight-application-${teamId}`;
    const data = {
      result,
      timestamp: Date.now()
    };
    const context = {
      teamId,
      domain: 'team-collaboration'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.8);
  }
}

/**
 * Team Learning Workflow
 */
export class TeamLearningWorkflow extends Flow<TeamLearningState> {
  private analyzeTeamCode: AnalyzeTeamCodeNode;
  private shareTeamKnowledge: ShareTeamKnowledgeNode;
  private consolidateTeamLearning: ConsolidateTeamLearningNode;
  private applyTeamInsights: ApplyTeamInsightsNode;

  constructor() {
    super({ start: new AnalyzeTeamCodeNode() });
    
    // Create nodes
    this.analyzeTeamCode = new AnalyzeTeamCodeNode();
    this.shareTeamKnowledge = new ShareTeamKnowledgeNode();
    this.consolidateTeamLearning = new ConsolidateTeamLearningNode();
    this.applyTeamInsights = new ApplyTeamInsightsNode();
    
    // Connect workflow
    this.analyzeTeamCode
      .next(this.shareTeamKnowledge)
      .next(this.consolidateTeamLearning)
      .next(this.applyTeamInsights);
  }

  /**
   * Execute team learning workflow
   */
  async executeTeamLearning(teamId: string, code: string, language: string = 'typescript'): Promise<TeamLearningResult> {
    console.warn(`🚀 Starting team learning workflow for team: ${teamId}`);
    
    const state: TeamLearningState = {
      teamId,
      code,
      language,
      teamMembers: [],
      sharedConcepts: [],
      learningInsights: [],
      refactoringSuggestions: [],
      standardViolations: [],
      collaborationComplete: false
    };
    
    // Run workflow
    await this.run(state);
    
    // Calculate compliance
    const compliance = this.calculateCompliance(state.standardViolations);
    
    // Calculate learning progress
    const learningProgress = this.calculateLearningProgress(state.learningInsights);
    
    return {
      teamId,
      insights: state.learningInsights,
      suggestions: state.refactoringSuggestions,
      violations: state.standardViolations,
      compliance,
      learningProgress
    };
  }

  private calculateCompliance(violations: RuleViolation[]): number {
    if (violations.length === 0) return 100;
    
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const highViolations = violations.filter(v => v.severity === 'high').length;
    const mediumViolations = violations.filter(v => v.severity === 'medium').length;
    const lowViolations = violations.filter(v => v.severity === 'low').length;
    
    const totalViolations = criticalViolations * 4 + highViolations * 3 + mediumViolations * 2 + lowViolations;
    const maxPossibleViolations = 100; // Assume max 100 possible violations
    
    return Math.max(0, Math.round((1 - totalViolations / maxPossibleViolations) * 100));
  }

  private calculateLearningProgress(insights: TeamLearningInsight[]): number {
    if (insights.length === 0) return 0;
    
    const highConfidenceInsights = insights.filter(i => i.confidence > 0.8).length;
    return Math.round((highConfidenceInsights / insights.length) * 100);
  }
}

// Type definitions for workflow results
interface TeamAnalysisResult {
  structure: any;
  concepts: string[];
  patterns: any;
  complexity: number;
  maintainability: number;
}

interface TeamKnowledgeSharingResult {
  sharedInsights: TeamLearningInsight[];
  teamMemories: number;
  conceptsShared: number;
}

interface TeamLearningConsolidationResult {
  consolidatedInsights: TeamLearningInsight[];
  summary: string;
  progress: number;
  teamId: string;
}

interface TeamInsightApplicationResult {
  suggestions: RefactoringSuggestion[];
  violations: RuleViolation[];
  improvedCode: string;
  insightsApplied: number;
}
