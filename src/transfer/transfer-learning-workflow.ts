#!/usr/bin/env tsx

/**
 * Transfer Learning Workflow
 * 
 * This module provides comprehensive transfer learning workflows:
 * - End-to-end transfer learning pipelines
 * - Multi-domain knowledge transfer
 * - Progressive transfer learning
 * - Transfer learning evaluation
 * - Workflow orchestration
 */

import { DomainAdaptationSystem, Domain, DomainMapping, AdaptationResult } from './domain-adaptation.js';
import { KnowledgeDistillationSystem, TeacherModel, StudentModel, DistillationResult } from './knowledge-distillation.js';

export interface TransferLearningConfig {
  sourceDomains: string[];
  targetDomain: string;
  adaptationStrategy: 'direct' | 'indirect' | 'hierarchical' | 'multi_step';
  distillationMethod: 'single' | 'ensemble' | 'progressive';
  evaluationMetrics: string[];
  maxIterations: number;
  convergenceThreshold: number;
  learningRate: number;
  regularization: number;
}

export interface TransferLearningResult {
  config: TransferLearningConfig;
  adaptationResults: AdaptationResult[];
  distillationResults: DistillationResult[];
  overallMetrics: {
    transferSuccess: number;
    knowledgeRetention: number;
    domainAlignment: number;
    efficiency: number;
    quality: number;
  };
  recommendations: string[];
  executionTime: number;
  iterations: number;
  convergence: boolean;
}

export interface ProgressiveTransferStep {
  step: number;
  sourceDomain: string;
  targetDomain: string;
  adaptationResult: AdaptationResult;
  distillationResult: DistillationResult;
  cumulativeMetrics: {
    knowledgeRetention: number;
    domainAlignment: number;
    efficiency: number;
  };
}

export interface MultiDomainTransfer {
  sourceDomains: string[];
  targetDomain: string;
  transferResults: Map<string, TransferLearningResult>;
  crossDomainInsights: string[];
  domainSimilarities: Map<string, number>;
  overallSuccess: number;
}

export class TransferLearningWorkflow {
  private domainAdaptation: DomainAdaptationSystem;
  private knowledgeDistillation: KnowledgeDistillationSystem;
  private workflowHistory: Array<TransferLearningResult> = [];
  private progressiveSteps: Array<ProgressiveTransferStep> = [];

  constructor() {
    this.domainAdaptation = new DomainAdaptationSystem();
    this.knowledgeDistillation = new KnowledgeDistillationSystem();
    console.log('🔄 Transfer Learning Workflow initialized');
  }

  /**
   * Execute transfer learning workflow
   */
  async executeTransferLearning(config: TransferLearningConfig): Promise<TransferLearningResult> {
    const startTime = Date.now();
    console.log(`🚀 Starting transfer learning workflow: ${config.sourceDomains.join(', ')} → ${config.targetDomain}`);
    
    const adaptationResults: AdaptationResult[] = [];
    const distillationResults: DistillationResult[] = [];
    
    // Step 1: Domain Adaptation
    console.log('\n📊 Step 1: Domain Adaptation');
    for (const sourceDomain of config.sourceDomains) {
      try {
        const adaptationResult = await this.domainAdaptation.transferKnowledge(sourceDomain, config.targetDomain);
        adaptationResults.push(adaptationResult);
        console.log(`✅ Domain adaptation completed: ${sourceDomain} → ${config.targetDomain}`);
      } catch (error) {
        console.error(`❌ Domain adaptation failed: ${sourceDomain} → ${config.targetDomain}`, error);
      }
    }
    
    // Step 2: Knowledge Distillation
    console.log('\n📊 Step 2: Knowledge Distillation');
    if (config.distillationMethod === 'ensemble') {
      const ensembleResult = await this.executeEnsembleDistillation(config, adaptationResults);
      distillationResults.push(ensembleResult);
    } else {
      for (const adaptationResult of adaptationResults) {
        try {
          const distillationResult = await this.executeSingleDistillation(adaptationResult, config);
          distillationResults.push(distillationResult);
        } catch (error) {
          console.error(`❌ Knowledge distillation failed:`, error);
        }
      }
    }
    
    // Step 3: Evaluation and Metrics
    console.log('\n📊 Step 3: Evaluation and Metrics');
    const overallMetrics = this.calculateOverallMetrics(adaptationResults, distillationResults);
    const recommendations = this.generateRecommendations(adaptationResults, distillationResults, overallMetrics);
    
    const executionTime = Date.now() - startTime;
    const convergence = this.checkConvergence(adaptationResults, distillationResults, config);
    
    const result: TransferLearningResult = {
      config,
      adaptationResults,
      distillationResults,
      overallMetrics,
      recommendations,
      executionTime,
      iterations: this.calculateTotalIterations(adaptationResults, distillationResults),
      convergence
    };
    
    this.workflowHistory.push(result);
    
    console.log(`✅ Transfer learning workflow completed: ${executionTime}ms`);
    return result;
  }

  /**
   * Execute ensemble distillation
   */
  private async executeEnsembleDistillation(
    config: TransferLearningConfig,
    adaptationResults: AdaptationResult[]
  ): Promise<DistillationResult> {
    // Create teacher models from adaptation results
    const teachers: TeacherModel[] = [];
    for (let i = 0; i < adaptationResults.length; i++) {
      const result = adaptationResults[i];
      const teacher: TeacherModel = {
        id: `teacher_${result.sourceDomain}`,
        name: `Teacher from ${result.sourceDomain}`,
        domain: result.sourceDomain,
        embeddings: result.adaptedEmbeddings,
        relationships: result.distilledRelationships,
        performance: result.transferMetrics.accuracy,
        complexity: result.adaptedEmbeddings.size,
        metadata: { source: result.sourceDomain, target: result.targetDomain }
      };
      
      this.knowledgeDistillation.registerTeacher(teacher);
      teachers.push(teacher);
    }
    
    // Create student model
    const targetDomain = this.domainAdaptation.getDomain(config.targetDomain);
    if (!targetDomain) {
      throw new Error(`Target domain not found: ${config.targetDomain}`);
    }
    
    const student: StudentModel = {
      id: `student_${config.targetDomain}`,
      name: `Student for ${config.targetDomain}`,
      domain: config.targetDomain,
      embeddings: targetDomain.embeddings,
      relationships: targetDomain.relationships,
      performance: 0.5, // Will be updated after distillation
      complexity: targetDomain.embeddings.size,
      metadata: { target: config.targetDomain }
    };
    
    this.knowledgeDistillation.registerStudent(student);
    
    // Perform ensemble distillation
    const teacherIds = teachers.map(t => t.id);
    const ensembleResult = await this.knowledgeDistillation.ensembleDistill(
      teacherIds,
      student.id,
      'weighted'
    );
    
    return ensembleResult.result;
  }

  /**
   * Execute single distillation
   */
  private async executeSingleDistillation(
    adaptationResult: AdaptationResult,
    config: TransferLearningConfig
  ): Promise<DistillationResult> {
    // Create teacher model
    const teacher: TeacherModel = {
      id: `teacher_${adaptationResult.sourceDomain}`,
      name: `Teacher from ${adaptationResult.sourceDomain}`,
      domain: adaptationResult.sourceDomain,
      embeddings: adaptationResult.adaptedEmbeddings,
      relationships: adaptationResult.distilledRelationships,
      performance: adaptationResult.transferMetrics.accuracy,
      complexity: adaptationResult.adaptedEmbeddings.size,
      metadata: { source: adaptationResult.sourceDomain, target: adaptationResult.targetDomain }
    };
    
    this.knowledgeDistillation.registerTeacher(teacher);
    
    // Create student model
    const targetDomain = this.domainAdaptation.getDomain(adaptationResult.targetDomain);
    if (!targetDomain) {
      throw new Error(`Target domain not found: ${adaptationResult.targetDomain}`);
    }
    
    const student: StudentModel = {
      id: `student_${adaptationResult.targetDomain}`,
      name: `Student for ${adaptationResult.targetDomain}`,
      domain: adaptationResult.targetDomain,
      embeddings: targetDomain.embeddings,
      relationships: targetDomain.relationships,
      performance: 0.5,
      complexity: targetDomain.embeddings.size,
      metadata: { target: adaptationResult.targetDomain }
    };
    
    this.knowledgeDistillation.registerStudent(student);
    
    // Perform distillation
    const distillationResult = await this.knowledgeDistillation.distillKnowledge(
      teacher.id,
      student.id,
      {
        temperature: 3.0,
        alpha: 0.7,
        beta: 0.3,
        maxIterations: config.maxIterations,
        learningRate: config.learningRate,
        regularization: config.regularization
      }
    );
    
    return distillationResult;
  }

  /**
   * Calculate overall metrics
   */
  private calculateOverallMetrics(
    adaptationResults: AdaptationResult[],
    distillationResults: DistillationResult[]
  ): TransferLearningResult['overallMetrics'] {
    // Transfer success: percentage of successful transfers
    const transferSuccess = adaptationResults.length > 0 
      ? adaptationResults.filter(r => r.adaptedConcepts.length > 0).length / adaptationResults.length
      : 0;
    
    // Knowledge retention: average fidelity from distillation
    const knowledgeRetention = distillationResults.length > 0
      ? distillationResults.reduce((sum, r) => sum + r.qualityMetrics.fidelity, 0) / distillationResults.length
      : 0;
    
    // Domain alignment: average similarity from adaptation
    const domainAlignment = adaptationResults.length > 0
      ? adaptationResults.reduce((sum, r) => sum + r.transferMetrics.similarity, 0) / adaptationResults.length
      : 0;
    
    // Efficiency: average efficiency from adaptation
    const efficiency = adaptationResults.length > 0
      ? adaptationResults.reduce((sum, r) => sum + r.transferMetrics.efficiency, 0) / adaptationResults.length
      : 0;
    
    // Quality: average accuracy from distillation
    const quality = distillationResults.length > 0
      ? distillationResults.reduce((sum, r) => sum + r.qualityMetrics.accuracy, 0) / distillationResults.length
      : 0;
    
    return {
      transferSuccess,
      knowledgeRetention,
      domainAlignment,
      efficiency,
      quality
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    adaptationResults: AdaptationResult[],
    distillationResults: DistillationResult[],
    overallMetrics: TransferLearningResult['overallMetrics']
  ): string[] {
    const recommendations: string[] = [];
    
    if (overallMetrics.transferSuccess < 0.5) {
      recommendations.push('Consider using more similar source domains for better transfer success');
    }
    
    if (overallMetrics.knowledgeRetention < 0.7) {
      recommendations.push('Improve distillation parameters to increase knowledge retention');
    }
    
    if (overallMetrics.domainAlignment < 0.6) {
      recommendations.push('Use domain adaptation techniques to improve domain alignment');
    }
    
    if (overallMetrics.efficiency < 0.5) {
      recommendations.push('Optimize transfer learning parameters for better efficiency');
    }
    
    if (overallMetrics.quality < 0.8) {
      recommendations.push('Fine-tune the target domain model for better quality');
    }
    
    // Specific recommendations based on results
    for (const result of adaptationResults) {
      if (result.failedConcepts.length > result.adaptedConcepts.length) {
        recommendations.push(`High failure rate in ${result.sourceDomain} → ${result.targetDomain} transfer`);
      }
    }
    
    for (const result of distillationResults) {
      if (result.qualityMetrics.compression < 0.5) {
        recommendations.push('Consider using a more compressed student model');
      }
    }
    
    return recommendations;
  }

  /**
   * Check convergence
   */
  private checkConvergence(
    adaptationResults: AdaptationResult[],
    distillationResults: DistillationResult[],
    config: TransferLearningConfig
  ): boolean {
    // Check adaptation convergence
    const adaptationConverged = adaptationResults.every(result => 
      result.transferMetrics.similarity > config.convergenceThreshold
    );
    
    // Check distillation convergence
    const distillationConverged = distillationResults.every(result => 
      result.convergence
    );
    
    return adaptationConverged && distillationConverged;
  }

  /**
   * Calculate total iterations
   */
  private calculateTotalIterations(
    adaptationResults: AdaptationResult[],
    distillationResults: DistillationResult[]
  ): number {
    const adaptationIterations = adaptationResults.reduce((sum, result) => sum + result.transferMetrics.efficiency, 0);
    const distillationIterations = distillationResults.reduce((sum, result) => sum + result.iterations, 0);
    
    return Math.round(adaptationIterations + distillationIterations);
  }

  /**
   * Execute progressive transfer learning
   */
  async executeProgressiveTransfer(
    sourceDomains: string[],
    targetDomain: string,
    config: Partial<TransferLearningConfig> = {}
  ): Promise<ProgressiveTransferStep[]> {
    console.log(`🔄 Starting progressive transfer learning: ${sourceDomains.join(' → ')} → ${targetDomain}`);
    
    const progressiveSteps: ProgressiveTransferStep[] = [];
    let cumulativeMetrics = {
      knowledgeRetention: 0,
      domainAlignment: 0,
      efficiency: 0
    };
    
    for (let i = 0; i < sourceDomains.length; i++) {
      const sourceDomain = sourceDomains[i];
      const stepConfig: TransferLearningConfig = {
        sourceDomains: [sourceDomain],
        targetDomain,
        adaptationStrategy: 'hierarchical',
        distillationMethod: 'single',
        evaluationMetrics: ['fidelity', 'compression', 'efficiency'],
        maxIterations: 50,
        convergenceThreshold: 0.7,
        learningRate: 0.01,
        regularization: 0.001,
        ...config
      };
      
      console.log(`📊 Progressive step ${i + 1}: ${sourceDomain} → ${targetDomain}`);
      
      try {
        const result = await this.executeTransferLearning(stepConfig);
        
        // Update cumulative metrics
        cumulativeMetrics.knowledgeRetention = (cumulativeMetrics.knowledgeRetention + result.overallMetrics.knowledgeRetention) / 2;
        cumulativeMetrics.domainAlignment = (cumulativeMetrics.domainAlignment + result.overallMetrics.domainAlignment) / 2;
        cumulativeMetrics.efficiency = (cumulativeMetrics.efficiency + result.overallMetrics.efficiency) / 2;
        
        const step: ProgressiveTransferStep = {
          step: i + 1,
          sourceDomain,
          targetDomain,
          adaptationResult: result.adaptationResults[0],
          distillationResult: result.distillationResults[0],
          cumulativeMetrics: { ...cumulativeMetrics }
        };
        
        progressiveSteps.push(step);
        
        console.log(`✅ Progressive step ${i + 1} completed`);
        
      } catch (error) {
        console.error(`❌ Progressive step ${i + 1} failed:`, error);
      }
    }
    
    this.progressiveSteps.push(...progressiveSteps);
    console.log(`✅ Progressive transfer learning completed: ${progressiveSteps.length} steps`);
    
    return progressiveSteps;
  }

  /**
   * Execute multi-domain transfer learning
   */
  async executeMultiDomainTransfer(
    sourceDomains: string[],
    targetDomain: string,
    config: Partial<TransferLearningConfig> = {}
  ): Promise<MultiDomainTransfer> {
    console.log(`🌐 Starting multi-domain transfer learning: ${sourceDomains.join(', ')} → ${targetDomain}`);
    
    const transferResults = new Map<string, TransferLearningResult>();
    const domainSimilarities = new Map<string, number>();
    const crossDomainInsights: string[] = [];
    
    // Calculate domain similarities
    for (const sourceDomain of sourceDomains) {
      const similarity = this.domainAdaptation.calculateDomainSimilarity(sourceDomain, targetDomain);
      domainSimilarities.set(sourceDomain, similarity);
    }
    
    // Execute transfer learning for each source domain
    for (const sourceDomain of sourceDomains) {
      const stepConfig: TransferLearningConfig = {
        sourceDomains: [sourceDomain],
        targetDomain,
        adaptationStrategy: 'direct',
        distillationMethod: 'single',
        evaluationMetrics: ['fidelity', 'compression', 'efficiency'],
        maxIterations: 100,
        convergenceThreshold: 0.8,
        learningRate: 0.01,
        regularization: 0.001,
        ...config
      };
      
      try {
        const result = await this.executeTransferLearning(stepConfig);
        transferResults.set(sourceDomain, result);
        
        // Generate cross-domain insights
        if (result.overallMetrics.transferSuccess > 0.8) {
          crossDomainInsights.push(`Strong transfer from ${sourceDomain} to ${targetDomain}`);
        } else if (result.overallMetrics.transferSuccess < 0.3) {
          crossDomainInsights.push(`Weak transfer from ${sourceDomain} to ${targetDomain} - consider different approach`);
        }
        
      } catch (error) {
        console.error(`❌ Multi-domain transfer failed for ${sourceDomain}:`, error);
      }
    }
    
    // Calculate overall success
    const overallSuccess = transferResults.size > 0
      ? Array.from(transferResults.values()).reduce((sum, result) => sum + result.overallMetrics.transferSuccess, 0) / transferResults.size
      : 0;
    
    const multiDomainTransfer: MultiDomainTransfer = {
      sourceDomains,
      targetDomain,
      transferResults,
      crossDomainInsights,
      domainSimilarities,
      overallSuccess
    };
    
    console.log(`✅ Multi-domain transfer learning completed: ${overallSuccess.toFixed(2)} overall success`);
    return multiDomainTransfer;
  }

  /**
   * Get workflow history
   */
  getWorkflowHistory(): TransferLearningResult[] {
    return [...this.workflowHistory];
  }

  /**
   * Get progressive steps
   */
  getProgressiveSteps(): ProgressiveTransferStep[] {
    return [...this.progressiveSteps];
  }

  /**
   * Get domain adaptation system
   */
  getDomainAdaptation(): DomainAdaptationSystem {
    return this.domainAdaptation;
  }

  /**
   * Get knowledge distillation system
   */
  getKnowledgeDistillation(): KnowledgeDistillationSystem {
    return this.knowledgeDistillation;
  }

  /**
   * Clear workflow history
   */
  clearHistory(): void {
    this.workflowHistory = [];
    this.progressiveSteps = [];
    console.log('🧹 Transfer learning workflow history cleared');
  }
}
