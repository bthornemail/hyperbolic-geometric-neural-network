#!/usr/bin/env tsx

/**
 * Knowledge Base Creator using H²GNN Learning
 * 
 * This system uses the learned semantic understanding to:
 * - Generate comprehensive documentation from codebase
 * - Create essays and articles from code analysis
 * - Refine and improve existing documentation
 * - Build knowledge graphs from code relationships
 * - Generate tutorials and learning materials
 * - Create API documentation and guides
 */

import EnhancedH2GNN, { PersistenceConfig } from '../core/enhanced-h2gnn';
import { HyperbolicGeometricHGN } from '../core/H2GNN';
import { HyperbolicArithmetic, Vector } from '../math/hyperbolic-arithmetic';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface DocumentType {
  type: 'tutorial' | 'essay' | 'api-docs' | 'architecture' | 'learning-guide' | 'refinement';
  format: 'markdown' | 'html' | 'pdf' | 'json';
  targetAudience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;
  style: 'technical' | 'narrative' | 'academic' | 'casual';
}

interface KnowledgeNode {
  id: string;
  title: string;
  content: string;
  type: 'concept' | 'function' | 'class' | 'module' | 'pattern' | 'example';
  importance: number;
  complexity: number;
  relationships: string[];
  embeddings: Vector;
  metadata: {
    filePath?: string;
    lineNumber?: number;
    dependencies: string[];
    usage: string[];
    examples: string[];
  };
}

interface DocumentStructure {
  title: string;
  sections: DocumentSection[];
  metadata: {
    generatedAt: Date;
    sourceFiles: string[];
    concepts: string[];
    complexity: number;
    estimatedReadTime: number;
  };
}

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  level: number;
  subsections: DocumentSection[];
  concepts: string[];
  examples: string[];
  references: string[];
}

interface RefinementRequest {
  documentPath: string;
  focusAreas: string[];
  improvementType: 'clarity' | 'completeness' | 'accuracy' | 'engagement';
  targetAudience: string;
  constraints: string[];
}

class KnowledgeBaseCreator {
  private enhancedH2GNN: EnhancedH2GNN;
  private knowledgeGraph: Map<string, KnowledgeNode> = new Map();
  private documentTemplates: Map<string, any> = new Map();
  private learningInsights: Map<string, any> = new Map();

  constructor() {
    const h2gnnConfig = {
      embeddingDim: 256,
      numLayers: 6,
      curvature: -1.0
    };

    const persistenceConfig: PersistenceConfig = {
      storagePath: './persistence/knowledge-base',
      maxMemories: 100000,
      consolidationThreshold: 200,
      retrievalStrategy: 'hybrid',
      compressionEnabled: true
    };

    this.enhancedH2GNN = new EnhancedH2GNN(h2gnnConfig, persistenceConfig);
    this.initializeDocumentTemplates();
  }

  /**
   * Initialize document templates for different types of content
   */
  private initializeDocumentTemplates(): void {
    this.documentTemplates.set('tutorial', {
      structure: [
        { id: 'introduction', title: 'Introduction', required: true },
        { id: 'prerequisites', title: 'Prerequisites', required: true },
        { id: 'overview', title: 'Overview', required: true },
        { id: 'step-by-step', title: 'Step-by-Step Guide', required: true },
        { id: 'examples', title: 'Examples', required: true },
        { id: 'best-practices', title: 'Best Practices', required: false },
        { id: 'troubleshooting', title: 'Troubleshooting', required: false },
        { id: 'conclusion', title: 'Conclusion', required: true }
      ],
      style: 'technical',
      audience: 'beginner'
    });

    this.documentTemplates.set('essay', {
      structure: [
        { id: 'introduction', title: 'Introduction', required: true },
        { id: 'thesis', title: 'Main Argument', required: true },
        { id: 'evidence', title: 'Evidence and Examples', required: true },
        { id: 'analysis', title: 'Analysis', required: true },
        { id: 'counterarguments', title: 'Counterarguments', required: false },
        { id: 'conclusion', title: 'Conclusion', required: true }
      ],
      style: 'academic',
      audience: 'intermediate'
    });

    this.documentTemplates.set('api-docs', {
      structure: [
        { id: 'overview', title: 'API Overview', required: true },
        { id: 'authentication', title: 'Authentication', required: true },
        { id: 'endpoints', title: 'Endpoints', required: true },
        { id: 'examples', title: 'Examples', required: true },
        { id: 'error-codes', title: 'Error Codes', required: true },
        { id: 'rate-limits', title: 'Rate Limits', required: false }
      ],
      style: 'technical',
      audience: 'intermediate'
    });

    this.documentTemplates.set('architecture', {
      structure: [
        { id: 'overview', title: 'System Overview', required: true },
        { id: 'components', title: 'Components', required: true },
        { id: 'interactions', title: 'Component Interactions', required: true },
        { id: 'data-flow', title: 'Data Flow', required: true },
        { id: 'deployment', title: 'Deployment', required: false },
        { id: 'scalability', title: 'Scalability Considerations', required: false }
      ],
      style: 'technical',
      audience: 'advanced'
    });
  }

  /**
   * Analyze codebase and build knowledge graph
   */
  async analyzeCodebase(
    sourcePath: string,
    options: {
      includePatterns?: string[];
      excludePatterns?: string[];
      maxFileSize?: number;
      language?: string;
    } = {}
  ): Promise<void> {
    console.log('🔍 Analyzing codebase for knowledge extraction...');

    const {
      includePatterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.py', '**/*.md'],
      excludePatterns = ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/test/**'],
      maxFileSize = 100000,
      language = 'typescript'
    } = options;

    // Find all relevant files
    const files = await this.findFiles(sourcePath, includePatterns, excludePatterns);
    
    for (const filePath of files) {
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > maxFileSize) {
          console.log(`⚠️ Skipping large file: ${filePath} (${stats.size} bytes)`);
          continue;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        await this.extractKnowledgeFromFile(filePath, content, language);
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error);
      }
    }

    console.log(`✅ Knowledge extraction complete. Found ${this.knowledgeGraph.size} concepts.`);
  }

  /**
   * Find files matching patterns
   */
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

    return [...new Set(files)]; // Remove duplicates
  }

  /**
   * Extract knowledge from a single file
   */
  private async extractKnowledgeFromFile(
    filePath: string,
    content: string,
    language: string
  ): Promise<void> {
    // Extract concepts, functions, classes, etc.
    const concepts = await this.extractConcepts(content, language);
    
    for (const concept of concepts) {
      const embedding = await this.enhancedH2GNN.generateEmbedding(
        `${concept.name}: ${concept.description}`,
        { filePath, language, type: concept.type }
      );

      const knowledgeNode: KnowledgeNode = {
        id: `${path.basename(filePath)}_${concept.name}`,
        title: concept.name,
        content: concept.description,
        type: concept.type,
        importance: concept.importance,
        complexity: concept.complexity,
        relationships: concept.relationships,
        embeddings,
        metadata: {
          filePath,
          lineNumber: concept.lineNumber,
          dependencies: concept.dependencies,
          usage: concept.usage,
          examples: concept.examples
        }
      };

      this.knowledgeGraph.set(knowledgeNode.id, knowledgeNode);
    }
  }

  /**
   * Extract concepts from code content
   */
  private async extractConcepts(content: string, language: string): Promise<any[]> {
    const concepts: any[] = [];
    
    // Simple concept extraction (can be enhanced with AST parsing)
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
            relationships: [],
            lineNumber: i + 1,
            dependencies: this.extractDependencies(line),
            usage: [],
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
            relationships: [],
            lineNumber: i + 1,
            dependencies: this.extractDependencies(line),
            usage: [],
            examples: []
          });
        }
      }
      
      // Extract interface definitions
      if (line.match(/^(export\s+)?interface\s+\w+/)) {
        const match = line.match(/(?:export\s+)?interface\s+(\w+)/);
        if (match) {
          concepts.push({
            name: match[1],
            description: `Interface: ${match[1]}`,
            type: 'concept',
            importance: 0.7,
            complexity: this.calculateComplexity(line),
            relationships: [],
            lineNumber: i + 1,
            dependencies: this.extractDependencies(line),
            usage: [],
            examples: []
          });
        }
      }
    }
    
    return concepts;
  }

  /**
   * Calculate complexity score for a code line
   */
  private calculateComplexity(line: string): number {
    let complexity = 0;
    
    // Count operators and keywords that increase complexity
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

  /**
   * Extract dependencies from a code line
   */
  private extractDependencies(line: string): string[] {
    const dependencies: string[] = [];
    
    // Extract import statements
    const importMatch = line.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      dependencies.push(importMatch[1]);
    }
    
    // Extract require statements
    const requireMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
    if (requireMatch) {
      dependencies.push(requireMatch[1]);
    }
    
    return dependencies;
  }

  /**
   * Generate documentation from knowledge graph
   */
  async generateDocumentation(
    documentType: DocumentType,
    outputPath: string,
    options: {
      focusAreas?: string[];
      maxLength?: number;
      includeExamples?: boolean;
      includeDiagrams?: boolean;
    } = {}
  ): Promise<DocumentStructure> {
    console.log(`📝 Generating ${documentType.type} documentation...`);

    const {
      focusAreas = [],
      maxLength = 10000,
      includeExamples = true,
      includeDiagrams = false
    } = options;

    // Get relevant knowledge nodes
    const relevantNodes = await this.getRelevantNodes(focusAreas);
    
    // Generate document structure
    const document = await this.createDocumentStructure(
      documentType,
      relevantNodes,
      maxLength,
      includeExamples,
      includeDiagrams
    );

    // Save document
    await this.saveDocument(document, outputPath, documentType.format);

    console.log(`✅ Documentation generated: ${outputPath}`);
    return document;
  }

  /**
   * Get relevant knowledge nodes based on focus areas
   */
  private async getRelevantNodes(focusAreas: string[]): Promise<KnowledgeNode[]> {
    if (focusAreas.length === 0) {
      return Array.from(this.knowledgeGraph.values());
    }

    const relevantNodes: KnowledgeNode[] = [];
    
    for (const area of focusAreas) {
      const areaEmbedding = await this.enhancedH2GNN.generateEmbedding(area);
      
      for (const node of this.knowledgeGraph.values()) {
        const similarity = 1 - HyperbolicArithmetic.distance(areaEmbedding, node.embeddings);
        if (similarity > 0.5) {
          relevantNodes.push(node);
        }
      }
    }
    
    return relevantNodes;
  }

  /**
   * Create document structure based on template
   */
  private async createDocumentStructure(
    documentType: DocumentType,
    nodes: KnowledgeNode[],
    maxLength: number,
    includeExamples: boolean,
    includeDiagrams: boolean
  ): Promise<DocumentStructure> {
    const template = this.documentTemplates.get(documentType.type);
    if (!template) {
      throw new Error(`Unknown document type: ${documentType.type}`);
    }

    const sections: DocumentSection[] = [];
    
    for (const sectionTemplate of template.structure) {
      const section = await this.generateSection(
        sectionTemplate,
        nodes,
        documentType,
        includeExamples,
        includeDiagrams
      );
      sections.push(section);
    }

    return {
      title: this.generateTitle(documentType, nodes),
      sections,
      metadata: {
        generatedAt: new Date(),
        sourceFiles: [...new Set(nodes.map(n => n.metadata.filePath).filter(Boolean))],
        concepts: nodes.map(n => n.title),
        complexity: nodes.reduce((sum, n) => sum + n.complexity, 0) / nodes.length,
        estimatedReadTime: Math.ceil(nodes.length * 0.5) // Rough estimate
      }
    };
  }

  /**
   * Generate a section of the document
   */
  private async generateSection(
    sectionTemplate: any,
    nodes: KnowledgeNode[],
    documentType: DocumentType,
    includeExamples: boolean,
    includeDiagrams: boolean
  ): Promise<DocumentSection> {
    // Use H²GNN to generate content based on relevant nodes
    const relevantNodes = await this.filterNodesForSection(sectionTemplate.id, nodes);
    
    const content = await this.generateSectionContent(
      sectionTemplate,
      relevantNodes,
      documentType,
      includeExamples
    );

    return {
      id: sectionTemplate.id,
      title: sectionTemplate.title,
      content,
      level: 1,
      subsections: [],
      concepts: relevantNodes.map(n => n.title),
      examples: includeExamples ? relevantNodes.flatMap(n => n.metadata.examples) : [],
      references: relevantNodes.map(n => n.metadata.filePath).filter(Boolean)
    };
  }

  /**
   * Filter nodes relevant to a specific section
   */
  private async filterNodesForSection(sectionId: string, nodes: KnowledgeNode[]): Promise<KnowledgeNode[]> {
    // Use semantic similarity to find relevant nodes
    const sectionEmbedding = await this.enhancedH2GNN.generateEmbedding(sectionId);
    
    const relevantNodes: KnowledgeNode[] = [];
    
    for (const node of nodes) {
      const similarity = 1 - HyperbolicArithmetic.distance(sectionEmbedding, node.embeddings);
      if (similarity > 0.3) {
        relevantNodes.push(node);
      }
    }
    
    return relevantNodes.sort((a, b) => b.importance - a.importance);
  }

  /**
   * Generate content for a section
   */
  private async generateSectionContent(
    sectionTemplate: any,
    nodes: KnowledgeNode[],
    documentType: DocumentType,
    includeExamples: boolean
  ): Promise<string> {
    // Use LLM to generate content based on nodes
    const prompt = this.buildSectionPrompt(sectionTemplate, nodes, documentType, includeExamples);
    
    // This would integrate with your LLM system
    // For now, return a structured summary
    return this.generateStructuredContent(nodes, sectionTemplate, includeExamples);
  }

  /**
   * Build prompt for section generation
   */
  private buildSectionPrompt(
    sectionTemplate: any,
    nodes: KnowledgeNode[],
    documentType: DocumentType,
    includeExamples: boolean
  ): string {
    const nodeSummaries = nodes.map(node => 
      `- ${node.title}: ${node.content} (${node.type})`
    ).join('\n');

    return `
Generate content for section "${sectionTemplate.title}" of a ${documentType.type} document.

Target audience: ${documentType.targetAudience}
Style: ${documentType.style}
Language: ${documentType.language}

Relevant concepts:
${nodeSummaries}

${includeExamples ? 'Include practical examples and code snippets.' : ''}

Generate comprehensive, well-structured content that explains the concepts clearly.
    `.trim();
  }

  /**
   * Generate structured content from nodes
   */
  private generateStructuredContent(
    nodes: KnowledgeNode[],
    sectionTemplate: any,
    includeExamples: boolean
  ): string {
    let content = `# ${sectionTemplate.title}\n\n`;
    
    // Group nodes by type
    const groupedNodes = this.groupNodesByType(nodes);
    
    for (const [type, typeNodes] of groupedNodes) {
      content += `## ${type.charAt(0).toUpperCase() + type.slice(1)}s\n\n`;
      
      for (const node of typeNodes) {
        content += `### ${node.title}\n\n`;
        content += `${node.content}\n\n`;
        
        if (includeExamples && node.metadata.examples.length > 0) {
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

  /**
   * Group nodes by type
   */
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

  /**
   * Generate title for document
   */
  private generateTitle(documentType: DocumentType, nodes: KnowledgeNode[]): string {
    const mainConcepts = nodes
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3)
      .map(n => n.title);
    
    return `${documentType.type.charAt(0).toUpperCase() + documentType.type.slice(1)}: ${mainConcepts.join(', ')}`;
  }

  /**
   * Save document to file
   */
  private async saveDocument(
    document: DocumentStructure,
    outputPath: string,
    format: string
  ): Promise<void> {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let content: string;
    
    switch (format) {
      case 'markdown':
        content = this.convertToMarkdown(document);
        break;
      case 'html':
        content = this.convertToHTML(document);
        break;
      case 'json':
        content = JSON.stringify(document, null, 2);
        break;
      default:
        content = this.convertToMarkdown(document);
    }

    fs.writeFileSync(outputPath, content, 'utf-8');
  }

  /**
   * Convert document to Markdown
   */
  private convertToMarkdown(document: DocumentStructure): string {
    let markdown = `# ${document.title}\n\n`;
    
    markdown += `*Generated on ${document.metadata.generatedAt.toISOString()}*\n\n`;
    markdown += `*Estimated read time: ${document.metadata.estimatedReadTime} minutes*\n\n`;
    
    for (const section of document.sections) {
      markdown += `## ${section.title}\n\n`;
      markdown += `${section.content}\n\n`;
      
      if (section.examples.length > 0) {
        markdown += `### Examples\n\n`;
        for (const example of section.examples) {
          markdown += `- ${example}\n`;
        }
        markdown += `\n`;
      }
    }
    
    return markdown;
  }

  /**
   * Convert document to HTML
   */
  private convertToHTML(document: DocumentStructure): string {
    let html = `<!DOCTYPE html>
<html>
<head>
    <title>${document.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        .metadata { background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 20px 0; }
        code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>${document.title}</h1>
    <div class="metadata">
        <p><strong>Generated:</strong> ${document.metadata.generatedAt.toISOString()}</p>
        <p><strong>Read time:</strong> ${document.metadata.estimatedReadTime} minutes</p>
        <p><strong>Source files:</strong> ${document.metadata.sourceFiles.length}</p>
    </div>
`;
    
    for (const section of document.sections) {
      html += `    <h2>${section.title}</h2>\n`;
      html += `    <div>${section.content.replace(/\n/g, '<br>')}</div>\n`;
      
      if (section.examples.length > 0) {
        html += `    <h3>Examples</h3>\n    <ul>\n`;
        for (const example of section.examples) {
          html += `        <li>${example}</li>\n`;
        }
        html += `    </ul>\n`;
      }
    }
    
    html += `</body>\n</html>`;
    return html;
  }

  /**
   * Refine existing documentation
   */
  async refineDocumentation(request: RefinementRequest): Promise<string> {
    console.log(`🔧 Refining documentation: ${request.documentPath}`);
    
    const originalContent = fs.readFileSync(request.documentPath, 'utf-8');
    
    // Analyze the document and identify areas for improvement
    const analysis = await this.analyzeDocument(originalContent, request);
    
    // Generate improvements
    const improvements = await this.generateImprovements(analysis, request);
    
    // Apply refinements
    const refinedContent = await this.applyRefinements(originalContent, improvements);
    
    // Save refined document
    const refinedPath = request.documentPath.replace(/\.(md|html|txt)$/, '_refined.$1');
    fs.writeFileSync(refinedPath, refinedContent, 'utf-8');
    
    console.log(`✅ Refined documentation saved: ${refinedPath}`);
    return refinedContent;
  }

  /**
   * Analyze document for improvement opportunities
   */
  private async analyzeDocument(content: string, request: RefinementRequest): Promise<any> {
    const contentEmbedding = await this.enhancedH2GNN.generateEmbedding(content);
    
    // Find similar concepts in knowledge graph
    const similarConcepts: KnowledgeNode[] = [];
    
    for (const node of this.knowledgeGraph.values()) {
      const similarity = 1 - HyperbolicArithmetic.distance(contentEmbedding, node.embeddings);
      if (similarity > 0.4) {
        similarConcepts.push(node);
      }
    }
    
    return {
      content,
      similarConcepts,
      focusAreas: request.focusAreas,
      improvementType: request.improvementType,
      targetAudience: request.targetAudience
    };
  }

  /**
   * Generate improvements for document
   */
  private async generateImprovements(analysis: any, request: RefinementRequest): Promise<any[]> {
    const improvements: any[] = [];
    
    // Generate improvements based on similar concepts
    for (const concept of analysis.similarConcepts) {
      if (request.focusAreas.includes(concept.title) || request.focusAreas.length === 0) {
        improvements.push({
          type: request.improvementType,
          concept: concept.title,
          suggestion: `Add more detail about ${concept.title}: ${concept.content}`,
          confidence: concept.importance,
          impact: 'medium'
        });
      }
    }
    
    return improvements;
  }

  /**
   * Apply refinements to document
   */
  private async applyRefinements(content: string, improvements: any[]): Promise<string> {
    let refinedContent = content;
    
    // Apply improvements based on type
    for (const improvement of improvements) {
      switch (improvement.type) {
        case 'clarity':
          refinedContent = this.improveClarity(refinedContent, improvement);
          break;
        case 'completeness':
          refinedContent = this.improveCompleteness(refinedContent, improvement);
          break;
        case 'accuracy':
          refinedContent = this.improveAccuracy(refinedContent, improvement);
          break;
        case 'engagement':
          refinedContent = this.improveEngagement(refinedContent, improvement);
          break;
      }
    }
    
    return refinedContent;
  }

  /**
   * Improve document clarity
   */
  private improveClarity(content: string, improvement: any): string {
    // Add explanatory text
    const explanation = `\n\n> **Note:** ${improvement.suggestion}\n`;
    return content + explanation;
  }

  /**
   * Improve document completeness
   */
  private improveCompleteness(content: string, improvement: any): string {
    // Add missing information
    const addition = `\n\n## ${improvement.concept}\n\n${improvement.suggestion}\n`;
    return content + addition;
  }

  /**
   * Improve document accuracy
   */
  private improveAccuracy(content: string, improvement: any): string {
    // Add corrections or clarifications
    const correction = `\n\n> **Correction:** ${improvement.suggestion}\n`;
    return content + correction;
  }

  /**
   * Improve document engagement
   */
  private improveEngagement(content: string, improvement: any): string {
    // Add engaging elements
    const engagement = `\n\n### 💡 ${improvement.concept}\n\n${improvement.suggestion}\n`;
    return content + engagement;
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
      // Count node types
      const count = stats.nodeTypes.get(node.type) || 0;
      stats.nodeTypes.set(node.type, count + 1);
      
      // Calculate average complexity
      stats.averageComplexity += node.complexity;
      
      // Count relationships
      stats.totalRelationships += node.relationships.length;
    }

    stats.averageComplexity /= this.knowledgeGraph.size;

    return stats;
  }

  /**
   * Export knowledge base
   */
  async exportKnowledgeBase(outputPath: string): Promise<void> {
    const exportData = {
      nodes: Array.from(this.knowledgeGraph.values()),
      stats: this.getKnowledgeBaseStats(),
      exportedAt: new Date().toISOString()
    };

    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
    console.log(`📦 Knowledge base exported: ${outputPath}`);
  }
}

// Export the class
export default KnowledgeBaseCreator;

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const creator = new KnowledgeBaseCreator();
  
  // Example: Analyze codebase and generate documentation
  async function example() {
    try {
      // Analyze the codebase
      await creator.analyzeCodebase('./src', {
        includePatterns: ['**/*.ts', '**/*.tsx'],
        excludePatterns: ['**/node_modules/**', '**/dist/**']
      });

      // Generate tutorial documentation
      await creator.generateDocumentation(
        {
          type: 'tutorial',
          format: 'markdown',
          targetAudience: 'beginner',
          language: 'english',
          style: 'technical'
        },
        './output/tutorial.md',
        {
          focusAreas: ['H²GNN', 'PocketFlow'],
          includeExamples: true
        }
      );

      // Generate architecture documentation
      await creator.generateDocumentation(
        {
          type: 'architecture',
          format: 'html',
          targetAudience: 'advanced',
          language: 'english',
          style: 'technical'
        },
        './output/architecture.html',
        {
          focusAreas: ['core', 'integration'],
          includeDiagrams: true
        }
      );

      // Export knowledge base
      await creator.exportKnowledgeBase('./output/knowledge-base.json');

      console.log('✅ Knowledge base creation complete!');
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  example();
}
