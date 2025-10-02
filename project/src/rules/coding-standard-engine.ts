#!/usr/bin/env tsx

/**
 * Coding Standard Engine
 * 
 * This module provides team-specific coding standards and rule enforcement:
 * - Rule definition and management
 * - Code analysis and violation detection
 * - Automated fix suggestions
 * - Team-based learning integration
 */

import { LearningMemory } from '../core/enhanced-h2gnn';
import { getSharedH2GNN } from '../core/centralized-h2gnn-config';

export interface CodingStandardRule {
  id: string;
  name: string;
  description: string;
  teamId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  patterns: string[];
  exceptions: string[];
  examples: string[];
  createdAt: number;
  updatedAt: number;
}

export interface RuleViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  filePath: string;
  lineNumber: number;
  columnNumber: number;
  message: string;
  code: string;
  suggestedFix?: string;
  confidence: number;
}

export interface FixSuggestion {
  id: string;
  violationId: string;
  description: string;
  code: string;
  confidence: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface TeamCodingStandards {
  teamId: string;
  rules: CodingStandardRule[];
  violations: RuleViolation[];
  compliance: number;
  lastUpdated: number;
}

export class CodingStandardEngine {
  private rules: Map<string, CodingStandardRule> = new Map();
  private teamStandards: Map<string, TeamCodingStandards> = new Map();
  private h2gnn: any;

  constructor() {
    this.h2gnn = getSharedH2GNN();
    this.initializeDefaultRules();
  }

  /**
   * Initialize default coding standards
   */
  private initializeDefaultRules(): void {
    const defaultRules: CodingStandardRule[] = [
      {
        id: 'naming-conventions',
        name: 'Naming Conventions',
        description: 'Enforce consistent naming conventions',
        teamId: 'default',
        severity: 'medium',
        patterns: [
          'camelCase for variables',
          'PascalCase for classes',
          'UPPER_CASE for constants'
        ],
        exceptions: [],
        examples: [
          'const userName = "john";',
          'class UserManager {}',
          'const MAX_RETRIES = 3;'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'function-complexity',
        name: 'Function Complexity',
        description: 'Limit function complexity',
        teamId: 'default',
        severity: 'high',
        patterns: [
          'max 20 lines per function',
          'max 3 parameters',
          'single responsibility'
        ],
        exceptions: [],
        examples: [
          'function calculateTotal(items: Item[]): number {',
          '  return items.reduce((sum, item) => sum + item.price, 0);',
          '}'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'error-handling',
        name: 'Error Handling',
        description: 'Proper error handling patterns',
        teamId: 'default',
        severity: 'critical',
        patterns: [
          'try-catch blocks for async operations',
          'proper error logging',
          'user-friendly error messages'
        ],
        exceptions: [],
        examples: [
          'try {',
          '  const result = await apiCall();',
          '} catch (error) {',
          '  logger.error("API call failed:", error);',
          '  throw new UserError("Operation failed");',
          '}'
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule);
    }
  }

  /**
   * Define a new coding standard rule
   */
  async defineRule(rule: CodingStandardRule): Promise<void> {
    console.log(`📝 Defining coding standard rule: ${rule.name}`);
    
    // Store the rule
    this.rules.set(rule.id, rule);
    
    // Update team standards
    const teamStandards = this.teamStandards.get(rule.teamId) || {
      teamId: rule.teamId,
      rules: [],
      violations: [],
      compliance: 0,
      lastUpdated: Date.now()
    };
    
    teamStandards.rules.push(rule);
    teamStandards.lastUpdated = Date.now();
    this.teamStandards.set(rule.teamId, teamStandards);
    
    // Learn from the rule definition
    await this.learnFromRuleDefinition(rule);
    
    console.log(`✅ Rule defined: ${rule.name} (${rule.severity})`);
  }

  /**
   * Update an existing rule
   */
  async updateRule(ruleId: string, updates: Partial<CodingStandardRule>): Promise<void> {
    const existingRule = this.rules.get(ruleId);
    if (!existingRule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    const updatedRule = { ...existingRule, ...updates, updatedAt: Date.now() };
    this.rules.set(ruleId, updatedRule);
    
    // Update team standards
    const teamStandards = this.teamStandards.get(updatedRule.teamId);
    if (teamStandards) {
      const ruleIndex = teamStandards.rules.findIndex(r => r.id === ruleId);
      if (ruleIndex !== -1) {
        teamStandards.rules[ruleIndex] = updatedRule;
        teamStandards.lastUpdated = Date.now();
      }
    }
    
    console.log(`📝 Updated rule: ${updatedRule.name}`);
  }

  /**
   * Delete a rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    this.rules.delete(ruleId);
    
    // Remove from team standards
    const teamStandards = this.teamStandards.get(rule.teamId);
    if (teamStandards) {
      teamStandards.rules = teamStandards.rules.filter(r => r.id !== ruleId);
      teamStandards.lastUpdated = Date.now();
    }
    
    console.log(`🗑️ Deleted rule: ${rule.name}`);
  }

  /**
   * Enforce rules on code
   */
  async enforceRules(code: string, teamId: string): Promise<RuleViolation[]> {
    console.log(`🔍 Enforcing rules for team: ${teamId}`);
    
    const teamStandards = this.teamStandards.get(teamId);
    if (!teamStandards) {
      console.warn(`⚠️ No standards found for team: ${teamId}`);
      return [];
    }

    const violations: RuleViolation[] = [];
    const lines = code.split('\n');

    for (const rule of teamStandards.rules) {
      const ruleViolations = await this.checkRuleViolations(code, rule, lines);
      violations.push(...ruleViolations);
    }

    // Update team standards with violations
    teamStandards.violations = violations;
    teamStandards.compliance = this.calculateCompliance(violations, teamStandards.rules);
    teamStandards.lastUpdated = Date.now();

    console.log(`📊 Found ${violations.length} violations (${teamStandards.compliance}% compliance)`);
    return violations;
  }

  /**
   * Check for rule violations
   */
  private async checkRuleViolations(
    code: string, 
    rule: CodingStandardRule, 
    lines: string[]
  ): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check naming conventions
      if (rule.id === 'naming-conventions') {
        const namingViolations = this.checkNamingConventions(line, lineNumber, rule);
        violations.push(...namingViolations);
      }

      // Check function complexity
      if (rule.id === 'function-complexity') {
        const complexityViolations = this.checkFunctionComplexity(code, lineNumber, rule);
        violations.push(...complexityViolations);
      }

      // Check error handling
      if (rule.id === 'error-handling') {
        const errorHandlingViolations = this.checkErrorHandling(line, lineNumber, rule);
        violations.push(...errorHandlingViolations);
      }
    }

    return violations;
  }

  /**
   * Check naming convention violations
   */
  private checkNamingConventions(line: string, lineNumber: number, rule: CodingStandardRule): RuleViolation[] {
    const violations: RuleViolation[] = [];

    // Check for snake_case variables (should be camelCase)
    const snakeCaseMatch = line.match(/(\w+_\w+)/g);
    if (snakeCaseMatch) {
      for (const match of snakeCaseMatch) {
        violations.push({
          id: `violation_${Date.now()}_${lineNumber}`,
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          filePath: 'unknown',
          lineNumber,
          columnNumber: line.indexOf(match),
          message: `Variable '${match}' should use camelCase instead of snake_case`,
          code: match,
          confidence: 0.9
        });
      }
    }

    return violations;
  }

  /**
   * Check function complexity violations
   */
  private checkFunctionComplexity(code: string, lineNumber: number, rule: CodingStandardRule): RuleViolation[] {
    const violations: RuleViolation[] = [];

    // Simple complexity check - count lines in function
    const functionMatch = code.match(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\}/g);
    if (functionMatch) {
      for (const func of functionMatch) {
        const lines = func.split('\n').length;
        if (lines > 20) {
          violations.push({
            id: `violation_${Date.now()}_${lineNumber}`,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            filePath: 'unknown',
            lineNumber,
            columnNumber: 0,
            message: `Function has ${lines} lines, should be ≤ 20`,
            code: func.split('\n')[0],
            confidence: 0.8
          });
        }
      }
    }

    return violations;
  }

  /**
   * Check error handling violations
   */
  private checkErrorHandling(line: string, lineNumber: number, rule: CodingStandardRule): RuleViolation[] {
    const violations: RuleViolation[] = [];

    // Check for async operations without try-catch
    if (line.includes('await') && !line.includes('try') && !line.includes('catch')) {
      violations.push({
        id: `violation_${Date.now()}_${lineNumber}`,
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        filePath: 'unknown',
        lineNumber,
        columnNumber: line.indexOf('await'),
        message: 'Async operation should be wrapped in try-catch',
        code: line.trim(),
        confidence: 0.7
      });
    }

    return violations;
  }

  /**
   * Calculate compliance percentage
   */
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

  /**
   * Suggest fixes for violations
   */
  async suggestFixes(violations: RuleViolation[]): Promise<FixSuggestion[]> {
    const suggestions: FixSuggestion[] = [];

    for (const violation of violations) {
      const suggestion = await this.generateFixSuggestion(violation);
      suggestions.push(suggestion);
    }

    return suggestions;
  }

  /**
   * Generate fix suggestion for a violation
   */
  private async generateFixSuggestion(violation: RuleViolation): Promise<FixSuggestion> {
    let suggestedFix = '';
    let description = '';

    switch (violation.ruleId) {
      case 'naming-conventions':
        if (violation.code.includes('_')) {
          const camelCase = violation.code.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          suggestedFix = camelCase;
          description = `Convert to camelCase: ${violation.code} → ${camelCase}`;
        }
        break;

      case 'function-complexity':
        suggestedFix = '// TODO: Break down into smaller functions';
        description = 'Split function into smaller, focused functions';
        break;

      case 'error-handling':
        suggestedFix = `try {\n  ${violation.code}\n} catch (error) {\n  // Handle error\n}`;
        description = 'Wrap async operation in try-catch block';
        break;

      default:
        suggestedFix = '// TODO: Fix based on team standards';
        description = 'Apply team coding standards';
    }

    return {
      id: `suggestion_${Date.now()}`,
      violationId: violation.id,
      description,
      code: suggestedFix,
      confidence: 0.8,
      effort: 'medium',
      impact: 'medium'
    };
  }

  /**
   * Learn from team standards
   */
  async learnFromTeamStandards(teamId: string): Promise<void> {
    console.log(`🧠 Learning from team standards: ${teamId}`);
    
    const teamStandards = this.teamStandards.get(teamId);
    if (!teamStandards) {
      console.warn(`⚠️ No standards found for team: ${teamId}`);
      return;
    }

    // Learn from rule patterns
    for (const rule of teamStandards.rules) {
      await this.learnFromRulePattern(rule);
    }

    // Learn from violation patterns
    for (const violation of teamStandards.violations) {
      await this.learnFromViolationPattern(violation);
    }

    console.log(`✅ Learned from ${teamStandards.rules.length} rules and ${teamStandards.violations.length} violations`);
  }

  /**
   * Learn from rule definition
   */
  private async learnFromRuleDefinition(rule: CodingStandardRule): Promise<void> {
    const concept = `coding-standard-${rule.name.toLowerCase().replace(/\s+/g, '-')}`;
    const data = {
      rule: rule,
      patterns: rule.patterns,
      examples: rule.examples
    };
    const context = {
      teamId: rule.teamId,
      severity: rule.severity,
      domain: 'coding-standards'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.8);
  }

  /**
   * Learn from rule pattern
   */
  private async learnFromRulePattern(rule: CodingStandardRule): Promise<void> {
    const concept = `rule-pattern-${rule.id}`;
    const data = {
      patterns: rule.patterns,
      exceptions: rule.exceptions,
      examples: rule.examples
    };
    const context = {
      teamId: rule.teamId,
      ruleType: rule.name,
      domain: 'coding-standards'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.7);
  }

  /**
   * Learn from violation pattern
   */
  private async learnFromViolationPattern(violation: RuleViolation): Promise<void> {
    const concept = `violation-pattern-${violation.ruleId}`;
    const data = {
      violation: violation,
      code: violation.code,
      message: violation.message
    };
    const context = {
      ruleId: violation.ruleId,
      severity: violation.severity,
      domain: 'coding-standards'
    };

    await this.h2gnn.learnWithMemory(concept, data, context, 0.6);
  }

  /**
   * Adapt rules to team
   */
  async adaptRulesToTeam(teamId: string): Promise<void> {
    console.log(`🔄 Adapting rules to team: ${teamId}`);
    
    const teamStandards = this.teamStandards.get(teamId);
    if (!teamStandards) {
      console.warn(`⚠️ No standards found for team: ${teamId}`);
      return;
    }

    // Analyze team's coding patterns
    const teamPatterns = await this.analyzeTeamPatterns(teamId);
    
    // Adapt rules based on team patterns
    for (const rule of teamStandards.rules) {
      await this.adaptRuleToTeam(rule, teamPatterns);
    }

    console.log(`✅ Adapted rules for team: ${teamId}`);
  }

  /**
   * Analyze team coding patterns
   */
  private async analyzeTeamPatterns(teamId: string): Promise<any> {
    // This would analyze the team's actual code patterns
    // For now, return mock data
    return {
      commonPatterns: ['async/await', 'error handling', 'naming conventions'],
      preferredStyle: 'functional',
      complexity: 'medium'
    };
  }

  /**
   * Adapt rule to team
   */
  private async adaptRuleToTeam(rule: CodingStandardRule, teamPatterns: any): Promise<void> {
    // Adapt rule based on team patterns
    if (teamPatterns.preferredStyle === 'functional' && rule.id === 'function-complexity') {
      // Adjust complexity rules for functional style
      rule.patterns.push('prefer pure functions');
    }
  }

  /**
   * Get team standards
   */
  getTeamStandards(teamId: string): TeamCodingStandards | undefined {
    return this.teamStandards.get(teamId);
  }

  /**
   * Get all rules
   */
  getAllRules(): CodingStandardRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rules for team
   */
  getTeamRules(teamId: string): CodingStandardRule[] {
    const teamStandards = this.teamStandards.get(teamId);
    return teamStandards ? teamStandards.rules : [];
  }
}
