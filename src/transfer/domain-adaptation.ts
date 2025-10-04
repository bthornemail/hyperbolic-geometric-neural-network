#!/usr/bin/env tsx

/**
 * Domain Adaptation System
 * 
 * This module provides domain adaptation capabilities for knowledge transfer:
 * - Cross-domain concept mapping
 * - Domain-specific fine-tuning
 * - Knowledge distillation
 * - Domain similarity analysis
 * - Adaptive learning mechanisms
 */

export interface Domain {
  id: string;
  name: string;
  description: string;
  concepts: string[];
  embeddings: Map<string, number[]>;
  relationships: Array<{source: string, target: string, type: string, strength: number}>;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface DomainMapping {
  sourceDomain: string;
  targetDomain: string;
  conceptMappings: Array<{
    sourceConcept: string;
    targetConcept: string;
    similarity: number;
    confidence: number;
  }>;
  overallSimilarity: number;
  adaptationStrategy: 'direct' | 'indirect' | 'hierarchical' | 'multi_step';
  createdAt: number;
}

export interface AdaptationResult {
  sourceDomain: string;
  targetDomain: string;
  adaptedEmbeddings: Map<string, number[]>;
  transferMetrics: {
    similarity: number;
    coverage: number;
    accuracy: number;
    efficiency: number;
  };
  adaptedConcepts: string[];
  failedConcepts: string[];
  recommendations: string[];
}

export interface TransferMetrics {
  sourceDomain: string;
  targetDomain: string;
  similarity: number;
  coverage: number;
  accuracy: number;
  efficiency: number;
  transferTime: number;
  memoryUsage: number;
  successRate: number;
}

export class DomainAdaptationSystem {
  private domains: Map<string, Domain> = new Map();
  private mappings: Map<string, DomainMapping> = new Map();
  private adaptationHistory: Array<AdaptationResult> = [];
  private similarityCache: Map<string, Map<string, number>> = new Map();

  constructor() {
    console.warn('🔄 Domain Adaptation System initialized');
  }

  /**
   * Register a new domain
   */
  registerDomain(domain: Domain): void {
    this.domains.set(domain.id, domain);
    console.warn(`📚 Registered domain: ${domain.name} (${domain.concepts.length} concepts)`);
  }

  /**
   * Get domain by ID
   */
  getDomain(domainId: string): Domain | null {
    return this.domains.get(domainId) || null;
  }

  /**
   * Get all domains
   */
  getAllDomains(): Domain[] {
    return Array.from(this.domains.values());
  }

  /**
   * Map concepts between domains
   */
  mapConcepts(sourceDomainId: string, targetDomainId: string): DomainMapping {
    const sourceDomain = this.domains.get(sourceDomainId);
    const targetDomain = this.domains.get(targetDomainId);
    
    if (!sourceDomain || !targetDomain) {
      throw new Error('Source or target domain not found');
    }
    
    const conceptMappings: DomainMapping['conceptMappings'] = [];
    
    // Calculate concept similarities
    for (const sourceConcept of sourceDomain.concepts) {
      const sourceEmbedding = sourceDomain.embeddings.get(sourceConcept);
      if (!sourceEmbedding) continue;
      
      let bestMatch = { targetConcept: '', similarity: 0, confidence: 0 };
      
      for (const targetConcept of targetDomain.concepts) {
        const targetEmbedding = targetDomain.embeddings.get(targetConcept);
        if (!targetEmbedding) continue;
        
        const similarity = this.calculateEmbeddingSimilarity(sourceEmbedding, targetEmbedding);
        const confidence = this.calculateConfidence(sourceEmbedding, targetEmbedding, similarity);
        
        if (similarity > bestMatch.similarity) {
          bestMatch = { targetConcept, similarity, confidence };
        }
      }
      
      if (bestMatch.similarity > 0.3) { // Minimum similarity threshold
        conceptMappings.push({
          sourceConcept,
          targetConcept: bestMatch.targetConcept,
          similarity: bestMatch.similarity,
          confidence: bestMatch.confidence
        });
      }
    }
    
    // Calculate overall similarity
    const overallSimilarity = conceptMappings.length > 0 
      ? conceptMappings.reduce((sum, mapping) => sum + mapping.similarity, 0) / conceptMappings.length
      : 0;
    
    // Determine adaptation strategy
    const adaptationStrategy = this.determineAdaptationStrategy(overallSimilarity, conceptMappings.length);
    
    const mapping: DomainMapping = {
      sourceDomain: sourceDomainId,
      targetDomain: targetDomainId,
      conceptMappings,
      overallSimilarity,
      adaptationStrategy,
      createdAt: Date.now()
    };
    
    this.mappings.set(`${sourceDomainId}-${targetDomainId}`, mapping);
    
    console.warn(`🔗 Mapped ${conceptMappings.length} concepts between ${sourceDomain.name} and ${targetDomain.name}`);
    return mapping;
  }

  /**
   * Calculate embedding similarity
   */
  private calculateEmbeddingSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(embedding1: number[], embedding2: number[], similarity: number): number {
    // Confidence based on similarity and embedding quality
    const embeddingQuality1 = this.calculateEmbeddingQuality(embedding1);
    const embeddingQuality2 = this.calculateEmbeddingQuality(embedding2);
    const qualityScore = (embeddingQuality1 + embeddingQuality2) / 2;
    
    return similarity * qualityScore;
  }

  /**
   * Calculate embedding quality
   */
  private calculateEmbeddingQuality(embedding: number[]): number {
    // Simple quality metric - in reality, you'd use more sophisticated methods
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    const variance = this.calculateVariance(embedding);
    
    return Math.min(1, magnitude * (1 - variance));
  }

  /**
   * Calculate variance of embedding
   */
  private calculateVariance(embedding: number[]): number {
    const mean = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
    const variance = embedding.reduce((sum, val) => sum + (val - mean) * (val - mean), 0) / embedding.length;
    return variance;
  }

  /**
   * Determine adaptation strategy
   */
  private determineAdaptationStrategy(similarity: number, mappingCount: number): DomainMapping['adaptationStrategy'] {
    if (similarity > 0.8 && mappingCount > 10) {
      return 'direct';
    } else if (similarity > 0.6 && mappingCount > 5) {
      return 'indirect';
    } else if (similarity > 0.4 && mappingCount > 3) {
      return 'hierarchical';
    } else {
      return 'multi_step';
    }
  }

  /**
   * Transfer knowledge between domains
   */
  async transferKnowledge(sourceDomainId: string, targetDomainId: string): Promise<AdaptationResult> {
    const startTime = Date.now();
    
    const sourceDomain = this.domains.get(sourceDomainId);
    const targetDomain = this.domains.get(targetDomainId);
    
    if (!sourceDomain || !targetDomain) {
      throw new Error('Source or target domain not found');
    }
    
    // Get or create mapping
    const mappingKey = `${sourceDomainId}-${targetDomainId}`;
    let mapping = this.mappings.get(mappingKey);
    if (!mapping) {
      mapping = this.mapConcepts(sourceDomainId, targetDomainId);
    }
    
    // Perform adaptation based on strategy
    const adaptedEmbeddings = new Map<string, number[]>();
    const adaptedConcepts: string[] = [];
    const failedConcepts: string[] = [];
    
    for (const conceptMapping of mapping.conceptMappings) {
      try {
        const sourceEmbedding = sourceDomain.embeddings.get(conceptMapping.sourceConcept);
        const targetEmbedding = targetDomain.embeddings.get(conceptMapping.targetConcept);
        
        if (sourceEmbedding && targetEmbedding) {
          const adaptedEmbedding = this.adaptEmbedding(
            sourceEmbedding,
            targetEmbedding,
            mapping.adaptationStrategy
          );
          
          adaptedEmbeddings.set(conceptMapping.sourceConcept, adaptedEmbedding);
          adaptedConcepts.push(conceptMapping.sourceConcept);
        }
      } catch (error) {
        console.error(`❌ Failed to adapt concept ${conceptMapping.sourceConcept}:`, error);
        failedConcepts.push(conceptMapping.sourceConcept);
      }
    }
    
    // Calculate transfer metrics
    const transferTime = Date.now() - startTime;
    const transferMetrics = this.calculateTransferMetrics(
      sourceDomain,
      targetDomain,
      adaptedConcepts,
      failedConcepts,
      transferTime
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(mapping, transferMetrics);
    
    const result: AdaptationResult = {
      sourceDomain: sourceDomainId,
      targetDomain: targetDomainId,
      adaptedEmbeddings,
      transferMetrics,
      adaptedConcepts,
      failedConcepts,
      recommendations
    };
    
    this.adaptationHistory.push(result);
    
    console.warn(`✅ Knowledge transfer completed: ${adaptedConcepts.length} concepts adapted, ${failedConcepts.length} failed`);
    return result;
  }

  /**
   * Adapt embedding using specified strategy
   */
  private adaptEmbedding(
    sourceEmbedding: number[],
    targetEmbedding: number[],
    strategy: DomainMapping['adaptationStrategy']
  ): number[] {
    switch (strategy) {
      case 'direct':
        return this.directAdaptation(sourceEmbedding, targetEmbedding);
      case 'indirect':
        return this.indirectAdaptation(sourceEmbedding, targetEmbedding);
      case 'hierarchical':
        return this.hierarchicalAdaptation(sourceEmbedding, targetEmbedding);
      case 'multi_step':
        return this.multiStepAdaptation(sourceEmbedding, targetEmbedding);
      default:
        return sourceEmbedding; // No adaptation
    }
  }

  /**
   * Direct adaptation
   */
  private directAdaptation(sourceEmbedding: number[], targetEmbedding: number[]): number[] {
    // Simple linear interpolation
    const alpha = 0.5;
    return sourceEmbedding.map((val, i) => 
      alpha * val + (1 - alpha) * targetEmbedding[i]
    );
  }

  /**
   * Indirect adaptation
   */
  private indirectAdaptation(sourceEmbedding: number[], targetEmbedding: number[]): number[] {
    // More sophisticated adaptation with domain-specific adjustments
    const adaptedEmbedding = [...sourceEmbedding];
    
    // Apply domain-specific transformations
    for (let i = 0; i < adaptedEmbedding.length; i++) {
      const sourceVal = sourceEmbedding[i];
      const targetVal = targetEmbedding[i];
      
      // Adaptive interpolation based on value magnitude
      const alpha = Math.abs(sourceVal) / (Math.abs(sourceVal) + Math.abs(targetVal) + 1e-8);
      adaptedEmbedding[i] = alpha * sourceVal + (1 - alpha) * targetVal;
    }
    
    return adaptedEmbedding;
  }

  /**
   * Hierarchical adaptation
   */
  private hierarchicalAdaptation(sourceEmbedding: number[], targetEmbedding: number[]): number[] {
    // Multi-level adaptation
    let adaptedEmbedding = [...sourceEmbedding];
    
    // Level 1: Global alignment
    adaptedEmbedding = this.globalAlignment(adaptedEmbedding, targetEmbedding);
    
    // Level 2: Local refinement
    adaptedEmbedding = this.localRefinement(adaptedEmbedding, targetEmbedding);
    
    return adaptedEmbedding;
  }

  /**
   * Multi-step adaptation
   */
  private multiStepAdaptation(sourceEmbedding: number[], targetEmbedding: number[]): number[] {
    // Iterative adaptation process
    let adaptedEmbedding = [...sourceEmbedding];
    const steps = 3;
    
    for (let step = 0; step < steps; step++) {
      const stepAlpha = (step + 1) / steps;
      adaptedEmbedding = adaptedEmbedding.map((val, i) => 
        (1 - stepAlpha) * val + stepAlpha * targetEmbedding[i]
      );
    }
    
    return adaptedEmbedding;
  }

  /**
   * Global alignment
   */
  private globalAlignment(embedding: number[], targetEmbedding: number[]): number[] {
    // Align global structure
    const sourceMean = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
    const targetMean = targetEmbedding.reduce((sum, val) => sum + val, 0) / targetEmbedding.length;
    const offset = targetMean - sourceMean;
    
    return embedding.map(val => val + offset);
  }

  /**
   * Local refinement
   */
  private localRefinement(embedding: number[], targetEmbedding: number[]): number[] {
    // Fine-tune local features
    const refinedEmbedding = [...embedding];
    
    for (let i = 0; i < refinedEmbedding.length; i++) {
      const diff = targetEmbedding[i] - refinedEmbedding[i];
      refinedEmbedding[i] += diff * 0.1; // Small adjustment
    }
    
    return refinedEmbedding;
  }

  /**
   * Calculate transfer metrics
   */
  private calculateTransferMetrics(
    sourceDomain: Domain,
    targetDomain: Domain,
    adaptedConcepts: string[],
    failedConcepts: string[],
    transferTime: number
  ): AdaptationResult['transferMetrics'] {
    const totalConcepts = sourceDomain.concepts.length;
    const successCount = adaptedConcepts.length;
    const failureCount = failedConcepts.length;
    
    const similarity = this.calculateDomainSimilarity(sourceDomain, targetDomain);
    const coverage = successCount / totalConcepts;
    const accuracy = successCount / (successCount + failureCount);
    const efficiency = successCount / transferTime; // concepts per millisecond
    
    return {
      similarity,
      coverage,
      accuracy,
      efficiency
    };
  }

  /**
   * Calculate domain similarity
   */
  private calculateDomainSimilarity(domain1: Domain, domain2: Domain): number {
    const cacheKey = `${domain1.id}-${domain2.id}`;
    if (this.similarityCache.has(cacheKey)) {
      return this.similarityCache.get(cacheKey)!.get('overall') || 0;
    }
    
    let totalSimilarity = 0;
    let comparisonCount = 0;
    
    for (const concept1 of domain1.concepts) {
      const embedding1 = domain1.embeddings.get(concept1);
      if (!embedding1) continue;
      
      for (const concept2 of domain2.concepts) {
        const embedding2 = domain2.embeddings.get(concept2);
        if (!embedding2) continue;
        
        const similarity = this.calculateEmbeddingSimilarity(embedding1, embedding2);
        totalSimilarity += similarity;
        comparisonCount++;
      }
    }
    
    const overallSimilarity = comparisonCount > 0 ? totalSimilarity / comparisonCount : 0;
    
    // Cache the result
    if (!this.similarityCache.has(cacheKey)) {
      this.similarityCache.set(cacheKey, new Map());
    }
    this.similarityCache.get(cacheKey)!.set('overall', overallSimilarity);
    
    return overallSimilarity;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    mapping: DomainMapping,
    metrics: AdaptationResult['transferMetrics']
  ): string[] {
    const recommendations: string[] = [];
    
    if (metrics.similarity < 0.3) {
      recommendations.push('Consider using a different source domain with higher similarity');
    }
    
    if (metrics.coverage < 0.5) {
      recommendations.push('Increase the number of concept mappings for better coverage');
    }
    
    if (metrics.accuracy < 0.7) {
      recommendations.push('Improve embedding quality in the target domain');
    }
    
    if (metrics.efficiency < 0.1) {
      recommendations.push('Consider using a more efficient adaptation strategy');
    }
    
    if (mapping.adaptationStrategy === 'multi_step' && metrics.similarity > 0.6) {
      recommendations.push('Consider using direct or indirect adaptation for better efficiency');
    }
    
    return recommendations;
  }

  /**
   * Evaluate transfer performance
   */
  evaluateTransfer(sourceDomainId: string, targetDomainId: string): TransferMetrics {
    const sourceDomain = this.domains.get(sourceDomainId);
    const targetDomain = this.domains.get(targetDomainId);
    
    if (!sourceDomain || !targetDomain) {
      throw new Error('Source or target domain not found');
    }
    
    const similarity = this.calculateDomainSimilarity(sourceDomain, targetDomain);
    const coverage = this.calculateCoverage(sourceDomain, targetDomain);
    const accuracy = this.calculateAccuracy(sourceDomain, targetDomain);
    const efficiency = this.calculateEfficiency(sourceDomain, targetDomain);
    
    return {
      sourceDomain: sourceDomainId,
      targetDomain: targetDomainId,
      similarity,
      coverage,
      accuracy,
      efficiency,
      transferTime: 0, // Would be calculated during actual transfer
      memoryUsage: 0, // Would be measured during actual transfer
      successRate: (accuracy + coverage) / 2
    };
  }

  /**
   * Calculate coverage
   */
  private calculateCoverage(sourceDomain: Domain, targetDomain: Domain): number {
    const mappingKey = `${sourceDomain.id}-${targetDomain.id}`;
    const mapping = this.mappings.get(mappingKey);
    
    if (!mapping) return 0;
    
    return mapping.conceptMappings.length / sourceDomain.concepts.length;
  }

  /**
   * Calculate accuracy
   */
  private calculateAccuracy(sourceDomain: Domain, targetDomain: Domain): number {
    const mappingKey = `${sourceDomain.id}-${targetDomain.id}`;
    const mapping = this.mappings.get(mappingKey);
    
    if (!mapping) return 0;
    
    const totalSimilarity = mapping.conceptMappings.reduce((sum, mapping) => sum + mapping.similarity, 0);
    return totalSimilarity / mapping.conceptMappings.length;
  }

  /**
   * Calculate efficiency
   */
  private calculateEfficiency(sourceDomain: Domain, targetDomain: Domain): number {
    // Simple efficiency metric - in reality, you'd measure actual performance
    const similarity = this.calculateDomainSimilarity(sourceDomain, targetDomain);
    const conceptCount = Math.min(sourceDomain.concepts.length, targetDomain.concepts.length);
    
    return similarity * Math.log(conceptCount + 1);
  }

  /**
   * Get adaptation history
   */
  getAdaptationHistory(): AdaptationResult[] {
    return [...this.adaptationHistory];
  }

  /**
   * Get domain mappings
   */
  getDomainMappings(): DomainMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.similarityCache.clear();
    console.warn('🧹 Domain adaptation cache cleared');
  }
}
