/**
 * Test suite for H²GNN Core System
 * Tests the main HyperbolicGeometricHGN class and related functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  HyperbolicGeometricHGN, 
  H2GNNConfig, 
  TrainingData, 
  PredictionResult,
  createH2GNN 
} from '../../core/H2GNN';
import { createVector } from '../../math/hyperbolic-arithmetic';

describe('H²GNN Core System', () => {
  let h2gnn: HyperbolicGeometricHGN;
  let config: H2GNNConfig;

  beforeEach(() => {
    config = {
      embeddingDim: 8,
      numLayers: 2,
      curvature: -1.0,
      learningRate: 0.01,
      batchSize: 16,
      maxEpochs: 10,
      dropout: 0.1,
      numHeads: 2,
      tolerance: 1e-4,
      geometryMode: 'hyperbolic',
      visualizationEnabled: false,
      crossPlatformSync: false
    };
    h2gnn = createH2GNN(config);
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('Initialization', () => {
    it('should initialize with valid configuration', () => {
      expect(h2gnn).toBeDefined();
      expect(h2gnn.getConfig()).toEqual(expect.objectContaining(config));
    });

    it('should initialize with default configuration when no config provided', () => {
      const defaultH2GNN = createH2GNN();
      expect(defaultH2GNN).toBeDefined();
      expect(defaultH2GNN.getConfig()).toBeDefined();
    });

    it('should validate configuration parameters', () => {
      expect(() => createH2GNN({ embeddingDim: -1 }))
        .toThrow('Invalid embedding dimension');
      
      expect(() => createH2GNN({ numLayers: 0 }))
        .toThrow('Number of layers must be positive');
      
      expect(() => createH2GNN({ learningRate: -0.1 }))
        .toThrow('Learning rate must be positive');
    });

    it('should set up network architecture correctly', () => {
      const networkInfo = h2gnn.getNetworkInfo();
      expect(networkInfo.embeddingDim).toBe(config.embeddingDim);
      expect(networkInfo.numLayers).toBe(config.numLayers);
      expect(networkInfo.curvature).toBe(config.curvature);
    });
  });

  describe('Training Data Processing', () => {
    let trainingData: TrainingData;

    beforeEach(() => {
      trainingData = {
        nodes: [
          createVector([0.1, 0.2, 0.3]),
          createVector([0.4, 0.5, 0.6]),
          createVector([0.7, 0.8, 0.9])
        ],
        edges: [[0, 1], [1, 2], [0, 2]],
        labels: [0, 1, 0],
        hyperedges: [[0, 1, 2]]
      };
    });

    it('should validate training data structure', () => {
      expect(() => h2gnn.validateTrainingData(trainingData))
        .not.toThrow();
    });

    it('should reject invalid training data', () => {
      const invalidData = {
        nodes: [],
        edges: [[0, 1]],
        labels: [0, 1]
      };
      
      expect(() => h2gnn.validateTrainingData(invalidData))
        .toThrow('Training data cannot be empty');
    });

    it('should preprocess training data correctly', () => {
      const processed = h2gnn.preprocessTrainingData(trainingData);
      
      expect(processed.nodes).toBeDefined();
      expect(processed.edges).toBeDefined();
      expect(processed.nodes.length).toBe(trainingData.nodes.length);
      expect(processed.edges.length).toBe(trainingData.edges.length);
    });
  });

  describe('Training Process', () => {
    let trainingData: TrainingData;

    beforeEach(() => {
      trainingData = {
        nodes: [
          createVector([0.1, 0.2]),
          createVector([0.3, 0.4]),
          createVector([0.5, 0.6])
        ],
        edges: [[0, 1], [1, 2]],
        labels: [0, 1, 0]
      };
    });

    it('should train with valid data', async () => {
      const result = await h2gnn.train(trainingData);
      
      expect(result).toBeDefined();
      expect(result.epochs).toBeGreaterThan(0);
      expect(result.finalLoss).toBeGreaterThan(0);
      expect(result.converged).toBeDefined();
    });

    it('should handle training with different batch sizes', async () => {
      const smallBatchConfig = { ...config, batchSize: 2 };
      const smallBatchH2GNN = createH2GNN(smallBatchConfig);
      
      const result = await smallBatchH2GNN.train(trainingData);
      expect(result).toBeDefined();
    });

    it('should track training history', async () => {
      await h2gnn.train(trainingData);
      const history = h2gnn.getTrainingHistory();
      
      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty('epoch');
      expect(history[0]).toHaveProperty('loss');
    });

    it('should handle early stopping', async () => {
      const earlyStopConfig = { ...config, maxEpochs: 5, tolerance: 1e-2 };
      const earlyStopH2GNN = createH2GNN(earlyStopConfig);
      
      const result = await earlyStopH2GNN.train(trainingData);
      expect(result.epochs).toBeLessThanOrEqual(5);
    });
  });

  describe('Prediction', () => {
    let trainingData: TrainingData;
    let testData: TrainingData;

    beforeEach(async () => {
      trainingData = {
        nodes: [
          createVector([0.1, 0.2]),
          createVector([0.3, 0.4]),
          createVector([0.5, 0.6])
        ],
        edges: [[0, 1], [1, 2]],
        labels: [0, 1, 0]
      };
      
      testData = {
        nodes: [
          createVector([0.2, 0.3]),
          createVector([0.4, 0.5])
        ],
        edges: [[0, 1]]
      };
      
      await h2gnn.train(trainingData);
    });

    it('should make predictions with trained model', async () => {
      const predictions = await h2gnn.predict(testData);
      
      expect(predictions).toBeDefined();
      expect(predictions.embeddings).toBeDefined();
      expect(predictions.predictions).toBeDefined();
      expect(predictions.confidence).toBeDefined();
      expect(predictions.geometricInsights).toBeDefined();
    });

    it('should return valid prediction results', async () => {
      const predictions = await h2gnn.predict(testData);
      
      expect(predictions.embeddings.length).toBe(testData.nodes.length);
      expect(predictions.predictions.length).toBe(testData.nodes.length);
      expect(predictions.confidence.length).toBe(testData.nodes.length);
      
      // Check confidence values are in valid range
      predictions.confidence.forEach(conf => {
        expect(conf).toBeGreaterThanOrEqual(0);
        expect(conf).toBeLessThanOrEqual(1);
      });
    });

    it('should handle prediction without training', async () => {
      const untrainedH2GNN = createH2GNN(config);
      
      await expect(untrainedH2GNN.predict(testData))
        .rejects.toThrow('Model must be trained before making predictions');
    });
  });

  describe('Geometric Operations', () => {
    it('should compute geometric insights', () => {
      const insights = h2gnn.getGeometricInsights();
      
      expect(insights).toBeDefined();
      expect(insights.curvature).toBeDefined();
      expect(insights.hierarchyDepth).toBeGreaterThanOrEqual(0);
      expect(insights.clusteringCoefficient).toBeGreaterThanOrEqual(0);
    });

    it('should maintain hyperbolic constraints', () => {
      const testVector = createVector([0.5, 0.3]);
      const isValid = h2gnn.validateHyperbolicConstraints(testVector);
      
      expect(isValid).toBe(true);
    });

    it('should handle curvature changes', () => {
      const newCurvature = -2.0;
      h2gnn.setCurvature(newCurvature);
      
      const currentCurvature = h2gnn.getCurvature();
      expect(currentCurvature).toBe(newCurvature);
    });
  });

  describe('Model Persistence', () => {
    it('should save model state', async () => {
      const trainingData = {
        nodes: [createVector([0.1, 0.2]), createVector([0.3, 0.4])],
        edges: [[0, 1]],
        labels: [0, 1]
      };
      
      await h2gnn.train(trainingData);
      const state = h2gnn.saveState();
      
      expect(state).toBeDefined();
      expect(state.config).toBeDefined();
      expect(state.weights).toBeDefined();
    });

    it('should load model state', async () => {
      const trainingData = {
        nodes: [createVector([0.1, 0.2]), createVector([0.3, 0.4])],
        edges: [[0, 1]],
        labels: [0, 1]
      };
      
      await h2gnn.train(trainingData);
      const state = h2gnn.saveState();
      
      const newH2GNN = createH2GNN(config);
      newH2GNN.loadState(state);
      
      expect(newH2GNN.getConfig()).toEqual(h2gnn.getConfig());
    });
  });

  describe('Error Handling', () => {
    it('should handle empty training data', async () => {
      const emptyData: TrainingData = {
        nodes: [],
        edges: []
      };
      
      await expect(h2gnn.train(emptyData))
        .rejects.toThrow('Training data cannot be empty');
    });

    it('should handle invalid edge indices', async () => {
      const invalidData: TrainingData = {
        nodes: [createVector([0.1, 0.2])],
        edges: [[0, 5]], // Invalid edge index
        labels: [0]
      };
      
      await expect(h2gnn.train(invalidData))
        .rejects.toThrow('Invalid edge index');
    });

    it('should handle mismatched labels', async () => {
      const mismatchedData: TrainingData = {
        nodes: [createVector([0.1, 0.2]), createVector([0.3, 0.4])],
        edges: [[0, 1]],
        labels: [0] // Missing label
      };
      
      await expect(h2gnn.train(mismatchedData))
        .rejects.toThrow('Number of labels must match number of nodes');
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large datasets efficiently', async () => {
      const largeData: TrainingData = {
        nodes: Array.from({ length: 100 }, (_, i) => 
          createVector([Math.random(), Math.random()])
        ),
        edges: Array.from({ length: 50 }, (_, i) => [i, i + 50]),
        labels: Array.from({ length: 100 }, () => Math.floor(Math.random() * 2))
      };
      
      const startTime = Date.now();
      const result = await h2gnn.train(largeData);
      const endTime = Date.now();
      
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should optimize memory usage', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create and train multiple models
      const models = Array.from({ length: 5 }, () => createH2GNN(config));
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });
  });

  describe('Integration with Mathematical Components', () => {
    it('should use hyperbolic arithmetic correctly', () => {
      const vector1 = createVector([0.1, 0.2]);
      const vector2 = createVector([0.3, 0.4]);
      
      const result = h2gnn.computeHyperbolicDistance(vector1, vector2);
      
      expect(result).toBeGreaterThan(0);
      expect(Number.isFinite(result)).toBe(true);
    });

    it('should maintain geometric consistency', () => {
      const testPoints = [
        createVector([0.1, 0.2]),
        createVector([0.3, 0.4]),
        createVector([0.5, 0.6])
      ];
      
      const distances = h2gnn.computePairwiseDistances(testPoints);
      
      expect(distances).toBeDefined();
      expect(distances.length).toBe(testPoints.length);
      expect(distances[0].length).toBe(testPoints.length);
      
      // Check symmetry
      for (let i = 0; i < testPoints.length; i++) {
        for (let j = 0; j < testPoints.length; j++) {
          expect(distances[i][j]).toBeCloseTo(distances[j][i], 5);
        }
      }
    });
  });
});
