#!/usr/bin/env node

/**
 * Knowledge Graph MCP Server Extension
 * 
 * Adds knowledge graph generation and code/document generation capabilities
 * to the H²GNN MCP Server system
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { Vector, createVector } from '../math/hyperbolic-arithmetic.js';
import { HyperbolicGeometricHGN } from '../core/H2GNN.js';
import { getSharedH2GNN } from '../core/centralized-h2gnn-config.js';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Knowledge Graph Types
export interface KnowledgeNode {
  id: string;
  type: 'file' | 'class' | 'function' | 'interface' | 'concept' | 'module' | 'directory';
  name: string;
  content?: string;
  metadata: {
    filePath?: string;
    lineStart?: number;
    lineEnd?: number;
    complexity?: number;
    size?: number;
    lastModified?: Date;
    dependencies?: string[];
    exports?: string[];
    imports?: string[];
    description?: string;
    purpose?: string;
    [key: string]: any;
  };
  embedding?: Vector;
  position?: { x: number; y: number };
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: 'imports' | 'extends' | 'implements' | 'calls' | 'contains' | 'references' | 'similar_to' | 'depends_on';
  weight: number;
  metadata?: {
    confidence?: number;
    description?: string;
    [key: string]: any;
  };
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  metadata: {
    rootPath: string;
    generatedAt: Date;
    totalFiles: number;
    totalLines: number;
    languages: string[];
    avgComplexity: number;
    clusteringCoefficient?: number;
    diameter?: number;
    [key: string]: any;
  };
}

export interface CodeGenerationRequest {
  type: 'function' | 'class' | 'interface' | 'module' | 'test' | 'documentation';
  description: string;
  context?: {
    relatedNodes?: string[];
    targetFile?: string;
    style?: 'typescript' | 'javascript' | 'python' | 'markdown';
    framework?: string;
  };
  constraints?: {
    maxLines?: number;
    includeComments?: boolean;
    includeTests?: boolean;
    followPatterns?: string[];
  };
}

export interface DocumentGenerationRequest {
  type: 'api_docs' | 'readme' | 'architecture' | 'tutorial' | 'changelog' | 'design_spec';
  scope: string[]; // Node IDs to include
  format: 'markdown' | 'html' | 'pdf' | 'json';
  options?: {
    includeCodeExamples?: boolean;
    includeArchitectureDiagrams?: boolean;
    targetAudience?: 'developer' | 'user' | 'architect' | 'stakeholder';
    detailLevel?: 'high' | 'medium' | 'low';
  };
}

/**
 * Knowledge Graph MCP Tools
 */
export class KnowledgeGraphMCP {
  private knowledgeGraphs: Map<string, KnowledgeGraph> = new Map();
  private h2gnn: HyperbolicGeometricHGN | null = null;

  constructor() {
    this.initializeH2GNN();
  }

  private async initializeH2GNN(): Promise<void> {
    try {
      this.h2gnn = new HyperbolicGeometricHGN({
        embeddingDim: 128,
        numLayers: 3,
        curvature: -1.0
      });
    } catch (error) {
      console.warn('H²GNN initialization failed, using fallback embedding:', error);
    }
  }

  /**
   * Analyze files/folders and create knowledge graph
   */
  async analyzePathToKnowledgeGraph(args: {
    path: string;
    recursive?: boolean;
    includeContent?: boolean;
    maxDepth?: number;
    filePatterns?: string[];
    excludePatterns?: string[];
  }): Promise<{ content: any[] }> {
    const {
      path: targetPath,
      recursive = true,
      includeContent = true,
      maxDepth = 10,
      filePatterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.py', '**/*.md'],
      excludePatterns = ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/coverage/**']
    } = args;

    try {
      const absolutePath = path.resolve(targetPath);
      let pathStats;
      try {
        pathStats = await fs.stat(absolutePath);
      } catch (error) {
        throw new Error(`Path does not exist: ${targetPath}`);
      }

      const nodes: KnowledgeNode[] = [];
      const edges: KnowledgeEdge[] = [];
      const languages = new Set<string>();
      const stats = { totalFiles: 0, totalLines: 0, totalComplexity: 0 };

      if (pathStats.isDirectory()) {
        await this.analyzeDirectory(absolutePath, nodes, edges, {
          recursive,
          includeContent,
          maxDepth,
          currentDepth: 0,
          filePatterns,
          excludePatterns,
          languages,
          stats
        });
      } else {
        await this.analyzeFile(absolutePath, nodes, edges, {
          includeContent,
          languages,
          stats
        });
      }

      // Generate hyperbolic embeddings for all nodes
      await this.generateEmbeddings(nodes, edges);

      // Create knowledge graph
      const knowledgeGraph: KnowledgeGraph = {
        nodes,
        edges,
        metadata: {
          rootPath: absolutePath,
          generatedAt: new Date(),
          totalFiles: stats.totalFiles,
          totalLines: stats.totalLines,
          languages: Array.from(languages),
          avgComplexity: stats.totalFiles > 0 ? stats.totalComplexity / stats.totalFiles : 0,
          clusteringCoefficient: this.calculateClusteringCoefficient(nodes, edges),
          diameter: this.calculateGraphDiameter(nodes, edges)
        }
      };

      // Store the knowledge graph
      const graphId = this.generateGraphId(absolutePath);
      this.knowledgeGraphs.set(graphId, knowledgeGraph);

      return {
        content: [{
          type: "text",
          text: `Knowledge graph generated successfully!\n\n` +
                `📊 **Analysis Results:**\n` +
                `- **Files analyzed:** ${stats.totalFiles}\n` +
                `- **Total lines:** ${stats.totalLines.toLocaleString()}\n` +
                `- **Languages:** ${Array.from(languages).join(', ')}\n` +
                `- **Nodes created:** ${nodes.length}\n` +
                `- **Relationships:** ${edges.length}\n` +
                `- **Average complexity:** ${stats.totalFiles > 0 ? (stats.totalComplexity / stats.totalFiles).toFixed(2) : '0.00'}\n` +
                `- **Graph ID:** ${graphId}\n\n` +
                `🔗 **Graph Structure:**\n` +
                `- **Clustering coefficient:** ${knowledgeGraph.metadata.clusteringCoefficient?.toFixed(3)}\n` +
                `- **Graph diameter:** ${knowledgeGraph.metadata.diameter}\n\n` +
                `✨ **Hyperbolic embeddings generated** for hierarchical relationship representation.`
        }]
      };

    } catch (error) {
      throw new Error(`Failed to analyze path: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate code based on knowledge graph insights
   */
  async generateCodeFromGraph(args: CodeGenerationRequest & { graphId?: string }): Promise<{ content: any[] }> {
    const { type, description, context, constraints, graphId } = args;

    try {
      // Get the most recent knowledge graph if graphId not provided
      const graph = graphId ? 
        this.knowledgeGraphs.get(graphId) : 
        Array.from(this.knowledgeGraphs.values()).pop();

      if (!graph) {
        throw new Error('No knowledge graph available. Please analyze a path first.');
      }

      // Find relevant nodes based on context
      const relevantNodes = this.findRelevantNodes(graph, context?.relatedNodes, description);
      
      // Generate code based on type and context
      const generatedCode = await this.performCodeGeneration(type, description, relevantNodes, graph, constraints);

      return {
        content: [{
          type: "text",
          text: `🚀 **Code Generated Successfully!**\n\n` +
                `**Type:** ${type}\n` +
                `**Description:** ${description}\n` +
                `**Based on:** ${relevantNodes.length} relevant nodes from knowledge graph\n\n` +
                `**Generated Code:**\n\n` +
                `\`\`\`${context?.style || 'typescript'}\n${generatedCode}\n\`\`\``
        }]
      };

    } catch (error) {
      throw new Error(`Code generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate documentation from knowledge graph
   */
  async generateDocumentationFromGraph(args: DocumentGenerationRequest & { graphId?: string }): Promise<{ content: any[] }> {
    const { type, scope, format, options, graphId } = args;

    try {
      const graph = graphId ? 
        this.knowledgeGraphs.get(graphId) : 
        Array.from(this.knowledgeGraphs.values()).pop();

      if (!graph) {
        throw new Error('No knowledge graph available. Please analyze a path first.');
      }

      // Get nodes in scope
      const scopeNodes = scope.length > 0 ? 
        graph.nodes.filter(node => scope.includes(node.id)) :
        graph.nodes;

      // Generate documentation
      const documentation = await this.performDocumentationGeneration(type, scopeNodes, graph, format, options);

      return {
        content: [{
          type: "text",
          text: `📚 **Documentation Generated Successfully!**\n\n` +
                `**Type:** ${type}\n` +
                `**Format:** ${format}\n` +
                `**Scope:** ${scopeNodes.length} nodes\n` +
                `**Target Audience:** ${options?.targetAudience || 'developer'}\n\n` +
                `**Generated Documentation:**\n\n${documentation}`
        }]
      };

    } catch (error) {
      throw new Error(`Documentation generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Query knowledge graph for insights
   */
  async queryKnowledgeGraph(args: {
    graphId?: string;
    query: string;
    type?: 'similarity' | 'path' | 'cluster' | 'dependency' | 'impact';
    limit?: number;
  }): Promise<{ content: any[] }> {
    const { graphId, query, type = 'similarity', limit = 10 } = args;

    try {
      const graph = graphId ? 
        this.knowledgeGraphs.get(graphId) : 
        Array.from(this.knowledgeGraphs.values()).pop();

      if (!graph) {
        throw new Error('No knowledge graph available. Please analyze a path first.');
      }

      const results = await this.performGraphQuery(graph, query, type, limit);

      return {
        content: [{
          type: "text",
          text: `🔍 **Knowledge Graph Query Results**\n\n` +
                `**Query:** "${query}"\n` +
                `**Type:** ${type}\n` +
                `**Results found:** ${results.length}\n\n` +
                results.map((result, index) => 
                  `${index + 1}. **${result.node.name}** (${result.node.type})\n` +
                  `   - Score: ${result.score.toFixed(3)}\n` +
                  `   - Path: ${result.node.metadata.filePath || 'N/A'}\n` +
                  `   - ${result.explanation}\n`
                ).join('\n')
        }]
      };

    } catch (error) {
      throw new Error(`Knowledge graph query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get knowledge graph visualization data
   */
  async getGraphVisualization(args: { graphId?: string; layout?: 'force' | 'hierarchical' | 'circular' }): Promise<{ content: any[] }> {
    const { graphId, layout = 'force' } = args;

    try {
      const graph = graphId ? 
        this.knowledgeGraphs.get(graphId) : 
        Array.from(this.knowledgeGraphs.values()).pop();

      if (!graph) {
        throw new Error('No knowledge graph available. Please analyze a path first.');
      }

      // Generate visualization layout
      const visualizationData = await this.generateVisualizationLayout(graph, layout);

      return {
        content: [{
          type: "text",
          text: `📊 **Knowledge Graph Visualization Data**\n\n` +
                `**Layout:** ${layout}\n` +
                `**Nodes:** ${graph.nodes.length}\n` +
                `**Edges:** ${graph.edges.length}\n\n` +
                `**Visualization JSON:**\n\n` +
                `\`\`\`json\n${JSON.stringify(visualizationData, null, 2)}\n\`\`\``
        }]
      };

    } catch (error) {
      throw new Error(`Visualization generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Private helper methods

  private async analyzeDirectory(
    dirPath: string,
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
    options: any
  ): Promise<void> {
    if (options.currentDepth >= options.maxDepth) return;

    const entries = await fs.readdir(dirPath);
    
    // Create directory node
    const dirNode: KnowledgeNode = {
      id: this.generateNodeId(dirPath),
      type: 'directory',
      name: path.basename(dirPath),
      metadata: {
        filePath: dirPath,
        size: entries.length,
        lastModified: (await fs.stat(dirPath)).mtime
      }
    };
    nodes.push(dirNode);

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry);
      const stats = await fs.stat(entryPath);

      if (stats.isDirectory() && options.recursive) {
        if (!this.isExcluded(entryPath, options.excludePatterns)) {
          await this.analyzeDirectory(entryPath, nodes, edges, {
            ...options,
            currentDepth: options.currentDepth + 1
          });
          
          // Add containment edge
          const childDirId = this.generateNodeId(entryPath);
          edges.push({
            id: `${dirNode.id}-contains-${childDirId}`,
            source: dirNode.id,
            target: childDirId,
            type: 'contains',
            weight: 1.0
          });
        }
      } else if (stats.isFile()) {
        if (this.matchesPattern(entryPath, options.filePatterns) && 
            !this.isExcluded(entryPath, options.excludePatterns)) {
          await this.analyzeFile(entryPath, nodes, edges, options);
          
          // Add containment edge
          const fileId = this.generateNodeId(entryPath);
          edges.push({
            id: `${dirNode.id}-contains-${fileId}`,
            source: dirNode.id,
            target: fileId,
            type: 'contains',
            weight: 1.0
          });
        }
      }
    }
  }

  private async analyzeFile(
    filePath: string,
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
    options: any
  ): Promise<void> {
    const stats = await fs.stat(filePath);
    const content = options.includeContent ? await fs.readFile(filePath, 'utf-8') : '';
    const ext = path.extname(filePath);
    
    options.languages.add(this.getLanguageFromExtension(ext));
    options.stats.totalFiles++;

    const lines = content.split('\n');
    options.stats.totalLines += lines.length;

    // Basic complexity calculation (cyclomatic complexity approximation)
    const complexity = this.calculateComplexity(content, ext);
    options.stats.totalComplexity += complexity;

    // Extract code elements
    const codeElements = this.extractCodeElements(content, filePath, ext);
    
    // Create file node
    const fileNode: KnowledgeNode = {
      id: this.generateNodeId(filePath),
      type: 'file',
      name: path.basename(filePath),
      content: options.includeContent ? content : undefined,
      metadata: {
        filePath,
        lineStart: 1,
        lineEnd: lines.length,
        complexity,
        size: stats.size,
        lastModified: stats.mtime,
        dependencies: codeElements.imports,
        exports: codeElements.exports
      }
    };
    nodes.push(fileNode);

    // Add code element nodes
    for (const element of codeElements.elements) {
      const elementNode: KnowledgeNode = {
        id: this.generateNodeId(`${filePath}:${element.name}`),
        type: element.type as any,
        name: element.name,
        content: element.content,
        metadata: {
          filePath,
          lineStart: element.lineStart,
          lineEnd: element.lineEnd,
          complexity: element.complexity,
          description: element.description,
          purpose: element.purpose
        }
      };
      nodes.push(elementNode);

      // Add containment edge
      edges.push({
        id: `${fileNode.id}-contains-${elementNode.id}`,
        source: fileNode.id,
        target: elementNode.id,
        type: 'contains',
        weight: 1.0
      });
    }

    // Add import/dependency edges
    for (const importPath of codeElements.imports) {
      const targetId = this.resolveImportToNodeId(importPath, filePath);
      if (targetId) {
        edges.push({
          id: `${fileNode.id}-imports-${targetId}`,
          source: fileNode.id,
          target: targetId,
          type: 'imports',
          weight: 1.0
        });
      }
    }
  }

  private extractCodeElements(content: string, _filePath: string, extension: string): {
    elements: any[];
    imports: string[];
    exports: string[];
  } {
    const elements: any[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    if (['.ts', '.tsx', '.js', '.jsx'].includes(extension)) {
      // TypeScript/JavaScript analysis
      const lines = content.split('\n');
      
      // Extract imports
      lines.forEach(line => {
        const importMatch = line.match(/import.*from ['"](.+)['"];?/);
        if (importMatch) {
          imports.push(importMatch[1]);
        }
      });

      // Extract exports
      lines.forEach(line => {
        const exportMatch = line.match(/export\s+(class|function|interface|const|let|var)\s+(\w+)/);
        if (exportMatch) {
          exports.push(exportMatch[2]);
        }
      });

      // Extract classes, functions, interfaces
      this.extractTypeScriptElements(content, elements);
    }

    return { elements, imports, exports };
  }

  private extractTypeScriptElements(content: string, elements: any[]): void {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Class detection
      const classMatch = line.match(/^\s*(export\s+)?(abstract\s+)?class\s+(\w+)/);
      if (classMatch) {
        const className = classMatch[3];
        const { endLine, content: classContent } = this.findBlockEnd(lines, i);
        elements.push({
          type: 'class',
          name: className,
          lineStart: i + 1,
          lineEnd: endLine,
          content: classContent,
          complexity: this.calculateComplexity(classContent, '.ts'),
          description: this.extractDescription(lines, i),
          purpose: `Class ${className}`
        });
      }

      // Function detection
      const functionMatch = line.match(/^\s*(export\s+)?(async\s+)?function\s+(\w+)/);
      if (functionMatch) {
        const functionName = functionMatch[3];
        const { endLine, content: functionContent } = this.findBlockEnd(lines, i);
        elements.push({
          type: 'function',
          name: functionName,
          lineStart: i + 1,
          lineEnd: endLine,
          content: functionContent,
          complexity: this.calculateComplexity(functionContent, '.ts'),
          description: this.extractDescription(lines, i),
          purpose: `Function ${functionName}`
        });
      }

      // Interface detection
      const interfaceMatch = line.match(/^\s*(export\s+)?interface\s+(\w+)/);
      if (interfaceMatch) {
        const interfaceName = interfaceMatch[2];
        const { endLine, content: interfaceContent } = this.findBlockEnd(lines, i);
        elements.push({
          type: 'interface',
          name: interfaceName,
          lineStart: i + 1,
          lineEnd: endLine,
          content: interfaceContent,
          complexity: 1,
          description: this.extractDescription(lines, i),
          purpose: `Interface ${interfaceName}`
        });
      }
    }
  }

  private findBlockEnd(lines: string[], startLine: number): { endLine: number; content: string } {
    let braceCount = 0;
    let started = false;
    let endLine = startLine;
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          started = true;
        } else if (char === '}') {
          braceCount--;
          if (started && braceCount === 0) {
            endLine = i + 1;
            const content = lines.slice(startLine, endLine).join('\n');
            return { endLine, content };
          }
        }
      }
    }
    
    return { endLine: Math.min(startLine + 10, lines.length), content: lines.slice(startLine, Math.min(startLine + 10, lines.length)).join('\n') };
  }

  private extractDescription(lines: string[], lineIndex: number): string {
    // Look for JSDoc comment above the element
    for (let i = lineIndex - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('*/')) {
        // Found end of JSDoc, extract the comment
        const commentLines = [];
        for (let j = i; j >= 0; j--) {
          const commentLine = lines[j].trim();
          commentLines.unshift(commentLine);
          if (commentLine.startsWith('/**')) {
            break;
          }
        }
        return commentLines
          .map(l => l.replace(/^\s*\*+\s?/, ''))
          .filter(l => l.length > 0)
          .join(' ');
      } else if (line && !line.startsWith('//') && !line.startsWith('*')) {
        break;
      }
    }
    return '';
  }

  private calculateComplexity(content: string, _extension: string): number {
    // Simple cyclomatic complexity calculation
    const complexityPatterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\b&&\b/g,
      /\b\|\|\b/g,
      /\?\s*:/g
    ];
    
    let complexity = 1; // Base complexity
    for (const pattern of complexityPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return complexity;
  }

  private async generateEmbeddings(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): Promise<void> {
    for (const node of nodes) {
      try {
        // Create feature vector from node properties
        const features = this.extractNodeFeatures(node, nodes, edges);
        
        if (this.h2gnn) {
          // Use H²GNN for embedding generation
          const embedding = await this.generateHyperbolicEmbedding(features);
          node.embedding = embedding;
        } else {
          // Fallback: simple feature-based embedding
          node.embedding = createVector(features.slice(0, 64));
        }
      } catch (error) {
        console.warn(`Failed to generate embedding for node ${node.id}:`, error);
        // Fallback to random embedding
        node.embedding = createVector(Array.from({ length: 64 }, () => Math.random() * 0.1 - 0.05));
      }
    }
  }

  private extractNodeFeatures(node: KnowledgeNode, _nodes: KnowledgeNode[], _edges: KnowledgeEdge[]): number[] {
    const features: number[] = [];
    
    // Type-based features
    const typeMap = { file: 0, class: 1, function: 2, interface: 3, concept: 4, module: 5, directory: 6 };
    features.push(typeMap[node.type] || 0);
    
    // Complexity features
    features.push(node.metadata.complexity || 0);
    features.push(Math.log10((node.metadata.size || 0) + 1));
    features.push((node.metadata.lineEnd || 0) - (node.metadata.lineStart || 0) + 1);
    
    // Connectivity features
    const incomingEdges = _edges.filter((e: any) => e.target === node.id);
    const outgoingEdges = _edges.filter((e: any) => e.source === node.id);
    features.push(incomingEdges.length);
    features.push(outgoingEdges.length);
    
    // Dependency features
    features.push(node.metadata.dependencies?.length || 0);
    features.push(node.metadata.exports?.length || 0);
    features.push(node.metadata.imports?.length || 0);
    
    // Text-based features (simplified TF-IDF)
    if (node.content) {
      const words = node.content.toLowerCase().match(/\w+/g) || [];
      const uniqueWords = new Set(words);
      features.push(words.length);
      features.push(uniqueWords.size);
      features.push(uniqueWords.size / Math.max(words.length, 1)); // lexical diversity
    } else {
      features.push(0, 0, 0);
    }
    
    // Pad or truncate to desired length
    while (features.length < 128) {
      features.push(0);
    }
    
    return features.slice(0, 128);
  }

  private async generateHyperbolicEmbedding(features: number[]): Promise<Vector> {
    try {
      if (!this.h2gnn) {
        throw new Error('H²GNN not initialized');
      }
      
      // For now, just project features to hyperbolic space
      // In a full implementation, this would use the trained H²GNN model
      const projected = features.slice(0, 64);
      const norm = Math.sqrt(projected.reduce((sum, x) => sum + x * x, 0));
      
      // Ensure the vector is in the Poincaré ball (norm < 1)
      if (norm >= 1) {
        const scale = 0.95 / norm;
        for (let i = 0; i < projected.length; i++) {
          projected[i] *= scale;
        }
      }
      
      return createVector(projected);
    } catch (error) {
      // Fallback embedding
      const randomEmbedding = Array.from({ length: 64 }, () => Math.random() * 0.1 - 0.05);
      return createVector(randomEmbedding);
    }
  }

  private generateNodeId(path: string): string {
    return Buffer.from(path).toString('base64').replace(/[/+=]/g, '').substring(0, 16);
  }

  private generateGraphId(rootPath: string): string {
    const timestamp = Date.now();
    return `kg_${Buffer.from(rootPath).toString('base64').replace(/[/+=]/g, '').substring(0, 8)}_${timestamp}`;
  }

  private getLanguageFromExtension(ext: string): string {
    const langMap: { [key: string]: string } = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript React',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript React',
      '.py': 'Python',
      '.md': 'Markdown',
      '.json': 'JSON',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS'
    };
    return langMap[ext] || 'Unknown';
  }

  private matchesPattern(filePath: string, patterns: string[]): boolean {
    // Simple pattern matching (in production, use a proper glob library)
    return patterns.some(pattern => {
      const regex = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
      return new RegExp(regex).test(filePath);
    });
  }

  private isExcluded(filePath: string, excludePatterns: string[]): boolean {
    return excludePatterns.some(pattern => {
      const regex = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
      return new RegExp(regex).test(filePath);
    });
  }

  private resolveImportToNodeId(importPath: string, fromFilePath: string): string | null {
    // Simplified import resolution
    // In production, this would need more sophisticated module resolution
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const resolvedPath = path.resolve(path.dirname(fromFilePath), importPath);
      return this.generateNodeId(resolvedPath);
    }
    return null;
  }

  private calculateClusteringCoefficient(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): number {
    // Simplified clustering coefficient calculation
    let totalCoefficient = 0;
    let nodeCount = 0;

    for (const node of nodes) {
      const neighbors = this.getNeighbors(node.id, edges);
      if (neighbors.length < 2) continue;

      let triangles = 0;
      for (let i = 0; i < neighbors.length; i++) {
        for (let j = i + 1; j < neighbors.length; j++) {
          if (this.areConnected(neighbors[i], neighbors[j], edges)) {
            triangles++;
          }
        }
      }

      const possibleTriangles = (neighbors.length * (neighbors.length - 1)) / 2;
      if (possibleTriangles > 0) {
        totalCoefficient += triangles / possibleTriangles;
        nodeCount++;
      }
    }

    return nodeCount > 0 ? totalCoefficient / nodeCount : 0;
  }

  private calculateGraphDiameter(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): number {
    // Simplified diameter calculation using Floyd-Warshall
    const nodeIds = nodes.map(n => n.id);
    const distances: { [key: string]: { [key: string]: number } } = {};

    // Initialize distances
    for (const id1 of nodeIds) {
      distances[id1] = {};
      for (const id2 of nodeIds) {
        distances[id1][id2] = id1 === id2 ? 0 : Infinity;
      }
    }

    // Set direct connections
    for (const edge of edges) {
      distances[edge.source][edge.target] = 1;
      distances[edge.target][edge.source] = 1; // Treat as undirected for diameter
    }

    // Floyd-Warshall
    for (const k of nodeIds) {
      for (const i of nodeIds) {
        for (const j of nodeIds) {
          distances[i][j] = Math.min(distances[i][j], distances[i][k] + distances[k][j]);
        }
      }
    }

    // Find maximum finite distance
    let maxDistance = 0;
    for (const id1 of nodeIds) {
      for (const id2 of nodeIds) {
        if (distances[id1][id2] !== Infinity) {
          maxDistance = Math.max(maxDistance, distances[id1][id2]);
        }
      }
    }

    return maxDistance;
  }

  private getNeighbors(nodeId: string, edges: KnowledgeEdge[]): string[] {
    const neighbors = new Set<string>();
    for (const edge of edges) {
      if (edge.source === nodeId) neighbors.add(edge.target);
      if (edge.target === nodeId) neighbors.add(edge.source);
    }
    return Array.from(neighbors);
  }

  private areConnected(nodeId1: string, nodeId2: string, edges: KnowledgeEdge[]): boolean {
    return edges.some(edge => 
      (edge.source === nodeId1 && edge.target === nodeId2) ||
      (edge.source === nodeId2 && edge.target === nodeId1)
    );
  }

  private findRelevantNodes(graph: KnowledgeGraph, relatedNodeIds?: string[], description?: string): KnowledgeNode[] {
    if (relatedNodeIds && relatedNodeIds.length > 0) {
      return graph.nodes.filter(node => relatedNodeIds.includes(node.id));
    }

    if (description) {
      // Simple keyword matching for relevance
      const keywords = description.toLowerCase().split(/\s+/);
      return graph.nodes.filter(node => {
        const nodeText = (node.name + ' ' + (node.metadata.description || '') + ' ' + (node.content || '')).toLowerCase();
        return keywords.some(keyword => nodeText.includes(keyword));
      }).slice(0, 10); // Limit to top 10 relevant nodes
    }

    return graph.nodes.slice(0, 5); // Default to first 5 nodes
  }

  private async performCodeGeneration(
    type: string,
    description: string,
    relevantNodes: KnowledgeNode[],
    _graph: KnowledgeGraph,
    constraints?: any
  ): Promise<string> {
    // Get H²GNN understanding for enhanced code generation
    const h2gnnUnderstanding = await this.getH2GNNUnderstanding(type, description, relevantNodes);
    
    // Analyze code patterns with H²GNN insights
    const patterns = this.analyzeCodePatterns(relevantNodes);
    const enhancedPatterns = this.enhancePatternsWithH2GNN(patterns, h2gnnUnderstanding);
    
    // Generate code with H²GNN understanding
    switch (type) {
      case 'function':
        return this.generateFunctionWithH2GNN(description, enhancedPatterns, h2gnnUnderstanding, constraints);
      case 'class':
        return this.generateClassWithH2GNN(description, enhancedPatterns, h2gnnUnderstanding, constraints);
      case 'interface':
        return this.generateInterfaceWithH2GNN(description, enhancedPatterns, h2gnnUnderstanding, constraints);
      case 'test':
        return this.generateTestWithH2GNN(description, relevantNodes, h2gnnUnderstanding, constraints);
      default:
        return this.generateGenericCodeWithH2GNN(description, enhancedPatterns, h2gnnUnderstanding, constraints);
    }
  }

  /**
   * Get H²GNN understanding for code generation
   */
  private async getH2GNNUnderstanding(type: string, description: string, relevantNodes: KnowledgeNode[]): Promise<any> {
    try {
      const h2gnn = getSharedH2GNN();
      
      // Query H²GNN for semantically similar concepts
      const similarConcepts = await h2gnn.retrieveMemories(
        `${type}_${description}`,
        5
      );
      
      // Get understanding snapshot for the domain
      const domainSnapshot = await h2gnn.getUnderstandingSnapshot('code_generation');
      
      // Extract semantic features from relevant nodes
      const semanticFeatures = this.extractSemanticFeaturesFromNodes(relevantNodes);
      
      return {
        similarConcepts,
        domainSnapshot,
        semanticFeatures,
        confidence: similarConcepts.length > 0 ? similarConcepts[0].confidence : 0.5,
        patterns: similarConcepts.map(c => c.concept),
        relationships: this.extractRelationshipsFromNodes(relevantNodes)
      };
    } catch (error) {
      console.warn('H²GNN understanding not available, using fallback:', error);
      return {
        similarConcepts: [],
        domainSnapshot: null,
        semanticFeatures: [],
        confidence: 0.3,
        patterns: [],
        relationships: []
      };
    }
  }

  /**
   * Enhance patterns with H²GNN understanding
   */
  private enhancePatternsWithH2GNN(patterns: any, h2gnnUnderstanding: any): any {
    const enhanced = { ...patterns };
    
    // Add H²GNN-learned patterns
    if (h2gnnUnderstanding.patterns && h2gnnUnderstanding.patterns.length > 0) {
      enhanced.h2gnnPatterns = h2gnnUnderstanding.patterns;
      enhanced.confidence = h2gnnUnderstanding.confidence;
    }
    
    // Add semantic features
    if (h2gnnUnderstanding.semanticFeatures && h2gnnUnderstanding.semanticFeatures.length > 0) {
      enhanced.semanticFeatures = h2gnnUnderstanding.semanticFeatures;
    }
    
    // Add relationships
    if (h2gnnUnderstanding.relationships && h2gnnUnderstanding.relationships.length > 0) {
      enhanced.relationships = h2gnnUnderstanding.relationships;
    }
    
    return enhanced;
  }

  /**
   * Extract semantic features from nodes
   */
  private extractSemanticFeaturesFromNodes(nodes: KnowledgeNode[]): string[] {
    const features: string[] = [];
    
    for (const node of nodes) {
      if (node.content) {
        const words = node.content.toLowerCase().split(/\s+/);
        features.push(...words.filter(word => word.length > 3));
      }
      
      if (node.name) {
        const nameWords = node.name.toLowerCase().split(/(?=[A-Z])|_|-/);
        features.push(...nameWords.filter(word => word.length > 2));
      }
      
      if (node.type) {
        features.push(node.type.toLowerCase());
      }
    }
    
    return [...new Set(features)]; // Remove duplicates
  }

  /**
   * Extract relationships from nodes
   */
  private extractRelationshipsFromNodes(nodes: KnowledgeNode[]): any[] {
    const relationships: any[] = [];
    
    for (const node of nodes) {
      if (node.metadata.dependencies) {
        for (const dep of node.metadata.dependencies) {
          relationships.push({
            type: 'depends_on',
            source: node.id,
            target: dep,
            strength: 0.8
          });
        }
      }
      
      if (node.metadata.imports) {
        for (const imp of node.metadata.imports) {
          relationships.push({
            type: 'imports',
            source: node.id,
            target: imp,
            strength: 0.6
          });
        }
      }
    }
    
    return relationships;
  }

  /**
   * Generate function with H²GNN understanding
   */
  private async generateFunctionWithH2GNN(
    description: string,
    patterns: any,
    h2gnnUnderstanding: any,
    constraints?: any
  ): Promise<string> {
    const h2gnn = getSharedH2GNN();
    
    // Learn from this generation attempt
    await h2gnn.learnWithMemory(
      `function_generation_${description}`,
      {
        description,
        patterns: patterns.h2gnnPatterns || [],
        semanticFeatures: patterns.semanticFeatures || [],
        relationships: patterns.relationships || []
      },
      {
        domain: 'code_generation',
        type: 'function_generation',
        timestamp: new Date().toISOString()
      },
      h2gnnUnderstanding.confidence
    );
    
    // Generate function with enhanced understanding
    const functionName = this.generateFunctionName(description, patterns);
    const parameters = this.generateParameters(description, patterns);
    const returnType = this.generateReturnType(description, patterns);
    const body = this.generateFunctionBody(description, patterns, h2gnnUnderstanding);
    
    return `export function ${functionName}(${parameters}): ${returnType} {
  ${body}
}`;
  }

  /**
   * Generate class with H²GNN understanding
   */
  private async generateClassWithH2GNN(
    description: string,
    patterns: any,
    h2gnnUnderstanding: any,
    constraints?: any
  ): Promise<string> {
    const h2gnn = getSharedH2GNN();
    
    // Learn from this generation attempt
    await h2gnn.learnWithMemory(
      `class_generation_${description}`,
      {
        description,
        patterns: patterns.h2gnnPatterns || [],
        semanticFeatures: patterns.semanticFeatures || [],
        relationships: patterns.relationships || []
      },
      {
        domain: 'code_generation',
        type: 'class_generation',
        timestamp: new Date().toISOString()
      },
      h2gnnUnderstanding.confidence
    );
    
    // Generate class with enhanced understanding
    const className = this.generateClassName(description, patterns);
    const properties = this.generateClassProperties(description, patterns, h2gnnUnderstanding);
    const methods = this.generateClassMethods(description, patterns, h2gnnUnderstanding);
    
    return `export class ${className} {
  ${properties}
  
  ${methods}
}`;
  }

  /**
   * Generate interface with H²GNN understanding
   */
  private async generateInterfaceWithH2GNN(
    description: string,
    patterns: any,
    h2gnnUnderstanding: any,
    constraints?: any
  ): Promise<string> {
    const h2gnn = getSharedH2GNN();
    
    // Learn from this generation attempt
    await h2gnn.learnWithMemory(
      `interface_generation_${description}`,
      {
        description,
        patterns: patterns.h2gnnPatterns || [],
        semanticFeatures: patterns.semanticFeatures || [],
        relationships: patterns.relationships || []
      },
      {
        domain: 'code_generation',
        type: 'interface_generation',
        timestamp: new Date().toISOString()
      },
      h2gnnUnderstanding.confidence
    );
    
    // Generate interface with enhanced understanding
    const interfaceName = this.generateInterfaceName(description, patterns);
    const members = this.generateInterfaceMembers(description, patterns, h2gnnUnderstanding);
    
    return `export interface ${interfaceName} {
  ${members}
}`;
  }

  /**
   * Generate test with H²GNN understanding
   */
  private async generateTestWithH2GNN(
    description: string,
    relevantNodes: KnowledgeNode[],
    h2gnnUnderstanding: any,
    constraints?: any
  ): Promise<string> {
    const h2gnn = getSharedH2GNN();
    
    // Learn from this generation attempt
    await h2gnn.learnWithMemory(
      `test_generation_${description}`,
      {
        description,
        relevantNodes: relevantNodes.map(n => ({ id: n.id, type: n.type, name: n.name })),
        semanticFeatures: h2gnnUnderstanding.semanticFeatures || [],
        relationships: h2gnnUnderstanding.relationships || []
      },
      {
        domain: 'code_generation',
        type: 'test_generation',
        timestamp: new Date().toISOString()
      },
      h2gnnUnderstanding.confidence
    );
    
    // Generate test with enhanced understanding
    const testName = this.generateTestName(description);
    const testCases = this.generateTestCases(description, relevantNodes, h2gnnUnderstanding);
    
    return `describe('${testName}', () => {
  ${testCases}
});`;
  }

  /**
   * Generate generic code with H²GNN understanding
   */
  private async generateGenericCodeWithH2GNN(
    description: string,
    patterns: any,
    h2gnnUnderstanding: any,
    constraints?: any
  ): Promise<string> {
    const h2gnn = getSharedH2GNN();
    
    // Learn from this generation attempt
    await h2gnn.learnWithMemory(
      `generic_generation_${description}`,
      {
        description,
        patterns: patterns.h2gnnPatterns || [],
        semanticFeatures: patterns.semanticFeatures || [],
        relationships: patterns.relationships || []
      },
      {
        domain: 'code_generation',
        type: 'generic_generation',
        timestamp: new Date().toISOString()
      },
      h2gnnUnderstanding.confidence
    );
    
    // Generate generic code with enhanced understanding
    return `// Generated with H²GNN understanding
// Description: ${description}
// Confidence: ${h2gnnUnderstanding.confidence.toFixed(3)}
// Patterns: ${patterns.h2gnnPatterns?.join(', ') || 'None'}

${this.generateGenericCode(description, patterns, constraints)}`;
  }

  // Helper methods for code generation
  private generateFunctionName(description: string, patterns: any): string {
    const words = description.toLowerCase().split(/\s+/);
    return words.map((word, index) => 
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
  }

  private generateParameters(description: string, patterns: any): string {
    // Simple parameter generation based on description
    const words = description.toLowerCase().split(/\s+/);
    const paramWords = words.filter(word => word.length > 3);
    return paramWords.slice(0, 2).map(word => `${word}: any`).join(', ');
  }

  private generateReturnType(description: string, patterns: any): string {
    if (description.includes('return') || description.includes('get')) {
      return 'any';
    }
    return 'void';
  }

  private generateFunctionBody(description: string, patterns: any, h2gnnUnderstanding: any): string {
    return `// TODO: Implement ${description}
// H²GNN Confidence: ${h2gnnUnderstanding.confidence.toFixed(3)}
// Learned Patterns: ${patterns.h2gnnPatterns?.join(', ') || 'None'}
throw new Error('Not implemented');`;
  }

  private generateClassName(description: string, patterns: any): string {
    const words = description.toLowerCase().split(/\s+/);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  }

  private generateClassProperties(description: string, patterns: any, h2gnnUnderstanding: any): string {
    return `// Properties based on H²GNN understanding
// Confidence: ${h2gnnUnderstanding.confidence.toFixed(3)}
private _data: any;`;
  }

  private generateClassMethods(description: string, patterns: any, h2gnnUnderstanding: any): string {
    return `// Methods based on H²GNN understanding
// Confidence: ${h2gnnUnderstanding.confidence.toFixed(3)}
public process(): void {
  // TODO: Implement based on learned patterns
}`;
  }

  private generateInterfaceName(description: string, patterns: any): string {
    const words = description.toLowerCase().split(/\s+/);
    return 'I' + words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  }

  private generateInterfaceMembers(description: string, patterns: any, h2gnnUnderstanding: any): string {
    return `// Interface members based on H²GNN understanding
// Confidence: ${h2gnnUnderstanding.confidence.toFixed(3)}
data: any;
process(): void;`;
  }

  private generateTestName(description: string): string {
    return description.replace(/\s+/g, ' ').trim();
  }

  private generateTestCases(description: string, relevantNodes: KnowledgeNode[], h2gnnUnderstanding: any): string {
    return `it('should work correctly', () => {
  // Test case based on H²GNN understanding
  // Confidence: ${h2gnnUnderstanding.confidence.toFixed(3)}
  // Relevant nodes: ${relevantNodes.length}
  expect(true).toBe(true);
});`;
  }

  private analyzeCodePatterns(nodes: KnowledgeNode[]): any {
    const patterns = {
      commonImports: new Set<string>(),
      commonExports: new Set<string>(),
      namingConventions: [] as string[],
      typescriptFeatures: [] as string[],
      complexity: 0
    };

    for (const node of nodes) {
      if (node.metadata.imports) {
        node.metadata.imports.forEach(imp => patterns.commonImports.add(imp));
      }
      if (node.metadata.exports) {
        node.metadata.exports.forEach(exp => patterns.commonExports.add(exp));
      }
      
      patterns.complexity += node.metadata.complexity || 0;
    }

    patterns.complexity /= Math.max(nodes.length, 1);
    return patterns;
  }

  private generateFunction(description: string, _patterns: any, _constraints?: any): string {
    const functionName = this.extractFunctionName(description);
    const includeComments = _constraints?.includeComments !== false;
    
    return `${includeComments ? `/**\n * ${description}\n */\n` : ''}export function ${functionName}(): void {
  // TODO: Implement ${description}
  throw new Error('Not implemented');
}`;
  }

  private generateClass(description: string, _patterns: any, _constraints?: any): string {
    const className = this.extractClassName(description);
    const includeComments = _constraints?.includeComments !== false;
    
    return `${includeComments ? `/**\n * ${description}\n */\n` : ''}export class ${className} {
  constructor() {
    // TODO: Initialize ${className}
  }

  // TODO: Add methods for ${description}
}`;
  }

  private generateInterface(description: string, _patterns: any, _constraints?: any): string {
    const interfaceName = this.extractInterfaceName(description);
    const includeComments = _constraints?.includeComments !== false;
    
    return `${includeComments ? `/**\n * ${description}\n */\n` : ''}export interface ${interfaceName} {
  // TODO: Define properties for ${description}
}`;
  }

  private generateTest(description: string, _relevantNodes: KnowledgeNode[], _constraints?: any): string {
    const testName = this.extractTestName(description);
    
    return `import { describe, it, expect } from 'vitest';

describe('${testName}', () => {
  it('should ${description}', () => {
    // TODO: Implement test for ${description}
    expect(true).toBe(true);
  });
});`;
  }

  private generateGenericCode(description: string, _patterns: any, _constraints?: any): string {
    return `// Generated code for: ${description}
// TODO: Implement functionality based on the description
export function generatedCode() {
  console.log('Generated code placeholder');
}`;
  }

  private extractFunctionName(description: string): string {
    // Extract camelCase function name from description
    const words = description.toLowerCase().match(/\w+/g) || ['generated', 'function'];
    return words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  }

  private extractClassName(description: string): string {
    // Extract PascalCase class name from description
    const words = description.toLowerCase().match(/\w+/g) || ['Generated', 'Class'];
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  }

  private extractInterfaceName(description: string): string {
    // Extract PascalCase interface name from description
    const words = description.toLowerCase().match(/\w+/g) || ['Generated', 'Interface'];
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  }

  private extractTestName(description: string): string {
    return description.charAt(0).toUpperCase() + description.slice(1);
  }

  private async performDocumentationGeneration(
    type: string,
    nodes: KnowledgeNode[],
    graph: KnowledgeGraph,
    format: string,
    options?: any
  ): Promise<string> {
    switch (type) {
      case 'api_docs':
        return this.generateApiDocs(nodes, format, options);
      case 'readme':
        return this.generateReadme(graph, format, options);
      case 'architecture':
        return this.generateArchitectureDocs(graph, format, options);
      case 'tutorial':
        return this.generateTutorial(nodes, format, options);
      default:
        return this.generateGenericDocs(nodes, type, format, options);
    }
  }

  private generateApiDocs(nodes: KnowledgeNode[], _format: string, _options?: any): string {
    const apiNodes = nodes.filter(node => ['class', 'function', 'interface'].includes(node.type));
    
    let docs = '# API Documentation\n\n';
    
    for (const node of apiNodes) {
      docs += `## ${node.name} (${node.type})\n\n`;
      if (node.metadata.description) {
        docs += `${node.metadata.description}\n\n`;
      }
      if (node.metadata.filePath) {
        docs += `**File:** \`${node.metadata.filePath}\`\n\n`;
      }
      if (_options?.includeCodeExamples && node.content) {
        docs += `**Code:**\n\`\`\`typescript\n${node.content}\n\`\`\`\n\n`;
      }
      docs += '---\n\n';
    }
    
    return docs;
  }

  private generateReadme(graph: KnowledgeGraph, _format: string, _options?: any): string {
    return `# Project Documentation

## Overview
This project contains ${graph.metadata.totalFiles} files with ${graph.metadata.totalLines.toLocaleString()} lines of code across ${graph.metadata.languages.join(', ')}.

## Structure
- **Files:** ${graph.nodes.filter(n => n.type === 'file').length}
- **Classes:** ${graph.nodes.filter(n => n.type === 'class').length}
- **Functions:** ${graph.nodes.filter(n => n.type === 'function').length}
- **Interfaces:** ${graph.nodes.filter(n => n.type === 'interface').length}

## Architecture
${_options?.includeArchitectureDiagrams ? '```mermaid\ngraph TD\n  A[Root] --> B[Components]\n  A --> C[Utils]\n```\n' : ''}

Average complexity: ${graph.metadata.avgComplexity.toFixed(2)}

Generated on: ${graph.metadata.generatedAt.toISOString()}
`;
  }

  private generateArchitectureDocs(graph: KnowledgeGraph, _format: string, _options?: any): string {
    return `# Architecture Documentation

## System Overview
The system consists of ${graph.nodes.length} components with ${graph.edges.length} relationships.

## Component Analysis
${graph.nodes.slice(0, 10).map(node => `- **${node.name}** (${node.type}): ${node.metadata.description || 'No description'}`).join('\n')}

## Relationships
The system shows a clustering coefficient of ${graph.metadata.clusteringCoefficient?.toFixed(3)} and diameter of ${graph.metadata.diameter}.

## Complexity Metrics
- Total lines: ${graph.metadata.totalLines.toLocaleString()}
- Average complexity: ${graph.metadata.avgComplexity.toFixed(2)}
- Languages: ${graph.metadata.languages.join(', ')}
`;
  }

  private generateTutorial(nodes: KnowledgeNode[], _format: string, _options?: any): string {
    return `# Tutorial

## Getting Started
This tutorial will guide you through the main components of the system.

## Key Components
${nodes.slice(0, 5).map((node, index) => `
### ${index + 1}. ${node.name}
${node.metadata.description || 'Component description'}

${_options?.includeCodeExamples && node.content ? `\`\`\`typescript\n${node.content.split('\n').slice(0, 10).join('\n')}\n...\n\`\`\`` : ''}
`).join('\n')}

## Next Steps
Explore the codebase and experiment with the components.
`;
  }

  private generateGenericDocs(nodes: KnowledgeNode[], type: string, _format: string, _options?: any): string {
    return `# ${type.charAt(0).toUpperCase() + type.slice(1)} Documentation

Generated documentation for ${nodes.length} components.

${nodes.map(node => `## ${node.name}\n${node.metadata.description || 'No description available'}\n`).join('\n')}
`;
  }

  private async performGraphQuery(
    graph: KnowledgeGraph,
    query: string,
    type: string,
    limit: number
  ): Promise<Array<{ node: KnowledgeNode; score: number; explanation: string }>> {
    const results: Array<{ node: KnowledgeNode; score: number; explanation: string }> = [];

    switch (type) {
      case 'similarity':
        // Find nodes similar to the query
        for (const node of graph.nodes) {
          const score = this.calculateTextSimilarity(query, node);
          if (score > 0.1) {
            results.push({
              node,
              score,
              explanation: `Text similarity: ${(score * 100).toFixed(1)}%`
            });
          }
        }
        break;

      case 'dependency': {
        // Find nodes related by dependencies
        const queryNode = graph.nodes.find(n => n.name.toLowerCase().includes(query.toLowerCase()));
        if (queryNode) {
          const relatedNodes = this.findDependentNodes(queryNode, graph);
          for (const relatedNode of relatedNodes) {
            results.push({
              node: relatedNode.node,
              score: relatedNode.distance,
              explanation: `Dependency relationship (distance: ${relatedNode.distance})`
            });
          }
        }
        break;
      }

      case 'cluster': {
        // Find nodes in the same cluster
        const clusters = this.findClusters(graph);
        for (const cluster of clusters) {
          if (cluster.some(node => node.name.toLowerCase().includes(query.toLowerCase()))) {
            for (const node of cluster) {
              results.push({
                node,
                score: 1.0,
                explanation: 'Member of the same cluster'
              });
            }
            break;
          }
        }
        break;
      }

      default:
        // Default similarity search
        for (const node of graph.nodes) {
          const score = this.calculateTextSimilarity(query, node);
          results.push({
            node,
            score,
            explanation: `Default similarity: ${(score * 100).toFixed(1)}%`
          });
        }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private calculateTextSimilarity(query: string, node: KnowledgeNode): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const nodeText = (node.name + ' ' + (node.metadata.description || '') + ' ' + (node.content || '')).toLowerCase();
    
    let matches = 0;
    for (const word of queryWords) {
      if (nodeText.includes(word)) {
        matches++;
      }
    }
    
    return matches / Math.max(queryWords.length, 1);
  }

  private findDependentNodes(
    sourceNode: KnowledgeNode,
    graph: KnowledgeGraph,
    maxDistance: number = 3
  ): Array<{ node: KnowledgeNode; distance: number }> {
    const visited = new Set<string>();
    const queue: Array<{ node: KnowledgeNode; distance: number }> = [{ node: sourceNode, distance: 0 }];
    const results: Array<{ node: KnowledgeNode; distance: number }> = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current.node.id) || current.distance > maxDistance) {
        continue;
      }
      
      visited.add(current.node.id);
      
      if (current.distance > 0) {
        results.push(current);
      }

      // Find connected nodes
      const connectedEdges = graph.edges.filter(edge => 
        edge.source === current.node.id || edge.target === current.node.id
      );

      for (const edge of connectedEdges) {
        const nextNodeId = edge.source === current.node.id ? edge.target : edge.source;
        const nextNode = graph.nodes.find(n => n.id === nextNodeId);
        
        if (nextNode && !visited.has(nextNodeId)) {
          queue.push({ node: nextNode, distance: current.distance + 1 });
        }
      }
    }

    return results;
  }

  private findClusters(graph: KnowledgeGraph): KnowledgeNode[][] {
    // Simple clustering based on connectivity
    const visited = new Set<string>();
    const clusters: KnowledgeNode[][] = [];

    for (const node of graph.nodes) {
      if (visited.has(node.id)) continue;

      const cluster = this.exploreCluster(node, graph, visited);
      if (cluster.length > 1) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  private exploreCluster(
    startNode: KnowledgeNode,
    graph: KnowledgeGraph,
    globalVisited: Set<string>
  ): KnowledgeNode[] {
    const cluster: KnowledgeNode[] = [];
    const queue: KnowledgeNode[] = [startNode];
    const localVisited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (localVisited.has(current.id)) continue;
      
      localVisited.add(current.id);
      globalVisited.add(current.id);
      cluster.push(current);

      // Find directly connected nodes
      const connectedEdges = graph.edges.filter(edge => 
        (edge.source === current.id || edge.target === current.id) &&
        ['imports', 'contains', 'references'].includes(edge.type)
      );

      for (const edge of connectedEdges) {
        const nextNodeId = edge.source === current.id ? edge.target : edge.source;
        const nextNode = graph.nodes.find(n => n.id === nextNodeId);
        
        if (nextNode && !localVisited.has(nextNodeId)) {
          queue.push(nextNode);
        }
      }
    }

    return cluster;
  }

  private async generateVisualizationLayout(graph: KnowledgeGraph, layout: string): Promise<any> {
    const visualization = {
      nodes: graph.nodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        size: Math.log10((node.metadata.complexity || 1) + 1) * 10 + 5,
        color: this.getNodeColor(node.type),
        metadata: {
          filePath: node.metadata.filePath,
          complexity: node.metadata.complexity,
          description: node.metadata.description
        },
        position: this.calculateNodePosition(node, graph, layout)
      })),
      edges: graph.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        weight: edge.weight,
        color: this.getEdgeColor(edge.type)
      })),
      layout: layout,
      metadata: graph.metadata
    };

    return visualization;
  }

  private getNodeColor(type: string): string {
    const colors = {
      file: '#3b82f6',
      class: '#ef4444',
      function: '#10b981',
      interface: '#f59e0b',
      concept: '#8b5cf6',
      module: '#06b6d4',
      directory: '#6b7280'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  }

  private getEdgeColor(type: string): string {
    const colors = {
      imports: '#3b82f6',
      extends: '#ef4444',
      implements: '#f59e0b',
      calls: '#10b981',
      contains: '#6b7280',
      references: '#8b5cf6',
      similar_to: '#06b6d4',
      depends_on: '#f97316'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  }

  private calculateNodePosition(node: KnowledgeNode, graph: KnowledgeGraph, layout: string): { x: number; y: number } {
    // Simplified layout calculation
    switch (layout) {
      case 'hierarchical':
        return this.calculateHierarchicalPosition(node, graph);
      case 'circular':
        return this.calculateCircularPosition(node, graph);
      default: // force
        return this.calculateForcePosition(node, graph);
    }
  }

  private calculateHierarchicalPosition(node: KnowledgeNode, graph: KnowledgeGraph): { x: number; y: number } {
    const typeOrder = ['directory', 'file', 'class', 'interface', 'function'];
    const typeIndex = typeOrder.indexOf(node.type);
    const sameTypeNodes = graph.nodes.filter(n => n.type === node.type);
    const nodeIndex = sameTypeNodes.findIndex(n => n.id === node.id);
    
    return {
      x: (nodeIndex * 100) % 800 + 50,
      y: typeIndex * 100 + 50
    };
  }

  private calculateCircularPosition(node: KnowledgeNode, graph: KnowledgeGraph): { x: number; y: number } {
    const nodeIndex = graph.nodes.findIndex(n => n.id === node.id);
    const angle = (nodeIndex / graph.nodes.length) * 2 * Math.PI;
    const radius = 200;
    
    return {
      x: Math.cos(angle) * radius + 400,
      y: Math.sin(angle) * radius + 300
    };
  }

  private calculateForcePosition(node: KnowledgeNode, graph: KnowledgeGraph): { x: number; y: number } {
    // Simple force-directed layout approximation
    const nodeIndex = graph.nodes.findIndex(n => n.id === node.id);
    const connections = graph.edges.filter(e => e.source === node.id || e.target === node.id).length;
    
    return {
      x: (nodeIndex * 50) % 600 + Math.random() * 100,
      y: connections * 30 + Math.random() * 100 + 50
    };
  }

  // Public method to get available knowledge graphs
  getKnowledgeGraphs(): Array<{ id: string; metadata: any }> {
    return Array.from(this.knowledgeGraphs.entries()).map(([id, graph]) => ({
      id,
      metadata: graph.metadata
    }));
  }

  // Public method to get a specific knowledge graph
  getKnowledgeGraph(id: string): KnowledgeGraph | null {
    return this.knowledgeGraphs.get(id) || null;
  }

  // Public method to get all knowledge graph IDs
  getAllKnowledgeGraphs(): string[] {
    return Array.from(this.knowledgeGraphs.keys());
  }

  // Public method to get the latest knowledge graph
  getLatestKnowledgeGraph(): KnowledgeGraph | null {
    if (this.knowledgeGraphs.size === 0) {
      return null;
    }
    
    // Get the most recently created graph
    let latest: KnowledgeGraph | null = null;
    let latestTime = 0;
    
    for (const graph of this.knowledgeGraphs.values()) {
      const graphTime = graph.metadata.createdAt?.getTime() || 0;
      if (graphTime > latestTime) {
        latestTime = graphTime;
        latest = graph;
      }
    }
    
    return latest;
  }
}

/**
 * MCP Server for Knowledge Graph
 */

class KnowledgeGraphMCPServer {
  private server: Server;
  private knowledgeGraphMCP: KnowledgeGraphMCP;

  constructor() {
    this.server = new Server(
      {
        name: "knowledge-graph-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.knowledgeGraphMCP = new KnowledgeGraphMCP();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "analyze_path_to_knowledge_graph",
            description: "Analyze files/folders and create knowledge graph with hyperbolic embeddings",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Path to file or directory to analyze"
                },
                recursive: {
                  type: "boolean",
                  description: "Whether to analyze subdirectories recursively",
                  default: true
                },
                includeContent: {
                  type: "boolean",
                  description: "Whether to include file content in analysis",
                  default: true
                },
                maxDepth: {
                  type: "number",
                  description: "Maximum directory depth to analyze",
                  default: 10
                },
                filePatterns: {
                  type: "array",
                  items: { type: "string" },
                  description: "File patterns to include",
                  default: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.py", "**/*.md"]
                },
                excludePatterns: {
                  type: "array",
                  items: { type: "string" },
                  description: "Patterns to exclude",
                  default: ["**/node_modules/**", "**/dist/**", "**/.git/**"]
                }
              },
              required: ["path"]
            }
          },
          {
            name: "generate_code_from_graph",
            description: "Generate code based on knowledge graph insights",
            inputSchema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["function", "class", "interface", "module", "test", "documentation"],
                  description: "Type of code to generate"
                },
                description: {
                  type: "string",
                  description: "Description of what to generate"
                },
                graphId: {
                  type: "string",
                  description: "Optional knowledge graph ID to use"
                },
                context: {
                  type: "object",
                  description: "Additional context for generation"
                },
                constraints: {
                  type: "object",
                  description: "Constraints for generation"
                }
              },
              required: ["type", "description"]
            }
          },
          {
            name: "generate_documentation_from_graph",
            description: "Generate documentation from knowledge graph",
            inputSchema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["api_docs", "readme", "architecture", "tutorial", "changelog", "design_spec"],
                  description: "Type of documentation to generate"
                },
                scope: {
                  type: "array",
                  items: { type: "string" },
                  description: "Node IDs to include in documentation"
                },
                format: {
                  type: "string",
                  enum: ["markdown", "html", "pdf", "json"],
                  description: "Output format"
                },
                graphId: {
                  type: "string",
                  description: "Optional knowledge graph ID to use"
                },
                options: {
                  type: "object",
                  description: "Additional options for generation"
                }
              },
              required: ["type", "scope", "format"]
            }
          },
          {
            name: "query_knowledge_graph",
            description: "Query knowledge graph for insights and relationships",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Query text to search for"
                },
                graphId: {
                  type: "string",
                  description: "Optional knowledge graph ID to query"
                },
                type: {
                  type: "string",
                  enum: ["similarity", "path", "cluster", "dependency", "impact"],
                  description: "Type of query to perform",
                  default: "similarity"
                },
                limit: {
                  type: "number",
                  description: "Maximum number of results",
                  default: 10
                }
              },
              required: ["query"]
            }
          },
          {
            name: "get_graph_visualization",
            description: "Get knowledge graph visualization data",
            inputSchema: {
              type: "object",
              properties: {
                graphId: {
                  type: "string",
                  description: "Optional knowledge graph ID to visualize"
                },
                layout: {
                  type: "string",
                  enum: ["force", "hierarchical", "circular"],
                  description: "Layout algorithm to use",
                  default: "force"
                }
              }
            }
          }
        ]
      };
    });

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        throw new McpError(ErrorCode.InvalidRequest, "Arguments are required");
      }

      try {
        switch (name) {
          case "analyze_path_to_knowledge_graph":
            return await this.knowledgeGraphMCP.analyzePathToKnowledgeGraph(args);
          case "generate_code_from_graph":
            return await this.knowledgeGraphMCP.generateCodeFromGraph(args);
          case "generate_documentation_from_graph":
            return await this.knowledgeGraphMCP.generateDocumentationFromGraph(args);
          case "query_knowledge_graph":
            return await this.knowledgeGraphMCP.queryKnowledgeGraph(args);
          case "get_graph_visualization":
            return await this.knowledgeGraphMCP.getGraphVisualization(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });

    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "h2gnn://knowledge-graphs/list",
            mimeType: "application/json",
            name: "Knowledge Graphs List",
            description: "List of all available knowledge graphs"
          },
          {
            uri: "h2gnn://knowledge-graphs/latest",
            mimeType: "application/json",
            name: "Latest Knowledge Graph",
            description: "Most recently generated knowledge graph"
          }
        ]
      };
    });

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case "h2gnn://knowledge-graphs/list":
          const graphs = this.knowledgeGraphMCP.getAllKnowledgeGraphs();
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({ graphs }, null, 2)
              }
            ]
          };

        case "h2gnn://knowledge-graphs/latest":
          const latestGraph = this.knowledgeGraphMCP.getLatestKnowledgeGraph();
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(latestGraph, null, 2)
              }
            ]
          };

        default:
          throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
      }
    });

    // List prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "graph_analysis",
            description: "Analyze knowledge graph structure and relationships",
            arguments: [
              {
                name: "graphId",
                description: "Knowledge graph ID to analyze",
                required: true
              }
            ]
          },
          {
            name: "code_generation",
            description: "Generate code based on knowledge graph insights",
            arguments: [
              {
                name: "type",
                description: "Type of code to generate",
                required: true
              },
              {
                name: "description",
                description: "Description of what to generate",
                required: true
              }
            ]
          }
        ]
      };
    });

    // Get prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "graph_analysis":
          return {
            description: `Analyze knowledge graph: ${args?.graphId || 'unknown'}`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Please analyze the knowledge graph with ID: ${args?.graphId || 'unknown'}. Provide insights about its structure, relationships, and potential improvements.`
                }
              }
            ]
          };

        case "code_generation":
          return {
            description: `Generate ${args?.type || 'code'} based on knowledge graph`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Please generate ${args?.type || 'code'} based on the knowledge graph. Description: ${args?.description || 'No description provided'}.`
                }
              }
            ]
          };

        default:
          throw new McpError(ErrorCode.InvalidRequest, `Unknown prompt: ${name}`);
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log("Knowledge Graph MCP Server running on stdio");
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new KnowledgeGraphMCPServer();
  server.start().catch(console.error);
}

export { KnowledgeGraphMCPServer };
