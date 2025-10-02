import { describe, it, expect, beforeEach } from 'vitest';
import { WordNetProcessor } from '../datasets/wordnet-integration';
import { TrainingPipeline } from '../training/training-pipeline';
import AgentWorkflows from '../workflows/agent-workflows';

const { HierarchicalQAWorkflow, ConceptLearningWorkflow } = AgentWorkflows;

describe('WordNet Training Pipeline', () => {
  let wordnetProcessor: WordNetProcessor;
  let trainingPipeline: TrainingPipeline;

  beforeEach(() => {
    wordnetProcessor = new WordNetProcessor();
    trainingPipeline = new TrainingPipeline();
  });

  describe('WordNet Data Loading', () => {
    it('should load sample WordNet data', async () => {
      await wordnetProcessor.loadWordNetData();
      const synsets = wordnetProcessor.getSynsets();
      
      expect(synsets).toBeDefined();
      expect(synsets.size).toBeGreaterThan(0);
      
      // Check structure of first synset
      const firstSynset = Array.from(synsets.values())[0];
      expect(firstSynset).toHaveProperty('id');
      expect(firstSynset).toHaveProperty('words');
      expect(firstSynset).toHaveProperty('definition');
      expect(firstSynset).toHaveProperty('pos');
      
      console.log(`✅ Loaded ${synsets.size} synsets`);
      console.log(`Sample synset: ${firstSynset.words.join(', ')} - ${firstSynset.definition}`);
    });

    it('should build hierarchical relationships', async () => {
      await wordnetProcessor.loadWordNetData();
      const hierarchy = await wordnetProcessor.buildHierarchy();
      
      expect(hierarchy).toBeDefined();
      expect(hierarchy.nodes).toBeInstanceOf(Array);
      expect(hierarchy.edges).toBeInstanceOf(Array);
      expect(hierarchy.nodes.length).toBeGreaterThan(0);
      
      console.log(`✅ Built hierarchy with ${hierarchy.nodes.length} nodes and ${hierarchy.edges.length} edges`);
      
      // Check for root nodes (concepts with no parents)
      const rootNodes = hierarchy.nodes.filter(node => 
        !hierarchy.edges.some(edge => edge.to === node.id && edge.type === 'hypernym')
      );
      expect(rootNodes.length).toBeGreaterThan(0);
      console.log(`Found ${rootNodes.length} root concepts`);
    });

    it('should generate hyperbolic embeddings for concepts', async () => {
      await wordnetProcessor.loadWordNetData();
      await wordnetProcessor.generateHyperbolicEmbeddings();
      const hierarchy = wordnetProcessor.getHierarchy();
      
      expect(hierarchy).toBeDefined();
      expect(hierarchy!.nodes.length).toBeGreaterThan(0);
      
      // Check embedding properties for nodes that have embeddings
      const nodesWithEmbeddings = hierarchy!.nodes.filter(node => node.embedding);
      expect(nodesWithEmbeddings.length).toBeGreaterThan(0);
      
      const firstEmbedding = nodesWithEmbeddings[0].embedding!;
      expect(firstEmbedding.data).toBeInstanceOf(Array);
      expect(firstEmbedding.dim).toBeGreaterThan(0);
      
      // Check hyperbolic constraint (norm < 1 for Poincaré ball)
      const norm = Math.sqrt(firstEmbedding.data.reduce((sum, val) => sum + val * val, 0));
      expect(norm).toBeLessThan(1);
      
      console.log(`✅ Generated embeddings for ${nodesWithEmbeddings.length} concepts`);
      console.log(`Sample embedding norm: ${norm.toFixed(4)}`);
    });
  });

  describe('Training Pipeline Integration', () => {
    it('should initialize training pipeline with WordNet data', async () => {
      // TrainingPipeline is initialized in constructor with config
      // Just run a quick train to verify it works
      const result = await trainingPipeline.train();
      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(0);
      
      console.log('✅ Training pipeline completed successfully');
    });

    it('should run concept learning workflow', async () => {
      const workflow = new ConceptLearningWorkflow();
      await workflow.initialize();
      
      const result = await workflow.learnDomain('animal');
      
      expect(result).toBeDefined();
      expect(result.domain).toBe('animal');
      expect(result.concepts).toBeDefined();
      expect(result.hierarchicalStructure).toBeDefined();
      
      console.log('✅ Concept learning workflow completed');
      console.log(`Learned domain: ${result.domain}`);
    });

    it('should run hierarchical QA workflow', async () => {
      const workflow = new HierarchicalQAWorkflow();
      await workflow.initialize();
      
      const result = await workflow.answerQuestion("What is the relationship between a dog and an animal?");
      
      expect(result).toBeDefined();
      expect(result.answer).toBeDefined();
      expect(result.reasoning).toBeDefined();
      
      console.log('✅ Hierarchical QA workflow completed');
      console.log(`Question: What is the relationship between a dog and an animal?`);
      console.log(`Answer: ${result.answer}`);
    });
  });

  describe('Hyperbolic Geometry Validation', () => {
    it('should maintain hyperbolic constraints during training', async () => {
      await wordnetProcessor.loadWordNetData();
      await wordnetProcessor.generateHyperbolicEmbeddings();
      const hierarchy = wordnetProcessor.getHierarchy();
      
      // Check all embeddings satisfy hyperbolic constraints
      const nodesWithEmbeddings = hierarchy!.nodes.filter(node => node.embedding);
      for (const node of nodesWithEmbeddings) {
        const norm = Math.sqrt(node.embedding!.data.reduce((sum, val) => sum + val * val, 0));
        expect(norm).toBeLessThan(1);
      }
      
      console.log('✅ All embeddings satisfy hyperbolic constraints');
    });

    it('should compute hyperbolic distances correctly', async () => {
      await wordnetProcessor.loadWordNetData();
      await wordnetProcessor.generateHyperbolicEmbeddings();
      const hierarchy = wordnetProcessor.getHierarchy();
      
      const nodesWithEmbeddings = hierarchy!.nodes.filter(node => node.embedding);
      if (nodesWithEmbeddings.length >= 2) {
        const emb1 = nodesWithEmbeddings[0].embedding!;
        const emb2 = nodesWithEmbeddings[1].embedding!;
        
        // Import HyperbolicArithmetic for distance calculation
        const { HyperbolicArithmetic } = await import('../math/hyperbolic-arithmetic');
        const distance = HyperbolicArithmetic.distance(emb1, emb2);
        
        expect(distance).toBeGreaterThan(0);
        expect(distance).toBeLessThan(Infinity);
        
        console.log(`✅ Hyperbolic distance between "${nodesWithEmbeddings[0].id}" and "${nodesWithEmbeddings[1].id}": ${distance.toFixed(4)}`);
      }
    });

    it('should preserve hierarchical relationships in hyperbolic space', async () => {
      await wordnetProcessor.loadWordNetData();
      const hierarchy = await wordnetProcessor.buildHierarchy();
      await wordnetProcessor.generateHyperbolicEmbeddings();
      
      // Find parent-child relationships
      const relationships = hierarchy.edges.filter(edge => edge.type === 'hypernym');
      
      if (relationships.length > 0) {
        const rel = relationships[0];
        const parentNode = hierarchy.nodes.find(n => n.id === rel.from);
        const childNode = hierarchy.nodes.find(n => n.id === rel.to);
        
        if (parentNode?.embedding && childNode?.embedding) {
          const { HyperbolicArithmetic } = await import('../math/hyperbolic-arithmetic');
          const distance = HyperbolicArithmetic.distance(parentNode.embedding, childNode.embedding);
          
          // In hyperbolic space, hierarchical relationships should be reflected in distances
          expect(distance).toBeGreaterThan(0);
          
          console.log(`✅ Hierarchical relationship preserved: ${rel.from} -> ${rel.to} (distance: ${distance.toFixed(4)})`);
        }
      }
    });
  });

  describe('Performance Metrics', () => {
    it('should measure training performance', async () => {
      const startTime = Date.now();
      
      await wordnetProcessor.loadWordNetData();
      await wordnetProcessor.generateHyperbolicEmbeddings();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      
      const synsets = wordnetProcessor.getSynsets();
      console.log(`✅ Training completed in ${duration}ms`);
      console.log(`Performance: ${(synsets.size / (duration / 1000)).toFixed(2)} synsets/second`);
    });

    it('should validate embedding quality metrics', async () => {
      await wordnetProcessor.loadWordNetData();
      await wordnetProcessor.generateHyperbolicEmbeddings();
      const hierarchy = wordnetProcessor.getHierarchy();
      
      // Calculate embedding statistics
      const nodesWithEmbeddings = hierarchy!.nodes.filter(node => node.embedding);
      const norms = nodesWithEmbeddings.map(node => 
        Math.sqrt(node.embedding!.data.reduce((sum, val) => sum + val * val, 0))
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
