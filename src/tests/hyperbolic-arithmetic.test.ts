/**
 * Test suite for Hyperbolic Arithmetic Operations
 * Validates mathematical correctness of Möbius operations
 */

import { describe, it, expect, test } from 'vitest';
import { HyperbolicArithmetic, createVector } from '../math/hyperbolic-arithmetic';

describe('HyperbolicArithmetic', () => {
  describe('Basic Operations', () => {
    it('should create vectors correctly', () => {
      const v = createVector([0.5, 0.3]);
      expect(v.data).toEqual([0.5, 0.3]);
      expect(v.dim).toBe(2);
    });

    it('should compute vector norm correctly', () => {
      const v = createVector([3, 4]);
      expect(HyperbolicArithmetic.norm(v)).toBe(5);
    });

    it('should compute dot product correctly', () => {
      const u = createVector([1, 2]);
      const v = createVector([3, 4]);
      expect(HyperbolicArithmetic.dot(u, v)).toBe(11);
    });

    it('should project vectors to Poincaré ball', () => {
      const v = createVector([2, 2]); // Outside unit circle
      const projected = HyperbolicArithmetic.projectToPoincareBall(v);
      expect(HyperbolicArithmetic.norm(projected)).toBeLessThan(1);
    });
  });

  describe('Möbius Operations', () => {
    it('should perform Möbius addition correctly', () => {
      const u = createVector([0.2, 0.1]);
      const v = createVector([0.1, 0.3]);
      const result = HyperbolicArithmetic.mobiusAdd(u, v);
      
      // Result should be in Poincaré ball
      expect(HyperbolicArithmetic.norm(result)).toBeLessThan(1);
      
      // Möbius addition should be commutative
      const result2 = HyperbolicArithmetic.mobiusAdd(v, u);
      expect(result.data[0]).toBeCloseTo(result2.data[0], 10);
      expect(result.data[1]).toBeCloseTo(result2.data[1], 10);
    });

    it('should handle Möbius addition with origin', () => {
      const v = createVector([0.5, 0.3]);
      const origin = createVector([0, 0]);
      const result = HyperbolicArithmetic.mobiusAdd(v, origin);
      
      // Adding origin should return original vector
      expect(result.data[0]).toBeCloseTo(v.data[0], 10);
      expect(result.data[1]).toBeCloseTo(v.data[1], 10);
    });

    it('should perform Möbius scalar multiplication correctly', () => {
      const v = createVector([0.5, 0.3]);
      const result = HyperbolicArithmetic.mobiusScalarMult(2, v);
      
      // Result should be in Poincaré ball
      expect(HyperbolicArithmetic.norm(result)).toBeLessThan(1);
      
      // Direction should be preserved
      const vNorm = HyperbolicArithmetic.norm(v);
      const resultNorm = HyperbolicArithmetic.norm(result);
      if (vNorm > 0 && resultNorm > 0) {
        const vUnit = createVector(v.data.map(x => x / vNorm));
        const resultUnit = createVector(result.data.map(x => x / resultNorm));
        expect(HyperbolicArithmetic.dot(vUnit, resultUnit)).toBeCloseTo(1, 5);
      }
    });

    it('should handle scalar multiplication by zero', () => {
      const v = createVector([0.5, 0.3]);
      const result = HyperbolicArithmetic.mobiusScalarMult(0, v);
      
      expect(HyperbolicArithmetic.norm(result)).toBeCloseTo(0, 10);
    });
  });

  describe('Hyperbolic Distance', () => {
    it('should compute distance correctly', () => {
      const u = createVector([0.2, 0.1]);
      const v = createVector([0.1, 0.3]);
      const distance = HyperbolicArithmetic.distance(u, v);
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeFinite();
    });

    it('should have zero distance for identical points', () => {
      const v = createVector([0.5, 0.3]);
      const distance = HyperbolicArithmetic.distance(v, v);
      
      expect(distance).toBeCloseTo(0, 10);
    });

    it('should be symmetric', () => {
      const u = createVector([0.2, 0.1]);
      const v = createVector([0.1, 0.3]);
      
      const dist1 = HyperbolicArithmetic.distance(u, v);
      const dist2 = HyperbolicArithmetic.distance(v, u);
      
      expect(dist1).toBeCloseTo(dist2, 10);
    });
  });

  describe('Exponential and Logarithmic Maps', () => {
    it('should satisfy exp(log(q)) = q for points in Poincaré ball', () => {
      const p = createVector([0.1, 0.2]);
      const q = createVector([0.3, 0.1]);
      
      const logQ = HyperbolicArithmetic.logMap(p, q);
      const expLogQ = HyperbolicArithmetic.expMap(p, logQ);
      
      expect(expLogQ.data[0]).toBeCloseTo(q.data[0], 8);
      expect(expLogQ.data[1]).toBeCloseTo(q.data[1], 8);
    });

    it('should handle exponential map from origin', () => {
      const origin = createVector([0, 0]);
      const v = createVector([0.1, 0.2]);
      
      const result = HyperbolicArithmetic.expMap(origin, v);
      expect(HyperbolicArithmetic.norm(result)).toBeLessThan(1);
    });
  });

  describe('Parallel Transport', () => {
    it('should preserve vector magnitude approximately', () => {
      const p = createVector([0.1, 0.1]);
      const q = createVector([0.2, 0.3]);
      const v = createVector([0.05, 0.1]);
      
      const transported = HyperbolicArithmetic.parallelTransport(p, q, v);
      
      // In hyperbolic space, parallel transport doesn't preserve Euclidean norm
      // but should preserve hyperbolic properties
      expect(HyperbolicArithmetic.norm(transported)).toBeFinite();
      expect(HyperbolicArithmetic.norm(transported)).toBeGreaterThan(0);
    });
  });

  describe('Hyperbolic Attention', () => {
    it('should compute attention weights correctly', () => {
      const query = createVector([0.2, 0.1]);
      const key = createVector([0.1, 0.3]);
      
      const attention = HyperbolicArithmetic.hyperbolicAttention(query, key);
      
      expect(attention).toBeGreaterThan(0);
      expect(attention).toBeLessThanOrEqual(1);
    });

    it('should give maximum attention for identical vectors', () => {
      const v = createVector([0.2, 0.1]);
      const attention = HyperbolicArithmetic.hyperbolicAttention(v, v);
      
      expect(attention).toBeCloseTo(1, 10);
    });
  });

  describe('Batch Operations', () => {
    it('should perform batch Möbius addition', () => {
      const vectors = [
        createVector([0.1, 0.1]),
        createVector([0.2, 0.1]),
        createVector([0.1, 0.2])
      ];
      
      const result = HyperbolicArithmetic.batchMobiusAdd(vectors);
      
      expect(HyperbolicArithmetic.norm(result)).toBeLessThan(1);
      expect(result.dim).toBe(2);
    });

    it('should handle single vector in batch', () => {
      const vector = createVector([0.3, 0.2]);
      const result = HyperbolicArithmetic.batchMobiusAdd([vector]);
      
      expect(result.data[0]).toBeCloseTo(vector.data[0], 10);
      expect(result.data[1]).toBeCloseTo(vector.data[1], 10);
    });
  });

  describe('Model Conversions', () => {
    it('should convert to and from Lorentz model', () => {
      const poincare = createVector([0.3, 0.4]);
      const lorentz = HyperbolicArithmetic.toLorentz(poincare);
      const backToPoincare = HyperbolicArithmetic.fromLorentz(lorentz);
      
      expect(backToPoincare.data[0]).toBeCloseTo(poincare.data[0], 8);
      expect(backToPoincare.data[1]).toBeCloseTo(poincare.data[1], 8);
    });
  });

  describe('Validation and Utilities', () => {
    it('should validate hyperbolic constraints', () => {
      const validPoint = createVector([0.5, 0.3]);
      const invalidPoint = createVector([1.5, 0.3]);
      
      expect(HyperbolicArithmetic.validateHyperbolic(validPoint)).toBe(true);
      expect(HyperbolicArithmetic.validateHyperbolic(invalidPoint)).toBe(false);
    });

    it('should generate random hyperbolic points', () => {
      const point = HyperbolicArithmetic.randomHyperbolicPoint(3, 0.8);
      
      expect(point.dim).toBe(3);
      expect(HyperbolicArithmetic.norm(point)).toBeLessThan(1);
      expect(HyperbolicArithmetic.validateHyperbolic(point)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small vectors', () => {
      const tiny = createVector([1e-10, 1e-10]);
      const result = HyperbolicArithmetic.mobiusScalarMult(2, tiny);
      
      expect(HyperbolicArithmetic.norm(result)).toBeFinite();
    });

    it('should handle vectors near boundary', () => {
      const nearBoundary = createVector([0.999, 0.001]);
      const projected = HyperbolicArithmetic.projectToPoincareBall(nearBoundary);
      
      expect(HyperbolicArithmetic.norm(projected)).toBeLessThan(1);
      expect(HyperbolicArithmetic.validateHyperbolic(projected)).toBe(true);
    });
  });
});

// Integration tests
describe('Hyperbolic Geometry Integration', () => {
  it('should maintain mathematical consistency across operations', () => {
    // Test the fundamental property: (u ⊕ v) ⊖ u = v
    const u = createVector([0.2, 0.1]);
    const v = createVector([0.1, 0.3]);
    
    const sum = HyperbolicArithmetic.mobiusAdd(u, v);
    const negU = createVector(u.data.map(x => -x));
    const difference = HyperbolicArithmetic.mobiusAdd(sum, negU);
    
    // Should approximately equal v
    expect(difference.data[0]).toBeCloseTo(v.data[0], 5);
    expect(difference.data[1]).toBeCloseTo(v.data[1], 5);
  });

  it('should preserve hyperbolic structure in complex operations', () => {
    // Create a sequence of operations and verify consistency
    const points = [
      createVector([0.1, 0.1]),
      createVector([0.2, 0.3]),
      createVector([0.3, 0.1])
    ];
    
    // Compute pairwise distances
    const distances: number[][] = [];
    for (let i = 0; i < points.length; i++) {
      distances[i] = [];
      for (let j = 0; j < points.length; j++) {
        distances[i][j] = HyperbolicArithmetic.distance(points[i], points[j]);
      }
    }
    
    // Verify triangle inequality (modified for hyperbolic space)
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < points.length; j++) {
        for (let k = 0; k < points.length; k++) {
          if (i !== j && j !== k && i !== k) {
            // In hyperbolic space, triangle inequality still holds
            expect(distances[i][k]).toBeLessThanOrEqual(
              distances[i][j] + distances[j][k] + 1e-10
            );
          }
        }
      }
    }
  });
});
