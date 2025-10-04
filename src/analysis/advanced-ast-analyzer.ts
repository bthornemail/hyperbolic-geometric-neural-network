#!/usr/bin/env tsx

/**
 * Advanced AST Analyzer
 * 
 * This module provides sophisticated code analysis capabilities including:
 * - Cognitive complexity calculation
 * - Halstead complexity metrics
 * - Code smells detection
 * - Advanced anti-pattern identification
 * - Multi-language support (TypeScript, JavaScript, Python, Java)
 */

import * as ts from 'typescript';
import { parse } from '@babel/parser';
import { getSharedH2GNN } from '../core/centralized-h2gnn-config';

export interface CodeMetrics {
  cognitiveComplexity: number;
  halsteadComplexity: {
    vocabulary: number;
    length: number;
    volume: number;
    difficulty: number;
    effort: number;
    timeToUnderstand: number;
  };
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  linesOfCode: number;
  commentDensity: number;
}

export interface CodeSmell {
  type: 'long_method' | 'large_class' | 'duplicate_code' | 'dead_code' | 'complex_condition' | 'too_many_parameters' | 'feature_envy' | 'data_clumps' | 'primitive_obsession' | 'switch_statements';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    startLine: number;
    endLine: number;
    startColumn: number;
    endColumn: number;
  };
  description: string;
  suggestion: string;
  confidence: number;
}

export interface AntiPattern {
  type: 'god_class' | 'spaghetti_code' | 'copy_paste_programming' | 'golden_hammer' | 'cargo_cult_programming' | 'reinventing_the_wheel' | 'magic_numbers' | 'stringly_typed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    startLine: number;
    endLine: number;
  };
  description: string;
  suggestion: string;
  confidence: number;
}

export interface AdvancedAnalysisResult {
  metrics: CodeMetrics;
  codeSmells: CodeSmell[];
  antiPatterns: AntiPattern[];
  qualityScore: number;
  recommendations: string[];
  h2gnnInsights: any[];
}

export class AdvancedASTAnalyzer {
  private h2gnn: any;

  constructor() {
    this.h2gnn = getSharedH2GNN();
  }

  /**
   * Perform advanced analysis on code
   */
  async analyzeCode(
    code: string,
    language: 'typescript' | 'javascript' | 'python' | 'java' = 'typescript',
    filePath?: string
  ): Promise<AdvancedAnalysisResult> {
    console.warn(`🔍 Performing advanced analysis on ${language} code`);
    
    // Parse code into AST
    const ast = this.parseCode(code, language);
    
    // Calculate metrics
    const metrics = this.calculateMetrics(ast, code, language);
    
    // Detect code smells
    const codeSmells = this.detectCodeSmells(ast, code, language);
    
    // Detect anti-patterns
    const antiPatterns = this.detectAntiPatterns(ast, code, language);
    
    // Calculate quality score
    const qualityScore = this.calculateQualityScore(metrics, codeSmells, antiPatterns);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(metrics, codeSmells, antiPatterns);
    
    // Get H²GNN insights
    const h2gnnInsights = await this.getH2GNNInsights(code, language, metrics, codeSmells, antiPatterns);
    
    // Learn from this analysis
    await this.learnFromAnalysis(code, language, metrics, codeSmells, antiPatterns, qualityScore);
    
    return {
      metrics,
      codeSmells,
      antiPatterns,
      qualityScore,
      recommendations,
      h2gnnInsights
    };
  }

  /**
   * Parse code into AST based on language
   */
  private parseCode(code: string, language: string): any {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return this.parseJavaScript(code, language);
      case 'python':
        return this.parsePython(code);
      case 'java':
        return this.parseJava(code);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  /**
   * Parse JavaScript/TypeScript code
   */
  private parseJavaScript(code: string, language: string): any {
    try {
      return parse(code, {
        sourceType: 'module',
        plugins: language === 'typescript' ? ['typescript', 'decorators-legacy'] : ['decorators-legacy']
      });
    } catch (error) {
      // Fallback to TypeScript compiler API
      return ts.createSourceFile(
        'temp.ts',
        code,
        ts.ScriptTarget.Latest,
        true
      );
    }
  }

  /**
   * Parse Python code (placeholder - would need python parser)
   */
  private parsePython(code: string): any {
    // Placeholder for Python AST parsing
    // In a real implementation, you'd use a Python AST parser
    return {
      type: 'python_ast',
      body: code.split('\n').map((line, index) => ({
        type: 'line',
        line: index + 1,
        content: line
      }))
    };
  }

  /**
   * Parse Java code (placeholder - would need Java parser)
   */
  private parseJava(code: string): any {
    // Placeholder for Java AST parsing
    // In a real implementation, you'd use a Java AST parser
    return {
      type: 'java_ast',
      body: code.split('\n').map((line, index) => ({
        type: 'line',
        line: index + 1,
        content: line
      }))
    };
  }

  /**
   * Calculate comprehensive code metrics
   */
  private calculateMetrics(ast: any, code: string, language: string): CodeMetrics {
    const lines = code.split('\n');
    const linesOfCode = lines.filter(line => line.trim().length > 0).length;
    const commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*')).length;
    
    // Cognitive complexity calculation
    const cognitiveComplexity = this.calculateCognitiveComplexity(ast);
    
    // Halstead complexity metrics
    const halsteadComplexity = this.calculateHalsteadComplexity(code);
    
    // Cyclomatic complexity
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(ast);
    
    // Maintainability index
    const maintainabilityIndex = this.calculateMaintainabilityIndex(
      cognitiveComplexity,
      halsteadComplexity.volume,
      linesOfCode,
      commentLines
    );
    
    // Comment density
    const commentDensity = commentLines / linesOfCode;
    
    return {
      cognitiveComplexity,
      halsteadComplexity,
      cyclomaticComplexity,
      maintainabilityIndex,
      linesOfCode,
      commentDensity
    };
  }

  /**
   * Calculate cognitive complexity
   */
  private calculateCognitiveComplexity(ast: any): number {
    let complexity = 0;
    
    const traverse = (node: any) => {
      if (!node) return;
      
      // Increment for control flow structures
      if (node.type === 'IfStatement' || node.type === 'WhileStatement' || 
          node.type === 'ForStatement' || node.type === 'SwitchStatement') {
        complexity += 1;
      }
      
      // Increment for nested conditions
      if (node.type === 'LogicalExpression' && (node.operator === '&&' || node.operator === '||')) {
        complexity += 1;
      }
      
      // Increment for catch blocks
      if (node.type === 'CatchClause') {
        complexity += 1;
      }
      
      // Traverse children
      for (const key in node) {
        if (key !== 'type' && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else {
            traverse(node[key]);
          }
        }
      }
    };
    
    traverse(ast);
    return complexity;
  }

  /**
   * Calculate Halstead complexity metrics
   */
  private calculateHalsteadComplexity(code: string): any {
    const tokens = code.split(/\s+/).filter(token => token.length > 0);
    const uniqueTokens = new Set(tokens);
    
    const vocabulary = uniqueTokens.size;
    const length = tokens.length;
    const volume = length * Math.log2(vocabulary);
    const difficulty = (uniqueTokens.size / 2) * (tokens.length / uniqueTokens.size);
    const effort = difficulty * volume;
    const timeToUnderstand = effort / 18; // 18 is a constant for time estimation
    
    return {
      vocabulary,
      length,
      volume,
      difficulty,
      effort,
      timeToUnderstand
    };
  }

  /**
   * Calculate cyclomatic complexity
   */
  private calculateCyclomaticComplexity(ast: any): number {
    let complexity = 1; // Base complexity
    
    const traverse = (node: any) => {
      if (!node) return;
      
      // Increment for decision points
      if (node.type === 'IfStatement' || node.type === 'WhileStatement' || 
          node.type === 'ForStatement' || node.type === 'SwitchStatement' ||
          node.type === 'CatchClause') {
        complexity += 1;
      }
      
      // Increment for logical operators
      if (node.type === 'LogicalExpression') {
        complexity += 1;
      }
      
      // Traverse children
      for (const key in node) {
        if (key !== 'type' && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else {
            traverse(node[key]);
          }
        }
      }
    };
    
    traverse(ast);
    return complexity;
  }

  /**
   * Calculate maintainability index
   */
  private calculateMaintainabilityIndex(
    cognitiveComplexity: number,
    halsteadVolume: number,
    linesOfCode: number,
    commentLines: number
  ): number {
    const maxMaintainability = 171;
    const halsteadVolumeLog = Math.log(halsteadVolume + 1);
    const cognitiveComplexityLog = Math.log(cognitiveComplexity + 1);
    const linesOfCodeLog = Math.log(linesOfCode + 1);
    const commentDensity = commentLines / (linesOfCode + 1);
    
    const maintainability = maxMaintainability - 
      (5.2 * halsteadVolumeLog) - 
      (0.23 * cognitiveComplexityLog) - 
      (16.2 * linesOfCodeLog) + 
      (50 * commentDensity);
    
    return Math.max(0, Math.min(100, maintainability));
  }

  /**
   * Detect code smells
   */
  private detectCodeSmells(ast: any, code: string, language: string): CodeSmell[] {
    const smells: CodeSmell[] = [];
    
    // Long method detection
    const longMethods = this.detectLongMethods(ast, code);
    smells.push(...longMethods);
    
    // Large class detection
    const largeClasses = this.detectLargeClasses(ast, code);
    smells.push(...largeClasses);
    
    // Duplicate code detection
    const duplicateCode = this.detectDuplicateCode(ast, code);
    smells.push(...duplicateCode);
    
    // Dead code detection
    const deadCode = this.detectDeadCode(ast, code);
    smells.push(...deadCode);
    
    // Complex condition detection
    const complexConditions = this.detectComplexConditions(ast, code);
    smells.push(...complexConditions);
    
    // Too many parameters detection
    const tooManyParams = this.detectTooManyParameters(ast, code);
    smells.push(...tooManyParams);
    
    return smells;
  }

  /**
   * Detect long methods
   */
  private detectLongMethods(ast: any, code: string): CodeSmell[] {
    const smells: CodeSmell[] = [];
    const lines = code.split('\n');
    
    const traverse = (node: any, depth = 0) => {
      if (!node) return;
      
      if (node.type === 'FunctionDeclaration' || node.type === 'MethodDefinition') {
        const startLine = node.loc?.start?.line || 1;
        const endLine = node.loc?.end?.line || startLine;
        const methodLength = endLine - startLine + 1;
        
        if (methodLength > 50) {
          smells.push({
            type: 'long_method',
            severity: methodLength > 100 ? 'critical' : methodLength > 75 ? 'high' : 'medium',
            location: {
              startLine,
              endLine,
              startColumn: node.loc?.start?.column || 0,
              endColumn: node.loc?.end?.column || 0
            },
            description: `Method is ${methodLength} lines long (threshold: 50)`,
            suggestion: 'Consider breaking this method into smaller, more focused methods',
            confidence: 0.9
          });
        }
      }
      
      // Traverse children
      for (const key in node) {
        if (key !== 'type' && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach((child: any) => traverse(child, depth + 1));
          } else {
            traverse(node[key], depth + 1);
          }
        }
      }
    };
    
    traverse(ast);
    return smells;
  }

  /**
   * Detect large classes
   */
  private detectLargeClasses(ast: any, code: string): CodeSmell[] {
    const smells: CodeSmell[] = [];
    
    const traverse = (node: any) => {
      if (!node) return;
      
      if (node.type === 'ClassDeclaration') {
        const methods = this.countMethods(node);
        const properties = this.countProperties(node);
        const totalMembers = methods + properties;
        
        if (totalMembers > 20) {
          smells.push({
            type: 'large_class',
            severity: totalMembers > 50 ? 'critical' : totalMembers > 35 ? 'high' : 'medium',
            location: {
              startLine: node.loc?.start?.line || 1,
              endLine: node.loc?.end?.line || 1,
              startColumn: node.loc?.start?.column || 0,
              endColumn: node.loc?.end?.column || 0
            },
            description: `Class has ${totalMembers} members (threshold: 20)`,
            suggestion: 'Consider splitting this class into smaller, more focused classes',
            confidence: 0.8
          });
        }
      }
      
      // Traverse children
      for (const key in node) {
        if (key !== 'type' && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else {
            traverse(node[key]);
          }
        }
      }
    };
    
    traverse(ast);
    return smells;
  }

  /**
   * Count methods in a class
   */
  private countMethods(classNode: any): number {
    if (!classNode.body || !classNode.body.body) return 0;
    
    return classNode.body.body.filter((member: any) => 
      member.type === 'MethodDefinition' || member.type === 'FunctionDeclaration'
    ).length;
  }

  /**
   * Count properties in a class
   */
  private countProperties(classNode: any): number {
    if (!classNode.body || !classNode.body.body) return 0;
    
    return classNode.body.body.filter((member: any) => 
      member.type === 'PropertyDefinition' || member.type === 'ClassProperty'
    ).length;
  }

  /**
   * Detect duplicate code
   */
  private detectDuplicateCode(ast: any, code: string): CodeSmell[] {
    const smells: CodeSmell[] = [];
    const lines = code.split('\n');
    
    // Simple duplicate detection based on line similarity
    const lineGroups = new Map<string, number[]>();
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.length > 10) { // Only consider substantial lines
        if (!lineGroups.has(trimmed)) {
          lineGroups.set(trimmed, []);
        }
        lineGroups.get(trimmed)!.push(index + 1);
      }
    });
    
    lineGroups.forEach((lineNumbers, line) => {
      if (lineNumbers.length > 3) { // 3+ occurrences
        smells.push({
          type: 'duplicate_code',
          severity: lineNumbers.length > 5 ? 'high' : 'medium',
          location: {
            startLine: lineNumbers[0],
            endLine: lineNumbers[0],
            startColumn: 0,
            endColumn: line.length
          },
          description: `Line appears ${lineNumbers.length} times`,
          suggestion: 'Consider extracting this code into a reusable function',
          confidence: 0.7
        });
      }
    });
    
    return smells;
  }

  /**
   * Detect dead code
   */
  private detectDeadCode(ast: any, code: string): CodeSmell[] {
    const smells: CodeSmell[] = [];
    
    // This is a simplified dead code detection
    // In a real implementation, you'd need more sophisticated analysis
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Detect unreachable code after return statements
      if (trimmed.startsWith('return') && index < lines.length - 1) {
        const nextLine = lines[index + 1].trim();
        if (nextLine.length > 0 && !nextLine.startsWith('}') && !nextLine.startsWith('//')) {
          smells.push({
            type: 'dead_code',
            severity: 'medium',
            location: {
              startLine: index + 2,
              endLine: index + 2,
              startColumn: 0,
              endColumn: nextLine.length
            },
            description: 'Code after return statement may be unreachable',
            suggestion: 'Remove unreachable code or restructure the logic',
            confidence: 0.6
          });
        }
      }
    });
    
    return smells;
  }

  /**
   * Detect complex conditions
   */
  private detectComplexConditions(ast: any, code: string): CodeSmell[] {
    const smells: CodeSmell[] = [];
    
    const traverse = (node: any) => {
      if (!node) return;
      
      if (node.type === 'IfStatement' || node.type === 'WhileStatement') {
        const condition = node.test;
        if (condition) {
          const complexity = this.calculateConditionComplexity(condition);
          if (complexity > 3) {
            smells.push({
              type: 'complex_condition',
              severity: complexity > 5 ? 'high' : 'medium',
              location: {
                startLine: condition.loc?.start?.line || 1,
                endLine: condition.loc?.end?.line || 1,
                startColumn: condition.loc?.start?.column || 0,
                endColumn: condition.loc?.end?.column || 0
              },
              description: `Condition has complexity ${complexity} (threshold: 3)`,
              suggestion: 'Consider simplifying this condition or extracting it to a well-named method',
              confidence: 0.8
            });
          }
        }
      }
      
      // Traverse children
      for (const key in node) {
        if (key !== 'type' && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else {
            traverse(node[key]);
          }
        }
      }
    };
    
    traverse(ast);
    return smells;
  }

  /**
   * Calculate condition complexity
   */
  private calculateConditionComplexity(condition: any): number {
    let complexity = 0;
    
    const traverse = (node: any) => {
      if (!node) return;
      
      if (node.type === 'LogicalExpression') {
        complexity += 1;
        traverse(node.left);
        traverse(node.right);
      } else if (node.type === 'BinaryExpression') {
        complexity += 1;
        traverse(node.left);
        traverse(node.right);
      } else if (node.type === 'UnaryExpression') {
        complexity += 1;
        traverse(node.argument);
      } else {
        // Traverse children
        for (const key in node) {
          if (key !== 'type' && typeof node[key] === 'object') {
            if (Array.isArray(node[key])) {
              node[key].forEach(traverse);
            } else {
              traverse(node[key]);
            }
          }
        }
      }
    };
    
    traverse(condition);
    return complexity;
  }

  /**
   * Detect too many parameters
   */
  private detectTooManyParameters(ast: any, code: string): CodeSmell[] {
    const smells: CodeSmell[] = [];
    
    const traverse = (node: any) => {
      if (!node) return;
      
      if (node.type === 'FunctionDeclaration' || node.type === 'MethodDefinition') {
        const params = node.params || [];
        if (params.length > 5) {
          smells.push({
            type: 'too_many_parameters',
            severity: params.length > 8 ? 'high' : 'medium',
            location: {
              startLine: node.loc?.start?.line || 1,
              endLine: node.loc?.end?.line || 1,
              startColumn: node.loc?.start?.column || 0,
              endColumn: node.loc?.end?.column || 0
            },
            description: `Function has ${params.length} parameters (threshold: 5)`,
            suggestion: 'Consider using an options object or breaking the function into smaller ones',
            confidence: 0.9
          });
        }
      }
      
      // Traverse children
      for (const key in node) {
        if (key !== 'type' && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else {
            traverse(node[key]);
          }
        }
      }
    };
    
    traverse(ast);
    return smells;
  }

  /**
   * Detect anti-patterns
   */
  private detectAntiPatterns(ast: any, code: string, language: string): AntiPattern[] {
    const antiPatterns: AntiPattern[] = [];
    
    // God class detection
    const godClasses = this.detectGodClasses(ast, code);
    antiPatterns.push(...godClasses);
    
    // Magic numbers detection
    const magicNumbers = this.detectMagicNumbers(ast, code);
    antiPatterns.push(...magicNumbers);
    
    // Stringly typed detection
    const stringlyTyped = this.detectStringlyTyped(ast, code);
    antiPatterns.push(...stringlyTyped);
    
    return antiPatterns;
  }

  /**
   * Detect god classes
   */
  private detectGodClasses(ast: any, code: string): AntiPattern[] {
    const antiPatterns: AntiPattern[] = [];
    
    const traverse = (node: any) => {
      if (!node) return;
      
      if (node.type === 'ClassDeclaration') {
        const methods = this.countMethods(node);
        const properties = this.countProperties(node);
        const totalMembers = methods + properties;
        
        if (totalMembers > 30) {
          antiPatterns.push({
            type: 'god_class',
            severity: totalMembers > 50 ? 'critical' : 'high',
            location: {
              startLine: node.loc?.start?.line || 1,
              endLine: node.loc?.end?.line || 1
            },
            description: `Class has ${totalMembers} members, indicating a god class`,
            suggestion: 'Break this class into smaller, more focused classes following Single Responsibility Principle',
            confidence: 0.8
          });
        }
      }
      
      // Traverse children
      for (const key in node) {
        if (key !== 'type' && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else {
            traverse(node[key]);
          }
        }
      }
    };
    
    traverse(ast);
    return antiPatterns;
  }

  /**
   * Detect magic numbers
   */
  private detectMagicNumbers(ast: any, code: string): AntiPattern[] {
    const antiPatterns: AntiPattern[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      // Look for numeric literals that might be magic numbers
      const magicNumberRegex = /\b(?:[1-9]\d{2,}|[2-9]\d)\b/g;
      const matches = line.match(magicNumberRegex);
      
      if (matches) {
        matches.forEach(match => {
          const num = parseInt(match);
          if (num > 10 && num !== 100 && num !== 1000) { // Common exceptions
            antiPatterns.push({
              type: 'magic_numbers',
              severity: 'medium',
              location: {
                startLine: index + 1,
                endLine: index + 1
              },
              description: `Magic number ${match} found`,
              suggestion: 'Replace with a named constant to improve readability',
              confidence: 0.7
            });
          }
        });
      }
    });
    
    return antiPatterns;
  }

  /**
   * Detect stringly typed code
   */
  private detectStringlyTyped(ast: any, code: string): AntiPattern[] {
    const antiPatterns: AntiPattern[] = [];
    
    const traverse = (node: any) => {
      if (!node) return;
      
      if (node.type === 'IfStatement' && node.test) {
        const condition = node.test;
        if (condition.type === 'BinaryExpression' && 
            condition.operator === '===' && 
            condition.right.type === 'Literal' && 
            typeof condition.right.value === 'string') {
          antiPatterns.push({
            type: 'stringly_typed',
            severity: 'medium',
            location: {
              startLine: condition.loc?.start?.line || 1,
              endLine: condition.loc?.end?.line || 1
            },
            description: 'String comparison suggests stringly typed code',
            suggestion: 'Consider using enums or constants instead of string literals',
            confidence: 0.6
          });
        }
      }
      
      // Traverse children
      for (const key in node) {
        if (key !== 'type' && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else {
            traverse(node[key]);
          }
        }
      }
    };
    
    traverse(ast);
    return antiPatterns;
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(metrics: CodeMetrics, codeSmells: CodeSmell[], antiPatterns: AntiPattern[]): number {
    let score = 100;
    
    // Deduct for high complexity
    if (metrics.cognitiveComplexity > 10) score -= 20;
    if (metrics.cyclomaticComplexity > 10) score -= 15;
    if (metrics.maintainabilityIndex < 50) score -= 25;
    
    // Deduct for code smells
    const criticalSmells = codeSmells.filter(s => s.severity === 'critical').length;
    const highSmells = codeSmells.filter(s => s.severity === 'high').length;
    const mediumSmells = codeSmells.filter(s => s.severity === 'medium').length;
    
    score -= criticalSmells * 15;
    score -= highSmells * 10;
    score -= mediumSmells * 5;
    
    // Deduct for anti-patterns
    const criticalAntiPatterns = antiPatterns.filter(a => a.severity === 'critical').length;
    const highAntiPatterns = antiPatterns.filter(a => a.severity === 'high').length;
    
    score -= criticalAntiPatterns * 20;
    score -= highAntiPatterns * 15;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(metrics: CodeMetrics, codeSmells: CodeSmell[], antiPatterns: AntiPattern[]): string[] {
    const recommendations: string[] = [];
    
    // Complexity recommendations
    if (metrics.cognitiveComplexity > 10) {
      recommendations.push('Consider refactoring to reduce cognitive complexity');
    }
    
    if (metrics.cyclomaticComplexity > 10) {
      recommendations.push('Reduce cyclomatic complexity by simplifying conditional logic');
    }
    
    if (metrics.maintainabilityIndex < 50) {
      recommendations.push('Improve maintainability by adding comments and reducing complexity');
    }
    
    // Code smell recommendations
    const smellTypes = new Set(codeSmells.map(s => s.type));
    if (smellTypes.has('long_method')) {
      recommendations.push('Break down long methods into smaller, focused methods');
    }
    
    if (smellTypes.has('large_class')) {
      recommendations.push('Split large classes following Single Responsibility Principle');
    }
    
    if (smellTypes.has('duplicate_code')) {
      recommendations.push('Extract common code into reusable functions');
    }
    
    // Anti-pattern recommendations
    const antiPatternTypes = new Set(antiPatterns.map(a => a.type));
    if (antiPatternTypes.has('god_class')) {
      recommendations.push('Break down god classes into smaller, focused classes');
    }
    
    if (antiPatternTypes.has('magic_numbers')) {
      recommendations.push('Replace magic numbers with named constants');
    }
    
    return recommendations;
  }

  /**
   * Get H²GNN insights
   */
  private async getH2GNNInsights(
    code: string,
    language: string,
    metrics: CodeMetrics,
    codeSmells: CodeSmell[],
    antiPatterns: AntiPattern[]
  ): Promise<any[]> {
    try {
      const query = `code_analysis_${language}_complexity_${metrics.cognitiveComplexity}`;
      const insights = await this.h2gnn.retrieveMemories(query, 5);
      return insights;
    } catch (error) {
      console.warn('H²GNN insights not available:', error);
      return [];
    }
  }

  /**
   * Learn from analysis
   */
  private async learnFromAnalysis(
    code: string,
    language: string,
    metrics: CodeMetrics,
    codeSmells: CodeSmell[],
    antiPatterns: AntiPattern[],
    qualityScore: number
  ): Promise<void> {
    try {
      const concept = `advanced_analysis_${language}`;
      const data = {
        metrics,
        codeSmells: codeSmells.length,
        antiPatterns: antiPatterns.length,
        qualityScore,
        language
      };
      
      await this.h2gnn.learnWithMemory(
        concept,
        data,
        {
          domain: 'code_analysis',
          type: 'advanced_analysis',
          timestamp: new Date().toISOString()
        },
        qualityScore / 100
      );
    } catch (error) {
      console.warn('Failed to learn from analysis:', error);
    }
  }
}

// Demo function
async function demonstrateAdvancedASTAnalysis(): Promise<void> {
  console.warn('🔍 Advanced AST Analysis Demo');
  console.warn('=============================');
  
  const analyzer = new AdvancedASTAnalyzer();
  
  // Example TypeScript code with various issues
  const sampleCode = `
class UserService {
  private database: Database;
  private authService: AuthService;
  private emailService: EmailService;
  private notificationService: NotificationService;
  private cacheService: CacheService;
  private logService: LogService;
  private configService: ConfigService;
  private validationService: ValidationService;
  private encryptionService: EncryptionService;
  private auditService: AuditService;
  
  constructor(database: Database, authService: AuthService, emailService: EmailService, 
              notificationService: NotificationService, cacheService: CacheService, 
              logService: LogService, configService: ConfigService, 
              validationService: ValidationService, encryptionService: EncryptionService, 
              auditService: AuditService) {
    this.database = database;
    this.authService = authService;
    this.emailService = emailService;
    this.notificationService = notificationService;
    this.cacheService = cacheService;
    this.logService = logService;
    this.configService = configService;
    this.validationService = validationService;
    this.encryptionService = encryptionService;
    this.auditService = auditService;
  }
  
  public async createUser(userData: any, options: any, settings: any, 
                         preferences: any, metadata: any, context: any): Promise<User> {
    if (userData && userData.email && userData.password && userData.firstName && 
        userData.lastName && userData.age && userData.phone && userData.address && 
        userData.city && userData.state && userData.zipCode && userData.country) {
      try {
        const hashedPassword = await this.encryptionService.hash(userData.password);
        const user = await this.database.save({
          ...userData,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await this.emailService.sendWelcomeEmail(user.email);
        await this.notificationService.sendNotification(user.id, 'welcome');
        await this.auditService.log('user_created', user.id);
        
        return user;
      } catch (error) {
        await this.logService.error('Failed to create user', error);
        throw new Error('User creation failed');
      }
    } else {
      throw new Error('Invalid user data');
    }
  }
  
  public async authenticateUser(email: string, password: string): Promise<AuthResult> {
    if (email === 'admin@example.com' && password === 'admin123') {
      return { success: true, user: { id: 1, email } };
    }
    return { success: false, error: 'Invalid credentials' };
  }
}
  `;
  
  console.warn('\n📊 Analyzing sample code...');
  const result = await analyzer.analyzeCode(sampleCode, 'typescript');
  
  console.warn('\n📈 Code Metrics:');
  console.warn(`- Cognitive Complexity: ${result.metrics.cognitiveComplexity}`);
  console.warn(`- Cyclomatic Complexity: ${result.metrics.cyclomaticComplexity}`);
  console.warn(`- Maintainability Index: ${result.metrics.maintainabilityIndex.toFixed(2)}`);
  console.warn(`- Lines of Code: ${result.metrics.linesOfCode}`);
  console.warn(`- Comment Density: ${result.metrics.commentDensity.toFixed(3)}`);
  
  console.warn('\n⚠️ Code Smells Found:');
  result.codeSmells.forEach((smell, index) => {
    console.warn(`${index + 1}. ${smell.type} (${smell.severity}): ${smell.description}`);
    console.warn(`   Suggestion: ${smell.suggestion}`);
  });
  
  console.warn('\n🚫 Anti-Patterns Found:');
  result.antiPatterns.forEach((pattern, index) => {
    console.warn(`${index + 1}. ${pattern.type} (${pattern.severity}): ${pattern.description}`);
    console.warn(`   Suggestion: ${pattern.suggestion}`);
  });
  
  console.warn('\n📊 Quality Score:');
  console.warn(`- Overall Quality: ${result.qualityScore.toFixed(1)}/100`);
  
  console.warn('\n💡 Recommendations:');
  result.recommendations.forEach((rec, index) => {
    console.warn(`${index + 1}. ${rec}`);
  });
  
  console.warn('\n🧠 H²GNN Insights:');
  if (result.h2gnnInsights.length > 0) {
    result.h2gnnInsights.forEach((insight, index) => {
      console.warn(`${index + 1}. ${insight.concept} (confidence: ${insight.confidence.toFixed(3)})`);
    });
  } else {
    console.warn('No H²GNN insights available');
  }
  
  console.warn('\n🎉 Advanced AST Analysis Demo Complete!');
  console.warn('✅ Sophisticated code analysis with H²GNN integration!');
}

// Run the demo
// demonstrateAdvancedASTAnalysis().catch(console.error);

// Exports are already defined above in the class and interface definitions
