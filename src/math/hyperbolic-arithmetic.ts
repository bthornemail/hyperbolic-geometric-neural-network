/**
 * Hyperbolic Arithmetic Operations
 * Implementation of Möbius gyrovector space operations for H²GNN
 * 
 * Mathematical Foundation:
 * - Poincaré Ball Model: {x ∈ ℝⁿ : ||x|| < 1}
 * - Möbius Addition: u ⊕ v = (u + v) / (1 + ⟨u,v⟩)
 * - Möbius Scalar Multiplication: r ⊗ v = tanh(r·artanh(||v||)) · v/||v||
 */

export interface Vector {
  data: number[];
  dim: number;
}

export class HyperbolicArithmetic {
  private static readonly EPS = 1e-10;
  private static readonly BOUNDARY_EPS = 1e-6;

  /**
   * Create a vector in hyperbolic space
   */
  static createVector(data: number[]): Vector {
    return {
      data: [...data],
      dim: data.length
    };
  }

  /**
   * Project vector to Poincaré ball (ensure ||x|| < 1)
   */
  static projectToPoincareBall(v: Vector): Vector {
    const norm = this.norm(v);
    if (norm >= 1.0) {
      const scale = (1.0 - this.BOUNDARY_EPS) / norm;
      return {
        data: v.data.map(x => x * scale),
        dim: v.dim
      };
    }
    return v;
  }

  /**
   * Compute Euclidean norm of vector
   */
  static norm(v: Vector): number {
    return Math.sqrt(v.data.reduce((sum, x) => sum + x * x, 0));
  }

  /**
   * Compute dot product of two vectors
   */
  static dot(u: Vector, v: Vector): number {
    if (u.dim !== v.dim) {
      throw new Error('Vector dimensions must match');
    }
    return u.data.reduce((sum, x, i) => sum + x * v.data[i], 0);
  }

  /**
   * Möbius Addition: u ⊕ v
   * The fundamental operation in hyperbolic space
   */
  static mobiusAdd(u: Vector, v: Vector): Vector {
    if (u.dim !== v.dim) {
      throw new Error('Vector dimensions must match');
    }

    const uDotV = this.dot(u, v);
    const uNormSq = this.dot(u, u);
    const vNormSq = this.dot(v, v);

    const numerator1 = (1 + 2 * uDotV + vNormSq) / (1 + uDotV);
    const numerator2 = (1 - uNormSq) / (1 + uDotV);

    const result = {
      data: u.data.map((ui, i) => numerator1 * ui + numerator2 * v.data[i]),
      dim: u.dim
    };

    const denominator = 1 + 2 * uDotV + uNormSq * vNormSq;
    
    return {
      data: result.data.map(x => x / denominator),
      dim: result.dim
    };
  }

  /**
   * Möbius Scalar Multiplication: r ⊗ v
   */
  static mobiusScalarMult(r: number, v: Vector): Vector {
    const vNorm = this.norm(v);
    
    if (vNorm < this.EPS) {
      return this.createVector(new Array(v.dim).fill(0));
    }

    const artanhVNorm = this.artanh(vNorm);
    const tanhResult = Math.tanh(r * artanhVNorm);
    const scale = tanhResult / vNorm;

    return {
      data: v.data.map(x => x * scale),
      dim: v.dim
    };
  }

  /**
   * Hyperbolic Distance: d_H(u, v) = artanh(||(-u) ⊕ v||)
   */
  static distance(u: Vector, v: Vector): number {
    const negU = this.createVector(u.data.map(x => -x));
    const diff = this.mobiusAdd(negU, v);
    const diffNorm = this.norm(diff);
    return this.artanh(diffNorm);
  }

  /**
   * Exponential Map: exp_p(v) - map from tangent space to manifold
   */
  static expMap(p: Vector, v: Vector): Vector {
    const vNorm = this.norm(v);
    
    if (vNorm < this.EPS) {
      return p;
    }

    const lambda_p = this.conformalFactor(p);
    const scaledNorm = vNorm / lambda_p;
    const tanhResult = Math.tanh(scaledNorm);
    const scale = tanhResult / vNorm;

    const scaledV = {
      data: v.data.map(x => x * scale),
      dim: v.dim
    };

    return this.mobiusAdd(p, scaledV);
  }

  /**
   * Logarithmic Map: log_p(q) - map from manifold to tangent space
   */
  static logMap(p: Vector, q: Vector): Vector {
    const negP = this.createVector(p.data.map(x => -x));
    const diff = this.mobiusAdd(negP, q);
    const diffNorm = this.norm(diff);

    if (diffNorm < this.EPS) {
      return this.createVector(new Array(p.dim).fill(0));
    }

    const lambda_p = this.conformalFactor(p);
    const artanhDiffNorm = this.artanh(diffNorm);
    const scale = (lambda_p * artanhDiffNorm) / diffNorm;

    return {
      data: diff.data.map(x => x * scale),
      dim: diff.dim
    };
  }

  /**
   * Parallel Transport: transport vector v from point p to point q
   */
  static parallelTransport(p: Vector, q: Vector, v: Vector): Vector {
    const logPQ = this.logMap(p, q);
    const logPQNorm = this.norm(logPQ);

    if (logPQNorm < this.EPS) {
      return v;
    }

    const lambda_p = this.conformalFactor(p);
    const lambda_q = this.conformalFactor(q);
    
    // Gyroparallel transport formula
    const alpha = -this.dot(logPQ, v) / (logPQNorm * logPQNorm);
    const transportedV = {
      data: v.data.map((vi, i) => vi + alpha * logPQ.data[i]),
      dim: v.dim
    };

    const scale = lambda_q / lambda_p;
    return {
      data: transportedV.data.map(x => x * scale),
      dim: transportedV.dim
    };
  }

  /**
   * Conformal Factor: λ_p = 2 / (1 - ||p||²)
   */
  private static conformalFactor(p: Vector): number {
    const pNormSq = this.dot(p, p);
    return 2.0 / (1.0 - pNormSq);
  }

  /**
   * Inverse hyperbolic tangent with numerical stability
   */
  private static artanh(x: number): number {
    if (Math.abs(x) >= 1.0) {
      // Clamp to avoid numerical issues
      x = Math.sign(x) * (1.0 - this.EPS);
    }
    return 0.5 * Math.log((1 + x) / (1 - x));
  }

  /**
   * Hyperbolic Attention Weight: exp(-d_H(q, k))
   */
  static hyperbolicAttention(query: Vector, key: Vector): number {
    const dist = this.distance(query, key);
    return Math.exp(-dist);
  }

  /**
   * Batch Möbius Addition for multiple vectors
   */
  static batchMobiusAdd(vectors: Vector[]): Vector {
    if (vectors.length === 0) {
      throw new Error('Cannot add empty vector list');
    }
    
    if (vectors.length === 1) {
      return vectors[0];
    }

    let result = vectors[0];
    for (let i = 1; i < vectors.length; i++) {
      result = this.mobiusAdd(result, vectors[i]);
    }
    
    return result;
  }

  /**
   * Convert to Lorentz model for numerical stability
   */
  static toLorentz(v: Vector): Vector {
    const vNormSq = this.dot(v, v);
    const x0 = (1 + vNormSq) / (1 - vNormSq);
    const scale = 2 / (1 - vNormSq);
    
    return {
      data: [x0, ...v.data.map(x => x * scale)],
      dim: v.dim + 1
    };
  }

  /**
   * Convert from Lorentz model back to Poincaré ball
   */
  static fromLorentz(v: Vector): Vector {
    if (v.dim < 2) {
      throw new Error('Lorentz vector must have at least 2 dimensions');
    }
    
    const x0 = v.data[0];
    const scale = 1 / (1 + x0);
    
    return {
      data: v.data.slice(1).map(x => x * scale),
      dim: v.dim - 1
    };
  }

  /**
   * Generate random point in hyperbolic space
   */
  static randomHyperbolicPoint(dim: number, radius: number = 0.8): Vector {
    const gaussian = Array.from({ length: dim }, () => 
      Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
    );
    
    const norm = Math.sqrt(gaussian.reduce((sum, x) => sum + x * x, 0));
    const scale = radius * Math.random() / norm;
    
    return this.createVector(gaussian.map(x => x * scale));
  }

  /**
   * Validate hyperbolic constraints
   */
  static validateHyperbolic(v: Vector): boolean {
    const norm = this.norm(v);
    return norm < 1.0 - this.EPS;
  }
}

// Export convenience functions
export const {
  createVector,
  projectToPoincareBall,
  norm,
  dot,
  mobiusAdd,
  mobiusScalarMult,
  distance,
  expMap,
  logMap,
  parallelTransport,
  hyperbolicAttention,
  batchMobiusAdd,
  toLorentz,
  fromLorentz,
  randomHyperbolicPoint,
  validateHyperbolic
} = HyperbolicArithmetic;

export default HyperbolicArithmetic;
