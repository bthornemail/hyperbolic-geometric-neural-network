#!/usr/bin/env tsx

/**
 * Concept Navigator
 * 
 * This module provides interactive concept navigation and exploration:
 * - Concept search and filtering
 * - Semantic similarity navigation
 * - Concept clustering and grouping
 * - Interactive concept exploration
 * - Concept relationship visualization
 */

import { HyperbolicEmbedding, HyperbolicPoint } from './3d-hyperbolic-renderer.js';

export interface ConceptCluster {
  id: string;
  name: string;
  concepts: string[];
  center: HyperbolicPoint;
  radius: number;
  color: [number, number, number, number];
  metadata: Record<string, any>;
}

export interface ConceptRelationship {
  source: string;
  target: string;
  type: 'similarity' | 'hierarchy' | 'causality' | 'temporal' | 'spatial';
  strength: number;
  metadata: Record<string, any>;
}

export interface NavigationState {
  currentConcept: string | null;
  selectedConcepts: string[];
  filteredConcepts: string[];
  searchQuery: string;
  viewMode: 'overview' | 'detail' | 'cluster' | 'relationship';
  zoomLevel: number;
  cameraPosition: HyperbolicPoint;
}

export interface SearchResult {
  concept: string;
  score: number;
  type: 'exact' | 'fuzzy' | 'semantic' | 'related';
  metadata: Record<string, any>;
}

export class ConceptNavigator {
  private embeddings: Map<string, HyperbolicEmbedding> = new Map();
  private clusters: Map<string, ConceptCluster> = new Map();
  private relationships: Map<string, ConceptRelationship> = new Map();
  private navigationState: NavigationState;
  private searchIndex: Map<string, string[]> = new Map();
  private similarityCache: Map<string, Map<string, number>> = new Map();

  constructor() {
    this.navigationState = {
      currentConcept: null,
      selectedConcepts: [],
      filteredConcepts: [],
      searchQuery: '',
      viewMode: 'overview',
      zoomLevel: 1.0,
      cameraPosition: { x: 0, y: 0, z: 0, w: 1 }
    };
  }

  /**
   * Add embeddings to the navigator
   */
  addEmbeddings(embeddings: HyperbolicEmbedding[]): void {
    for (const embedding of embeddings) {
      this.embeddings.set(embedding.id, embedding);
      this.indexConcept(embedding);
    }
    
    this.updateClusters();
    this.updateRelationships();
  }

  /**
   * Index a concept for search
   */
  private indexConcept(embedding: HyperbolicEmbedding): void {
    const concept = embedding.concept.toLowerCase();
    const words = concept.split(/\s+/);
    
    for (const word of words) {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, []);
      }
      this.searchIndex.get(word)!.push(embedding.id);
    }
  }

  /**
   * Search for concepts
   */
  searchConcepts(query: string, maxResults: number = 10): SearchResult[] {
    const results: SearchResult[] = [];
    const normalizedQuery = query.toLowerCase();
    
    // Exact matches
    for (const [id, embedding] of this.embeddings) {
      if (embedding.concept.toLowerCase().includes(normalizedQuery)) {
        results.push({
          concept: embedding.concept,
          score: 1.0,
          type: 'exact',
          metadata: embedding.metadata
        });
      }
    }
    
    // Fuzzy matches
    for (const [id, embedding] of this.embeddings) {
      const similarity = this.calculateStringSimilarity(normalizedQuery, embedding.concept.toLowerCase());
      if (similarity > 0.3) {
        results.push({
          concept: embedding.concept,
          score: similarity,
          type: 'fuzzy',
          metadata: embedding.metadata
        });
      }
    }
    
    // Semantic matches (if available)
    if (this.similarityCache.has(normalizedQuery)) {
      const semanticResults = this.similarityCache.get(normalizedQuery)!;
      for (const [id, score] of semanticResults) {
        const embedding = this.embeddings.get(id);
        if (embedding) {
          results.push({
            concept: embedding.concept,
            score: score,
            type: 'semantic',
            metadata: embedding.metadata
          });
        }
      }
    }
    
    // Sort by score and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  /**
   * Calculate string similarity
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Navigate to a concept
   */
  navigateToConcept(conceptId: string): void {
    const embedding = this.embeddings.get(conceptId);
    if (embedding) {
      this.navigationState.currentConcept = conceptId;
      this.navigationState.cameraPosition = embedding.position;
      this.updateViewMode('detail');
    }
  }

  /**
   * Navigate to similar concepts
   */
  navigateToSimilarConcepts(conceptId: string, maxResults: number = 5): string[] {
    const embedding = this.embeddings.get(conceptId);
    if (!embedding) return [];
    
    const similarities: Array<{ id: string; similarity: number }> = [];
    
    for (const [id, otherEmbedding] of this.embeddings) {
      if (id !== conceptId) {
        const similarity = this.calculateEmbeddingSimilarity(embedding.embedding, otherEmbedding.embedding);
        similarities.push({ id, similarity });
      }
    }
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults)
      .map(item => item.id);
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
   * Update clusters based on current embeddings
   */
  private updateClusters(): void {
    this.clusters.clear();
    
    // Simple clustering algorithm - in reality, you'd use more sophisticated methods
    const clusterSize = 5;
    const embeddings = Array.from(this.embeddings.values());
    
    for (let i = 0; i < embeddings.length; i += clusterSize) {
      const clusterEmbeddings = embeddings.slice(i, i + clusterSize);
      const clusterId = `cluster_${Math.floor(i / clusterSize)}`;
      
      const cluster: ConceptCluster = {
        id: clusterId,
        name: `Cluster ${Math.floor(i / clusterSize) + 1}`,
        concepts: clusterEmbeddings.map(e => e.id),
        center: this.calculateClusterCenter(clusterEmbeddings),
        radius: this.calculateClusterRadius(clusterEmbeddings),
        color: this.generateClusterColor(Math.floor(i / clusterSize)),
        metadata: {
          size: clusterEmbeddings.length,
          domain: this.inferDomain(clusterEmbeddings)
        }
      };
      
      this.clusters.set(clusterId, cluster);
    }
  }

  /**
   * Calculate cluster center
   */
  private calculateClusterCenter(embeddings: HyperbolicEmbedding[]): HyperbolicPoint {
    if (embeddings.length === 0) return { x: 0, y: 0, z: 0, w: 1 };
    
    let x = 0, y = 0, z = 0, w = 0;
    
    for (const embedding of embeddings) {
      x += embedding.position.x;
      y += embedding.position.y;
      z += embedding.position.z;
      w += embedding.position.w;
    }
    
    return {
      x: x / embeddings.length,
      y: y / embeddings.length,
      z: z / embeddings.length,
      w: w / embeddings.length
    };
  }

  /**
   * Calculate cluster radius
   */
  private calculateClusterRadius(embeddings: HyperbolicEmbedding[]): number {
    if (embeddings.length === 0) return 0;
    
    const center = this.calculateClusterCenter(embeddings);
    let maxDistance = 0;
    
    for (const embedding of embeddings) {
      const distance = this.calculateDistance(center, embedding.position);
      maxDistance = Math.max(maxDistance, distance);
    }
    
    return maxDistance;
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(point1: HyperbolicPoint, point2: HyperbolicPoint): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Generate cluster color
   */
  private generateClusterColor(index: number): [number, number, number, number] {
    const hue = (index * 137.5) % 360; // Golden angle
    const saturation = 0.7;
    const lightness = 0.6;
    
    // Convert HSL to RGB
    const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = lightness - c / 2;
    
    let r, g, b;
    if (hue < 60) { r = c; g = x; b = 0; }
    else if (hue < 120) { r = x; g = c; b = 0; }
    else if (hue < 180) { r = 0; g = c; b = x; }
    else if (hue < 240) { r = 0; g = x; b = c; }
    else if (hue < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    return [r + m, g + m, b + m, 0.8];
  }

  /**
   * Infer domain from embeddings
   */
  private inferDomain(embeddings: HyperbolicEmbedding[]): string {
    // Simple domain inference - in reality, you'd use more sophisticated methods
    const domains = ['technology', 'science', 'art', 'philosophy', 'mathematics'];
    return domains[Math.floor(Math.random() * domains.length)];
  }

  /**
   * Update relationships between concepts
   */
  private updateRelationships(): void {
    this.relationships.clear();
    
    const embeddings = Array.from(this.embeddings.values());
    
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const similarity = this.calculateEmbeddingSimilarity(
          embeddings[i].embedding,
          embeddings[j].embedding
        );
        
        if (similarity > 0.5) {
          const relationship: ConceptRelationship = {
            source: embeddings[i].id,
            target: embeddings[j].id,
            type: 'similarity',
            strength: similarity,
            metadata: {
              distance: this.calculateDistance(embeddings[i].position, embeddings[j].position)
            }
          };
          
          this.relationships.set(`${embeddings[i].id}-${embeddings[j].id}`, relationship);
        }
      }
    }
  }

  /**
   * Get concept relationships
   */
  getConceptRelationships(conceptId: string): ConceptRelationship[] {
    const relationships: ConceptRelationship[] = [];
    
    for (const relationship of this.relationships.values()) {
      if (relationship.source === conceptId || relationship.target === conceptId) {
        relationships.push(relationship);
      }
    }
    
    return relationships;
  }

  /**
   * Update view mode
   */
  updateViewMode(mode: NavigationState['viewMode']): void {
    this.navigationState.viewMode = mode;
    
    switch (mode) {
      case 'overview':
        this.navigationState.zoomLevel = 1.0;
        this.navigationState.cameraPosition = { x: 0, y: 0, z: 0, w: 1 };
        break;
      case 'detail':
        this.navigationState.zoomLevel = 2.0;
        break;
      case 'cluster':
        this.navigationState.zoomLevel = 1.5;
        break;
      case 'relationship':
        this.navigationState.zoomLevel = 1.2;
        break;
    }
  }

  /**
   * Filter concepts by criteria
   */
  filterConcepts(criteria: {
    domain?: string;
    minSimilarity?: number;
    maxDistance?: number;
    metadata?: Record<string, any>;
  }): string[] {
    const filtered: string[] = [];
    
    for (const [id, embedding] of this.embeddings) {
      let matches = true;
      
      if (criteria.domain && embedding.metadata.domain !== criteria.domain) {
        matches = false;
      }
      
      if (criteria.minSimilarity && this.navigationState.currentConcept) {
        const currentEmbedding = this.embeddings.get(this.navigationState.currentConcept);
        if (currentEmbedding) {
          const similarity = this.calculateEmbeddingSimilarity(
            embedding.embedding,
            currentEmbedding.embedding
          );
          if (similarity < criteria.minSimilarity) {
            matches = false;
          }
        }
      }
      
      if (criteria.maxDistance && this.navigationState.currentConcept) {
        const currentEmbedding = this.embeddings.get(this.navigationState.currentConcept);
        if (currentEmbedding) {
          const distance = this.calculateDistance(
            embedding.position,
            currentEmbedding.position
          );
          if (distance > criteria.maxDistance) {
            matches = false;
          }
        }
      }
      
      if (criteria.metadata) {
        for (const [key, value] of Object.entries(criteria.metadata)) {
          if (embedding.metadata[key] !== value) {
            matches = false;
            break;
          }
        }
      }
      
      if (matches) {
        filtered.push(id);
      }
    }
    
    this.navigationState.filteredConcepts = filtered;
    return filtered;
  }

  /**
   * Get current navigation state
   */
  getNavigationState(): NavigationState {
    return { ...this.navigationState };
  }

  /**
   * Get all clusters
   */
  getClusters(): ConceptCluster[] {
    return Array.from(this.clusters.values());
  }

  /**
   * Get all relationships
   */
  getRelationships(): ConceptRelationship[] {
    return Array.from(this.relationships.values());
  }

  /**
   * Get concept by ID
   */
  getConcept(conceptId: string): HyperbolicEmbedding | null {
    return this.embeddings.get(conceptId) || null;
  }

  /**
   * Get all concepts
   */
  getAllConcepts(): HyperbolicEmbedding[] {
    return Array.from(this.embeddings.values());
  }
}
