#!/usr/bin/env node

/**
 * Knowledge Graph Demo
 * 
 * Demonstrates the knowledge graph generation capabilities
 * integrated with H²GNN hyperbolic embeddings
 */

import { fileURLToPath } from 'url';
import * as path from 'path';
import { KnowledgeGraphMCP } from '../mcp.restored.old/knowledge-graph-mcp-server-hd.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function demonstrateKnowledgeGraphGeneration() {
  console.warn('🔍 Knowledge Graph + H²GNN Demo\n');
  
  try {
    // Initialize the knowledge graph MCP
    const kgMCP = new KnowledgeGraphMCP();
    
    // Analyze the project source code
    const projectPath = path.resolve(__dirname, '../');
    console.warn(`📁 Analyzing project path: ${projectPath}\n`);
    
    const analysisResult = await kgMCP.analyzePathToKnowledgeGraph({
      path: projectPath,
      recursive: true,
      includeContent: false, // Skip content for faster demo
      maxDepth: 3,
      filePatterns: ['**/*.ts', '**/*.tsx'],
      excludePatterns: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/test-results/**']
    });
    
    console.warn('✅ Knowledge Graph Analysis Complete!');
    console.warn(analysisResult.content[0].text);
    console.warn('\n' + '='.repeat(60) + '\n');
    
    // Query the knowledge graph
    const queryResult = await kgMCP.queryKnowledgeGraph({
      query: 'hyperbolic',
      type: 'similarity',
      limit: 5
    });
    
    console.warn('🔍 Knowledge Graph Query Results:');
    console.warn(queryResult.content[0].text);
    console.warn('\n' + '='.repeat(60) + '\n');
    
    // Generate code based on knowledge graph
    const codeGenResult = await kgMCP.generateCodeFromGraph({
      type: 'function',
      description: 'calculate hyperbolic distance between two embeddings',
      context: {
        style: 'typescript',
        relatedNodes: []
      },
      constraints: {
        includeComments: true,
        maxLines: 20
      }
    });
    
    console.warn('🚀 Generated Code:');
    console.warn(codeGenResult.content[0].text);
    console.warn('\n' + '='.repeat(60) + '\n');
    
    // Generate documentation
    const docGenResult = await kgMCP.generateDocumentationFromGraph({
      type: 'api_docs',
      scope: [], // Use all nodes
      format: 'markdown',
      options: {
        includeCodeExamples: true,
        targetAudience: 'developer',
        detailLevel: 'medium'
      }
    });
    
    console.warn('📚 Generated Documentation:');
    console.warn(docGenResult.content[0].text);
    console.warn('\n' + '='.repeat(60) + '\n');
    
    // Get visualization data
    const vizResult = await kgMCP.getGraphVisualization({
      layout: 'hierarchical'
    });
    
    console.warn('📊 Visualization Data Generated:');
    console.warn(vizResult.content[0].text.substring(0, 500) + '...');
    console.warn('\n' + '='.repeat(60) + '\n');
    
    console.warn('🎉 Demo completed successfully!');
    console.warn('The knowledge graph system can:');
    console.warn('  ✓ Analyze codebases and generate hyperbolic embeddings');
    console.warn('  ✓ Query relationships and similarities');
    console.warn('  ✓ Generate code based on graph insights');
    console.warn('  ✓ Create documentation from code structure');
    console.warn('  ✓ Visualize code relationships in hyperbolic space');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    console.error(error instanceof Error ? error.stack : String(error));
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateKnowledgeGraphGeneration().catch(console.error);
}

export { demonstrateKnowledgeGraphGeneration };
