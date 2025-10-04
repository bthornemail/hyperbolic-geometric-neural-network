#!/usr/bin/env tsx

/**
 * Team Standards Workflow
 * 
 * This module implements PocketFlow workflows for team coding standards:
 * - Rule-based learning integration
 * - Team coding standard enforcement
 * - Collaborative rule refinement
 * - Standards compliance tracking
 */

import { BaseNode as Node, Flow } from '../pocketflow/core';
import { CodingStandardEngine, CodingStandardRule, RuleViolation, FixSuggestion } from '../rules/coding-standard-engine';
import { SharedLearningDatabase } from '../core/shared-learning-database';
import { getSharedH2GNN } from '../core/centralized-h2gnn-config';

export interface TeamStandardsState {
  teamId: string;
  code: string;
  language: string;
  rules: CodingStandardRule[];
  violations: RuleViolation[];
  suggestions: FixSuggestion[];
  compliance: number;
  standardsComplete: boolean;
}

export interface TeamStandardsResult {
  teamId: string;
  rules: CodingStandardRule[];
  violations: RuleViolation[];
  suggestions: FixSuggestion[];
  compliance: number;
  learningProgress: number;
}

/**
 * Node: Define Team Standards
 */
export class DefineTeamStandardsNode extends Node<TeamStandardsState> {
  private codingEngine: CodingStandardEngine;
  private sharedDB: SharedLearningDatabase;
  private h2gnn: any;

  constructor() {
    super();
    this.codingEngine = new CodingStandardEngine();
    this.sharedDB = new SharedLearningDatabase();
    this.h2gnn = getSharedH2GNN();
  }

  async prep(shared: TeamStandardsState): Promise<[string, string]> {
    return [shared.teamId, shared.language];
  }

  async exec([teamId, language]: [string, string]): Promise<TeamStandardsDefinitionResult> {
    console.warn(`📋 Defining team standards for team: ${teamId}`);
    
    // Get existing team rules
    const existingRules = this.codingEngine.getTeamRules(teamId);
    
    // Define language-specific rules
    const languageRules = this.defineLanguageSpecificRules(language, teamId);
    
    // Define team-specific rules based on learning
    const teamSpecificRules = await this.defineTeamSpecificRules(teamId);
    
    // Combine all rules
    const allRules = [...existingRules, ...languageRules, ...teamSpecificRules];
    
    // Store rules in coding engine
    for (const rule of allRules) {
      await this.codingEngine.defineRule(rule);
    }
    
    return {
      definedRules: allRules,
      languageRules: languageRules.length,
      teamSpecificRules: teamSpecificRules.length,
      totalRules: allRules.length
    };
  }

  async post(
    shared: TeamStandardsState,
    _: [string, string],
    result: TeamStandardsDefinitionResult
  ): Promise<string> {
    // Store defined rules
    shared.rules = result.definedRules;
    
    // Learn from standards definition
    await this.learnFromStandardsDefinition(shared.teamId, result);
    
    return 'defined';
  }

  private defineLanguageSpecificRules(language: string, teamId: string): CodingStandardRule[] {
    const rules: CodingStandardRule[] = [];
    
    if (language === 'typescript' || language === 'javascript') {
      rules.push({
        id: `typescript-${teamId}-${Date.now()}`,
        name: 'TypeScript Best Practices',
        description: 'Enforce TypeScript best practices',
        teamId,
        severity: 'high',
        patterns: [
          'Use explicit types',
          'Avoid any type',
          'Use interfaces for object shapes',
          'Use enums for constants'
        ],
        exceptions: [],
        examples: [
          'interface User { id: number; name: string; }',
          'enum Status { ACTIVE, INACTIVE }',
          'const user: User = { id: 1, name: "John" };'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    
    if (language === 'python') {
      rules.push({
        id: `python-${teamId}-${Date.now()}`,
        name: 'Python Best Practices',
        description: 'Enforce Python best practices',
        teamId,
        severity: 'high',
        patterns: [
          'Use type hints',
          'Follow PEP 8 style guide',
          'Use docstrings',
          'Avoid global variables'
        ],
        exceptions: [],
        examples: [
          'def calculate_total(items: List[Item]) -> float:',
          '    """Calculate total price of items."""',
          '    return sum(item.price for item in items)'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    
    return rules;
  }

  private async defineTeamSpecificRules(teamId: string): Promise<CodingStandardRule[]> {
    const rules: CodingStandardRule[] = [];
    
    // Learn from team's existing code patterns
    const teamMemories = await this.sharedDB.retrieveMemories(teamId);
    
    // Analyze team patterns
    const patterns = this.analyzeTeamPatterns(teamMemories);
    
    // Create rules based on patterns
    if (patterns.asyncPatterns > 0) {
      rules.push({
        id: `async-${teamId}-${Date.now()}`,
        name: 'Async Programming Standards',
        description: 'Enforce async programming best practices',
        teamId,
        severity: 'medium',
        patterns: [
          'Use async/await consistently',
          'Handle promise rejections',
          'Avoid callback hell'
        ],
        exceptions: [],
        examples: [
          'async function fetchData(): Promise<Data> {',
          '  try {',
          '    const response = await api.get("/data");',
          '    return response.data;',
          '  } catch (error) {',
          '    throw new Error("Failed to fetch data");',
          '  }',
          '}'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    
    return rules;
  }

  private analyzeTeamPatterns(memories: any[]): any {
    let asyncPatterns = 0;
    let errorHandling = 0;
    let functionalPatterns = 0;
    
    for (const memory of memories) {
      const content = JSON.stringify(memory).toLowerCase();
      if (content.includes('async') || content.includes('await')) asyncPatterns++;
      if (content.includes('try') || content.includes('catch')) errorHandling++;
      if (content.includes('map') || content.includes('filter')) functionalPatterns++;
    }
    
    return {
      asyncPatterns,
      errorHandling,
      functionalPatterns
    };
  }

  private async learnFromStandardsDefinition(teamId: string, result: TeamStandardsDefinitionResult): Promise<void> {
    const concept = `team-standards-definition-${teamId}`;
    const data = {
      result,
      timestamp: Date.now()
    };
    const context = {
      teamId,
      domain: 'team-standards'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.8);
  }
}

/**
 * Node: Enforce Team Standards
 */
export class EnforceTeamStandardsNode extends Node<TeamStandardsState> {
  private codingEngine: CodingStandardEngine;
  private h2gnn: any;

  constructor() {
    super();
    this.codingEngine = new CodingStandardEngine();
    this.h2gnn = getSharedH2GNN();
  }

  async prep(shared: TeamStandardsState): Promise<[string, string]> {
    return [shared.code, shared.teamId];
  }

  async exec([code, teamId]: [string, string]): Promise<TeamStandardsEnforcementResult> {
    console.warn(`🔍 Enforcing team standards for team: ${teamId}`);
    
    // Enforce rules
    const violations = await this.codingEngine.enforceRules(code, teamId);
    
    // Generate fix suggestions
    const suggestions = await this.codingEngine.suggestFixes(violations);
    
    // Calculate compliance
    const compliance = this.calculateCompliance(violations, shared.rules);
    
    // Analyze violation patterns
    const violationAnalysis = this.analyzeViolationPatterns(violations);
    
    return {
      violations,
      suggestions,
      compliance,
      violationAnalysis,
      totalViolations: violations.length,
      criticalViolations: violations.filter(v => v.severity === 'critical').length
    };
  }

  async post(
    shared: TeamStandardsState,
    _: [string, string],
    result: TeamStandardsEnforcementResult
  ): Promise<string> {
    // Store enforcement results
    shared.violations = result.violations;
    shared.suggestions = result.suggestions;
    shared.compliance = result.compliance;
    
    // Learn from standards enforcement
    await this.learnFromStandardsEnforcement(shared.teamId, result);
    
    return 'enforced';
  }

  private calculateCompliance(violations: RuleViolation[], rules: CodingStandardRule[]): number {
    if (rules.length === 0) return 100;
    
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const highViolations = violations.filter(v => v.severity === 'high').length;
    const mediumViolations = violations.filter(v => v.severity === 'medium').length;
    const lowViolations = violations.filter(v => v.severity === 'low').length;
    
    const totalViolations = criticalViolations * 4 + highViolations * 3 + mediumViolations * 2 + lowViolations;
    const maxPossibleViolations = rules.length * 4; // Assuming max severity per rule
    
    return Math.max(0, Math.round((1 - totalViolations / maxPossibleViolations) * 100));
  }

  private analyzeViolationPatterns(violations: RuleViolation[]): any {
    const severityCounts = {
      critical: violations.filter(v => v.severity === 'critical').length,
      high: violations.filter(v => v.severity === 'high').length,
      medium: violations.filter(v => v.severity === 'medium').length,
      low: violations.filter(v => v.severity === 'low').length
    };
    
    const ruleViolations = new Map<string, number>();
    for (const violation of violations) {
      const count = ruleViolations.get(violation.ruleId) || 0;
      ruleViolations.set(violation.ruleId, count + 1);
    }
    
    return {
      severityCounts,
      ruleViolations: Object.fromEntries(ruleViolations),
      mostViolatedRule: Array.from(ruleViolations.entries())
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
    };
  }

  private async learnFromStandardsEnforcement(teamId: string, result: TeamStandardsEnforcementResult): Promise<void> {
    const concept = `team-standards-enforcement-${teamId}`;
    const data = {
      result,
      timestamp: Date.now()
    };
    const context = {
      teamId,
      domain: 'team-standards'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.7);
  }
}

/**
 * Node: Refine Team Standards
 */
export class RefineTeamStandardsNode extends Node<TeamStandardsState> {
  private codingEngine: CodingStandardEngine;
  private sharedDB: SharedLearningDatabase;
  private h2gnn: any;

  constructor() {
    super();
    this.codingEngine = new CodingStandardEngine();
    this.sharedDB = new SharedLearningDatabase();
    this.h2gnn = getSharedH2GNN();
  }

  async prep(shared: TeamStandardsState): Promise<[string, RuleViolation[], CodingStandardRule[]]> {
    return [shared.teamId, shared.violations, shared.rules];
  }

  async exec([teamId, violations, rules]: [string, RuleViolation[], CodingStandardRule[]]): Promise<TeamStandardsRefinementResult> {
    console.warn(`🔧 Refining team standards for team: ${teamId}`);
    
    // Analyze violation patterns
    const violationPatterns = this.analyzeViolationPatterns(violations);
    
    // Identify rules that need refinement
    const rulesToRefine = this.identifyRulesToRefine(violations, rules);
    
    // Refine rules based on patterns
    const refinedRules = await this.refineRulesBasedOnPatterns(rulesToRefine, violationPatterns);
    
    // Learn from team standards
    await this.codingEngine.learnFromTeamStandards(teamId);
    
    // Adapt rules to team
    await this.codingEngine.adaptRulesToTeam(teamId);
    
    return {
      refinedRules,
      rulesRefined: refinedRules.length,
      violationPatterns,
      learningComplete: true
    };
  }

  async post(
    shared: TeamStandardsState,
    _: [string, RuleViolation[], CodingStandardRule[]],
    result: TeamStandardsRefinementResult
  ): Promise<string> {
    // Update rules with refined versions
    for (const refinedRule of result.refinedRules) {
      await this.codingEngine.updateRule(refinedRule.id, refinedRule);
    }
    
    shared.rules = result.refinedRules;
    shared.standardsComplete = true;
    
    // Learn from standards refinement
    await this.learnFromStandardsRefinement(shared.teamId, result);
    
    return 'refined';
  }

  private analyzeViolationPatterns(violations: RuleViolation[]): any {
    const patterns = {
      commonViolations: new Map<string, number>(),
      severityDistribution: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      ruleViolations: new Map<string, number>()
    };
    
    for (const violation of violations) {
      // Count by rule
      const ruleCount = patterns.ruleViolations.get(violation.ruleId) || 0;
      patterns.ruleViolations.set(violation.ruleId, ruleCount + 1);
      
      // Count by severity
      patterns.severityDistribution[violation.severity]++;
      
      // Count common violation types
      const violationType = violation.message.split(':')[0];
      const typeCount = patterns.commonViolations.get(violationType) || 0;
      patterns.commonViolations.set(violationType, typeCount + 1);
    }
    
    return patterns;
  }

  private identifyRulesToRefine(violations: RuleViolation[], rules: CodingStandardRule[]): CodingStandardRule[] {
    const violationCounts = new Map<string, number>();
    
    for (const violation of violations) {
      const count = violationCounts.get(violation.ruleId) || 0;
      violationCounts.set(violation.ruleId, count + 1);
    }
    
    // Find rules with high violation counts
    const rulesToRefine: CodingStandardRule[] = [];
    
    for (const rule of rules) {
      const violationCount = violationCounts.get(rule.id) || 0;
      if (violationCount > 3) { // Threshold for refinement
        rulesToRefine.push(rule);
      }
    }
    
    return rulesToRefine;
  }

  private async refineRulesBasedOnPatterns(
    rules: CodingStandardRule[], 
    patterns: any
  ): Promise<CodingStandardRule[]> {
    const refinedRules: CodingStandardRule[] = [];
    
    for (const rule of rules) {
      const refinedRule = { ...rule };
      
      // Add more specific patterns based on violations
      if (patterns.commonViolations.has('Variable')) {
        refinedRule.patterns.push('Use descriptive variable names');
      }
      
      if (patterns.commonViolations.has('Function')) {
        refinedRule.patterns.push('Keep functions small and focused');
      }
      
      if (patterns.commonViolations.has('Error')) {
        refinedRule.patterns.push('Handle errors gracefully');
      }
      
      refinedRule.updatedAt = Date.now();
      refinedRules.push(refinedRule);
    }
    
    return refinedRules;
  }

  private async learnFromStandardsRefinement(teamId: string, result: TeamStandardsRefinementResult): Promise<void> {
    const concept = `team-standards-refinement-${teamId}`;
    const data = {
      result,
      timestamp: Date.now()
    };
    const context = {
      teamId,
      domain: 'team-standards'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.9);
  }
}

/**
 * Team Standards Workflow
 */
export class TeamStandardsWorkflow extends Flow<TeamStandardsState> {
  private defineTeamStandards: DefineTeamStandardsNode;
  private enforceTeamStandards: EnforceTeamStandardsNode;
  private refineTeamStandards: RefineTeamStandardsNode;

  constructor() {
    super({ start: new DefineTeamStandardsNode() });
    
    // Create nodes
    this.defineTeamStandards = new DefineTeamStandardsNode();
    this.enforceTeamStandards = new EnforceTeamStandardsNode();
    this.refineTeamStandards = new RefineTeamStandardsNode();
    
    // Connect workflow
    this.defineTeamStandards
      .next(this.enforceTeamStandards)
      .next(this.refineTeamStandards);
  }

  /**
   * Execute team standards workflow
   */
  async executeTeamStandards(
    teamId: string, 
    code: string, 
    language: string = 'typescript'
  ): Promise<TeamStandardsResult> {
    console.warn(`🚀 Starting team standards workflow for team: ${teamId}`);
    
    const state: TeamStandardsState = {
      teamId,
      code,
      language,
      rules: [],
      violations: [],
      suggestions: [],
      compliance: 0,
      standardsComplete: false
    };
    
    // Run workflow
    await this.run(state);
    
    // Calculate learning progress
    const learningProgress = this.calculateLearningProgress(state.rules, state.violations);
    
    return {
      teamId,
      rules: state.rules,
      violations: state.violations,
      suggestions: state.suggestions,
      compliance: state.compliance,
      learningProgress
    };
  }

  private calculateLearningProgress(rules: CodingStandardRule[], violations: RuleViolation[]): number {
    if (rules.length === 0) return 0;
    
    const highSeverityViolations = violations.filter(v => 
      v.severity === 'critical' || v.severity === 'high'
    ).length;
    
    const totalPossibleViolations = rules.length * 2; // Assume 2 violations per rule max
    const progress = Math.max(0, (1 - highSeverityViolations / totalPossibleViolations) * 100);
    
    return Math.round(progress);
  }
}

// Type definitions for workflow results
interface TeamStandardsDefinitionResult {
  definedRules: CodingStandardRule[];
  languageRules: number;
  teamSpecificRules: number;
  totalRules: number;
}

interface TeamStandardsEnforcementResult {
  violations: RuleViolation[];
  suggestions: FixSuggestion[];
  compliance: number;
  violationAnalysis: any;
  totalViolations: number;
  criticalViolations: number;
}

interface TeamStandardsRefinementResult {
  refinedRules: CodingStandardRule[];
  rulesRefined: number;
  violationPatterns: any;
  learningComplete: boolean;
}
