/**
 * Test suite for Hyperbolic Layers
 * Tests neural network layers with hyperbolic operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  HyperbolicLinear,
  HyperbolicAttention,
  HyperbolicBatchNorm,
  HyperbolicActivations,
  HyperbolicDropout,
  HyperbolicMessagePassing
} from '../../layers/hyperbolic-layers';
import { createVector } from '../../math/hyperbolic-arithmetic';

describe('Hyperbolic Layers', () => {
  describe('HyperbolicLinear', () => {
    let layer: HyperbolicLinear;

    beforeEach(() => {
      layer = new HyperbolicLinear(8, 4);
    });

    it('should initialize with correct dimensions', () => {
      expect(layer.inputDim).toBe(8);
      expect(layer.outputDim).toBe(4);
    });

    it('should perform linear transformation in hyperbolic space', () => {
      const input = createVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
      const output = layer.forward(input);
      
      expect(output).toBeDefined();
      expect(output.dim).toBe(4);
      expect(output.norm).toBeLessThan(1); // Hyperbolic constraint
    });

    it('should handle batch processing', () => {
      const inputs = [
        createVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]),
        createVector([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])
      ];
      
      const outputs = layer.forwardBatch(inputs);
      
      expect(outputs).toHaveLength(2);
      outputs.forEach(output => {
        expect(output.dim).toBe(4);
        expect(output.norm).toBeLessThan(1);
      });
    });

    it('should maintain hyperbolic constraints', () => {
      const input = createVector([0.5, 0.3, 0.2, 0.1, 0.4, 0.6, 0.7, 0.8]);
      const output = layer.forward(input);
      
      // Check that output is in Poincaré ball
      expect(output.norm).toBeLessThan(1);
    });
  });

  describe('HyperbolicAttention', () => {
    let attention: HyperbolicAttention;

    beforeEach(() => {
      attention = new HyperbolicAttention(8);
    });

    it('should compute attention in hyperbolic space', () => {
      const query = createVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
      const key = createVector([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
      const value = createVector([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
      
      const result = attention.forward(query, key, value);
      
      expect(result).toBeDefined();
      expect(result.norm).toBeLessThan(1);
    });

    it('should handle multi-head attention', () => {
      const queries = [
        createVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]),
        createVector([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])
      ];
      const keys = [
        createVector([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]),
        createVector([0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1])
      ];
      const values = [
        createVector([0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2]),
        createVector([0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3])
      ];
      
      const result = attention.forwardMultiHead(queries, keys, values);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      result.forEach(output => {
        expect(output.norm).toBeLessThan(1);
      });
    });

    it('should compute attention weights correctly', () => {
      const query = createVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
      const key = createVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
      
      const weights = attention.computeAttentionWeights(query, key);
      
      expect(weights).toBeGreaterThan(0);
      expect(weights).toBeLessThanOrEqual(1);
    });
  });

  describe('HyperbolicBatchNorm', () => {
    let batchNorm: HyperbolicBatchNorm;

    beforeEach(() => {
      batchNorm = new HyperbolicBatchNorm(8);
    });

    it('should normalize batch in hyperbolic space', () => {
      const batch = [
        createVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]),
        createVector([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]),
        createVector([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0])
      ];
      
      const normalized = batchNorm.forward(batch);
      
      expect(normalized).toHaveLength(3);
      normalized.forEach(vector => {
        expect(vector.norm).toBeLessThan(1);
      });
    });

    it('should maintain hyperbolic constraints during normalization', () => {
      const batch = [
        createVector([0.5, 0.3, 0.2, 0.1, 0.4, 0.6, 0.7, 0.8]),
        createVector([0.6, 0.4, 0.3, 0.2, 0.5, 0.7, 0.8, 0.9])
      ];
      
      const normalized = batchNorm.forward(batch);
      
      normalized.forEach(vector => {
        expect(vector.norm).toBeLessThan(1);
      });
    });
  });

  describe('HyperbolicActivations', () => {
    let activations: HyperbolicActivations;

    beforeEach(() => {
      activations = new HyperbolicActivations();
    });

    it('should apply hyperbolic ReLU activation', () => {
      const input = createVector([0.1, -0.2, 0.3, -0.4, 0.5]);
      const output = activations.hyperbolicReLU(input);
      
      expect(output).toBeDefined();
      expect(output.dim).toBe(5);
      expect(output.norm).toBeLessThan(1);
    });

    it('should apply hyperbolic Tanh activation', () => {
      const input = createVector([0.1, 0.2, 0.3, 0.4, 0.5]);
      const output = activations.hyperbolicTanh(input);
      
      expect(output).toBeDefined();
      expect(output.dim).toBe(5);
      expect(output.norm).toBeLessThan(1);
    });

    it('should apply hyperbolic Sigmoid activation', () => {
      const input = createVector([0.1, 0.2, 0.3, 0.4, 0.5]);
      const output = activations.hyperbolicSigmoid(input);
      
      expect(output).toBeDefined();
      expect(output.dim).toBe(5);
      expect(output.norm).toBeLessThan(1);
    });
  });

  describe('HyperbolicDropout', () => {
    let dropout: HyperbolicDropout;

    beforeEach(() => {
      dropout = new HyperbolicDropout(0.5);
    });

    it('should apply dropout in hyperbolic space', () => {
      const input = createVector([0.1, 0.2, 0.3, 0.4, 0.5]);
      const output = dropout.forward(input);
      
      expect(output).toBeDefined();
      expect(output.dim).toBe(5);
      expect(output.norm).toBeLessThan(1);
    });

    it('should handle different dropout rates', () => {
      const lowDropout = new HyperbolicDropout(0.1);
      const highDropout = new HyperbolicDropout(0.9);
      
      const input = createVector([0.1, 0.2, 0.3, 0.4, 0.5]);
      
      const lowOutput = lowDropout.forward(input);
      const highOutput = highDropout.forward(input);
      
      expect(lowOutput.norm).toBeLessThan(1);
      expect(highOutput.norm).toBeLessThan(1);
    });
  });

  describe('HyperbolicMessagePassing', () => {
    let messagePassing: HyperbolicMessagePassing;

    beforeEach(() => {
      messagePassing = new HyperbolicMessagePassing(8, 4);
    });

    it('should perform message passing in hyperbolic space', () => {
      const nodes = [
        createVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]),
        createVector([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])
      ];
      const edges = [[0, 1]];
      
      const result = messagePassing.forward(nodes, edges);
      
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      result.forEach(node => {
        expect(node.norm).toBeLessThan(1);
      });
    });

    it('should handle complex graph structures', () => {
      const nodes = [
        createVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]),
        createVector([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]),
        createVector([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0])
      ];
      const edges = [[0, 1], [1, 2], [0, 2]];
      
      const result = messagePassing.forward(nodes, edges);
      
      expect(result).toHaveLength(3);
      result.forEach(node => {
        expect(node.norm).toBeLessThan(1);
      });
    });

    it('should aggregate neighbor information', () => {
      const nodes = [
        createVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]),
        createVector([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])
      ];
      const edges = [[0, 1]];
      
      const aggregated = messagePassing.aggregateNeighbors(nodes, edges, 0);
      
      expect(aggregated).toBeDefined();
      expect(aggregated.norm).toBeLessThan(1);
    });
  });

  describe('Layer Composition', () => {
    it('should compose multiple layers', () => {
      const linear = new HyperbolicLinear(8, 6);
      const attention = new HyperbolicAttention(6);
      const dropout = new HyperbolicDropout(0.1);
      
      const input = createVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
      
      const linearOut = linear.forward(input);
      const attentionOut = attention.forward(linearOut, linearOut, linearOut);
      const dropoutOut = dropout.forward(attentionOut);
      
      expect(dropoutOut).toBeDefined();
      expect(dropoutOut.norm).toBeLessThan(1);
    });

    it('should handle layer stacking', () => {
      const layers = [
        new HyperbolicLinear(8, 6),
        new HyperbolicLinear(6, 4),
        new HyperbolicLinear(4, 2)
      ];
      
      const input = createVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
      
      let output = input;
      for (const layer of layers) {
        output = layer.forward(output);
        expect(output.norm).toBeLessThan(1);
      }
      
      expect(output.dim).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input dimensions', () => {
      const layer = new HyperbolicLinear(8, 4);
      const invalidInput = createVector([0.1, 0.2]); // Wrong dimension
      
      expect(() => layer.forward(invalidInput))
        .toThrow('Input dimension mismatch');
    });

    it('should handle null inputs', () => {
      const layer = new HyperbolicLinear(8, 4);
      
      expect(() => layer.forward(null as any))
        .toThrow('Input cannot be null or undefined');
    });

    it('should handle invalid layer configurations', () => {
      expect(() => new HyperbolicLinear(-1, 4))
        .toThrow('Invalid input dimension');
      
      expect(() => new HyperbolicLinear(8, -1))
        .toThrow('Invalid output dimension');
    });
  });

  describe('Performance', () => {
    it('should handle large batches efficiently', () => {
      const layer = new HyperbolicLinear(8, 4);
      const batch = Array.from({ length: 100 }, (_, i) => 
        createVector([i * 0.01, i * 0.02, i * 0.03, i * 0.04, i * 0.05, i * 0.06, i * 0.07, i * 0.08])
      );
      
      const startTime = Date.now();
      const outputs = layer.forwardBatch(batch);
      const endTime = Date.now();
      
      expect(outputs).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
