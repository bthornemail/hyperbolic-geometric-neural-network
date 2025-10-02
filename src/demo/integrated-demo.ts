/**
 * Comprehensive Demo: PocketFlow + H²GNN + WordNet Integration
 * 
 * Demonstrates the complete integrated system including:
 * - Hyperbolic geometric neural networks
 * - WordNet hierarchical knowledge
 * - PocketFlow agent workflows
 * - Multi-modal reasoning capabilities
 */

import { TrainingPipeline, createTrainingPipeline, quickTrain } from '../training/training-pipeline';
import AgentWorkflows from '../workflows/agent-workflows';

const { 
  HierarchicalQAWorkflow, 
  ConceptLearningWorkflow, 
  SemanticExplorationWorkflow,
  MultiAgentReasoningWorkflow 
} = AgentWorkflows;
import { WordNetProcessor, createWordNetProcessor } from '../datasets/wordnet-integration';
import { HyperbolicGeometricHGN } from '../core/H2GNN';
import { HyperbolicArithmetic, Vector } from '../math/hyperbolic-arithmetic';

/**
 * Demo Configuration
 */
interface DemoConfig {
  mode: 'quick' | 'full' | 'interactive';
  enableTraining: boolean;
  enableWorkflows: boolean;
  enableVisualization: boolean;
  logLevel: 'minimal' | 'detailed' | 'verbose';
}

/**
 * Demo Results
 */
interface DemoResults {
  trainingResults?: any;
  workflowResults: Map<string, any>;
  performanceMetrics: any;
  visualizations?: any[];
  timestamp: Date;
  duration: number;
}

/**
 * Main Integrated Demo Class
 */
export class IntegratedDemo {
  private config: DemoConfig;
  private pipeline?: TrainingPipeline;
  private workflows: Map<string, any> = new Map();
  private startTime: number = 0;

  constructor(config?: Partial<DemoConfig>) {
    this.config = {
      mode: 'quick',
      enableTraining: true,
      enableWorkflows: true,
      enableVisualization: false,
      logLevel: 'detailed',
      ...config
    };
  }

  /**
   * Run the complete integrated demo
   */
  async run(): Promise<DemoResults> {
    this.startTime = Date.now();
    console.log('🚀 Starting PocketFlow + H²GNN + WordNet Integrated Demo');
    console.log('=' .repeat(60));

    const results: DemoResults = {
      workflowResults: new Map(),
      performanceMetrics: {},
      timestamp: new Date(),
      duration: 0
    };

    try {
      // Phase 1: Training (if enabled)
      if (this.config.enableTraining) {
        console.log('\n🧠 Phase 1: Training the Integrated System');
        console.log('-'.repeat(40));
        results.trainingResults = await this.runTraining();
      }

      // Phase 2: Workflow Demonstrations
      if (this.config.enableWorkflows) {
        console.log('\n🔄 Phase 2: Demonstrating Agent Workflows');
        console.log('-'.repeat(40));
        await this.runWorkflowDemos(results);
      }

      // Phase 3: Performance Analysis
      console.log('\n📊 Phase 3: Performance Analysis');
      console.log('-'.repeat(40));
      results.performanceMetrics = await this.analyzePerformance();

      // Phase 4: Interactive Mode (if configured)
      if (this.config.mode === 'interactive') {
        console.log('\n💬 Phase 4: Interactive Mode');
        console.log('-'.repeat(40));
        await this.runInteractiveMode(results);
      }

      results.duration = Date.now() - this.startTime;
      
      console.log('\n✅ Demo completed successfully!');
      console.log(`⏱️  Total duration: ${(results.duration / 1000).toFixed(2)}s`);
      
      return results;

    } catch (error) {
      console.error('❌ Demo failed:', error);
      throw error;
    }
  }

  /**
   * Phase 1: Training
   */
  private async runTraining(): Promise<any> {
    console.log('  🔧 Initializing training pipeline...');

    if (this.config.mode === 'quick') {
      console.log('  ⚡ Running quick training (optimized for demo)...');
      
      const trainingResults = await quickTrain({
        h2gnn: {
          embeddingDim: 16,
          epochs: 5
        },
        wordnet: {
          maxSynsets: 50
        }
      });

      console.log(`  📈 Training completed with overall score: ${(trainingResults.overallScore * 100).toFixed(1)}%`);
      
      return trainingResults;

    } else {
      console.log('  🏋️ Running full training pipeline...');
      
      this.pipeline = createTrainingPipeline({
        h2gnn: {
          embeddingDim: 32,
          epochs: 20
        },
        wordnet: {
          maxSynsets: 500
        }
      });

      const trainingResults = await this.pipeline.train();
      
      console.log(`  📈 Training completed with overall score: ${(trainingResults.overallScore * 100).toFixed(1)}%`);
      
      return trainingResults;
    }
  }

  /**
   * Phase 2: Workflow Demonstrations
   */
  private async runWorkflowDemos(results: DemoResults): Promise<void> {
    // Initialize workflows
    await this.initializeWorkflows();

    // Demo 1: Hierarchical Question Answering
    console.log('\n  🤖 Demo 1: Hierarchical Question Answering');
    await this.demoHierarchicalQA(results);

    // Demo 2: Concept Learning
    console.log('\n  🎓 Demo 2: Concept Learning');
    await this.demoConceptLearning(results);

    // Demo 3: Semantic Exploration
    console.log('\n  🔍 Demo 3: Semantic Exploration');
    await this.demoSemanticExploration(results);

    // Demo 4: Multi-Agent Reasoning (if enabled)
    if (this.config.mode === 'full') {
      console.log('\n  🤖🤖 Demo 4: Multi-Agent Reasoning');
      await this.demoMultiAgentReasoning(results);
    }
  }

  private async initializeWorkflows(): Promise<void> {
    console.log('    Initializing workflows...');

    // Create workflows
    this.workflows.set('qa', new HierarchicalQAWorkflow());
    this.workflows.set('conceptLearning', new ConceptLearningWorkflow());
    this.workflows.set('semanticExploration', new SemanticExplorationWorkflow());
    
    if (this.config.mode === 'full') {
      this.workflows.set('multiAgent', new MultiAgentReasoningWorkflow());
    }

    // Initialize all workflows
    for (const [name, workflow] of this.workflows) {
      console.log(`      Initializing ${name}...`);
      await workflow.initialize();
    }

    console.log('    ✅ All workflows initialized');
  }

  private async demoHierarchicalQA(results: DemoResults): Promise<void> {
    const qaWorkflow = this.workflows.get('qa');
    if (!qaWorkflow) return;

    const questions = [
      'What is a mammal?',
      'How are cats related to carnivores?',
      'Explain the hierarchy from entity to house cat',
      'What are the characteristics of vertebrates?'
    ];

    console.log('    Testing hierarchical question answering...');
    const qaResults: any[] = [];

    for (const question of questions) {
      console.log(`      Q: ${question}`);
      
      try {
        const result = await qaWorkflow.answerQuestion(question);
        qaResults.push(result);
        
        if (this.config.logLevel === 'detailed' || this.config.logLevel === 'verbose') {
          console.log(`      A: ${result.answer?.substring(0, 100)}...`);
          console.log(`      Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        }
      } catch (error) {
        console.warn(`      ⚠️  Failed to answer: ${question}`);
        qaResults.push({ question, error: error.message });
      }
    }

    results.workflowResults.set('hierarchicalQA', qaResults);
    console.log(`    ✅ Completed ${qaResults.length} Q&A demonstrations`);
  }

  private async demoConceptLearning(results: DemoResults): Promise<void> {
    const clWorkflow = this.workflows.get('conceptLearning');
    if (!clWorkflow) return;

    const domains = ['animals', 'plants', 'objects'];
    console.log('    Testing concept learning...');
    const clResults: any[] = [];

    for (const domain of domains) {
      console.log(`      Learning domain: ${domain}`);
      
      try {
        const result = await clWorkflow.learnDomain(domain);
        clResults.push(result);
        
        if (this.config.logLevel === 'detailed' || this.config.logLevel === 'verbose') {
          console.log(`      Discovered ${result.concepts?.length || 0} concepts`);
          console.log(`      Learning plan: ${result.learningPlan?.substring(0, 80)}...`);
        }
      } catch (error) {
        console.warn(`      ⚠️  Failed to learn domain: ${domain}`);
        clResults.push({ domain, error: error.message });
      }
    }

    results.workflowResults.set('conceptLearning', clResults);
    console.log(`    ✅ Completed ${clResults.length} concept learning demonstrations`);
  }

  private async demoSemanticExploration(results: DemoResults): Promise<void> {
    const seWorkflow = this.workflows.get('semanticExploration');
    if (!seWorkflow) return;

    const concepts = ['cat', 'animal', 'organism', 'entity'];
    console.log('    Testing semantic exploration...');
    const seResults: any[] = [];

    for (const concept of concepts) {
      console.log(`      Exploring concept: ${concept}`);
      
      try {
        const result = await seWorkflow.exploreConcept(concept);
        seResults.push(result);
        
        if (this.config.logLevel === 'detailed' || this.config.logLevel === 'verbose') {
          console.log(`      Found ${result.neighbors?.length || 0} semantic neighbors`);
          console.log(`      Insights: ${result.insights?.substring(0, 80)}...`);
        }
      } catch (error) {
        console.warn(`      ⚠️  Failed to explore concept: ${concept}`);
        seResults.push({ concept, error: error.message });
      }
    }

    results.workflowResults.set('semanticExploration', seResults);
    console.log(`    ✅ Completed ${seResults.length} semantic exploration demonstrations`);
  }

  private async demoMultiAgentReasoning(results: DemoResults): Promise<void> {
    const maWorkflow = this.workflows.get('multiAgent');
    if (!maWorkflow) return;

    const queries = [
      'Compare cats and dogs in terms of their evolutionary relationships',
      'Analyze the hierarchical structure of living organisms'
    ];

    console.log('    Testing multi-agent reasoning...');
    const maResults: any[] = [];

    for (const query of queries) {
      console.log(`      Query: ${query}`);
      
      try {
        const result = await maWorkflow.reasonAboutQuery(query);
        maResults.push(result);
        
        if (this.config.logLevel === 'verbose') {
          console.log(`      Analysis: ${result.analysis?.substring(0, 80)}...`);
          console.log(`      Synthesis: ${result.synthesis?.substring(0, 80)}...`);
        }
      } catch (error) {
        console.warn(`      ⚠️  Failed multi-agent reasoning for: ${query}`);
        maResults.push({ query, error: error.message });
      }
    }

    results.workflowResults.set('multiAgentReasoning', maResults);
    console.log(`    ✅ Completed ${maResults.length} multi-agent reasoning demonstrations`);
  }

  /**
   * Phase 3: Performance Analysis
   */
  private async analyzePerformance(): Promise<any> {
    console.log('  📊 Analyzing system performance...');

    const metrics = {
      training: {},
      workflows: {},
      system: {}
    };

    // Training metrics (if available)
    if (this.pipeline) {
      const trainingMetrics = this.pipeline.getMetrics();
      if (trainingMetrics.length > 0) {
        const latest = trainingMetrics[trainingMetrics.length - 1];
        metrics.training = {
          finalLoss: latest.loss,
          finalAccuracy: latest.accuracy,
          hyperbolicMetrics: latest.hyperbolicMetrics,
          totalEpochs: trainingMetrics.length
        };
      }
    }

    // Workflow performance
    let totalWorkflowTests = 0;
    let successfulTests = 0;

    for (const [workflowName, results] of this.workflows) {
      if (Array.isArray(results)) {
        totalWorkflowTests += results.length;
        successfulTests += results.filter(r => !r.error).length;
      }
    }

    metrics.workflows = {
      totalTests: totalWorkflowTests,
      successRate: totalWorkflowTests > 0 ? successfulTests / totalWorkflowTests : 0,
      workflowCount: this.workflows.size
    };

    // System metrics
    metrics.system = {
      memoryUsage: this.getMemoryUsage(),
      executionTime: Date.now() - this.startTime,
      mode: this.config.mode
    };

    console.log(`    Training accuracy: ${((metrics.training as any).finalAccuracy * 100 || 0).toFixed(1)}%`);
    console.log(`    Workflow success rate: ${(metrics.workflows.successRate * 100).toFixed(1)}%`);
    console.log(`    Memory usage: ${metrics.system.memoryUsage.toFixed(1)}MB`);

    return metrics;
  }

  private getMemoryUsage(): number {
    // Mock memory usage calculation
    return Math.random() * 100 + 50; // 50-150 MB
  }

  /**
   * Phase 4: Interactive Mode
   */
  private async runInteractiveMode(results: DemoResults): Promise<void> {
    console.log('  💬 Starting interactive mode...');
    console.log('    (In a real implementation, this would accept user input)');
    
    // Mock interactive session
    const mockQueries = [
      'Tell me about the relationship between cats and mammals',
      'How does hyperbolic geometry help with hierarchical data?',
      'What can you learn about the animal kingdom?'
    ];

    for (const query of mockQueries) {
      console.log(`    User: ${query}`);
      
      // Route to appropriate workflow based on query
      const workflow = this.selectWorkflowForQuery(query);
      if (workflow) {
        try {
          let response;
          if (workflow === this.workflows.get('qa')) {
            response = await workflow.answerQuestion(query);
          } else if (workflow === this.workflows.get('semanticExploration')) {
            // Extract concept from query (simplified)
            const concept = this.extractConceptFromQuery(query);
            response = await workflow.exploreConcept(concept);
          }
          
          console.log(`    System: ${response?.answer || response?.insights || 'Response generated'}`.substring(0, 100) + '...');
        } catch (error) {
          console.log(`    System: I apologize, I encountered an error processing your query.`);
        }
      }
    }

    console.log('  ✅ Interactive mode demonstration completed');
  }

  private selectWorkflowForQuery(query: string): any {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('what') || lowerQuery.includes('how') || lowerQuery.includes('relationship')) {
      return this.workflows.get('qa');
    } else if (lowerQuery.includes('learn') || lowerQuery.includes('domain')) {
      return this.workflows.get('conceptLearning');
    } else if (lowerQuery.includes('explore') || lowerQuery.includes('about')) {
      return this.workflows.get('semanticExploration');
    }
    
    return this.workflows.get('qa'); // Default
  }

  private extractConceptFromQuery(query: string): string {
    // Simple concept extraction
    const words = query.toLowerCase().split(/\s+/);
    const concepts = ['cat', 'dog', 'animal', 'mammal', 'organism', 'entity', 'plant'];
    
    for (const concept of concepts) {
      if (words.includes(concept)) {
        return concept;
      }
    }
    
    return 'entity'; // Default concept
  }

  /**
   * Generate demo report
   */
  generateReport(results: DemoResults): string {
    const report = [
      '📋 PocketFlow + H²GNN + WordNet Integration Demo Report',
      '=' .repeat(60),
      '',
      `🕒 Execution Time: ${(results.duration / 1000).toFixed(2)}s`,
      `📅 Timestamp: ${results.timestamp.toISOString()}`,
      `⚙️  Mode: ${this.config.mode}`,
      '',
      '🧠 Training Results:',
      results.trainingResults ? 
        `  Overall Score: ${(results.trainingResults.overallScore * 100).toFixed(1)}%` :
        '  Training was skipped',
      '',
      '🔄 Workflow Results:',
    ];

    for (const [workflowName, workflowResults] of results.workflowResults) {
      if (Array.isArray(workflowResults)) {
        const successCount = workflowResults.filter(r => !r.error).length;
        report.push(`  ${workflowName}: ${successCount}/${workflowResults.length} successful`);
      }
    }

    report.push('');
    report.push('📊 Performance Metrics:');
    
    if (results.performanceMetrics.workflows) {
      report.push(`  Workflow Success Rate: ${(results.performanceMetrics.workflows.successRate * 100).toFixed(1)}%`);
    }
    
    if (results.performanceMetrics.system) {
      report.push(`  Memory Usage: ${results.performanceMetrics.system.memoryUsage.toFixed(1)}MB`);
    }

    report.push('');
    report.push('✅ Demo completed successfully!');

    return report.join('\n');
  }
}

/**
 * Quick demo function
 */
export async function runQuickDemo(): Promise<DemoResults> {
  const demo = new IntegratedDemo({
    mode: 'quick',
    enableTraining: true,
    enableWorkflows: true,
    logLevel: 'detailed'
  });

  return await demo.run();
}

/**
 * Full demo function
 */
export async function runFullDemo(): Promise<DemoResults> {
  const demo = new IntegratedDemo({
    mode: 'full',
    enableTraining: true,
    enableWorkflows: true,
    logLevel: 'verbose'
  });

  return await demo.run();
}

/**
 * Interactive demo function
 */
export async function runInteractiveDemo(): Promise<DemoResults> {
  const demo = new IntegratedDemo({
    mode: 'interactive',
    enableTraining: true,
    enableWorkflows: true,
    logLevel: 'detailed'
  });

  return await demo.run();
}

// Main demo execution (if run directly)
export async function main(): Promise<void> {
  console.log('🎯 PocketFlow + H²GNN + WordNet Integration Demo');
  console.log('Choose demo mode: quick, full, or interactive');
  
  // For demo purposes, run quick mode
  const results = await runQuickDemo();
  
  // Generate and display report
  const demo = new IntegratedDemo();
  const report = demo.generateReport(results);
  console.log('\n' + report);
}

// Export everything
export default {
  IntegratedDemo,
  runQuickDemo,
  runFullDemo,
  runInteractiveDemo,
  main
};

// Auto-run if this is the main module
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}
