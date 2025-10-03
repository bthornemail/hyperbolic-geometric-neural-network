import { App, Modal, Setting, Notice, TFile } from 'obsidian';
import { AgenticCodingInterface } from '../agentic-coding-interface';

export class KnowledgeGraphModal extends Modal {
  private agenticCoding: AgenticCodingInterface;
  private result: string = '';

  constructor(app: App, agenticCoding: AgenticCodingInterface) {
    super(app);
    this.agenticCoding = agenticCoding;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: '🧠 Knowledge Graph Operations' });

    // Knowledge Graph Query Section
    const querySection = contentEl.createDiv('knowledge-graph-section');
    querySection.createEl('h3', { text: 'Query Knowledge Graph' });

    new Setting(querySection)
      .setName('Query')
      .setDesc('Search the knowledge graph for insights')
      .addTextArea(text => text
        .setPlaceholder('Enter your query...')
        .setValue('')
        .onChange(value => this.query = value)
        .inputEl.rows = 3);

    new Setting(querySection)
      .setName('Query Type')
      .setDesc('Type of query to perform')
      .addDropdown(dropdown => dropdown
        .addOption('similarity', 'Similarity Search')
        .addOption('path', 'Path Finding')
        .addOption('cluster', 'Clustering')
        .addOption('dependency', 'Dependency Analysis')
        .addOption('impact', 'Impact Analysis')
        .setValue('similarity')
        .onChange(value => this.queryType = value));

    new Setting(querySection)
      .setName('Limit Results')
      .setDesc('Maximum number of results to return')
      .addText(text => text
        .setPlaceholder('10')
        .setValue('10')
        .onChange(value => this.limit = parseInt(value) || 10));

    new Setting(querySection)
      .addButton(button => button
        .setButtonText('🔍 Query Knowledge Graph')
        .setCta()
        .onClick(async () => await this.queryKnowledgeGraph()));

    // Codebase Analysis Section
    const analysisSection = contentEl.createDiv('knowledge-graph-section');
    analysisSection.createEl('h3', { text: 'Analyze Codebase' });

    new Setting(analysisSection)
      .setName('Codebase Path')
      .setDesc('Path to analyze for knowledge graph creation')
      .addText(text => text
        .setPlaceholder('e.g., ./src, /path/to/project...')
        .setValue('')
        .onChange(value => this.analysisPath = value));

    new Setting(analysisSection)
      .setName('Recursive Analysis')
      .setDesc('Analyze subdirectories recursively')
      .addToggle(toggle => toggle
        .setValue(true)
        .onChange(value => this.recursive = value));

    new Setting(analysisSection)
      .setName('Include Content')
      .setDesc('Include file content in analysis')
      .addToggle(toggle => toggle
        .setValue(true)
        .onChange(value => this.includeContent = value));

    new Setting(analysisSection)
      .setName('Max Depth')
      .setDesc('Maximum directory depth to analyze')
      .addText(text => text
        .setPlaceholder('10')
        .setValue('10')
        .onChange(value => this.maxDepth = parseInt(value) || 10));

    new Setting(analysisSection)
      .addButton(button => button
        .setButtonText('📊 Analyze Codebase')
        .setCta()
        .onClick(async () => await this.analyzeCodebase()));

    // Code Generation from Graph Section
    const codeGenSection = contentEl.createDiv('knowledge-graph-section');
    codeGenSection.createEl('h3', { text: 'Generate Code from Graph' });

    new Setting(codeGenSection)
      .setName('Code Type')
      .setDesc('Type of code to generate')
      .addDropdown(dropdown => dropdown
        .addOption('function', 'Function')
        .addOption('class', 'Class')
        .addOption('interface', 'Interface')
        .addOption('module', 'Module')
        .addOption('test', 'Test')
        .addOption('documentation', 'Documentation')
        .setValue('function')
        .onChange(value => this.codeType = value));

    new Setting(codeGenSection)
      .setName('Description')
      .setDesc('Describe what to generate')
      .addTextArea(text => text
        .setPlaceholder('Describe the functionality you want to generate...')
        .setValue('')
        .onChange(value => this.codeDescription = value)
        .inputEl.rows = 3);

    new Setting(codeGenSection)
      .setName('Code Style')
      .setDesc('Programming language/style')
      .addDropdown(dropdown => dropdown
        .addOption('typescript', 'TypeScript')
        .addOption('javascript', 'JavaScript')
        .addOption('python', 'Python')
        .addOption('markdown', 'Markdown')
        .setValue('typescript')
        .onChange(value => this.codeStyle = value));

    new Setting(codeGenSection)
      .setName('Framework')
      .setDesc('Framework to use (optional)')
      .addText(text => text
        .setPlaceholder('e.g., React, Vue, Express...')
        .setValue('')
        .onChange(value => this.framework = value));

    new Setting(codeGenSection)
      .addButton(button => button
        .setButtonText('⚡ Generate Code')
        .setCta()
        .onClick(async () => await this.generateCodeFromGraph()));

    // Documentation Generation Section
    const docGenSection = contentEl.createDiv('knowledge-graph-section');
    docGenSection.createEl('h3', { text: 'Generate Documentation' });

    new Setting(docGenSection)
      .setName('Documentation Type')
      .setDesc('Type of documentation to generate')
      .addDropdown(dropdown => dropdown
        .addOption('api_docs', 'API Documentation')
        .addOption('readme', 'README')
        .addOption('architecture', 'Architecture')
        .addOption('tutorial', 'Tutorial')
        .addOption('changelog', 'Changelog')
        .addOption('design_spec', 'Design Specification')
        .setValue('api_docs')
        .onChange(value => this.docType = value));

    new Setting(docGenSection)
      .setName('Output Format')
      .setDesc('Documentation format')
      .addDropdown(dropdown => dropdown
        .addOption('markdown', 'Markdown')
        .addOption('html', 'HTML')
        .addOption('pdf', 'PDF')
        .addOption('json', 'JSON')
        .setValue('markdown')
        .onChange(value => this.docFormat = value));

    new Setting(docGenSection)
      .setName('Target Audience')
      .setDesc('Who is the documentation for?')
      .addDropdown(dropdown => dropdown
        .addOption('developer', 'Developers')
        .addOption('user', 'End Users')
        .addOption('architect', 'Architects')
        .addOption('stakeholder', 'Stakeholders')
        .setValue('developer')
        .onChange(value => this.docTargetAudience = value));

    new Setting(docGenSection)
      .setName('Detail Level')
      .setDesc('Level of detail in documentation')
      .addDropdown(dropdown => dropdown
        .addOption('high', 'High Detail')
        .addOption('medium', 'Medium Detail')
        .addOption('low', 'Low Detail')
        .setValue('high')
        .onChange(value => this.docDetailLevel = value));

    new Setting(docGenSection)
      .addButton(button => button
        .setButtonText('📚 Generate Documentation')
        .setCta()
        .onClick(async () => await this.generateDocumentation()));

    // Graph Visualization Section
    const vizSection = contentEl.createDiv('knowledge-graph-section');
    vizSection.createEl('h3', { text: 'Graph Visualization' });

    new Setting(vizSection)
      .setName('Layout Algorithm')
      .setDesc('Layout algorithm for graph visualization')
      .addDropdown(dropdown => dropdown
        .addOption('force', 'Force-Directed')
        .addOption('hierarchical', 'Hierarchical')
        .addOption('circular', 'Circular')
        .setValue('force')
        .onChange(value => this.layout = value));

    new Setting(vizSection)
      .addButton(button => button
        .setButtonText('🎨 Get Graph Visualization')
        .setCta()
        .onClick(async () => await this.getGraphVisualization()));

    // Results Section
    const resultsSection = contentEl.createDiv('knowledge-graph-section');
    resultsSection.createEl('h3', { text: 'Results' });

    const resultsDiv = resultsSection.createDiv('results-container');
    resultsDiv.style.maxHeight = '400px';
    resultsDiv.style.overflowY = 'auto';
    resultsDiv.style.border = '1px solid var(--background-modifier-border)';
    resultsDiv.style.padding = '10px';
    resultsDiv.style.borderRadius = '4px';
    resultsDiv.style.backgroundColor = 'var(--background-secondary)';

    const resultsText = resultsDiv.createEl('pre', { text: 'Results will appear here...' });
    resultsText.style.whiteSpace = 'pre-wrap';
    resultsText.style.fontFamily = 'var(--font-monospace)';
    resultsText.style.fontSize = '12px';

    this.resultElement = resultsText;
  }

  private query: string = '';
  private queryType: string = 'similarity';
  private limit: number = 10;
  private analysisPath: string = '';
  private recursive: boolean = true;
  private includeContent: boolean = true;
  private maxDepth: number = 10;
  private codeType: string = 'function';
  private codeDescription: string = '';
  private codeStyle: string = 'typescript';
  private framework: string = '';
  private docType: string = 'api_docs';
  private docFormat: string = 'markdown';
  private docTargetAudience: string = 'developer';
  private docDetailLevel: string = 'high';
  private layout: string = 'force';
  private resultElement: HTMLElement;

  private async queryKnowledgeGraph() {
    if (!this.query) {
      new Notice('❌ Please enter a query');
      return;
    }

    try {
      this.updateResult('🔍 Querying knowledge graph...\n');
      
      const result = await this.agenticCoding.queryKnowledgeGraph(this.query, this.queryType, this.limit);
      
      if (result.success) {
        this.updateResult(`✅ Knowledge graph query completed!\n\n${JSON.stringify(result.data, null, 2)}\n`);
      } else {
        this.updateResult(`❌ Knowledge graph query failed: ${result.error}\n`);
      }
    } catch (error) {
      this.updateResult(`❌ Error: ${error.message}\n`);
    }
  }

  private async analyzeCodebase() {
    if (!this.analysisPath) {
      new Notice('❌ Please provide a codebase path');
      return;
    }

    try {
      this.updateResult('📊 Analyzing codebase...\n');
      
      const result = await this.agenticCoding.agenticCoding.h2gnnClient.analyzePathToKnowledgeGraph(this.analysisPath, {
        recursive: this.recursive,
        includeContent: this.includeContent,
        maxDepth: this.maxDepth,
        filePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.py', '**/*.md'],
        excludePatterns: ['**/node_modules/**', '**/dist/**', '**/.git/**']
      });
      
      if (result.success) {
        this.updateResult(`✅ Codebase analysis completed!\n\n${JSON.stringify(result.data, null, 2)}\n`);
      } else {
        this.updateResult(`❌ Codebase analysis failed: ${result.error}\n`);
      }
    } catch (error) {
      this.updateResult(`❌ Error: ${error.message}\n`);
    }
  }

  private async generateCodeFromGraph() {
    if (!this.codeDescription) {
      new Notice('❌ Please provide a description');
      return;
    }

    try {
      this.updateResult('⚡ Generating code from knowledge graph...\n');
      
      const result = await this.agenticCoding.agenticCoding.h2gnnClient.generateCodeFromGraph(this.codeType, this.codeDescription, {
        targetFile: `generated.${this.codeStyle}`,
        style: this.codeStyle,
        framework: this.framework || undefined
      }, {
        maxLines: 100,
        includeComments: true,
        includeTests: false
      });
      
      if (result.success) {
        this.updateResult(`✅ Code generated successfully!\n\n${JSON.stringify(result.data, null, 2)}\n`);
      } else {
        this.updateResult(`❌ Code generation failed: ${result.error}\n`);
      }
    } catch (error) {
      this.updateResult(`❌ Error: ${error.message}\n`);
    }
  }

  private async generateDocumentation() {
    try {
      this.updateResult('📚 Generating documentation from knowledge graph...\n');
      
      const result = await this.agenticCoding.agenticCoding.h2gnnClient.generateDocumentationFromGraph(this.docType, [], this.docFormat, {
        includeCodeExamples: true,
        includeArchitectureDiagrams: true,
        targetAudience: this.docTargetAudience,
        detailLevel: this.docDetailLevel
      });
      
      if (result.success) {
        this.updateResult(`✅ Documentation generated successfully!\n\n${JSON.stringify(result.data, null, 2)}\n`);
      } else {
        this.updateResult(`❌ Documentation generation failed: ${result.error}\n`);
      }
    } catch (error) {
      this.updateResult(`❌ Error: ${error.message}\n`);
    }
  }

  private async getGraphVisualization() {
    try {
      this.updateResult('🎨 Getting graph visualization...\n');
      
      const result = await this.agenticCoding.agenticCoding.h2gnnClient.getGraphVisualization(this.layout);
      
      if (result.success) {
        this.updateResult(`✅ Graph visualization retrieved!\n\n${JSON.stringify(result.data, null, 2)}\n`);
      } else {
        this.updateResult(`❌ Graph visualization failed: ${result.error}\n`);
      }
    } catch (error) {
      this.updateResult(`❌ Error: ${error.message}\n`);
    }
  }

  private updateResult(text: string) {
    this.result += text;
    this.resultElement.setText(this.result);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
