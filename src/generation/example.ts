#!/usr/bin/env tsx

/**
 * Knowledge Base Creator Example
 * 
 * Demonstrates how to use the Knowledge Base Creator programmatically
 */

import KnowledgeBaseCreator from './knowledge-base-creator';
import * as path from 'path';

async function runExample() {
  console.log('🚀 Knowledge Base Creator Example');
  console.log('=====================================\n');

  try {
    // Initialize the creator
    const creator = new KnowledgeBaseCreator();
    console.log('✅ Knowledge Base Creator initialized\n');

    // Example 1: Analyze the H²GNN codebase
    console.log('📊 Example 1: Analyzing H²GNN codebase...');
    await creator.analyzeCodebase('./src', {
      includePatterns: ['**/*.ts', '**/*.tsx'],
      excludePatterns: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      maxFileSize: 50000
    });

    // Show statistics
    const stats = creator.getKnowledgeBaseStats();
    console.log(`📈 Found ${stats.totalNodes} concepts`);
    console.log(`📋 Concept types: ${Array.from(stats.nodeTypes.entries()).map(([type, count]) => `${type}: ${count}`).join(', ')}`);
    console.log(`🧠 Average complexity: ${stats.averageComplexity.toFixed(2)}\n`);

    // Example 2: Generate a tutorial
    console.log('📝 Example 2: Generating H²GNN tutorial...');
    const tutorial = await creator.generateDocumentation(
      {
        type: 'tutorial',
        format: 'markdown',
        targetAudience: 'beginner',
        language: 'english',
        style: 'technical'
      },
      './output/h2gnn-tutorial.md',
      {
        focusAreas: ['H²GNN', 'hyperbolic-geometry', 'neural-networks'],
        includeExamples: true,
        maxLength: 5000
      }
    );

    console.log(`✅ Tutorial generated: ${tutorial.sections.length} sections`);
    console.log(`⏱️ Estimated read time: ${tutorial.metadata.estimatedReadTime} minutes\n`);

    // Example 3: Generate architecture documentation
    console.log('🏗️ Example 3: Generating architecture guide...');
    const architecture = await creator.generateDocumentation(
      {
        type: 'architecture',
        format: 'html',
        targetAudience: 'advanced',
        language: 'english',
        style: 'technical'
      },
      './output/h2gnn-architecture.html',
      {
        focusAreas: ['core', 'integration', 'mcp'],
        includeDiagrams: true,
        maxLength: 8000
      }
    );

    console.log(`✅ Architecture guide generated: ${architecture.sections.length} sections\n`);

    // Example 4: Generate an essay about the project
    console.log('📚 Example 4: Generating project essay...');
    const essay = await creator.generateDocumentation(
      {
        type: 'essay',
        format: 'markdown',
        targetAudience: 'intermediate',
        language: 'english',
        style: 'academic'
      },
      './output/h2gnn-essay.md',
      {
        focusAreas: ['hyperbolic-geometry', 'AI', 'machine-learning'],
        includeExamples: false,
        maxLength: 3000
      }
    );

    console.log(`✅ Essay generated: ${essay.sections.length} sections\n`);

    // Example 5: Export knowledge base
    console.log('📦 Example 5: Exporting knowledge base...');
    await creator.exportKnowledgeBase('./output/h2gnn-knowledge-base.json');
    console.log('✅ Knowledge base exported\n');

    // Example 6: Document refinement (if we have an existing document)
    console.log('🔧 Example 6: Document refinement example...');
    try {
      // Create a sample document to refine
      const sampleDoc = `# H²GNN Overview

H²GNN is a neural network system.

## Features

- Hyperbolic geometry
- Neural networks

## Usage

Use H²GNN for learning.
`;

      const samplePath = './output/sample-doc.md';
      require('fs').writeFileSync(samplePath, sampleDoc);

      const refinedContent = await creator.refineDocumentation({
        documentPath: samplePath,
        focusAreas: ['clarity', 'completeness'],
        improvementType: 'clarity',
        targetAudience: 'beginner',
        constraints: []
      });

      console.log('✅ Document refined successfully');
      console.log(`📄 Refined content length: ${refinedContent.length} characters\n`);

    } catch (error) {
      console.log('⚠️ Refinement example skipped (no existing document)\n');
    }

    console.log('🎉 All examples completed successfully!');
    console.log('\n📁 Generated files:');
    console.log('   - ./output/h2gnn-tutorial.md');
    console.log('   - ./output/h2gnn-architecture.html');
    console.log('   - ./output/h2gnn-essay.md');
    console.log('   - ./output/h2gnn-knowledge-base.json');

  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample();
}

export { runExample };
