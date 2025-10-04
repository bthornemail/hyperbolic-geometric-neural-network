#!/usr/bin/env node

/**
 * H²GNN MCP Client for Obsidian
 * 
 * Enhanced client that integrates with H²GNN MCP servers for:
 * - Agentic coding and knowledge generation
 * - Hyperbolic geometric neural network operations
 * - WordNet integration and semantic analysis
 * - Knowledge graph operations
 * - LSP/AST code analysis
 * - Geographic-hyperbolic integration
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

export interface H2GNNConfig {
  h2gnnServerPath: string;
  knowledgeGraphServerPath: string;
  lspAstServerPath: string;
  geometricToolsServerPath: string;
  enhancedH2gnnServerPath: string;
}

export interface H2GNNResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

export interface KnowledgeGraphNode {
  id: string;
  name: string;
  type: string;
  content: string;
  relationships: string[];
  properties: Record<string, any>;
}

export interface HyperbolicEmbedding {
  concept: string;
  embedding: number[];
  distance?: number;
  similarity?: number;
}

export interface LearningSession {
  id: string;
  name: string;
  domain: string;
  progress: number;
  concepts: string[];
  memories: any[];
}

export class H2GNNClient extends EventEmitter {
  private config: H2GNNConfig;
  private servers: Map<string, ChildProcess> = new Map();
  private isConnected: boolean = false;

  constructor(config: H2GNNConfig) {
    super();
    this.config = config;
  }

  /**
   * Initialize and connect to all H²GNN MCP servers
   */
  async connect(): Promise<void> {
    try {
      console.log('🚀 Connecting to H²GNN MCP servers...');
      
      // Start all MCP servers with error handling
      const serverPromises = [
        this.startServer('h2gnn', this.config.h2gnnServerPath),
        this.startServer('knowledge-graph', this.config.knowledgeGraphServerPath),
        this.startServer('lsp-ast', this.config.lspAstServerPath),
        this.startServer('geometric-tools', this.config.geometricToolsServerPath),
        this.startServer('enhanced-h2gnn', this.config.enhancedH2gnnServerPath)
      ];

      // Wait for all servers to start, but don't fail if some fail
      const results = await Promise.allSettled(serverPromises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      if (successful > 0) {
        this.isConnected = true;
        this.emit('connected');
        console.log(`✅ ${successful} H²GNN MCP servers connected successfully`);
        
        if (failed > 0) {
          console.warn(`⚠️ ${failed} servers failed to connect, but continuing with available servers`);
        }
      } else {
        throw new Error('All H²GNN MCP servers failed to connect');
      }
    } catch (error) {
      console.error('❌ Failed to connect to H²GNN servers:', error);
      throw error;
    }
  }

  /**
   * Start a specific MCP server
   */
  private async startServer(name: string, serverPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`Starting ${name} server at ${serverPath}`);
      
      const server = spawn('npx', ['tsx', serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: '/home/main/devops/hyperbolic-geometric-neural-network',
        env: {
          ...process.env,
          H2GNN_DEBUG: 'false',
          H2GNN_HEARTBEAT_INTERVAL: '0',
          H2GNN_SYNC_FREQUENCY: '0'
        }
      });

      let resolved = false;

      server.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log(`${name} server output:`, output);
        
        if (output.includes('running on stdio') || output.includes('MCP server started')) {
          if (!resolved) {
            resolved = true;
            console.log(`✅ ${name} server started`);
            this.servers.set(name, server);
            resolve();
          }
        }
      });

      server.stderr?.on('data', (data) => {
        const error = data.toString();
        console.error(`${name} server error:`, error);
        
        // Don't reject on stderr, just log it
        if (!resolved && error.includes('Error') && !error.includes('warning')) {
          resolved = true;
          reject(new Error(`${name} server error: ${error}`));
        }
      });

      server.on('error', (error) => {
        console.error(`Failed to start ${name} server:`, error);
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });

      server.on('exit', (code) => {
        if (!resolved) {
          resolved = true;
          if (code === 0) {
            console.log(`✅ ${name} server started (exit code 0)`);
            this.servers.set(name, server);
            resolve();
          } else {
            reject(new Error(`${name} server exited with code ${code}`));
          }
        }
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          server.kill();
          reject(new Error(`Timeout starting ${name} server after 15 seconds`));
        }
      }, 15000);
    });
  }

  /**
   * Send a request to an MCP server
   */
  private async sendRequest(serverName: string, method: string, params: any = {}): Promise<H2GNNResponse> {
    if (!this.servers.has(serverName)) {
      throw new Error(`Server ${serverName} not connected`);
    }

    const server = this.servers.get(serverName)!;
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout for ${method}`));
      }, 30000);

      const onData = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === request.id) {
            clearTimeout(timeout);
            server.stdout?.off('data', onData);
            resolve({
              success: !response.error,
              data: response.result,
              error: response.error?.message,
              timestamp: Date.now()
            });
          }
        } catch (error) {
          // Ignore non-JSON responses
        }
      };

      server.stdout?.on('data', onData);
      server.stdin?.write(JSON.stringify(request) + '\n');
    });
  }

  /**
   * H²GNN Core Operations
   */
  async initializeWordNet(maxSynsets: number = 1000, embeddingDim: number = 128): Promise<H2GNNResponse> {
    return this.sendRequest('h2gnn', 'initialize_wordnet', { maxSynsets, embeddingDim });
  }

  async queryWordNet(concept: string, includeHierarchy: boolean = true): Promise<H2GNNResponse> {
    return this.sendRequest('h2gnn', 'query_wordnet', { concept, includeHierarchy });
  }

  async computeHyperbolicDistance(concept1: string, concept2: string): Promise<H2GNNResponse> {
    return this.sendRequest('h2gnn', 'compute_hyperbolic_distance', { concept1, concept2 });
  }

  async runHierarchicalQA(question: string, context: string[] = []): Promise<H2GNNResponse> {
    return this.sendRequest('h2gnn', 'run_hierarchical_qa', { question, context });
  }

  async exploreSemanticSpace(startConcept: string, depth: number = 3, maxResults: number = 10): Promise<H2GNNResponse> {
    return this.sendRequest('h2gnn', 'explore_semantic_space', { startConcept, depth, maxResults });
  }

  async trainConceptEmbeddings(concepts: string[], relationships: any[] = []): Promise<H2GNNResponse> {
    return this.sendRequest('h2gnn', 'train_concept_embeddings', { concepts, relationships });
  }

  async analyzeHierarchy(rootConcept: string): Promise<H2GNNResponse> {
    return this.sendRequest('h2gnn', 'analyze_hierarchy', { rootConcept });
  }

  /**
   * Enhanced H²GNN Learning Operations
   */
  async initializeEnhancedH2GNN(config: any = {}): Promise<H2GNNResponse> {
    return this.sendRequest('enhanced-h2gnn', 'initialize_enhanced_h2gnn_hd', config);
  }

  async learnConcept(concept: string, data: any, context: any = {}, performance: number = 0.5): Promise<H2GNNResponse> {
    return this.sendRequest('enhanced-h2gnn', 'learn_concept_hd', { concept, data, context, performance });
  }

  async retrieveMemories(query: string, maxResults: number = 10): Promise<H2GNNResponse> {
    return this.sendRequest('enhanced-h2gnn', 'retrieve_memories_hd', { query, maxResults });
  }

  async getUnderstandingSnapshot(domain: string): Promise<H2GNNResponse> {
    return this.sendRequest('enhanced-h2gnn', 'get_understanding_snapshot_hd', { domain });
  }

  async getLearningProgress(): Promise<H2GNNResponse> {
    return this.sendRequest('enhanced-h2gnn', 'get_learning_progress_hd', {});
  }

  async startLearningSession(sessionName: string, focusDomain: string = 'general'): Promise<H2GNNResponse> {
    return this.sendRequest('enhanced-h2gnn', 'start_learning_session_hd', { sessionName, focusDomain });
  }

  async endLearningSession(): Promise<H2GNNResponse> {
    return this.sendRequest('enhanced-h2gnn', 'end_learning_session_hd', {});
  }

  async consolidateMemories(): Promise<H2GNNResponse> {
    return this.sendRequest('enhanced-h2gnn', 'consolidate_memories_hd', {});
  }

  async getSystemStatus(): Promise<H2GNNResponse> {
    return this.sendRequest('enhanced-h2gnn', 'get_system_status_hd', {});
  }

  async adaptiveLearning(domain: string, learningRate: number = 0.01): Promise<H2GNNResponse> {
    return this.sendRequest('enhanced-h2gnn', 'adaptive_learning_hd', { domain, learningRate });
  }

  /**
   * Knowledge Graph Operations
   */
  async analyzePathToKnowledgeGraph(path: string, options: any = {}): Promise<H2GNNResponse> {
    return this.sendRequest('knowledge-graph', 'analyze_path_to_knowledge_graph_hd', { path, ...options });
  }

  async generateCodeFromGraph(type: string, description: string, context: any = {}, constraints: any = {}): Promise<H2GNNResponse> {
    return this.sendRequest('knowledge-graph', 'generate_code_from_graph_hd', { type, description, context, constraints });
  }

  async generateDocumentationFromGraph(type: string, scope: string[], format: string, options: any = {}): Promise<H2GNNResponse> {
    return this.sendRequest('knowledge-graph', 'generate_documentation_from_graph_hd', { type, scope, format, options });
  }

  async queryKnowledgeGraph(query: string, type: string = 'similarity', limit: number = 10): Promise<H2GNNResponse> {
    return this.sendRequest('knowledge-graph', 'query_knowledge_graph_hd', { query, type, limit });
  }

  async getGraphVisualization(layout: string = 'force'): Promise<H2GNNResponse> {
    return this.sendRequest('knowledge-graph', 'get_graph_visualization_hd', { layout });
  }

  /**
   * LSP/AST Code Analysis Operations
   */
  async analyzeCodeAST(code: string, language: string = 'typescript', filePath?: string): Promise<H2GNNResponse> {
    return this.sendRequest('lsp-ast', 'analyze_code_ast_hd', { code, language, filePath });
  }

  async provideCompletion(code: string, position: { line: number; character: number }, language: string = 'typescript'): Promise<H2GNNResponse> {
    return this.sendRequest('lsp-ast', 'provide_completion_hd', { code, position, language });
  }

  async provideHover(code: string, position: { line: number; character: number }, language: string = 'typescript'): Promise<H2GNNResponse> {
    return this.sendRequest('lsp-ast', 'provide_hover_hd', { code, position, language });
  }

  async provideDiagnostics(code: string, language: string = 'typescript', filePath?: string): Promise<H2GNNResponse> {
    return this.sendRequest('lsp-ast', 'provide_diagnostics_hd', { code, language, filePath });
  }

  async provideCodeActions(code: string, range: any, language: string = 'typescript'): Promise<H2GNNResponse> {
    return this.sendRequest('lsp-ast', 'provide_code_actions_hd', { code, range, language });
  }

  async advancedCodeAnalysis(code: string, language: string = 'typescript', filePath?: string): Promise<H2GNNResponse> {
    return this.sendRequest('lsp-ast', 'advanced_code_analysis_hd', { code, language, filePath });
  }

  async proposeAndApplyRefactoring(code: string, language: string = 'typescript', filePath?: string, autoApply: boolean = false): Promise<H2GNNResponse> {
    return this.sendRequest('lsp-ast', 'propose_and_apply_refactoring_hd', { code, language, filePath, autoApply });
  }

  /**
   * Geometric Tools Operations
   */
  async getGeoJSONMap(semanticFilter?: string, projectionType: string = 'stereographic', includeHyperbolicMetrics: boolean = true): Promise<H2GNNResponse> {
    return this.sendRequest('geometric-tools', 'get_geojson_map', { semanticFilter, projectionType, includeHyperbolicMetrics });
  }

  async defineGeoConcept(geoJson: any, semanticConcept: string, confidenceThreshold: number = 0.7): Promise<H2GNNResponse> {
    return this.sendRequest('geometric-tools', 'define_geo_concept', { geoJson, semanticConcept, confidenceThreshold });
  }

  async queryHyperbolicGeography(geoPoint: any, maxNeighbors: number = 10, distanceThreshold: number = 1, includeSemanticSimilarity: boolean = true): Promise<H2GNNResponse> {
    return this.sendRequest('geometric-tools', 'query_hyperbolic_geography', { geoPoint, maxNeighbors, distanceThreshold, includeSemanticSimilarity });
  }

  async semanticGeographicSearch(query: string, space: string = 'hyperbolic_geographic', maxResults: number = 20, similarityThreshold: number = 0.5): Promise<H2GNNResponse> {
    return this.sendRequest('geometric-tools', 'semantic_geographic_search', { query, space, maxResults, similarityThreshold });
  }

  async analyzeGeographicClusters(regionBounds?: any, clusterAlgorithm: string = 'hyperbolic_kmeans', minClusterSize: number = 3, includeTopologyAnalysis: boolean = true): Promise<H2GNNResponse> {
    return this.sendRequest('geometric-tools', 'analyze_geographic_clusters', { regionBounds, clusterAlgorithm, minClusterSize, includeTopologyAnalysis });
  }

  async generateGeographicInsights(analysisType: string = 'comprehensive', focusRegion?: any, includeRecommendations: boolean = true): Promise<H2GNNResponse> {
    return this.sendRequest('geometric-tools', 'generate_geographic_insights', { analysisType, focusRegion, includeRecommendations });
  }

  /**
   * Agentic Coding Operations
   */
  async generateCodeFromContext(context: string, requirements: string, language: string = 'typescript'): Promise<H2GNNResponse> {
    // Use knowledge graph to analyze context and generate code
    const analysisResult = await this.analyzePathToKnowledgeGraph(context, { includeContent: true });
    if (!analysisResult.success) {
      return analysisResult;
    }

    return this.generateCodeFromGraph('function', requirements, {
      relatedNodes: analysisResult.data?.nodes || [],
      targetFile: `generated.${language}`,
      style: language,
      framework: 'none'
    }, {
      maxLines: 100,
      includeComments: true,
      includeTests: false
    });
  }

  async generateDocumentationFromCode(codebasePath: string, outputFormat: string = 'markdown'): Promise<H2GNNResponse> {
    // Analyze codebase to create knowledge graph
    const analysisResult = await this.analyzePathToKnowledgeGraph(codebasePath, { 
      includeContent: true,
      filePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.py', '**/*.md']
    });
    
    if (!analysisResult.success) {
      return analysisResult;
    }

    // Generate documentation from the knowledge graph
    return this.generateDocumentationFromGraph('api_docs', 
      analysisResult.data?.nodes || [], 
      outputFormat, 
      {
        includeCodeExamples: true,
        includeArchitectureDiagrams: true,
        targetAudience: 'developer',
        detailLevel: 'high'
      }
    );
  }

  async performCodeRefactoring(code: string, refactoringType: string, language: string = 'typescript'): Promise<H2GNNResponse> {
    // Use LSP/AST analysis to understand code structure
    const analysisResult = await this.advancedCodeAnalysis(code, language);
    if (!analysisResult.success) {
      return analysisResult;
    }

    // Propose and apply refactoring
    return this.proposeAndApplyRefactoring(code, language, undefined, true);
  }

  /**
   * Disconnect from all servers
   */
  async disconnect(): Promise<void> {
    console.log('🔌 Disconnecting from H²GNN servers...');
    
    for (const [name, server] of this.servers) {
      server.kill();
      console.log(`✅ ${name} server disconnected`);
    }
    
    this.servers.clear();
    this.isConnected = false;
    this.emit('disconnected');
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get available servers
   */
  getAvailableServers(): string[] {
    return Array.from(this.servers.keys());
  }
}
