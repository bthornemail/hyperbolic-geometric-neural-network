import * as vscode from 'vscode';
import { AgenticFramework } from '../agentic/agenticFramework';
import { KnowledgeGraphManager } from '../knowledge/knowledgeGraphManager';

/**
 * H²GNN Hover Provider
 * 
 * Provides intelligent hover information using knowledge graphs
 * and hyperbolic embeddings for enhanced code understanding.
 */
export class H2GNNHoverProvider implements vscode.HoverProvider {
  private agenticFramework: AgenticFramework;
  private knowledgeGraphManager: KnowledgeGraphManager;
  private cache: Map<string, vscode.Hover> = new Map();

  constructor(agenticFramework: AgenticFramework, knowledgeGraphManager: KnowledgeGraphManager) {
    this.agenticFramework = agenticFramework;
    this.knowledgeGraphManager = knowledgeGraphManager;
  }

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    try {
      // Get word at position
      const wordRange = document.getWordRangeAtPosition(position);
      if (!wordRange) return null;

      const word = document.getText(wordRange);
      if (!word || word.length < 2) return null;

      // Check cache
      const cacheKey = `${document.fileName}:${word}:${position.line}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      // Generate hover content
      const hover = await this.generateHoverContent(document, position, word, wordRange);
      
      // Cache result
      if (hover) {
        this.cache.set(cacheKey, hover);
        setTimeout(() => this.cache.delete(cacheKey), 30000); // 30 seconds
      }

      return hover;

    } catch (error) {
      console.error('❌ Hover provider failed:', error);
      return null;
    }
  }

  private async generateHoverContent(
    document: vscode.TextDocument,
    position: vscode.Position,
    word: string,
    range: vscode.Range
  ): Promise<vscode.Hover | null> {
    const contents: vscode.MarkdownString[] = [];

    // Get semantic information from knowledge graph
    const semanticInfo = await this.getSemanticInformation(word, document);
    if (semanticInfo) {
      contents.push(semanticInfo);
    }

    // Get type information if available
    const typeInfo = await this.getTypeInformation(document, position, word);
    if (typeInfo) {
      contents.push(typeInfo);
    }

    // Get documentation
    const documentation = await this.getDocumentation(word, document);
    if (documentation) {
      contents.push(documentation);
    }

    // Get usage examples
    const examples = await this.getUsageExamples(word, document);
    if (examples) {
      contents.push(examples);
    }

    // Get similar code
    const similarCode = await this.getSimilarCodeInfo(word, document);
    if (similarCode) {
      contents.push(similarCode);
    }

    if (contents.length === 0) {
      return null;
    }

    return new vscode.Hover(contents, range);
  }

  private async getSemanticInformation(word: string, document: vscode.TextDocument): Promise<vscode.MarkdownString | null> {
    try {
      const relationships = await this.knowledgeGraphManager.getSemanticRelationships(word, document);
      
      if (relationships.length === 0) {
        return null;
      }

      const markdown = new vscode.MarkdownString();
      markdown.isTrusted = true;

      // Add symbol information
      markdown.appendMarkdown(`## 🧠 **${word}**\n\n`);

      // Add type information
      const typeRel = relationships.find(r => r.type === 'type');
      if (typeRel) {
        markdown.appendMarkdown(`**Type:** \`${typeRel.related}\`\n\n`);
      }

      // Add definition information
      const defRel = relationships.find(r => r.type === 'defines' || r.type === 'declares');
      if (defRel && defRel.location) {
        const uri = defRel.location.uri;
        const line = defRel.location.range.start.line + 1;
        markdown.appendMarkdown(`**Defined in:** [${uri.fsPath}:${line}](${uri.toString()}#${line})\n\n`);
      }

      // Add relationships
      if (relationships.length > 1) {
        markdown.appendMarkdown(`**Relationships:**\n`);
        for (const rel of relationships.slice(0, 5)) {
          const confidence = rel.confidence ? ` (${(rel.confidence * 100).toFixed(0)}%)` : '';
          markdown.appendMarkdown(`- ${rel.type}: \`${rel.related}\`${confidence}\n`);
        }
        markdown.appendMarkdown('\n');
      }

      return markdown;

    } catch (error) {
      console.warn('Failed to get semantic information:', error);
      return null;
    }
  }

  private async getTypeInformation(
    document: vscode.TextDocument,
    position: vscode.Position,
    word: string
  ): Promise<vscode.MarkdownString | null> {
    try {
      // Analyze the context to determine type information
      const line = document.lineAt(position.line).text;
      const context = this.getSymbolContext(line, position.character);

      if (context.isFunction) {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### 🔧 Function\n`);
        
        // Try to extract function signature
        const signature = this.extractFunctionSignature(document, position, word);
        if (signature) {
          markdown.appendCodeblock(signature, document.languageId);
        }
        
        return markdown;
      }

      if (context.isClass) {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### 📦 Class\n`);
        
        // Try to extract class information
        const classInfo = this.extractClassInfo(document, position, word);
        if (classInfo) {
          markdown.appendMarkdown(classInfo);
        }
        
        return markdown;
      }

      if (context.isVariable) {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### 📊 Variable\n`);
        
        // Try to infer variable type
        const variableType = this.inferVariableType(document, position, word);
        if (variableType) {
          markdown.appendMarkdown(`**Type:** \`${variableType}\`\n`);
        }
        
        return markdown;
      }

      return null;

    } catch (error) {
      console.warn('Failed to get type information:', error);
      return null;
    }
  }

  private async getDocumentation(word: string, document: vscode.TextDocument): Promise<vscode.MarkdownString | null> {
    try {
      // Look for JSDoc or similar documentation
      const doc = this.findDocumentationComment(document, word);
      if (doc) {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### 📖 Documentation\n\n`);
        markdown.appendMarkdown(doc);
        return markdown;
      }

      return null;

    } catch (error) {
      console.warn('Failed to get documentation:', error);
      return null;
    }
  }

  private async getUsageExamples(word: string, document: vscode.TextDocument): Promise<vscode.MarkdownString | null> {
    try {
      // Find usage examples in the current file or related files
      const examples = this.findUsageExamples(document, word);
      
      if (examples.length > 0) {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### 💡 Usage Examples\n\n`);
        
        for (const example of examples.slice(0, 3)) {
          markdown.appendCodeblock(example, document.languageId);
        }
        
        return markdown;
      }

      return null;

    } catch (error) {
      console.warn('Failed to get usage examples:', error);
      return null;
    }
  }

  private async getSimilarCodeInfo(word: string, document: vscode.TextDocument): Promise<vscode.MarkdownString | null> {
    try {
      // Find similar code using knowledge graph
      const similarCode = await this.knowledgeGraphManager.findSimilarCode(word, 3);
      
      if (similarCode.length > 0) {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### 🎯 Similar Code\n\n`);
        
        for (const similar of similarCode) {
          const similarity = (similar.similarity * 100).toFixed(0);
          markdown.appendMarkdown(`- **${similar.name}** (${similarity}% similar)\n`);
        }
        
        return markdown;
      }

      return null;

    } catch (error) {
      console.warn('Failed to get similar code info:', error);
      return null;
    }
  }

  // Helper methods

  private getSymbolContext(line: string, position: number): SymbolContext {
    const textBefore = line.substring(0, position);
    
    return {
      isFunction: /\bfunction\s+\w*$/.test(textBefore) || /\w+\s*\($/.test(textBefore),
      isClass: /\bclass\s+\w*$/.test(textBefore),
      isInterface: /\binterface\s+\w*$/.test(textBefore),
      isVariable: /\b(?:const|let|var)\s+\w*$/.test(textBefore),
      isProperty: /\.\w*$/.test(textBefore),
      isMethod: /\.\w*\($/.test(textBefore)
    };
  }

  private extractFunctionSignature(document: vscode.TextDocument, position: vscode.Position, word: string): string | null {
    // Look for function declaration around the position
    const startLine = Math.max(0, position.line - 5);
    const endLine = Math.min(document.lineCount - 1, position.line + 5);
    
    for (let i = startLine; i <= endLine; i++) {
      const line = document.lineAt(i).text;
      const functionRegex = new RegExp(`(?:export\\s+)?(?:async\\s+)?function\\s+${word}\\s*\\([^)]*\\)(?:\\s*:\\s*[^{]+)?`, 'g');
      const match = functionRegex.exec(line);
      
      if (match) {
        return match[0];
      }
    }
    
    return null;
  }

  private extractClassInfo(document: vscode.TextDocument, position: vscode.Position, word: string): string | null {
    // Look for class declaration
    const startLine = Math.max(0, position.line - 5);
    const endLine = Math.min(document.lineCount - 1, position.line + 5);
    
    for (let i = startLine; i <= endLine; i++) {
      const line = document.lineAt(i).text;
      const classRegex = new RegExp(`(?:export\\s+)?(?:abstract\\s+)?class\\s+${word}(?:\\s+extends\\s+\\w+)?(?:\\s+implements\\s+[\\w,\\s]+)?`, 'g');
      const match = classRegex.exec(line);
      
      if (match) {
        return `\`\`\`${document.languageId}\n${match[0]}\n\`\`\``;
      }
    }
    
    return null;
  }

  private inferVariableType(document: vscode.TextDocument, position: vscode.Position, word: string): string | null {
    // Simple type inference based on assignment
    const line = document.lineAt(position.line).text;
    
    // Look for type annotation
    const typeAnnotationMatch = line.match(new RegExp(`\\b${word}\\s*:\\s*([^=,;]+)`));
    if (typeAnnotationMatch) {
      return typeAnnotationMatch[1].trim();
    }
    
    // Look for assignment with literal values
    const assignmentMatch = line.match(new RegExp(`\\b${word}\\s*=\\s*(.+)`));
    if (assignmentMatch) {
      const value = assignmentMatch[1].trim();
      
      if (/^["']/.test(value)) return 'string';
      if (/^\d+$/.test(value)) return 'number';
      if (/^\d+\.\d+$/.test(value)) return 'number';
      if (/^(true|false)$/.test(value)) return 'boolean';
      if (/^\[/.test(value)) return 'array';
      if (/^\{/.test(value)) return 'object';
      if (/^new\s+(\w+)/.test(value)) {
        const constructorMatch = value.match(/^new\s+(\w+)/);
        return constructorMatch ? constructorMatch[1] : 'object';
      }
    }
    
    return null;
  }

  private findDocumentationComment(document: vscode.TextDocument, word: string): string | null {
    // Look for JSDoc comments above declarations
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i).text;
      
      if (line.includes(word) && (line.includes('function') || line.includes('class') || line.includes('interface'))) {
        // Look for comment block above this line
        let commentLines: string[] = [];
        let j = i - 1;
        
        while (j >= 0) {
          const commentLine = document.lineAt(j).text.trim();
          
          if (commentLine.startsWith('*/')) {
            // Found end of comment block, collect it
            while (j >= 0) {
              const blockLine = document.lineAt(j).text.trim();
              commentLines.unshift(blockLine);
              
              if (blockLine.startsWith('/**')) {
                break;
              }
              j--;
            }
            break;
          } else if (commentLine.startsWith('//')) {
            // Single line comment
            commentLines.unshift(commentLine.replace(/^\/\/\s?/, ''));
          } else if (commentLine === '') {
            // Empty line, continue
          } else {
            // Not a comment, stop looking
            break;
          }
          
          j--;
        }
        
        if (commentLines.length > 0) {
          return commentLines
            .map(line => line.replace(/^\s*\*+\s?/, ''))
            .filter(line => line.length > 0)
            .join('\n');
        }
      }
    }
    
    return null;
  }

  private findUsageExamples(document: vscode.TextDocument, word: string): string[] {
    const examples: string[] = [];
    const text = document.getText();
    
    // Find lines where the word is used
    const regex = new RegExp(`.*\\b${word}\\b.*`, 'g');
    const matches = text.match(regex);
    
    if (matches) {
      // Filter out declarations and get usage examples
      const usageLines = matches
        .filter(line => !line.includes('function') && !line.includes('class') && !line.includes('interface'))
        .filter(line => line.includes('(') || line.includes('=') || line.includes('.'))
        .slice(0, 3);
      
      examples.push(...usageLines.map(line => line.trim()));
    }
    
    return examples;
  }
}

// Type definitions

interface SymbolContext {
  isFunction: boolean;
  isClass: boolean;
  isInterface: boolean;
  isVariable: boolean;
  isProperty: boolean;
  isMethod: boolean;
}
