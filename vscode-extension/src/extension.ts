import * as vscode from 'vscode';
import { H2GNNLanguageClient } from './language/languageClient';
import { H2GNNChatProvider } from './providers/chatProvider';
import { H2GNNKnowledgeGraphProvider } from './providers/knowledgeGraphProvider';
import { H2GNNWorkflowProvider } from './providers/workflowProvider';
import { H2GNNCodeInsightsProvider } from './providers/codeInsightsProvider';
import { H2GNNCompletionProvider } from './providers/completionProvider';
import { H2GNNHoverProvider } from './providers/hoverProvider';
import { H2GNNCodeLensProvider } from './providers/codeLensProvider';
import { H2GNNSemanticTokensProvider } from './providers/semanticTokensProvider';
import { H2GNNDefinitionProvider } from './providers/definitionProvider';
import { H2GNNReferenceProvider } from './providers/referenceProvider';
import { H2GNNDocumentFormattingProvider } from './providers/formattingProvider';
import { H2GNNRenameProvider } from './providers/renameProvider';
import { H2GNNWorkspaceSymbolProvider } from './providers/workspaceSymbolProvider';
import { AgenticFramework } from './agentic/agenticFramework';
import { KnowledgeGraphManager } from './knowledge/knowledgeGraphManager';
import { MCPClient } from './mcp/mcpClient';
import { StatusBarManager } from './ui/statusBarManager';
import { WebviewManager } from './ui/webviewManager';

/**
 * H²GNN PocketFlow VS Code Extension
 * 
 * Provides AI-powered development assistance using hyperbolic geometric neural networks,
 * agentic frameworks, and knowledge graphs for advanced language features.
 */
export class H2GNNExtension {
  private context: vscode.ExtensionContext;
  private languageClient: H2GNNLanguageClient;
  private agenticFramework: AgenticFramework;
  private knowledgeGraphManager: KnowledgeGraphManager;
  private mcpClient: MCPClient;
  private statusBarManager: StatusBarManager;
  private webviewManager: WebviewManager;
  
  // View providers
  private chatProvider: H2GNNChatProvider;
  private knowledgeGraphProvider: H2GNNKnowledgeGraphProvider;
  private workflowProvider: H2GNNWorkflowProvider;
  private codeInsightsProvider: H2GNNCodeInsightsProvider;
  
  // Language feature providers
  private completionProvider: H2GNNCompletionProvider;
  private hoverProvider: H2GNNHoverProvider;
  private codeLensProvider: H2GNNCodeLensProvider;
  private semanticTokensProvider: H2GNNSemanticTokensProvider;
  private definitionProvider: H2GNNDefinitionProvider;
  private referenceProvider: H2GNNReferenceProvider;
  private formattingProvider: H2GNNDocumentFormattingProvider;
  private renameProvider: H2GNNRenameProvider;
  private workspaceSymbolProvider: H2GNNWorkspaceSymbolProvider;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Initialize the extension
   */
  async activate(): Promise<void> {
    console.log('🚀 Activating H²GNN PocketFlow Extension');

    try {
      // Initialize core services
      await this.initializeCoreServices();
      
      // Setup language features
      await this.setupLanguageFeatures();
      
      // Setup workbench extensions
      await this.setupWorkbenchExtensions();
      
      // Register commands
      this.registerCommands();
      
      // Setup event listeners
      this.setupEventListeners();
      
      console.log('✅ H²GNN PocketFlow Extension activated successfully');
      
      // Show welcome message
      vscode.window.showInformationMessage(
        '🧠 H²GNN PocketFlow AI Assistant is now active! Use the sidebar to access chat, knowledge graphs, and workflows.',
        'Open Chat', 'View Knowledge Graph'
      ).then(selection => {
        if (selection === 'Open Chat') {
          vscode.commands.executeCommand('h2gnn.chatOpen');
        } else if (selection === 'View Knowledge Graph') {
          vscode.commands.executeCommand('h2gnn.knowledgeGraphView');
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to activate H²GNN PocketFlow Extension:', error);
      vscode.window.showErrorMessage(
        `Failed to activate H²GNN PocketFlow: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Initialize core services
   */
  private async initializeCoreServices(): Promise<void> {
    // Initialize MCP client
    this.mcpClient = new MCPClient(this.context);
    await this.mcpClient.initialize();
    
    // Initialize agentic framework
    this.agenticFramework = new AgenticFramework(this.mcpClient);
    await this.agenticFramework.initialize();
    
    // Initialize knowledge graph manager
    this.knowledgeGraphManager = new KnowledgeGraphManager(this.mcpClient);
    await this.knowledgeGraphManager.initialize();
    
    // Initialize language client
    this.languageClient = new H2GNNLanguageClient(this.context, this.mcpClient);
    await this.languageClient.start();
    
    // Initialize UI managers
    this.statusBarManager = new StatusBarManager(this.context);
    this.webviewManager = new WebviewManager(this.context, this.agenticFramework);
  }

  /**
   * Setup declarative and programmatic language features
   */
  private async setupLanguageFeatures(): Promise<void> {
    // Initialize language feature providers
    this.completionProvider = new H2GNNCompletionProvider(this.agenticFramework, this.knowledgeGraphManager);
    this.hoverProvider = new H2GNNHoverProvider(this.agenticFramework, this.knowledgeGraphManager);
    this.codeLensProvider = new H2GNNCodeLensProvider(this.agenticFramework, this.knowledgeGraphManager);
    this.semanticTokensProvider = new H2GNNSemanticTokensProvider(this.knowledgeGraphManager);
    this.definitionProvider = new H2GNNDefinitionProvider(this.knowledgeGraphManager);
    this.referenceProvider = new H2GNNReferenceProvider(this.knowledgeGraphManager);
    this.formattingProvider = new H2GNNDocumentFormattingProvider(this.agenticFramework);
    this.renameProvider = new H2GNNRenameProvider(this.agenticFramework, this.knowledgeGraphManager);
    this.workspaceSymbolProvider = new H2GNNWorkspaceSymbolProvider(this.knowledgeGraphManager);

    // Register language features for supported languages
    const supportedLanguages = ['typescript', 'javascript', 'python', 'pocketflow'];
    
    for (const language of supportedLanguages) {
      // Completion provider
      this.context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
          language,
          this.completionProvider,
          '.', ':', '(', '[', '"', "'"
        )
      );
      
      // Hover provider
      this.context.subscriptions.push(
        vscode.languages.registerHoverProvider(language, this.hoverProvider)
      );
      
      // Code lens provider
      this.context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(language, this.codeLensProvider)
      );
      
      // Definition provider
      this.context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(language, this.definitionProvider)
      );
      
      // Reference provider
      this.context.subscriptions.push(
        vscode.languages.registerReferenceProvider(language, this.referenceProvider)
      );
      
      // Document formatting provider
      this.context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(language, this.formattingProvider)
      );
      
      // Rename provider
      this.context.subscriptions.push(
        vscode.languages.registerRenameProvider(language, this.renameProvider)
      );
    }
    
    // Semantic tokens provider (global)
    this.context.subscriptions.push(
      vscode.languages.registerDocumentSemanticTokensProvider(
        { pattern: '**/*' },
        this.semanticTokensProvider,
        this.semanticTokensProvider.legend
      )
    );
    
    // Workspace symbol provider (global)
    this.context.subscriptions.push(
      vscode.languages.registerWorkspaceSymbolProvider(this.workspaceSymbolProvider)
    );
  }

  /**
   * Setup workbench extensions (views, panels, etc.)
   */
  private async setupWorkbenchExtensions(): Promise<void> {
    // Initialize view providers
    this.chatProvider = new H2GNNChatProvider(this.context, this.agenticFramework);
    this.knowledgeGraphProvider = new H2GNNKnowledgeGraphProvider(this.context, this.knowledgeGraphManager);
    this.workflowProvider = new H2GNNWorkflowProvider(this.context, this.agenticFramework);
    this.codeInsightsProvider = new H2GNNCodeInsightsProvider(this.context, this.knowledgeGraphManager);
    
    // Register tree data providers
    this.context.subscriptions.push(
      vscode.window.createTreeView('h2gnn.chatView', {
        treeDataProvider: this.chatProvider,
        showCollapseAll: true
      })
    );
    
    this.context.subscriptions.push(
      vscode.window.createTreeView('h2gnn.knowledgeGraph', {
        treeDataProvider: this.knowledgeGraphProvider,
        showCollapseAll: true
      })
    );
    
    this.context.subscriptions.push(
      vscode.window.createTreeView('h2gnn.workflows', {
        treeDataProvider: this.workflowProvider,
        showCollapseAll: true
      })
    );
    
    this.context.subscriptions.push(
      vscode.window.createTreeView('h2gnn.codeInsights', {
        treeDataProvider: this.codeInsightsProvider,
        showCollapseAll: true
      })
    );
  }

  /**
   * Register extension commands
   */
  private registerCommands(): void {
    const commands = [
      // Project analysis
      {
        command: 'h2gnn.analyzeProject',
        handler: this.analyzeProject.bind(this)
      },
      
      // Code generation and editing
      {
        command: 'h2gnn.generateCode',
        handler: this.generateCode.bind(this)
      },
      {
        command: 'h2gnn.explainCode',
        handler: this.explainCode.bind(this)
      },
      {
        command: 'h2gnn.refactorCode',
        handler: this.refactorCode.bind(this)
      },
      {
        command: 'h2gnn.generateDocs',
        handler: this.generateDocs.bind(this)
      },
      {
        command: 'h2gnn.findSimilar',
        handler: this.findSimilar.bind(this)
      },
      
      // UI commands
      {
        command: 'h2gnn.chatOpen',
        handler: this.openChat.bind(this)
      },
      {
        command: 'h2gnn.knowledgeGraphView',
        handler: this.showKnowledgeGraph.bind(this)
      },
      {
        command: 'h2gnn.workflowDesigner',
        handler: this.openWorkflowDesigner.bind(this)
      }
    ];

    for (const { command, handler } of commands) {
      this.context.subscriptions.push(
        vscode.commands.registerCommand(command, handler)
      );
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Document change events for real-time analysis
    this.context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(async (event) => {
        if (this.shouldAnalyzeDocument(event.document)) {
          await this.onDocumentChanged(event);
        }
      })
    );
    
    // File save events for knowledge graph updates
    this.context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (this.shouldAnalyzeDocument(document)) {
          await this.onDocumentSaved(document);
        }
      })
    );
    
    // Active editor change events
    this.context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (editor && this.shouldAnalyzeDocument(editor.document)) {
          await this.onActiveEditorChanged(editor);
        }
      })
    );
    
    // Configuration change events
    this.context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('h2gnn')) {
          this.onConfigurationChanged(event);
        }
      })
    );
  }

  // Command implementations

  /**
   * Analyze project with H²GNN knowledge graphs
   */
  private async analyzeProject(uri?: vscode.Uri): Promise<void> {
    const targetPath = uri?.fsPath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    
    if (!targetPath) {
      vscode.window.showErrorMessage('No workspace folder found to analyze');
      return;
    }

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Analyzing project with H²GNN...',
        cancellable: true
      }, async (progress) => {
        progress.report({ increment: 0, message: 'Initializing analysis...' });
        
        const result = await this.knowledgeGraphManager.analyzeProject(targetPath);
        
        progress.report({ increment: 50, message: 'Generating hyperbolic embeddings...' });
        
        await this.knowledgeGraphManager.generateEmbeddings();
        
        progress.report({ increment: 100, message: 'Analysis complete!' });
        
        vscode.window.showInformationMessage(
          `Project analysis complete! Found ${result.nodeCount} components with ${result.edgeCount} relationships.`,
          'View Knowledge Graph'
        ).then(selection => {
          if (selection === 'View Knowledge Graph') {
            vscode.commands.executeCommand('h2gnn.knowledgeGraphView');
          }
        });
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `Analysis failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate code using AI
   */
  private async generateCode(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    const description = await vscode.window.showInputBox({
      prompt: 'What code would you like to generate?',
      placeholder: 'e.g., function to calculate hyperbolic distance'
    });

    if (!description) return;

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating code with H²GNN...',
        cancellable: false
      }, async () => {
        const generatedCode = await this.agenticFramework.generateCode({
          description,
          context: {
            filePath: editor.document.fileName,
            position: editor.selection.active,
            surroundingCode: this.getSurroundingCode(editor)
          }
        });

        const position = editor.selection.active;
        await editor.edit(editBuilder => {
          editBuilder.insert(position, generatedCode);
        });

        vscode.window.showInformationMessage('Code generated successfully!');
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `Code generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Explain selected code
   */
  private async explainCode(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) {
      vscode.window.showErrorMessage('Please select code to explain');
      return;
    }

    const selectedText = editor.document.getText(editor.selection);

    try {
      const explanation = await this.agenticFramework.explainCode({
        code: selectedText,
        context: {
          filePath: editor.document.fileName,
          languageId: editor.document.languageId
        }
      });

      // Show explanation in a webview
      this.webviewManager.showCodeExplanation(explanation, selectedText);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Code explanation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Refactor code using AI
   */
  private async refactorCode(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) {
      vscode.window.showErrorMessage('Please select code to refactor');
      return;
    }

    const refactorType = await vscode.window.showQuickPick([
      'Extract Function',
      'Optimize Performance',
      'Improve Readability',
      'Add Error Handling',
      'Convert to Async/Await',
      'Add Type Annotations'
    ], {
      placeHolder: 'Select refactoring type'
    });

    if (!refactorType) return;

    const selectedText = editor.document.getText(editor.selection);

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Refactoring code with H²GNN...',
        cancellable: false
      }, async () => {
        const refactoredCode = await this.agenticFramework.refactorCode({
          code: selectedText,
          refactorType,
          context: {
            filePath: editor.document.fileName,
            languageId: editor.document.languageId
          }
        });

        await editor.edit(editBuilder => {
          editBuilder.replace(editor.selection, refactoredCode);
        });

        vscode.window.showInformationMessage('Code refactored successfully!');
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `Refactoring failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate documentation
   */
  private async generateDocs(uri?: vscode.Uri): Promise<void> {
    const targetPath = uri?.fsPath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    
    if (!targetPath) {
      vscode.window.showErrorMessage('No workspace folder found');
      return;
    }

    const docType = await vscode.window.showQuickPick([
      'API Documentation',
      'README',
      'Architecture Overview',
      'Tutorial',
      'Code Comments'
    ], {
      placeHolder: 'Select documentation type'
    });

    if (!docType) return;

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating documentation...',
        cancellable: false
      }, async () => {
        const documentation = await this.agenticFramework.generateDocumentation({
          path: targetPath,
          type: docType,
          format: 'markdown'
        });

        // Create new document with generated documentation
        const doc = await vscode.workspace.openTextDocument({
          content: documentation,
          language: 'markdown'
        });

        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage('Documentation generated successfully!');
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `Documentation generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Find similar code using hyperbolic embeddings
   */
  private async findSimilar(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) {
      vscode.window.showErrorMessage('Please select code to find similar matches');
      return;
    }

    const selectedText = editor.document.getText(editor.selection);

    try {
      const similarCode = await this.knowledgeGraphManager.findSimilarCode(selectedText);

      // Show results in a webview
      this.webviewManager.showSimilarCode(similarCode, selectedText);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Similar code search failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Open chat interface
   */
  private async openChat(): Promise<void> {
    this.webviewManager.showChatInterface();
  }

  /**
   * Show knowledge graph visualization
   */
  private async showKnowledgeGraph(): Promise<void> {
    try {
      const graphData = await this.knowledgeGraphManager.getVisualizationData();
      this.webviewManager.showKnowledgeGraph(graphData);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Knowledge graph visualization failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Open workflow designer
   */
  private async openWorkflowDesigner(): Promise<void> {
    this.webviewManager.showWorkflowDesigner();
  }

  // Event handlers

  private async onDocumentChanged(event: vscode.TextDocumentChangeEvent): Promise<void> {
    // Update knowledge graph incrementally
    await this.knowledgeGraphManager.updateDocument(event.document);
    
    // Update semantic tokens
    this.semanticTokensProvider.refresh(event.document);
    
    // Update status bar
    this.statusBarManager.updateDocumentStatus(event.document);
  }

  private async onDocumentSaved(document: vscode.TextDocument): Promise<void> {
    // Trigger full analysis on save
    await this.knowledgeGraphManager.analyzeDocument(document);
    
    // Update insights
    this.codeInsightsProvider.refresh();
  }

  private async onActiveEditorChanged(editor: vscode.TextEditor): Promise<void> {
    // Update context for AI features
    await this.agenticFramework.setActiveContext({
      filePath: editor.document.fileName,
      languageId: editor.document.languageId,
      position: editor.selection.active
    });
    
    // Update status bar
    this.statusBarManager.updateActiveEditor(editor);
  }

  private onConfigurationChanged(event: vscode.ConfigurationChangeEvent): void {
    // Reload configuration
    const config = vscode.workspace.getConfiguration('h2gnn');
    
    // Update services with new configuration
    this.mcpClient.updateConfiguration(config);
    this.agenticFramework.updateConfiguration(config);
    this.knowledgeGraphManager.updateConfiguration(config);
  }

  // Helper methods

  private shouldAnalyzeDocument(document: vscode.TextDocument): boolean {
    const supportedSchemes = ['file', 'untitled'];
    const supportedLanguages = ['typescript', 'javascript', 'python', 'pocketflow'];
    
    return supportedSchemes.includes(document.uri.scheme) &&
           supportedLanguages.includes(document.languageId) &&
           !document.fileName.includes('node_modules');
  }

  private getSurroundingCode(editor: vscode.TextEditor): string {
    const document = editor.document;
    const position = editor.selection.active;
    
    const startLine = Math.max(0, position.line - 10);
    const endLine = Math.min(document.lineCount - 1, position.line + 10);
    
    const range = new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length);
    return document.getText(range);
  }

  /**
   * Cleanup resources on deactivation
   */
  async deactivate(): Promise<void> {
    console.log('🔄 Deactivating H²GNN PocketFlow Extension');
    
    // Stop language client
    if (this.languageClient) {
      await this.languageClient.stop();
    }
    
    // Cleanup MCP client
    if (this.mcpClient) {
      await this.mcpClient.dispose();
    }
    
    // Cleanup webviews
    if (this.webviewManager) {
      this.webviewManager.dispose();
    }
    
    console.log('✅ H²GNN PocketFlow Extension deactivated');
  }
}

// Extension activation function
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const extension = new H2GNNExtension(context);
  await extension.activate();
  
  // Store extension instance for deactivation
  context.globalState.update('h2gnnExtension', extension);
}

// Extension deactivation function
export async function deactivate(): Promise<void> {
  // No-op - cleanup is handled by the extension instance
}
