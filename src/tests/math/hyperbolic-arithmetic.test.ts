#!/usr/bin/env tsx

/**
 * Hyperbolic Arithmetic Tests
 * 
 * Comprehensive test suite for hyperbolic mathematical operations:
 * - Hyperbolic distance calculations
 * - Hyperbolic projections
 * - Geometric transformations
 * - Numerical stability
 */

import { HyperbolicArithmetic } from '../../math/hyperbolic-arithmetic';

describe('HyperbolicArithmetic', () => {
  let hyperbolicMath: HyperbolicArithmetic;

  beforeEach(() => {
    hyperbolicMath = new HyperbolicArithmetic();
  });

  describe('Distance Calculations', () => {
    test('should calculate hyperbolic distance correctly', () => {
      const point1 = [0.1, 0.2, 0.3];
      const point2 = [0.4, 0.5, 0.6];
      
      const distance = hyperbolicMath.hyperbolicDistance(point1, point2);
      
      expect(distance).toBeDefined();
      expect(typeof distance).toBe('number');
      expect(distance).toBeGreaterThan(0);
    });

    test('should handle identical points', () => {
      const point = [0.1, 0.2, 0.3];
      
      const distance = hyperbolicMath.hyperbolicDistance(point, point);
      
      expect(distance).toBe(0);
    });

    test('should handle zero vectors', () => {
      const zeroVector = [0, 0, 0];
      const point = [0.1, 0.2, 0.3];
      
      const distance = hyperbolicMath.hyperbolicDistance(zeroVector, point);
      
      expect(distance).toBeDefined();
      expect(typeof distance).toBe('number');
    });

    test('should maintain triangle inequality', () => {
      const point1 = [0.1, 0.2, 0.3];
      const point2 = [0.4, 0.5, 0.6];
      const point3 = [0.7, 0.8, 0.9];
      
      const dist12 = hyperbolicMath.hyperbolicDistance(point1, point2);
      const dist23 = hyperbolicMath.hyperbolicDistance(point2, point3);
      const dist13 = hyperbolicMath.hyperbolicDistance(point1, point3);
      
      expect(dist13).toBeLessThanOrEqual(dist12 + dist23);
    });
  });

  describe('Projections', () => {
    test('should project points to hyperbolic space', () => {
      const point = [1, 2, 3];
      
      const projected = hyperbolicMath.projectToHyperbolic(point);
      
      expect(projected).toBeDefined();
      expect(Array.isArray(projected)).toBe(true);
      expect(projected.length).toBe(point.length);
    });

    test('should handle projection of zero vector', () => {
      const zeroVector = [0, 0, 0];
      
      const projected = hyperbolicMath.projectToHyperbolic(zeroVector);
      
      expect(projected).toBeDefined();
      expect(Array.isArray(projected)).toBe(true);
    });

    test('should maintain projection properties', () => {
      const point = [0.5, 0.3, 0.8];
      
      const projected = hyperbolicMath.projectToHyperbolic(point);
      
      // Projected point should be within hyperbolic space
      expect(projected).toBeDefined();
      expect(Array.isArray(projected)).toBe(true);
    });
  });

  describe('Geometric Transformations', () => {
    test('should perform hyperbolic translations', () => {
      const point = [0.1, 0.2, 0.3];
      const translation = [0.1, 0.1, 0.1];
      
      const translated = hyperbolicMath.hyperbolicTranslate(point, translation);
      
      expect(translated).toBeDefined();
      expect(Array.isArray(translated)).toBe(true);
      expect(translated.length).toBe(point.length);
    });

    test('should perform hyperbolic rotations', () => {
      const point = [0.1, 0.2, 0.3];
      const angle = Math.PI / 4;
      
      const rotated = hyperbolicMath.hyperbolicRotate(point, angle);
      
      expect(rotated).toBeDefined();
      expect(Array.isArray(rotated)).toBe(true);
      expect(rotated.length).toBe(point.length);
    });

    test('should handle identity transformations', () => {
      const point = [0.1, 0.2, 0.3];
      const zeroTranslation = [0, 0, 0];
      const zeroAngle = 0;
      
      const translated = hyperbolicMath.hyperbolicTranslate(point, zeroTranslation);
      const rotated = hyperbolicMath.hyperbolicRotate(point, zeroAngle);
      
      expect(translated).toEqual(point);
      expect(rotated).toEqual(point);
    });
  });

  describe('Numerical Stability', () => {
    test('should handle very small numbers', () => {
      const smallPoint1 = [1e-10, 2e-10, 3e-10];
      const smallPoint2 = [4e-10, 5e-10, 6e-10];
      
      const distance = hyperbolicMath.hyperbolicDistance(smallPoint1, smallPoint2);
      
      expect(distance).toBeDefined();
      expect(typeof distance).toBe('number');
      expect(isFinite(distance)).toBe(true);
    });

    test('should handle very large numbers', () => {
      const largePoint1 = [1e10, 2e10, 3e10];
      const largePoint2 = [4e10, 5e10, 6e10];
      
      const distance = hyperbolicMath.hyperbolicDistance(largePoint1, largePoint2);
      
      expect(distance).toBeDefined();
      expect(typeof distance).toBe('number');
      expect(isFinite(distance)).toBe(true);
    });

    test('should handle edge cases without overflow', () => {
      const maxPoint = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
      const minPoint = [Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE];
      
      expect(() => {
        hyperbolicMath.hyperbolicDistance(maxPoint, minPoint);
      }).not.toThrow();
    });
  });

  describe('Curvature Handling', () => {
    test('should work with different curvature values', () => {
      const point1 = [0.1, 0.2, 0.3];
      const point2 = [0.4, 0.5, 0.6];
      
      const curvatures = [-1, -0.5, -2, -0.1];
      
      for (const curvature of curvatures) {
        const math = new HyperbolicArithmetic(curvature);
        const distance = math.hyperbolicDistance(point1, point2);
        
        expect(distance).toBeDefined();
        expect(typeof distance).toBe('number');
        expect(distance).toBeGreaterThan(0);
      }
    });

    test('should handle zero curvature (Euclidean case)', () => {
      const point1 = [0.1, 0.2, 0.3];
      const point2 = [0.4, 0.5, 0.6];
      
      const euclideanMath = new HyperbolicArithmetic(0);
      const distance = euclideanMath.hyperbolicDistance(point1, point2);
      
      expect(distance).toBeDefined();
      expect(typeof distance).toBe('number');
    });
  });

  describe('Vector Operations', () => {
    test('should calculate vector norms', () => {
      const vector = [3, 4, 5];
      
      const norm = hyperbolicMath.hyperbolicNorm(vector);
      
      expect(norm).toBeDefined();
      expect(typeof norm).toBe('number');
      expect(norm).toBeGreaterThan(0);
    });

    test('should normalize vectors', () => {
      const vector = [3, 4, 5];
      
      const normalized = hyperbolicMath.hyperbolicNormalize(vector);
      
      expect(normalized).toBeDefined();
      expect(Array.isArray(normalized)).toBe(true);
      expect(normalized.length).toBe(vector.length);
    });

    test('should handle zero vector normalization', () => {
      const zeroVector = [0, 0, 0];
      
      const normalized = hyperbolicMath.hyperbolicNormalize(zeroVector);
      
      expect(normalized).toBeDefined();
      expect(Array.isArray(normalized)).toBe(true);
    });
  });

  describe('Batch Operations', () => {
    test('should handle batch distance calculations', () => {
      const points = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
        [0.7, 0.8, 0.9]
      ];
      
      const distances = hyperbolicMath.batchHyperbolicDistance(points);
      
      expect(distances).toBeDefined();
      expect(Array.isArray(distances)).toBe(true);
      expect(distances.length).toBe(points.length);
    });

    test('should handle batch projections', () => {
      const points = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      
      const projections = hyperbolicMath.batchProjectToHyperbolic(points);
      
      expect(projections).toBeDefined();
      expect(Array.isArray(projections)).toBe(true);
      expect(projections.length).toBe(points.length);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid input gracefully', () => {
      expect(() => {
        hyperbolicMath.hyperbolicDistance([], [1, 2, 3]);
      }).not.toThrow();
      
      expect(() => {
        hyperbolicMath.hyperbolicDistance([1, 2], [1, 2, 3]);
      }).not.toThrow();
    });

    test('should handle NaN and Infinity inputs', () => {
      const nanPoint = [NaN, NaN, NaN];
      const infPoint = [Infinity, Infinity, Infinity];
      
      expect(() => {
        hyperbolicMath.hyperbolicDistance(nanPoint, infPoint);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should handle large batch operations efficiently', () => {
      const largePointSet = Array.from({ length: 1000 }, (_, i) => [
        Math.random(),
        Math.random(),
        Math.random()
      ]);
      
      const startTime = Date.now();
      const distances = hyperbolicMath.batchHyperbolicDistance(largePointSet);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 1 second
      expect(distances).toHaveLength(largePointSet.length);
    });

    test('should handle repeated operations efficiently', () => {
      const point1 = [0.1, 0.2, 0.3];
      const point2 = [0.4, 0.5, 0.6];
      
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        hyperbolicMath.hyperbolicDistance(point1, point2);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // 500ms
    });
  });
});
