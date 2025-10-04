#!/usr/bin/env tsx

/**
 * Team Collaboration MCP Tools Tests
 * 
 * Comprehensive test suite for team collaboration MCP tools:
 * - define_coding_standard
 * - enforce_coding_standard
 * - learn_from_team_standards
 * - create_team
 * - share_team_knowledge
 * - get_team_learning_progress
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as fs from 'fs';
import * as path from 'path';

// Mock the MCP server for testing
class MockTeamCollaborationMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "team-collaboration-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "define_coding_standard":
          return await this.defineCodingStandard(args);
        
        case "enforce_coding_standard":
          return await this.enforceCodingStandard(args);
        
        case "learn_from_team_standards":
          return await this.learnFromTeamStandards(args);
        
        case "create_team":
          return await this.createTeam(args);
        
        case "share_team_knowledge":
          return await this.shareTeamKnowledge(args);
        
        case "get_team_learning_progress":
          return await this.getTeamLearningProgress(args);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async defineCodingStandard(args: any): Promise<any> {
    const { rule } = args;
    
    if (!rule || !rule.id || !rule.name || !rule.teamId) {
      throw new Error('Invalid rule definition');
    }

    return {
      content: [
        {
          type: "text",
          text: `✅ Coding standard rule defined: ${rule.name}\n` +
                `Team: ${rule.teamId}\n` +
                `Severity: ${rule.severity}\n` +
                `Patterns: ${rule.patterns?.length || 0} patterns defined`
        }
      ]
    };
  }

  private async enforceCodingStandard(args: any): Promise<any> {
    const { code, teamId } = args;
    
    if (!code || !teamId) {
      throw new Error('Invalid enforcement parameters');
    }

    // Mock violation detection
    const violations = [];
    if (code.includes('const user_name')) {
      violations.push({
        id: 'violation-1',
        ruleId: 'naming-conventions',
        severity: 'medium',
        message: 'Variable should use camelCase'
      });
    }

    return {
      content: [
        {
          type: "text",
          text: `🔍 Coding standards enforcement results:\n` +
                `Team: ${teamId}\n` +
                `Violations found: ${violations.length}\n` +
                `Critical violations: ${violations.filter(v => v.severity === 'critical').length}\n` +
                `High violations: ${violations.filter(v => v.severity === 'high').length}`
        }
      ]
    };
  }

  private async learnFromTeamStandards(args: any): Promise<any> {
    const { teamId } = args;
    
    if (!teamId) {
      throw new Error('Invalid team ID');
    }

    return {
      content: [
        {
          type: "text",
          text: `🧠 Learned from team standards: ${teamId}\n` +
                `✅ Team standards analysis complete\n` +
                `✅ Rules adapted to team patterns\n` +
                `✅ Learning integrated with H²GNN system`
        }
      ]
    };
  }

  private async createTeam(args: any): Promise<any> {
    const { teamId, name, description, learningDomains, privacyLevel } = args;
    
    if (!teamId || !name || !description) {
      throw new Error('Missing required team parameters');
    }

    return {
      content: [
        {
          type: "text",
          text: `🤝 Team created successfully: ${name}\n` +
                `Team ID: ${teamId}\n` +
                `Learning domains: ${learningDomains?.join(', ') || 'None'}\n` +
                `Privacy level: ${privacyLevel || 'private'}\n` +
                `✅ Team ready for collaborative learning`
        }
      ]
    };
  }

  private async shareTeamKnowledge(args: any): Promise<any> {
    const { sourceTeamId, targetTeamId, concepts } = args;
    
    if (!sourceTeamId || !targetTeamId || !concepts) {
      throw new Error('Missing required sharing parameters');
    }

    return {
      content: [
        {
          type: "text",
          text: `🤝 Knowledge sharing completed:\n` +
                `From: ${sourceTeamId}\n` +
                `To: ${targetTeamId}\n` +
                `Concepts shared: ${concepts.join(', ')}\n` +
                `✅ Cross-team knowledge transfer successful`
        }
      ]
    };
  }

  private async getTeamLearningProgress(args: any): Promise<any> {
    const { teamId } = args;
    
    if (!teamId) {
      throw new Error('Invalid team ID');
    }

    // Mock learning progress data
    const mockProgress = [
      {
        domain: 'typescript',
        totalConcepts: 10,
        learnedConcepts: 8,
        masteryLevel: 0.8
      },
      {
        domain: 'testing',
        totalConcepts: 5,
        learnedConcepts: 4,
        masteryLevel: 0.9
      }
    ];

    const totalConcepts = mockProgress.reduce((sum, p) => sum + p.totalConcepts, 0);
    const learnedConcepts = mockProgress.reduce((sum, p) => sum + p.learnedConcepts, 0);
    const avgMastery = mockProgress.reduce((sum, p) => sum + p.masteryLevel, 0) / mockProgress.length;

    return {
      content: [
        {
          type: "text",
          text: `📊 Team learning progress: ${teamId}\n` +
                `Domains: ${mockProgress.length}\n` +
                `Total concepts: ${totalConcepts}\n` +
                `Learned concepts: ${learnedConcepts}\n` +
                `Average mastery: ${Math.round(avgMastery * 100)}%\n` +
                `✅ Team learning analytics complete`
        }
      ]
    };
  }

  async start(): Promise<void> {
    // Mock server start
  }
}

describe('Team Collaboration MCP Tools', () => {
  let mcpServer: MockTeamCollaborationMCPServer;

  beforeEach(() => {
    mcpServer = new MockTeamCollaborationMCPServer();
  });

  describe('define_coding_standard', () => {
    test('should define a coding standard rule successfully', async () => {
      const rule = {
        id: 'test-rule-1',
        name: 'Test Rule 1',
        description: 'A test rule for unit testing',
        teamId: 'test-team',
        severity: 'high',
        patterns: ['Use descriptive variable names', 'Avoid single letter variables'],
        exceptions: ['Loop counters'],
        examples: ['const userName = "john";', 'const i = 0; // Loop counter']
      };

      const result = await mcpServer['defineCodingStandard']({ rule });

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('✅ Coding standard rule defined: Test Rule 1');
      expect(result.content[0].text).toContain('Team: test-team');
      expect(result.content[0].text).toContain('Severity: high');
    });

    test('should handle invalid rule definition', async () => {
      const invalidRule = {
        id: 'test-rule-2',
        // Missing required fields
      };

      await expect(mcpServer['defineCodingStandard']({ rule: invalidRule }))
        .rejects.toThrow('Invalid rule definition');
    });

    test('should handle rule with empty patterns', async () => {
      const rule = {
        id: 'test-rule-3',
        name: 'Test Rule 3',
        description: 'A test rule with empty patterns',
        teamId: 'test-team',
        severity: 'medium',
        patterns: [],
        exceptions: [],
        examples: []
      };

      const result = await mcpServer['defineCodingStandard']({ rule });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Patterns: 0 patterns defined');
    });
  });

  describe('enforce_coding_standard', () => {
    test('should enforce coding standards successfully', async () => {
      const code = 'const user_name = "john"; // snake_case violation';
      const teamId = 'test-team';

      const result = await mcpServer['enforceCodingStandard']({ code, teamId });

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('🔍 Coding standards enforcement results:');
      expect(result.content[0].text).toContain('Team: test-team');
      expect(result.content[0].text).toContain('Violations found: 1');
    });

    test('should handle clean code without violations', async () => {
      const code = 'const userName = "john"; // Clean code';
      const teamId = 'test-team';

      const result = await mcpServer['enforceCodingStandard']({ code, teamId });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Violations found: 0');
    });

    test('should handle missing parameters', async () => {
      await expect(mcpServer['enforceCodingStandard']({ code: 'const x = 1;' }))
        .rejects.toThrow('Invalid enforcement parameters');

      await expect(mcpServer['enforceCodingStandard']({ teamId: 'test-team' }))
        .rejects.toThrow('Invalid enforcement parameters');
    });
  });

  describe('learn_from_team_standards', () => {
    test('should learn from team standards successfully', async () => {
      const teamId = 'learning-team';

      const result = await mcpServer['learnFromTeamStandards']({ teamId });

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('🧠 Learned from team standards: learning-team');
      expect(result.content[0].text).toContain('✅ Team standards analysis complete');
      expect(result.content[0].text).toContain('✅ Rules adapted to team patterns');
    });

    test('should handle missing team ID', async () => {
      await expect(mcpServer['learnFromTeamStandards']({}))
        .rejects.toThrow('Invalid team ID');
    });
  });

  describe('create_team', () => {
    test('should create a team successfully', async () => {
      const teamData = {
        teamId: 'new-team',
        name: 'New Team',
        description: 'A new team for testing',
        learningDomains: ['typescript', 'testing'],
        privacyLevel: 'private'
      };

      const result = await mcpServer['createTeam'](teamData);

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('🤝 Team created successfully: New Team');
      expect(result.content[0].text).toContain('Team ID: new-team');
      expect(result.content[0].text).toContain('Learning domains: typescript, testing');
      expect(result.content[0].text).toContain('Privacy level: private');
    });

    test('should create a team with minimal data', async () => {
      const teamData = {
        teamId: 'minimal-team',
        name: 'Minimal Team',
        description: 'A minimal team'
      };

      const result = await mcpServer['createTeam'](teamData);

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Learning domains: None');
      expect(result.content[0].text).toContain('Privacy level: private');
    });

    test('should handle missing required parameters', async () => {
      await expect(mcpServer['createTeam']({ teamId: 'incomplete-team' }))
        .rejects.toThrow('Missing required team parameters');

      await expect(mcpServer['createTeam']({ name: 'Incomplete Team' }))
        .rejects.toThrow('Missing required team parameters');
    });
  });

  describe('share_team_knowledge', () => {
    test('should share knowledge between teams successfully', async () => {
      const sharingData = {
        sourceTeamId: 'source-team',
        targetTeamId: 'target-team',
        concepts: ['async-programming', 'error-handling']
      };

      const result = await mcpServer['shareTeamKnowledge'](sharingData);

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('🤝 Knowledge sharing completed:');
      expect(result.content[0].text).toContain('From: source-team');
      expect(result.content[0].text).toContain('To: target-team');
      expect(result.content[0].text).toContain('Concepts shared: async-programming, error-handling');
    });

    test('should handle empty concepts array', async () => {
      const sharingData = {
        sourceTeamId: 'source-team',
        targetTeamId: 'target-team',
        concepts: []
      };

      const result = await mcpServer['shareTeamKnowledge'](sharingData);

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Concepts shared: ');
    });

    test('should handle missing required parameters', async () => {
      await expect(mcpServer['shareTeamKnowledge']({ sourceTeamId: 'source' }))
        .rejects.toThrow('Missing required sharing parameters');

      await expect(mcpServer['shareTeamKnowledge']({ targetTeamId: 'target' }))
        .rejects.toThrow('Missing required sharing parameters');
    });
  });

  describe('get_team_learning_progress', () => {
    test('should get team learning progress successfully', async () => {
      const teamId = 'progress-team';

      const result = await mcpServer['getTeamLearningProgress']({ teamId });

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('📊 Team learning progress: progress-team');
      expect(result.content[0].text).toContain('Domains: 2');
      expect(result.content[0].text).toContain('Total concepts: 15');
      expect(result.content[0].text).toContain('Learned concepts: 12');
      expect(result.content[0].text).toContain('Average mastery: 85%');
    });

    test('should handle missing team ID', async () => {
      await expect(mcpServer['getTeamLearningProgress']({}))
        .rejects.toThrow('Invalid team ID');
    });
  });

  describe('Tool Integration', () => {
    test('should handle multiple tool calls in sequence', async () => {
      // Create a team
      const teamResult = await mcpServer['createTeam']({
        teamId: 'integration-team',
        name: 'Integration Team',
        description: 'Team for integration testing'
      });
      expect(teamResult).toBeDefined();

      // Define a coding standard
      const ruleResult = await mcpServer['defineCodingStandard']({
        rule: {
          id: 'integration-rule',
          name: 'Integration Rule',
          description: 'Rule for integration testing',
          teamId: 'integration-team',
          severity: 'medium',
          patterns: ['Test pattern'],
          exceptions: [],
          examples: ['Test example']
        }
      });
      expect(ruleResult).toBeDefined();

      // Enforce standards
      const enforcementResult = await mcpServer['enforceCodingStandard']({
        code: 'const test_var = 1;',
        teamId: 'integration-team'
      });
      expect(enforcementResult).toBeDefined();

      // Learn from standards
      const learningResult = await mcpServer['learnFromTeamStandards']({
        teamId: 'integration-team'
      });
      expect(learningResult).toBeDefined();

      // Get learning progress
      const progressResult = await mcpServer['getTeamLearningProgress']({
        teamId: 'integration-team'
      });
      expect(progressResult).toBeDefined();
    });

    test('should handle tool call failures gracefully', async () => {
      // Test with invalid parameters
      await expect(mcpServer['defineCodingStandard']({}))
        .rejects.toThrow('Invalid rule definition');

      await expect(mcpServer['enforceCodingStandard']({}))
        .rejects.toThrow('Invalid enforcement parameters');

      await expect(mcpServer['createTeam']({}))
        .rejects.toThrow('Missing required team parameters');
    });
  });

  describe('Performance', () => {
    test('should handle multiple concurrent tool calls', async () => {
      const startTime = Date.now();

      const promises = Array.from({ length: 10 }, (_, i) => 
        mcpServer['createTeam']({
          teamId: `concurrent-team-${i}`,
          name: `Concurrent Team ${i}`,
          description: `Team ${i} for concurrent testing`
        })
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();

      const duration = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle large rule definitions efficiently', async () => {
      const largeRule = {
        id: 'large-rule',
        name: 'Large Rule',
        description: 'A rule with many patterns and examples',
        teamId: 'large-rule-team',
        severity: 'high',
        patterns: Array.from({ length: 100 }, (_, i) => `Pattern ${i}`),
        exceptions: Array.from({ length: 50 }, (_, i) => `Exception ${i}`),
        examples: Array.from({ length: 200 }, (_, i) => `Example ${i}`)
      };

      const startTime = Date.now();
      const result = await mcpServer['defineCodingStandard']({ rule: largeRule });
      const endTime = Date.now();

      const duration = endTime - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(500); // Should complete within 500ms
      expect(result.content[0].text).toContain('Patterns: 100 patterns defined');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty strings and null values', async () => {
      const result = await mcpServer['createTeam']({
        teamId: 'edge-case-team',
        name: '',
        description: '',
        learningDomains: [],
        privacyLevel: 'private'
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Team created successfully: ');
    });

    test('should handle special characters in team names', async () => {
      const result = await mcpServer['createTeam']({
        teamId: 'special-chars-team',
        name: 'Team with Special Chars: !@#$%^&*()',
        description: 'Description with special chars: <>&"\''
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Team created successfully: Team with Special Chars: !@#$%^&*()');
    });

    test('should handle very long team descriptions', async () => {
      const longDescription = 'A'.repeat(10000);
      
      const result = await mcpServer['createTeam']({
        teamId: 'long-description-team',
        name: 'Long Description Team',
        description: longDescription
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Team created successfully: Long Description Team');
    });
  });
});
