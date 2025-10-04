#!/usr/bin/env node

/**
 * WordNet Training Demo
 * 
 * This script demonstrates the WordNet integration and training pipeline
 * for the H²GNN system using PocketFlow workflows.
 */

import WordNetModule from '../datasets/wordnet-integration';
import TrainingPipelineModule from '../training/training-pipeline';
import AgentWorkflows from '../workflows/agent-workflows';

const { WordNetProcessor } = WordNetModule;
const { TrainingPipeline } = TrainingPipelineModule;

const { HierarchicalQAWorkflow, ConceptLearningWorkflow, SemanticExplorationWorkflow } = AgentWorkflows;

async function runWordNetTrainingDemo() {
  console.warn('🚀 Starting WordNet Training Demo for H²GNN + PocketFlow\n');

  try {
    // Initialize components
    console.warn('📊 Initializing WordNet Integration...');
    const wordnet = new WordNetProcessor();
    
    console.warn('🧠 Initializing Training Pipeline...');
    const pipeline = new TrainingPipeline();

    // Step 1: Load WordNet Data
    console.warn('\n📚 Step 1: Loading WordNet Sample Data...');
    await wordnet.loadWordNetData();
    const synsets = wordnet.getSynsets();
    console.warn(`✅ Loaded ${synsets.size} synsets`);
    
    // Display sample concepts
    console.warn('\n🔍 Sample Concepts:');
    const sampleSynsets = Array.from(synsets.values()).slice(0, 5);
    sampleSynsets.forEach((synset, i) => {
      console.warn(`  ${i + 1}. ${synset.words.join(', ')} (${synset.pos})`);
      console.warn(`     Definition: ${synset.definition}`);
    });

    // Step 2: Build Hierarchical Structure
    console.warn('\n🌳 Step 2: Building Hierarchical Relationships...');
    await wordnet.buildHierarchy();
    const hierarchy = wordnet.getHierarchy();
    console.warn(`✅ Built hierarchy with ${hierarchy?.nodes.length || 0} nodes and ${hierarchy?.edges.length || 0} relationships`);
    
    // Display sample relationships
    if (hierarchy && hierarchy.edges.length > 0) {
      console.warn('\n🔗 Sample Relationships:');
      hierarchy.edges.slice(0, 5).forEach((edge, i) => {
        console.warn(`  ${i + 1}. ${edge.source} --[${edge.type}]--> ${edge.target}`);
      });
    }

    // Step 3: Generate Hyperbolic Embeddings
    console.warn('\n🎯 Step 3: Generating Hyperbolic Embeddings...');
    const startTime = Date.now();
    await wordnet.generateHyperbolicEmbeddings();
    const embeddingTime = Date.now() - startTime;
    
    console.warn(`✅ Generated embeddings in ${embeddingTime}ms`);
    console.warn(`📈 Performance: ${(synsets.size / (embeddingTime / 1000)).toFixed(2)} concepts/second`);

    // Validate hyperbolic constraints
    if (hierarchy && hierarchy.nodes.length > 0) {
      const sampleNode = hierarchy.nodes.find(n => n.embedding);
      if (sampleNode?.embedding) {
        const norm = Math.sqrt(sampleNode.embedding.data.reduce((sum, val) => sum + val * val, 0));
        console.warn(`🔍 Sample embedding norm: ${norm.toFixed(4)} (must be < 1.0 for Poincaré ball)`);
      }
    }

    // Step 4: Test Concept Learning Workflow
    console.warn('\n🧮 Step 4: Testing Concept Learning Workflow...');
    const conceptWorkflow = new ConceptLearningWorkflow();
    const conceptShared = {
      concepts: ['dog', 'animal', 'mammal', 'canine', 'pet'],
      relationships: [
        { source: 'dog', target: 'canine', type: 'hypernym' },
        { source: 'canine', target: 'mammal', type: 'hypernym' },
        { source: 'mammal', target: 'animal', type: 'hypernym' },
        { source: 'dog', target: 'pet', type: 'similar_to' }
      ]
    };

    await conceptWorkflow.run(conceptShared);
    console.warn('✅ Concept learning completed');
    console.warn(`🎯 Learned embeddings for: ${Object.keys(conceptShared.conceptEmbeddings).join(', ')}`);

    // Step 5: Test Hierarchical QA Workflow
    console.warn('\n❓ Step 5: Testing Hierarchical QA Workflow...');
    const qaWorkflow = new HierarchicalQAWorkflow();
    const qaQuestions = [
      "What is the relationship between a dog and an animal?",
      "How are mammals and animals related?",
      "What makes a canine different from other mammals?"
    ];

    for (const question of qaQuestions) {
      const qaShared = {
        question,
        context: {
          concepts: ['dog', 'animal', 'mammal', 'canine'],
          hierarchy: [
            { child: 'dog', parent: 'canine' },
            { child: 'canine', parent: 'mammal' },
            { child: 'mammal', parent: 'animal' }
          ]
        }
      };

      await qaWorkflow.run(qaShared);
      console.warn(`\n  Q: ${question}`);
      console.warn(`  A: ${qaShared.answer}`);
      console.warn(`  🧠 Reasoning: ${qaShared.reasoning}`);
    }

    // Step 6: Test Semantic Exploration
    console.warn('\n🔍 Step 6: Testing Semantic Exploration Workflow...');
    const explorationWorkflow = new SemanticExplorationWorkflow();
    const explorationShared = {
      startConcept: 'dog',
      explorationDepth: 3,
      semanticSpace: embeddings
    };

    await explorationWorkflow.run(explorationShared);
    console.warn('✅ Semantic exploration completed');
    console.warn(`🗺️ Explored concepts: ${explorationShared.exploredConcepts.join(' → ')}`);
    console.warn(`🎯 Discovered relationships: ${explorationShared.discoveredRelationships.length}`);

    // Step 7: Training Pipeline Integration
    console.warn('\n🏋️ Step 7: Testing Training Pipeline Integration...');
    const trainingConfig = {
      batchSize: 16,
      learningRate: 0.001,
      epochs: 3,
      embeddingDim: 128,
      hyperbolicCurvature: -1.0
    };

    const initializedPipeline = await pipeline.initialize(trainingConfig);
    console.warn('✅ Training pipeline initialized');
    console.warn(`⚙️ Config: ${JSON.stringify(trainingConfig, null, 2)}`);

    // Step 8: Performance Analysis
    console.warn('\n📊 Step 8: Performance Analysis...');
    
    // Compute hyperbolic distances between related concepts
    const distances: { [key: string]: number } = {};
    
    if (hierarchy && hierarchy.nodes.length > 1) {
      const nodesWithEmbeddings = hierarchy.nodes.filter(n => n.embedding);
      if (nodesWithEmbeddings.length >= 2) {
        const node1 = nodesWithEmbeddings[0];
        const node2 = nodesWithEmbeddings[1];
        
        if (node1.embedding && node2.embedding) {
          const distance = wordnet.computeHyperbolicDistance(node1.embedding.data, node2.embedding.data);
          distances[`${node1.id}-${node2.id}`] = distance;
          console.warn(`  📏 Distance ${node1.id} ↔ ${node2.id}: ${distance.toFixed(4)}`);
        }
      }
    }

    // Embedding quality metrics
    if (hierarchy) {
      const allEmbeddings = hierarchy.nodes
        .filter(n => n.embedding)
        .map(n => n.embedding!.data);
      
      if (allEmbeddings.length > 0) {
        const norms = allEmbeddings.map(emb => 
          Math.sqrt(emb.reduce((sum, val) => sum + val * val, 0))
        );
        
        const avgNorm = norms.reduce((sum, norm) => sum + norm, 0) / norms.length;
        const maxNorm = Math.max(...norms);
        const minNorm = Math.min(...norms);

        console.warn('\n📈 Embedding Quality Metrics:');
        console.warn(`  📊 Average norm: ${avgNorm.toFixed(4)}`);
        console.warn(`  📊 Max norm: ${maxNorm.toFixed(4)}`);
        console.warn(`  📊 Min norm: ${minNorm.toFixed(4)}`);
        console.warn(`  ✅ All norms < 1.0: ${maxNorm < 1.0 ? 'Yes' : 'No'}`);
      }
    }

    console.warn('\n🎉 WordNet Training Demo Completed Successfully!');
    console.warn('\n📋 Summary:');
    console.warn(`  • Processed ${synsets.size} WordNet concepts`);
    console.warn(`  • Built ${hierarchy?.edges.length || 0} hierarchical relationships`);
    console.warn(`  • Generated ${hierarchy?.nodes.filter(n => n.embedding).length || 0} hyperbolic embeddings`);
    console.warn(`  • Validated ${Object.keys(distances).length} concept relationships`);
    console.warn(`  • Tested 3 PocketFlow workflows successfully`);

  } catch (error) {
    console.error('❌ Error during WordNet training demo:', error);
    process.exit(1);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runWordNetTrainingDemo().catch(console.error);
}

export { runWordNetTrainingDemo };
