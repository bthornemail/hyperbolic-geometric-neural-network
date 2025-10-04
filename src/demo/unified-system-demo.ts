#!/usr/bin/env node

/**
 * Unified System Integration Demo
 * 
 * This demo showcases the complete unified H²GNN system with all components
 * integrated: real-time collaboration, visualization, LSP-AST integration,
 * HD addressing, and MCP services.
 */

import { initializeUnifiedSystem, DEFAULT_UNIFIED_SYSTEM_CONFIG } from '../integration/unified-system-integration.js';

/**
 * Demo configuration
 */
const DEMO_CONFIG = {
  ...DEFAULT_UNIFIED_SYSTEM_CONFIG,
  collaboration: {
    maxParticipants: 10,
    presenceTimeout: 300000,
    sessionTimeout: 3600000,
    enableRealTimeSync: true
  },
  visualization: {
    container: '#demo-visualization',
    width: 1200,
    height: 800,
    enableRealTimeUpdates: true,
    enableCollaboration: true,
    enableConfidenceVisualization: true
  },
  lspAst: {
    enableCodeAnalysis: true,
    enableRefactoring: true,
    enableIntelligentCompletion: true
  },
  hdAddressing: {
    seed: 'demo-unified-system-seed',
    network: 'testnet' as const,
    enableDeterministicRouting: true
  },
  collaborationInterfaces: {
    enableBasicCollaboration: true,
    enableEnhancedCollaboration: true,
    enableLSPASTIntegration: true
  }
};

/**
 * Run the unified system demo
 */
async function runUnifiedSystemDemo(): Promise<void> {
  console.warn('🚀 Starting Unified System Integration Demo...\n');

  try {
    // Initialize the unified system
    console.warn('📡 Initializing Unified System...');
    const system = await initializeUnifiedSystem(DEMO_CONFIG);
    console.warn('✅ Unified System initialized successfully!\n');

    // Display system status
    console.warn('📊 System Status:');
    const status = system.getSystemStatus();
    Object.entries(status).forEach(([component, state]) => {
      const emoji = state === 'running' ? '✅' : state === 'error' ? '❌' : '⏳';
      console.warn(`   ${emoji} ${component}: ${state}`);
    });
    console.warn('');

    // Display HD addressing information
    console.warn('🔗 HD Addressing Information:');
    const hdInfo = system.getHDAddressInfo();
    console.warn(`   📍 System Address: ${hdInfo.path}`);
    console.warn(`   🌐 RPC Endpoint: ${hdInfo.rpcEndpoint}`);
    console.warn(`   🔑 Address Type: ${hdInfo.addressType}`);
    console.warn(`   📡 Transport: ${hdInfo.transport}`);
    console.warn('');

    // Display MCP integration status
    console.warn('🔌 MCP Integration Status:');
    const mcpStatus = await system.getMCPIntegrationStatus();
    console.warn(`   📊 Services: ${mcpStatus.services?.length || 0}`);
    console.warn(`   🛠️  Tools: ${mcpStatus.tools?.length || 0}`);
    console.warn(`   📚 Resources: ${mcpStatus.resources?.length || 0}`);
    console.warn(`   💬 Prompts: ${mcpStatus.prompts?.length || 0}`);
    console.warn('');

    // Demo 1: Basic Collaboration Session
    console.warn('🤝 Demo 1: Basic Collaboration Session');
    try {
      const basicSessionId = await system.createBasicCollaborationSession({
        domain: 'Machine Learning',
        participants: [
          { type: 'human', name: 'Alice', capabilities: ['domain expertise', 'problem definition'] },
          { type: 'ai', name: 'H²GNN Assistant', capabilities: ['semantic analysis', 'hyperbolic reasoning'] }
        ],
        goals: ['Understand hyperbolic geometry in ML', 'Explore concept relationships'],
        initialConcepts: ['hyperbolic space', 'neural networks', 'embedding']
      });
      console.warn(`   ✅ Basic collaboration session created: ${basicSessionId}`);
    } catch (error) {
      console.warn(`   ⚠️  Basic collaboration demo skipped: ${error}`);
    }
    console.warn('');

    // Demo 2: Enhanced Collaboration Session with Code Analysis
    console.warn('🔬 Demo 2: Enhanced Collaboration Session with Code Analysis');
    try {
      const enhancedSessionId = await system.createEnhancedCollaborationSession({
        domain: 'Software Development',
        concepts: ['typescript', 'ast', 'lsp', 'mcp'],
        goals: ['Analyze codebase structure', 'Improve code quality', 'Generate intelligent suggestions'],
        codebase: {
          path: './src/integration',
          language: 'typescript'
        },
        participants: [
          { type: 'human', name: 'Bob', capabilities: ['software engineering', 'code review'] },
          { type: 'ai', name: 'LSP-AST Assistant', capabilities: ['code analysis', 'refactoring', 'intelligent completion'] }
        ]
      });
      console.warn(`   ✅ Enhanced collaboration session created: ${enhancedSessionId}`);
    } catch (error) {
      console.warn(`   ⚠️  Enhanced collaboration demo skipped: ${error}`);
    }
    console.warn('');

    // Demo 3: Code Analysis with LSP-AST Integration
    console.warn('🔍 Demo 3: Code Analysis with LSP-AST Integration');
    try {
      const sampleCode = `
interface User {
  id: string;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];
  
  addUser(user: User): void {
    this.users.push(user);
  }
  
  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }
}`;

      const analysisResult = await system.analyzeCode(sampleCode, 'typescript');
      console.warn(`   ✅ Code analysis completed`);
      console.warn(`   📊 Quality Score: ${analysisResult.astAnalysis?.quality || 'N/A'}`);
      console.warn(`   🔍 Patterns Found: ${analysisResult.astAnalysis?.patterns?.length || 0}`);
      console.warn(`   ⚠️  Violations: ${analysisResult.astAnalysis?.violations?.length || 0}`);
    } catch (error) {
      console.warn(`   ⚠️  Code analysis demo skipped: ${error}`);
    }
    console.warn('');

    // Demo 4: Code Suggestions
    console.warn('💡 Demo 4: Intelligent Code Suggestions');
    try {
      const context = 'Create a function that validates email addresses';
      const suggestions = await system.generateCodeSuggestions(context, 'typescript');
      console.warn(`   ✅ Generated ${suggestions?.length || 0} intelligent suggestions`);
      if (suggestions && suggestions.length > 0) {
        console.warn(`   💡 Sample suggestion: ${suggestions[0]?.label || 'N/A'}`);
      }
    } catch (error) {
      console.warn(`   ⚠️  Code suggestions demo skipped: ${error}`);
    }
    console.warn('');

    // Demo 5: Hyperbolic Embeddings Processing
    console.warn('🧮 Demo 5: Hyperbolic Embeddings Processing');
    try {
      const embeddings = [
        { id: 'concept1', embedding: [0.1, 0.2, 0.3], metadata: { concept: 'machine learning' } },
        { id: 'concept2', embedding: [0.4, 0.5, 0.6], metadata: { concept: 'neural networks' } },
        { id: 'concept3', embedding: [0.7, 0.8, 0.9], metadata: { concept: 'deep learning' } }
      ];

      const processedEmbeddings = await system.processEmbeddings(embeddings);
      console.warn(`   ✅ Processed ${embeddings.length} hyperbolic embeddings`);
      console.warn(`   📊 Processing result: ${processedEmbeddings ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.warn(`   ⚠️  Embeddings processing demo skipped: ${error}`);
    }
    console.warn('');

    // Demo 6: Visualization Update
    console.warn('📊 Demo 6: Visualization Update');
    try {
      const visualizationData = {
        nodes: [
          { id: 'node1', label: 'Machine Learning', x: 100, y: 100, color: '#ff6b6b' },
          { id: 'node2', label: 'Neural Networks', x: 200, y: 150, color: '#4ecdc4' },
          { id: 'node3', label: 'Deep Learning', x: 150, y: 250, color: '#45b7d1' }
        ],
        edges: [
          { source: 'node1', target: 'node2', weight: 0.8 },
          { source: 'node2', target: 'node3', weight: 0.9 }
        ]
      };

      await system.updateVisualization(visualizationData);
      console.warn(`   ✅ Visualization updated with ${visualizationData.nodes.length} nodes and ${visualizationData.edges.length} edges`);
    } catch (error) {
      console.warn(`   ⚠️  Visualization demo skipped: ${error}`);
    }
    console.warn('');

    // Demo 7: Real-time Collaboration Session
    console.warn('👥 Demo 7: Real-time Collaboration Session');
    try {
      const collaborationSessionId = await system.startCollaborationSession(
        'Demo Collaboration',
        [
          { id: 'user1', name: 'Alice', role: 'researcher' },
          { id: 'user2', name: 'Bob', role: 'developer' }
        ]
      );
      console.warn(`   ✅ Real-time collaboration session started: ${collaborationSessionId}`);
      
      // Simulate some collaboration activity
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await system.stopCollaborationSession(collaborationSessionId);
      console.warn(`   ✅ Real-time collaboration session stopped`);
    } catch (error) {
      console.warn(`   ⚠️  Real-time collaboration demo skipped: ${error}`);
    }
    console.warn('');

    // Display final metrics
    console.warn('📈 Final System Metrics:');
    const metrics = system.getSystemMetrics();
    console.warn(`   ⚡ Performance: ${metrics.performance.averageResponseTime}ms avg response time`);
    console.warn(`   👥 Collaboration: ${metrics.collaboration.activeUsers} active users`);
    console.warn(`   📊 Visualization: ${metrics.visualization.renderedNodes} nodes rendered`);
    console.warn(`   🔍 LSP-AST: ${metrics.lspAst.analyzedFiles} files analyzed`);
    console.warn(`   🔗 HD Addressing: ${metrics.hdAddressing.addressesGenerated} addresses generated`);
    console.warn('');

    // Shutdown the system
    console.warn('🛑 Shutting down Unified System...');
    await system.shutdown();
    console.warn('✅ Unified System shutdown complete!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

/**
 * Run the demo
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  runUnifiedSystemDemo().catch(console.error);
}

export { runUnifiedSystemDemo };
