/**
 * Code Hyperbolic Embeddings Generator
 * 
 * This module analyzes the project's TypeScript/TSX codebase and generates
 * hyperbolic embeddings using H²GNN to represent code structure, relationships,
 * and hierarchies in hyperbolic space.
 */

import { HyperbolicGeometricHGN, TrainingData } from '../core/H2GNN';
import { HyperbolicArithmetic, Vector, createVector } from '../math/hyperbolic-arithmetic';
import { promises as fs } from 'fs';
import * as path from 'path';

// Code element types
export interface CodeElement {
  id: string;
  type: 'file' | 'class' | 'function' | 'interface' | 'import' | 'variable';
  name: string;
  filePath: string;
  content: string;
  dependencies: string[];
  exports: string[];
  imports: string[];
  complexity: number;
  lineCount: number;
  embedding?: Vector;
}

export interface CodeHierarchy {
  elements: CodeElement[];
  relationships: CodeRelationship[];
  metrics: CodeMetrics;
}

export interface CodeRelationship {
  from: string;
  to: string;
  type: 'imports' | 'extends' | 'implements' | 'calls' | 'references' | 'contains';
  weight: number;
}

export interface CodeMetrics {
  totalFiles: number;
  totalLines: number;
  avgComplexity: number;
  maxDepth: number;
  connectivityScore: number;
}

export class CodeEmbeddingGenerator {
  private h2gnn: HyperbolicGeometricHGN;
  private projectRoot: string;
  private codeElements: Map<string, CodeElement> = new Map();
  private relationships: CodeRelationship[] = [];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.h2gnn = new HyperbolicGeometricHGN({
      embeddingDim: 64,
      curvature: -1.0,
      numLayers: 4
    });
  }

  /**
   * Analyze the entire project and generate embeddings
   */
  async analyzeProject(): Promise<CodeHierarchy> {
    console.log('🔍 Starting project code analysis...');
    
    // Step 1: Discover all TypeScript files
    const files = await this.discoverFiles();
    console.log(`📁 Found ${files.length} TypeScript files`);
    
    // Step 2: Parse each file and extract elements
    for (const filePath of files) {
      await this.analyzeFile(filePath);
    }
    
    // Step 3: Build relationships between elements
    this.buildRelationships();
    
    // Step 4: Generate hyperbolic embeddings
    await this.generateEmbeddings();
    
    // Step 5: Calculate metrics
    const metrics = this.calculateMetrics();
    
    console.log('✅ Code analysis completed');
    return {
      elements: Array.from(this.codeElements.values()),
      relationships: this.relationships,
      metrics
    };
  }

  /**
   * Discover all TypeScript/TSX files in the project
   */
  private async discoverFiles(): Promise<string[]> {
    const files: string[] = [];
    
    async function walkDirectory(dir: string): Promise<void> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            // Skip node_modules, .git, and other build directories
            if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) {
              await walkDirectory(fullPath);
            }
          } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not read directory ${dir}:`, error);
      }
    }
    
    await walkDirectory(this.projectRoot);
    return files;
  }

  /**
   * Analyze a single file and extract code elements
   */
  private async analyzeFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.projectRoot, filePath);
      
      // Create file element
      const fileElement: CodeElement = {
        id: relativePath,
        type: 'file',
        name: path.basename(filePath),
        filePath: relativePath,
        content,
        dependencies: [],
        exports: [],
        imports: [],
        complexity: this.calculateComplexity(content),
        lineCount: content.split('\n').length
      };
      
      // Extract imports
      fileElement.imports = this.extractImports(content);
      
      // Extract exports
      fileElement.exports = this.extractExports(content);
      
      // Extract classes, functions, interfaces
      const elements = this.extractCodeElements(content, relativePath);
      
      // Store file element
      this.codeElements.set(fileElement.id, fileElement);
      
      // Store extracted elements
      for (const element of elements) {
        this.codeElements.set(element.id, element);
      }
      
    } catch (error) {
      console.warn(`Warning: Could not analyze file ${filePath}:`, error);
    }
  }

  /**
   * Extract imports from file content
   */
  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  /**
   * Extract exports from file content
   */
  private extractExports(content: string): string[] {
    const exports: string[] = [];
    
    // Export declarations
    const exportRegex = /export\s+(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    // Default exports
    const defaultExportRegex = /export\s+default\s+(?:class\s+)?(\w+)/g;
    while ((match = defaultExportRegex.exec(content)) !== null) {
      exports.push(`default:${match[1]}`);
    }
    
    return exports;
  }

  /**
   * Extract code elements (classes, functions, interfaces) from content
   */
  private extractCodeElements(content: string, filePath: string): CodeElement[] {
    const elements: CodeElement[] = [];
    
    // Extract classes
    const classRegex = /(?:export\s+)?class\s+(\w+)/g;
    let match;
    while ((match = classRegex.exec(content)) !== null) {
      elements.push({
        id: `${filePath}:class:${match[1]}`,
        type: 'class',
        name: match[1],
        filePath,
        content: this.extractBlockContent(content, match.index),
        dependencies: [],
        exports: [],
        imports: [],
        complexity: this.calculateComplexity(this.extractBlockContent(content, match.index)),
        lineCount: this.extractBlockContent(content, match.index).split('\n').length
      });
    }
    
    // Extract functions
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
    while ((match = functionRegex.exec(content)) !== null) {
      elements.push({
        id: `${filePath}:function:${match[1]}`,
        type: 'function',
        name: match[1],
        filePath,
        content: this.extractBlockContent(content, match.index),
        dependencies: [],
        exports: [],
        imports: [],
        complexity: this.calculateComplexity(this.extractBlockContent(content, match.index)),
        lineCount: this.extractBlockContent(content, match.index).split('\n').length
      });
    }
    
    // Extract interfaces
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      elements.push({
        id: `${filePath}:interface:${match[1]}`,
        type: 'interface',
        name: match[1],
        filePath,
        content: this.extractBlockContent(content, match.index),
        dependencies: [],
        exports: [],
        imports: [],
        complexity: this.calculateComplexity(this.extractBlockContent(content, match.index)),
        lineCount: this.extractBlockContent(content, match.index).split('\n').length
      });
    }
    
    return elements;
  }

  /**
   * Extract block content (class/function/interface body)
   */
  private extractBlockContent(content: string, startIndex: number): string {
    let braceCount = 0;
    let inBlock = false;
    let blockStart = -1;
    
    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      
      if (char === '{') {
        if (!inBlock) {
          inBlock = true;
          blockStart = i;
        }
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && inBlock) {
          return content.substring(blockStart, i + 1);
        }
      }
    }
    
    // Fallback: return next 500 characters
    return content.substring(startIndex, Math.min(startIndex + 500, content.length));
  }

  /**
   * Calculate code complexity (simplified cyclomatic complexity)
   */
  private calculateComplexity(content: string): number {
    let complexity = 1; // Base complexity
    
    // Count decision points
    const patterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bswitch\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\?\s*.*?:/g, // Ternary operator
      /&&/g,
      /\|\|/g
    ];
    
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return complexity;
  }

  /**
   * Build relationships between code elements
   */
  private buildRelationships(): void {
    console.log('🔗 Building code relationships...');
    
    for (const element of this.codeElements.values()) {
      if (element.type === 'file') {
        // Build import relationships
        for (const importPath of element.imports) {
          this.addRelationship(element.id, this.resolveImportPath(importPath, element.filePath), 'imports', 1.0);
        }
      }
      
      // Build containment relationships
      if (element.type !== 'file') {
        const fileId = element.filePath;
        this.addRelationship(fileId, element.id, 'contains', 0.8);
      }
      
      // Build reference relationships based on content analysis
      this.analyzeContentReferences(element);
    }
    
    console.log(`📊 Built ${this.relationships.length} relationships`);
  }

  /**
   * Resolve import path to actual file path
   */
  private resolveImportPath(importPath: string, fromFile: string): string {
    // Handle relative imports
    if (importPath.startsWith('.')) {
      const fromDir = path.dirname(fromFile);
      return path.normalize(path.join(fromDir, importPath));
    }
    
    // Handle absolute imports (simplified)
    return importPath;
  }

  /**
   * Add a relationship between code elements
   */
  private addRelationship(from: string, to: string, type: CodeRelationship['type'], weight: number): void {
    this.relationships.push({ from, to, type, weight });
  }

  /**
   * Analyze content for cross-references
   */
  private analyzeContentReferences(element: CodeElement): void {
    // Look for references to other elements in the content
    for (const [otherId, otherElement] of this.codeElements.entries()) {
      if (otherId !== element.id && otherElement.type !== 'file') {
        if (element.content.includes(otherElement.name)) {
          this.addRelationship(element.id, otherId, 'references', 0.5);
        }
      }
    }
  }

  /**
   * Generate hyperbolic embeddings for all code elements
   */
  private async generateEmbeddings(): Promise<void> {
    console.log('🧠 Generating hyperbolic embeddings...');
    
    // Prepare training data
    const trainingData = this.prepareTrainingData();
    
    // Train H²GNN
    await this.h2gnn.train([trainingData]);
    
    // Generate embeddings
    const result = await this.h2gnn.predict(trainingData);
    
    // Assign embeddings to elements
    const elements = Array.from(this.codeElements.values());
    for (let i = 0; i < elements.length && i < result.embeddings.length; i++) {
      elements[i].embedding = result.embeddings[i];
    }
    
    console.log('✅ Generated embeddings for all code elements');
  }

  /**
   * Prepare training data for H²GNN
   */
  private prepareTrainingData(): TrainingData {
    const nodes: Vector[] = [];
    const elementList = Array.from(this.codeElements.values());
    const elementMap = new Map<string, number>();
    
    // Convert elements to feature vectors
    elementList.forEach((element, index) => {
      const features = this.elementToFeatures(element);
      nodes.push(createVector(features));
      elementMap.set(element.id, index);
    });
    
    // Convert relationships to edges
    const edges: [number, number][] = [];
    for (const rel of this.relationships) {
      const fromIdx = elementMap.get(rel.from);
      const toIdx = elementMap.get(rel.to);
      
      if (fromIdx !== undefined && toIdx !== undefined) {
        edges.push([fromIdx, toIdx]);
      }
    }
    
    return { nodes, edges };
  }

  /**
   * Convert code element to feature vector
   */
  private elementToFeatures(element: CodeElement): number[] {
    const features = new Array(64).fill(0);
    
    // Element type features
    const typeMap = { file: 0, class: 1, function: 2, interface: 3, import: 4, variable: 5 };
    features[0] = (typeMap[element.type] || 0) / 5;
    
    // Complexity features
    features[1] = Math.min(element.complexity / 20, 1);
    
    // Size features
    features[2] = Math.min(element.lineCount / 100, 1);
    features[3] = Math.min(element.content.length / 1000, 1);
    
    // Dependency features
    features[4] = Math.min(element.imports.length / 10, 1);
    features[5] = Math.min(element.exports.length / 10, 1);
    features[6] = Math.min(element.dependencies.length / 10, 1);
    
    // File path features (directory depth)
    const pathDepth = element.filePath.split('/').length;
    features[7] = Math.min(pathDepth / 10, 1);
    
    // Content-based features
    const contentWords = element.content.toLowerCase().split(/\s+/);
    const keywords = [
      'class', 'function', 'interface', 'type', 'const', 'let', 'var',
      'import', 'export', 'async', 'await', 'return', 'if', 'else',
      'for', 'while', 'switch', 'case', 'try', 'catch', 'throw'
    ];
    
    keywords.forEach((keyword, i) => {
      if (i < 20) {
        const count = contentWords.filter(word => word.includes(keyword)).length;
        features[8 + i] = Math.min(count / 10, 1);
      }
    });
    
    // File extension features
    if (element.filePath.endsWith('.tsx')) features[28] = 1;
    if (element.filePath.endsWith('.ts')) features[29] = 1;
    if (element.filePath.includes('test')) features[30] = 1;
    if (element.filePath.includes('demo')) features[31] = 1;
    
    // Name-based features (simple hash)
    const nameHash = this.simpleHash(element.name);
    for (let i = 32; i < 64; i++) {
      features[i] = ((nameHash >> (i - 32)) & 1);
    }
    
    return features;
  }

  /**
   * Simple hash function for strings
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Calculate project metrics
   */
  private calculateMetrics(): CodeMetrics {
    const elements = Array.from(this.codeElements.values());
    const files = elements.filter(e => e.type === 'file');
    
    const totalLines = elements.reduce((sum, e) => sum + e.lineCount, 0);
    const avgComplexity = elements.reduce((sum, e) => sum + e.complexity, 0) / elements.length;
    
    // Calculate max depth (directory nesting)
    const maxDepth = Math.max(...files.map(f => f.filePath.split('/').length));
    
    // Calculate connectivity score
    const connectivityScore = this.relationships.length / Math.max(elements.length, 1);
    
    return {
      totalFiles: files.length,
      totalLines,
      avgComplexity,
      maxDepth,
      connectivityScore
    };
  }

  /**
   * Find semantically similar code elements
   */
  findSimilarElements(elementId: string, topK: number = 5): Array<{ element: CodeElement; distance: number }> {
    const targetElement = this.codeElements.get(elementId);
    if (!targetElement?.embedding) {
      throw new Error(`Element ${elementId} not found or no embedding available`);
    }
    
    const similarities: Array<{ element: CodeElement; distance: number }> = [];
    
    for (const element of this.codeElements.values()) {
      if (element.id === elementId || !element.embedding) continue;
      
      const distance = HyperbolicArithmetic.distance(targetElement.embedding, element.embedding);
      similarities.push({ element, distance });
    }
    
    // Sort by hyperbolic distance (smaller = more similar)
    similarities.sort((a, b) => a.distance - b.distance);
    
    return similarities.slice(0, topK);
  }

  /**
   * Export embeddings for visualization
   */
  exportEmbeddings(): Array<{ id: string; name: string; type: string; embedding: number[]; metadata: any }> {
    return Array.from(this.codeElements.values())
      .filter(e => e.embedding)
      .map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        embedding: e.embedding!.data,
        metadata: {
          filePath: e.filePath,
          complexity: e.complexity,
          lineCount: e.lineCount,
          imports: e.imports.length,
          exports: e.exports.length
        }
      }));
  }
}

// Helper function to analyze a project
export async function analyzeProjectCode(projectRoot: string): Promise<CodeHierarchy> {
  const generator = new CodeEmbeddingGenerator(projectRoot);
  return await generator.analyzeProject();
}

export default CodeEmbeddingGenerator;
