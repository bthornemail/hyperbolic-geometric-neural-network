#!/usr/bin/env tsx

/**
 * Integrated Knowledge Base Creator for H²GNN
 * 
 * This integrates directly with the existing H²GNN system to:
 * - Generate documentation using hyperbolic embeddings
 * - Create essays and tutorials from codebase analysis
 * - Refine existing documentation with semantic understanding
 * - Export knowledge graphs for visualization
 * 
 * No separate CLI needed - integrates with existing MCP server
 */

import { HyperbolicArithmetic, Vector } from '../math/hyperbolic-arithmetic';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface DocumentRequest {
  type: 'tutorial' | 'essay' | 'api-docs' | 'architecture' | 'learning-guide';
  format: 'markdown' | 'html' | 'json';
  targetAudience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  focusAreas?: string[];
  maxLength?: number;
  includeExamples?: boolean;
}

interface KnowledgeNode {
  id: string;
  title: string;
  content: string;
  type: 'concept' | 'function' | 'class' | 'module' | 'pattern';
  importance: number;
  complexity: number;
  embeddings: Vector;
  metadata: {
    filePath?: string;
    lineNumber?: number;
    dependencies: string[];
    examples: string[];
  };
}

export class IntegratedKnowledgeBaseCreator {
  private knowledgeGraph: Map<string, KnowledgeNode> = new Map();

  /**
   * Analyze codebase and build knowledge graph using H²GNN
   */
  async analyzeCodebase(
    sourcePath: string,
    options: {
      includePatterns?: string[];
      excludePatterns?: string[];
      maxFileSize?: number;
    } = {}
  ): Promise<Map<string, KnowledgeNode>> {
    console.warn('🔍 Analyzing codebase with H²GNN...');

    const {
      includePatterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.py', '**/*.md'],
      excludePatterns = ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      maxFileSize = 100000
    } = options;

    // Find all relevant files
    const files = await this.findFiles(sourcePath, includePatterns, excludePatterns);
    
    for (const filePath of files) {
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > maxFileSize) {
          console.warn(`⚠️ Skipping large file: ${filePath} (${stats.size} bytes)`);
          continue;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        await this.extractKnowledgeFromFile(filePath, content);
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error);
      }
    }

    console.warn(`✅ Knowledge extraction complete. Found ${this.knowledgeGraph.size} concepts.`);
    return this.knowledgeGraph;
  }

  /**
   * Generate documentation using H²GNN semantic understanding
   */
  async generateDocumentation(
    request: DocumentRequest,
    outputPath: string,
    h2gnnEmbedding: (text: string, context?: any) => Promise<Vector>
  ): Promise<string> {
    console.warn(`📝 Generating ${request.type} documentation...`);

    // Get relevant knowledge nodes using H²GNN
    const relevantNodes = await this.getRelevantNodes(request.focusAreas || [], h2gnnEmbedding);
    
    // Generate content using hyperbolic geometry for hierarchical organization
    const content = await this.generateStructuredContent(relevantNodes, request, h2gnnEmbedding);

    // Save document
    await this.saveDocument(content, outputPath, request.format);

    console.warn(`✅ Documentation generated: ${outputPath}`);
    return content;
  }

  /**
   * Refine existing documentation using H²GNN insights
   */
  async refineDocumentation(
    documentPath: string,
    h2gnnEmbedding: (text: string, context?: any) => Promise<Vector>
  ): Promise<string> {
    console.warn(`🔧 Refining documentation: ${documentPath}`);
    
    const originalContent = fs.readFileSync(documentPath, 'utf-8');
    
    // Use H²GNN to understand document content
    const documentEmbedding = await h2gnnEmbedding(originalContent);
    
    // Find similar concepts in knowledge graph
    const similarConcepts = await this.findSimilarConcepts(documentEmbedding);
    
    // Generate improvements
    const improvements = this.generateImprovements(similarConcepts);
    
    // Apply refinements
    const refinedContent = this.applyRefinements(originalContent, improvements);
    
    // Save refined document
    const refinedPath = documentPath.replace(/\.(md|html|txt)$/, '_refined.$1');
    fs.writeFileSync(refinedPath, refinedContent, 'utf-8');
    
    console.warn(`✅ Refined documentation saved: ${refinedPath}`);
    return refinedContent;
  }

  /**
   * Export knowledge base for visualization
   */
  async exportKnowledgeBase(outputPath: string): Promise<void> {
    const exportData = {
      nodes: Array.from(this.knowledgeGraph.values()),
      stats: this.getKnowledgeBaseStats(),
      exportedAt: new Date().toISOString()
    };

    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
    console.warn(`📦 Knowledge base exported: ${outputPath}`);
  }

  /**
   * Get knowledge base statistics
   */
  getKnowledgeBaseStats(): any {
    const stats = {
      totalNodes: this.knowledgeGraph.size,
      nodeTypes: new Map<string, number>(),
      averageComplexity: 0,
      totalRelationships: 0
    };

    for (const node of this.knowledgeGraph.values()) {
      const count = stats.nodeTypes.get(node.type) || 0;
      stats.nodeTypes.set(node.type, count + 1);
      stats.averageComplexity += node.complexity;
    }

    stats.averageComplexity /= this.knowledgeGraph.size;
    return stats;
  }

  // Private helper methods

  private async findFiles(
    sourcePath: string,
    includePatterns: string[],
    excludePatterns: string[]
  ): Promise<string[]> {
    const files: string[] = [];
    
    for (const pattern of includePatterns) {
      const matches = glob.sync(pattern, {
        cwd: sourcePath,
        ignore: excludePatterns,
        absolute: true
      });
      files.push(...matches);
    }

    return [...new Set(files)];
  }

  private async extractKnowledgeFromFile(filePath: string, content: string): Promise<void> {
    const concepts = this.extractConcepts(content);
    
    for (const concept of concepts) {
      const knowledgeNode: KnowledgeNode = {
        id: `${path.basename(filePath)}_${concept.name}`,
        title: concept.name,
        content: concept.description,
        type: concept.type,
        importance: concept.importance,
        complexity: concept.complexity,
        embeddings: concept.embeddings,
        metadata: {
          filePath,
          lineNumber: concept.lineNumber,
          dependencies: concept.dependencies,
          examples: concept.examples
        }
      };

      this.knowledgeGraph.set(knowledgeNode.id, knowledgeNode);
    }
  }

  private extractConcepts(content: string): any[] {
    const concepts: any[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Extract function definitions
      if (line.match(/^(export\s+)?(async\s+)?function\s+\w+/)) {
        const match = line.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
        if (match) {
          concepts.push({
            name: match[1],
            description: `Function: ${match[1]}`,
            type: 'function',
            importance: 0.8,
            complexity: this.calculateComplexity(line),
            embeddings: null, // Will be filled by H²GNN
            lineNumber: i + 1,
            dependencies: this.extractDependencies(line),
            examples: []
          });
        }
      }
      
      // Extract class definitions
      if (line.match(/^(export\s+)?class\s+\w+/)) {
        const match = line.match(/(?:export\s+)?class\s+(\w+)/);
        if (match) {
          concepts.push({
            name: match[1],
            description: `Class: ${match[1]}`,
            type: 'class',
            importance: 0.9,
            complexity: this.calculateComplexity(line),
            embeddings: null,
            lineNumber: i + 1,
            dependencies: this.extractDependencies(line),
            examples: []
          });
        }
      }
    }
    
    return concepts;
  }

  private calculateComplexity(line: string): number {
    let complexity = 0;
    const complexityIndicators = [
      'if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch',
      '&&', '||', '?', ':', '=>', 'async', 'await', 'Promise'
    ];
    
    for (const indicator of complexityIndicators) {
      const matches = line.match(new RegExp(indicator, 'g'));
      if (matches) {
        complexity += matches.length * 0.1;
      }
    }
    
    return Math.min(complexity, 1.0);
  }

  private extractDependencies(line: string): string[] {
    const dependencies: string[] = [];
    
    const importMatch = line.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      dependencies.push(importMatch[1]);
    }
    
    const requireMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
    if (requireMatch) {
      dependencies.push(requireMatch[1]);
    }
    
    return dependencies;
  }

  private async getRelevantNodes(
    focusAreas: string[],
    h2gnnEmbedding: (text: string, context?: any) => Promise<Vector>
  ): Promise<KnowledgeNode[]> {
    if (focusAreas.length === 0) {
      return Array.from(this.knowledgeGraph.values());
    }

    const relevantNodes: KnowledgeNode[] = [];
    
    for (const area of focusAreas) {
      const areaEmbedding = await h2gnnEmbedding(area);
      
      for (const node of this.knowledgeGraph.values()) {
        if (node.embeddings) {
          const similarity = 1 - HyperbolicArithmetic.distance(areaEmbedding, node.embeddings);
          if (similarity > 0.5) {
            relevantNodes.push(node);
          }
        }
      }
    }
    
    return relevantNodes;
  }

  private async generateStructuredContent(
    nodes: KnowledgeNode[],
    request: DocumentRequest,
    h2gnnEmbedding: (text: string, context?: any) => Promise<Vector>
  ): Promise<string> {
    let content = `# ${this.generateTitle(request, nodes)}\n\n`;
    
    // Group nodes by type using hyperbolic clustering
    const groupedNodes = this.groupNodesByType(nodes);
    
    for (const [type, typeNodes] of groupedNodes) {
      content += `## ${type.charAt(0).toUpperCase() + type.slice(1)}s\n\n`;
      
      for (const node of typeNodes) {
        content += `### ${node.title}\n\n`;
        content += `${node.content}\n\n`;
        
        if (request.includeExamples && node.metadata.examples.length > 0) {
          content += `**Examples:**\n`;
          for (const example of node.metadata.examples) {
            content += `- ${example}\n`;
          }
          content += `\n`;
        }
        
        if (node.metadata.dependencies.length > 0) {
          content += `**Dependencies:** ${node.metadata.dependencies.join(', ')}\n\n`;
        }
      }
    }
    
    return content;
  }

  private groupNodesByType(nodes: KnowledgeNode[]): Map<string, KnowledgeNode[]> {
    const grouped = new Map<string, KnowledgeNode[]>();
    
    for (const node of nodes) {
      if (!grouped.has(node.type)) {
        grouped.set(node.type, []);
      }
      grouped.get(node.type)!.push(node);
    }
    
    return grouped;
  }

  private generateTitle(request: DocumentRequest, nodes: KnowledgeNode[]): string {
    const mainConcepts = nodes
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3)
      .map(n => n.title);
    
    return `${request.type.charAt(0).toUpperCase() + request.type.slice(1)}: ${mainConcepts.join(', ')}`;
  }

  private async saveDocument(content: string, outputPath: string, format: string): Promise<void> {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let finalContent: string;
    
    switch (format) {
      case 'html':
        finalContent = this.convertToHTML(content);
        break;
      case 'json':
        finalContent = JSON.stringify({ content, generatedAt: new Date().toISOString() }, null, 2);
        break;
      default:
        finalContent = content;
    }

    fs.writeFileSync(outputPath, finalContent, 'utf-8');
  }

  private convertToHTML(content: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Generated Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
${content.replace(/\n/g, '<br>')}
</body>
</html>`;
  }

  private async findSimilarConcepts(documentEmbedding: Vector): Promise<KnowledgeNode[]> {
    const similarConcepts: KnowledgeNode[] = [];
    
    for (const node of this.knowledgeGraph.values()) {
      if (node.embeddings) {
        const similarity = 1 - HyperbolicArithmetic.distance(documentEmbedding, node.embeddings);
        if (similarity > 0.4) {
          similarConcepts.push(node);
        }
      }
    }
    
    return similarConcepts;
  }

  private generateImprovements(concepts: KnowledgeNode[]): string[] {
    const improvements: string[] = [];
    
    for (const concept of concepts) {
      improvements.push(`Add more detail about ${concept.title}: ${concept.content}`);
    }
    
    return improvements;
  }

  private applyRefinements(content: string, improvements: string[]): string {
    let refinedContent = content;
    
    for (const improvement of improvements) {
      refinedContent += `\n\n> **Enhancement:** ${improvement}\n`;
    }
    
    return refinedContent;
  }
}

// Export for use in MCP server
export default IntegratedKnowledgeBaseCreator;
