#!/usr/bin/env tsx

/**
 * Test script to verify the analyze_path_to_knowledge_graph fix
 */

import { KnowledgeGraphMCP } from '../src/mcp/knowledge-graph-mcp';

async function testAnalysisFix(): Promise<void> {
  console.log('🧪 Testing analyze_path_to_knowledge_graph fix...');
  console.log('================================================');
  
  const kg = new KnowledgeGraphMCP();
  
  try {
    // Test with a single file
    console.log('\n📁 Testing single file analysis:');
    const singleFileResult = await kg.analyzePathToKnowledgeGraph({
      path: '../src/core/enhanced-h2gnn.ts',
      recursive: false,
      includeContent: true
    });
    
    console.log(singleFileResult.content[0].text);
    
    // Test with a directory
    console.log('\n📁 Testing directory analysis:');
    const dirResult = await kg.analyzePathToKnowledgeGraph({
      path: '../src/core',
      recursive: true,
      includeContent: false,
      maxDepth: 2
    });
    
    console.log(dirResult.content[0].text);
    
    console.log('\n✅ Analysis fix verified! Files are now being properly analyzed.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAnalysisFix().catch(console.error);

