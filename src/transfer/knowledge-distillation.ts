#!/usr/bin/env tsx

/**
 * Knowledge Distillation System
 * 
 * This module provides knowledge distillation capabilities for transfer learning:
 * - Teacher-student model distillation
 * - Knowledge compression
 * - Model ensemble distillation
 * - Progressive knowledge transfer
 * - Distillation quality metrics
 */

export interface TeacherModel {
  id: string;
  name: string;
  domain: string;
  embeddings: Map<string, number[]>;
  relationships: Array<{source: string, target: string, type: string, strength: number}>;
  performance: number;
  complexity: number;
  metadata: Record<string, any>;
}

export interface StudentModel {
  id: string;
  name: string;
  domain: string;
  embeddings: Map<string, number[]>;
  relationships: Array<{source: string, target: string, type: string, strength: number}>;
  performance: number;
  complexity: number;
  metadata: Record<string, any>;
}

export interface DistillationConfig {
  temperature: number;
  alpha: number;
  beta: number;
  gamma: number;
  maxIterations: number;
  learningRate: number;
  batchSize: number;
  regularization: number;
}

export interface DistillationResult {
  teacherId: string;
  studentId: string;
  distilledEmbeddings: Map<string, number[]>;
  distilledRelationships: Array<{source: string, target: string, type: string, strength: number}>;
  qualityMetrics: {
    fidelity: number;
    compression: number;
    efficiency: number;
    accuracy: number;
  };
  distillationTime: number;
  iterations: number;
  convergence: boolean;
}

export interface EnsembleDistillation {
  teachers: string[];
  student: string;
  weights: number[];
  method: 'average' | 'weighted' | 'hierarchical' | 'progressive';
  result: DistillationResult;
}

export class KnowledgeDistillationSystem {
  private teachers: Map<string, TeacherModel> = new Map();
  private students: Map<string, StudentModel> = new Map();
  private distillationHistory: Array<DistillationResult> = [];
  private ensembleDistillations: Array<EnsembleDistillation> = [];
  private defaultConfig: DistillationConfig;

  constructor() {
    this.defaultConfig = {
      temperature: 3.0,
      alpha: 0.7,
      beta: 0.3,
      gamma: 0.1,
      maxIterations: 100,
      learningRate: 0.01,
      batchSize: 32,
      regularization: 0.001
    };
    
    console.warn('🧠 Knowledge Distillation System initialized');
  }

  /**
   * Register a teacher model
   */
  registerTeacher(teacher: TeacherModel): void {
    this.teachers.set(teacher.id, teacher);
    console.warn(`👨‍🏫 Registered teacher: ${teacher.name} (${teacher.domain})`);
  }

  /**
   * Register a student model
   */
  registerStudent(student: StudentModel): void {
    this.students.set(student.id, student);
    console.warn(`👨‍🎓 Registered student: ${student.name} (${student.domain})`);
  }

  /**
   * Distill knowledge from teacher to student
   */
  async distillKnowledge(
    teacherId: string,
    studentId: string,
    config: Partial<DistillationConfig> = {}
  ): Promise<DistillationResult> {
    const startTime = Date.now();
    
    const teacher = this.teachers.get(teacherId);
    const student = this.students.get(studentId);
    
    if (!teacher || !student) {
      throw new Error('Teacher or student model not found');
    }
    
    const finalConfig = { ...this.defaultConfig, ...config };
    
    console.warn(`🧠 Starting knowledge distillation: ${teacher.name} → ${student.name}`);
    
    // Initialize distilled embeddings
    const distilledEmbeddings = new Map<string, number[]>();
    const distilledRelationships: Array<{source: string, target: string, type: string, strength: number}> = [];
    
    // Distill embeddings
    let iteration = 0;
    let convergence = false;
    
    while (iteration < finalConfig.maxIterations && !convergence) {
      const batchConcepts = this.getBatchConcepts(teacher, finalConfig.batchSize);
      
      for (const concept of batchConcepts) {
        const teacherEmbedding = teacher.embeddings.get(concept);
        if (!teacherEmbedding) continue;
        
        const studentEmbedding = student.embeddings.get(concept);
        if (!studentEmbedding) continue;
        
        // Calculate distillation loss
        const distillationLoss = this.calculateDistillationLoss(
          teacherEmbedding,
          studentEmbedding,
          finalConfig
        );
        
        // Update student embedding
        const updatedEmbedding = this.updateEmbedding(
          studentEmbedding,
          teacherEmbedding,
          distillationLoss,
          finalConfig
        );
        
        distilledEmbeddings.set(concept, updatedEmbedding);
      }
      
      // Check convergence
      convergence = this.checkConvergence(distilledEmbeddings, student.embeddings);
      iteration++;
      
      if (iteration % 10 === 0) {
        console.warn(`🔄 Distillation iteration ${iteration}/${finalConfig.maxIterations}`);
      }
    }
    
    // Distill relationships
    this.distillRelationships(teacher, student, distilledRelationships, finalConfig);
    
    // Calculate quality metrics
    const qualityMetrics = this.calculateQualityMetrics(
      teacher,
      student,
      distilledEmbeddings,
      distilledRelationships
    );
    
    const distillationTime = Date.now() - startTime;
    
    const result: DistillationResult = {
      teacherId,
      studentId,
      distilledEmbeddings,
      distilledRelationships,
      qualityMetrics,
      distillationTime,
      iterations: iteration,
      convergence
    };
    
    this.distillationHistory.push(result);
    
    console.warn(`✅ Knowledge distillation completed: ${iteration} iterations, ${distillationTime}ms`);
    return result;
  }

  /**
   * Get batch of concepts for distillation
   */
  private getBatchConcepts(teacher: TeacherModel, batchSize: number): string[] {
    const concepts = Array.from(teacher.embeddings.keys());
    const shuffled = concepts.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(batchSize, concepts.length));
  }

  /**
   * Calculate distillation loss
   */
  private calculateDistillationLoss(
    teacherEmbedding: number[],
    studentEmbedding: number[],
    config: DistillationConfig
  ): number {
    // Soft distillation loss with temperature
    const teacherSoft = this.softmax(teacherEmbedding, config.temperature);
    const studentSoft = this.softmax(studentEmbedding, config.temperature);
    
    // KL divergence between teacher and student
    const klDivergence = this.calculateKLDivergence(teacherSoft, studentSoft);
    
    // Hard distillation loss
    const hardLoss = this.calculateHardLoss(teacherEmbedding, studentEmbedding);
    
    // Combined loss
    return config.alpha * klDivergence + config.beta * hardLoss;
  }

  /**
   * Apply softmax with temperature
   */
  private softmax(embedding: number[], temperature: number): number[] {
    const scaled = embedding.map(val => val / temperature);
    const maxVal = Math.max(...scaled);
    const exp = scaled.map(val => Math.exp(val - maxVal));
    const sum = exp.reduce((acc, val) => acc + val, 0);
    
    return exp.map(val => val / sum);
  }

  /**
   * Calculate KL divergence
   */
  private calculateKLDivergence(p: number[], q: number[]): number {
    let klDiv = 0;
    
    for (let i = 0; i < p.length; i++) {
      if (p[i] > 0 && q[i] > 0) {
        klDiv += p[i] * Math.log(p[i] / q[i]);
      }
    }
    
    return klDiv;
  }

  /**
   * Calculate hard loss
   */
  private calculateHardLoss(teacherEmbedding: number[], studentEmbedding: number[]): number {
    let loss = 0;
    
    for (let i = 0; i < teacherEmbedding.length; i++) {
      const diff = teacherEmbedding[i] - studentEmbedding[i];
      loss += diff * diff;
    }
    
    return loss / teacherEmbedding.length;
  }

  /**
   * Update embedding based on distillation loss
   */
  private updateEmbedding(
    studentEmbedding: number[],
    teacherEmbedding: number[],
    loss: number,
    config: DistillationConfig
  ): number[] {
    const updatedEmbedding = [...studentEmbedding];
    
    // Gradient-based update
    for (let i = 0; i < updatedEmbedding.length; i++) {
      const gradient = (teacherEmbedding[i] - studentEmbedding[i]) * loss;
      updatedEmbedding[i] += config.learningRate * gradient;
      
      // Apply regularization
      updatedEmbedding[i] -= config.regularization * updatedEmbedding[i];
    }
    
    return updatedEmbedding;
  }

  /**
   * Check convergence
   */
  private checkConvergence(
    distilledEmbeddings: Map<string, number[]>,
    originalEmbeddings: Map<string, number[]>
  ): boolean {
    let totalChange = 0;
    let comparisonCount = 0;
    
    for (const [concept, distilledEmbedding] of distilledEmbeddings) {
      const originalEmbedding = originalEmbeddings.get(concept);
      if (!originalEmbedding) continue;
      
      let change = 0;
      for (let i = 0; i < distilledEmbedding.length; i++) {
        const diff = distilledEmbedding[i] - originalEmbedding[i];
        change += diff * diff;
      }
      
      totalChange += Math.sqrt(change);
      comparisonCount++;
    }
    
    const averageChange = comparisonCount > 0 ? totalChange / comparisonCount : 0;
    return averageChange < 0.001; // Convergence threshold
  }

  /**
   * Distill relationships
   */
  private distillRelationships(
    teacher: TeacherModel,
    student: StudentModel,
    distilledRelationships: Array<{source: string, target: string, type: string, strength: number}>,
    config: DistillationConfig
  ): void {
    for (const teacherRel of teacher.relationships) {
      const studentRel = student.relationships.find(
        rel => rel.source === teacherRel.source && rel.target === teacherRel.target
      );
      
      if (studentRel) {
        // Distill relationship strength
        const distilledStrength = config.alpha * teacherRel.strength + 
                                config.beta * studentRel.strength;
        
        distilledRelationships.push({
          source: teacherRel.source,
          target: teacherRel.target,
          type: teacherRel.type,
          strength: distilledStrength
        });
      }
    }
  }

  /**
   * Calculate quality metrics
   */
  private calculateQualityMetrics(
    teacher: TeacherModel,
    student: StudentModel,
    distilledEmbeddings: Map<string, number[]>,
    distilledRelationships: Array<{source: string, target: string, type: string, strength: number}>
  ): DistillationResult['qualityMetrics'] {
    // Fidelity: How well the student preserves teacher knowledge
    const fidelity = this.calculateFidelity(teacher, distilledEmbeddings);
    
    // Compression: How much the model was compressed
    const compression = this.calculateCompression(teacher, student);
    
    // Efficiency: Performance per unit of complexity
    const efficiency = this.calculateEfficiency(teacher, student, distilledEmbeddings);
    
    // Accuracy: How accurate the distilled model is
    const accuracy = this.calculateAccuracy(teacher, student, distilledEmbeddings);
    
    return {
      fidelity,
      compression,
      efficiency,
      accuracy
    };
  }

  /**
   * Calculate fidelity
   */
  private calculateFidelity(
    teacher: TeacherModel,
    distilledEmbeddings: Map<string, number[]>
  ): number {
    let totalFidelity = 0;
    let comparisonCount = 0;
    
    for (const [concept, distilledEmbedding] of distilledEmbeddings) {
      const teacherEmbedding = teacher.embeddings.get(concept);
      if (!teacherEmbedding) continue;
      
      const similarity = this.calculateCosineSimilarity(teacherEmbedding, distilledEmbedding);
      totalFidelity += similarity;
      comparisonCount++;
    }
    
    return comparisonCount > 0 ? totalFidelity / comparisonCount : 0;
  }

  /**
   * Calculate compression ratio
   */
  private calculateCompression(teacher: TeacherModel, student: StudentModel): number {
    const teacherComplexity = teacher.complexity;
    const studentComplexity = student.complexity;
    
    return teacherComplexity / studentComplexity;
  }

  /**
   * Calculate efficiency
   */
  private calculateEfficiency(
    teacher: TeacherModel,
    student: StudentModel,
    distilledEmbeddings: Map<string, number[]>
  ): number {
    const teacherPerformance = teacher.performance;
    const studentPerformance = student.performance;
    const compression = this.calculateCompression(teacher, student);
    
    return (studentPerformance / teacherPerformance) * compression;
  }

  /**
   * Calculate accuracy
   */
  private calculateAccuracy(
    teacher: TeacherModel,
    student: StudentModel,
    distilledEmbeddings: Map<string, number[]>
  ): number {
    // Simple accuracy metric - in reality, you'd use proper evaluation
    const fidelity = this.calculateFidelity(teacher, distilledEmbeddings);
    const studentPerformance = student.performance;
    
    return (fidelity + studentPerformance) / 2;
  }

  /**
   * Calculate cosine similarity
   */
  private calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
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
   * Ensemble distillation from multiple teachers
   */
  async ensembleDistill(
    teacherIds: string[],
    studentId: string,
    method: EnsembleDistillation['method'] = 'weighted',
    weights?: number[]
  ): Promise<EnsembleDistillation> {
    const teachers = teacherIds.map(id => this.teachers.get(id)).filter(Boolean) as TeacherModel[];
    const student = this.students.get(studentId);
    
    if (!student || teachers.length === 0) {
      throw new Error('Teachers or student not found');
    }
    
    // Calculate weights if not provided
    const finalWeights = weights || this.calculateEnsembleWeights(teachers);
    
    console.warn(`🧠 Starting ensemble distillation: ${teachers.length} teachers → ${student.name}`);
    
    // Perform ensemble distillation
    const result = await this.performEnsembleDistillation(teachers, student, method, finalWeights);
    
    const ensembleDistillation: EnsembleDistillation = {
      teachers: teacherIds,
      student: studentId,
      weights: finalWeights,
      method,
      result
    };
    
    this.ensembleDistillations.push(ensembleDistillation);
    
    console.warn(`✅ Ensemble distillation completed`);
    return ensembleDistillation;
  }

  /**
   * Calculate ensemble weights
   */
  private calculateEnsembleWeights(teachers: TeacherModel[]): number[] {
    const totalPerformance = teachers.reduce((sum, teacher) => sum + teacher.performance, 0);
    return teachers.map(teacher => teacher.performance / totalPerformance);
  }

  /**
   * Perform ensemble distillation
   */
  private async performEnsembleDistillation(
    teachers: TeacherModel[],
    student: StudentModel,
    method: EnsembleDistillation['method'],
    weights: number[]
  ): Promise<DistillationResult> {
    const startTime = Date.now();
    
    const distilledEmbeddings = new Map<string, number[]>();
    const distilledRelationships: Array<{source: string, target: string, type: string, strength: number}> = [];
    
    // Get all concepts from teachers
    const allConcepts = new Set<string>();
    for (const teacher of teachers) {
      for (const concept of teacher.embeddings.keys()) {
        allConcepts.add(concept);
      }
    }
    
    // Distill each concept
    for (const concept of allConcepts) {
      const teacherEmbeddings = teachers
        .map(teacher => teacher.embeddings.get(concept))
        .filter(Boolean) as number[][];
      
      if (teacherEmbeddings.length === 0) continue;
      
      let distilledEmbedding: number[];
      
      switch (method) {
        case 'average':
          distilledEmbedding = this.averageEmbeddings(teacherEmbeddings);
          break;
        case 'weighted':
          distilledEmbedding = this.weightedAverageEmbeddings(teacherEmbeddings, weights);
          break;
        case 'hierarchical':
          distilledEmbedding = this.hierarchicalDistillation(teacherEmbeddings, weights);
          break;
        case 'progressive':
          distilledEmbedding = this.progressiveDistillation(teacherEmbeddings, weights);
          break;
        default:
          distilledEmbedding = this.averageEmbeddings(teacherEmbeddings);
      }
      
      distilledEmbeddings.set(concept, distilledEmbedding);
    }
    
    // Distill relationships
    this.distillEnsembleRelationships(teachers, distilledRelationships, weights);
    
    // Calculate quality metrics
    const qualityMetrics = this.calculateEnsembleQualityMetrics(teachers, student, distilledEmbeddings);
    
    const distillationTime = Date.now() - startTime;
    
    return {
      teacherId: teachers[0].id, // Use first teacher as primary
      studentId: student.id,
      distilledEmbeddings,
      distilledRelationships,
      qualityMetrics,
      distillationTime,
      iterations: 1,
      convergence: true
    };
  }

  /**
   * Average embeddings
   */
  private averageEmbeddings(embeddings: number[][]): number[] {
    const length = embeddings[0].length;
    const averaged = new Array(length).fill(0);
    
    for (const embedding of embeddings) {
      for (let i = 0; i < length; i++) {
        averaged[i] += embedding[i];
      }
    }
    
    return averaged.map(val => val / embeddings.length);
  }

  /**
   * Weighted average embeddings
   */
  private weightedAverageEmbeddings(embeddings: number[][], weights: number[]): number[] {
    const length = embeddings[0].length;
    const weighted = new Array(length).fill(0);
    
    for (let i = 0; i < embeddings.length; i++) {
      const weight = weights[i] || 1 / embeddings.length;
      for (let j = 0; j < length; j++) {
        weighted[j] += embeddings[i][j] * weight;
      }
    }
    
    return weighted;
  }

  /**
   * Hierarchical distillation
   */
  private hierarchicalDistillation(embeddings: number[][], weights: number[]): number[] {
    // Multi-level hierarchical distillation
    if (embeddings.length === 1) return embeddings[0];
    
    // First level: pair-wise distillation
    const pairs: number[][] = [];
    for (let i = 0; i < embeddings.length; i += 2) {
      if (i + 1 < embeddings.length) {
        pairs.push(this.distillPair(embeddings[i], embeddings[i + 1]));
      } else {
        pairs.push(embeddings[i]);
      }
    }
    
    // Recursive distillation
    return this.hierarchicalDistillation(pairs, weights.slice(0, pairs.length));
  }

  /**
   * Progressive distillation
   */
  private progressiveDistillation(embeddings: number[][], weights: number[]): number[] {
    // Progressive distillation with increasing complexity
    let result = embeddings[0];
    
    for (let i = 1; i < embeddings.length; i++) {
      const alpha = weights[i] || 1 / embeddings.length;
      result = this.interpolateEmbeddings(result, embeddings[i], alpha);
    }
    
    return result;
  }

  /**
   * Distill pair of embeddings
   */
  private distillPair(embedding1: number[], embedding2: number[]): number[] {
    // Simple pair distillation
    return embedding1.map((val, i) => (val + embedding2[i]) / 2);
  }

  /**
   * Interpolate embeddings
   */
  private interpolateEmbeddings(embedding1: number[], embedding2: number[], alpha: number): number[] {
    return embedding1.map((val, i) => alpha * val + (1 - alpha) * embedding2[i]);
  }

  /**
   * Distill ensemble relationships
   */
  private distillEnsembleRelationships(
    teachers: TeacherModel[],
    distilledRelationships: Array<{source: string, target: string, type: string, strength: number}>,
    weights: number[]
  ): void {
    // Collect all relationships
    const allRelationships = new Map<string, Array<{source: string, target: string, type: string, strength: number}>>();
    
    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      const weight = weights[i] || 1 / teachers.length;
      
      for (const rel of teacher.relationships) {
        const key = `${rel.source}-${rel.target}`;
        if (!allRelationships.has(key)) {
          allRelationships.set(key, []);
        }
        allRelationships.get(key)!.push({ ...rel, strength: rel.strength * weight });
      }
    }
    
    // Average relationships
    for (const [key, relationships] of allRelationships) {
      if (relationships.length === 0) continue;
      
      const avgStrength = relationships.reduce((sum, rel) => sum + rel.strength, 0) / relationships.length;
      const mostCommonType = this.getMostCommonType(relationships);
      
      distilledRelationships.push({
        source: relationships[0].source,
        target: relationships[0].target,
        type: mostCommonType,
        strength: avgStrength
      });
    }
  }

  /**
   * Get most common relationship type
   */
  private getMostCommonType(relationships: Array<{type: string}>): string {
    const typeCounts = new Map<string, number>();
    
    for (const rel of relationships) {
      typeCounts.set(rel.type, (typeCounts.get(rel.type) || 0) + 1);
    }
    
    let mostCommon = '';
    let maxCount = 0;
    
    for (const [type, count] of typeCounts) {
      if (count > maxCount) {
        mostCommon = type;
        maxCount = count;
      }
    }
    
    return mostCommon;
  }

  /**
   * Calculate ensemble quality metrics
   */
  private calculateEnsembleQualityMetrics(
    teachers: TeacherModel[],
    student: StudentModel,
    distilledEmbeddings: Map<string, number[]>
  ): DistillationResult['qualityMetrics'] {
    // Calculate metrics for ensemble distillation
    const fidelity = this.calculateEnsembleFidelity(teachers, distilledEmbeddings);
    const compression = this.calculateEnsembleCompression(teachers, student);
    const efficiency = this.calculateEnsembleEfficiency(teachers, student, distilledEmbeddings);
    const accuracy = this.calculateEnsembleAccuracy(teachers, student, distilledEmbeddings);
    
    return {
      fidelity,
      compression,
      efficiency,
      accuracy
    };
  }

  /**
   * Calculate ensemble fidelity
   */
  private calculateEnsembleFidelity(
    teachers: TeacherModel[],
    distilledEmbeddings: Map<string, number[]>
  ): number {
    let totalFidelity = 0;
    let comparisonCount = 0;
    
    for (const [concept, distilledEmbedding] of distilledEmbeddings) {
      let conceptFidelity = 0;
      let teacherCount = 0;
      
      for (const teacher of teachers) {
        const teacherEmbedding = teacher.embeddings.get(concept);
        if (teacherEmbedding) {
          const similarity = this.calculateCosineSimilarity(teacherEmbedding, distilledEmbedding);
          conceptFidelity += similarity;
          teacherCount++;
        }
      }
      
      if (teacherCount > 0) {
        totalFidelity += conceptFidelity / teacherCount;
        comparisonCount++;
      }
    }
    
    return comparisonCount > 0 ? totalFidelity / comparisonCount : 0;
  }

  /**
   * Calculate ensemble compression
   */
  private calculateEnsembleCompression(teachers: TeacherModel[], student: StudentModel): number {
    const totalTeacherComplexity = teachers.reduce((sum, teacher) => sum + teacher.complexity, 0);
    const avgTeacherComplexity = totalTeacherComplexity / teachers.length;
    
    return avgTeacherComplexity / student.complexity;
  }

  /**
   * Calculate ensemble efficiency
   */
  private calculateEnsembleEfficiency(
    teachers: TeacherModel[],
    student: StudentModel,
    distilledEmbeddings: Map<string, number[]>
  ): number {
    const avgTeacherPerformance = teachers.reduce((sum, teacher) => sum + teacher.performance, 0) / teachers.length;
    const compression = this.calculateEnsembleCompression(teachers, student);
    
    return (student.performance / avgTeacherPerformance) * compression;
  }

  /**
   * Calculate ensemble accuracy
   */
  private calculateEnsembleAccuracy(
    teachers: TeacherModel[],
    student: StudentModel,
    distilledEmbeddings: Map<string, number[]>
  ): number {
    const fidelity = this.calculateEnsembleFidelity(teachers, distilledEmbeddings);
    const studentPerformance = student.performance;
    
    return (fidelity + studentPerformance) / 2;
  }

  /**
   * Get distillation history
   */
  getDistillationHistory(): DistillationResult[] {
    return [...this.distillationHistory];
  }

  /**
   * Get ensemble distillations
   */
  getEnsembleDistillations(): EnsembleDistillation[] {
    return [...this.ensembleDistillations];
  }

  /**
   * Get teacher models
   */
  getTeachers(): TeacherModel[] {
    return Array.from(this.teachers.values());
  }

  /**
   * Get student models
   */
  getStudents(): StudentModel[] {
    return Array.from(this.students.values());
  }
}
