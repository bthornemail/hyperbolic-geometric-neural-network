import * as vscode from 'vscode';
import { MCPClient } from '../mcp/mcpClient';

/**
 * Knowledge Graph Manager for VS Code Extension
 * 
 * Manages knowledge graphs, hyperbolic embeddings, and semantic analysis
 * for the H²GNN PocketFlow VS Code extension.
 */
export class KnowledgeGraphManager {
  private mcpClient: MCPClient;
  private currentGraph: KnowledgeGraph | null = null;
  private documentCache: Map<string, DocumentAnalysis> = new Map();
  private embeddingCache: Map<string, HyperbolicEmbedding> = new Map();
  private changeListener: vscode.Disposable | null = null;

  constructor(mcpClient: MCPClient) {
    this.mcpClient = mcpClient;
  }

  async initialize(): Promise<void> {
    console.log('🧠 Initializing Knowledge Graph Manager');
    
    // Load existing knowledge graph if available
    await this.loadExistingGraph();
    
    // Setup document change monitoring
    this.setupDocumentMonitoring();
    
    console.log('✅ Knowledge Graph Manager initialized');
  }

  /**
   * Analyze entire project and create knowledge graph
   */
  async analyzeProject(projectPath: string): Promise<ProjectAnalysisResult> {
    try {
      console.log(`🔍 Analyzing project: ${projectPath}`);
      
      const result = await this.mcpClient.analyzeProject(projectPath);
      
      // Parse and store the knowledge graph
      this.currentGraph = this.parseKnowledgeGraphResponse(result);
      
      // Update document cache
      await this.updateDocumentCache();
      
      // Notify listeners
      this.notifyGraphUpdated();
      
      return {
        nodeCount: this.currentGraph.nodes.length,
        edgeCount: this.currentGraph.edges.length,
        languages: this.currentGraph.metadata.languages,
        totalFiles: this.currentGraph.metadata.totalFiles,
        totalLines: this.currentGraph.metadata.totalLines,
        avgComplexity: this.currentGraph.metadata.avgComplexity
      };
      
    } catch (error) {
      console.error('❌ Project analysis failed:', error);
      throw new Error(`Project analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Analyze single document
   */
  async analyzeDocument(document: vscode.TextDocument): Promise<DocumentAnalysis> {
    try {
      const filePath = document.fileName;
      
      if (this.documentCache.has(filePath)) {
        const cached = this.documentCache.get(filePath)!;
        
        // Check if document has changed since last analysis
        if (cached.version === document.version) {
          return cached;
        }
      }
      
      console.log(`📄 Analyzing document: ${filePath}`);
      
      // Analyze document structure
      const structure = this.analyzeDocumentStructure(document);
      
      // Generate embeddings for code elements
      const embeddings = await this.generateDocumentEmbeddings(document, structure);
      
      // Find relationships with existing knowledge graph
      const relationships = await this.findDocumentRelationships(document, structure);
      
      const analysis: DocumentAnalysis = {
        filePath,
        version: document.version,
        languageId: document.languageId,
        structure,
        embeddings,
        relationships,
        lastAnalyzed: new Date(),
        complexity: this.calculateComplexity(structure),
        semanticTokens: this.generateSemanticTokens(structure)
      };
      
      // Cache the analysis
      this.documentCache.set(filePath, analysis);
      
      return analysis;
      
    } catch (error) {
      console.error(`❌ Document analysis failed for ${document.fileName}:`, error);
      throw error;
    }
  }

  /**
   * Update document analysis incrementally
   */
  async updateDocument(document: vscode.TextDocument): Promise<void> {
    try {
      // Perform incremental analysis
      const analysis = await this.analyzeDocument(document);
      
      // Update knowledge graph if needed
      if (this.currentGraph) {
        await this.updateGraphWithDocument(analysis);
      }
      
    } catch (error) {
      console.error(`❌ Document update failed for ${document.fileName}:`, error);
    }
  }

  /**
   * Find similar code using hyperbolic embeddings
   */
  async findSimilarCode(codeSnippet: string, limit: number = 10): Promise<SimilarCodeResult[]> {
    try {
      // Generate embedding for the code snippet
      const snippetEmbedding = await this.generateCodeEmbedding(codeSnippet);
      
      // Query knowledge graph for similar code
      const result = await this.mcpClient.queryKnowledgeGraph({
        query: codeSnippet,
        type: 'similarity',
        limit
      });
      
      return this.parseSimilarCodeResults(result, snippetEmbedding);
      
    } catch (error) {
      console.error('❌ Similar code search failed:', error);
      throw error;
    }
  }

  /**
   * Get semantic relationships for a symbol
   */
  async getSemanticRelationships(symbol: string, document: vscode.TextDocument): Promise<SemanticRelationship[]> {
    try {
      // Query knowledge graph for symbol relationships
      const result = await this.mcpClient.queryKnowledgeGraph({
        query: symbol,
        type: 'dependency',
        limit: 20
      });
      
      return this.parseSemanticRelationships(result, symbol, document);
      
    } catch (error) {
      console.error(`❌ Semantic relationship query failed for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get definition location using knowledge graph
   */
  async getDefinitionLocation(symbol: string, document: vscode.TextDocument): Promise<vscode.Location[]> {
    try {
      const relationships = await this.getSemanticRelationships(symbol, document);
      
      const definitions = relationships
        .filter(rel => rel.type === 'defines' || rel.type === 'declares')
        .map(rel => rel.location)
        .filter(loc => loc !== null) as vscode.Location[];
      
      return definitions;
      
    } catch (error) {
      console.error(`❌ Definition search failed for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get references using knowledge graph
   */
  async getReferences(symbol: string, document: vscode.TextDocument): Promise<vscode.Location[]> {
    try {
      const relationships = await this.getSemanticRelationships(symbol, document);
      
      const references = relationships
        .filter(rel => rel.type === 'references' || rel.type === 'uses')
        .map(rel => rel.location)
        .filter(loc => loc !== null) as vscode.Location[];
      
      return references;
      
    } catch (error) {
      console.error(`❌ References search failed for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Generate hyperbolic embeddings for project
   */
  async generateEmbeddings(): Promise<void> {
    try {
      console.log('🧮 Generating hyperbolic embeddings...');
      
      if (!this.currentGraph) {
        throw new Error('No knowledge graph available for embedding generation');
      }
      
      // Generate embeddings for all nodes in the knowledge graph
      for (const node of this.currentGraph.nodes) {
        if (!this.embeddingCache.has(node.id)) {
          const embedding = await this.generateNodeEmbedding(node);
          this.embeddingCache.set(node.id, embedding);
        }
      }
      
      console.log(`✅ Generated embeddings for ${this.embeddingCache.size} nodes`);
      
    } catch (error) {
      console.error('❌ Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Get visualization data for knowledge graph
   */
  async getVisualizationData(layout: string = 'force'): Promise<KnowledgeGraphVisualization> {
    try {
      const result = await this.mcpClient.getGraphVisualization({ layout });
      
      return this.parseVisualizationData(result);
      
    } catch (error) {
      console.error('❌ Visualization data generation failed:', error);
      throw error;
    }
  }

  /**
   * Get workspace symbols using knowledge graph
   */
  async getWorkspaceSymbols(query: string): Promise<vscode.SymbolInformation[]> {
    try {
      const result = await this.mcpClient.queryKnowledgeGraph({
        query,
        type: 'similarity',
        limit: 50
      });
      
      return this.parseWorkspaceSymbols(result);
      
    } catch (error) {
      console.error('❌ Workspace symbol search failed:', error);
      return [];
    }
  }

  /**
   * Get code insights for current context
   */
  getCodeInsights(document?: vscode.TextDocument): CodeInsight[] {
    const insights: CodeInsight[] = [];
    
    if (!document) return insights;
    
    const analysis = this.documentCache.get(document.fileName);
    if (!analysis) return insights;
    
    // Generate insights based on analysis
    insights.push(...this.generateComplexityInsights(analysis));
    insights.push(...this.generateRelationshipInsights(analysis));
    insights.push(...this.generatePatternInsights(analysis));
    
    return insights;
  }

  /**
   * Update configuration
   */
  updateConfiguration(config: vscode.WorkspaceConfiguration): void {
    // Update any configuration-dependent behavior
    console.log('🔧 Updating knowledge graph manager configuration');
  }

  // Private methods

  private async loadExistingGraph(): Promise<void> {
    try {
      const result = await this.mcpClient.getLatestKnowledgeGraph();
      
      if (result && result.contents?.[0]) {
        const content = JSON.parse(result.contents[0].text);
        if (content.id) {
          console.log(`📚 Loaded existing knowledge graph: ${content.id}`);
          // Could load full graph here if needed
        }
      }
    } catch (error) {
      console.log('📝 No existing knowledge graph found, will create new one');
    }
  }

  private setupDocumentMonitoring(): void {
    // Monitor document changes for real-time updates
    this.changeListener = vscode.workspace.onDidChangeTextDocument(async (event) => {
      if (this.shouldMonitorDocument(event.document)) {
        // Debounce updates
        setTimeout(() => {
          this.updateDocument(event.document).catch(console.error);
        }, 1000);
      }
    });
  }

  private shouldMonitorDocument(document: vscode.TextDocument): boolean {
    const supportedLanguages = ['typescript', 'javascript', 'python'];
    return supportedLanguages.includes(document.languageId) &&
           !document.fileName.includes('node_modules') &&
           document.uri.scheme === 'file';
  }

  private parseKnowledgeGraphResponse(response: any): KnowledgeGraph {
    // Parse MCP response into knowledge graph structure
    const content = response.content?.[0]?.text || '';
    
    // Extract analysis results from response
    const lines = content.split('\n');
    const nodeCount = this.extractNumber(lines, 'Nodes created:') || 0;
    const edgeCount = this.extractNumber(lines, 'Relationships:') || 0;
    const totalFiles = this.extractNumber(lines, 'Files analyzed:') || 0;
    const totalLines = this.extractNumber(lines, 'Total lines:') || 0;
    
    return {
      nodes: [], // Would be populated by detailed analysis
      edges: [], // Would be populated by detailed analysis
      metadata: {
        rootPath: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
        generatedAt: new Date(),
        totalFiles,
        totalLines,
        languages: ['TypeScript', 'JavaScript'], // Extract from response
        avgComplexity: 0,
        nodeCount,
        edgeCount
      }
    };
  }

  private extractNumber(lines: string[], prefix: string): number | null {
    const line = lines.find(l => l.includes(prefix));
    if (!line) return null;
    
    const match = line.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  private async updateDocumentCache(): Promise<void> {
    // Update cache based on current knowledge graph
    if (!this.currentGraph) return;
    
    for (const node of this.currentGraph.nodes) {
      if (node.type === 'file' && node.metadata.filePath) {
        try {
          const document = await vscode.workspace.openTextDocument(node.metadata.filePath);
          await this.analyzeDocument(document);
        } catch (error) {
          // File might not be accessible
          console.warn(`Could not analyze file: ${node.metadata.filePath}`);
        }
      }
    }
  }

  private analyzeDocumentStructure(document: vscode.TextDocument): DocumentStructure {
    const text = document.getText();
    const lines = text.split('\n');
    
    return {
      functions: this.extractFunctions(text),
      classes: this.extractClasses(text),
      interfaces: this.extractInterfaces(text),
      imports: this.extractImports(text),
      exports: this.extractExports(text),
      variables: this.extractVariables(text),
      lineCount: lines.length,
      characterCount: text.length
    };
  }

  private extractFunctions(text: string): CodeElement[] {
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*{/g;
    const functions: CodeElement[] = [];
    let match;
    
    while ((match = functionRegex.exec(text)) !== null) {
      const name = match[1];
      const startIndex = match.index;
      const position = this.getPositionFromIndex(text, startIndex);
      
      functions.push({
        name,
        type: 'function',
        range: new vscode.Range(position, position),
        signature: match[0]
      });
    }
    
    return functions;
  }

  private extractClasses(text: string): CodeElement[] {
    const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*{/g;
    const classes: CodeElement[] = [];
    let match;
    
    while ((match = classRegex.exec(text)) !== null) {
      const name = match[1];
      const startIndex = match.index;
      const position = this.getPositionFromIndex(text, startIndex);
      
      classes.push({
        name,
        type: 'class',
        range: new vscode.Range(position, position),
        signature: match[0]
      });
    }
    
    return classes;
  }

  private extractInterfaces(text: string): CodeElement[] {
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+[\w,\s]+)?\s*{/g;
    const interfaces: CodeElement[] = [];
    let match;
    
    while ((match = interfaceRegex.exec(text)) !== null) {
      const name = match[1];
      const startIndex = match.index;
      const position = this.getPositionFromIndex(text, startIndex);
      
      interfaces.push({
        name,
        type: 'interface',
        range: new vscode.Range(position, position),
        signature: match[0]
      });
    }
    
    return interfaces;
  }

  private extractImports(text: string): CodeElement[] {
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\w+|\*\s+as\s+\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
    const imports: CodeElement[] = [];
    let match;
    
    while ((match = importRegex.exec(text)) !== null) {
      const name = match[1];
      const startIndex = match.index;
      const position = this.getPositionFromIndex(text, startIndex);
      
      imports.push({
        name,
        type: 'import',
        range: new vscode.Range(position, position),
        signature: match[0]
      });
    }
    
    return imports;
  }

  private extractExports(text: string): CodeElement[] {
    const exportRegex = /export\s+(?:(?:default\s+)?(?:class|function|interface|const|let|var)\s+(\w+)|{[^}]*})/g;
    const exports: CodeElement[] = [];
    let match;
    
    while ((match = exportRegex.exec(text)) !== null) {
      const name = match[1] || 'anonymous';
      const startIndex = match.index;
      const position = this.getPositionFromIndex(text, startIndex);
      
      exports.push({
        name,
        type: 'export',
        range: new vscode.Range(position, position),
        signature: match[0]
      });
    }
    
    return exports;
  }

  private extractVariables(text: string): CodeElement[] {
    const variableRegex = /(?:const|let|var)\s+(\w+)(?:\s*:\s*[^=]+)?\s*=/g;
    const variables: CodeElement[] = [];
    let match;
    
    while ((match = variableRegex.exec(text)) !== null) {
      const name = match[1];
      const startIndex = match.index;
      const position = this.getPositionFromIndex(text, startIndex);
      
      variables.push({
        name,
        type: 'variable',
        range: new vscode.Range(position, position),
        signature: match[0]
      });
    }
    
    return variables;
  }

  private getPositionFromIndex(text: string, index: number): vscode.Position {
    const lines = text.substring(0, index).split('\n');
    const line = lines.length - 1;
    const character = lines[lines.length - 1].length;
    return new vscode.Position(line, character);
  }

  private async generateDocumentEmbeddings(document: vscode.TextDocument, structure: DocumentStructure): Promise<Map<string, HyperbolicEmbedding>> {
    const embeddings = new Map<string, HyperbolicEmbedding>();
    
    // Generate embeddings for code elements
    for (const element of [...structure.functions, ...structure.classes, ...structure.interfaces]) {
      try {
        const embedding = await this.generateCodeEmbedding(element.signature);
        embeddings.set(element.name, embedding);
      } catch (error) {
        console.warn(`Failed to generate embedding for ${element.name}:`, error);
      }
    }
    
    return embeddings;
  }

  private async generateCodeEmbedding(code: string): Promise<HyperbolicEmbedding> {
    // In a real implementation, this would call the H²GNN service
    // For now, return a placeholder embedding
    return {
      vector: Array.from({ length: 64 }, () => Math.random() * 0.1 - 0.05),
      norm: Math.random() * 0.9 + 0.1,
      dimension: 64
    };
  }

  private async generateNodeEmbedding(node: KnowledgeGraphNode): Promise<HyperbolicEmbedding> {
    // Generate embedding for knowledge graph node
    return this.generateCodeEmbedding(node.content || node.name);
  }

  private async findDocumentRelationships(document: vscode.TextDocument, structure: DocumentStructure): Promise<DocumentRelationship[]> {
    const relationships: DocumentRelationship[] = [];
    
    // Find import relationships
    for (const importElement of structure.imports) {
      relationships.push({
        type: 'imports',
        source: document.fileName,
        target: importElement.name,
        confidence: 1.0
      });
    }
    
    // Find other relationships using knowledge graph
    try {
      const result = await this.mcpClient.queryKnowledgeGraph({
        query: document.fileName,
        type: 'dependency',
        limit: 10
      });
      
      // Parse relationships from result
      // Implementation would depend on MCP response format
      
    } catch (error) {
      console.warn('Failed to find document relationships:', error);
    }
    
    return relationships;
  }

  private calculateComplexity(structure: DocumentStructure): number {
    // Simple complexity calculation
    const functionComplexity = structure.functions.length * 2;
    const classComplexity = structure.classes.length * 3;
    const interfaceComplexity = structure.interfaces.length * 1;
    
    return functionComplexity + classComplexity + interfaceComplexity;
  }

  private generateSemanticTokens(structure: DocumentStructure): vscode.SemanticTokens {
    // Generate semantic tokens for enhanced highlighting
    const tokensBuilder = new vscode.SemanticTokensBuilder();
    
    // Add tokens for functions, classes, interfaces
    for (const element of [...structure.functions, ...structure.classes, ...structure.interfaces]) {
      tokensBuilder.push(
        element.range.start.line,
        element.range.start.character,
        element.name.length,
        this.getTokenType(element.type),
        0
      );
    }
    
    return tokensBuilder.build();
  }

  private getTokenType(elementType: string): number {
    // Map element types to semantic token types
    const tokenTypes = {
      'function': 0,
      'class': 1,
      'interface': 2,
      'variable': 3,
      'import': 4,
      'export': 5
    };
    
    return tokenTypes[elementType as keyof typeof tokenTypes] || 0;
  }

  private async updateGraphWithDocument(analysis: DocumentAnalysis): Promise<void> {
    // Update knowledge graph with document analysis
    // This would involve calling the MCP server to update the graph
    console.log(`📊 Updated knowledge graph with analysis for ${analysis.filePath}`);
  }

  private parseSimilarCodeResults(result: any, queryEmbedding: HyperbolicEmbedding): SimilarCodeResult[] {
    // Parse MCP response for similar code results
    const content = result.content?.[0]?.text || '';
    const lines = content.split('\n');
    
    const results: SimilarCodeResult[] = [];
    
    // Parse structured results from MCP response
    for (const line of lines) {
      if (line.includes('Score:')) {
        const nameMatch = line.match(/\*\*([^*]+)\*\*/);
        const scoreMatch = line.match(/Score:\s+([\d.]+)/);
        
        if (nameMatch && scoreMatch) {
          results.push({
            name: nameMatch[1],
            similarity: parseFloat(scoreMatch[1]),
            location: null, // Would be populated with actual location
            snippet: '',
            context: ''
          });
        }
      }
    }
    
    return results;
  }

  private parseSemanticRelationships(result: any, symbol: string, document: vscode.TextDocument): SemanticRelationship[] {
    // Parse semantic relationships from MCP response
    return [];
  }

  private parseVisualizationData(result: any): KnowledgeGraphVisualization {
    // Parse visualization data from MCP response
    try {
      const content = result.content?.[0]?.text || '';
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[1]);
        return {
          nodes: data.nodes || [],
          edges: data.edges || [],
          layout: data.layout || 'force',
          metadata: data.metadata || {}
        };
      }
    } catch (error) {
      console.error('Failed to parse visualization data:', error);
    }
    
    return {
      nodes: [],
      edges: [],
      layout: 'force',
      metadata: {}
    };
  }

  private parseWorkspaceSymbols(result: any): vscode.SymbolInformation[] {
    // Parse workspace symbols from knowledge graph query
    const symbols: vscode.SymbolInformation[] = [];
    
    // Implementation would parse MCP response and create VS Code symbols
    
    return symbols;
  }

  private generateComplexityInsights(analysis: DocumentAnalysis): CodeInsight[] {
    const insights: CodeInsight[] = [];
    
    if (analysis.complexity > 20) {
      insights.push({
        type: 'warning',
        message: `High complexity detected (${analysis.complexity}). Consider refactoring.`,
        severity: vscode.DiagnosticSeverity.Warning,
        range: new vscode.Range(0, 0, 0, 0),
        actions: ['Refactor', 'Split File']
      });
    }
    
    return insights;
  }

  private generateRelationshipInsights(analysis: DocumentAnalysis): CodeInsight[] {
    const insights: CodeInsight[] = [];
    
    const importCount = analysis.structure.imports.length;
    if (importCount > 10) {
      insights.push({
        type: 'info',
        message: `Many imports detected (${importCount}). Consider dependency injection.`,
        severity: vscode.DiagnosticSeverity.Information,
        range: new vscode.Range(0, 0, 0, 0),
        actions: ['Analyze Dependencies']
      });
    }
    
    return insights;
  }

  private generatePatternInsights(analysis: DocumentAnalysis): CodeInsight[] {
    const insights: CodeInsight[] = [];
    
    // Add pattern-based insights
    const functionCount = analysis.structure.functions.length;
    const classCount = analysis.structure.classes.length;
    
    if (functionCount > 20 && classCount === 0) {
      insights.push({
        type: 'suggestion',
        message: 'Consider organizing functions into classes or modules.',
        severity: vscode.DiagnosticSeverity.Hint,
        range: new vscode.Range(0, 0, 0, 0),
        actions: ['Create Class', 'Extract Module']
      });
    }
    
    return insights;
  }

  private notifyGraphUpdated(): void {
    // Notify extension components about graph updates
    vscode.commands.executeCommand('h2gnn.knowledgeGraphUpdated', {
      nodeCount: this.currentGraph?.metadata.nodeCount || 0,
      edgeCount: this.currentGraph?.metadata.edgeCount || 0
    });
  }

  // Getters

  getCurrentGraph(): KnowledgeGraph | null {
    return this.currentGraph;
  }

  getDocumentAnalysis(filePath: string): DocumentAnalysis | null {
    return this.documentCache.get(filePath) || null;
  }

  getEmbedding(nodeId: string): HyperbolicEmbedding | null {
    return this.embeddingCache.get(nodeId) || null;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.changeListener) {
      this.changeListener.dispose();
    }
    
    this.documentCache.clear();
    this.embeddingCache.clear();
  }
}

// Type definitions

interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  metadata: {
    rootPath: string;
    generatedAt: Date;
    totalFiles: number;
    totalLines: number;
    languages: string[];
    avgComplexity: number;
    nodeCount: number;
    edgeCount: number;
  };
}

interface KnowledgeGraphNode {
  id: string;
  type: 'file' | 'class' | 'function' | 'interface' | 'variable' | 'module';
  name: string;
  content?: string;
  metadata: {
    filePath?: string;
    lineStart?: number;
    lineEnd?: number;
    complexity?: number;
    description?: string;
  };
  embedding?: HyperbolicEmbedding;
}

interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'imports' | 'extends' | 'implements' | 'calls' | 'references';
  weight: number;
}

interface DocumentAnalysis {
  filePath: string;
  version: number;
  languageId: string;
  structure: DocumentStructure;
  embeddings: Map<string, HyperbolicEmbedding>;
  relationships: DocumentRelationship[];
  lastAnalyzed: Date;
  complexity: number;
  semanticTokens: vscode.SemanticTokens;
}

interface DocumentStructure {
  functions: CodeElement[];
  classes: CodeElement[];
  interfaces: CodeElement[];
  imports: CodeElement[];
  exports: CodeElement[];
  variables: CodeElement[];
  lineCount: number;
  characterCount: number;
}

interface CodeElement {
  name: string;
  type: string;
  range: vscode.Range;
  signature: string;
}

interface DocumentRelationship {
  type: string;
  source: string;
  target: string;
  confidence: number;
}

interface HyperbolicEmbedding {
  vector: number[];
  norm: number;
  dimension: number;
}

interface ProjectAnalysisResult {
  nodeCount: number;
  edgeCount: number;
  languages: string[];
  totalFiles: number;
  totalLines: number;
  avgComplexity: number;
}

interface SimilarCodeResult {
  name: string;
  similarity: number;
  location: vscode.Location | null;
  snippet: string;
  context: string;
}

interface SemanticRelationship {
  type: string;
  symbol: string;
  related: string;
  location: vscode.Location | null;
  confidence: number;
}

interface KnowledgeGraphVisualization {
  nodes: any[];
  edges: any[];
  layout: string;
  metadata: any;
}

interface CodeInsight {
  type: 'error' | 'warning' | 'info' | 'suggestion';
  message: string;
  severity: vscode.DiagnosticSeverity;
  range: vscode.Range;
  actions: string[];
}
