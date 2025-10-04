#!/usr/bin/env node

/**
 * Agentic Coding Interface for Obsidian
 * 
 * Provides high-level interfaces for agentic coding operations using H²GNN
 */

import { App, Notice, TFile } from 'obsidian';
import { H2GNNClient, H2GNNConfig, H2GNNResponse } from './h2gnn-client';

export interface AgenticCodingConfig {
  h2gnnConfig: H2GNNConfig;
  autoConnect: boolean;
  learningSessionName: string;
  focusDomain: string;
}

export interface CodeGenerationRequest {
  context: string;
  requirements: string;
  language: string;
  framework?: string;
  includeTests?: boolean;
  includeComments?: boolean;
}

export interface DocumentationRequest {
  codebasePath: string;
  outputFormat: string;
  targetAudience: string;
  detailLevel: string;
  includeExamples?: boolean;
  includeDiagrams?: boolean;
}

export interface RefactoringRequest {
  code: string;
  refactoringType: string;
  language: string;
  autoApply?: boolean;
}

export class AgenticCodingInterface {
  private app: App;
  private h2gnnClient: H2GNNClient;
  private config: AgenticCodingConfig;
  private isInitialized: boolean = false;

  constructor(app: App, config: AgenticCodingConfig) {
    this.app = app;
    this.config = config;
    this.h2gnnClient = new H2GNNClient(config.h2gnnConfig);
  }

  /**
   * Initialize the agentic coding interface
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Agentic Coding Interface...');
      
      if (this.config.autoConnect) {
        try {
          await this.h2gnnClient.connect();
        } catch (error) {
          console.warn('⚠️ Failed to connect to H²GNN servers, continuing in offline mode:', error);
          // Continue without MCP servers - plugin can still work with basic functionality
        }
      }

      // Try to initialize enhanced H²GNN for learning (optional)
      try {
        await this.h2gnnClient.initializeEnhancedH2GNN({
          embeddingDim: 64,
          numLayers: 3,
          curvature: -1,
          storagePath: './persistence',
          maxMemories: 10000,
          consolidationThreshold: 100
        });

        // Start learning session
        await this.h2gnnClient.startLearningSession(
          this.config.learningSessionName,
          this.config.focusDomain
        );
      } catch (error) {
        console.warn('⚠️ Failed to initialize enhanced H²GNN learning, continuing without learning features:', error);
      }

      this.isInitialized = true;
      new Notice('✅ Agentic Coding Interface initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Agentic Coding Interface:', error);
      // Don't throw error, allow plugin to work in limited mode
      this.isInitialized = true;
      new Notice('⚠️ Agentic Coding Interface initialized in limited mode');
    }
  }

  /**
   * Check if H²GNN servers are available
   */
  private isH2GNNAvailable(): boolean {
    return this.h2gnnClient.getConnectionStatus();
  }

  /**
   * Generate code from context and requirements
   */
  async generateCode(request: CodeGenerationRequest): Promise<H2GNNResponse> {
    if (!this.isInitialized) {
      throw new Error('Interface not initialized');
    }

    if (!this.isH2GNNAvailable()) {
      return {
        success: false,
        error: 'H²GNN servers not available. Please check connection.',
        timestamp: Date.now()
      };
    }

    try {
      new Notice('🤖 Generating code with H²GNN...');
      
      const result = await this.h2gnnClient.generateCodeFromContext(
        request.context,
        request.requirements,
        request.language
      );

      if (result.success) {
        new Notice('✅ Code generated successfully');
        
        // Learn from the generation process
        await this.h2gnnClient.learnConcept('code_generation', {
          context: request.context,
          requirements: request.requirements,
          language: request.language,
          result: result.data
        }, {
          domain: 'coding',
          complexity: this.assessComplexity(request.context),
          patterns: this.extractPatterns(request.context)
        }, 0.8);
      } else {
        new Notice(`❌ Code generation failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('Code generation error:', error);
      throw error;
    }
  }

  /**
   * Generate documentation from codebase
   */
  async generateDocumentation(request: DocumentationRequest): Promise<H2GNNResponse> {
    if (!this.isInitialized) {
      throw new Error('Interface not initialized');
    }

    try {
      new Notice('📚 Generating documentation with H²GNN...');
      
      const result = await this.h2gnnClient.generateDocumentationFromCode(
        request.codebasePath,
        request.outputFormat
      );

      if (result.success) {
        new Notice('✅ Documentation generated successfully');
        
        // Learn from the documentation process
        await this.h2gnnClient.learnConcept('documentation_generation', {
          codebasePath: request.codebasePath,
          outputFormat: request.outputFormat,
          targetAudience: request.targetAudience,
          result: result.data
        }, {
          domain: 'documentation',
          complexity: this.assessComplexity(request.codebasePath),
          patterns: this.extractPatterns(request.codebasePath)
        }, 0.7);
      } else {
        new Notice(`❌ Documentation generation failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('Documentation generation error:', error);
      throw error;
    }
  }

  /**
   * Perform code refactoring
   */
  async performRefactoring(request: RefactoringRequest): Promise<H2GNNResponse> {
    if (!this.isInitialized) {
      throw new Error('Interface not initialized');
    }

    try {
      new Notice('🔧 Performing refactoring with H²GNN...');
      
      const result = await this.h2gnnClient.performCodeRefactoring(
        request.code,
        request.refactoringType,
        request.language
      );

      if (result.success) {
        new Notice('✅ Refactoring completed successfully');
        
        // Learn from the refactoring process
        await this.h2gnnClient.learnConcept('code_refactoring', {
          originalCode: request.code,
          refactoringType: request.refactoringType,
          language: request.language,
          result: result.data
        }, {
          domain: 'refactoring',
          complexity: this.assessComplexity(request.code),
          patterns: this.extractPatterns(request.code)
        }, 0.9);
      } else {
        new Notice(`❌ Refactoring failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('Refactoring error:', error);
      throw error;
    }
  }

  /**
   * Analyze code using LSP/AST
   */
  async analyzeCode(code: string, language: string = 'typescript', filePath?: string): Promise<H2GNNResponse> {
    if (!this.isInitialized) {
      throw new Error('Interface not initialized');
    }

    try {
      new Notice('🔍 Analyzing code with H²GNN...');
      
      const result = await this.h2gnnClient.advancedCodeAnalysis(code, language, filePath);

      if (result.success) {
        new Notice('✅ Code analysis completed');
        
        // Learn from the analysis
        await this.h2gnnClient.learnConcept('code_analysis', {
          code,
          language,
          filePath,
          analysis: result.data
        }, {
          domain: 'analysis',
          complexity: this.assessComplexity(code),
          patterns: this.extractPatterns(code)
        }, 0.6);
      } else {
        new Notice(`❌ Code analysis failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('Code analysis error:', error);
      throw error;
    }
  }

  /**
   * Get code completion suggestions
   */
  async getCodeCompletion(code: string, position: { line: number; character: number }, language: string = 'typescript'): Promise<H2GNNResponse> {
    if (!this.isInitialized) {
      throw new Error('Interface not initialized');
    }

    try {
      const result = await this.h2gnnClient.provideCompletion(code, position, language);
      
      if (result.success) {
        // Learn from completion usage
        await this.h2gnnClient.learnConcept('code_completion', {
          code,
          position,
          language,
          suggestions: result.data
        }, {
          domain: 'completion',
          complexity: this.assessComplexity(code),
          patterns: this.extractPatterns(code)
        }, 0.5);
      }

      return result;
    } catch (error) {
      console.error('Code completion error:', error);
      throw error;
    }
  }

  /**
   * Query knowledge graph for insights
   */
  async queryKnowledgeGraph(query: string, type: string = 'similarity', limit: number = 10): Promise<H2GNNResponse> {
    if (!this.isInitialized) {
      throw new Error('Interface not initialized');
    }

    try {
      new Notice('🧠 Querying knowledge graph...');
      
      const result = await this.h2gnnClient.queryKnowledgeGraph(query, type, limit);

      if (result.success) {
        new Notice('✅ Knowledge graph query completed');
      } else {
        new Notice(`❌ Knowledge graph query failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('Knowledge graph query error:', error);
      throw error;
    }
  }

  /**
   * Get learning progress
   */
  async getLearningProgress(): Promise<H2GNNResponse> {
    if (!this.isInitialized) {
      throw new Error('Interface not initialized');
    }

    return this.h2gnnClient.getLearningProgress();
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<H2GNNResponse> {
    if (!this.isInitialized) {
      throw new Error('Interface not initialized');
    }

    return this.h2gnnClient.getSystemStatus();
  }

  /**
   * Consolidate learning memories
   */
  async consolidateMemories(): Promise<H2GNNResponse> {
    if (!this.isInitialized) {
      throw new Error('Interface not initialized');
    }

    try {
      new Notice('🧠 Consolidating learning memories...');
      
      const result = await this.h2gnnClient.consolidateMemories();

      if (result.success) {
        new Notice('✅ Memories consolidated successfully');
      } else {
        new Notice(`❌ Memory consolidation failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('Memory consolidation error:', error);
      throw error;
    }
  }

  /**
   * End learning session
   */
  async endLearningSession(): Promise<H2GNNResponse> {
    if (!this.isInitialized) {
      throw new Error('Interface not initialized');
    }

    try {
      new Notice('🏁 Ending learning session...');
      
      const result = await this.h2gnnClient.endLearningSession();

      if (result.success) {
        new Notice('✅ Learning session ended successfully');
        this.isInitialized = false;
      } else {
        new Notice(`❌ Failed to end learning session: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('End learning session error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from H²GNN servers
   */
  async disconnect(): Promise<void> {
    if (this.isInitialized) {
      await this.endLearningSession();
    }
    
    await this.h2gnnClient.disconnect();
    new Notice('🔌 Disconnected from H²GNN servers');
  }

  /**
   * Assess complexity of code/context
   */
  private assessComplexity(input: string): number {
    // Simple complexity assessment based on length and patterns
    const lines = input.split('\n').length;
    const functions = (input.match(/function|class|interface|type/g) || []).length;
    const imports = (input.match(/import|require/g) || []).length;
    
    return Math.min(1, (lines * 0.1 + functions * 0.3 + imports * 0.2) / 10);
  }

  /**
   * Extract patterns from code/context
   */
  private extractPatterns(input: string): string[] {
    const patterns: string[] = [];
    
    // Extract common patterns
    if (input.includes('class ')) patterns.push('class_definition');
    if (input.includes('function ')) patterns.push('function_definition');
    if (input.includes('interface ')) patterns.push('interface_definition');
    if (input.includes('import ')) patterns.push('import_statement');
    if (input.includes('export ')) patterns.push('export_statement');
    if (input.includes('async ')) patterns.push('async_pattern');
    if (input.includes('await ')) patterns.push('await_pattern');
    if (input.includes('try ')) patterns.push('error_handling');
    if (input.includes('catch ')) patterns.push('error_handling');
    if (input.includes('if ')) patterns.push('conditional_logic');
    if (input.includes('for ')) patterns.push('iteration');
    if (input.includes('while ')) patterns.push('iteration');
    
    return patterns;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.h2gnnClient.getConnectionStatus();
  }

  /**
   * Get available servers
   */
  getAvailableServers(): string[] {
    return this.h2gnnClient.getAvailableServers();
  }
}
