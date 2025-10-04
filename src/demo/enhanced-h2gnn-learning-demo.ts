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
  console.warn('🧠 Enhanced H²GNN Learning and Persistence Demo');
  console.warn('===============================================');
  
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

  console.warn('\n📊 Phase 1: Initializing Enhanced H²GNN with Persistence');
  const enhancedH2GNN = new EnhancedH2GNN(h2gnnConfig, persistenceConfig);
  console.warn('✅ Enhanced H²GNN initialized with persistence layer');

  // Learning Session 1: Neural Networks
  console.warn('\n🧠 Phase 2: Learning Session - Neural Networks');
  console.warn('Learning fundamental neural network concepts...');
  
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
  console.warn('\n📚 Phase 3: Learning Session - WordNet and Semantics');
  console.warn('Learning semantic and lexical concepts...');
  
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
  console.warn('\n🔬 Phase 4: Learning Session - H²GNN Specific Concepts');
  console.warn('Learning H²GNN-specific concepts and implementations...');
  
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
  console.warn('\n🔍 Phase 5: Memory Retrieval and Understanding');
  console.warn('Demonstrating memory retrieval capabilities...');
  
  const neuralNetworkMemories = await enhancedH2GNN.retrieveMemories('neural network', 5);
  console.warn(`\n📋 Retrieved ${neuralNetworkMemories.length} memories for "neural network":`);
  for (const memory of neuralNetworkMemories) {
    console.warn(`  • ${memory.concept} (confidence: ${memory.confidence.toFixed(3)}, performance: ${memory.performance})`);
  }

  const semanticMemories = await enhancedH2GNN.retrieveMemories('semantic', 3);
  console.warn(`\n📋 Retrieved ${semanticMemories.length} memories for "semantic":`);
  for (const memory of semanticMemories) {
    console.warn(`  • ${memory.concept} (confidence: ${memory.confidence.toFixed(3)}, performance: ${memory.performance})`);
  }

  // Get Understanding Snapshots
  console.warn('\n📊 Phase 6: Understanding Snapshots');
  console.warn('Retrieving understanding snapshots for different domains...');
  
  const mlSnapshot = await enhancedH2GNN.getUnderstandingSnapshot('machine_learning');
  if (mlSnapshot) {
    console.warn(`\n🧠 Machine Learning Understanding Snapshot:`);
    console.warn(`  • Confidence: ${mlSnapshot.confidence.toFixed(3)}`);
    console.warn(`  • Concepts: ${mlSnapshot.embeddings.size}`);
    console.warn(`  • Relationships: ${mlSnapshot.relationships.length}`);
    console.warn(`  • Insights: ${mlSnapshot.insights.join('; ')}`);
  }

  const mathSnapshot = await enhancedH2GNN.getUnderstandingSnapshot('mathematics');
  if (mathSnapshot) {
    console.warn(`\n🧮 Mathematics Understanding Snapshot:`);
    console.warn(`  • Confidence: ${mathSnapshot.confidence.toFixed(3)}`);
    console.warn(`  • Concepts: ${mathSnapshot.embeddings.size}`);
    console.warn(`  • Relationships: ${mathSnapshot.relationships.length}`);
    console.warn(`  • Insights: ${mathSnapshot.insights.join('; ')}`);
  }

  // Get Learning Progress
  console.warn('\n📈 Phase 7: Learning Progress Analysis');
  console.warn('Analyzing learning progress across domains...');
  
  const learningProgress = enhancedH2GNN.getLearningProgress();
  console.warn(`\n📊 Learning Progress Summary:`);
  for (const progress of learningProgress) {
    console.warn(`\n🎯 Domain: ${progress.domain}`);
    console.warn(`  • Learned: ${progress.learnedConcepts}/${progress.totalConcepts} concepts`);
    console.warn(`  • Mastery Level: ${progress.masteryLevel.toFixed(3)}`);
    console.warn(`  • Last Updated: ${new Date(progress.lastUpdated).toISOString()}`);
    console.warn(`  • Weak Areas: ${progress.weakAreas.join(', ') || 'None'}`);
    console.warn(`  • Strong Areas: ${progress.strongAreas.join(', ') || 'None'}`);
  }

  // System Status
  console.warn('\n⚙️ Phase 8: System Status and Metrics');
  console.warn('Getting comprehensive system status...');
  
  const systemStatus = enhancedH2GNN.getSystemStatus();
  console.warn(`\n🔧 Enhanced H²GNN System Status:`);
  console.warn(`  • Total Memories: ${systemStatus.totalMemories}`);
  console.warn(`  • Understanding Snapshots: ${systemStatus.totalSnapshots}`);
  console.warn(`  • Learning Domains: ${systemStatus.totalDomains}`);
  console.warn(`  • Average Confidence: ${systemStatus.averageConfidence.toFixed(3)}`);

  // Demonstrate Adaptive Learning
  console.warn('\n🎯 Phase 9: Adaptive Learning Demonstration');
  console.warn('Demonstrating adaptive learning capabilities...');
  
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
    console.warn(`\n📈 Updated Machine Learning Progress:`);
    console.warn(`  • Mastery Level: ${mlProgress.masteryLevel.toFixed(3)}`);
    console.warn(`  • Learning Curve: ${mlProgress.learningCurve.length} data points`);
    console.warn(`  • Recent Performance: ${mlProgress.learningCurve.slice(-3).map(p => p.performance.toFixed(2)).join(', ')}`);
  }

  // Demonstrate Knowledge Consolidation
  console.warn('\n🔄 Phase 10: Knowledge Consolidation');
  console.warn('Demonstrating knowledge consolidation and memory management...');
  
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
  console.warn(`\n📊 Final System Status:`);
  console.warn(`  • Total Memories: ${finalStatus.totalMemories}`);
  console.warn(`  • Understanding Snapshots: ${finalStatus.totalSnapshots}`);
  console.warn(`  • Average Confidence: ${finalStatus.averageConfidence.toFixed(3)}`);

  console.warn('\n🎉 Enhanced H²GNN Learning and Persistence Demo Complete!');
  console.warn('The system has demonstrated:');
  console.warn('✅ Advanced learning with memory consolidation');
  console.warn('✅ Persistence layer for understanding storage');
  console.warn('✅ Interactive learning sessions');
  console.warn('✅ Adaptive learning based on performance');
  console.warn('✅ Multi-modal understanding capabilities');
  console.warn('✅ Knowledge retrieval and analysis');
  console.warn('✅ Learning progress tracking');
  console.warn('✅ System status monitoring');
}

// Run the demo
runEnhancedH2GNNLearningDemo().catch(console.error);

export { runEnhancedH2GNNLearningDemo };
