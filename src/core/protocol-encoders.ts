#!/usr/bin/env node

/**
 * Protocol Data Encoders
 * 
 * Implements standardized data encoding/decoding for:
 * - Binary: High-performance hyperbolic embeddings
 * - JSON: Human-readable metadata
 * - GeoJSON: Geographic visualization data
 * - TopoJSON: Topological relationships
 */

import { createHash } from 'crypto';
import type { HyperbolicEmbedding, TrainingProgress, VisualizationData, H2GNNAddress } from './native-protocol.js';

// 🔢 Binary Encoder for Hyperbolic Embeddings
export class BinaryEncoder {
  private static readonly MAGIC_NUMBER = 0x4852474E; // "HRGN"
  private static readonly VERSION = 0x0100; // 1.0.0

  /**
   * Encode hyperbolic embeddings to binary format
   */
  static encodeEmbeddings(embeddings: HyperbolicEmbedding[]): ArrayBuffer {
    if (embeddings.length === 0) {
      throw new Error('Cannot encode empty embeddings array');
    }

    const embeddingDim = embeddings[0].embedding.length;
    const totalEmbeddings = embeddings.length;
    
    // Calculate total size
    const headerSize = 32; // Fixed header size
    const embeddingSize = totalEmbeddings * embeddingDim * 4; // 4 bytes per float
    const coordinateSize = totalEmbeddings * 2 * 4; // 2 coordinates per embedding
    const metadataSize = totalEmbeddings * (4 + 4 + 4 + 4); // clusterId, confidence, timestamp, labelLength
    const labelSize = embeddings.reduce((sum, emb) => sum + emb.semanticLabel.length, 0);
    
    const totalSize = headerSize + embeddingSize + coordinateSize + metadataSize + labelSize;
    const buffer = new ArrayBuffer(totalSize);
    const dataView = new DataView(buffer);
    let offset = 0;

    // Write header
    dataView.setUint32(offset, this.MAGIC_NUMBER); offset += 4;
    dataView.setUint16(offset, this.VERSION); offset += 2;
    dataView.setFloat32(offset, embeddings[0].curvature); offset += 4;
    dataView.setUint16(offset, embeddingDim); offset += 2;
    dataView.setUint32(offset, totalEmbeddings); offset += 4;
    dataView.setBigUint64(offset, BigInt(Date.now())); offset += 8;
    dataView.setUint32(offset, totalSize); offset += 4;
    dataView.setUint32(offset, 0); offset += 4; // Reserved

    // Write embeddings
    for (const embedding of embeddings) {
      for (const value of embedding.embedding) {
        dataView.setFloat32(offset, value);
        offset += 4;
      }
    }

    // Write coordinates
    for (const embedding of embeddings) {
      dataView.setFloat32(offset, embedding.coordinates[0]);
      offset += 4;
      dataView.setFloat32(offset, embedding.coordinates[1]);
      offset += 4;
    }

    // Write metadata
    for (const embedding of embeddings) {
      dataView.setUint32(offset, embedding.clusterId);
      offset += 4;
      dataView.setFloat32(offset, embedding.confidence);
      offset += 4;
      dataView.setUint32(offset, embedding.timestamp);
      offset += 4;
      dataView.setUint32(offset, embedding.semanticLabel.length);
      offset += 4;
    }

    // Write labels
    for (const embedding of embeddings) {
      const labelBytes = new TextEncoder().encode(embedding.semanticLabel);
      new Uint8Array(buffer, offset, labelBytes.length).set(labelBytes);
      offset += labelBytes.length;
    }

    return buffer;
  }

  /**
   * Decode binary data to hyperbolic embeddings
   */
  static decodeEmbeddings(buffer: ArrayBuffer): HyperbolicEmbedding[] {
    const dataView = new DataView(buffer);
    let offset = 0;

    // Read header
    const magicNumber = dataView.getUint32(offset); offset += 4;
    if (magicNumber !== this.MAGIC_NUMBER) {
      throw new Error('Invalid magic number in binary data');
    }

    const version = dataView.getUint16(offset); offset += 2;
    const curvature = dataView.getFloat32(offset); offset += 4;
    const embeddingDim = dataView.getUint16(offset); offset += 2;
    const totalEmbeddings = dataView.getUint32(offset); offset += 4;
    const timestamp = Number(dataView.getBigUint64(offset)); offset += 8;
    const totalSize = dataView.getUint32(offset); offset += 4;
    const reserved = dataView.getUint32(offset); offset += 4;

    const embeddings: HyperbolicEmbedding[] = [];

    // Read embeddings
    const embeddingData: number[][] = [];
    for (let i = 0; i < totalEmbeddings; i++) {
      const embedding: number[] = [];
      for (let j = 0; j < embeddingDim; j++) {
        embedding.push(dataView.getFloat32(offset));
        offset += 4;
      }
      embeddingData.push(embedding);
    }

    // Read coordinates
    const coordinates: number[][] = [];
    for (let i = 0; i < totalEmbeddings; i++) {
      const x = dataView.getFloat32(offset); offset += 4;
      const y = dataView.getFloat32(offset); offset += 4;
      coordinates.push([x, y]);
    }

    // Read metadata
    const metadata: Array<{ clusterId: number; confidence: number; timestamp: number; labelLength: number }> = [];
    for (let i = 0; i < totalEmbeddings; i++) {
      const clusterId = dataView.getUint32(offset); offset += 4;
      const confidence = dataView.getFloat32(offset); offset += 4;
      const embTimestamp = dataView.getUint32(offset); offset += 4;
      const labelLength = dataView.getUint32(offset); offset += 4;
      metadata.push({ clusterId, confidence, timestamp: embTimestamp, labelLength });
    }

    // Read labels
    const labels: string[] = [];
    for (let i = 0; i < totalEmbeddings; i++) {
      const labelBytes = new Uint8Array(buffer, offset, metadata[i].labelLength);
      const label = new TextDecoder().decode(labelBytes);
      labels.push(label);
      offset += metadata[i].labelLength;
    }

    // Construct embeddings
    for (let i = 0; i < totalEmbeddings; i++) {
      embeddings.push({
        coordinates: coordinates[i],
        curvature,
        embedding: embeddingData[i],
        semanticLabel: labels[i],
        clusterId: metadata[i].clusterId,
        confidence: metadata[i].confidence,
        timestamp: metadata[i].timestamp
      });
    }

    return embeddings;
  }

  /**
   * Create transferable objects for zero-copy messaging
   */
  static createTransferable(data: ArrayBuffer): Transferable[] {
    return [data];
  }
}

// 📄 JSON Encoder for Metadata
export class JSONEncoder {
  /**
   * Encode H²GNN message to JSON
   */
  static encodeMessage(address: H2GNNAddress, payload: any): string {
    const message = {
      type: 'h2gnn-message',
      version: '1.0.0',
      timestamp: Date.now(),
      address: {
        path: address.path,
        component: address.component,
        hyperbolic: address.hyperbolic,
        network: address.network
      },
      payload
    };

    return JSON.stringify(message, null, 2);
  }

  /**
   * Decode JSON to H²GNN message
   */
  static decodeMessage(json: string): { address: H2GNNAddress; payload: any } {
    const message = JSON.parse(json);
    
    if (message.type !== 'h2gnn-message') {
      throw new Error('Invalid H²GNN message format');
    }

    return {
      address: message.address,
      payload: message.payload
    };
  }

  /**
   * Encode training progress to JSON
   */
  static encodeTrainingProgress(progress: TrainingProgress): string {
    return JSON.stringify({
      type: 'training-progress',
      version: '1.0.0',
      timestamp: Date.now(),
      data: progress
    }, null, 2);
  }

  /**
   * Decode JSON to training progress
   */
  static decodeTrainingProgress(json: string): TrainingProgress {
    const message = JSON.parse(json);
    
    if (message.type !== 'training-progress') {
      throw new Error('Invalid training progress format');
    }

    return message.data;
  }
}

// 🌍 GeoJSON Encoder for Geographic Data
export class GeoJSONEncoder {
  /**
   * Convert hyperbolic embedding to GeoJSON feature
   */
  static hyperbolicToGeographic(embedding: HyperbolicEmbedding): any {
    // Convert hyperbolic coordinates to geographic coordinates
    const [x, y] = embedding.coordinates;
    
    // Simple projection: Convert Poincaré disk to geographic coordinates
    const longitude = (x * 180); // Scale to -180 to 180
    const latitude = (y * 90);   // Scale to -90 to 90
    
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      properties: {
        semantic_label: embedding.semanticLabel,
        hyperbolic_distance: this.calculateHyperbolicDistance(embedding.coordinates),
        complexity_metric: this.calculateComplexity(embedding.embedding),
        cluster_id: embedding.clusterId,
        confidence: embedding.confidence,
        curvature: embedding.curvature,
        timestamp: embedding.timestamp
      }
    };
  }

  /**
   * Create GeoJSON from H²GNN embeddings
   */
  static createGeoJSON(embeddings: HyperbolicEmbedding[], filter?: string): any {
    const features = embeddings.map(embedding => 
      this.hyperbolicToGeographic(embedding)
    );

    // Apply filter if provided
    const filteredFeatures = filter 
      ? features.filter(f => f.properties.semantic_label.includes(filter))
      : features;

    return {
      type: 'FeatureCollection',
      features: filteredFeatures,
      properties: {
        totalFeatures: filteredFeatures.length,
        curvature: embeddings[0]?.curvature || -1.0,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Convert geographic coordinates to hyperbolic
   */
  static geographicToHyperbolic(longitude: number, latitude: number): number[] {
    // Convert geographic coordinates back to hyperbolic
    const x = longitude / 180; // Scale from -180 to 180 to -1 to 1
    const y = latitude / 90;    // Scale from -90 to 90 to -1 to 1
    
    // Ensure coordinates are within Poincaré disk
    const magnitude = Math.sqrt(x * x + y * y);
    if (magnitude >= 1) {
      return [x * 0.99, y * 0.99]; // Scale down to stay within disk
    }
    
    return [x, y];
  }

  /**
   * Calculate hyperbolic distance between two points
   */
  private static calculateHyperbolicDistance(coordinates: number[]): number {
    const [x, y] = coordinates;
    const magnitude = Math.sqrt(x * x + y * y);
    
    if (magnitude >= 1) return Infinity;
    
    // Hyperbolic distance in Poincaré disk model
    return Math.acosh(1 + 2 * magnitude * magnitude / (1 - magnitude * magnitude));
  }

  /**
   * Calculate complexity metric from embedding
   */
  private static calculateComplexity(embedding: number[]): number {
    // Calculate variance as complexity measure
    const mean = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
    const variance = embedding.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / embedding.length;
    return Math.sqrt(variance);
  }
}

// 🔗 TopoJSON Encoder for Topological Data
export class TopoJSONEncoder {
  /**
   * Create TopoJSON from H²GNN topology
   */
  static createTopoJSON(embeddings: HyperbolicEmbedding[]): any {
    // Create arcs from hyperbolic distances
    const arcs: number[][][] = [];
    const coordinates: number[][] = [];
    
    // Add coordinates
    embeddings.forEach((embedding, i) => {
      coordinates.push(embedding.coordinates);
    });

    // Create arcs based on hyperbolic distances
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const distance = this.calculateHyperbolicDistance(
          embeddings[i].coordinates,
          embeddings[j].coordinates
        );
        
        // Only create arcs for close embeddings
        if (distance < 0.5) { // Threshold for connectivity
          arcs.push([
            [i, 0], // Start point
            [j, 0]  // End point
          ]);
        }
      }
    }

    return {
      type: 'Topology',
      objects: {
        embeddings: {
          type: 'GeometryCollection',
          geometries: embeddings.map((embedding, i) => ({
            type: 'Point',
            coordinates: [i, 0], // Reference to arc index
            properties: {
              semantic_label: embedding.semanticLabel,
              cluster_id: embedding.clusterId,
              confidence: embedding.confidence
            }
          }))
        }
      },
      arcs: arcs,
      properties: {
        totalEmbeddings: embeddings.length,
        totalArcs: arcs.length,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Convert TopoJSON to H²GNN topology
   */
  static topoJSONToHyperbolic(topoJSON: any): HyperbolicEmbedding[] {
    const embeddings: HyperbolicEmbedding[] = [];
    
    if (topoJSON.type !== 'Topology' || !topoJSON.objects.embeddings) {
      throw new Error('Invalid TopoJSON format');
    }

    const geometries = topoJSON.objects.embeddings.geometries;
    
    for (const geometry of geometries) {
      if (geometry.type === 'Point' && geometry.properties) {
        const props = geometry.properties;
        embeddings.push({
          coordinates: [0, 0], // Will be calculated from arcs
          curvature: -1.0,
          embedding: new Array(64).fill(0), // Default embedding
          semanticLabel: props.semantic_label || '',
          clusterId: props.cluster_id || 0,
          confidence: props.confidence || 0,
          timestamp: Date.now()
        });
      }
    }

    return embeddings;
  }

  /**
   * Calculate hyperbolic distance between two points
   */
  private static calculateHyperbolicDistance(coords1: number[], coords2: number[]): number {
    const [x1, y1] = coords1;
    const [x2, y2] = coords2;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const euclideanDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Hyperbolic distance in Poincaré disk model
    const magnitude1 = Math.sqrt(x1 * x1 + y1 * y1);
    const magnitude2 = Math.sqrt(x2 * x2 + y2 * y2);
    
    if (magnitude1 >= 1 || magnitude2 >= 1) return Infinity;
    
    const numerator = Math.pow(euclideanDistance, 2);
    const denominator = (1 - magnitude1 * magnitude1) * (1 - magnitude2 * magnitude2);
    
    return Math.acosh(1 + 2 * numerator / denominator);
  }
}

// 🎯 Unified Encoder Interface
export class ProtocolEncoder {
  constructor() {
    // All encoders are static classes, no need to instantiate
  }

  /**
   * Encode data based on format
   */
  encode(data: any, format: 'binary' | 'json' | 'geojson' | 'topojson'): ArrayBuffer | string {
    switch (format) {
      case 'binary':
        if (Array.isArray(data) && data.length > 0 && 'embedding' in data[0]) {
          return BinaryEncoder.encodeEmbeddings(data);
        }
        throw new Error('Binary encoding requires HyperbolicEmbedding array');
      
      case 'json':
        return JSONEncoder.encodeMessage({} as H2GNNAddress, data);
      
      case 'geojson':
        if (Array.isArray(data) && data.length > 0 && 'embedding' in data[0]) {
          return JSON.stringify(GeoJSONEncoder.createGeoJSON(data));
        }
        throw new Error('GeoJSON encoding requires HyperbolicEmbedding array');
      
      case 'topojson':
        if (Array.isArray(data) && data.length > 0 && 'embedding' in data[0]) {
          return JSON.stringify(TopoJSONEncoder.createTopoJSON(data));
        }
        throw new Error('TopoJSON encoding requires HyperbolicEmbedding array');
      
      default:
        throw new Error(`Unsupported encoding format: ${format}`);
    }
  }

  /**
   * Decode data based on format
   */
  decode(data: ArrayBuffer | string, format: 'binary' | 'json' | 'geojson' | 'topojson'): any {
    switch (format) {
      case 'binary':
        if (data instanceof ArrayBuffer) {
          return BinaryEncoder.decodeEmbeddings(data);
        }
        throw new Error('Binary decoding requires ArrayBuffer');
      
      case 'json':
        if (typeof data === 'string') {
          return JSONEncoder.decodeMessage(data);
        }
        throw new Error('JSON decoding requires string');
      
      case 'geojson':
        if (typeof data === 'string') {
          return JSON.parse(data);
        }
        throw new Error('GeoJSON decoding requires string');
      
      case 'topojson':
        if (typeof data === 'string') {
          return JSON.parse(data);
        }
        throw new Error('TopoJSON decoding requires string');
      
      default:
        throw new Error(`Unsupported decoding format: ${format}`);
    }
  }

  /**
   * Get optimal encoding format for data type
   */
  getOptimalFormat(dataType: string, dataSize: number): 'binary' | 'json' | 'geojson' | 'topojson' {
    switch (dataType) {
      case 'embeddings':
        return dataSize > 1000 ? 'binary' : 'json';
      case 'visualization':
        return 'geojson';
      case 'topology':
        return 'topojson';
      case 'metadata':
        return 'json';
      default:
        return 'json';
    }
  }
}

// Classes are already exported above, no need for additional exports
