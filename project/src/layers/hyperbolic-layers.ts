/**
 * Hyperbolic Neural Network Layers
 * Implementation of neural network layers that operate natively in hyperbolic space
 * 
 * Key Features:
 * - Hyperbolic Linear Layer: W ⊗ x ⊕ b
 * - Hyperbolic Attention: exp(-d_H(q,k))
 * - Hyperbolic Batch Normalization
 * - Hyperbolic Activation Functions
 */

import { HyperbolicArithmetic, Vector, createVector } from '../math/hyperbolic-arithmetic';

export interface LayerConfig {
  inputDim: number;
  outputDim: number;
  curvature?: number;
  learningRate?: number;
  dropout?: number;
}

export interface AttentionConfig extends LayerConfig {
  numHeads?: number;
  temperature?: number;
}

/**
 * Hyperbolic Linear Layer
 * Implements: output = W ⊗ input ⊕ bias
 */
export class HyperbolicLinear {
  private weights: number[][];
  private bias: Vector;
  private config: LayerConfig;

  constructor(config: LayerConfig) {
    this.config = config;
    this.initializeParameters();
  }

  private initializeParameters(): void {
    // Xavier/Glorot initialization adapted for hyperbolic space
    const scale = Math.sqrt(2.0 / (this.config.inputDim + this.config.outputDim));
    
    this.weights = Array.from({ length: this.config.outputDim }, () =>
      Array.from({ length: this.config.inputDim }, () =>
        (Math.random() - 0.5) * 2 * scale
      )
    );

    // Initialize bias in hyperbolic space
    this.bias = HyperbolicArithmetic.randomHyperbolicPoint(this.config.outputDim, 0.1);
  }

  forward(input: Vector): Vector {
    if (input.dim !== this.config.inputDim) {
      throw new Error(`Input dimension ${input.dim} doesn't match expected ${this.config.inputDim}`);
    }

    // Compute W * x in tangent space, then map to hyperbolic space
    const linearOutput = this.weights.map(row =>
      row.reduce((sum, weight, i) => sum + weight * input.data[i], 0)
    );

    const linearVector = createVector(linearOutput);
    
    // Project to hyperbolic space and add bias using Möbius addition
    const hyperbolicOutput = HyperbolicArithmetic.projectToPoincareBall(linearVector);
    return HyperbolicArithmetic.mobiusAdd(hyperbolicOutput, this.bias);
  }

  backward(gradOutput: Vector, input: Vector): { gradInput: Vector; gradWeights: number[][]; gradBias: Vector } {
    // Hyperbolic backpropagation using Riemannian gradients
    // This is a simplified version - full implementation requires careful handling of manifold constraints
    
    const gradWeights = this.weights.map((row, i) =>
      row.map((_, j) => gradOutput.data[i] * input.data[j])
    );

    const gradBias = gradOutput;

    const gradInput = createVector(
      input.data.map((_, j) =>
        this.weights.reduce((sum, row, i) => sum + row[j] * gradOutput.data[i], 0)
      )
    );

    return { gradInput, gradWeights, gradBias };
  }

  updateParameters(gradWeights: number[][], gradBias: Vector): void {
    const lr = this.config.learningRate || 0.01;

    // Update weights
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        this.weights[i][j] -= lr * gradWeights[i][j];
      }
    }

    // Update bias using exponential map (Riemannian gradient descent)
    const tangentUpdate = createVector(gradBias.data.map(g => -lr * g));
    this.bias = HyperbolicArithmetic.expMap(this.bias, tangentUpdate);
  }
}

/**
 * Hyperbolic Attention Layer
 * Uses hyperbolic distance for attention weights: exp(-d_H(q,k))
 */
export class HyperbolicAttention {
  private queryProjection: HyperbolicLinear;
  private keyProjection: HyperbolicLinear;
  private valueProjection: HyperbolicLinear;
  private outputProjection: HyperbolicLinear;
  private config: AttentionConfig;

  constructor(config: AttentionConfig) {
    this.config = {
      numHeads: 1,
      temperature: 1.0,
      ...config
    };

    const headDim = Math.floor(config.outputDim / this.config.numHeads!);
    
    this.queryProjection = new HyperbolicLinear({
      inputDim: config.inputDim,
      outputDim: headDim,
      learningRate: config.learningRate
    });

    this.keyProjection = new HyperbolicLinear({
      inputDim: config.inputDim,
      outputDim: headDim,
      learningRate: config.learningRate
    });

    this.valueProjection = new HyperbolicLinear({
      inputDim: config.inputDim,
      outputDim: headDim,
      learningRate: config.learningRate
    });

    this.outputProjection = new HyperbolicLinear({
      inputDim: headDim,
      outputDim: config.outputDim,
      learningRate: config.learningRate
    });
  }

  forward(queries: Vector[], keys: Vector[], values: Vector[]): Vector[] {
    const batchSize = queries.length;
    
    // Project to query, key, value spaces
    const Q = queries.map(q => this.queryProjection.forward(q));
    const K = keys.map(k => this.keyProjection.forward(k));
    const V = values.map(v => this.valueProjection.forward(v));

    // Compute hyperbolic attention weights
    const attentionWeights = Q.map(q =>
      K.map(k => {
        const distance = HyperbolicArithmetic.distance(q, k);
        return Math.exp(-distance / this.config.temperature!);
      })
    );

    // Normalize attention weights
    const normalizedWeights = attentionWeights.map(weights => {
      const sum = weights.reduce((s, w) => s + w, 0);
      return weights.map(w => w / (sum + 1e-10));
    });

    // Compute weighted sum using Möbius addition
    const attended = normalizedWeights.map(weights => {
      const weightedVectors = weights.map((w, i) =>
        HyperbolicArithmetic.mobiusScalarMult(w, V[i])
      );
      return HyperbolicArithmetic.batchMobiusAdd(weightedVectors);
    });

    // Final output projection
    return attended.map(a => this.outputProjection.forward(a));
  }

  multiHeadAttention(input: Vector[]): Vector[] {
    // For simplicity, this implements single-head attention
    // Multi-head would split the input and concatenate outputs
    return this.forward(input, input, input);
  }
}

/**
 * Hyperbolic Batch Normalization
 * Normalizes features while preserving hyperbolic geometry
 */
export class HyperbolicBatchNorm {
  private runningMean: Vector;
  private runningVar: number;
  private momentum: number;
  private eps: number;
  private dim: number;

  constructor(dim: number, momentum: number = 0.1, eps: number = 1e-5) {
    this.dim = dim;
    this.momentum = momentum;
    this.eps = eps;
    this.runningMean = createVector(new Array(dim).fill(0));
    this.runningVar = 1.0;
  }

  forward(inputs: Vector[], training: boolean = true): Vector[] {
    if (inputs.length === 0) return inputs;

    if (training) {
      // Compute batch statistics in hyperbolic space
      const batchMean = this.computeHyperbolicMean(inputs);
      const batchVar = this.computeHyperbolicVariance(inputs, batchMean);

      // Update running statistics
      this.runningMean = HyperbolicArithmetic.mobiusScalarMult(
        1 - this.momentum,
        this.runningMean
      );
      this.runningMean = HyperbolicArithmetic.mobiusAdd(
        this.runningMean,
        HyperbolicArithmetic.mobiusScalarMult(this.momentum, batchMean)
      );
      this.runningVar = (1 - this.momentum) * this.runningVar + this.momentum * batchVar;

      return this.normalize(inputs, batchMean, batchVar);
    } else {
      return this.normalize(inputs, this.runningMean, this.runningVar);
    }
  }

  private computeHyperbolicMean(inputs: Vector[]): Vector {
    // Compute Fréchet mean in hyperbolic space
    let mean = inputs[0];
    const maxIterations = 10;
    const tolerance = 1e-6;

    for (let iter = 0; iter < maxIterations; iter++) {
      const gradients = inputs.map(input =>
        HyperbolicArithmetic.logMap(mean, input)
      );

      const avgGradient = createVector(
        gradients[0].data.map((_, i) =>
          gradients.reduce((sum, grad) => sum + grad.data[i], 0) / gradients.length
        )
      );

      if (HyperbolicArithmetic.norm(avgGradient) < tolerance) break;

      mean = HyperbolicArithmetic.expMap(mean, avgGradient);
    }

    return mean;
  }

  private computeHyperbolicVariance(inputs: Vector[], mean: Vector): number {
    const distances = inputs.map(input =>
      HyperbolicArithmetic.distance(input, mean)
    );
    
    const variance = distances.reduce((sum, d) => sum + d * d, 0) / distances.length;
    return variance;
  }

  private normalize(inputs: Vector[], mean: Vector, variance: number): Vector[] {
    const std = Math.sqrt(variance + this.eps);
    
    return inputs.map(input => {
      // Transport to origin, normalize, then transport back
      const centered = HyperbolicArithmetic.logMap(mean, input);
      const normalized = createVector(centered.data.map(x => x / std));
      return HyperbolicArithmetic.expMap(mean, normalized);
    });
  }
}

/**
 * Hyperbolic Activation Functions
 */
export class HyperbolicActivations {
  /**
   * Hyperbolic ReLU: applies ReLU in tangent space
   */
  static hyperbolicReLU(input: Vector, center?: Vector): Vector {
    const origin = center || createVector(new Array(input.dim).fill(0));
    const tangent = HyperbolicArithmetic.logMap(origin, input);
    
    const activated = createVector(tangent.data.map(x => Math.max(0, x)));
    return HyperbolicArithmetic.expMap(origin, activated);
  }

  /**
   * Hyperbolic Sigmoid: maps to hyperbolic space
   */
  static hyperbolicSigmoid(input: Vector): Vector {
    const activated = createVector(
      input.data.map(x => 2 / (1 + Math.exp(-x)) - 1)
    );
    return HyperbolicArithmetic.projectToPoincareBall(activated);
  }

  /**
   * Hyperbolic Tanh: natural activation for hyperbolic space
   */
  static hyperbolicTanh(input: Vector, scale: number = 1.0): Vector {
    const activated = createVector(
      input.data.map(x => Math.tanh(scale * x))
    );
    return activated;
  }
}

/**
 * Hyperbolic Dropout
 */
export class HyperbolicDropout {
  private dropoutRate: number;

  constructor(dropoutRate: number = 0.5) {
    this.dropoutRate = dropoutRate;
  }

  forward(input: Vector, training: boolean = true): Vector {
    if (!training || this.dropoutRate === 0) {
      return input;
    }

    const mask = input.data.map(() => Math.random() > this.dropoutRate ? 1 : 0);
    const scale = 1.0 / (1.0 - this.dropoutRate);

    const dropped = createVector(
      input.data.map((x, i) => x * mask[i] * scale)
    );

    return HyperbolicArithmetic.projectToPoincareBall(dropped);
  }
}

/**
 * Hyperbolic Message Passing Layer for Graph Neural Networks
 */
export class HyperbolicMessagePassing {
  private messageFunction: HyperbolicLinear;
  private updateFunction: HyperbolicLinear;
  private attention: HyperbolicAttention;

  constructor(config: LayerConfig) {
    this.messageFunction = new HyperbolicLinear({
      inputDim: config.inputDim * 2, // node + neighbor features
      outputDim: config.outputDim,
      learningRate: config.learningRate
    });

    this.updateFunction = new HyperbolicLinear({
      inputDim: config.inputDim + config.outputDim,
      outputDim: config.outputDim,
      learningRate: config.learningRate
    });

    this.attention = new HyperbolicAttention({
      inputDim: config.inputDim,
      outputDim: config.outputDim,
      learningRate: config.learningRate
    });
  }

  forward(nodeFeatures: Vector[], adjacencyList: number[][]): Vector[] {
    const messages = nodeFeatures.map((nodeFeature, nodeIdx) => {
      const neighbors = adjacencyList[nodeIdx] || [];
      
      if (neighbors.length === 0) {
        return createVector(new Array(nodeFeature.dim).fill(0));
      }

      // Compute messages from neighbors
      const neighborMessages = neighbors.map(neighborIdx => {
        const neighborFeature = nodeFeatures[neighborIdx];
        const combined = createVector([...nodeFeature.data, ...neighborFeature.data]);
        return this.messageFunction.forward(combined);
      });

      // Aggregate messages using hyperbolic attention
      const queries = [nodeFeature];
      const keys = neighbors.map(idx => nodeFeatures[idx]);
      const values = neighborMessages;

      const attended = this.attention.forward(queries, keys, values);
      return attended[0];
    });

    // Update node features
    return nodeFeatures.map((nodeFeature, idx) => {
      const message = messages[idx];
      const combined = createVector([...nodeFeature.data, ...message.data]);
      return this.updateFunction.forward(combined);
    });
  }
}

// Export interfaces separately (they don't exist at runtime)
export { LayerConfig, AttentionConfig };

// Default export object with classes only
export default {
  HyperbolicLinear,
  HyperbolicAttention,
  HyperbolicBatchNorm,
  HyperbolicActivations,
  HyperbolicDropout,
  HyperbolicMessagePassing
};
