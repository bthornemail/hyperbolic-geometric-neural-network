/**
 * H²GNN: Hyperbolic Geometric Hypergraph Neural Network
 * 
 * The main class implementing the complete H²GNN system with:
 * - Hyperbolic geometric operations
 * - Cross-platform integration
 * - Knowledge management
 * - Real-time visualization
 */

import { HyperbolicArithmetic, Vector } from '../math/hyperbolic-arithmetic';
import HyperbolicLayers from '../layers/hyperbolic-layers';
import { LayerConfig } from '../layers/hyperbolic-layers';
const {
  HyperbolicLinear,
  HyperbolicAttention,
  HyperbolicBatchNorm,
  HyperbolicActivations,
  HyperbolicDropout,
  HyperbolicMessagePassing
} = HyperbolicLayers;

// Re-export LayerConfig interface from layers
export type { LayerConfig };

export interface H2GNNConfig {
  curvature?: number;
  learningRate?: number;
  embeddingDim?: number;
  numLayers?: number;
  numHeads?: number;
  dropout?: number;
  batchSize?: number;
  maxEpochs?: number;
  tolerance?: number;
  geometryMode?: 'euclidean' | 'hyperbolic' | 'adaptive';
  visualizationEnabled?: boolean;
  crossPlatformSync?: boolean;
}

// Training configuration accepted by train(); kept minimal for compatibility
export interface TrainingConfig {
  learningRate: number;
  batchSize: number;
  epochs: number;
  validationData?: TrainingData;
}

export interface TrainingData {
  nodes: Vector[];
  edges: [number, number][];
  labels?: number[];
  hyperedges?: number[][];
}

export interface PredictionResult {
  embeddings: Vector[];
  predictions: number[];
  confidence: number[];
  geometricInsights: GeometricInsights;
}

export interface GeometricInsights {
  curvature: number;
  hierarchyDepth: number;
  clusteringCoefficient: number;
  geodesicDistances: number[][];
  topologicalFeatures: {
    bettiNumbers: number[];
    persistentHomology: any[];
  };
}

/**
 * Main H²GNN Network Class
 */
export class HyperbolicGeometricHGN {
  private config: Required<H2GNNConfig>;
  private layers: HyperbolicMessagePassing[];
  private attention: HyperbolicAttention;
  private batchNorm: HyperbolicBatchNorm[];
  private dropout: HyperbolicDropout;
  private outputProjection: HyperbolicLinear;
  
  // Training state
  private trainingHistory: {
    epoch: number;
    loss: number;
    geometricLoss: number;
    accuracy?: number;
  }[];
  
  // Geometric state
  private currentCurvature: number;
  private geometricMetrics: GeometricInsights;
  
  constructor(config: H2GNNConfig = {}) {
    this.config = {
      curvature: -1.0,
      learningRate: 0.01,
      embeddingDim: 8,
      numLayers: 3,
      numHeads: 4,
      dropout: 0.1,
      batchSize: 32,
      maxEpochs: 100,
      tolerance: 1e-6,
      geometryMode: 'hyperbolic',
      visualizationEnabled: true,
      crossPlatformSync: false,
      ...config
    };

    this.currentCurvature = this.config.curvature;
    this.trainingHistory = [];
    this.initializeNetwork();
  }

  private initializeNetwork(): void {
    const layerConfig: LayerConfig = {
      inputDim: this.config.embeddingDim,
      outputDim: this.config.embeddingDim,
      learningRate: this.config.learningRate,
      dropout: this.config.dropout
    };

    // Initialize hyperbolic layers
    this.layers = Array.from({ length: this.config.numLayers }, () =>
      new HyperbolicMessagePassing(layerConfig)
    );

    // Initialize attention mechanism
    this.attention = new HyperbolicAttention({
      ...layerConfig,
      numHeads: this.config.numHeads
    });

    // Initialize batch normalization layers
    this.batchNorm = Array.from({ length: this.config.numLayers }, () =>
      new HyperbolicBatchNorm(this.config.embeddingDim)
    );

    // Initialize dropout
    this.dropout = new HyperbolicDropout(this.config.dropout);

    // Initialize output projection
    this.outputProjection = new HyperbolicLinear({
      inputDim: this.config.embeddingDim,
      outputDim: this.config.embeddingDim,
      learningRate: this.config.learningRate
    });
  }

  /**
   * Forward pass through the H²GNN network
   */
  async forward(data: TrainingData): Promise<Vector[]> {
    let nodeFeatures = [...data.nodes];
    const adjacencyList = this.buildAdjacencyList(data);

    // Process through hyperbolic layers
    for (let i = 0; i < this.config.numLayers; i++) {
      // Message passing in hyperbolic space
      nodeFeatures = this.layers[i].forward(nodeFeatures, adjacencyList);
      
      // Batch normalization
      nodeFeatures = this.batchNorm[i].forward(nodeFeatures, true);
      
      // Hyperbolic activation
      nodeFeatures = nodeFeatures.map(feature =>
        HyperbolicActivations.hyperbolicReLU(feature)
      );
      
      // Dropout
      nodeFeatures = nodeFeatures.map(feature =>
        this.dropout.forward(feature, true)
      );
    }

    // Global attention mechanism
    const attended = this.attention.forward(nodeFeatures, nodeFeatures, nodeFeatures);
    
    // Final output projection
    return attended.map(feature => this.outputProjection.forward(feature));
  }

  /**
   * Training loop with geometric loss functions
   */
  async train(trainingData: TrainingData[], _config?: Partial<TrainingConfig>): Promise<void> {
    console.log('🚀 Starting H²GNN Training...');
    
    for (let epoch = 0; epoch < this.config.maxEpochs; epoch++) {
      let totalLoss = 0;
      let totalGeometricLoss = 0;
      
      for (const batch of this.createBatches(trainingData)) {
        const { loss, geometricLoss } = await this.trainBatch(batch);
        totalLoss += loss;
        totalGeometricLoss += geometricLoss;
      }
      
      const avgLoss = totalLoss / trainingData.length;
      const avgGeometricLoss = totalGeometricLoss / trainingData.length;
      
      this.trainingHistory.push({
        epoch,
        loss: avgLoss,
        geometricLoss: avgGeometricLoss
      });
      
      if (epoch % 10 === 0) {
        console.log(`Epoch ${epoch}: Loss=${avgLoss.toFixed(4)}, Geometric Loss=${avgGeometricLoss.toFixed(4)}`);
      }
      
      // Early stopping
      if (avgLoss < this.config.tolerance) {
        console.log(`✅ Converged at epoch ${epoch}`);
        break;
      }
    }
    
    console.log('🎯 Training completed!');
  }

  /**
   * Train a single batch
   */
  private async trainBatch(batch: TrainingData[]): Promise<{ loss: number; geometricLoss: number }> {
    let totalLoss = 0;
    let totalGeometricLoss = 0;
    
    for (const data of batch) {
      // Forward pass
      const outputs = await this.forward(data);
      
      // Compute losses
      const taskLoss = this.computeTaskLoss(outputs, data.labels);
      const geometricLoss = this.computeGeometricLoss(outputs, data);
      
      const combinedLoss = taskLoss + 0.1 * geometricLoss; // Weight geometric loss
      
      // Backward pass (simplified - full implementation would require automatic differentiation)
      await this.backward(combinedLoss, data);
      
      totalLoss += taskLoss;
      totalGeometricLoss += geometricLoss;
    }
    
    return {
      loss: totalLoss / batch.length,
      geometricLoss: totalGeometricLoss / batch.length
    };
  }

  /**
   * Compute task-specific loss (e.g., classification, regression)
   */
  private computeTaskLoss(outputs: Vector[], labels?: number[]): number {
    if (!labels) return 0;
    
    // Simple MSE loss for demonstration
    let loss = 0;
    for (let i = 0; i < outputs.length && i < labels.length; i++) {
      const prediction = HyperbolicArithmetic.norm(outputs[i]);
      loss += Math.pow(prediction - labels[i], 2);
    }
    
    return loss / Math.min(outputs.length, labels.length);
  }

  /**
   * Compute geometric loss functions
   */
  private computeGeometricLoss(outputs: Vector[], data: TrainingData): number {
    let geometricLoss = 0;
    
    // 1. Hyperbolic constraint loss
    const constraintLoss = outputs.reduce((sum, output) => {
      const norm = HyperbolicArithmetic.norm(output);
      return sum + Math.max(0, norm - 0.99); // Penalize points near boundary
    }, 0);
    
    // 2. Geodesic preservation loss
    const geodesicLoss = this.computeGeodesicLoss(outputs, data.edges);
    
    // 3. Curvature consistency loss
    const curvatureLoss = this.computeCurvatureLoss(outputs);
    
    geometricLoss = constraintLoss + geodesicLoss + curvatureLoss;
    
    return geometricLoss;
  }

  /**
   * Compute geodesic preservation loss
   */
  private computeGeodesicLoss(outputs: Vector[], edges: [number, number][]): number {
    let loss = 0;
    
    for (const [i, j] of edges) {
      if (i < outputs.length && j < outputs.length) {
        const hyperbolicDist = HyperbolicArithmetic.distance(outputs[i], outputs[j]);
        const euclideanDist = HyperbolicArithmetic.norm({
          data: outputs[i].data.map((x, k) => x - outputs[j].data[k]),
          dim: outputs[i].dim
        });
        
        // Penalize large discrepancy between hyperbolic and Euclidean distances
        loss += Math.abs(hyperbolicDist - euclideanDist);
      }
    }
    
    return loss / edges.length;
  }

  /**
   * Compute curvature consistency loss
   */
  private computeCurvatureLoss(outputs: Vector[]): number {
    // Simplified curvature estimation
    let curvatureSum = 0;
    let count = 0;
    
    for (let i = 0; i < outputs.length; i++) {
      for (let j = i + 1; j < outputs.length; j++) {
        for (let k = j + 1; k < outputs.length; k++) {
          // Estimate local curvature using triangle of points
          const d12 = HyperbolicArithmetic.distance(outputs[i], outputs[j]);
          const d23 = HyperbolicArithmetic.distance(outputs[j], outputs[k]);
          const d13 = HyperbolicArithmetic.distance(outputs[i], outputs[k]);
          
          // Hyperbolic triangle inequality gives curvature information
          const excess = d12 + d23 - d13;
          curvatureSum += Math.abs(excess - Math.PI * this.currentCurvature);
          count++;
        }
      }
    }
    
    return count > 0 ? curvatureSum / count : 0;
  }

  /**
   * Simplified backward pass
   */
  private async backward(loss: number, data: TrainingData): Promise<void> {
    // In a full implementation, this would compute gradients using automatic differentiation
    // For now, we'll use a simplified gradient estimation
    
    const gradientScale = this.config.learningRate * loss;
    
    // Update network parameters (simplified)
    // In practice, this would involve computing Riemannian gradients
    // and updating parameters on the hyperbolic manifold
  }

  /**
   * Make predictions on new data
   */
  async predict(data: TrainingData): Promise<PredictionResult> {
    const embeddings = await this.forward(data);
    
    // Generate predictions (simplified)
    const predictions = embeddings.map(embedding => 
      HyperbolicArithmetic.norm(embedding)
    );
    
    // Compute confidence scores
    const confidence = embeddings.map(embedding => {
      const norm = HyperbolicArithmetic.norm(embedding);
      return Math.exp(-norm); // Higher confidence for points closer to origin
    });
    
    // Compute geometric insights
    const geometricInsights = this.computeGeometricInsights(embeddings, data);
    
    return {
      embeddings,
      predictions,
      confidence,
      geometricInsights
    };
  }

  /**
   * Compute geometric insights about the data
   */
  private computeGeometricInsights(embeddings: Vector[], data: TrainingData): GeometricInsights {
    // Compute pairwise geodesic distances
    const geodesicDistances = embeddings.map(e1 =>
      embeddings.map(e2 => HyperbolicArithmetic.distance(e1, e2))
    );
    
    // Estimate hierarchy depth
    const distances = geodesicDistances.flat().filter(d => d > 0);
    const hierarchyDepth = Math.max(...distances);
    
    // Compute clustering coefficient
    const clusteringCoefficient = this.computeClusteringCoefficient(geodesicDistances, data.edges);
    
    // Simplified topological features
    const topologicalFeatures = {
      bettiNumbers: [embeddings.length, data.edges.length], // Simplified
      persistentHomology: [] // Would require full TDA implementation
    };
    
    return {
      curvature: this.currentCurvature,
      hierarchyDepth,
      clusteringCoefficient,
      geodesicDistances,
      topologicalFeatures
    };
  }

  /**
   * Compute clustering coefficient
   */
  private computeClusteringCoefficient(distances: number[][], edges: [number, number][]): number {
    // Simplified clustering coefficient based on geometric distances
    let totalCoefficient = 0;
    let nodeCount = 0;
    
    for (let i = 0; i < distances.length; i++) {
      const neighbors = edges
        .filter(([a, b]) => a === i || b === i)
        .map(([a, b]) => a === i ? b : a);
      
      if (neighbors.length < 2) continue;
      
      let triangles = 0;
      let possibleTriangles = 0;
      
      for (let j = 0; j < neighbors.length; j++) {
        for (let k = j + 1; k < neighbors.length; k++) {
          possibleTriangles++;
          
          // Check if neighbors are connected (using distance threshold)
          if (distances[neighbors[j]][neighbors[k]] < 1.0) {
            triangles++;
          }
        }
      }
      
      if (possibleTriangles > 0) {
        totalCoefficient += triangles / possibleTriangles;
        nodeCount++;
      }
    }
    
    return nodeCount > 0 ? totalCoefficient / nodeCount : 0;
  }

  /**
   * Build adjacency list from edges
   */
  private buildAdjacencyList(data: TrainingData): number[][] {
    const adjacencyList: number[][] = Array.from(
      { length: data.nodes.length },
      () => []
    );
    
    for (const [i, j] of data.edges) {
      if (i < data.nodes.length && j < data.nodes.length) {
        adjacencyList[i].push(j);
        adjacencyList[j].push(i);
      }
    }
    
    return adjacencyList;
  }

  /**
   * Create training batches
   */
  private createBatches(data: TrainingData[]): TrainingData[][] {
    const batches: TrainingData[][] = [];
    
    for (let i = 0; i < data.length; i += this.config.batchSize) {
      batches.push(data.slice(i, i + this.config.batchSize));
    }
    
    return batches;
  }

  /**
   * Switch between Euclidean and Hyperbolic geometry
   */
  setGeometryMode(mode: 'euclidean' | 'hyperbolic' | 'adaptive'): void {
    this.config.geometryMode = mode;
    
    switch (mode) {
      case 'euclidean':
        this.currentCurvature = 0.0;
        break;
      case 'hyperbolic':
        this.currentCurvature = -1.0;
        break;
      case 'adaptive':
        // Curvature will be learned during training
        break;
    }
    
    console.log(`🔄 Switched to ${mode} geometry (curvature: ${this.currentCurvature})`);
  }

  /**
   * Get training history
   */
  getTrainingHistory(): typeof this.trainingHistory {
    return [...this.trainingHistory];
  }

  /**
   * Get current geometric metrics
   */
  getGeometricMetrics(): GeometricInsights | undefined {
    return this.geometricMetrics;
  }

  /**
   * Get the configured embedding dimensionality
   */
  getEmbeddingDim(): number {
    return this.config.embeddingDim;
  }

  /**
   * Export model state for cross-platform sync
   */
  exportModel(): any {
    return {
      config: this.config,
      currentCurvature: this.currentCurvature,
      trainingHistory: this.trainingHistory,
      // In a full implementation, this would include all learned parameters
    };
  }

  /**
   * Import model state from cross-platform sync
   */
  importModel(modelState: any): void {
    this.config = { ...this.config, ...modelState.config };
    this.currentCurvature = modelState.currentCurvature;
    this.trainingHistory = modelState.trainingHistory || [];
    
    // Reinitialize network with imported config
    this.initializeNetwork();
    
    console.log('📥 Model imported successfully');
  }
}

// Convenience factory functions
export function createH2GNN(config?: H2GNNConfig): HyperbolicGeometricHGN {
  return new HyperbolicGeometricHGN(config);
}

export function createHierarchicalDataset(
  numNodes: number,
  hierarchyDepth: number = 3
): TrainingData {
  const nodes: Vector[] = [];
  const edges: [number, number][] = [];
  
  // Generate hierarchical structure in hyperbolic space
  for (let i = 0; i < numNodes; i++) {
    const level = Math.floor(i / Math.pow(2, hierarchyDepth - 1));
    const radius = level * 0.2; // Deeper levels are further from origin
    
    const node = HyperbolicArithmetic.randomHyperbolicPoint(8, radius);
    nodes.push(node);
    
    // Connect to parent (hierarchical structure)
    if (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      edges.push([parent, i]);
    }
  }
  
  return { nodes, edges };
}

export default HyperbolicGeometricHGN;
