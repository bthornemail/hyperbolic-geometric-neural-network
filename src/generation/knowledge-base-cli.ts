#!/usr/bin/env tsx

/**
 * Knowledge Base Creator CLI
 * 
 * Command-line interface for the Knowledge Base Creator
 * Supports analyzing codebases and generating various types of documentation
 */

import KnowledgeBaseCreator from './knowledge-base-creator';
import * as fs from 'fs';
import * as path from 'path';
import { program } from 'commander';

interface CLIOptions {
  source: string;
  output: string;
  type: 'tutorial' | 'essay' | 'api-docs' | 'architecture' | 'learning-guide' | 'refinement';
  format: 'markdown' | 'html' | 'pdf' | 'json';
  audience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;
  style: 'technical' | 'narrative' | 'academic' | 'casual';
  focus?: string[];
  maxLength?: number;
  includeExamples?: boolean;
  includeDiagrams?: boolean;
  exclude?: string[];
  include?: string[];
  maxFileSize?: number;
}

class KnowledgeBaseCLI {
  private creator: KnowledgeBaseCreator;

  constructor() {
    this.creator = new KnowledgeBaseCreator();
  }

  /**
   * Analyze codebase and extract knowledge
   */
  async analyze(options: CLIOptions): Promise<void> {
    console.log('🔍 Starting codebase analysis...');
    console.log(`📁 Source: ${options.source}`);
    console.log(`📝 Output: ${options.output}`);
    console.log(`🎯 Type: ${options.type}`);
    console.log(`👥 Audience: ${options.audience}`);
    
    try {
      // Analyze the codebase
      await this.creator.analyzeCodebase(options.source, {
        includePatterns: options.include || ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.py', '**/*.md'],
        excludePatterns: options.exclude || ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/test/**'],
        maxFileSize: options.maxFileSize || 100000
      });

      console.log('✅ Codebase analysis complete!');
      
      // Show knowledge base stats
      const stats = this.creator.getKnowledgeBaseStats();
      console.log('\n📊 Knowledge Base Statistics:');
      console.log(`   Total concepts: ${stats.totalNodes}`);
      console.log(`   Average complexity: ${stats.averageComplexity.toFixed(2)}`);
      console.log(`   Total relationships: ${stats.totalRelationships}`);
      
      console.log('\n📋 Concept types:');
      for (const [type, count] of stats.nodeTypes) {
        console.log(`   ${type}: ${count}`);
      }

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    }
  }

  /**
   * Generate documentation
   */
  async generate(options: CLIOptions): Promise<void> {
    console.log('📝 Generating documentation...');
    
    try {
      // Ensure output directory exists
      const outputDir = path.dirname(options.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate documentation
      const document = await this.creator.generateDocumentation(
        {
          type: options.type,
          format: options.format,
          targetAudience: options.audience,
          language: options.language,
          style: options.style
        },
        options.output,
        {
          focusAreas: options.focus || [],
          maxLength: options.maxLength || 10000,
          includeExamples: options.includeExamples !== false,
          includeDiagrams: options.includeDiagrams || false
        }
      );

      console.log('✅ Documentation generated successfully!');
      console.log(`📄 File: ${options.output}`);
      console.log(`📊 Sections: ${document.sections.length}`);
      console.log(`⏱️ Estimated read time: ${document.metadata.estimatedReadTime} minutes`);
      console.log(`📁 Source files: ${document.metadata.sourceFiles.length}`);

    } catch (error) {
      console.error('❌ Generation failed:', error);
      process.exit(1);
    }
  }

  /**
   * Refine existing documentation
   */
  async refine(options: CLIOptions): Promise<void> {
    console.log('🔧 Refining documentation...');
    
    if (!fs.existsSync(options.source)) {
      console.error(`❌ Source file not found: ${options.source}`);
      process.exit(1);
    }

    try {
      const refinedContent = await this.creator.refineDocumentation({
        documentPath: options.source,
        focusAreas: options.focus || [],
        improvementType: 'clarity',
        targetAudience: options.audience,
        constraints: []
      });

      console.log('✅ Documentation refined successfully!');
      console.log(`📄 Refined file: ${options.source.replace(/\.(md|html|txt)$/, '_refined.$1')}`);

    } catch (error) {
      console.error('❌ Refinement failed:', error);
      process.exit(1);
    }
  }

  /**
   * Export knowledge base
   */
  async export(options: CLIOptions): Promise<void> {
    console.log('📦 Exporting knowledge base...');
    
    try {
      await this.creator.exportKnowledgeBase(options.output);
      console.log('✅ Knowledge base exported successfully!');
      console.log(`📄 File: ${options.output}`);

    } catch (error) {
      console.error('❌ Export failed:', error);
      process.exit(1);
    }
  }

  /**
   * Show knowledge base statistics
   */
  async stats(): Promise<void> {
    console.log('📊 Knowledge Base Statistics:');
    
    const stats = this.creator.getKnowledgeBaseStats();
    
    console.log(`\n📈 Overview:`);
    console.log(`   Total concepts: ${stats.totalNodes}`);
    console.log(`   Average complexity: ${stats.averageComplexity.toFixed(2)}`);
    console.log(`   Total relationships: ${stats.totalRelationships}`);
    
    console.log(`\n📋 Concept types:`);
    for (const [type, count] of stats.nodeTypes) {
      console.log(`   ${type}: ${count}`);
    }
  }
}

// CLI Setup

program
  .name('knowledge-base-creator')
  .description('Generate and refine documentation from codebases using H²GNN')
  .version('1.0.0');

// Analyze command
program
  .command('analyze')
  .description('Analyze codebase and extract knowledge')
  .requiredOption('-s, --source <path>', 'Source directory or file path')
  .option('-o, --output <path>', 'Output directory', './output')
  .option('-i, --include <patterns...>', 'Include file patterns', ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'])
  .option('-e, --exclude <patterns...>', 'Exclude file patterns', ['**/node_modules/**', '**/dist/**', '**/.git/**'])
  .option('--max-file-size <bytes>', 'Maximum file size in bytes', '100000')
  .action(async (options: any) => {
    const cli = new KnowledgeBaseCLI();
    await cli.analyze({
      source: options.source,
      output: options.output,
      type: 'tutorial',
      format: 'markdown',
      audience: 'beginner',
      language: 'english',
      style: 'technical',
      exclude: options.exclude,
      include: options.include,
      maxFileSize: parseInt(options.maxFileSize)
    });
  });

// Generate command
program
  .command('generate')
  .description('Generate documentation from analyzed codebase')
  .requiredOption('-s, --source <path>', 'Source directory path')
  .requiredOption('-o, --output <path>', 'Output file path')
  .option('-t, --type <type>', 'Document type', 'tutorial')
  .option('-f, --format <format>', 'Output format', 'markdown')
  .option('-a, --audience <audience>', 'Target audience', 'beginner')
  .option('-l, --language <language>', 'Language', 'english')
  .option('--style <style>', 'Writing style', 'technical')
  .option('--focus <areas...>', 'Focus areas')
  .option('--max-length <length>', 'Maximum content length', '10000')
  .option('--no-examples', 'Exclude examples')
  .option('--include-diagrams', 'Include diagrams')
  .action(async (options: any) => {
    const cli = new KnowledgeBaseCLI();
    await cli.generate({
      source: options.source,
      output: options.output,
      type: options.type,
      format: options.format,
      audience: options.audience,
      language: options.language,
      style: options.style,
      focus: options.focus,
      maxLength: parseInt(options.maxLength),
      includeExamples: !options.noExamples,
      includeDiagrams: options.includeDiagrams
    });
  });

// Refine command
program
  .command('refine')
  .description('Refine existing documentation')
  .requiredOption('-s, --source <path>', 'Source document path')
  .option('-a, --audience <audience>', 'Target audience', 'beginner')
  .option('--focus <areas...>', 'Focus areas for improvement')
  .action(async (options: any) => {
    const cli = new KnowledgeBaseCLI();
    await cli.refine({
      source: options.source,
      output: '',
      type: 'refinement',
      format: 'markdown',
      audience: options.audience,
      language: 'english',
      style: 'technical',
      focus: options.focus
    });
  });

// Export command
program
  .command('export')
  .description('Export knowledge base to JSON')
  .requiredOption('-o, --output <path>', 'Output file path')
  .action(async (options: any) => {
    const cli = new KnowledgeBaseCLI();
    await cli.export({
      source: '',
      output: options.output,
      type: 'tutorial',
      format: 'json',
      audience: 'beginner',
      language: 'english',
      style: 'technical'
    });
  });

// Stats command
program
  .command('stats')
  .description('Show knowledge base statistics')
  .action(async () => {
    const cli = new KnowledgeBaseCLI();
    await cli.stats();
  });

// Full workflow command
program
  .command('workflow')
  .description('Run complete workflow: analyze -> generate -> export')
  .requiredOption('-s, --source <path>', 'Source directory path')
  .requiredOption('-o, --output <path>', 'Output directory path')
  .option('-t, --type <type>', 'Document type', 'tutorial')
  .option('-f, --format <format>', 'Output format', 'markdown')
  .option('-a, --audience <audience>', 'Target audience', 'beginner')
  .option('--focus <areas...>', 'Focus areas')
  .action(async (options: any) => {
    const cli = new KnowledgeBaseCLI();
    
    console.log('🚀 Starting complete workflow...');
    
    // Step 1: Analyze
    console.log('\n📊 Step 1: Analyzing codebase...');
    await cli.analyze({
      source: options.source,
      output: options.output,
      type: options.type,
      format: options.format,
      audience: options.audience,
      language: 'english',
      style: 'technical',
      focus: options.focus
    });

    // Step 2: Generate documentation
    console.log('\n📝 Step 2: Generating documentation...');
    const docPath = path.join(options.output, `${options.type}.${options.format}`);
    await cli.generate({
      source: options.source,
      output: docPath,
      type: options.type,
      format: options.format,
      audience: options.audience,
      language: 'english',
      style: 'technical',
      focus: options.focus
    });

    // Step 3: Export knowledge base
    console.log('\n📦 Step 3: Exporting knowledge base...');
    const kbPath = path.join(options.output, 'knowledge-base.json');
    await cli.export({
      source: '',
      output: kbPath,
      type: options.type,
      format: 'json',
      audience: options.audience,
      language: 'english',
      style: 'technical'
    });

    console.log('\n✅ Complete workflow finished successfully!');
    console.log(`📄 Documentation: ${docPath}`);
    console.log(`📦 Knowledge base: ${kbPath}`);
  });

// Parse command line arguments
program.parse(process.argv);

// Export CLI class for programmatic use
export { KnowledgeBaseCLI };
export default KnowledgeBaseCLI;
