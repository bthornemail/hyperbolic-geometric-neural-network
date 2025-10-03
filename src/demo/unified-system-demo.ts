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
  console.log('🚀 Starting Unified System Integration Demo...\n');

  try {
    // Initialize the unified system
    console.log('📡 Initializing Unified System...');
    const system = await initializeUnifiedSystem(DEMO_CONFIG);
    console.log('✅ Unified System initialized successfully!\n');

    // Display system status
    console.log('📊 System Status:');
    const status = system.getSystemStatus();
    Object.entries(status).forEach(([component, state]) => {
      const emoji = state === 'running' ? '✅' : state === 'error' ? '❌' : '⏳';
      console.log(`   ${emoji} ${component}: ${state}`);
    });
    console.log('');

    // Display HD addressing information
    console.log('🔗 HD Addressing Information:');
    const hdInfo = system.getHDAddressInfo();
    console.log(`   📍 System Address: ${hdInfo.path}`);
    console.log(`   🌐 RPC Endpoint: ${hdInfo.rpcEndpoint}`);
    console.log(`   🔑 Address Type: ${hdInfo.addressType}`);
    console.log(`   📡 Transport: ${hdInfo.transport}`);
    console.log('');

    // Display MCP integration status
    console.log('🔌 MCP Integration Status:');
    const mcpStatus = await system.getMCPIntegrationStatus();
    console.log(`   📊 Services: ${mcpStatus.services?.length || 0}`);
    console.log(`   🛠️  Tools: ${mcpStatus.tools?.length || 0}`);
    console.log(`   📚 Resources: ${mcpStatus.resources?.length || 0}`);
    console.log(`   💬 Prompts: ${mcpStatus.prompts?.length || 0}`);
    console.log('');

    // Demo 1: Basic Collaboration Session
    console.log('🤝 Demo 1: Basic Collaboration Session');
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
      console.log(`   ✅ Basic collaboration session created: ${basicSessionId}`);
    } catch (error) {
      console.log(`   ⚠️  Basic collaboration demo skipped: ${error}`);
    }
    console.log('');

    // Demo 2: Enhanced Collaboration Session with Code Analysis
    console.log('🔬 Demo 2: Enhanced Collaboration Session with Code Analysis');
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
      console.log(`   ✅ Enhanced collaboration session created: ${enhancedSessionId}`);
    } catch (error) {
      console.log(`   ⚠️  Enhanced collaboration demo skipped: ${error}`);
    }
    console.log('');

    // Demo 3: Code Analysis with LSP-AST Integration
    console.log('🔍 Demo 3: Code Analysis with LSP-AST Integration');
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
      console.log(`   ✅ Code analysis completed`);
      console.log(`   📊 Quality Score: ${analysisResult.astAnalysis?.quality || 'N/A'}`);
      console.log(`   🔍 Patterns Found: ${analysisResult.astAnalysis?.patterns?.length || 0}`);
      console.log(`   ⚠️  Violations: ${analysisResult.astAnalysis?.violations?.length || 0}`);
    } catch (error) {
      console.log(`   ⚠️  Code analysis demo skipped: ${error}`);
    }
    console.log('');

    // Demo 4: Code Suggestions
    console.log('💡 Demo 4: Intelligent Code Suggestions');
    try {
      const context = 'Create a function that validates email addresses';
      const suggestions = await system.generateCodeSuggestions(context, 'typescript');
      console.log(`   ✅ Generated ${suggestions?.length || 0} intelligent suggestions`);
      if (suggestions && suggestions.length > 0) {
        console.log(`   💡 Sample suggestion: ${suggestions[0]?.label || 'N/A'}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Code suggestions demo skipped: ${error}`);
    }
    console.log('');

    // Demo 5: Hyperbolic Embeddings Processing
    console.log('🧮 Demo 5: Hyperbolic Embeddings Processing');
    try {
      const embeddings = [
        { id: 'concept1', embedding: [0.1, 0.2, 0.3], metadata: { concept: 'machine learning' } },
        { id: 'concept2', embedding: [0.4, 0.5, 0.6], metadata: { concept: 'neural networks' } },
        { id: 'concept3', embedding: [0.7, 0.8, 0.9], metadata: { concept: 'deep learning' } }
      ];

      const processedEmbeddings = await system.processEmbeddings(embeddings);
      console.log(`   ✅ Processed ${embeddings.length} hyperbolic embeddings`);
      console.log(`   📊 Processing result: ${processedEmbeddings ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.log(`   ⚠️  Embeddings processing demo skipped: ${error}`);
    }
    console.log('');

    // Demo 6: Visualization Update
    console.log('📊 Demo 6: Visualization Update');
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
      console.log(`   ✅ Visualization updated with ${visualizationData.nodes.length} nodes and ${visualizationData.edges.length} edges`);
    } catch (error) {
      console.log(`   ⚠️  Visualization demo skipped: ${error}`);
    }
    console.log('');

    // Demo 7: Real-time Collaboration Session
    console.log('👥 Demo 7: Real-time Collaboration Session');
    try {
      const collaborationSessionId = await system.startCollaborationSession(
        'Demo Collaboration',
        [
          { id: 'user1', name: 'Alice', role: 'researcher' },
          { id: 'user2', name: 'Bob', role: 'developer' }
        ]
      );
      console.log(`   ✅ Real-time collaboration session started: ${collaborationSessionId}`);
      
      // Simulate some collaboration activity
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await system.stopCollaborationSession(collaborationSessionId);
      console.log(`   ✅ Real-time collaboration session stopped`);
    } catch (error) {
      console.log(`   ⚠️  Real-time collaboration demo skipped: ${error}`);
    }
    console.log('');

    // Display final metrics
    console.log('📈 Final System Metrics:');
    const metrics = system.getSystemMetrics();
    console.log(`   ⚡ Performance: ${metrics.performance.averageResponseTime}ms avg response time`);
    console.log(`   👥 Collaboration: ${metrics.collaboration.activeUsers} active users`);
    console.log(`   📊 Visualization: ${metrics.visualization.renderedNodes} nodes rendered`);
    console.log(`   🔍 LSP-AST: ${metrics.lspAst.analyzedFiles} files analyzed`);
    console.log(`   🔗 HD Addressing: ${metrics.hdAddressing.addressesGenerated} addresses generated`);
    console.log('');

    // Shutdown the system
    console.log('🛑 Shutting down Unified System...');
    await system.shutdown();
    console.log('✅ Unified System shutdown complete!');

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
