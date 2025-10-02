import * as vscode from 'vscode';
import { AgenticFramework } from '../agentic/agenticFramework';
import { KnowledgeGraphManager } from '../knowledge/knowledgeGraphManager';

/**
 * H²GNN Completion Provider
 * 
 * Provides AI-powered code completion using hyperbolic embeddings
 * and knowledge graph insights.
 */
export class H2GNNCompletionProvider implements vscode.CompletionItemProvider {
  private agenticFramework: AgenticFramework;
  private knowledgeGraphManager: KnowledgeGraphManager;
  private cache: Map<string, vscode.CompletionItem[]> = new Map();
  private cacheTimeout: number = 5000; // 5 seconds

  constructor(agenticFramework: AgenticFramework, knowledgeGraphManager: KnowledgeGraphManager) {
    this.agenticFramework = agenticFramework;
    this.knowledgeGraphManager = knowledgeGraphManager;
  }

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[] | vscode.CompletionList> {
    try {
      // Get context around cursor
      const completionContext = this.getCompletionContext(document, position);
      
      // Check cache first
      const cacheKey = this.getCacheKey(document, position, completionContext);
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        console.log(`🎯 Using cached completions for ${cacheKey}`);
        return cached;
      }
      
      // Generate AI-powered completions
      const completions = await this.generateCompletions(document, position, completionContext, token);
      
      // Cache results
      this.cache.set(cacheKey, completions);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);
      
      return completions;
      
    } catch (error) {
      console.error('❌ Completion generation failed:', error);
      return [];
    }
  }

  /**
   * Resolve additional details for completion item
   */
  async resolveCompletionItem(
    item: vscode.CompletionItem,
    token: vscode.CancellationToken
  ): Promise<vscode.CompletionItem> {
    try {
      if (item.data && item.data.needsResolution) {
        // Generate detailed documentation
        const documentation = await this.generateCompletionDocumentation(item);
        item.documentation = documentation;
        
        // Add additional text edits if needed
        if (item.data.additionalEdits) {
          item.additionalTextEdits = item.data.additionalEdits;
        }
      }
      
      return item;
      
    } catch (error) {
      console.error('❌ Completion resolution failed:', error);
      return item;
    }
  }

  // Private methods

  /**
   * Get completion context around cursor position
   */
  private getCompletionContext(document: vscode.TextDocument, position: vscode.Position): CompletionContext {
    const line = document.lineAt(position.line);
    const textBeforeCursor = line.text.substring(0, position.character);
    const textAfterCursor = line.text.substring(position.character);
    
    // Get surrounding context
    const startLine = Math.max(0, position.line - 5);
    const endLine = Math.min(document.lineCount - 1, position.line + 5);
    const surroundingText = document.getText(new vscode.Range(startLine, 0, endLine, 0));
    
    // Analyze what type of completion is needed
    const completionType = this.analyzeCompletionType(textBeforeCursor, textAfterCursor);
    
    // Get current scope
    const scope = this.getCurrentScope(document, position);
    
    return {
      textBeforeCursor,
      textAfterCursor,
      surroundingText,
      completionType,
      scope,
      languageId: document.languageId,
      filePath: document.fileName
    };
  }

  /**
   * Analyze what type of completion is needed
   */
  private analyzeCompletionType(textBefore: string, textAfter: string): CompletionType {
    // Check for different completion scenarios
    if (textBefore.endsWith('.')) {
      return 'member';
    }
    
    if (textBefore.match(/import.*from\s+['"]$/)) {
      return 'import';
    }
    
    if (textBefore.match(/new\s+\w*$/)) {
      return 'constructor';
    }
    
    if (textBefore.match(/function\s+\w*$/)) {
      return 'function_name';
    }
    
    if (textBefore.match(/\(\s*\w*$/)) {
      return 'parameter';
    }
    
    if (textBefore.trim().length === 0 || textBefore.match(/^\s+$/)) {
      return 'statement';
    }
    
    return 'identifier';
  }

  /**
   * Get current scope (function, class, etc.)
   */
  private getCurrentScope(document: vscode.TextDocument, position: vscode.Position): ScopeInfo {
    const text = document.getText(new vscode.Range(0, 0, position.line, position.character));
    
    // Find current function
    const functionMatch = text.match(/.*\b(?:function|async\s+function)\s+(\w+)[^{]*{[^}]*$/);
    const currentFunction = functionMatch ? functionMatch[1] : null;
    
    // Find current class
    const classMatch = text.match(/.*\bclass\s+(\w+)[^{]*{[^}]*$/);
    const currentClass = classMatch ? classMatch[1] : null;
    
    // Find current interface
    const interfaceMatch = text.match(/.*\binterface\s+(\w+)[^{]*{[^}]*$/);
    const currentInterface = interfaceMatch ? interfaceMatch[1] : null;
    
    return {
      function: currentFunction,
      class: currentClass,
      interface: currentInterface,
      namespace: null
    };
  }

  /**
   * Generate cache key for completion context
   */
  private getCacheKey(document: vscode.TextDocument, position: vscode.Position, context: CompletionContext): string {
    const positionKey = `${position.line}:${position.character}`;
    const contextKey = `${context.completionType}:${context.textBeforeCursor.slice(-20)}`;
    return `${document.fileName}:${positionKey}:${contextKey}`;
  }

  /**
   * Generate AI-powered completions
   */
  private async generateCompletions(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: CompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CompletionItem[]> {
    const completions: vscode.CompletionItem[] = [];
    
    // Add semantic completions based on knowledge graph
    const semanticCompletions = await this.generateSemanticCompletions(document, position, context);
    completions.push(...semanticCompletions);
    
    // Add pattern-based completions
    const patternCompletions = await this.generatePatternCompletions(document, position, context);
    completions.push(...patternCompletions);
    
    // Add context-aware completions
    const contextCompletions = await this.generateContextualCompletions(document, position, context);
    completions.push(...contextCompletions);
    
    // Add AI-generated completions
    const aiCompletions = await this.generateAICompletions(document, position, context, token);
    completions.push(...aiCompletions);
    
    // Sort by relevance and remove duplicates
    return this.rankAndDedupeCompletions(completions, context);
  }

  /**
   * Generate semantic completions using knowledge graph
   */
  private async generateSemanticCompletions(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: CompletionContext
  ): Promise<vscode.CompletionItem[]> {
    const completions: vscode.CompletionItem[] = [];
    
    try {
      if (context.completionType === 'member') {
        // Get object before dot
        const objectName = this.extractObjectName(context.textBeforeCursor);
        if (objectName) {
          const relationships = await this.knowledgeGraphManager.getSemanticRelationships(objectName, document);
          
          for (const rel of relationships) {
            if (rel.type === 'has_member' || rel.type === 'has_method') {
              const completion = new vscode.CompletionItem(rel.related, vscode.CompletionItemKind.Method);
              completion.detail = `From knowledge graph: ${rel.symbol}`;
              completion.sortText = '0_semantic_' + rel.related;
              completions.push(completion);
            }
          }
        }
      }
      
      if (context.completionType === 'import') {
        // Suggest imports based on knowledge graph
        const similarCode = await this.knowledgeGraphManager.findSimilarCode(context.surroundingText, 10);
        
        for (const similar of similarCode) {
          if (similar.name.includes('/') || similar.name.includes('.')) {
            const completion = new vscode.CompletionItem(similar.name, vscode.CompletionItemKind.Module);
            completion.detail = `Similarity: ${(similar.similarity * 100).toFixed(1)}%`;
            completion.sortText = '1_import_' + similar.name;
            completions.push(completion);
          }
        }
      }
      
    } catch (error) {
      console.warn('Failed to generate semantic completions:', error);
    }
    
    return completions;
  }

  /**
   * Generate pattern-based completions
   */
  private async generatePatternCompletions(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: CompletionContext
  ): Promise<vscode.CompletionItem[]> {
    const completions: vscode.CompletionItem[] = [];
    
    // TypeScript/JavaScript patterns
    if (context.languageId === 'typescript' || context.languageId === 'javascript') {
      completions.push(...this.getTypeScriptPatterns(context));
    }
    
    // Python patterns
    if (context.languageId === 'python') {
      completions.push(...this.getPythonPatterns(context));
    }
    
    // PocketFlow patterns
    if (context.languageId === 'pocketflow') {
      completions.push(...this.getPocketFlowPatterns(context));
    }
    
    return completions;
  }

  /**
   * Generate contextual completions
   */
  private async generateContextualCompletions(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: CompletionContext
  ): Promise<vscode.CompletionItem[]> {
    const completions: vscode.CompletionItem[] = [];
    
    // Analyze document for local symbols
    const analysis = this.knowledgeGraphManager.getDocumentAnalysis(document.fileName);
    if (analysis) {
      // Add local functions
      for (const func of analysis.structure.functions) {
        if (func.name !== context.scope.function) { // Don't suggest current function
          const completion = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
          completion.detail = 'Local function';
          completion.sortText = '2_local_' + func.name;
          completions.push(completion);
        }
      }
      
      // Add local classes
      for (const cls of analysis.structure.classes) {
        const completion = new vscode.CompletionItem(cls.name, vscode.CompletionItemKind.Class);
        completion.detail = 'Local class';
        completion.sortText = '2_local_' + cls.name;
        completions.push(completion);
      }
      
      // Add local interfaces
      for (const intf of analysis.structure.interfaces) {
        const completion = new vscode.CompletionItem(intf.name, vscode.CompletionItemKind.Interface);
        completion.detail = 'Local interface';
        completion.sortText = '2_local_' + intf.name;
        completions.push(completion);
      }
    }
    
    return completions;
  }

  /**
   * Generate AI-powered completions
   */
  private async generateAICompletions(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: CompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CompletionItem[]> {
    const completions: vscode.CompletionItem[] = [];
    
    try {
      // Only generate AI completions for complex scenarios
      if (context.completionType === 'statement' || context.completionType === 'identifier') {
        const suggestion = await this.agenticFramework.generateCode({
          description: `Complete this code: ${context.textBeforeCursor}`,
          context: {
            filePath: document.fileName,
            position,
            surroundingCode: context.surroundingText
          }
        });
        
        if (suggestion && suggestion.trim()) {
          const completion = new vscode.CompletionItem('AI Suggestion', vscode.CompletionItemKind.Snippet);
          completion.insertText = new vscode.SnippetString(suggestion);
          completion.detail = 'Generated by H²GNN AI';
          completion.documentation = new vscode.MarkdownString(`AI-generated code completion based on context analysis.`);
          completion.sortText = '3_ai_suggestion';
          completion.data = { needsResolution: true };
          completions.push(completion);
        }
      }
      
    } catch (error) {
      console.warn('Failed to generate AI completions:', error);
    }
    
    return completions;
  }

  /**
   * Get TypeScript/JavaScript specific patterns
   */
  private getTypeScriptPatterns(context: CompletionContext): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];
    
    if (context.completionType === 'statement') {
      // Common TypeScript patterns
      const patterns = [
        { label: 'if', snippet: 'if (${1:condition}) {\n\t${2}\n}' },
        { label: 'for', snippet: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${3}\n}' },
        { label: 'try', snippet: 'try {\n\t${1}\n} catch (${2:error}) {\n\t${3}\n}' },
        { label: 'async function', snippet: 'async function ${1:name}(${2:params}): Promise<${3:void}> {\n\t${4}\n}' },
        { label: 'interface', snippet: 'interface ${1:Name} {\n\t${2}\n}' },
        { label: 'class', snippet: 'class ${1:Name} {\n\tconstructor(${2:params}) {\n\t\t${3}\n\t}\n}' }
      ];
      
      for (const pattern of patterns) {
        const completion = new vscode.CompletionItem(pattern.label, vscode.CompletionItemKind.Snippet);
        completion.insertText = new vscode.SnippetString(pattern.snippet);
        completion.detail = 'TypeScript pattern';
        completion.sortText = '4_pattern_' + pattern.label;
        completions.push(completion);
      }
    }
    
    return completions;
  }

  /**
   * Get Python specific patterns
   */
  private getPythonPatterns(context: CompletionContext): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];
    
    if (context.completionType === 'statement') {
      const patterns = [
        { label: 'if', snippet: 'if ${1:condition}:\n    ${2:pass}' },
        { label: 'for', snippet: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}' },
        { label: 'def', snippet: 'def ${1:function_name}(${2:params}):\n    ${3:pass}' },
        { label: 'class', snippet: 'class ${1:ClassName}:\n    def __init__(self${2:, params}):\n        ${3:pass}' },
        { label: 'try', snippet: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}' }
      ];
      
      for (const pattern of patterns) {
        const completion = new vscode.CompletionItem(pattern.label, vscode.CompletionItemKind.Snippet);
        completion.insertText = new vscode.SnippetString(pattern.snippet);
        completion.detail = 'Python pattern';
        completion.sortText = '4_pattern_' + pattern.label;
        completions.push(completion);
      }
    }
    
    return completions;
  }

  /**
   * Get PocketFlow specific patterns
   */
  private getPocketFlowPatterns(context: CompletionContext): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];
    
    const patterns = [
      { label: 'Node', snippet: 'class ${1:NodeName}(Node):\n    def exec(self, ${2:input}):\n        ${3:return result}' },
      { label: 'Flow', snippet: 'flow = Flow(start=${1:start_node})' },
      { label: 'BatchNode', snippet: 'class ${1:BatchNodeName}(BatchNode):\n    def prep(self, shared):\n        return ${2:items}\n    \n    def exec(self, item):\n        return ${3:result}' },
      { label: 'AsyncNode', snippet: 'class ${1:AsyncNodeName}(AsyncNode):\n    async def exec_async(self, ${2:input}):\n        return ${3:result}' }
    ];
    
    for (const pattern of patterns) {
      const completion = new vscode.CompletionItem(pattern.label, vscode.CompletionItemKind.Snippet);
      completion.insertText = new vscode.SnippetString(pattern.snippet);
      completion.detail = 'PocketFlow pattern';
      completion.sortText = '4_pocketflow_' + pattern.label;
      completions.push(completion);
    }
    
    return completions;
  }

  /**
   * Rank and deduplicate completions
   */
  private rankAndDedupeCompletions(completions: vscode.CompletionItem[], context: CompletionContext): vscode.CompletionItem[] {
    // Remove duplicates based on label
    const unique = new Map<string, vscode.CompletionItem>();
    
    for (const completion of completions) {
      const key = completion.label;
      if (!unique.has(key) || (completion.sortText && completion.sortText < (unique.get(key)?.sortText || 'z'))) {
        unique.set(key, completion);
      }
    }
    
    // Sort by sort text
    const sorted = Array.from(unique.values()).sort((a, b) => {
      const sortA = a.sortText || a.label;
      const sortB = b.sortText || b.label;
      return sortA.localeCompare(sortB);
    });
    
    // Limit to reasonable number
    return sorted.slice(0, 20);
  }

  /**
   * Extract object name before dot for member access
   */
  private extractObjectName(textBefore: string): string | null {
    const match = textBefore.match(/(\w+)\.$/);
    return match ? match[1] : null;
  }

  /**
   * Generate detailed documentation for completion item
   */
  private async generateCompletionDocumentation(item: vscode.CompletionItem): Promise<vscode.MarkdownString> {
    try {
      const explanation = await this.agenticFramework.explainCode({
        code: item.insertText?.toString() || item.label,
        context: { languageId: 'typescript' }
      });
      
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**${item.label}**\n\n`);
      markdown.appendMarkdown(explanation.summary);
      
      if (explanation.examples && explanation.examples.length > 0) {
        markdown.appendMarkdown('\n\n**Example:**\n```typescript\n');
        markdown.appendMarkdown(explanation.examples[0]);
        markdown.appendMarkdown('\n```');
      }
      
      return markdown;
      
    } catch (error) {
      console.warn('Failed to generate completion documentation:', error);
      return new vscode.MarkdownString(item.detail || '');
    }
  }
}

// Type definitions

interface CompletionContext {
  textBeforeCursor: string;
  textAfterCursor: string;
  surroundingText: string;
  completionType: CompletionType;
  scope: ScopeInfo;
  languageId: string;
  filePath: string;
}

type CompletionType = 'member' | 'import' | 'constructor' | 'function_name' | 'parameter' | 'statement' | 'identifier';

interface ScopeInfo {
  function: string | null;
  class: string | null;
  interface: string | null;
  namespace: string | null;
}
