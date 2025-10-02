#!/usr/bin/env tsx

/**
 * Streaming LLM Client
 * 
 * This module provides advanced streaming capabilities for LLM interactions:
 * - Real-time streaming responses
 * - Function calling with streaming
 * - Context window optimization
 * - Streaming analytics
 * - Error handling and recovery
 */

import { ProductionLLMService, LLMOptions, LLMChunk, FunctionDefinition } from './production-llm-service.js';

export interface StreamingConfig {
  bufferSize: number;
  flushInterval: number;
  maxRetries: number;
  retryDelay: number;
  enableAnalytics: boolean;
}

export interface StreamingAnalytics {
  totalChunks: number;
  averageChunkSize: number;
  totalLatency: number;
  streamingEfficiency: number;
  errorRate: number;
}

export interface StreamingSession {
  id: string;
  startTime: number;
  endTime?: number;
  totalChunks: number;
  totalContent: string;
  analytics: StreamingAnalytics;
  errors: Error[];
}

export class StreamingLLMClient {
  private llmService: ProductionLLMService;
  private config: StreamingConfig;
  private activeSessions: Map<string, StreamingSession> = new Map();
  private analyticsBuffer: Map<string, LLMChunk[]> = new Map();

  constructor(llmService: ProductionLLMService, config: StreamingConfig) {
    this.llmService = llmService;
    this.config = config;
  }

  /**
   * Start a streaming session
   */
  async startStreamingSession(
    prompt: string,
    options: LLMOptions = {},
    sessionId?: string
  ): Promise<{
    sessionId: string;
    stream: AsyncIterable<LLMChunk>;
  }> {
    const id = sessionId || this.generateSessionId();
    
    // Initialize session
    const session: StreamingSession = {
      id,
      startTime: Date.now(),
      totalChunks: 0,
      totalContent: '',
      analytics: {
        totalChunks: 0,
        averageChunkSize: 0,
        totalLatency: 0,
        streamingEfficiency: 0,
        errorRate: 0
      },
      errors: []
    };
    
    this.activeSessions.set(id, session);
    this.analyticsBuffer.set(id, []);
    
    // Create streaming iterator
    const stream = this.createStreamingIterator(id, prompt, options);
    
    return {
      sessionId: id,
      stream
    };
  }

  /**
   * Create streaming iterator with analytics
   */
  private async *createStreamingIterator(
    sessionId: string,
    prompt: string,
    options: LLMOptions
  ): AsyncIterable<LLMChunk> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    let retryCount = 0;
    let lastError: Error | null = null;
    
    while (retryCount < this.config.maxRetries) {
      try {
        const stream = this.llmService.streamResponse(prompt, options);
        
        for await (const chunk of stream) {
          // Update session
          session.totalChunks++;
          session.totalContent += chunk.content;
          
          // Update analytics
          this.updateAnalytics(sessionId, chunk);
          
          // Yield chunk
          yield chunk;
          
          // Check if streaming is complete
          if (chunk.isComplete) {
            this.finalizeSession(sessionId);
            return;
          }
        }
        
        // If we get here, streaming completed successfully
        this.finalizeSession(sessionId);
        return;
        
      } catch (error) {
        lastError = error as Error;
        retryCount++;
        
        console.error(`❌ Streaming error (attempt ${retryCount}):`, error);
        
        // Add error to session
        if (session) {
          session.errors.push(lastError);
        }
        
        // Wait before retry
        if (retryCount < this.config.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }
    
    // All retries failed
    if (lastError) {
      throw new Error(`Streaming failed after ${this.config.maxRetries} retries: ${lastError.message}`);
    }
  }

  /**
   * Update analytics for a session
   */
  private updateAnalytics(sessionId: string, chunk: LLMChunk): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    // Add chunk to buffer
    const buffer = this.analyticsBuffer.get(sessionId) || [];
    buffer.push(chunk);
    this.analyticsBuffer.set(sessionId, buffer);
    
    // Update analytics
    session.analytics.totalChunks = session.totalChunks;
    session.analytics.averageChunkSize = session.totalContent.length / session.totalChunks;
    session.analytics.totalLatency = Date.now() - session.startTime;
    session.analytics.streamingEfficiency = this.calculateStreamingEfficiency(session);
    session.analytics.errorRate = session.errors.length / session.totalChunks;
  }

  /**
   * Calculate streaming efficiency
   */
  private calculateStreamingEfficiency(session: StreamingSession): number {
    if (session.totalChunks === 0) return 0;
    
    const expectedChunks = Math.ceil(session.totalContent.length / this.config.bufferSize);
    const actualChunks = session.totalChunks;
    
    return Math.min(1, expectedChunks / actualChunks);
  }

  /**
   * Finalize a streaming session
   */
  private finalizeSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    session.endTime = Date.now();
    
    // Calculate final analytics
    session.analytics.totalLatency = session.endTime - session.startTime;
    session.analytics.streamingEfficiency = this.calculateStreamingEfficiency(session);
    
    console.log(`✅ Streaming session ${sessionId} completed:`, {
      totalChunks: session.totalChunks,
      totalContent: session.totalContent.length,
      latency: session.analytics.totalLatency,
      efficiency: session.analytics.streamingEfficiency
    });
  }

  /**
   * Get session analytics
   */
  getSessionAnalytics(sessionId: string): StreamingAnalytics | null {
    const session = this.activeSessions.get(sessionId);
    return session ? session.analytics : null;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): StreamingSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Cancel a streaming session
   */
  async cancelSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.endTime = Date.now();
      this.activeSessions.delete(sessionId);
      this.analyticsBuffer.delete(sessionId);
      
      console.log(`🚫 Streaming session ${sessionId} cancelled`);
    }
  }

  /**
   * Stream with function calling
   */
  async *streamWithFunctionCalling(
    prompt: string,
    functions: FunctionDefinition[],
    options: LLMOptions = {}
  ): AsyncIterable<LLMChunk | FunctionCallResult> {
    const enhancedOptions: LLMOptions = {
      ...options,
      functions
    };
    
    const { sessionId, stream } = await this.startStreamingSession(prompt, enhancedOptions);
    
    try {
      for await (const chunk of stream) {
        // Check if chunk contains function call
        if (this.isFunctionCall(chunk.content)) {
          const functionCall = this.parseFunctionCall(chunk.content);
          if (functionCall) {
            yield functionCall;
          }
        } else {
          yield chunk;
        }
      }
    } finally {
      await this.cancelSession(sessionId);
    }
  }

  /**
   * Check if content contains function call
   */
  private isFunctionCall(content: string): boolean {
    // Simple check for function call patterns
    return content.includes('function_call') || content.includes('tool_call');
  }

  /**
   * Parse function call from content
   */
  private parseFunctionCall(content: string): FunctionCallResult | null {
    try {
      // This is a simplified parser - in reality, you'd need more sophisticated parsing
      const match = content.match(/function_call:\s*(\w+)\s*\((.*)\)/);
      if (match) {
        return {
          functionName: match[1],
          arguments: this.parseArguments(match[2]),
          confidence: 0.8
        };
      }
    } catch (error) {
      console.error('❌ Failed to parse function call:', error);
    }
    
    return null;
  }

  /**
   * Parse function arguments
   */
  private parseArguments(argsString: string): Record<string, any> {
    try {
      // Simple argument parsing - in reality, you'd need more sophisticated parsing
      const args: Record<string, any> = {};
      const pairs = argsString.split(',');
      
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          args[key.trim()] = value.trim();
        }
      }
      
      return args;
    } catch (error) {
      console.error('❌ Failed to parse arguments:', error);
      return {};
    }
  }

  /**
   * Optimize context window for streaming
   */
  optimizeContextWindow(context: string[], maxTokens: number): string[] {
    const optimizedContext: string[] = [];
    let currentTokens = 0;
    
    // Sort context by importance (you'd implement your own importance scoring)
    const sortedContext = context.sort((a, b) => this.calculateImportance(b) - this.calculateImportance(a));
    
    for (const item of sortedContext) {
      const itemTokens = this.estimateTokens(item);
      
      if (currentTokens + itemTokens <= maxTokens) {
        optimizedContext.push(item);
        currentTokens += itemTokens;
      } else {
        break;
      }
    }
    
    return optimizedContext;
  }

  /**
   * Calculate importance of context item
   */
  private calculateImportance(item: string): number {
    // Simple importance calculation - in reality, you'd use more sophisticated methods
    const keywords = ['important', 'critical', 'key', 'main', 'primary'];
    const score = keywords.reduce((acc, keyword) => {
      return acc + (item.toLowerCase().includes(keyword) ? 1 : 0);
    }, 0);
    
    return score + item.length / 1000; // Longer items are slightly more important
  }

  /**
   * Estimate token count
   */
  private estimateTokens(text: string): number {
    // Simple estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get streaming configuration
   */
  getConfig(): StreamingConfig {
    return { ...this.config };
  }

  /**
   * Update streaming configuration
   */
  updateConfig(config: Partial<StreamingConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export default configuration
export const defaultStreamingConfig: StreamingConfig = {
  bufferSize: 1024,
  flushInterval: 100,
  maxRetries: 3,
  retryDelay: 1000,
  enableAnalytics: true
};
