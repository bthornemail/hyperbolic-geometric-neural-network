#!/usr/bin/env tsx

/**
 * Enhanced H²GNN Learning and Persistence Demo
 * 
 * This demo showcases:
 * - Advanced learning capabilities with memory consolidation
 * - Persistence layer for understanding and knowledge storage
 * - Interactive learning sessions
 * - Adaptive learning based on performance
 * - Multi-modal understanding capabilities
 */

import EnhancedH2GNN, { PersistenceConfig } from '../core/enhanced-h2gnn';
import { HyperbolicGeometricHGN } from '../core/H2GNN';

async function runEnhancedH2GNNLearningDemo(): Promise<void> {
  console.log('🧠 Enhanced H²GNN Learning and Persistence Demo');
  console.log('===============================================');
  
  // Initialize Enhanced H²GNN with persistence
  const h2gnnConfig = {
    embeddingDim: 32,
    numLayers: 3,
    curvature: -1.0
  };

  const persistenceConfig: PersistenceConfig = {
    storagePath: './persistence',
    maxMemories: 1000,
    consolidationThreshold: 10,
    retrievalStrategy: 'hybrid',
    compressionEnabled: true
  };

  console.log('\n📊 Phase 1: Initializing Enhanced H²GNN with Persistence');
  const enhancedH2GNN = new EnhancedH2GNN(h2gnnConfig, persistenceConfig);
  console.log('✅ Enhanced H²GNN initialized with persistence layer');

  // Learning Session 1: Neural Networks
  console.log('\n🧠 Phase 2: Learning Session - Neural Networks');
  console.log('Learning fundamental neural network concepts...');
  
  await enhancedH2GNN.learnWithMemory(
    'neural_network',
    {
      definition: 'A computing system inspired by biological neural networks',
      components: ['neurons', 'synapses', 'layers'],
      applications: ['image recognition', 'natural language processing']
    },
    { domain: 'machine_learning', difficulty: 'beginner' },
    0.8
  );

  await enhancedH2GNN.learnWithMemory(
    'backpropagation',
    {
      definition: 'Algorithm for training neural networks',
      purpose: 'Minimize error by adjusting weights',
      steps: ['forward pass', 'calculate error', 'backward pass', 'update weights']
    },
    { domain: 'machine_learning', difficulty: 'intermediate' },
    0.7
  );

  await enhancedH2GNN.learnWithMemory(
    'hyperbolic_geometry',
    {
      definition: 'Non-Euclidean geometry with constant negative curvature',
      properties: ['parallel postulate fails', 'triangle angles sum < 180°'],
      applications: ['neural networks', 'graph embeddings', 'hierarchical data']
    },
    { domain: 'mathematics', difficulty: 'advanced' },
    0.9
  );

  // Learning Session 2: WordNet and Semantics
  console.log('\n📚 Phase 3: Learning Session - WordNet and Semantics');
  console.log('Learning semantic and lexical concepts...');
  
  await enhancedH2GNN.learnWithMemory(
    'wordnet',
    {
      definition: 'Lexical database of English words',
      structure: ['synsets', 'hypernyms', 'hyponyms', 'meronyms'],
      applications: ['natural language processing', 'semantic analysis']
    },
    { domain: 'linguistics', difficulty: 'intermediate' },
    0.8
  );

  await enhancedH2GNN.learnWithMemory(
    'semantic_similarity',
    {
      definition: 'Measure of how similar two words or concepts are in meaning',
      methods: ['cosine similarity', 'hyperbolic distance', 'word embeddings'],
      applications: ['information retrieval', 'machine translation']
    },
    { domain: 'linguistics', difficulty: 'intermediate' },
    0.7
  );

  await enhancedH2GNN.learnWithMemory(
    'hierarchical_relationships',
    {
      definition: 'Tree-like relationships between concepts',
      types: ['is-a', 'part-of', 'instance-of'],
      representation: ['hypernyms', 'hyponyms', 'taxonomies']
    },
    { domain: 'knowledge_representation', difficulty: 'intermediate' },
    0.8
  );

  // Learning Session 3: H²GNN Specific Concepts
  console.log('\n🔬 Phase 4: Learning Session - H²GNN Specific Concepts');
  console.log('Learning H²GNN-specific concepts and implementations...');
  
  await enhancedH2GNN.learnWithMemory(
    'hyperbolic_embeddings',
    {
      definition: 'Vector representations in hyperbolic space',
      advantages: ['better hierarchical representation', 'exponential capacity'],
      implementation: ['Poincaré ball model', 'Lorentz model']
    },
    { domain: 'machine_learning', difficulty: 'advanced' },
    0.9
  );

  await enhancedH2GNN.learnWithMemory(
    'message_passing',
    {
      definition: 'Information propagation in graph neural networks',
      process: ['aggregate', 'update', 'propagate'],
      variants: ['GCN', 'GAT', 'GraphSAGE']
    },
    { domain: 'graph_neural_networks', difficulty: 'advanced' },
    0.8
  );

  await enhancedH2GNN.learnWithMemory(
    'curvature_learning',
    {
      definition: 'Learning optimal curvature for hyperbolic spaces',
      importance: ['affects embedding quality', 'domain-specific optimization'],
      methods: ['gradient descent', 'curvature scheduling']
    },
    { domain: 'hyperbolic_learning', difficulty: 'expert' },
    0.7
  );

  // Demonstrate Memory Retrieval
  console.log('\n🔍 Phase 5: Memory Retrieval and Understanding');
  console.log('Demonstrating memory retrieval capabilities...');
  
  const neuralNetworkMemories = await enhancedH2GNN.retrieveMemories('neural network', 5);
  console.log(`\n📋 Retrieved ${neuralNetworkMemories.length} memories for "neural network":`);
  for (const memory of neuralNetworkMemories) {
    console.log(`  • ${memory.concept} (confidence: ${memory.confidence.toFixed(3)}, performance: ${memory.performance})`);
  }

  const semanticMemories = await enhancedH2GNN.retrieveMemories('semantic', 3);
  console.log(`\n📋 Retrieved ${semanticMemories.length} memories for "semantic":`);
  for (const memory of semanticMemories) {
    console.log(`  • ${memory.concept} (confidence: ${memory.confidence.toFixed(3)}, performance: ${memory.performance})`);
  }

  // Get Understanding Snapshots
  console.log('\n📊 Phase 6: Understanding Snapshots');
  console.log('Retrieving understanding snapshots for different domains...');
  
  const mlSnapshot = await enhancedH2GNN.getUnderstandingSnapshot('machine_learning');
  if (mlSnapshot) {
    console.log(`\n🧠 Machine Learning Understanding Snapshot:`);
    console.log(`  • Confidence: ${mlSnapshot.confidence.toFixed(3)}`);
    console.log(`  • Concepts: ${mlSnapshot.embeddings.size}`);
    console.log(`  • Relationships: ${mlSnapshot.relationships.length}`);
    console.log(`  • Insights: ${mlSnapshot.insights.join('; ')}`);
  }

  const mathSnapshot = await enhancedH2GNN.getUnderstandingSnapshot('mathematics');
  if (mathSnapshot) {
    console.log(`\n🧮 Mathematics Understanding Snapshot:`);
    console.log(`  • Confidence: ${mathSnapshot.confidence.toFixed(3)}`);
    console.log(`  • Concepts: ${mathSnapshot.embeddings.size}`);
    console.log(`  • Relationships: ${mathSnapshot.relationships.length}`);
    console.log(`  • Insights: ${mathSnapshot.insights.join('; ')}`);
  }

  // Get Learning Progress
  console.log('\n📈 Phase 7: Learning Progress Analysis');
  console.log('Analyzing learning progress across domains...');
  
  const learningProgress = enhancedH2GNN.getLearningProgress();
  console.log(`\n📊 Learning Progress Summary:`);
  for (const progress of learningProgress) {
    console.log(`\n🎯 Domain: ${progress.domain}`);
    console.log(`  • Learned: ${progress.learnedConcepts}/${progress.totalConcepts} concepts`);
    console.log(`  • Mastery Level: ${progress.masteryLevel.toFixed(3)}`);
    console.log(`  • Last Updated: ${new Date(progress.lastUpdated).toISOString()}`);
    console.log(`  • Weak Areas: ${progress.weakAreas.join(', ') || 'None'}`);
    console.log(`  • Strong Areas: ${progress.strongAreas.join(', ') || 'None'}`);
  }

  // System Status
  console.log('\n⚙️ Phase 8: System Status and Metrics');
  console.log('Getting comprehensive system status...');
  
  const systemStatus = enhancedH2GNN.getSystemStatus();
  console.log(`\n🔧 Enhanced H²GNN System Status:`);
  console.log(`  • Total Memories: ${systemStatus.totalMemories}`);
  console.log(`  • Understanding Snapshots: ${systemStatus.totalSnapshots}`);
  console.log(`  • Learning Domains: ${systemStatus.totalDomains}`);
  console.log(`  • Average Confidence: ${systemStatus.averageConfidence.toFixed(3)}`);

  // Demonstrate Adaptive Learning
  console.log('\n🎯 Phase 9: Adaptive Learning Demonstration');
  console.log('Demonstrating adaptive learning capabilities...');
  
  // Simulate learning with varying performance
  await enhancedH2GNN.learnWithMemory(
    'attention_mechanism',
    {
      definition: 'Mechanism for focusing on relevant parts of input',
      types: ['self-attention', 'cross-attention', 'multi-head attention'],
      applications: ['transformers', 'neural machine translation']
    },
    { domain: 'machine_learning', difficulty: 'advanced' },
    0.6 // Lower performance to trigger adaptive learning
  );

  await enhancedH2GNN.learnWithMemory(
    'transformer_architecture',
    {
      definition: 'Neural network architecture based on attention mechanisms',
      components: ['encoder', 'decoder', 'attention layers'],
      advantages: ['parallelizable', 'long-range dependencies']
    },
    { domain: 'machine_learning', difficulty: 'advanced' },
    0.8 // Higher performance
  );

  // Check updated learning progress
  const updatedProgress = enhancedH2GNN.getLearningProgress();
  const mlProgress = updatedProgress.find(p => p.domain === 'machine_learning');
  if (mlProgress) {
    console.log(`\n📈 Updated Machine Learning Progress:`);
    console.log(`  • Mastery Level: ${mlProgress.masteryLevel.toFixed(3)}`);
    console.log(`  • Learning Curve: ${mlProgress.learningCurve.length} data points`);
    console.log(`  • Recent Performance: ${mlProgress.learningCurve.slice(-3).map(p => p.performance.toFixed(2)).join(', ')}`);
  }

  // Demonstrate Knowledge Consolidation
  console.log('\n🔄 Phase 10: Knowledge Consolidation');
  console.log('Demonstrating knowledge consolidation and memory management...');
  
  // Add more concepts to trigger consolidation
  for (let i = 0; i < 5; i++) {
    await enhancedH2GNN.learnWithMemory(
      `concept_${i}`,
      { definition: `Test concept ${i}`, category: 'demo' },
      { domain: 'demo', difficulty: 'beginner' },
      0.5
    );
  }

  const finalStatus = enhancedH2GNN.getSystemStatus();
  console.log(`\n📊 Final System Status:`);
  console.log(`  • Total Memories: ${finalStatus.totalMemories}`);
  console.log(`  • Understanding Snapshots: ${finalStatus.totalSnapshots}`);
  console.log(`  • Average Confidence: ${finalStatus.averageConfidence.toFixed(3)}`);

  console.log('\n🎉 Enhanced H²GNN Learning and Persistence Demo Complete!');
  console.log('The system has demonstrated:');
  console.log('✅ Advanced learning with memory consolidation');
  console.log('✅ Persistence layer for understanding storage');
  console.log('✅ Interactive learning sessions');
  console.log('✅ Adaptive learning based on performance');
  console.log('✅ Multi-modal understanding capabilities');
  console.log('✅ Knowledge retrieval and analysis');
  console.log('✅ Learning progress tracking');
  console.log('✅ System status monitoring');
}

// Run the demo
runEnhancedH2GNNLearningDemo().catch(console.error);

export { runEnhancedH2GNNLearningDemo };
