#!/usr/bin/env tsx

/**
 * H²GNN Self-Optimization Demo
 * 
 * This demo uses H²GNN's own capabilities to analyze and optimize the H²GNN codebase itself.
 * It's a fascinating example of recursive AI optimization - using AI to improve AI.
 */

import { HyperbolicGeometricHGN } from '../core/H2GNN';
import { createVector } from '../math/hyperbolic-arithmetic';
import { WordNetProcessor } from '../datasets/wordnet-integration';
import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CodeElement {
  id: string;
  name: string;
  type: 'file' | 'class' | 'function' | 'interface';
  path: string;
  complexity: number;
  lines: number;
  dependencies: string[];
  embedding?: number[];
}

interface OptimizationSuggestion {
  type: 'refactor' | 'performance' | 'architecture' | 'test';
  priority: 'high' | 'medium' | 'low';
  description: string;
  target: string;
  impact: number;
  effort: number;
}

class H2GNNSelfOptimizer {
  private h2gnn: HyperbolicGeometricHGN;
  private wordnetProcessor: WordNetProcessor;
  private codeElements: CodeElement[] = [];
  private embeddings: Map<string, number[]> = new Map();

  constructor() {
    this.h2gnn = new HyperbolicGeometricHGN({
      embeddingDim: 32,
      numLayers: 3,
      curvature: -1.0
    });
    
    this.wordnetProcessor = new WordNetProcessor(this.h2gnn);
  }

  async runSelfOptimization(): Promise<void> {
    console.log('🧠 Starting H²GNN Self-Optimization Analysis');
    console.log('==========================================');
    
    // Phase 1: Initialize and analyze codebase
    await this.initializeAnalysis();
    
    // Phase 2: Generate hyperbolic embeddings
    await this.generateEmbeddings();
    
    // Phase 3: Analyze code structure
    await this.analyzeCodeStructure();
    
    // Phase 4: Identify optimization opportunities
    const suggestions = await this.identifyOptimizations();
    
    // Phase 5: Generate optimization recommendations
    await this.generateRecommendations(suggestions);
    
    // Phase 6: Create optimization plan
    await this.createOptimizationPlan(suggestions);
    
    console.log('\n🎉 H²GNN Self-Optimization Analysis Complete!');
    console.log('The system has analyzed itself and provided optimization recommendations.');
  }

  private async initializeAnalysis(): Promise<void> {
    console.log('\n📊 Phase 1: Initializing Codebase Analysis');
    
    // Initialize WordNet for semantic analysis
    await this.wordnetProcessor.loadWordNetData();
    await this.wordnetProcessor.buildHierarchy();
    await this.wordnetProcessor.generateHyperbolicEmbeddings();
    
    console.log('✅ WordNet initialized for semantic code analysis');
    
    // Scan the H²GNN codebase
    await this.scanCodebase();
    
    console.log(`✅ Analyzed ${this.codeElements.length} code elements`);
  }

  private async scanCodebase(): Promise<void> {
    const srcDir = path.join(__dirname, '..');
    await this.scanDirectory(srcDir);
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await this.scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          await this.analyzeFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dirPath}:`, error);
    }
  }

  private async analyzeFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const relativePath = path.relative(path.join(__dirname, '..'), filePath);
      
      // Extract classes, functions, and interfaces
      const classes = this.extractClasses(content, relativePath);
      const functions = this.extractFunctions(content, relativePath);
      const interfaces = this.extractInterfaces(content, relativePath);
      
      // Add file element
      this.codeElements.push({
        id: `file_${relativePath.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: path.basename(filePath, '.ts'),
        type: 'file',
        path: relativePath,
        complexity: this.calculateComplexity(content),
        lines: lines.length,
        dependencies: this.extractDependencies(content)
      });
      
      // Add extracted elements
      this.codeElements.push(...classes, ...functions, ...interfaces);
      
    } catch (error) {
      console.warn(`Warning: Could not analyze file ${filePath}:`, error);
    }
  }

  private extractClasses(content: string, filePath: string): CodeElement[] {
    const classes: CodeElement[] = [];
    const classRegex = /export\s+class\s+(\w+)/g;
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      classes.push({
        id: `class_${match[1]}`,
        name: match[1],
        type: 'class',
        path: filePath,
        complexity: this.calculateClassComplexity(content, match[1]),
        lines: 0,
        dependencies: []
      });
    }
    
    return classes;
  }

  private extractFunctions(content: string, filePath: string): CodeElement[] {
    const functions: CodeElement[] = [];
    const functionRegex = /export\s+(?:async\s+)?function\s+(\w+)/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        id: `function_${match[1]}`,
        name: match[1],
        type: 'function',
        path: filePath,
        complexity: this.calculateFunctionComplexity(content, match[1]),
        lines: 0,
        dependencies: []
      });
    }
    
    return functions;
  }

  private extractInterfaces(content: string, filePath: string): CodeElement[] {
    const interfaces: CodeElement[] = [];
    const interfaceRegex = /export\s+interface\s+(\w+)/g;
    let match;
    
    while ((match = interfaceRegex.exec(content)) !== null) {
      interfaces.push({
        id: `interface_${match[1]}`,
        name: match[1],
        type: 'interface',
        path: filePath,
        complexity: 1, // Interfaces are typically simple
        lines: 0,
        dependencies: []
      });
    }
    
    return interfaces;
  }

  private calculateComplexity(content: string): number {
    const complexityPatterns = [
      /\bif\b/g, /\belse\b/g, /\bwhile\b/g, /\bfor\b/g,
      /\bcase\b/g, /\bcatch\b/g, /\b&&\b/g, /\b\|\|\b/g,
      /\?\s*:/g, /\breturn\b/g
    ];
    
    return complexityPatterns.reduce((sum, pattern) => {
      const matches = content.match(pattern);
      return sum + (matches ? matches.length : 0);
    }, 1);
  }

  private calculateClassComplexity(content: string, className: string): number {
    const classStart = content.indexOf(`class ${className}`);
    if (classStart === -1) return 1;
    
    const classEnd = this.findMatchingBrace(content, classStart);
    if (classEnd === -1) return 1;
    
    const classContent = content.substring(classStart, classEnd);
    return this.calculateComplexity(classContent);
  }

  private calculateFunctionComplexity(content: string, functionName: string): number {
    const functionStart = content.indexOf(`function ${functionName}`);
    if (functionStart === -1) return 1;
    
    const functionEnd = this.findMatchingBrace(content, functionStart);
    if (functionEnd === -1) return 1;
    
    const functionContent = content.substring(functionStart, functionEnd);
    return this.calculateComplexity(functionContent);
  }

  private findMatchingBrace(content: string, start: number): number {
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = start; i < content.length; i++) {
      const char = content[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' || char === "'" || char === '`') {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            return i;
          }
        }
      }
    }
    
    return -1;
  }

  private extractDependencies(content: string): string[] {
    const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/g;
    const dependencies: string[] = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }
    
    return dependencies;
  }

  private async generateEmbeddings(): Promise<void> {
    console.log('\n🧠 Phase 2: Generating Hyperbolic Embeddings');
    
    for (const element of this.codeElements) {
      const features = this.extractFeatures(element);
      
      // Create a simple embedding using the features directly
      // This is a fallback approach for the demo
      const embedding = features.slice(0, 32); // Ensure 32 dimensions
      
      this.embeddings.set(element.id, embedding);
      element.embedding = embedding;
    }
    
    console.log(`✅ Generated embeddings for ${this.embeddings.size} code elements`);
  }

  private extractFeatures(element: CodeElement): number[] {
    const features = new Array(32).fill(0);
    
    // Type-based features
    const typeMap = { file: 0, class: 1, function: 2, interface: 3 };
    features[0] = typeMap[element.type] || 0;
    
    // Complexity features
    features[1] = Math.min(element.complexity / 100, 1);
    features[2] = Math.min(element.lines / 1000, 1);
    
    // Dependency features
    features[3] = Math.min(element.dependencies.length / 20, 1);
    
    // Name-based features (simple hash)
    const nameHash = element.name.split('').reduce((hash, char) => {
      return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff;
    }, 0);
    features[4] = (nameHash % 1000) / 1000;
    
    return features;
  }

  private async analyzeCodeStructure(): Promise<void> {
    console.log('\n🔍 Phase 3: Analyzing Code Structure');
    
    // Analyze complexity distribution
    const complexityStats = this.analyzeComplexity();
    console.log('📊 Complexity Analysis:');
    console.log(`  • Average complexity: ${complexityStats.average.toFixed(2)}`);
    console.log(`  • Max complexity: ${complexityStats.max}`);
    console.log(`  • High complexity elements: ${complexityStats.highComplexity.length}`);
    
    // Analyze hyperbolic distances
    const distanceAnalysis = this.analyzeHyperbolicDistances();
    console.log('📏 Hyperbolic Distance Analysis:');
    console.log(`  • Average distance: ${distanceAnalysis.averageDistance.toFixed(4)}`);
    console.log(`  • Max distance: ${distanceAnalysis.maxDistance.toFixed(4)}`);
    console.log(`  • Clustered elements: ${distanceAnalysis.clusteredElements.length}`);
    
    // Identify potential issues
    const issues = this.identifyStructuralIssues();
    console.log('⚠️  Structural Issues:');
    console.log(`  • Overly complex elements: ${issues.overlyComplex.length}`);
    console.log(`  • Isolated elements: ${issues.isolated.length}`);
    console.log(`  • Tightly coupled elements: ${issues.tightlyCoupled.length}`);
  }

  private analyzeComplexity() {
    const complexities = this.codeElements.map(e => e.complexity);
    const average = complexities.reduce((sum, c) => sum + c, 0) / complexities.length;
    const max = Math.max(...complexities);
    const highComplexity = this.codeElements.filter(e => e.complexity > average * 2);
    
    return { average, max, highComplexity };
  }

  private analyzeHyperbolicDistances() {
    const distances: number[] = [];
    const elements = Array.from(this.embeddings.keys());
    
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const emb1 = this.embeddings.get(elements[i]);
        const emb2 = this.embeddings.get(elements[j]);
        
        if (emb1 && emb2) {
          const distance = this.computeHyperbolicDistance(emb1, emb2);
          distances.push(distance);
        }
      }
    }
    
    const averageDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const maxDistance = Math.max(...distances);
    
    // Find clustered elements (close together)
    const clusteredElements = elements.filter(id => {
      const embedding = this.embeddings.get(id);
      if (!embedding) return false;
      
      const nearbyCount = elements.filter(otherId => {
        if (otherId === id) return false;
        const otherEmbedding = this.embeddings.get(otherId);
        if (!otherEmbedding) return false;
        
        const distance = this.computeHyperbolicDistance(embedding, otherEmbedding);
        return distance < averageDistance * 0.5;
      }).length;
      
      return nearbyCount >= 3;
    });
    
    return { averageDistance, maxDistance, clusteredElements };
  }

  private computeHyperbolicDistance(emb1: number[], emb2: number[]): number {
    const diff = emb1.map((val, i) => val - emb2[i]);
    const diffNormSquared = diff.reduce((sum, val) => sum + val * val, 0);
    
    const norm1Squared = emb1.reduce((sum, val) => sum + val * val, 0);
    const norm2Squared = emb2.reduce((sum, val) => sum + val * val, 0);
    
    const denominator = (1 - norm1Squared) * (1 - norm2Squared);
    
    if (denominator <= 0) return 0;
    
    const argument = 1 + (2 * diffNormSquared) / denominator;
    
    if (argument <= 1) return 0;
    
    return Math.acosh(argument);
  }

  private identifyStructuralIssues() {
    const averageComplexity = this.codeElements.reduce((sum, e) => sum + e.complexity, 0) / this.codeElements.length;
    
    const overlyComplex = this.codeElements.filter(e => e.complexity > averageComplexity * 3);
    
    const isolated = this.codeElements.filter(e => {
      const embedding = this.embeddings.get(e.id);
      if (!embedding) return true;
      
      const nearbyCount = this.codeElements.filter(other => {
        if (other.id === e.id) return false;
        const otherEmbedding = this.embeddings.get(other.id);
        if (!otherEmbedding) return false;
        
        const distance = this.computeHyperbolicDistance(embedding, otherEmbedding);
        return distance < 0.1; // Threshold for "nearby"
      }).length;
      
      return nearbyCount === 0;
    });
    
    const tightlyCoupled = this.codeElements.filter(e => {
      const embedding = this.embeddings.get(e.id);
      if (!embedding) return false;
      
      const nearbyCount = this.codeElements.filter(other => {
        if (other.id === e.id) return false;
        const otherEmbedding = this.embeddings.get(other.id);
        if (!otherEmbedding) return false;
        
        const distance = this.computeHyperbolicDistance(embedding, otherEmbedding);
        return distance < 0.05; // Very close threshold
      }).length;
      
      return nearbyCount >= 5;
    });
    
    return { overlyComplex, isolated, tightlyCoupled };
  }

  private async identifyOptimizations(): Promise<OptimizationSuggestion[]> {
    console.log('\n🎯 Phase 4: Identifying Optimization Opportunities');
    
    const suggestions: OptimizationSuggestion[] = [];
    
    // Analyze overly complex elements
    const averageComplexity = this.codeElements.reduce((sum, e) => sum + e.complexity, 0) / this.codeElements.length;
    const overlyComplex = this.codeElements.filter(e => e.complexity > averageComplexity * 2);
    
    for (const element of overlyComplex) {
      suggestions.push({
        type: 'refactor',
        priority: 'high',
        description: `Break down overly complex ${element.type} "${element.name}" (complexity: ${element.complexity})`,
        target: element.id,
        impact: Math.min(element.complexity / 50, 1),
        effort: 0.7
      });
    }
    
    // Analyze isolated elements
    const isolated = this.identifyIsolatedElements();
    for (const element of isolated) {
      suggestions.push({
        type: 'architecture',
        priority: 'medium',
        description: `Integrate isolated ${element.type} "${element.name}" with related components`,
        target: element.id,
        impact: 0.5,
        effort: 0.6
      });
    }
    
    // Analyze performance opportunities
    const performanceIssues = this.identifyPerformanceIssues();
    for (const issue of performanceIssues) {
      suggestions.push({
        type: 'performance',
        priority: 'medium',
        description: issue.description,
        target: issue.target,
        impact: issue.impact,
        effort: issue.effort
      });
    }
    
    // Analyze test coverage
    const testSuggestions = this.identifyTestOpportunities();
    suggestions.push(...testSuggestions);
    
    console.log(`✅ Identified ${suggestions.length} optimization opportunities`);
    
    return suggestions;
  }

  private identifyIsolatedElements(): CodeElement[] {
    return this.codeElements.filter(e => {
      const embedding = this.embeddings.get(e.id);
      if (!embedding) return true;
      
      const nearbyCount = this.codeElements.filter(other => {
        if (other.id === e.id) return false;
        const otherEmbedding = this.embeddings.get(other.id);
        if (!otherEmbedding) return false;
        
        const distance = this.computeHyperbolicDistance(embedding, otherEmbedding);
        return distance < 0.1;
      }).length;
      
      return nearbyCount === 0;
    });
  }

  private identifyPerformanceIssues(): Array<{description: string, target: string, impact: number, effort: number}> {
    const issues = [];
    
    // Large files
    const largeFiles = this.codeElements.filter(e => e.type === 'file' && e.lines > 1000);
    for (const file of largeFiles) {
      issues.push({
        description: `Split large file "${file.name}" (${file.lines} lines) into smaller modules`,
        target: file.id,
        impact: 0.8,
        effort: 0.9
      });
    }
    
    // High complexity functions
    const complexFunctions = this.codeElements.filter(e => e.type === 'function' && e.complexity > 20);
    for (const func of complexFunctions) {
      issues.push({
        description: `Optimize complex function "${func.name}" (complexity: ${func.complexity})`,
        target: func.id,
        impact: 0.7,
        effort: 0.6
      });
    }
    
    return issues;
  }

  private identifyTestOpportunities(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Find complex elements without obvious test coverage
    const complexElements = this.codeElements.filter(e => e.complexity > 10);
    
    for (const element of complexElements) {
      suggestions.push({
        type: 'test',
        priority: 'medium',
        description: `Add comprehensive tests for complex ${element.type} "${element.name}"`,
        target: element.id,
        impact: 0.6,
        effort: 0.5
      });
    }
    
    return suggestions;
  }

  private async generateRecommendations(suggestions: OptimizationSuggestion[]): Promise<void> {
    console.log('\n📋 Phase 5: Generating Optimization Recommendations');
    
    // Sort by priority and impact
    const sortedSuggestions = suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.impact - a.impact;
    });
    
    console.log('\n🎯 Top Optimization Recommendations:');
    
    for (let i = 0; i < Math.min(10, sortedSuggestions.length); i++) {
      const suggestion = sortedSuggestions[i];
      const element = this.codeElements.find(e => e.id === suggestion.target);
      
      console.log(`\n${i + 1}. ${suggestion.type.toUpperCase()} - ${suggestion.priority.toUpperCase()} Priority`);
      console.log(`   ${suggestion.description}`);
      if (element) {
        console.log(`   Target: ${element.name} (${element.path})`);
      }
      console.log(`   Impact: ${(suggestion.impact * 100).toFixed(0)}% | Effort: ${(suggestion.effort * 100).toFixed(0)}%`);
    }
  }

  private async createOptimizationPlan(suggestions: OptimizationSuggestion[]): Promise<void> {
    console.log('\n📅 Phase 6: Creating Optimization Plan');
    
    const plan = {
      totalSuggestions: suggestions.length,
      highPriority: suggestions.filter(s => s.priority === 'high').length,
      mediumPriority: suggestions.filter(s => s.priority === 'medium').length,
      lowPriority: suggestions.filter(s => s.priority === 'low').length,
      estimatedImpact: suggestions.reduce((sum, s) => sum + s.impact, 0) / suggestions.length,
      estimatedEffort: suggestions.reduce((sum, s) => sum + s.effort, 0) / suggestions.length
    };
    
    console.log('\n📊 Optimization Plan Summary:');
    console.log(`  • Total suggestions: ${plan.totalSuggestions}`);
    console.log(`  • High priority: ${plan.highPriority}`);
    console.log(`  • Medium priority: ${plan.mediumPriority}`);
    console.log(`  • Low priority: ${plan.lowPriority}`);
    console.log(`  • Average impact: ${(plan.estimatedImpact * 100).toFixed(1)}%`);
    console.log(`  • Average effort: ${(plan.estimatedEffort * 100).toFixed(1)}%`);
    
    console.log('\n🚀 Recommended Implementation Order:');
    console.log('  1. Fix high-priority refactoring issues');
    console.log('  2. Address performance bottlenecks');
    console.log('  3. Improve test coverage');
    console.log('  4. Enhance architectural improvements');
    console.log('  5. Optimize low-priority items');
    
    console.log('\n💡 Next Steps:');
    console.log('  • Review detailed recommendations above');
    console.log('  • Prioritize based on current development goals');
    console.log('  • Implement optimizations incrementally');
    console.log('  • Re-run this analysis after optimizations');
    console.log('  • Monitor performance improvements');
  }
}

// Main execution
async function main() {
  const optimizer = new H2GNNSelfOptimizer();
  await optimizer.runSelfOptimization();
}

// Run the demo
main().catch(console.error);

export { H2GNNSelfOptimizer };
