#!/usr/bin/env node
/**
 * Code Embedding Demo
 * 
 * Demonstrates hyperbolic embedding generation for the project codebase.
 * This script analyzes the TypeScript/TSX files and generates hyperbolic
 * embeddings to represent code structure and relationships.
 */

import { CodeEmbeddingGenerator, analyzeProjectCode } from '../analysis/code-embeddings';
import { HyperbolicArithmetic } from '../math/hyperbolic-arithmetic';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🚀 Starting Code Hyperbolic Embedding Demo\n');
  
  try {
    // Get project root (src directory)
    const projectRoot = path.join(__dirname, '..');
    console.log(`📁 Analyzing project: ${projectRoot}\n`);
    
    // Analyze the project code
    const hierarchy = await analyzeProjectCode(projectRoot);
    
    // Display results
    console.log('\n📊 === CODE ANALYSIS RESULTS ===\n');
    
    // Project metrics
    console.log('🎯 Project Metrics:');
    console.log(`  • Total files: ${hierarchy.metrics.totalFiles}`);
    console.log(`  • Total lines: ${hierarchy.metrics.totalLines}`);
    console.log(`  • Average complexity: ${hierarchy.metrics.avgComplexity.toFixed(2)}`);
    console.log(`  • Max directory depth: ${hierarchy.metrics.maxDepth}`);
    console.log(`  • Connectivity score: ${hierarchy.metrics.connectivityScore.toFixed(3)}`);
    console.log();
    
    // Code elements breakdown
    const elementsByType = hierarchy.elements.reduce((acc, element) => {
      acc[element.type] = (acc[element.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📋 Code Elements:');
    Object.entries(elementsByType).forEach(([type, count]) => {
      console.log(`  • ${type}: ${count}`);
    });
    console.log();
    
    // Relationships breakdown
    const relationshipsByType = hierarchy.relationships.reduce((acc, rel) => {
      acc[rel.type] = (acc[rel.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('🔗 Relationships:');
    Object.entries(relationshipsByType).forEach(([type, count]) => {
      console.log(`  • ${type}: ${count}`);
    });
    console.log();
    
    // Show most complex elements
    const complexElements = hierarchy.elements
      .filter(e => e.type !== 'file')
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 5);
    
    console.log('🔥 Most Complex Elements:');
    complexElements.forEach((element, i) => {
      console.log(`  ${i + 1}. ${element.name} (${element.type}) - Complexity: ${element.complexity}`);
      console.log(`     Path: ${element.filePath}`);
    });
    console.log();
    
    // Show largest files
    const largestFiles = hierarchy.elements
      .filter(e => e.type === 'file')
      .sort((a, b) => b.lineCount - a.lineCount)
      .slice(0, 5);
    
    console.log('📄 Largest Files:');
    largestFiles.forEach((file, i) => {
      console.log(`  ${i + 1}. ${file.name} - ${file.lineCount} lines`);
      console.log(`     Path: ${file.filePath}`);
    });
    console.log();
    
    // Analyze embeddings if available
    const elementsWithEmbeddings = hierarchy.elements.filter(e => e.embedding);
    if (elementsWithEmbeddings.length > 0) {
      console.log('🧠 Hyperbolic Embedding Analysis:');
      console.log(`  • Elements with embeddings: ${elementsWithEmbeddings.length}`);
      
      // Calculate embedding statistics
      const norms = elementsWithEmbeddings.map(e => 
        Math.sqrt(e.embedding!.data.reduce((sum, val) => sum + val * val, 0))
      );
      
      const avgNorm = norms.reduce((a, b) => a + b, 0) / norms.length;
      const maxNorm = Math.max(...norms);
      const minNorm = Math.min(...norms);
      
      console.log(`  • Average embedding norm: ${avgNorm.toFixed(4)}`);
      console.log(`  • Max embedding norm: ${maxNorm.toFixed(4)}`);
      console.log(`  • Min embedding norm: ${minNorm.toFixed(4)}`);
      console.log();
      
      // Find similar elements example
      if (elementsWithEmbeddings.length >= 2) {
        const generator = new CodeEmbeddingGenerator(projectRoot);
        
        // Populate the generator with our analysis
        for (const element of hierarchy.elements) {
          generator['codeElements'].set(element.id, element);
        }
        
        try {
          // Find similar elements to the H2GNN core file
          const h2gnnElement = elementsWithEmbeddings.find(e => 
            e.filePath.includes('H2GNN') || e.name.includes('H2GNN')
          );
          
          if (h2gnnElement) {
            console.log(`🔍 Finding elements similar to "${h2gnnElement.name}":`);
            const similar = generator.findSimilarElements(h2gnnElement.id, 3);
            
            similar.forEach((item, i) => {
              console.log(`  ${i + 1}. ${item.element.name} (${item.element.type})`);
              console.log(`     Distance: ${item.distance.toFixed(4)}`);
              console.log(`     Path: ${item.element.filePath}`);
            });
            console.log();
          }
        } catch (error) {
          console.log('  Note: Similarity analysis requires full generator context');
        }
      }
      
      // Show hyperbolic distances between different types
      const fileElements = elementsWithEmbeddings.filter(e => e.type === 'file');
      const classElements = elementsWithEmbeddings.filter(e => e.type === 'class');
      
      if (fileElements.length >= 2) {
        const dist = HyperbolicArithmetic.distance(
          fileElements[0].embedding!,
          fileElements[1].embedding!
        );
        console.log(`📏 Sample inter-file distance: ${dist.toFixed(4)}`);
      }
      
      if (fileElements.length > 0 && classElements.length > 0) {
        const dist = HyperbolicArithmetic.distance(
          fileElements[0].embedding!,
          classElements[0].embedding!
        );
        console.log(`📏 Sample file-to-class distance: ${dist.toFixed(4)}`);
      }
    }
    
    console.log('\n✅ Code embedding analysis completed successfully!');
    console.log('\nThe hyperbolic embeddings capture the hierarchical structure of your codebase,');
    console.log('where similar code elements are closer together in hyperbolic space.');
    
  } catch (error) {
    console.error('❌ Error during code analysis:', error);
    process.exit(1);
  }
}

// Export for programmatic use
export { main as runCodeEmbeddingDemo };

// Run if called directly (ES module style)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
