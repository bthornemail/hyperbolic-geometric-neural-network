/**
 * PocketFlow Core Integration with H²GNN
 * 
 * Implements the PocketFlow framework abstractions:
 * - Node: Handles simple (LLM) tasks
 * - Flow: Orchestrates nodes through actions
 * - Shared Store: Communication between nodes
 * 
 * Enhanced with H²GNN hyperbolic embeddings for hierarchical reasoning
 */

import { HyperbolicGeometricHGN } from '../core/H2GNN';
import { HyperbolicArithmetic, Vector, createVector } from '../math/hyperbolic-arithmetic';

// Core PocketFlow Types
export type Action = string | null;
export type SharedStore = Record<string, any>;
export type NodeParams = Record<string, any>;

export interface NodeConfig {
  maxRetries?: number;
  wait?: number;
  params?: NodeParams;
}

export interface FlowConfig {
  params?: NodeParams;
}

/**
 * Base Node class - handles simple (LLM) tasks
 */
export abstract class BaseNode {
  protected maxRetries: number;
  protected wait: number;
  protected curRetry: number = 0;
  public params: NodeParams;
  public successors: Map<Action, BaseNode> = new Map();

  constructor(config: NodeConfig = {}) {
    this.maxRetries = config.maxRetries || 1;
    this.wait = config.wait || 0;
    this.params = config.params || {};
  }

  /**
   * Prepare data from shared store
   */
  prep(shared: SharedStore): any {
    return null;
  }

  /**
   * Execute the main logic with retries
   */
  async exec(prepRes: any): Promise<any> {
    throw new Error('exec() must be implemented by subclass');
  }

  /**
   * Fallback when all retries fail
   */
  execFallback(prepRes: any, error: Error): any {
    throw error;
  }

  /**
   * Post-process results and return action
   */
  post(shared: SharedStore, prepRes: any, execRes: any): Action {
    return 'default';
  }

  /**
   * Run the complete node cycle
   */
  async run(shared: SharedStore): Promise<Action> {
    const prepRes = this.prep(shared);
    let execRes: any;

    // Execute with retries
    for (this.curRetry = 0; this.curRetry < this.maxRetries; this.curRetry++) {
      try {
        execRes = await this.exec(prepRes);
        break;
      } catch (error) {
        if (this.curRetry === this.maxRetries - 1) {
          // Last retry failed, use fallback
          execRes = this.execFallback(prepRes, error as Error);
        } else {
          // Wait before retry
          if (this.wait > 0) {
            await new Promise(resolve => setTimeout(resolve, this.wait * 1000));
          }
        }
      }
    }

    return this.post(shared, prepRes, execRes);
  }

  /**
   * Set node parameters
   */
  setParams(params: NodeParams): void {
    this.params = { ...this.params, ...params };
  }

  /**
   * Connect to next node with action
   */
  connect(action: Action, nextNode: BaseNode): BaseNode {
    this.successors.set(action, nextNode);
    return nextNode;
  }

  /**
   * Operator overloading for connections
   */
  ['-'](action: Action): NodeConnector {
    return new NodeConnector(this, action);
  }

  ['>>'](nextNode: BaseNode): BaseNode {
    return this.connect('default', nextNode);
  }
}

/**
 * Helper class for fluent API
 */
class NodeConnector {
  constructor(private fromNode: BaseNode, private action: Action) {}

  ['>>'](nextNode: BaseNode): BaseNode {
    return this.fromNode.connect(this.action, nextNode);
  }
}

/**
 * Batch Node - processes iterables
 */
export abstract class BatchNode extends BaseNode {
  /**
   * Prepare returns an iterable
   */
  abstract prep(shared: SharedStore): Iterable<any>;

  /**
   * Execute for each item
   */
  abstract exec(item: any): Promise<any>;

  /**
   * Post-process all results
   */
  abstract post(shared: SharedStore, prepRes: Iterable<any>, execResList: any[]): Action;

  /**
   * Run batch processing
   */
  async run(shared: SharedStore): Promise<Action> {
    const prepRes = this.prep(shared);
    const execResList: any[] = [];

    for (const item of prepRes) {
      let execRes: any;
      
      // Execute with retries for each item
      for (this.curRetry = 0; this.curRetry < this.maxRetries; this.curRetry++) {
        try {
          execRes = await this.exec(item);
          break;
        } catch (error) {
          if (this.curRetry === this.maxRetries - 1) {
            execRes = this.execFallback(item, error as Error);
          } else if (this.wait > 0) {
            await new Promise(resolve => setTimeout(resolve, this.wait * 1000));
          }
        }
      }
      
      execResList.push(execRes);
    }

    return this.post(shared, prepRes, execResList);
  }
}

/**
 * Flow - orchestrates nodes through actions
 */
export class Flow extends BaseNode {
  private startNode: BaseNode;

  constructor(config: FlowConfig & { start: BaseNode }) {
    super(config);
    this.startNode = config.start;
  }

  /**
   * Run the flow starting from start node
   */
  async run(shared: SharedStore): Promise<Action> {
    // Merge flow params with shared store
    const mergedShared = { ...shared, ...this.params };
    
    let currentNode: BaseNode | undefined = this.startNode;
    
    while (currentNode) {
      // Set node params (merge with flow params)
      currentNode.setParams({ ...this.params, ...currentNode.params });
      
      // Run current node
      const action = await currentNode.run(mergedShared);
      
      // Find next node based on action
      currentNode = currentNode.successors.get(action);
    }

    return this.post(shared, null, null);
  }

  prep(shared: SharedStore): any {
    return null;
  }

  async exec(prepRes: any): Promise<any> {
    // Flow doesn't have exec - logic is in run()
    return null;
  }

  post(shared: SharedStore, prepRes: any, execRes: any): Action {
    return 'default';
  }
}

/**
 * Batch Flow - runs flow multiple times with different params
 */
export abstract class BatchFlow extends Flow {
  /**
   * Prepare returns list of param dicts
   */
  abstract prep(shared: SharedStore): NodeParams[];

  /**
   * Run flow for each param set
   */
  async run(shared: SharedStore): Promise<Action> {
    const paramsList = this.prep(shared);
    
    for (const params of paramsList) {
      // Merge params and run flow
      const mergedParams = { ...this.params, ...params };
      this.setParams(mergedParams);
      
      // Run the flow with merged params
      await super.run(shared);
    }

    return this.post(shared, paramsList, null);
  }

  post(shared: SharedStore, prepRes: NodeParams[], execRes: any): Action {
    return 'default';
  }
}

/**
 * H²GNN Enhanced Node - integrates hyperbolic embeddings
 */
export abstract class HyperbolicNode extends BaseNode {
  protected h2gnn: HyperbolicGeometricHGN;
  protected embeddings: Map<string, Vector> = new Map();

  constructor(config: NodeConfig & { h2gnn?: HyperbolicGeometricHGN }) {
    super(config);
    this.h2gnn = config.h2gnn || new HyperbolicGeometricHGN({
      embeddingDim: 16,
      curvature: -1.0
    });
  }

  /**
   * Generate hyperbolic embedding for text/data
   */
  async generateEmbedding(text: string, context?: any): Promise<Vector> {
    // Check cache first
    const cacheKey = this.getCacheKey(text, context);
    if (this.embeddings.has(cacheKey)) {
      return this.embeddings.get(cacheKey)!;
    }

    // Generate new embedding using H²GNN
    const embedding = await this.computeHyperbolicEmbedding(text, context);
    
    // Cache the result
    this.embeddings.set(cacheKey, embedding);
    
    return embedding;
  }

  /**
   * Compute hyperbolic embedding (to be implemented by subclasses)
   */
  protected abstract computeHyperbolicEmbedding(text: string, context?: any): Promise<Vector>;

  /**
   * Find similar embeddings using hyperbolic distance
   */
  findSimilarEmbeddings(query: Vector, topK: number = 5): Array<{ key: string; embedding: Vector; distance: number }> {
    const similarities: Array<{ key: string; embedding: Vector; distance: number }> = [];

    for (const [key, embedding] of this.embeddings) {
      const distance = HyperbolicArithmetic.distance(query, embedding);
      similarities.push({ key, embedding, distance });
    }

    // Sort by distance (smaller = more similar in hyperbolic space)
    similarities.sort((a, b) => a.distance - b.distance);
    
    return similarities.slice(0, topK);
  }

  /**
   * Hierarchical clustering of embeddings
   */
  clusterEmbeddings(threshold: number = 0.5): Array<{ center: Vector; members: string[] }> {
    const clusters: Array<{ center: Vector; members: string[] }> = [];
    const visited = new Set<string>();

    for (const [key, embedding] of this.embeddings) {
      if (visited.has(key)) continue;

      const cluster = { center: embedding, members: [key] };
      visited.add(key);

      // Find nearby embeddings
      for (const [otherKey, otherEmbedding] of this.embeddings) {
        if (visited.has(otherKey)) continue;

        const distance = HyperbolicArithmetic.distance(embedding, otherEmbedding);
        if (distance < threshold) {
          cluster.members.push(otherKey);
          visited.add(otherKey);
        }
      }

      // Recompute cluster center using Fréchet mean
      if (cluster.members.length > 1) {
        cluster.center = this.computeFrechemMean(
          cluster.members.map(key => this.embeddings.get(key)!).filter(Boolean)
        );
      }

      clusters.push(cluster);
    }

    return clusters;
  }

  /**
   * Compute Fréchet mean in hyperbolic space
   */
  private computeFrechemMean(embeddings: Vector[]): Vector {
    if (embeddings.length === 0) return createVector([0, 0]);
    if (embeddings.length === 1) return embeddings[0];

    let mean = embeddings[0];
    
    // Iterative algorithm for Fréchet mean
    for (let iter = 0; iter < 10; iter++) {
      const gradients = embeddings.map(emb => 
        HyperbolicArithmetic.logMap(mean, emb)
      );

      const avgGradient = createVector(
        gradients[0].data.map((_, i) =>
          gradients.reduce((sum, grad) => sum + grad.data[i], 0) / gradients.length
        )
      );

      mean = HyperbolicArithmetic.expMap(mean, avgGradient);

      if (HyperbolicArithmetic.norm(avgGradient) < 1e-6) break;
    }

    return mean;
  }

  private getCacheKey(text: string, context?: any): string {
    const contextStr = context ? JSON.stringify(context) : '';
    return `${text}:${contextStr}`;
  }
}

/**
 * Async Node for asynchronous operations
 */
export abstract class AsyncNode extends BaseNode {
  async prepAsync(shared: SharedStore): Promise<any> {
    return this.prep(shared);
  }

  abstract execAsync(prepRes: any): Promise<any>;

  async execFallbackAsync(prepRes: any, error: Error): Promise<any> {
    return this.execFallback(prepRes, error);
  }

  async postAsync(shared: SharedStore, prepRes: any, execRes: any): Promise<Action> {
    return this.post(shared, prepRes, execRes);
  }

  async exec(prepRes: any): Promise<any> {
    return this.execAsync(prepRes);
  }

  /**
   * Async run method
   */
  async runAsync(shared: SharedStore): Promise<Action> {
    const prepRes = await this.prepAsync(shared);
    let execRes: any;

    for (this.curRetry = 0; this.curRetry < this.maxRetries; this.curRetry++) {
      try {
        execRes = await this.execAsync(prepRes);
        break;
      } catch (error) {
        if (this.curRetry === this.maxRetries - 1) {
          execRes = await this.execFallbackAsync(prepRes, error as Error);
        } else if (this.wait > 0) {
          await new Promise(resolve => setTimeout(resolve, this.wait * 1000));
        }
      }
    }

    return this.postAsync(shared, prepRes, execRes);
  }
}

/**
 * Async Flow for asynchronous workflows
 */
export class AsyncFlow extends Flow {
  async run(shared: SharedStore): Promise<Action> {
    const mergedShared = { ...shared, ...this.params };
    let currentNode: BaseNode | undefined = this.startNode;
    
    while (currentNode) {
      currentNode.setParams({ ...this.params, ...currentNode.params });
      
      let action: Action;
      if (currentNode instanceof AsyncNode) {
        action = await currentNode.runAsync(mergedShared);
      } else {
        action = await currentNode.run(mergedShared);
      }
      
      currentNode = currentNode.successors.get(action);
    }

    return this.post(shared, null, null);
  }
}

// Export utility functions
export function createFlow(startNode: BaseNode, params?: NodeParams): Flow {
  return new Flow({ start: startNode, params });
}

export function createAsyncFlow(startNode: BaseNode, params?: NodeParams): AsyncFlow {
  return new AsyncFlow({ start: startNode, params });
}

// Operator overloading helpers
declare global {
  interface Object {
    '-'(action: Action): NodeConnector;
    '>>'(nextNode: BaseNode): BaseNode;
  }
}

// Add operators to BaseNode prototype
Object.defineProperty(BaseNode.prototype, '-', {
  value: function(action: Action) {
    return new NodeConnector(this, action);
  },
  enumerable: false
});

Object.defineProperty(BaseNode.prototype, '>>', {
  value: function(nextNode: BaseNode) {
    return this.connect('default', nextNode);
  },
  enumerable: false
});

export default {
  BaseNode,
  BatchNode,
  Flow,
  BatchFlow,
  HyperbolicNode,
  AsyncNode,
  AsyncFlow,
  createFlow,
  createAsyncFlow
};
