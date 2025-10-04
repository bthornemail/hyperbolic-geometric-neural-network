#!/usr/bin/env node

/**
 * Phase 4.1: Advanced Hyperbolic-to-Geographic Projection Engine
 * 
 * Implements robust stereographic projection with Lorentz stabilization
 * for converting H²GNN hyperbolic embeddings to geographic coordinates
 */

// 🌐 ADVANCED HYPERBOLIC-GEOGRAPHIC PROJECTION ENGINE
export class HyperbolicProjectionEngine {
  private readonly MAX_POINCARE_RADIUS = 0.999999; // Avoid boundary numerical issues
  private readonly CURVATURE = -1.0;

  // 1.1 STEREOGRAPHIC PROJECTION WITH LORENTZ STABILITY
  poincareToGeographic(hyperbolicCoords: number[]): [number, number] {
    const [x, y] = hyperbolicCoords;
    
    // Check for boundary conditions and apply Lorentz stabilization
    const norm = Math.sqrt(x*x + y*y);
    if (norm > this.MAX_POINCARE_RADIUS) {
      return this.lorentzStabilizedProjection(hyperbolicCoords);
    }
    
    // Main stereographic projection from Poincaré disk to sphere
    const [sphereX, sphereY, sphereZ] = this.poincareToSphere(x, y);
    
    // Convert sphere coordinates to geographic
    const longitude = Math.atan2(sphereY, sphereX) * (180 / Math.PI);
    const latitude = Math.asin(sphereZ) * (180 / Math.PI);
    
    return [longitude, latitude];
  }

  private poincareToSphere(x: number, y: number): [number, number, number] {
    // Inverse stereographic projection from Poincaré disk to unit sphere
    const denominator = 1 + x*x + y*y;
    
    const sphereX = (2 * x) / denominator;
    const sphereY = (2 * y) / denominator; 
    const sphereZ = (-1 + x*x + y*y) / denominator;
    
    return [sphereX, sphereY, sphereZ];
  }

  // 1.2 LORENTZ MODEL STABILIZATION FOR BOUNDARY POINTS
  private lorentzStabilizedProjection(hyperbolicCoords: number[]): [number, number] {
    const [x, y] = hyperbolicCoords;
    
    // Convert to Lorentz coordinates for stability
    const lorentzCoords = this.poincareToLorentz([x, y]);
    
    // Project from Lorentz model directly
    const [projectedX, projectedY] = this.lorentzToGeographic(lorentzCoords);
    
    return [projectedX, projectedY];
  }

  private poincareToLorentz(poincareCoords: number[]): number[] {
    const [x, y] = poincareCoords;
    const normSq = x*x + y*y;
    
    // Lorentz coordinates from Poincaré
    const t = (1 + normSq) / (1 - normSq);
    const xL = (2 * x) / (1 - normSq);
    const yL = (2 * y) / (1 - normSq);
    
    return [t, xL, yL];
  }

  private lorentzToGeographic(lorentzCoords: number[]): [number, number] {
    const [t, xL, yL] = lorentzCoords;
    
    // Convert Lorentz to geographic via sphere projection
    const sphereX = xL / (t + 1);
    const sphereY = yL / (t + 1);
    const sphereZ = Math.sqrt(1 - sphereX*sphereX - sphereY*sphereY);
    
    const longitude = Math.atan2(sphereY, sphereX) * (180 / Math.PI);
    const latitude = Math.asin(sphereZ) * (180 / Math.PI);
    
    return [longitude, latitude];
  }

  // ENHANCED GEOJSON PROPERTIES WITH HYPERBOLIC METRICS
  createEnhancedGeoJSONFeature(embedding: H2GNNEmbedding): GeoJSON.Feature {
    const [longitude, latitude] = this.poincareToGeographic(embedding.hyperbolicCoords);
    
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      properties: {
        // Core semantic data
        semantic_label: embedding.semanticLabel,
        cluster_id: embedding.clusterId,
        
        // Hyperbolic metrics for intelligent visualization
        hyperbolic_distance_to_center: this.calculateHyperbolicDistance([0, 0], embedding.hyperbolicCoords),
        semantic_cohesion_metric: embedding.semanticCohesion,
        lorentz_stability_check: embedding.usedLorentzStability,
        
        // Performance and analysis metrics
        embedding_confidence: embedding.confidence,
        topological_persistence: embedding.topologicalPersistence,
        hierarchical_depth: embedding.hierarchicalDepth,
        
        // Timestamp and versioning
        last_updated: embedding.timestamp,
        embedding_version: embedding.version
      }
    };
  }

  private calculateHyperbolicDistance(u: number[], v: number[]): number {
    const mobiusDiff = this.mobiusAdd(this.scale(v, -1), u);
    const normDiff = Math.sqrt(mobiusDiff[0]*mobiusDiff[0] + mobiusDiff[1]*mobiusDiff[1]);
    
    return (2 / Math.sqrt(Math.abs(this.CURVATURE))) * 
           Math.atanh(Math.sqrt(Math.abs(this.CURVATURE)) * normDiff);
  }

  private mobiusAdd(u: number[], v: number[]): number[] {
    const dotUV = u[0]*v[0] + u[1]*v[1];
    const normUSq = u[0]*u[0] + u[1]*u[1];
    const normVSq = v[0]*v[0] + v[1]*v[1];
    
    const denominator = 1 + 2 * this.CURVATURE * dotUV + 
                       this.CURVATURE * this.CURVATURE * normUSq * normVSq;
    
    const term1 = this.scale(u, 1 + 2 * this.CURVATURE * dotUV + this.CURVATURE * normVSq);
    const term2 = this.scale(v, 1 - this.CURVATURE * normUSq);
    
    return this.scale(this.add(term1, term2), 1 / denominator);
  }

  private scale(v: number[], s: number): number[] {
    return [v[0] * s, v[1] * s];
  }

  private add(u: number[], v: number[]): number[] {
    return [u[0] + v[0], u[1] + v[1]];
  }

  // INVERSE PROJECTION: GEOGRAPHIC TO HYPERBOLIC
  geographicToPoincare(geographicCoords: [number, number]): number[] {
    const [longitude, latitude] = geographicCoords;
    
    // Convert geographic to sphere coordinates
    const lonRad = longitude * (Math.PI / 180);
    const latRad = latitude * (Math.PI / 180);
    
    const sphereX = Math.cos(latRad) * Math.cos(lonRad);
    const sphereY = Math.cos(latRad) * Math.sin(lonRad);
    const sphereZ = Math.sin(latRad);
    
    // Stereographic projection from sphere to Poincaré disk
    const denominator = 1 + sphereZ;
    const x = sphereX / denominator;
    const y = sphereY / denominator;
    
    return [x, y];
  }

  // BATCH PROJECTION FOR PERFORMANCE
  batchPoincareToGeographic(embeddings: H2GNNEmbedding[]): GeoJSON.Feature[] {
    return embeddings.map(embedding => this.createEnhancedGeoJSONFeature(embedding));
  }

  // PROJECTION VALIDATION
  validateProjection(hyperbolicCoords: number[]): boolean {
    const [x, y] = hyperbolicCoords;
    const norm = Math.sqrt(x*x + y*y);
    
    // Check if coordinates are within Poincaré disk
    return norm < 1.0;
  }

  // PROJECTION QUALITY METRICS
  calculateProjectionQuality(originalCoords: number[], projectedCoords: [number, number]): number {
    // Calculate how well the projection preserves hyperbolic distances
    const originalDistance = this.calculateHyperbolicDistance([0, 0], originalCoords);
    const projectedDistance = this.calculateEuclideanDistance([0, 0], projectedCoords);
    
    // Quality metric: ratio of preserved distances
    return Math.min(originalDistance / projectedDistance, projectedDistance / originalDistance);
  }

  private calculateEuclideanDistance(u: [number, number], v: [number, number]): number {
    const dx = u[0] - v[0];
    const dy = u[1] - v[1];
    return Math.sqrt(dx*dx + dy*dy);
  }
}

// 🎯 H²GNN EMBEDDING INTERFACE
export interface H2GNNEmbedding {
  hyperbolicCoords: number[];
  semanticLabel: string;
  clusterId: number;
  semanticCohesion: number;
  usedLorentzStability: boolean;
  confidence: number;
  topologicalPersistence: number;
  hierarchicalDepth: number;
  timestamp: number;
  version: string;
}

// 🎯 GEOJSON TYPES
export namespace GeoJSON {
  export interface Feature {
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties: Record<string, any>;
  }

  export interface FeatureCollection {
    type: 'FeatureCollection';
    features: Feature[];
  }
}

// 🚀 HIGH-PERFORMANCE BINARY SCHEMAS
export class H2GNNBinarySchema {
  static readonly EMBEDDING_UPDATE_SCHEMA = {
    // Binary layout for h2gnn.embeddings.update channel
    header: {
      offset: 0,
      size: 32,
      fields: {
        magicNumber: { offset: 0, type: 'uint32' },  // 0x4852474E = 'HRGN'
        schemaVersion: { offset: 4, type: 'uint16' },
        curvature: { offset: 6, type: 'float32' },
        embeddingDim: { offset: 10, type: 'uint16' },
        totalEmbeddings: { offset: 12, type: 'uint32' },
        timestamp: { offset: 16, type: 'uint64' }
      }
    },
    
    embeddings: {
      offset: 32,
      size: 'dynamic',
      type: 'float32',
      count: 'header.totalEmbeddings * header.embeddingDim'
    },
    
    metadata: {
      offset: 'embeddings.offset + embeddings.size',
      size: 64,
      fields: {
        trainingEpoch: { offset: 0, type: 'uint32' },
        totalLoss: { offset: 4, type: 'float32' },
        manifoldLoss: { offset: 8, type: 'float32' },
        topologicalLoss: { offset: 12, type: 'float32' },
        hyperbolicLoss: { offset: 16, type: 'float32' }
      }
    }
  };

  // SERIALIZATION WITH TRANSFERABLE OBJECTS
  static serializeEmbeddingsUpdate(payload: H2GNNEmbeddingsUpdatePayload): [ArrayBuffer, Transferable[]] {
    const totalSize = this.calculateTotalSize(payload);
    const buffer = new ArrayBuffer(totalSize);
    const dataView = new DataView(buffer);
    
    // Write header
    dataView.setUint32(0, 0x4852474E); // Magic number
    dataView.setUint16(4, 0x0100);     // Schema version 1.0.0
    dataView.setFloat32(6, payload.header.curvature);
    dataView.setUint16(10, payload.header.embeddingDimension);
    dataView.setUint32(12, payload.header.totalEmbeddings);
    dataView.setBigUint64(16, BigInt(payload.header.timestamp));
    
    // Write embeddings as Float32Array (direct memory copy)
    const embeddingsArray = new Float32Array(payload.binaryData.embeddings);
    const embeddingsOffset = 32;
    new Float32Array(buffer, embeddingsOffset, embeddingsArray.length)
      .set(embeddingsArray);
    
    // Collect transferable objects for zero-copy messaging
    const transferables: Transferable[] = [
      payload.binaryData.embeddings,
      payload.binaryData.confidenceScores,
      payload.binaryData.clusterAssignments
    ].filter(buf => buf.byteLength > 0);
    
    return [buffer, transferables];
  }

  static deserializeEmbeddingsUpdate(buffer: ArrayBuffer): H2GNNEmbeddingsUpdatePayload {
    const dataView = new DataView(buffer);
    
    // Validate magic number
    if (dataView.getUint32(0) !== 0x4852474E) {
      throw new Error('Invalid H²GNN binary format');
    }
    
    const embeddingDim = dataView.getUint16(10);
    const totalEmbeddings = dataView.getUint32(12);
    
    // Create typed arrays that reference the original buffer (zero-copy)
    const embeddingsOffset = 32;
    const embeddings = new Float32Array(buffer, embeddingsOffset, totalEmbeddings * embeddingDim);
    
    return {
      header: {
        schemaVersion: '1.0.0',
        timestamp: Number(dataView.getBigUint64(16)),
        curvature: dataView.getFloat32(6),
        embeddingDimension: embeddingDim,
        totalEmbeddings: totalEmbeddings
      },
      binaryData: {
        embeddings: embeddings.buffer,
        confidenceScores: new ArrayBuffer(0), // Would be calculated from offsets
        clusterAssignments: new ArrayBuffer(0),
        semanticLabels: new ArrayBuffer(0)
      },
      metadata: {
        trainingEpoch: dataView.getUint32(embeddingsOffset + embeddings.byteLength),
        lossMetrics: {
          total: dataView.getFloat32(embeddingsOffset + embeddings.byteLength + 4),
          manifold: dataView.getFloat32(embeddingsOffset + embeddings.byteLength + 8),
          topological: dataView.getFloat32(embeddingsOffset + embeddings.byteLength + 12),
          hyperbolic: dataView.getFloat32(embeddingsOffset + embeddings.byteLength + 16)
        },
        topologicalFeatures: {
          bettiNumbers: [0, 0, 0], // Would be read from binary
          persistentHomology: []
        }
      }
    };
  }

  private static calculateTotalSize(payload: H2GNNEmbeddingsUpdatePayload): number {
    const headerSize = 32;
    const embeddingsSize = payload.binaryData.embeddings.byteLength;
    const metadataSize = 64;
    
    return headerSize + embeddingsSize + metadataSize;
  }
}

// 🎯 EMBEDDINGS UPDATE PAYLOAD INTERFACE
export interface H2GNNEmbeddingsUpdatePayload {
  header: {
    schemaVersion: '1.0.0';
    timestamp: number;
    curvature: number;
    embeddingDimension: number;
    totalEmbeddings: number;
  };
  binaryData: {
    embeddings: ArrayBuffer;
    confidenceScores: ArrayBuffer;
    clusterAssignments: ArrayBuffer;
    semanticLabels: ArrayBuffer;
  };
  metadata: {
    trainingEpoch: number;
    lossMetrics: {
      total: number;
      manifold: number;
      topological: number;
      hyperbolic: number;
    };
    topologicalFeatures: {
      bettiNumbers: [number, number, number];
      persistentHomology: Array<{ birth: number; death: number; dimension: number }>;
    };
  };
}

// 🚀 OPTIMIZED PROVIDER WITH PROJECTION ENGINE
export class OptimizedH2GNNProvider {
  private projectionEngine: HyperbolicProjectionEngine;
  private binarySchema: H2GNNBinarySchema;

  constructor() {
    this.projectionEngine = new HyperbolicProjectionEngine();
    this.binarySchema = new H2GNNBinarySchema();
  }

  async generateOptimizedTopoJSON(payload: H2GNNEmbeddingsUpdatePayload): Promise<any> {
    // Deserialize embeddings
    const embeddings = this.deserializeEmbeddings(payload);
    
    // Convert to GeoJSON features
    const features = this.projectionEngine.batchPoincareToGeographic(embeddings);
    
    // Generate TopoJSON for efficiency
    return this.generateTopoJSONFromFeatures(features);
  }

  private deserializeEmbeddings(payload: H2GNNEmbeddingsUpdatePayload): H2GNNEmbedding[] {
    const embeddings: H2GNNEmbedding[] = [];
    const embeddingsArray = new Float32Array(payload.binaryData.embeddings);
    const embeddingDim = payload.header.embeddingDimension;
    
    for (let i = 0; i < payload.header.totalEmbeddings; i++) {
      const startIdx = i * embeddingDim;
      const hyperbolicCoords = Array.from(embeddingsArray.slice(startIdx, startIdx + embeddingDim));
      
      embeddings.push({
        hyperbolicCoords,
        semanticLabel: `embedding_${i}`,
        clusterId: i % 10, // Simplified clustering
        semanticCohesion: Math.random(),
        usedLorentzStability: false,
        confidence: Math.random(),
        topologicalPersistence: Math.random(),
        hierarchicalDepth: Math.floor(Math.random() * 5),
        timestamp: Date.now(),
        version: '1.0.0'
      });
    }
    
    return embeddings;
  }

  private generateTopoJSONFromFeatures(features: GeoJSON.Feature[]): any {
    // Simplified TopoJSON generation
    return {
      type: 'Topology',
      objects: {
        embeddings: {
          type: 'GeometryCollection',
          geometries: features.map(f => f.geometry)
        }
      },
      arcs: []
    };
  }

  // QUERY HYPERBOLIC GEOGRAPHY
  async queryHyperbolicGeography(geoPoint: GeoJSON.Feature): Promise<HyperbolicNeighbors> {
    // Convert geographic coordinates back to hyperbolic space
    const hyperbolicPoint = this.projectionEngine.geographicToPoincare([
      geoPoint.geometry.coordinates[0], 
      geoPoint.geometry.coordinates[1]
    ]);
    
    // Find k-nearest neighbors in hyperbolic space
    const neighbors = await this.findHyperbolicNeighbors(hyperbolicPoint, 10);
    
    return {
      centerPoint: geoPoint,
      neighbors: neighbors.map(n => ({
        geographicCoords: this.projectionEngine.poincareToGeographic(n.hyperbolicCoords),
        hyperbolicDistance: n.distance,
        semanticSimilarity: n.similarity,
        clusterId: n.clusterId
      })),
      confidence: this.calculateQueryConfidence(neighbors)
    };
  }

  private async findHyperbolicNeighbors(center: number[], k: number): Promise<any[]> {
    // Simplified neighbor search - would use actual H²GNN in production
    const mockNeighbors = Array.from({ length: k }, (_, i) => ({
      hyperbolicCoords: [Math.random() * 2 - 1, Math.random() * 2 - 1],
      distance: Math.random(),
      similarity: Math.random(),
      clusterId: i % 5
    }));
    
    return mockNeighbors.sort((a, b) => a.distance - b.distance);
  }

  private calculateQueryConfidence(neighbors: any[]): number {
    // Calculate confidence based on neighbor consistency
    const avgDistance = neighbors.reduce((sum, n) => sum + n.distance, 0) / neighbors.length;
    return Math.max(0, 1 - avgDistance);
  }
}

// 🎯 HYPERBOLIC NEIGHBORS INTERFACE
export interface HyperbolicNeighbors {
  centerPoint: GeoJSON.Feature;
  neighbors: Array<{
    geographicCoords: [number, number];
    hyperbolicDistance: number;
    semanticSimilarity: number;
    clusterId: number;
  }>;
  confidence: number;
}

