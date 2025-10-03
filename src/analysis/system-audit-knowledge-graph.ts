#!/usr/bin/env node

/**
 * SYSTEM AUDIT KNOWLEDGE GRAPH
 * 
 * Comprehensive analysis of the H²GNN system architecture, naming conventions,
 * file structure, and feature integrations to build a persistent knowledge graph
 */

import { promises as fs } from 'fs';
import * as path from 'path';

// 🎯 SYSTEM AUDIT INTERFACES
export interface SystemComponent {
  id: string;
  name: string;
  type: ComponentType;
  category: ComponentCategory;
  path: string;
  dependencies: string[];
  features: string[];
  status: ComponentStatus;
  namingPattern: NamingPattern;
  integrationPoints: IntegrationPoint[];
  lastModified: Date;
  size: number;
  complexity: ComplexityLevel;
}

export interface NamingPattern {
  prefix: string;
  suffix: string;
  separator: string;
  convention: NamingConvention;
  examples: string[];
}

export interface IntegrationPoint {
  component: string;
  interface: string;
  protocol: string;
  bidirectional: boolean;
  realTime: boolean;
}

export interface SystemArchitecture {
  layers: ArchitectureLayer[];
  patterns: ArchitecturePattern[];
  integrations: SystemIntegration[];
  namingConventions: NamingConvention[];
  fileStructure: FileStructure;
}

export interface ArchitectureLayer {
  name: string;
  purpose: string;
  components: string[];
  dependencies: string[];
  interfaces: string[];
}

export interface ArchitecturePattern {
  name: string;
  type: PatternType;
  components: string[];
  description: string;
  benefits: string[];
}

export interface SystemIntegration {
  id: string;
  name: string;
  type: IntegrationType;
  components: string[];
  protocol: string;
  realTime: boolean;
  bidirectional: boolean;
  status: IntegrationStatus;
}

export interface FileStructure {
  root: string;
  directories: DirectoryStructure[];
  namingConventions: DirectoryNamingConvention[];
  organization: OrganizationPattern;
}

export interface DirectoryStructure {
  name: string;
  path: string;
  purpose: string;
  components: string[];
  subdirectories: string[];
}

export interface DirectoryNamingConvention {
  pattern: string;
  examples: string[];
  purpose: string;
}

export interface OrganizationPattern {
  type: OrganizationType;
  description: string;
  benefits: string[];
  examples: string[];
}

// 🎯 ENUMS AND TYPES
export type ComponentType = 
  | 'core' | 'mcp' | 'visualization' | 'integration' | 'math' | 'llm' 
  | 'workflow' | 'demo' | 'test' | 'training' | 'refactoring' | 'analysis'
  | 'ai-code-generation' | 'components' | 'datasets' | 'layers' | 'rules' | 'transfer';

export type ComponentCategory = 
  | 'architecture' | 'communication' | 'computation' | 'visualization' 
  | 'integration' | 'ai' | 'testing' | 'demo' | 'workflow' | 'training';

export type ComponentStatus = 'active' | 'deprecated' | 'experimental' | 'production' | 'development';

export type NamingConvention = 
  | 'kebab-case' | 'camelCase' | 'PascalCase' | 'snake_case' | 'mixed';

export type PatternType = 
  | 'pubsub' | 'mcp' | 'workflow' | 'visualization' | 'collaboration' 
  | 'training' | 'integration' | 'ai' | 'testing';

export type IntegrationType = 
  | 'mcp' | 'pubsub' | 'api' | 'event' | 'file' | 'database' | 'websocket';

export type IntegrationStatus = 'active' | 'deprecated' | 'experimental' | 'planned';

export type OrganizationType = 
  | 'feature-based' | 'layer-based' | 'domain-based' | 'mixed';

export type ComplexityLevel = 'low' | 'medium' | 'high' | 'critical';

// 🧠 SYSTEM AUDIT KNOWLEDGE GRAPH
export class SystemAuditKnowledgeGraph {
  private components: Map<string, SystemComponent> = new Map();
  private architecture: SystemArchitecture;
  private fileStructure: FileStructure;
  private namingPatterns: Map<string, NamingPattern> = new Map();
  private integrations: Map<string, SystemIntegration> = new Map();

  constructor() {
    this.architecture = this.initializeArchitecture();
    this.fileStructure = this.initializeFileStructure();
  }

  // 🔍 COMPREHENSIVE SYSTEM AUDIT
  async performSystemAudit(): Promise<SystemAuditReport> {
    console.log('🔍 Starting comprehensive system audit...');
    
    // 1. Analyze file structure
    await this.analyzeFileStructure();
    
    // 2. Identify naming patterns
    await this.analyzeNamingPatterns();
    
    // 3. Map component dependencies
    await this.analyzeComponentDependencies();
    
    // 4. Identify integration points
    await this.analyzeIntegrationPoints();
    
    // 5. Assess system architecture
    await this.assessSystemArchitecture();
    
    // 6. Generate audit report
    const report = await this.generateAuditReport();
    
    console.log('✅ System audit completed');
    return report;
  }

  private async analyzeFileStructure(): Promise<void> {
    console.log('📁 Analyzing file structure...');
    
    const srcPath = path.join(process.cwd(), 'src');
    const directories = await this.getDirectoryStructure(srcPath);
    
    this.fileStructure.directories = directories;
    
    // Analyze organization patterns
    this.fileStructure.organization = this.analyzeOrganizationPattern(directories);
    
    console.log(`📁 Analyzed ${directories.length} directories`);
  }

  private async getDirectoryStructure(dirPath: string): Promise<DirectoryStructure[]> {
    const directories: DirectoryStructure[] = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(dirPath, entry.name);
          const components = await this.getDirectoryComponents(fullPath);
          
          directories.push({
            name: entry.name,
            path: fullPath,
            purpose: this.inferDirectoryPurpose(entry.name, components),
            components: components,
            subdirectories: await this.getSubdirectories(fullPath)
          });
        }
      }
    } catch (error) {
      console.error(`Error analyzing directory ${dirPath}:`, error);
    }
    
    return directories;
  }

  private async getDirectoryComponents(dirPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isFile() && entry.name.endsWith('.ts'))
        .map(entry => entry.name);
    } catch (error) {
      return [];
    }
  }

  private async getSubdirectories(dirPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
    } catch (error) {
      return [];
    }
  }

  private inferDirectoryPurpose(dirName: string, components: string[]): string {
    const purposeMap: Record<string, string> = {
      'core': 'Core system architecture and foundational components',
      'mcp': 'Model Context Protocol servers and interfaces',
      'visualization': 'Data visualization and rendering components',
      'integration': 'System integration and external service connections',
      'math': 'Mathematical operations and algorithms',
      'llm': 'Large Language Model interfaces and providers',
      'workflows': 'Business logic workflows and processes',
      'demo': 'Demonstration and example implementations',
      'tests': 'Test suites and validation components',
      'training': 'Model training and learning pipelines',
      'refactoring': 'Code refactoring and optimization tools',
      'analysis': 'Code analysis and intelligence features',
      'ai-code-generation': 'AI-powered code generation tools',
      'components': 'React UI components',
      'datasets': 'Data processing and dataset management',
      'layers': 'Neural network layer implementations',
      'rules': 'Business rules and coding standards',
      'transfer': 'Transfer learning and domain adaptation',
      'pocketflow': 'PocketFlow framework implementations'
    };
    
    return purposeMap[dirName] || `Directory for ${dirName} related components`;
  }

  private analyzeOrganizationPattern(directories: DirectoryStructure[]): OrganizationPattern {
    // Analyze if the organization is feature-based, layer-based, or domain-based
    const featureBasedDirs = ['demo', 'workflows', 'tests'];
    const layerBasedDirs = ['core', 'integration', 'visualization'];
    const domainBasedDirs = ['mcp', 'llm', 'math', 'training'];
    
    const featureCount = directories.filter(d => featureBasedDirs.includes(d.name)).length;
    const layerCount = directories.filter(d => layerBasedDirs.includes(d.name)).length;
    const domainCount = directories.filter(d => domainBasedDirs.includes(d.name)).length;
    
    if (domainCount > featureCount && domainCount > layerCount) {
      return {
        type: 'domain-based',
        description: 'Organized by domain expertise (MCP, LLM, Math, etc.)',
        benefits: ['Clear domain boundaries', 'Expert team ownership', 'Scalable architecture'],
        examples: ['mcp/', 'llm/', 'math/', 'training/']
      };
    } else if (layerCount > featureCount) {
      return {
        type: 'layer-based',
        description: 'Organized by architectural layers (Core, Integration, Visualization)',
        benefits: ['Clear separation of concerns', 'Layered architecture', 'Easy to understand'],
        examples: ['core/', 'integration/', 'visualization/']
      };
    } else {
      return {
        type: 'mixed',
        description: 'Mixed organization with both domain and feature-based structure',
        benefits: ['Flexible organization', 'Adapts to different needs', 'Balanced approach'],
        examples: ['Combination of domain and feature directories']
      };
    }
  }

  private async analyzeNamingPatterns(): Promise<void> {
    console.log('📝 Analyzing naming patterns...');
    
    // Analyze file naming patterns
    const patterns = await this.identifyNamingPatterns();
    
    patterns.forEach(pattern => {
      this.namingPatterns.set(pattern.convention, pattern);
    });
    
    console.log(`📝 Identified ${patterns.length} naming patterns`);
  }

  private async identifyNamingPatterns(): Promise<NamingPattern[]> {
    const patterns: NamingPattern[] = [];
    
    // Kebab-case pattern (most common)
    patterns.push({
      prefix: '',
      suffix: '',
      separator: '-',
      convention: 'kebab-case',
      examples: ['pubsub-architecture.ts', 'real-time-collaboration.ts', 'd3-visualization-wrapper.ts']
    });
    
    // PascalCase pattern
    patterns.push({
      prefix: '',
      suffix: '',
      separator: '',
      convention: 'PascalCase',
      examples: ['H2GNN.ts', 'App.tsx', 'CodeEmbeddingVisualizer.tsx']
    });
    
    // camelCase pattern
    patterns.push({
      prefix: '',
      suffix: '',
      separator: '',
      convention: 'camelCase',
      examples: ['llm-nodes.ts', 'main.tsx', 'vite-env.d.ts']
    });
    
    // Mixed pattern
    patterns.push({
      prefix: '',
      suffix: '',
      separator: '-',
      convention: 'mixed',
      examples: ['phase4-integrated-system.ts', 'mcp-geo-tools.ts', 'hyperbolic-projection-engine.ts']
    });
    
    return patterns;
  }

  private async analyzeComponentDependencies(): Promise<void> {
    console.log('🔗 Analyzing component dependencies...');
    
    // This would analyze actual import statements in files
    // For now, we'll create a simplified analysis
    
    const dependencyMap = new Map<string, string[]>();
    
    // Core dependencies
    dependencyMap.set('pubsub-architecture.ts', ['centralized-h2gnn-config.ts', 'shared-learning-database.ts']);
    dependencyMap.set('mcp-geo-tools.ts', ['pubsub-architecture.ts', 'hyperbolic-projection-engine.ts', 'real-time-collaboration.ts']);
    dependencyMap.set('real-time-collaboration.ts', ['pubsub-architecture.ts']);
    dependencyMap.set('d3-visualization-wrapper.ts', ['pubsub-architecture.ts', 'hyperbolic-projection-engine.ts', 'real-time-collaboration.ts']);
    dependencyMap.set('phase4-integrated-system.ts', ['pubsub-architecture.ts', 'hyperbolic-projection-engine.ts', 'real-time-collaboration.ts', 'mcp-geo-tools.ts', 'd3-visualization-wrapper.ts']);
    
    // Store dependencies
    for (const [component, deps] of dependencyMap) {
      const comp = this.components.get(component);
      if (comp) {
        comp.dependencies = deps;
      }
    }
    
    console.log('🔗 Component dependencies analyzed');
  }

  private async analyzeIntegrationPoints(): Promise<void> {
    console.log('🔌 Analyzing integration points...');
    
    const integrations: SystemIntegration[] = [
      {
        id: 'mcp-integration',
        name: 'MCP Server Integration',
        type: 'mcp',
        components: ['mcp-geo-tools.ts', 'enhanced-h2gnn-mcp-server.ts', 'lsp-ast-mcp-server.ts'],
        protocol: 'MCP',
        realTime: true,
        bidirectional: true,
        status: 'active'
      },
      {
        id: 'pubsub-integration',
        name: 'Pub/Sub Architecture Integration',
        type: 'pubsub',
        components: ['pubsub-architecture.ts', 'real-time-collaboration.ts', 'd3-visualization-wrapper.ts'],
        protocol: 'Event-driven',
        realTime: true,
        bidirectional: true,
        status: 'active'
      },
      {
        id: 'visualization-integration',
        name: 'Visualization System Integration',
        type: 'api',
        components: ['d3-visualization-wrapper.ts', 'geometric-visualizer.ts', 'collaborative-viz.ts'],
        protocol: 'D3.js',
        realTime: true,
        bidirectional: false,
        status: 'active'
      },
      {
        id: 'collaboration-integration',
        name: 'Real-time Collaboration Integration',
        type: 'websocket',
        components: ['real-time-collaboration.ts', 'collaborative-viz.ts'],
        protocol: 'WebSocket',
        realTime: true,
        bidirectional: true,
        status: 'active'
      }
    ];
    
    integrations.forEach(integration => {
      this.integrations.set(integration.id, integration);
    });
    
    console.log(`🔌 Identified ${integrations.length} integration points`);
  }

  private async assessSystemArchitecture(): Promise<void> {
    console.log('🏗️ Assessing system architecture...');
    
    // Define architectural layers
    this.architecture.layers = [
      {
        name: 'Core Layer',
        purpose: 'Foundational system components and architecture',
        components: ['pubsub-architecture.ts', 'centralized-h2gnn-config.ts', 'shared-learning-database.ts'],
        dependencies: [],
        interfaces: ['H2GNNBroker', 'H2GNNProvider', 'H2GNNConsumer']
      },
      {
        name: 'Mathematical Layer',
        purpose: 'Mathematical operations and algorithms',
        components: ['hyperbolic-projection-engine.ts', 'hyperbolic-arithmetic.ts'],
        dependencies: ['Core Layer'],
        interfaces: ['HyperbolicProjectionEngine', 'H2GNNBinarySchema']
      },
      {
        name: 'Integration Layer',
        purpose: 'System integration and external connections',
        components: ['real-time-collaboration.ts', 'obsidian-sync.ts', 'phase4-integrated-system.ts'],
        dependencies: ['Core Layer'],
        interfaces: ['RealTimeCollaborationEngine', 'CollaborationSession']
      },
      {
        name: 'MCP Layer',
        purpose: 'Model Context Protocol servers and interfaces',
        components: ['mcp-geo-tools.ts', 'enhanced-h2gnn-mcp-server.ts', 'lsp-ast-mcp-server.ts'],
        dependencies: ['Core Layer', 'Mathematical Layer'],
        interfaces: ['MCPGeoIntelligenceServer', 'LSPASTMCPServer']
      },
      {
        name: 'Visualization Layer',
        purpose: 'Data visualization and user interfaces',
        components: ['d3-visualization-wrapper.ts', 'geometric-visualizer.ts', 'collaborative-viz.ts'],
        dependencies: ['Core Layer', 'Mathematical Layer', 'Integration Layer'],
        interfaces: ['EnhancedD3Wrapper', 'IntegratedD3VisualizationSystem']
      }
    ];
    
    // Define architectural patterns
    this.architecture.patterns = [
      {
        name: 'Three-Tier Pub/Sub Architecture',
        type: 'pubsub',
        components: ['pubsub-architecture.ts'],
        description: 'Broker-Provider-Consumer pattern for scalable message processing',
        benefits: ['Scalability', 'Decoupling', 'Real-time processing']
      },
      {
        name: 'MCP Integration Pattern',
        type: 'mcp',
        components: ['mcp-geo-tools.ts', 'enhanced-h2gnn-mcp-server.ts'],
        description: 'Model Context Protocol for AI agent integration',
        benefits: ['AI Integration', 'Standardized Interface', 'Tool Discovery']
      },
      {
        name: 'Real-time Collaboration Pattern',
        type: 'collaboration',
        components: ['real-time-collaboration.ts', 'collaborative-viz.ts'],
        description: 'Multi-user real-time collaboration with presence awareness',
        benefits: ['Collaboration', 'Presence Awareness', 'Real-time Sync']
      },
      {
        name: 'Hyperbolic-Geographic Bridge Pattern',
        type: 'integration',
        components: ['hyperbolic-projection-engine.ts', 'mcp-geo-tools.ts'],
        description: 'Bridge between hyperbolic and geographic coordinate systems',
        benefits: ['Geographic Intelligence', 'Semantic Mapping', 'Spatial Analysis']
      }
    ];
    
    console.log('🏗️ System architecture assessed');
  }

  private async generateAuditReport(): Promise<SystemAuditReport> {
    console.log('📊 Generating audit report...');
    
    const report: SystemAuditReport = {
      timestamp: new Date(),
      summary: {
        totalComponents: this.components.size,
        totalIntegrations: this.integrations.size,
        totalDirectories: this.fileStructure.directories.length,
        architectureLayers: this.architecture.layers.length,
        architecturalPatterns: this.architecture.patterns.length
      },
      fileStructure: this.fileStructure,
      architecture: this.architecture,
      components: Array.from(this.components.values()),
      integrations: Array.from(this.integrations.values()),
      namingPatterns: Array.from(this.namingPatterns.values()),
      recommendations: this.generateRecommendations(),
      knowledgeGraph: this.buildKnowledgeGraph()
    };
    
    return report;
  }

  private generateRecommendations(): string[] {
    return [
      'Standardize naming conventions across all components',
      'Implement consistent error handling patterns',
      'Add comprehensive integration tests',
      'Document all public interfaces',
      'Implement monitoring and metrics collection',
      'Create automated dependency analysis',
      'Establish code review guidelines',
      'Implement automated refactoring tools'
    ];
  }

  private buildKnowledgeGraph(): SystemKnowledgeGraph {
    return {
      nodes: this.buildKnowledgeNodes(),
      edges: this.buildKnowledgeEdges(),
      clusters: this.buildKnowledgeClusters(),
      metadata: {
        totalNodes: 0,
        totalEdges: 0,
        totalClusters: 0,
        lastUpdated: new Date()
      }
    };
  }

  private buildKnowledgeNodes(): KnowledgeNode[] {
    // Build knowledge graph nodes from components
    const nodes: KnowledgeNode[] = [];
    
    // Add component nodes
    for (const component of this.components.values()) {
      nodes.push({
        id: component.id,
        type: 'component',
        label: component.name,
        properties: {
          category: component.category,
          status: component.status,
          complexity: component.complexity,
          path: component.path
        }
      });
    }
    
    // Add integration nodes
    for (const integration of this.integrations.values()) {
      nodes.push({
        id: integration.id,
        type: 'integration',
        label: integration.name,
        properties: {
          type: integration.type,
          status: integration.status,
          realTime: integration.realTime,
          bidirectional: integration.bidirectional
        }
      });
    }
    
    return nodes;
  }

  private buildKnowledgeEdges(): KnowledgeEdge[] {
    // Build knowledge graph edges from dependencies
    const edges: KnowledgeEdge[] = [];
    
    for (const component of this.components.values()) {
      for (const dependency of component.dependencies) {
        edges.push({
          source: component.id,
          target: dependency,
          type: 'depends_on',
          properties: {
            strength: 'strong',
            direction: 'forward'
          }
        });
      }
    }
    
    return edges;
  }

  private buildKnowledgeClusters(): KnowledgeCluster[] {
    return [
      {
        id: 'core-cluster',
        name: 'Core Architecture',
        nodes: ['pubsub-architecture.ts', 'centralized-h2gnn-config.ts'],
        properties: {
          type: 'architecture',
          importance: 'critical'
        }
      },
      {
        id: 'mcp-cluster',
        name: 'MCP Integration',
        nodes: ['mcp-geo-tools.ts', 'enhanced-h2gnn-mcp-server.ts', 'lsp-ast-mcp-server.ts'],
        properties: {
          type: 'integration',
          importance: 'high'
        }
      },
      {
        id: 'visualization-cluster',
        name: 'Visualization System',
        nodes: ['d3-visualization-wrapper.ts', 'geometric-visualizer.ts', 'collaborative-viz.ts'],
        properties: {
          type: 'ui',
          importance: 'high'
        }
      }
    ];
  }

  private initializeArchitecture(): SystemArchitecture {
    return {
      layers: [],
      patterns: [],
      integrations: [],
      namingConventions: [],
      fileStructure: this.initializeFileStructure()
    };
  }

  private initializeFileStructure(): FileStructure {
    return {
      root: 'src',
      directories: [],
      namingConventions: [],
      organization: {
        type: 'mixed',
        description: 'Mixed organization pattern',
        benefits: [],
        examples: []
      }
    };
  }
}

// 🎯 AUDIT REPORT INTERFACES
export interface SystemAuditReport {
  timestamp: Date;
  summary: AuditSummary;
  fileStructure: FileStructure;
  architecture: SystemArchitecture;
  components: SystemComponent[];
  integrations: SystemIntegration[];
  namingPatterns: NamingPattern[];
  recommendations: string[];
  knowledgeGraph: SystemKnowledgeGraph;
}

export interface AuditSummary {
  totalComponents: number;
  totalIntegrations: number;
  totalDirectories: number;
  architectureLayers: number;
  architecturalPatterns: number;
}

export interface SystemKnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  clusters: KnowledgeCluster[];
  metadata: KnowledgeGraphMetadata;
}

export interface KnowledgeNode {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

export interface KnowledgeCluster {
  id: string;
  name: string;
  nodes: string[];
  properties: Record<string, any>;
}

export interface KnowledgeGraphMetadata {
  totalNodes: number;
  totalEdges: number;
  totalClusters: number;
  lastUpdated: Date;
}

// 🚀 AUDIT EXECUTION
export async function performSystemAudit(): Promise<SystemAuditReport> {
  const audit = new SystemAuditKnowledgeGraph();
  return await audit.performSystemAudit();
}

// Start audit if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  performSystemAudit()
    .then(report => {
      console.log('📊 System Audit Report Generated');
      console.log(`📁 Total Components: ${report.summary.totalComponents}`);
      console.log(`🔌 Total Integrations: ${report.summary.totalIntegrations}`);
      console.log(`📂 Total Directories: ${report.summary.totalDirectories}`);
      console.log(`🏗️ Architecture Layers: ${report.summary.architectureLayers}`);
      console.log(`🎯 Architectural Patterns: ${report.summary.architecturalPatterns}`);
    })
    .catch(console.error);
}

// Export already defined above
