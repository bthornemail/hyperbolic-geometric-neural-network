#!/usr/bin/env tsx

/**
 * DevOps Semantic and Syntax Space Analysis
 * 
 * This demo analyzes the /home/main/devops directory to understand:
 * - Semantic relationships between files and concepts
 * - Syntax patterns and code organization
 * - Knowledge graph construction
 * - H²GNN improvement opportunities
 */

import EnhancedH2GNN, { PersistenceConfig } from '../core/enhanced-h2gnn';
import { HyperbolicGeometricHGN } from '../core/H2GNN';
import { promises as fs } from 'fs';
import * as path from 'path';

interface FileAnalysis {
  path: string;
  name: string;
  extension: string;
  size: number;
  lines: number;
  complexity: number;
  semanticCategory: string;
  syntaxPattern: string;
  dependencies: string[];
  concepts: string[];
  relationships: string[];
}

interface SemanticSpace {
  concepts: Map<string, number[]>;
  relationships: Array<{source: string, target: string, type: string, strength: number}>;
  categories: Map<string, string[]>;
  patterns: Map<string, string[]>;
}

interface SyntaxSpace {
  patterns: Map<string, number>;
  structures: Map<string, string[]>;
  conventions: Map<string, string[]>;
  improvements: string[];
}

class DevOpsSemanticAnalyzer {
  private enhancedH2GNN: EnhancedH2GNN;
  private fileAnalyses: FileAnalysis[] = [];
  private semanticSpace: SemanticSpace;
  private syntaxSpace: SyntaxSpace;
  private analysisPath: string;

  constructor(analysisPath: string) {
    this.analysisPath = analysisPath;
    
    const h2gnnConfig = {
      embeddingDim: 64,
      numLayers: 4,
      curvature: -1.0
    };

    const persistenceConfig: PersistenceConfig = {
      storagePath: './persistence',
      maxMemories: 10000,
      consolidationThreshold: 50,
      retrievalStrategy: 'hybrid',
      compressionEnabled: true
    };

    this.enhancedH2GNN = new EnhancedH2GNN(h2gnnConfig, persistenceConfig);
    this.semanticSpace = {
      concepts: new Map(),
      relationships: [],
      categories: new Map(),
      patterns: new Map()
    };
    this.syntaxSpace = {
      patterns: new Map(),
      structures: new Map(),
      conventions: new Map(),
      improvements: []
    };
  }

  async runFullAnalysis(): Promise<void> {
    console.warn('🔍 DevOps Semantic and Syntax Space Analysis');
    console.warn('============================================');
    console.warn(`📁 Analyzing: ${this.analysisPath}`);
    
    // Phase 1: File Discovery and Analysis
    await this.discoverAndAnalyzeFiles();
    
    // Phase 2: Semantic Space Analysis
    await this.analyzeSemanticSpace();
    
    // Phase 3: Syntax Space Analysis
    await this.analyzeSyntaxSpace();
    
    // Phase 4: H²GNN Learning Integration
    await this.integrateH2GNNLearning();
    
    // Phase 5: Improvement Recommendations
    await this.generateImprovementRecommendations();
    
    // Phase 6: Persistence and Knowledge Storage
    await this.persistKnowledge();
    
    console.warn('\n🎉 DevOps Semantic and Syntax Analysis Complete!');
  }

  private async discoverAndAnalyzeFiles(): Promise<void> {
    console.warn('\n📊 Phase 1: File Discovery and Analysis');
    console.warn('Discovering and analyzing files...');
    
    await this.scanDirectory(this.analysisPath);
    
    console.warn(`✅ Analyzed ${this.fileAnalyses.length} files`);
    
    // Show file distribution
    const extensions = new Map<string, number>();
    const categories = new Map<string, number>();
    
    for (const file of this.fileAnalyses) {
      extensions.set(file.extension, (extensions.get(file.extension) || 0) + 1);
      categories.set(file.semanticCategory, (categories.get(file.semanticCategory) || 0) + 1);
    }
    
    console.warn('\n📈 File Distribution:');
    console.warn('Extensions:');
    for (const [ext, count] of extensions) {
      console.warn(`  • ${ext}: ${count} files`);
    }
    
    console.warn('\nSemantic Categories:');
    for (const [category, count] of categories) {
      console.warn(`  • ${category}: ${count} files`);
    }
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await this.scanDirectory(fullPath);
        } else if (entry.isFile()) {
          await this.analyzeFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dirPath}:`, error);
    }
  }

  private async analyzeFile(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const relativePath = path.relative(this.analysisPath, filePath);
      
      const analysis: FileAnalysis = {
        path: relativePath,
        name: path.basename(filePath),
        extension: path.extname(filePath),
        size: stats.size,
        lines: lines.length,
        complexity: this.calculateComplexity(content),
        semanticCategory: this.categorizeSemantically(filePath, content),
        syntaxPattern: this.identifySyntaxPattern(content),
        dependencies: this.extractDependencies(content),
        concepts: this.extractConcepts(content),
        relationships: []
      };
      
      this.fileAnalyses.push(analysis);
      
    } catch (error) {
      console.warn(`Warning: Could not analyze file ${filePath}:`, error);
    }
  }

  private calculateComplexity(content: string): number {
    const complexityPatterns = [
      /\bif\b/g, /\belse\b/g, /\bwhile\b/g, /\bfor\b/g,
      /\bcase\b/g, /\bcatch\b/g, /\b&&\b/g, /\b\|\|\b/g,
      /\?\s*:/g, /\breturn\b/g, /\bfunction\b/g, /\bclass\b/g
    ];
    
    return complexityPatterns.reduce((sum, pattern) => {
      const matches = content.match(pattern);
      return sum + (matches ? matches.length : 0);
    }, 1);
  }

  private categorizeSemantically(filePath: string, content: string): string {
    const pathLower = filePath.toLowerCase();
    const contentLower = content.toLowerCase();
    
    // DevOps categories
    if (pathLower.includes('docker') || contentLower.includes('dockerfile')) {
      return 'containerization';
    } else if (pathLower.includes('k8s') || pathLower.includes('kubernetes')) {
      return 'orchestration';
    } else if (pathLower.includes('terraform') || contentLower.includes('terraform')) {
      return 'infrastructure';
    } else if (pathLower.includes('ansible') || contentLower.includes('ansible')) {
      return 'configuration';
    } else if (pathLower.includes('jenkins') || contentLower.includes('jenkins')) {
      return 'ci_cd';
    } else if (pathLower.includes('monitoring') || contentLower.includes('prometheus')) {
      return 'monitoring';
    } else if (pathLower.includes('security') || contentLower.includes('vault')) {
      return 'security';
    } else if (pathLower.includes('script') || pathLower.endsWith('.sh')) {
      return 'automation';
    } else if (pathLower.includes('config') || pathLower.endsWith('.conf')) {
      return 'configuration';
    } else if (pathLower.includes('test') || pathLower.endsWith('.test.')) {
      return 'testing';
    } else if (pathLower.includes('docs') || pathLower.endsWith('.md')) {
      return 'documentation';
    } else if (pathLower.endsWith('.py')) {
      return 'python_automation';
    } else if (pathLower.endsWith('.js') || pathLower.endsWith('.ts')) {
      return 'javascript_automation';
    } else if (pathLower.endsWith('.yaml') || pathLower.endsWith('.yml')) {
      return 'configuration';
    } else if (pathLower.endsWith('.json')) {
      return 'data_configuration';
    } else {
      return 'general';
    }
  }

  private identifySyntaxPattern(content: string): string {
    if (content.includes('#!/bin/bash') || content.includes('#!/bin/sh')) {
      return 'shell_script';
    } else if (content.includes('FROM ') && content.includes('RUN ')) {
      return 'dockerfile';
    } else if (content.includes('apiVersion:') && content.includes('kind:')) {
      return 'kubernetes_manifest';
    } else if (content.includes('terraform {') || content.includes('resource "')) {
      return 'terraform_config';
    } else if (content.includes('hosts:') && content.includes('tasks:')) {
      return 'ansible_playbook';
    } else if (content.includes('pipeline {') || content.includes('stages {')) {
      return 'jenkins_pipeline';
    } else if (content.includes('def ') && content.includes('import ')) {
      return 'python_script';
    } else if (content.includes('function ') && content.includes('const ')) {
      return 'javascript_module';
    } else if (content.includes('package ') && content.includes('import ')) {
      return 'go_module';
    } else if (content.includes('FROM ') && content.includes('COPY ')) {
      return 'docker_compose';
    } else {
      return 'text_configuration';
    }
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    // Docker dependencies
    const dockerFrom = content.match(/FROM\s+([^\s]+)/g);
    if (dockerFrom) {
      dependencies.push(...dockerFrom.map(match => match.replace('FROM ', '')));
    }
    
    // Python dependencies
    const pythonImports = content.match(/import\s+([^\s]+)/g);
    if (pythonImports) {
      dependencies.push(...pythonImports.map(match => match.replace('import ', '')));
    }
    
    // JavaScript dependencies
    const jsRequires = content.match(/require\(['"]([^'"]+)['"]\)/g);
    if (jsRequires) {
      dependencies.push(...jsRequires.map(match => match.replace(/require\(['"]([^'"]+)['"]\)/, '$1')));
    }
    
    // Kubernetes dependencies
    const k8sKinds = content.match(/kind:\s*([^\s]+)/g);
    if (k8sKinds) {
      dependencies.push(...k8sKinds.map(match => match.replace('kind: ', '')));
    }
    
    return dependencies;
  }

  private extractConcepts(content: string): string[] {
    const concepts: string[] = [];
    const contentLower = content.toLowerCase();
    
    // DevOps concepts
    const devopsConcepts = [
      'containerization', 'orchestration', 'infrastructure', 'configuration',
      'monitoring', 'logging', 'security', 'automation', 'deployment',
      'scaling', 'load_balancing', 'service_mesh', 'microservices',
      'ci_cd', 'testing', 'quality_assurance', 'compliance'
    ];
    
    for (const concept of devopsConcepts) {
      if (contentLower.includes(concept)) {
        concepts.push(concept);
      }
    }
    
    // Technology concepts
    const techConcepts = [
      'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins',
      'prometheus', 'grafana', 'elasticsearch', 'kibana', 'vault',
      'consul', 'nomad', 'traefik', 'nginx', 'haproxy'
    ];
    
    for (const concept of techConcepts) {
      if (contentLower.includes(concept)) {
        concepts.push(concept);
      }
    }
    
    return concepts;
  }

  private async analyzeSemanticSpace(): Promise<void> {
    console.warn('\n🧠 Phase 2: Semantic Space Analysis');
    console.warn('Analyzing semantic relationships...');
    
    // Group files by semantic category
    const categoryGroups = new Map<string, FileAnalysis[]>();
    for (const file of this.fileAnalyses) {
      if (!categoryGroups.has(file.semanticCategory)) {
        categoryGroups.set(file.semanticCategory, []);
      }
      categoryGroups.get(file.semanticCategory)!.push(file);
    }
    
    // Analyze semantic relationships
    for (const [category, files] of categoryGroups) {
      console.warn(`\n📊 Analyzing category: ${category} (${files.length} files)`);
      
      // Extract concepts from all files in category
      const categoryConcepts = new Set<string>();
      for (const file of files) {
        file.concepts.forEach(concept => categoryConcepts.add(concept));
      }
      
      this.semanticSpace.categories.set(category, Array.from(categoryConcepts));
      
      // Learn concepts with H²GNN
      for (const concept of categoryConcepts) {
        await this.enhancedH2GNN.learnWithMemory(
          concept,
          {
            category,
            files: files.length,
            context: 'devops_semantic_analysis'
          },
          { domain: category, type: 'concept' },
          0.8
        );
      }
    }
    
    // Analyze cross-category relationships
    await this.analyzeCrossCategoryRelationships();
    
    console.warn(`✅ Semantic space analysis complete`);
    console.warn(`   • Categories: ${this.semanticSpace.categories.size}`);
    console.warn(`   • Total concepts: ${Array.from(this.semanticSpace.categories.values()).flat().length}`);
  }

  private async analyzeCrossCategoryRelationships(): Promise<void> {
    console.warn('\n🔗 Analyzing cross-category relationships...');
    
    const categories = Array.from(this.semanticSpace.categories.keys());
    
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        const cat1 = categories[i];
        const cat2 = categories[j];
        const concepts1 = this.semanticSpace.categories.get(cat1) || [];
        const concepts2 = this.semanticSpace.categories.get(cat2) || [];
        
        // Find common concepts
        const commonConcepts = concepts1.filter(c => concepts2.includes(c));
        
        if (commonConcepts.length > 0) {
          this.semanticSpace.relationships.push({
            source: cat1,
            target: cat2,
            type: 'semantic_overlap',
            strength: commonConcepts.length / Math.max(concepts1.length, concepts2.length)
          });
          
          console.warn(`  • ${cat1} ↔ ${cat2}: ${commonConcepts.length} common concepts`);
        }
      }
    }
  }

  private async analyzeSyntaxSpace(): Promise<void> {
    console.warn('\n📝 Phase 3: Syntax Space Analysis');
    console.warn('Analyzing syntax patterns and structures...');
    
    // Analyze syntax patterns
    const patternCounts = new Map<string, number>();
    const structureMap = new Map<string, string[]>();
    const conventionMap = new Map<string, string[]>();
    
    for (const file of this.fileAnalyses) {
      const pattern = file.syntaxPattern;
      patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
      
      if (!structureMap.has(pattern)) {
        structureMap.set(pattern, []);
      }
      structureMap.get(pattern)!.push(file.path);
      
      // Analyze conventions
      const conventions = this.analyzeConventions(file);
      for (const convention of conventions) {
        if (!conventionMap.has(convention)) {
          conventionMap.set(convention, []);
        }
        conventionMap.get(convention)!.push(file.path);
      }
    }
    
    this.syntaxSpace.patterns = patternCounts;
    this.syntaxSpace.structures = structureMap;
    this.syntaxSpace.conventions = conventionMap;
    
    console.warn('\n📊 Syntax Pattern Distribution:');
    for (const [pattern, count] of patternCounts) {
      console.warn(`  • ${pattern}: ${count} files`);
    }
    
    console.warn('\n📋 Convention Analysis:');
    for (const [convention, files] of conventionMap) {
      console.warn(`  • ${convention}: ${files.length} files`);
    }
    
    console.warn(`✅ Syntax space analysis complete`);
  }

  private analyzeConventions(file: FileAnalysis): string[] {
    const conventions: string[] = [];
    
    // File naming conventions
    if (file.name.includes('_')) {
      conventions.push('snake_case_naming');
    } else if (file.name.includes('-')) {
      conventions.push('kebab_case_naming');
    } else if (file.name.match(/[A-Z]/)) {
      conventions.push('camelCase_naming');
    }
    
    // Directory structure conventions
    if (file.path.includes('/src/')) {
      conventions.push('src_directory_structure');
    } else if (file.path.includes('/test/')) {
      conventions.push('test_directory_structure');
    } else if (file.path.includes('/config/')) {
      conventions.push('config_directory_structure');
    }
    
    // File extension conventions
    if (file.extension === '.sh') {
      conventions.push('shell_script_convention');
    } else if (file.extension === '.py') {
      conventions.push('python_script_convention');
    } else if (file.extension === '.yaml' || file.extension === '.yml') {
      conventions.push('yaml_configuration_convention');
    }
    
    return conventions;
  }

  private async integrateH2GNNLearning(): Promise<void> {
    console.warn('\n🧠 Phase 4: H²GNN Learning Integration');
    console.warn('Integrating DevOps knowledge with H²GNN learning...');
    
    // Learn DevOps concepts
    const devopsConcepts = [
      'containerization', 'orchestration', 'infrastructure_as_code',
      'continuous_integration', 'continuous_deployment', 'monitoring',
      'logging', 'security', 'automation', 'scaling'
    ];
    
    for (const concept of devopsConcepts) {
      await this.enhancedH2GNN.learnWithMemory(
        concept,
        {
          definition: `DevOps concept: ${concept}`,
          category: 'devops',
          files: this.fileAnalyses.filter(f => f.concepts.includes(concept)).length
        },
        { domain: 'devops', type: 'concept' },
        0.9
      );
    }
    
    // Learn technology patterns
    const techPatterns = [
      'docker_containerization', 'kubernetes_orchestration', 'terraform_infrastructure',
      'ansible_automation', 'jenkins_ci_cd', 'prometheus_monitoring'
    ];
    
    for (const pattern of techPatterns) {
      await this.enhancedH2GNN.learnWithMemory(
        pattern,
        {
          definition: `Technology pattern: ${pattern}`,
          category: 'technology',
          files: this.fileAnalyses.filter(f => f.syntaxPattern.includes(pattern.split('_')[0])).length
        },
        { domain: 'technology', type: 'pattern' },
        0.8
      );
    }
    
    console.warn('✅ H²GNN learning integration complete');
  }

  private async generateImprovementRecommendations(): Promise<void> {
    console.warn('\n🎯 Phase 5: Improvement Recommendations');
    console.warn('Generating H²GNN-based improvement recommendations...');
    
    const recommendations: string[] = [];
    
    // Analyze semantic gaps
    const semanticGaps = this.identifySemanticGaps();
    recommendations.push(...semanticGaps);
    
    // Analyze syntax improvements
    const syntaxImprovements = this.identifySyntaxImprovements();
    recommendations.push(...syntaxImprovements);
    
    // Analyze architectural improvements
    const architecturalImprovements = this.identifyArchitecturalImprovements();
    recommendations.push(...architecturalImprovements);
    
    // Analyze automation opportunities
    const automationOpportunities = this.identifyAutomationOpportunities();
    recommendations.push(...automationOpportunities);
    
    console.warn('\n📋 H²GNN-Based Improvement Recommendations:');
    for (let i = 0; i < recommendations.length; i++) {
      console.warn(`\n${i + 1}. ${recommendations[i]}`);
    }
    
    this.syntaxSpace.improvements = recommendations;
  }

  private identifySemanticGaps(): string[] {
    const gaps: string[] = [];
    
    // Check for missing DevOps concepts
    const requiredConcepts = [
      'monitoring', 'logging', 'security', 'backup', 'disaster_recovery',
      'performance_optimization', 'cost_optimization', 'compliance'
    ];
    
    const existingConcepts = Array.from(this.semanticSpace.categories.values()).flat();
    
    for (const concept of requiredConcepts) {
      if (!existingConcepts.includes(concept)) {
        gaps.push(`Missing semantic concept: ${concept} - Consider adding monitoring, logging, or security configurations`);
      }
    }
    
    return gaps;
  }

  private identifySyntaxImprovements(): string[] {
    const improvements: string[] = [];
    
    // Analyze naming conventions
    const namingInconsistencies = this.findNamingInconsistencies();
    improvements.push(...namingInconsistencies);
    
    // Analyze structure improvements
    const structureImprovements = this.findStructureImprovements();
    improvements.push(...structureImprovements);
    
    return improvements;
  }

  private findNamingInconsistencies(): string[] {
    const inconsistencies: string[] = [];
    
    const snakeCaseFiles = this.fileAnalyses.filter(f => f.name.includes('_')).length;
    const kebabCaseFiles = this.fileAnalyses.filter(f => f.name.includes('-')).length;
    const camelCaseFiles = this.fileAnalyses.filter(f => f.name.match(/[A-Z]/)).length;
    
    if (snakeCaseFiles > 0 && kebabCaseFiles > 0) {
      inconsistencies.push('Inconsistent naming convention: Mix of snake_case and kebab-case detected');
    }
    
    if (camelCaseFiles > 0 && (snakeCaseFiles > 0 || kebabCaseFiles > 0)) {
      inconsistencies.push('Inconsistent naming convention: Mix of camelCase and other conventions detected');
    }
    
    return inconsistencies;
  }

  private findStructureImprovements(): string[] {
    const improvements: string[] = [];
    
    // Check for proper directory structure
    const hasSrcDir = this.fileAnalyses.some(f => f.path.includes('/src/'));
    const hasConfigDir = this.fileAnalyses.some(f => f.path.includes('/config/'));
    const hasTestDir = this.fileAnalyses.some(f => f.path.includes('/test/'));
    
    if (!hasSrcDir) {
      improvements.push('Missing /src/ directory structure - Consider organizing source code');
    }
    
    if (!hasConfigDir) {
      improvements.push('Missing /config/ directory structure - Consider centralizing configuration files');
    }
    
    if (!hasTestDir) {
      improvements.push('Missing /test/ directory structure - Consider adding test organization');
    }
    
    return improvements;
  }

  private identifyArchitecturalImprovements(): string[] {
    const improvements: string[] = [];
    
    // Check for microservices patterns
    const hasDockerFiles = this.fileAnalyses.some(f => f.syntaxPattern === 'dockerfile');
    const hasK8sManifests = this.fileAnalyses.some(f => f.syntaxPattern === 'kubernetes_manifest');
    
    if (hasDockerFiles && !hasK8sManifests) {
      improvements.push('Containerized but not orchestrated: Consider adding Kubernetes manifests for orchestration');
    }
    
    // Check for infrastructure as code
    const hasTerraform = this.fileAnalyses.some(f => f.syntaxPattern === 'terraform_config');
    const hasAnsible = this.fileAnalyses.some(f => f.syntaxPattern === 'ansible_playbook');
    
    if (!hasTerraform && !hasAnsible) {
      improvements.push('Missing Infrastructure as Code: Consider adding Terraform or Ansible for infrastructure management');
    }
    
    return improvements;
  }

  private identifyAutomationOpportunities(): string[] {
    const opportunities: string[] = [];
    
    // Check for CI/CD
    const hasJenkins = this.fileAnalyses.some(f => f.syntaxPattern === 'jenkins_pipeline');
    const hasScripts = this.fileAnalyses.some(f => f.syntaxPattern === 'shell_script');
    
    if (hasScripts && !hasJenkins) {
      opportunities.push('Manual scripts detected: Consider automating with CI/CD pipelines');
    }
    
    // Check for monitoring
    const hasMonitoring = this.fileAnalyses.some(f => f.semanticCategory === 'monitoring');
    if (!hasMonitoring) {
      opportunities.push('Missing monitoring: Consider adding Prometheus, Grafana, or other monitoring solutions');
    }
    
    return opportunities;
  }

  private async persistKnowledge(): Promise<void> {
    console.warn('\n💾 Phase 6: Persistence and Knowledge Storage');
    console.warn('Storing analysis results in persistence layer...');
    
    // Store file analysis results
    await this.enhancedH2GNN.learnWithMemory(
      'devops_file_analysis',
      {
        totalFiles: this.fileAnalyses.length,
        categories: Array.from(this.semanticSpace.categories.keys()),
        patterns: Array.from(this.syntaxSpace.patterns.keys()),
        improvements: this.syntaxSpace.improvements
      },
      { domain: 'devops_analysis', type: 'analysis' },
      0.9
    );
    
    // Store semantic space knowledge
    await this.enhancedH2GNN.learnWithMemory(
      'devops_semantic_space',
      {
        concepts: Array.from(this.semanticSpace.categories.entries()),
        relationships: this.semanticSpace.relationships,
        totalConcepts: Array.from(this.semanticSpace.categories.values()).flat().length
      },
      { domain: 'semantic_analysis', type: 'space' },
      0.8
    );
    
    // Store syntax space knowledge
    await this.enhancedH2GNN.learnWithMemory(
      'devops_syntax_space',
      {
        patterns: Array.from(this.syntaxSpace.patterns.entries()),
        structures: Array.from(this.syntaxSpace.structures.entries()),
        conventions: Array.from(this.syntaxSpace.conventions.entries())
      },
      { domain: 'syntax_analysis', type: 'space' },
      0.8
    );
    
    console.warn('✅ Knowledge persistence complete');
    
    // Get system status
    const status = this.enhancedH2GNN.getSystemStatus();
    console.warn(`\n📊 Persistence Status:`);
    console.warn(`  • Total memories: ${status.totalMemories}`);
    console.warn(`  • Understanding snapshots: ${status.totalSnapshots}`);
    console.warn(`  • Learning domains: ${status.totalDomains}`);
    console.warn(`  • Average confidence: ${status.averageConfidence.toFixed(3)}`);
  }
}

// Main execution
async function main() {
  const analyzer = new DevOpsSemanticAnalyzer('/home/main/devops');
  await analyzer.runFullAnalysis();
}

// Run the analysis only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DevOpsSemanticAnalyzer };
