import { App, Modal, Setting, Notice, TFile } from 'obsidian';
import { AgenticCodingInterface, CodeGenerationRequest, DocumentationRequest, RefactoringRequest } from '../agentic-coding-interface';

export class AgenticCodingModal extends Modal {
  private agenticCoding: AgenticCodingInterface;
  private result: string = '';

  constructor(app: App, agenticCoding: AgenticCodingInterface) {
    super(app);
    this.agenticCoding = agenticCoding;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: '🤖 Agentic Coding with H²GNN' });

    // Code Generation Section
    const codeGenSection = contentEl.createDiv('agentic-coding-section');
    codeGenSection.createEl('h3', { text: 'Code Generation' });

    new Setting(codeGenSection)
      .setName('Context')
      .setDesc('Provide context for code generation')
      .addTextArea(text => text
        .setPlaceholder('Describe the context, requirements, and constraints...')
        .setValue('')
        .onChange(value => this.context = value)
        .inputEl.rows = 4);

    new Setting(codeGenSection)
      .setName('Requirements')
      .setDesc('Specify what the code should do')
      .addTextArea(text => text
        .setPlaceholder('Describe the functionality you want to implement...')
        .setValue('')
        .onChange(value => this.requirements = value)
        .inputEl.rows = 3);

    new Setting(codeGenSection)
      .setName('Language')
      .setDesc('Programming language')
      .addDropdown(dropdown => dropdown
        .addOption('typescript', 'TypeScript')
        .addOption('javascript', 'JavaScript')
        .addOption('python', 'Python')
        .addOption('java', 'Java')
        .addOption('csharp', 'C#')
        .setValue('typescript')
        .onChange(value => this.language = value));

    new Setting(codeGenSection)
      .setName('Framework')
      .setDesc('Framework or library (optional)')
      .addText(text => text
        .setPlaceholder('e.g., React, Vue, Express, Django...')
        .setValue('')
        .onChange(value => this.framework = value));

    new Setting(codeGenSection)
      .setName('Include Tests')
      .setDesc('Generate unit tests along with the code')
      .addToggle(toggle => toggle
        .setValue(false)
        .onChange(value => this.includeTests = value));

    new Setting(codeGenSection)
      .setName('Include Comments')
      .setDesc('Add detailed comments to the generated code')
      .addToggle(toggle => toggle
        .setValue(true)
        .onChange(value => this.includeComments = value));

    new Setting(codeGenSection)
      .addButton(button => button
        .setButtonText('🚀 Generate Code')
        .setCta()
        .onClick(async () => await this.generateCode()));

    // Documentation Generation Section
    const docGenSection = contentEl.createDiv('agentic-coding-section');
    docGenSection.createEl('h3', { text: 'Documentation Generation' });

    new Setting(docGenSection)
      .setName('Codebase Path')
      .setDesc('Path to the codebase to document')
      .addText(text => text
        .setPlaceholder('e.g., ./src, /path/to/project...')
        .setValue('')
        .onChange(value => this.docCodebasePath = value));

    new Setting(docGenSection)
      .setName('Output Format')
      .setDesc('Documentation format')
      .addDropdown(dropdown => dropdown
        .addOption('markdown', 'Markdown')
        .addOption('html', 'HTML')
        .addOption('pdf', 'PDF')
        .addOption('json', 'JSON')
        .setValue('markdown')
        .onChange(value => this.docOutputFormat = value));

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

    // Code Refactoring Section
    const refactorSection = contentEl.createDiv('agentic-coding-section');
    refactorSection.createEl('h3', { text: 'Code Refactoring' });

    new Setting(refactorSection)
      .setName('Code to Refactor')
      .setDesc('Paste the code you want to refactor')
      .addTextArea(text => text
        .setPlaceholder('Paste your code here...')
        .setValue('')
        .onChange(value => this.refactorCode = value)
        .inputEl.rows = 6);

    new Setting(refactorSection)
      .setName('Refactoring Type')
      .setDesc('Type of refactoring to perform')
      .addDropdown(dropdown => dropdown
        .addOption('extract_method', 'Extract Method')
        .addOption('extract_class', 'Extract Class')
        .addOption('rename_variable', 'Rename Variable')
        .addOption('simplify_conditional', 'Simplify Conditional')
        .addOption('remove_duplication', 'Remove Duplication')
        .addOption('improve_readability', 'Improve Readability')
        .setValue('extract_method')
        .onChange(value => this.refactoringType = value));

    new Setting(refactorSection)
      .setName('Language')
      .setDesc('Programming language of the code')
      .addDropdown(dropdown => dropdown
        .addOption('typescript', 'TypeScript')
        .addOption('javascript', 'JavaScript')
        .addOption('python', 'Python')
        .addOption('java', 'Java')
        .addOption('csharp', 'C#')
        .setValue('typescript')
        .onChange(value => this.refactorLanguage = value));

    new Setting(refactorSection)
      .addButton(button => button
        .setButtonText('🔧 Refactor Code')
        .setCta()
        .onClick(async () => await this.refactorCode()));

    // System Status Section
    const statusSection = contentEl.createDiv('agentic-coding-section');
    statusSection.createEl('h3', { text: 'System Status' });

    new Setting(statusSection)
      .addButton(button => button
        .setButtonText('📊 Get Learning Progress')
        .onClick(async () => await this.getLearningProgress()));

    new Setting(statusSection)
      .addButton(button => button
        .setButtonText('🔍 Get System Status')
        .onClick(async () => await this.getSystemStatus()));

    new Setting(statusSection)
      .addButton(button => button
        .setButtonText('🧠 Consolidate Memories')
        .onClick(async () => await this.consolidateMemories()));

    // Results Section
    const resultsSection = contentEl.createDiv('agentic-coding-section');
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

  private context: string = '';
  private requirements: string = '';
  private language: string = 'typescript';
  private framework: string = '';
  private includeTests: boolean = false;
  private includeComments: boolean = true;
  private docCodebasePath: string = '';
  private docOutputFormat: string = 'markdown';
  private docTargetAudience: string = 'developer';
  private docDetailLevel: string = 'high';
  private refactorCode: string = '';
  private refactoringType: string = 'extract_method';
  private refactorLanguage: string = 'typescript';
  private resultElement: HTMLElement;

  private async generateCode() {
    if (!this.context || !this.requirements) {
      new Notice('❌ Please provide both context and requirements');
      return;
    }

    try {
      this.updateResult('🤖 Generating code...\n');
      
      const request: CodeGenerationRequest = {
        context: this.context,
        requirements: this.requirements,
        language: this.language,
        framework: this.framework || undefined,
        includeTests: this.includeTests,
        includeComments: this.includeComments
      };

      const result = await this.agenticCoding.generateCode(request);
      
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
    if (!this.docCodebasePath) {
      new Notice('❌ Please provide a codebase path');
      return;
    }

    try {
      this.updateResult('📚 Generating documentation...\n');
      
      const request: DocumentationRequest = {
        codebasePath: this.docCodebasePath,
        outputFormat: this.docOutputFormat,
        targetAudience: this.docTargetAudience,
        detailLevel: this.docDetailLevel,
        includeExamples: true,
        includeDiagrams: true
      };

      const result = await this.agenticCoding.generateDocumentation(request);
      
      if (result.success) {
        this.updateResult(`✅ Documentation generated successfully!\n\n${JSON.stringify(result.data, null, 2)}\n`);
      } else {
        this.updateResult(`❌ Documentation generation failed: ${result.error}\n`);
      }
    } catch (error) {
      this.updateResult(`❌ Error: ${error.message}\n`);
    }
  }

  private async refactorCode() {
    if (!this.refactorCode) {
      new Notice('❌ Please provide code to refactor');
      return;
    }

    try {
      this.updateResult('🔧 Refactoring code...\n');
      
      const request: RefactoringRequest = {
        code: this.refactorCode,
        refactoringType: this.refactoringType,
        language: this.refactorLanguage,
        autoApply: true
      };

      const result = await this.agenticCoding.performRefactoring(request);
      
      if (result.success) {
        this.updateResult(`✅ Code refactored successfully!\n\n${JSON.stringify(result.data, null, 2)}\n`);
      } else {
        this.updateResult(`❌ Refactoring failed: ${result.error}\n`);
      }
    } catch (error) {
      this.updateResult(`❌ Error: ${error.message}\n`);
    }
  }

  private async getLearningProgress() {
    try {
      this.updateResult('📊 Getting learning progress...\n');
      
      const result = await this.agenticCoding.getLearningProgress();
      
      if (result.success) {
        this.updateResult(`✅ Learning progress retrieved!\n\n${JSON.stringify(result.data, null, 2)}\n`);
      } else {
        this.updateResult(`❌ Failed to get learning progress: ${result.error}\n`);
      }
    } catch (error) {
      this.updateResult(`❌ Error: ${error.message}\n`);
    }
  }

  private async getSystemStatus() {
    try {
      this.updateResult('🔍 Getting system status...\n');
      
      const result = await this.agenticCoding.getSystemStatus();
      
      if (result.success) {
        this.updateResult(`✅ System status retrieved!\n\n${JSON.stringify(result.data, null, 2)}\n`);
      } else {
        this.updateResult(`❌ Failed to get system status: ${result.error}\n`);
      }
    } catch (error) {
      this.updateResult(`❌ Error: ${error.message}\n`);
    }
  }

  private async consolidateMemories() {
    try {
      this.updateResult('🧠 Consolidating memories...\n');
      
      const result = await this.agenticCoding.consolidateMemories();
      
      if (result.success) {
        this.updateResult(`✅ Memories consolidated successfully!\n\n${JSON.stringify(result.data, null, 2)}\n`);
      } else {
        this.updateResult(`❌ Memory consolidation failed: ${result.error}\n`);
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
