/**
 * Code Embedding Tests
 * 
 * Tests for hyperbolic embedding generation for the project codebase.
 * Converted from src/demo/code-embedding-demo.ts
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { CodeEmbeddingGenerator, analyzeProjectCode } from '../../analysis/code-embeddings';
import { HyperbolicArithmetic } from '../../math/hyperbolic-arithmetic';
import * as path from 'path';

describe('Code Embedding Analysis', () => {
  let projectRoot: string;
  let hierarchy: any;

  beforeAll(async () => {
    // Get project root (src directory)
    projectRoot = path.join(__dirname, '../../');
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('Project Code Analysis', () => {
    it('should analyze project code and generate hierarchy', async () => {
      // Analyze the project code
      hierarchy = await analyzeProjectCode(projectRoot);
      
      expect(hierarchy).toBeDefined();
      expect(hierarchy.metrics).toBeDefined();
      expect(hierarchy.elements).toBeDefined();
      expect(hierarchy.relationships).toBeDefined();
    });

    it('should have valid project metrics', () => {
      expect(hierarchy.metrics.totalFiles).toBeGreaterThan(0);
      expect(hierarchy.metrics.totalLines).toBeGreaterThan(0);
      expect(hierarchy.metrics.avgComplexity).toBeGreaterThanOrEqual(0);
      expect(hierarchy.metrics.maxDepth).toBeGreaterThan(0);
      expect(hierarchy.metrics.connectivityScore).toBeGreaterThanOrEqual(0);
      expect(hierarchy.metrics.connectivityScore).toBeLessThanOrEqual(1);
    });

    it('should have code elements with valid types', () => {
      const validTypes = ['file', 'class', 'function', 'interface', 'type', 'enum', 'namespace'];
      const elementTypes = hierarchy.elements.map((e: any) => e.type);
      
      elementTypes.forEach((type: string) => {
        expect(validTypes).toContain(type);
      });
    });

    it('should have relationships with valid types', () => {
      const validRelationshipTypes = ['imports', 'extends', 'implements', 'calls', 'contains', 'references'];
      const relationshipTypes = hierarchy.relationships.map((r: any) => r.type);
      
      relationshipTypes.forEach((type: string) => {
        expect(validRelationshipTypes).toContain(type);
      });
    });
  });

  describe('Code Elements Analysis', () => {
    it('should identify most complex elements', () => {
      const complexElements = hierarchy.elements
        .filter((e: any) => e.type !== 'file')
        .sort((a: any, b: any) => b.complexity - a.complexity)
        .slice(0, 5);

      expect(complexElements.length).toBeGreaterThan(0);
      complexElements.forEach((element: any) => {
        expect(element.complexity).toBeGreaterThanOrEqual(0);
        expect(element.name).toBeDefined();
        expect(element.type).toBeDefined();
        expect(element.filePath).toBeDefined();
      });
    });

    it('should identify largest files', () => {
      const largestFiles = hierarchy.elements
        .filter((e: any) => e.type === 'file')
        .sort((a: any, b: any) => b.lineCount - a.lineCount)
        .slice(0, 5);

      expect(largestFiles.length).toBeGreaterThan(0);
      largestFiles.forEach((file: any) => {
        expect(file.lineCount).toBeGreaterThan(0);
        expect(file.name).toBeDefined();
        expect(file.filePath).toBeDefined();
      });
    });
  });

  describe('Hyperbolic Embeddings', () => {
    it('should generate embeddings for code elements', () => {
      const elementsWithEmbeddings = hierarchy.elements.filter((e: any) => e.embedding);
      
      if (elementsWithEmbeddings.length > 0) {
        expect(elementsWithEmbeddings.length).toBeGreaterThan(0);
        
        // Validate embedding properties
        elementsWithEmbeddings.forEach((element: any) => {
          expect(element.embedding).toBeDefined();
          expect(element.embedding.data).toBeDefined();
          expect(Array.isArray(element.embedding.data)).toBe(true);
          expect(element.embedding.data.length).toBeGreaterThan(0);
        });
      }
    });

    it('should have embeddings with valid hyperbolic constraints', () => {
      const elementsWithEmbeddings = hierarchy.elements.filter((e: any) => e.embedding);
      
      if (elementsWithEmbeddings.length > 0) {
        // Calculate embedding statistics
        const norms = elementsWithEmbeddings.map((e: any) => 
          Math.sqrt(e.embedding.data.reduce((sum: number, val: number) => sum + val * val, 0))
        );
        
        const maxNorm = Math.max(...norms);
        const minNorm = Math.min(...norms);
        const avgNorm = norms.reduce((a: number, b: number) => a + b, 0) / norms.length;

        // All norms should be less than 1.0 for Poincaré ball
        expect(maxNorm).toBeLessThan(1.0);
        expect(minNorm).toBeGreaterThanOrEqual(0);
        expect(avgNorm).toBeGreaterThanOrEqual(0);
        expect(avgNorm).toBeLessThan(1.0);
      }
    });

    it('should compute hyperbolic distances between elements', () => {
      const elementsWithEmbeddings = hierarchy.elements.filter((e: any) => e.embedding);
      
      if (elementsWithEmbeddings.length >= 2) {
        const element1 = elementsWithEmbeddings[0];
        const element2 = elementsWithEmbeddings[1];
        
        const distance = HyperbolicArithmetic.distance(
          element1.embedding,
          element2.embedding
        );
        
        expect(distance).toBeGreaterThanOrEqual(0);
        expect(distance).toBeLessThan(Infinity);
        expect(typeof distance).toBe('number');
      }
    });
  });

  describe('Code Embedding Generator', () => {
    let generator: CodeEmbeddingGenerator;

    beforeAll(() => {
      generator = new CodeEmbeddingGenerator(projectRoot);
      
      // Populate the generator with our analysis
      for (const element of hierarchy.elements) {
        generator['codeElements'].set(element.id, element);
      }
    });

    it('should find similar elements', () => {
      const elementsWithEmbeddings = hierarchy.elements.filter((e: any) => e.embedding);
      
      if (elementsWithEmbeddings.length > 0) {
        const targetElement = elementsWithEmbeddings[0];
        const similar = generator.findSimilarElements(targetElement.id, 3);
        
        expect(similar).toBeDefined();
        expect(Array.isArray(similar)).toBe(true);
        expect(similar.length).toBeLessThanOrEqual(3);
        
        similar.forEach((item: any) => {
          expect(item.element).toBeDefined();
          expect(item.distance).toBeGreaterThanOrEqual(0);
          expect(typeof item.distance).toBe('number');
        });
      }
    });
  });

  describe('Performance Metrics', () => {
    it('should have reasonable performance characteristics', () => {
      const totalElements = hierarchy.elements.length;
      const totalRelationships = hierarchy.relationships.length;
      
      expect(totalElements).toBeGreaterThan(0);
      expect(totalRelationships).toBeGreaterThanOrEqual(0);
      
      // Performance expectations
      expect(hierarchy.metrics.avgComplexity).toBeLessThan(50); // Reasonable complexity
      expect(hierarchy.metrics.connectivityScore).toBeGreaterThan(0.1); // Some connectivity
    });
  });
});
