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
  console.warn('🚀 Starting Code Hyperbolic Embedding Demo\n');
  
  try {
    // Get project root (src directory)
    const projectRoot = path.join(__dirname, '..');
    console.warn(`📁 Analyzing project: ${projectRoot}\n`);
    
    // Analyze the project code
    const hierarchy = await analyzeProjectCode(projectRoot);
    
    // Display results
    console.warn('\n📊 === CODE ANALYSIS RESULTS ===\n');
    
    // Project metrics
    console.warn('🎯 Project Metrics:');
    console.warn(`  • Total files: ${hierarchy.metrics.totalFiles}`);
    console.warn(`  • Total lines: ${hierarchy.metrics.totalLines}`);
    console.warn(`  • Average complexity: ${hierarchy.metrics.avgComplexity.toFixed(2)}`);
    console.warn(`  • Max directory depth: ${hierarchy.metrics.maxDepth}`);
    console.warn(`  • Connectivity score: ${hierarchy.metrics.connectivityScore.toFixed(3)}`);
    console.warn();
    
    // Code elements breakdown
    const elementsByType = hierarchy.elements.reduce((acc, element) => {
      acc[element.type] = (acc[element.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.warn('📋 Code Elements:');
    Object.entries(elementsByType).forEach(([type, count]) => {
      console.warn(`  • ${type}: ${count}`);
    });
    console.warn();
    
    // Relationships breakdown
    const relationshipsByType = hierarchy.relationships.reduce((acc, rel) => {
      acc[rel.type] = (acc[rel.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.warn('🔗 Relationships:');
    Object.entries(relationshipsByType).forEach(([type, count]) => {
      console.warn(`  • ${type}: ${count}`);
    });
    console.warn();
    
    // Show most complex elements
    const complexElements = hierarchy.elements
      .filter(e => e.type !== 'file')
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 5);
    
    console.warn('🔥 Most Complex Elements:');
    complexElements.forEach((element, i) => {
      console.warn(`  ${i + 1}. ${element.name} (${element.type}) - Complexity: ${element.complexity}`);
      console.warn(`     Path: ${element.filePath}`);
    });
    console.warn();
    
    // Show largest files
    const largestFiles = hierarchy.elements
      .filter(e => e.type === 'file')
      .sort((a, b) => b.lineCount - a.lineCount)
      .slice(0, 5);
    
    console.warn('📄 Largest Files:');
    largestFiles.forEach((file, i) => {
      console.warn(`  ${i + 1}. ${file.name} - ${file.lineCount} lines`);
      console.warn(`     Path: ${file.filePath}`);
    });
    console.warn();
    
    // Analyze embeddings if available
    const elementsWithEmbeddings = hierarchy.elements.filter(e => e.embedding);
    if (elementsWithEmbeddings.length > 0) {
      console.warn('🧠 Hyperbolic Embedding Analysis:');
      console.warn(`  • Elements with embeddings: ${elementsWithEmbeddings.length}`);
      
      // Calculate embedding statistics
      const norms = elementsWithEmbeddings.map(e => 
        Math.sqrt(e.embedding!.data.reduce((sum, val) => sum + val * val, 0))
      );
      
      const avgNorm = norms.reduce((a, b) => a + b, 0) / norms.length;
      const maxNorm = Math.max(...norms);
      const minNorm = Math.min(...norms);
      
      console.warn(`  • Average embedding norm: ${avgNorm.toFixed(4)}`);
      console.warn(`  • Max embedding norm: ${maxNorm.toFixed(4)}`);
      console.warn(`  • Min embedding norm: ${minNorm.toFixed(4)}`);
      console.warn();
      
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
            console.warn(`🔍 Finding elements similar to "${h2gnnElement.name}":`);
            const similar = generator.findSimilarElements(h2gnnElement.id, 3);
            
            similar.forEach((item, i) => {
              console.warn(`  ${i + 1}. ${item.element.name} (${item.element.type})`);
              console.warn(`     Distance: ${item.distance.toFixed(4)}`);
              console.warn(`     Path: ${item.element.filePath}`);
            });
            console.warn();
          }
        } catch (error) {
          console.warn('  Note: Similarity analysis requires full generator context');
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
        console.warn(`📏 Sample inter-file distance: ${dist.toFixed(4)}`);
      }
      
      if (fileElements.length > 0 && classElements.length > 0) {
        const dist = HyperbolicArithmetic.distance(
          fileElements[0].embedding!,
          classElements[0].embedding!
        );
        console.warn(`📏 Sample file-to-class distance: ${dist.toFixed(4)}`);
      }
    }
    
    console.warn('\n✅ Code embedding analysis completed successfully!');
    console.warn('\nThe hyperbolic embeddings capture the hierarchical structure of your codebase,');
    console.warn('where similar code elements are closer together in hyperbolic space.');
    
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
