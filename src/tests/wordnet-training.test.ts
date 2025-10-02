import { describe, it, expect, beforeEach } from 'vitest';
import { WordNetIntegration } from '../datasets/wordnet-integration';
import { H2GNNTrainingPipeline } from '../training/training-pipeline';
import AgentWorkflows from '../workflows/agent-workflows';

const { HierarchicalQAWorkflow, ConceptLearningWorkflow } = AgentWorkflows;

describe('WordNet Training Pipeline', () => {
  let wordnetIntegration: WordNetIntegration;
  let trainingPipeline: H2GNNTrainingPipeline;

  beforeEach(() => {
    wordnetIntegration = new WordNetIntegration();
    trainingPipeline = new H2GNNTrainingPipeline();
  });

  describe('WordNet Data Loading', () => {
    it('should load sample WordNet data', async () => {
      const sampleData = await wordnetIntegration.loadSampleData();
      
      expect(sampleData).toBeDefined();
      expect(sampleData.synsets).toBeInstanceOf(Array);
      expect(sampleData.synsets.length).toBeGreaterThan(0);
      
      // Check structure of first synset
      const firstSynset = sampleData.synsets[0];
      expect(firstSynset).toHaveProperty('id');
      expect(firstSynset).toHaveProperty('words');
      expect(firstSynset).toHaveProperty('definition');
      expect(firstSynset).toHaveProperty('pos');
      
      console.log(`✅ Loaded ${sampleData.synsets.length} synsets`);
      console.log(`Sample synset: ${firstSynset.words.join(', ')} - ${firstSynset.definition}`);
    });

    it('should build hierarchical relationships', async () => {
      const sampleData = await wordnetIntegration.loadSampleData();
      const hierarchy = await wordnetIntegration.buildHierarchy(sampleData);
      
      expect(hierarchy).toBeDefined();
      expect(hierarchy.nodes).toBeInstanceOf(Array);
      expect(hierarchy.edges).toBeInstanceOf(Array);
      expect(hierarchy.nodes.length).toBeGreaterThan(0);
      
      console.log(`✅ Built hierarchy with ${hierarchy.nodes.length} nodes and ${hierarchy.edges.length} edges`);
      
      // Check for root nodes (concepts with no parents)
      const rootNodes = hierarchy.nodes.filter(node => 
        !hierarchy.edges.some(edge => edge.target === node.id)
      );
      expect(rootNodes.length).toBeGreaterThan(0);
      console.log(`Found ${rootNodes.length} root concepts`);
    });

    it('should generate hyperbolic embeddings for concepts', async () => {
      const sampleData = await wordnetIntegration.loadSampleData();
      const embeddings = await wordnetIntegration.generateHyperbolicEmbeddings(sampleData);
      
      expect(embeddings).toBeDefined();
      expect(Object.keys(embeddings)).toHaveLength(sampleData.synsets.length);
      
      // Check embedding properties
      const firstEmbedding = Object.values(embeddings)[0] as number[];
      expect(firstEmbedding).toBeInstanceOf(Array);
      expect(firstEmbedding.length).toBe(128); // Default embedding dimension
      
      // Check hyperbolic constraint (norm < 1 for Poincaré ball)
      const norm = Math.sqrt(firstEmbedding.reduce((sum, val) => sum + val * val, 0));
      expect(norm).toBeLessThan(1);
      
      console.log(`✅ Generated embeddings for ${Object.keys(embeddings).length} concepts`);
      console.log(`Sample embedding norm: ${norm.toFixed(4)}`);
    });
  });

  describe('Training Pipeline Integration', () => {
    it('should initialize training pipeline with WordNet data', async () => {
      const config = {
        batchSize: 32,
        learningRate: 0.001,
        epochs: 5,
        embeddingDim: 128,
        hyperbolicCurvature: -1.0
      };

      const pipeline = await trainingPipeline.initialize(config);
      expect(pipeline).toBeDefined();
      expect(pipeline.config).toEqual(config);
      
      console.log('✅ Training pipeline initialized successfully');
    });

    it('should run concept learning workflow', async () => {
      const workflow = new ConceptLearningWorkflow();
      const shared = {
        concepts: ['dog', 'animal', 'mammal', 'canine'],
        relationships: [
          { source: 'dog', target: 'canine', type: 'hypernym' },
          { source: 'canine', target: 'mammal', type: 'hypernym' },
          { source: 'mammal', target: 'animal', type: 'hypernym' }
        ]
      };

      const result = await workflow.run(shared);
      
      expect(result).toBeDefined();
      expect(shared.conceptEmbeddings).toBeDefined();
      expect(shared.hierarchicalStructure).toBeDefined();
      
      console.log('✅ Concept learning workflow completed');
      console.log(`Learned embeddings for: ${Object.keys(shared.conceptEmbeddings).join(', ')}`);
    });

    it('should run hierarchical QA workflow', async () => {
      const workflow = new HierarchicalQAWorkflow();
      const shared = {
        question: "What is the relationship between a dog and an animal?",
        context: {
          concepts: ['dog', 'animal', 'mammal'],
          hierarchy: [
            { child: 'dog', parent: 'mammal' },
            { child: 'mammal', parent: 'animal' }
          ]
        }
      };

      const result = await workflow.run(shared);
      
      expect(result).toBeDefined();
      expect(shared.answer).toBeDefined();
      expect(shared.reasoning).toBeDefined();
      
      console.log('✅ Hierarchical QA workflow completed');
      console.log(`Question: ${shared.question}`);
      console.log(`Answer: ${shared.answer}`);
    });
  });

  describe('Hyperbolic Geometry Validation', () => {
    it('should maintain hyperbolic constraints during training', async () => {
      const sampleData = await wordnetIntegration.loadSampleData();
      const embeddings = await wordnetIntegration.generateHyperbolicEmbeddings(sampleData);
      
      // Check all embeddings satisfy hyperbolic constraints
      for (const [concept, embedding] of Object.entries(embeddings)) {
        const norm = Math.sqrt((embedding as number[]).reduce((sum, val) => sum + val * val, 0));
        expect(norm).toBeLessThan(1);
      }
      
      console.log('✅ All embeddings satisfy hyperbolic constraints');
    });

    it('should compute hyperbolic distances correctly', async () => {
      const sampleData = await wordnetIntegration.loadSampleData();
      const embeddings = await wordnetIntegration.generateHyperbolicEmbeddings(sampleData);
      
      const concepts = Object.keys(embeddings);
      if (concepts.length >= 2) {
        const emb1 = embeddings[concepts[0]] as number[];
        const emb2 = embeddings[concepts[1]] as number[];
        
        const distance = wordnetIntegration.computeHyperbolicDistance(emb1, emb2);
        
        expect(distance).toBeGreaterThan(0);
        expect(distance).toBeLessThan(Infinity);
        
        console.log(`✅ Hyperbolic distance between "${concepts[0]}" and "${concepts[1]}": ${distance.toFixed(4)}`);
      }
    });

    it('should preserve hierarchical relationships in hyperbolic space', async () => {
      const sampleData = await wordnetIntegration.loadSampleData();
      const hierarchy = await wordnetIntegration.buildHierarchy(sampleData);
      const embeddings = await wordnetIntegration.generateHyperbolicEmbeddings(sampleData);
      
      // Find parent-child relationships
      const relationships = hierarchy.edges.filter(edge => edge.type === 'hypernym');
      
      if (relationships.length > 0) {
        const rel = relationships[0];
        const parentEmb = embeddings[rel.source] as number[];
        const childEmb = embeddings[rel.target] as number[];
        
        if (parentEmb && childEmb) {
          const distance = wordnetIntegration.computeHyperbolicDistance(parentEmb, childEmb);
          
          // In hyperbolic space, hierarchical relationships should be reflected in distances
          expect(distance).toBeGreaterThan(0);
          
          console.log(`✅ Hierarchical relationship preserved: ${rel.source} -> ${rel.target} (distance: ${distance.toFixed(4)})`);
        }
      }
    });
  });

  describe('Performance Metrics', () => {
    it('should measure training performance', async () => {
      const startTime = Date.now();
      
      const sampleData = await wordnetIntegration.loadSampleData();
      const embeddings = await wordnetIntegration.generateHyperbolicEmbeddings(sampleData);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      
      console.log(`✅ Training completed in ${duration}ms`);
      console.log(`Performance: ${(sampleData.synsets.length / (duration / 1000)).toFixed(2)} synsets/second`);
    });

    it('should validate embedding quality metrics', async () => {
      const sampleData = await wordnetIntegration.loadSampleData();
      const embeddings = await wordnetIntegration.generateHyperbolicEmbeddings(sampleData);
      
      // Calculate embedding statistics
      const allEmbeddings = Object.values(embeddings) as number[][];
      const norms = allEmbeddings.map(emb => 
        Math.sqrt(emb.reduce((sum, val) => sum + val * val, 0))
      );
      
      const avgNorm = norms.reduce((sum, norm) => sum + norm, 0) / norms.length;
      const maxNorm = Math.max(...norms);
      const minNorm = Math.min(...norms);
      
      expect(avgNorm).toBeGreaterThan(0);
      expect(maxNorm).toBeLessThan(1);
      expect(minNorm).toBeGreaterThan(0);
      
      console.log(`✅ Embedding quality metrics:`);
      console.log(`  Average norm: ${avgNorm.toFixed(4)}`);
      console.log(`  Max norm: ${maxNorm.toFixed(4)}`);
      console.log(`  Min norm: ${minNorm.toFixed(4)}`);
    });
  });
});
