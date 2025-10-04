/**
 * Test suite for Hyperbolic Projection Engine
 * Tests projection algorithms and geometric transformations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  HyperbolicProjectionEngine, 
  H2GNNBinarySchema,
  OptimizedH2GNNProvider,
  H2GNNEmbedding
} from '../../math/hyperbolic-projection-engine';
import { createVector } from '../../math/hyperbolic-arithmetic';

describe('Hyperbolic Projection Engine', () => {
  let engine: HyperbolicProjectionEngine;

  beforeEach(() => {
    engine = new HyperbolicProjectionEngine();
  });

  describe('Projection Operations', () => {
    it('should project to hyperbolic space', () => {
      const euclideanPoint = [0.5, 0.3, 0.8];
      const hyperbolicPoint = engine.projectToHyperbolic(euclideanPoint);
      
      expect(hyperbolicPoint).toBeDefined();
      expect(hyperbolicPoint.length).toBe(4); // Lorentz coordinates
    });

    it('should maintain hyperbolic constraints', () => {
      const point = [0.5, 0.3, 0.8];
      const projected = engine.projectToHyperbolic(point);
      
      // Check Lorentz constraint: x₀² - x₁² - x₂² - x₃² = 1
      const constraint = projected[0]**2 - projected[1]**2 - projected[2]**2 - projected[3]**2;
      expect(constraint).toBeCloseTo(1, 5);
    });

    it('should project from hyperbolic to Euclidean space', () => {
      const hyperbolicPoint = [1.2, 0.3, 0.4, 0.5];
      const euclideanPoint = engine.projectFromHyperbolic(hyperbolicPoint);
      
      expect(euclideanPoint).toBeDefined();
      expect(euclideanPoint.length).toBe(3);
    });

    it('should maintain round-trip consistency', () => {
      const originalPoint = [0.3, 0.4, 0.5];
      const hyperbolic = engine.projectToHyperbolic(originalPoint);
      const backToEuclidean = engine.projectFromHyperbolic(hyperbolic);
      
      expect(backToEuclidean[0]).toBeCloseTo(originalPoint[0], 3);
      expect(backToEuclidean[1]).toBeCloseTo(originalPoint[1], 3);
      expect(backToEuclidean[2]).toBeCloseTo(originalPoint[2], 3);
    });
  });

  describe('Binary Schema Operations', () => {
    it('should encode embeddings to binary format', () => {
      const embeddings = [
        createVector([0.1, 0.2, 0.3]),
        createVector([0.4, 0.5, 0.6])
      ];
      
      const binary = engine.encodeEmbeddings(embeddings);
      
      expect(binary).toBeDefined();
      expect(binary.byteLength).toBeGreaterThan(0);
    });

    it('should decode embeddings from binary format', () => {
      const embeddings = [
        createVector([0.1, 0.2, 0.3]),
        createVector([0.4, 0.5, 0.6])
      ];
      
      const binary = engine.encodeEmbeddings(embeddings);
      const decoded = engine.decodeEmbeddings(binary);
      
      expect(decoded).toHaveLength(2);
      expect(decoded[0].data[0]).toBeCloseTo(0.1, 5);
      expect(decoded[0].data[1]).toBeCloseTo(0.2, 5);
      expect(decoded[0].data[2]).toBeCloseTo(0.3, 5);
    });

    it('should handle large embedding arrays', () => {
      const embeddings = Array.from({ length: 100 }, (_, i) => 
        createVector([i * 0.01, i * 0.02, i * 0.03])
      );
      
      const binary = engine.encodeEmbeddings(embeddings);
      const decoded = engine.decodeEmbeddings(binary);
      
      expect(decoded).toHaveLength(100);
      expect(decoded[0].data[0]).toBeCloseTo(0, 5);
      expect(decoded[99].data[0]).toBeCloseTo(0.99, 5);
    });
  });

  describe('Optimized Provider', () => {
    it('should create optimized provider', () => {
      const provider = new OptimizedH2GNNProvider();
      
      expect(provider).toBeDefined();
      expect(provider.isOptimized()).toBe(true);
    });

    it('should provide optimized embeddings', async () => {
      const provider = new OptimizedH2GNNProvider();
      const embeddings = await provider.generateEmbeddings({
        nodes: [
          createVector([0.1, 0.2]),
          createVector([0.3, 0.4])
        ],
        edges: [[0, 1]]
      });
      
      expect(embeddings).toBeDefined();
      expect(embeddings.length).toBe(2);
    });

    it('should handle batch processing', async () => {
      const provider = new OptimizedH2GNNProvider();
      const batchSize = 10;
      
      const embeddings = await provider.generateBatchEmbeddings({
        nodes: Array.from({ length: batchSize }, (_, i) => 
          createVector([i * 0.1, i * 0.2])
        ),
        edges: Array.from({ length: batchSize - 1 }, (_, i) => [i, i + 1])
      });
      
      expect(embeddings).toHaveLength(batchSize);
    });
  });

  describe('Geometric Consistency', () => {
    it('should maintain hyperbolic distances', () => {
      const point1 = [0.1, 0.2, 0.3];
      const point2 = [0.4, 0.5, 0.6];
      
      const hyperbolic1 = engine.projectToHyperbolic(point1);
      const hyperbolic2 = engine.projectToHyperbolic(point2);
      
      const distance = engine.computeHyperbolicDistance(hyperbolic1, hyperbolic2);
      
      expect(distance).toBeGreaterThan(0);
      expect(Number.isFinite(distance)).toBe(true);
    });

    it('should preserve geometric properties', () => {
      const testPoints = [
        [0.1, 0.2],
        [0.3, 0.4],
        [0.5, 0.6]
      ];
      
      const hyperbolicPoints = testPoints.map(point => 
        engine.projectToHyperbolic(point)
      );
      
      // Check that all points maintain hyperbolic constraints
      hyperbolicPoints.forEach(point => {
        const constraint = point[0]**2 - point[1]**2 - point[2]**2;
        expect(constraint).toBeCloseTo(1, 5);
      });
    });

    it('should handle edge cases near boundary', () => {
      const nearBoundaryPoint = [0.999, 0.001];
      const projected = engine.projectToHyperbolic(nearBoundaryPoint);
      
      expect(projected).toBeDefined();
      expect(projected.length).toBe(3);
      
      // Should still maintain hyperbolic constraints
      const constraint = projected[0]**2 - projected[1]**2 - projected[2]**2;
      expect(constraint).toBeCloseTo(1, 5);
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large-scale projections efficiently', () => {
      const startTime = Date.now();
      
      const points = Array.from({ length: 1000 }, (_, i) => [
        Math.random() * 0.9,
        Math.random() * 0.9,
        Math.random() * 0.9
      ]);
      
      const projections = points.map(point => 
        engine.projectToHyperbolic(point)
      );
      
      const endTime = Date.now();
      
      expect(projections).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should optimize memory usage', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      const points = Array.from({ length: 100 }, (_, i) => [
        i * 0.01,
        i * 0.02,
        i * 0.03
      ]);
      
      const projections = points.map(point => 
        engine.projectToHyperbolic(point)
      );
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input dimensions', () => {
      expect(() => engine.projectToHyperbolic([0.5])) // 1D input
        .toThrow('Invalid input dimensions');
    });

    it('should handle points outside valid range', () => {
      const invalidPoint = [2.0, 1.5, 1.0]; // Outside unit ball
      
      expect(() => engine.projectToHyperbolic(invalidPoint))
        .toThrow('Point outside valid hyperbolic range');
    });

    it('should handle null or undefined inputs', () => {
      expect(() => engine.projectToHyperbolic(null as any))
        .toThrow('Input cannot be null or undefined');
      
      expect(() => engine.projectToHyperbolic(undefined as any))
        .toThrow('Input cannot be null or undefined');
    });
  });
});
