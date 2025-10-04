#!/usr/bin/env tsx

/**
 * Coding Standard Engine Tests
 * 
 * Comprehensive test suite for the coding standard engine:
 * - Rule definition and management
 * - Code analysis and violation detection
 * - Fix suggestions generation
 * - Team-specific learning
 * - Rule adaptation
 */

import { CodingStandardEngine, CodingStandardRule, RuleViolation, FixSuggestion } from '../../rules/coding-standard-engine';

describe('CodingStandardEngine', () => {
  let codingEngine: CodingStandardEngine;

  beforeEach(() => {
    codingEngine = new CodingStandardEngine();
  });

  describe('Rule Management', () => {
    test('should define a new rule successfully', async () => {
      const rule: CodingStandardRule = {
        id: 'test-rule-1',
        name: 'Test Rule 1',
        description: 'A test rule for unit testing',
        teamId: 'test-team',
        severity: 'high',
        patterns: ['Use descriptive variable names', 'Avoid single letter variables'],
        exceptions: ['Loop counters'],
        examples: ['const userName = "john";', 'const i = 0; // Loop counter'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(rule);

      const allRules = codingEngine.getAllRules();
      const teamRules = codingEngine.getTeamRules('test-team');

      expect(allRules.some(r => r.id === 'test-rule-1')).toBe(true);
      expect(teamRules.some(r => r.id === 'test-rule-1')).toBe(true);
    });

    test('should update an existing rule', async () => {
      const rule: CodingStandardRule = {
        id: 'test-rule-2',
        name: 'Test Rule 2',
        description: 'A test rule for updating',
        teamId: 'test-team',
        severity: 'medium',
        patterns: ['Original pattern'],
        exceptions: [],
        examples: ['Original example'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(rule);

      const updates = {
        name: 'Updated Test Rule 2',
        description: 'Updated description',
        severity: 'high' as const,
        patterns: ['Updated pattern', 'New pattern']
      };

      await codingEngine.updateRule('test-rule-2', updates);

      const updatedRule = codingEngine.getAllRules().find(r => r.id === 'test-rule-2');
      expect(updatedRule?.name).toBe('Updated Test Rule 2');
      expect(updatedRule?.severity).toBe('high');
      expect(updatedRule?.patterns).toContain('Updated pattern');
    });

    test('should delete a rule', async () => {
      const rule: CodingStandardRule = {
        id: 'test-rule-3',
        name: 'Test Rule 3',
        description: 'A test rule for deletion',
        teamId: 'test-team',
        severity: 'low',
        patterns: ['Pattern to delete'],
        exceptions: [],
        examples: ['Example to delete'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(rule);
      expect(codingEngine.getAllRules().some(r => r.id === 'test-rule-3')).toBe(true);

      await codingEngine.deleteRule('test-rule-3');
      expect(codingEngine.getAllRules().some(r => r.id === 'test-rule-3')).toBe(false);
    });

    test('should handle rule operations for non-existent rules', async () => {
      await expect(codingEngine.updateRule('non-existent-rule', { name: 'Updated' }))
        .rejects.toThrow('Rule not found: non-existent-rule');

      await expect(codingEngine.deleteRule('non-existent-rule'))
        .rejects.toThrow('Rule not found: non-existent-rule');
    });
  });

  describe('Code Analysis', () => {
    test('should detect naming convention violations', async () => {
      const rule: CodingStandardRule = {
        id: 'naming-conventions',
        name: 'Naming Conventions',
        description: 'Enforce consistent naming conventions',
        teamId: 'test-team',
        severity: 'medium',
        patterns: ['camelCase for variables', 'PascalCase for classes'],
        exceptions: [],
        examples: ['const userName = "john";', 'class UserManager {}'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(rule);

      const codeWithViolations = `
        const user_name = "john"; // snake_case violation
        const UserName = "jane"; // PascalCase for variable
        class userManager {} // camelCase for class
      `;

      const violations = await codingEngine.enforceRules(codeWithViolations, 'test-team');

      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.ruleId === 'naming-conventions')).toBe(true);
    });

    test('should detect function complexity violations', async () => {
      const rule: CodingStandardRule = {
        id: 'function-complexity',
        name: 'Function Complexity',
        description: 'Limit function complexity',
        teamId: 'test-team',
        severity: 'high',
        patterns: ['max 20 lines per function', 'single responsibility'],
        exceptions: [],
        examples: ['function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(rule);

      const complexFunction = `
        function veryComplexFunction() {
          // This function has many lines
          const a = 1;
          const b = 2;
          const c = 3;
          const d = 4;
          const e = 5;
          const f = 6;
          const g = 7;
          const h = 8;
          const i = 9;
          const j = 10;
          const k = 11;
          const l = 12;
          const m = 13;
          const n = 14;
          const o = 15;
          const p = 16;
          const q = 17;
          const r = 18;
          const s = 19;
          const t = 20;
          const u = 21;
          const v = 22;
          const w = 23;
          const x = 24;
          const y = 25;
          const z = 26;
          return a + b + c + d + e + f + g + h + i + j + k + l + m + n + o + p + q + r + s + t + u + v + w + x + y + z;
        }
      `;

      const violations = await codingEngine.enforceRules(complexFunction, 'test-team');

      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.ruleId === 'function-complexity')).toBe(true);
    });

    test('should detect error handling violations', async () => {
      const rule: CodingStandardRule = {
        id: 'error-handling',
        name: 'Error Handling',
        description: 'Proper error handling patterns',
        teamId: 'test-team',
        severity: 'critical',
        patterns: ['try-catch blocks for async operations', 'proper error logging'],
        exceptions: [],
        examples: ['try { const result = await apiCall(); } catch (error) { logger.error("API call failed:", error); }'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(rule);

      const codeWithAsyncWithoutTryCatch = `
        async function fetchData() {
          const result = await apiCall(); // Missing try-catch
          return result;
        }
      `;

      const violations = await codingEngine.enforceRules(codeWithAsyncWithoutTryCatch, 'test-team');

      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.ruleId === 'error-handling')).toBe(true);
    });

    test('should return empty violations for teams without standards', async () => {
      const code = 'const x = 1;';
      const violations = await codingEngine.enforceRules(code, 'non-existent-team');

      expect(violations).toEqual([]);
    });
  });

  describe('Fix Suggestions', () => {
    test('should generate fix suggestions for violations', async () => {
      const rule: CodingStandardRule = {
        id: 'naming-conventions',
        name: 'Naming Conventions',
        description: 'Enforce consistent naming conventions',
        teamId: 'test-team',
        severity: 'medium',
        patterns: ['camelCase for variables'],
        exceptions: [],
        examples: ['const userName = "john";'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(rule);

      const codeWithViolations = 'const user_name = "john";';
      const violations = await codingEngine.enforceRules(codeWithViolations, 'test-team');
      const suggestions = await codingEngine.suggestFixes(violations);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].violationId).toBe(violations[0].id);
      expect(suggestions[0].description).toContain('camelCase');
    });

    test('should generate different suggestions for different violation types', async () => {
      const namingRule: CodingStandardRule = {
        id: 'naming-conventions',
        name: 'Naming Conventions',
        description: 'Enforce consistent naming conventions',
        teamId: 'test-team',
        severity: 'medium',
        patterns: ['camelCase for variables'],
        exceptions: [],
        examples: ['const userName = "john";'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const complexityRule: CodingStandardRule = {
        id: 'function-complexity',
        name: 'Function Complexity',
        description: 'Limit function complexity',
        teamId: 'test-team',
        severity: 'high',
        patterns: ['max 20 lines per function'],
        exceptions: [],
        examples: ['function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(namingRule);
      await codingEngine.defineRule(complexityRule);

      const codeWithMultipleViolations = `
        const user_name = "john"; // Naming violation
        function veryLongFunction() {
          // Many lines of code...
          return "complex";
        }
      `;

      const violations = await codingEngine.enforceRules(codeWithMultipleViolations, 'test-team');
      const suggestions = await codingEngine.suggestFixes(violations);

      expect(suggestions.length).toBeGreaterThan(0);
      
      const namingSuggestions = suggestions.filter(s => 
        s.description.toLowerCase().includes('camelcase')
      );
      const complexitySuggestions = suggestions.filter(s => 
        s.description.toLowerCase().includes('function')
      );

      expect(namingSuggestions.length).toBeGreaterThan(0);
      expect(complexitySuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Team Learning', () => {
    test('should learn from team standards', async () => {
      const teamId = 'learning-test-team';
      
      // Define some rules for the team
      const rule: CodingStandardRule = {
        id: 'team-learning-rule',
        name: 'Team Learning Rule',
        description: 'Rule for testing team learning',
        teamId,
        severity: 'medium',
        patterns: ['Team-specific pattern'],
        exceptions: [],
        examples: ['Team-specific example'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(rule);

      // Learn from team standards
      await expect(codingEngine.learnFromTeamStandards(teamId))
        .resolves.not.toThrow();

      // Adapt rules to team
      await expect(codingEngine.adaptRulesToTeam(teamId))
        .resolves.not.toThrow();
    });

    test('should handle learning for non-existent teams gracefully', async () => {
      const nonExistentTeamId = 'non-existent-team';

      await expect(codingEngine.learnFromTeamStandards(nonExistentTeamId))
        .resolves.not.toThrow();

      await expect(codingEngine.adaptRulesToTeam(nonExistentTeamId))
        .resolves.not.toThrow();
    });
  });

  describe('Compliance Calculation', () => {
    test('should calculate compliance correctly', async () => {
      const rule: CodingStandardRule = {
        id: 'test-compliance-rule',
        name: 'Test Compliance Rule',
        description: 'Rule for testing compliance calculation',
        teamId: 'compliance-test-team',
        severity: 'high',
        patterns: ['Test pattern'],
        exceptions: [],
        examples: ['Test example'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(rule);

      const cleanCode = 'const userName = "john"; // Clean code';
      const violations = await codingEngine.enforceRules(cleanCode, 'compliance-test-team');

      // Clean code should have high compliance
      expect(violations.length).toBe(0);
    });

    test('should handle compliance calculation with no rules', async () => {
      const violations = await codingEngine.enforceRules('const x = 1;', 'team-with-no-rules');
      expect(violations).toEqual([]);
    });
  });

  describe('Default Rules', () => {
    test('should initialize with default rules', () => {
      const allRules = codingEngine.getAllRules();
      
      // Should have default rules
      expect(allRules.length).toBeGreaterThan(0);
      
      // Check for specific default rules
      const namingRule = allRules.find(r => r.id === 'naming-conventions');
      const complexityRule = allRules.find(r => r.id === 'function-complexity');
      const errorHandlingRule = allRules.find(r => r.id === 'error-handling');

      expect(namingRule).toBeDefined();
      expect(complexityRule).toBeDefined();
      expect(errorHandlingRule).toBeDefined();
    });

    test('should have default rules with proper severity levels', () => {
      const allRules = codingEngine.getAllRules();
      
      const namingRule = allRules.find(r => r.id === 'naming-conventions');
      const complexityRule = allRules.find(r => r.id === 'function-complexity');
      const errorHandlingRule = allRules.find(r => r.id === 'error-handling');

      expect(namingRule?.severity).toBe('medium');
      expect(complexityRule?.severity).toBe('high');
      expect(errorHandlingRule?.severity).toBe('critical');
    });
  });

  describe('Performance', () => {
    test('should handle large codebases efficiently', async () => {
      const rule: CodingStandardRule = {
        id: 'performance-test-rule',
        name: 'Performance Test Rule',
        description: 'Rule for testing performance',
        teamId: 'performance-test-team',
        severity: 'medium',
        patterns: ['Performance pattern'],
        exceptions: [],
        examples: ['Performance example'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await codingEngine.defineRule(rule);

      // Generate large codebase
      let largeCode = '';
      for (let i = 0; i < 100; i++) {
        largeCode += `
          function function${i}() {
            const variable_${i} = ${i};
            return variable_${i};
          }
        `;
      }

      const startTime = Date.now();
      const violations = await codingEngine.enforceRules(largeCode, 'performance-test-team');
      const endTime = Date.now();

      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty code', async () => {
      const violations = await codingEngine.enforceRules('', 'test-team');
      expect(violations).toEqual([]);
    });

    test('should handle code with only comments', async () => {
      const commentOnlyCode = `
        // This is just a comment
        /* Multi-line comment */
      `;
      
      const violations = await codingEngine.enforceRules(commentOnlyCode, 'test-team');
      expect(violations).toEqual([]);
    });

    test('should handle malformed code gracefully', async () => {
      const malformedCode = `
        function incompleteFunction() {
          const x = 
          // Missing value
        }
      `;
      
      const violations = await codingEngine.enforceRules(malformedCode, 'test-team');
      // Should not throw errors, may or may not detect violations
      expect(Array.isArray(violations)).toBe(true);
    });
  });
});
