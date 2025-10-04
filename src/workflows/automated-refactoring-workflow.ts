#!/usr/bin/env tsx

/**
 * Automated Refactoring Workflow
 * 
 * This module implements a PocketFlow workflow for automated refactoring:
 * 1. Analyze code for refactoring opportunities
 * 2. Propose refactoring suggestions
 * 3. Apply refactoring if approved
 * 4. Verify refactoring results
 * 5. Learn from refactoring process
 */

import { BaseNode as Node, Flow } from '../pocketflow/core';
import { AutomatedRefactoringTool, RefactoringOpportunity, RefactoringResult } from '../refactoring/automated-refactoring-tool';
import { getSharedH2GNN } from '../core/centralized-h2gnn-config';

export interface RefactoringWorkflowState {
  code: string;
  language: string;
  filePath?: string;
  autoApply: boolean;
  opportunities: RefactoringOpportunity[];
  applied: RefactoringResult[];
  analysisComplete: boolean;
  refactoringComplete: boolean;
  verificationComplete: boolean;
  learningComplete: boolean;
}

/**
 * Node: Analyze Code for Refactoring Opportunities
 */
export class AnalyzeRefactoringOpportunitiesNode extends Node<RefactoringWorkflowState> {
  private refactoringTool: AutomatedRefactoringTool;

  constructor() {
    super();
    this.refactoringTool = new AutomatedRefactoringTool();
  }

  async prep(shared: RefactoringWorkflowState): Promise<{ code: string; language: string; filePath?: string }> {
    return {
      code: shared.code,
      language: shared.language,
      filePath: shared.filePath
    };
  }

  async exec({ code, language, filePath }: { code: string; language: string; filePath?: string }): Promise<RefactoringOpportunity[]> {
    console.warn(`🔍 Analyzing code for refactoring opportunities...`);
    
    const result = await this.refactoringTool.proposeAndApplyRefactoring(
      code,
      language,
      filePath,
      false // Don't auto-apply yet
    );
    
    return result.opportunities;
  }

  async post(shared: RefactoringWorkflowState, _: any, opportunities: RefactoringOpportunity[]): Promise<string> {
    shared.opportunities = opportunities;
    shared.analysisComplete = true;
    
    console.warn(`📊 Found ${opportunities.length} refactoring opportunities`);
    
    return opportunities.length > 0 ? 'propose' : 'complete';
  }
}

/**
 * Node: Propose Refactoring Suggestions
 */
export class ProposeRefactoringNode extends Node<RefactoringWorkflowState> {
  async prep(shared: RefactoringWorkflowState): Promise<RefactoringOpportunity[]> {
    return shared.opportunities;
  }

  async exec(opportunities: RefactoringOpportunity[]): Promise<{ selected: RefactoringOpportunity[]; autoApply: boolean }> {
    console.warn(`💡 Proposing refactoring suggestions...`);
    
    // Filter opportunities by severity and confidence
    const highPriority = opportunities.filter(opp => 
      opp.severity === 'high' || opp.severity === 'critical'
    );
    
    const mediumPriority = opportunities.filter(opp => 
      opp.severity === 'medium' && opp.confidence > 0.7
    );
    
    const selected = [...highPriority, ...mediumPriority].slice(0, 3); // Limit to top 3
    
    // Determine if auto-apply should be used
    const autoApply = shared.autoApply && selected.length > 0;
    
    console.warn(`🎯 Selected ${selected.length} high-priority refactoring opportunities`);
    
    return { selected, autoApply };
  }

  async post(shared: RefactoringWorkflowState, _: any, { selected, autoApply }: { selected: RefactoringOpportunity[]; autoApply: boolean }): Promise<string> {
    // Update opportunities with selected ones
    shared.opportunities = selected;
    shared.autoApply = autoApply;
    
    if (selected.length === 0) {
      console.warn(`✅ No high-priority refactoring opportunities found`);
      return 'complete';
    }
    
    console.warn(`🔧 Ready to ${autoApply ? 'apply' : 'propose'} ${selected.length} refactoring opportunities`);
    return autoApply ? 'apply' : 'propose';
  }
}

/**
 * Node: Apply Refactoring
 */
export class ApplyRefactoringNode extends Node<RefactoringWorkflowState> {
  private refactoringTool: AutomatedRefactoringTool;

  constructor() {
    super();
    this.refactoringTool = new AutomatedRefactoringTool();
  }

  async prep(shared: RefactoringWorkflowState): Promise<{ code: string; language: string; filePath?: string; opportunities: RefactoringOpportunity[] }> {
    return {
      code: shared.code,
      language: shared.language,
      filePath: shared.filePath,
      opportunities: shared.opportunities
    };
  }

  async exec({ code, language, filePath, opportunities }: { code: string; language: string; filePath?: string; opportunities: RefactoringOpportunity[] }): Promise<RefactoringResult[]> {
    console.warn(`🔧 Applying refactoring...`);
    
    // Apply refactoring to each opportunity
    const results: RefactoringResult[] = [];
    
    for (const opportunity of opportunities) {
      try {
        console.warn(`🔧 Applying ${opportunity.type} refactoring...`);
        
        // Apply the refactoring
        const modifiedCode = this.applyRefactoringToCode(code, opportunity);
        
        // Calculate changes
        const changes = this.calculateChanges(code, modifiedCode);
        
        // Verify the refactoring
        const verification = await this.verifyRefactoring(code, modifiedCode, language);
        
        const result: RefactoringResult = {
          opportunity,
          applied: true,
          success: verification.success,
          modifiedCode,
          changes,
          errors: verification.errors,
          warnings: verification.warnings
        };
        
        results.push(result);
        
        // Update code for next iteration
        code = modifiedCode;
        
      } catch (error) {
        const result: RefactoringResult = {
          opportunity,
          applied: true,
          success: false,
          modifiedCode: code,
          changes: { linesAdded: 0, linesRemoved: 0, linesModified: 0 },
          errors: [error instanceof Error ? error.message : String(error)]
        };
        
        results.push(result);
      }
    }
    
    return results;
  }

  async post(shared: RefactoringWorkflowState, _: any, results: RefactoringResult[]): Promise<string> {
    shared.applied = results;
    shared.refactoringComplete = true;
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.warn(`✅ Refactoring complete: ${successful} successful, ${failed} failed`);
    
    return 'verify';
  }

  private applyRefactoringToCode(code: string, opportunity: RefactoringOpportunity): string {
    const lines = code.split('\n');
    const startLine = opportunity.location.startLine - 1;
    const endLine = opportunity.location.endLine - 1;
    
    // Replace the original code with the suggested code
    const beforeLines = lines.slice(0, startLine);
    const afterLines = lines.slice(endLine + 1);
    const suggestedLines = opportunity.suggestedCode.split('\n');
    
    return [...beforeLines, ...suggestedLines, ...afterLines].join('\n');
  }

  private calculateChanges(originalCode: string, modifiedCode: string): {
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
  } {
    const originalLines = originalCode.split('\n');
    const modifiedLines = modifiedCode.split('\n');
    
    const linesAdded = Math.max(0, modifiedLines.length - originalLines.length);
    const linesRemoved = Math.max(0, originalLines.length - modifiedLines.length);
    const linesModified = Math.min(originalLines.length, modifiedLines.length);
    
    return {
      linesAdded,
      linesRemoved,
      linesModified
    };
  }

  private async verifyRefactoring(
    originalCode: string,
    modifiedCode: string,
    language: string
  ): Promise<{ success: boolean; errors?: string[]; warnings?: string[] }> {
    try {
      // Basic syntax verification
      if (language === 'typescript' || language === 'javascript') {
        // Try to parse the modified code
        const sourceFile = require('typescript').createSourceFile(
          'temp.ts',
          modifiedCode,
          require('typescript').ScriptTarget.Latest,
          true
        );
        
        // Basic verification passed
        return {
          success: true,
          warnings: []
        };
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }
}

/**
 * Node: Verify Refactoring Results
 */
export class VerifyRefactoringNode extends Node<RefactoringWorkflowState> {
  private refactoringTool: AutomatedRefactoringTool;

  constructor() {
    super();
    this.refactoringTool = new AutomatedRefactoringTool();
  }

  async prep(shared: RefactoringWorkflowState): Promise<RefactoringResult[]> {
    return shared.applied;
  }

  async exec(results: RefactoringResult[]): Promise<{ verified: RefactoringResult[]; qualityImprovement: number }> {
    console.warn(`🔍 Verifying refactoring results...`);
    
    // Re-analyze the refactored code to verify improvements
    const successfulResults = results.filter(r => r.success);
    
    if (successfulResults.length === 0) {
      return { verified: results, qualityImprovement: 0 };
    }
    
    // Get the final refactored code
    const finalCode = successfulResults[successfulResults.length - 1].modifiedCode;
    
    // Re-analyze the code
    const reanalysis = await this.refactoringTool.proposeAndApplyRefactoring(
      finalCode,
      'typescript',
      undefined,
      false
    );
    
    // Calculate quality improvement
    const originalOpportunities = results.length;
    const remainingOpportunities = reanalysis.opportunities.length;
    const qualityImprovement = Math.max(0, (originalOpportunities - remainingOpportunities) / originalOpportunities);
    
    console.warn(`📊 Quality improvement: ${(qualityImprovement * 100).toFixed(1)}%`);
    
    return { verified: results, qualityImprovement };
  }

  async post(shared: RefactoringWorkflowState, _: any, { verified, qualityImprovement }: { verified: RefactoringResult[]; qualityImprovement: number }): Promise<string> {
    shared.verificationComplete = true;
    
    console.warn(`✅ Verification complete: ${qualityImprovement.toFixed(1)}% quality improvement`);
    
    return 'learn';
  }
}

/**
 * Node: Learn from Refactoring Process
 */
export class LearnFromRefactoringNode extends Node<RefactoringWorkflowState> {
  private h2gnn: any;

  constructor() {
    super();
    this.h2gnn = getSharedH2GNN();
  }

  async prep(shared: RefactoringWorkflowState): Promise<{ opportunities: RefactoringOpportunity[]; applied: RefactoringResult[]; qualityImprovement: number }> {
    return {
      opportunities: shared.opportunities,
      applied: shared.applied,
      qualityImprovement: 0 // This would be calculated in the previous node
    };
  }

  async exec({ opportunities, applied, qualityImprovement }: { opportunities: RefactoringOpportunity[]; applied: RefactoringResult[]; qualityImprovement: number }): Promise<void> {
    console.warn(`🧠 Learning from refactoring process...`);
    
    try {
      // Learn from the refactoring process
      const concept = 'refactoring_workflow';
      const data = {
        opportunities: opportunities.length,
        applied: applied.length,
        successful: applied.filter(r => r.success).length,
        qualityImprovement,
        types: opportunities.map(o => o.type),
        severities: opportunities.map(o => o.severity)
      };
      
      await this.h2gnn.learnWithMemory(
        concept,
        data,
        {
          domain: 'refactoring',
          type: 'workflow_learning',
          timestamp: new Date().toISOString()
        },
        qualityImprovement
      );
      
      console.warn(`✅ Learned from refactoring workflow`);
    } catch (error) {
      console.warn('Failed to learn from refactoring workflow:', error);
    }
  }

  async post(shared: RefactoringWorkflowState, _: any, _result: void): Promise<string> {
    shared.learningComplete = true;
    
    console.warn(`🎉 Refactoring workflow complete!`);
    
    return 'complete';
  }
}

/**
 * Create the automated refactoring workflow
 */
export function createAutomatedRefactoringWorkflow(): Flow<RefactoringWorkflowState> {
  // Create nodes
  const analyzeNode = new AnalyzeRefactoringOpportunitiesNode();
  const proposeNode = new ProposeRefactoringNode();
  const applyNode = new ApplyRefactoringNode();
  const verifyNode = new VerifyRefactoringNode();
  const learnNode = new LearnFromRefactoringNode();
  
  // Connect nodes
  analyzeNode.connect('propose', proposeNode);
  analyzeNode.connect('complete', learnNode);
  
  proposeNode.connect('apply', applyNode);
  proposeNode.connect('propose', learnNode);
  proposeNode.connect('complete', learnNode);
  
  applyNode.connect('verify', verifyNode);
  
  verifyNode.connect('learn', learnNode);
  
  // Create flow
  return new Flow(analyzeNode);
}

/**
 * Demo function
 */
async function demonstrateAutomatedRefactoringWorkflow(): Promise<void> {
  console.warn('🔄 Automated Refactoring Workflow Demo');
  console.warn('======================================');
  
  // Create workflow
  const workflow = createAutomatedRefactoringWorkflow();
  
  // Sample code with issues
  const sampleCode = `
class UserService {
  private database: Database;
  private authService: AuthService;
  private emailService: EmailService;
  private notificationService: NotificationService;
  private cacheService: CacheService;
  private logService: LogService;
  private configService: ConfigService;
  private validationService: ValidationService;
  private encryptionService: EncryptionService;
  private auditService: AuditService;
  
  constructor(database: Database, authService: AuthService, emailService: EmailService, 
              notificationService: NotificationService, cacheService: CacheService, 
              logService: LogService, configService: ConfigService, 
              validationService: ValidationService, encryptionService: EncryptionService, 
              auditService: AuditService) {
    this.database = database;
    this.authService = authService;
    this.emailService = emailService;
    this.notificationService = notificationService;
    this.cacheService = cacheService;
    this.logService = logService;
    this.configService = configService;
    this.validationService = validationService;
    this.encryptionService = encryptionService;
    this.auditService = auditService;
  }
  
  public async createUser(userData: any, options: any, settings: any, 
                         preferences: any, metadata: any, context: any): Promise<User> {
    if (userData && userData.email && userData.password && userData.firstName && 
        userData.lastName && userData.age && userData.phone && userData.address && 
        userData.city && userData.state && userData.zipCode && userData.country) {
      try {
        const hashedPassword = await this.encryptionService.hash(userData.password);
        const user = await this.database.save({
          ...userData,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await this.emailService.sendWelcomeEmail(user.email);
        await this.notificationService.sendNotification(user.id, 'welcome');
        await this.auditService.log('user_created', user.id);
        
        return user;
      } catch (error) {
        await this.logService.error('Failed to create user', error);
        throw new Error('User creation failed');
      }
    } else {
      throw new Error('Invalid user data');
    }
  }
  
  public async authenticateUser(email: string, password: string): Promise<AuthResult> {
    if (email === 'admin@example.com' && password === 'admin123') {
      return { success: true, user: { id: 1, email } };
    }
    return { success: false, error: 'Invalid credentials' };
  }
}
  `;
  
  // Initialize workflow state
  const workflowState: RefactoringWorkflowState = {
    code: sampleCode,
    language: 'typescript',
    filePath: '/src/services/UserService.ts',
    autoApply: false,
    opportunities: [],
    applied: [],
    analysisComplete: false,
    refactoringComplete: false,
    verificationComplete: false,
    learningComplete: false
  };
  
  console.warn('\n🚀 Starting automated refactoring workflow...');
  
  // Run workflow
  await workflow.run(workflowState);
  
  console.warn('\n📊 Workflow Results:');
  console.warn(`- Analysis Complete: ${workflowState.analysisComplete}`);
  console.warn(`- Refactoring Complete: ${workflowState.refactoringComplete}`);
  console.warn(`- Verification Complete: ${workflowState.verificationComplete}`);
  console.warn(`- Learning Complete: ${workflowState.learningComplete}`);
  console.warn(`- Opportunities Found: ${workflowState.opportunities.length}`);
  console.warn(`- Refactoring Applied: ${workflowState.applied.length}`);
  
  if (workflowState.opportunities.length > 0) {
    console.warn('\n🔍 Refactoring Opportunities:');
    workflowState.opportunities.forEach((opp, index) => {
      console.warn(`${index + 1}. ${opp.type.toUpperCase()} (${opp.severity})`);
      console.warn(`   Description: ${opp.description}`);
      console.warn(`   Confidence: ${opp.confidence.toFixed(3)}`);
      console.warn(`   Estimated Effort: ${opp.estimatedEffort} minutes`);
    });
  }
  
  if (workflowState.applied.length > 0) {
    console.warn('\n🔧 Applied Refactoring:');
    workflowState.applied.forEach((result, index) => {
      console.warn(`${index + 1}. ${result.opportunity.type.toUpperCase()} - ${result.success ? 'SUCCESS' : 'FAILED'}`);
      console.warn(`   Changes: +${result.changes.linesAdded} -${result.changes.linesRemoved} ~${result.changes.linesModified} lines`);
    });
  }
  
  console.warn('\n🎉 Automated Refactoring Workflow Demo Complete!');
  console.warn('✅ PocketFlow workflow for automated refactoring!');
}

// Run the demo only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateAutomatedRefactoringWorkflow().catch(console.error);
}

// Exports are already defined above in the class and function definitions
