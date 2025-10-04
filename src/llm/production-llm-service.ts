#!/usr/bin/env tsx

/**
 * Production LLM Service
 * 
 * This module provides production-ready LLM integration with multiple providers:
 * - OpenAI GPT-4/GPT-4o
 * - Anthropic Claude
 * - Google Gemini
 * - Fallback and load balancing
 * - Streaming responses
 * - Function calling
 * - Cost optimization
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface LLMProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'custom';
  apiKey: string;
  baseURL?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
  priority: number;
  costPerToken: number;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  functions?: FunctionDefinition[];
  systemPrompt?: string;
  context?: string[];
  provider?: string;
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  latency: number;
  timestamp: number;
}

export interface LLMChunk {
  content: string;
  isComplete: boolean;
  provider: string;
  timestamp: number;
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface FunctionCallResult {
  functionName: string;
  arguments: Record<string, any>;
  confidence: number;
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
  providerStats: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
    errors: number;
  }>;
}

export class ProductionLLMService {
  private providers: Map<string, LLMProvider> = new Map();
  private activeProvider: LLMProvider | null = null;
  private clients: Map<string, any> = new Map();
  private usageStats: UsageStats;
  private rateLimiters: Map<string, any> = new Map();

  constructor() {
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageLatency: 0,
      providerStats: {}
    };
  }

  /**
   * Initialize the LLM service with providers
   */
  async initialize(providers: LLMProvider[]): Promise<void> {
    console.warn('🤖 Initializing Production LLM Service...');
    
    for (const provider of providers) {
      await this.addProvider(provider);
    }
    
    // Set the highest priority enabled provider as active
    const enabledProviders = Array.from(this.providers.values())
      .filter(p => p.enabled)
      .sort((a, b) => b.priority - a.priority);
    
    if (enabledProviders.length > 0) {
      this.activeProvider = enabledProviders[0];
      console.warn(`✅ Active provider: ${this.activeProvider.name}`);
    }
    
    console.warn('✅ Production LLM Service initialized');
  }

  /**
   * Add a new LLM provider
   */
  async addProvider(provider: LLMProvider): Promise<void> {
    this.providers.set(provider.id, provider);
    
    // Initialize client based on provider type
    let client: any;
    
    switch (provider.type) {
      case 'openai':
        client = new OpenAI({
          apiKey: provider.apiKey,
          baseURL: provider.baseURL
        });
        break;
        
      case 'anthropic':
        client = new Anthropic({
          apiKey: provider.apiKey
        });
        break;
        
      case 'google':
        client = new GoogleGenerativeAI(provider.apiKey);
        break;
        
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }
    
    this.clients.set(provider.id, client);
    this.usageStats.providerStats[provider.id] = {
      requests: 0,
      tokens: 0,
      cost: 0,
      errors: 0
    };
    
    console.warn(`✅ Added provider: ${provider.name}`);
  }

  /**
   * Generate a response using the active provider
   */
  async generateResponse(prompt: string, options: LLMOptions = {}): Promise<LLMResponse> {
    if (!this.activeProvider) {
      throw new Error('No active LLM provider available');
    }
    
    const startTime = Date.now();
    
    try {
      const response = await this.callProvider(this.activeProvider, prompt, options);
      const latency = Date.now() - startTime;
      
      // Update usage stats
      this.updateUsageStats(this.activeProvider.id, response.usage, latency);
      
      return {
        ...response,
        provider: this.activeProvider.name,
        model: this.activeProvider.model,
        latency,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error(`❌ Error with provider ${this.activeProvider.name}:`, error);
      
      // Try fallback providers
      const fallbackProviders = Array.from(this.providers.values())
        .filter(p => p.enabled && p.id !== this.activeProvider!.id)
        .sort((a, b) => b.priority - a.priority);
      
      for (const fallbackProvider of fallbackProviders) {
        try {
          console.warn(`🔄 Trying fallback provider: ${fallbackProvider.name}`);
          const response = await this.callProvider(fallbackProvider, prompt, options);
          const latency = Date.now() - startTime;
          
          this.updateUsageStats(fallbackProvider.id, response.usage, latency);
          
          return {
            ...response,
            provider: fallbackProvider.name,
            model: fallbackProvider.model,
            latency,
            timestamp: Date.now()
          };
          
        } catch (fallbackError) {
          console.error(`❌ Fallback provider ${fallbackProvider.name} also failed:`, fallbackError);
          continue;
        }
      }
      
      throw new Error('All LLM providers failed');
    }
  }

  /**
   * Stream a response from the active provider
   */
  async *streamResponse(prompt: string, options: LLMOptions = {}): AsyncIterable<LLMChunk> {
    if (!this.activeProvider) {
      throw new Error('No active LLM provider available');
    }
    
    const startTime = Date.now();
    let fullContent = '';
    let tokenCount = 0;
    
    try {
      const stream = await this.streamProvider(this.activeProvider, prompt, options);
      
      for await (const chunk of stream) {
        fullContent += chunk.content;
        tokenCount += this.estimateTokens(chunk.content);
        
        yield {
          content: chunk.content,
          isComplete: chunk.isComplete,
          provider: this.activeProvider.name,
          timestamp: Date.now()
        };
      }
      
      // Update usage stats
      const latency = Date.now() - startTime;
      this.updateUsageStats(this.activeProvider.id, {
        promptTokens: this.estimateTokens(prompt),
        completionTokens: tokenCount,
        totalTokens: this.estimateTokens(prompt) + tokenCount
      }, latency);
      
    } catch (error) {
      console.error(`❌ Streaming error with provider ${this.activeProvider.name}:`, error);
      throw error;
    }
  }

  /**
   * Call a specific provider
   */
  private async callProvider(provider: LLMProvider, prompt: string, options: LLMOptions): Promise<LLMResponse> {
    const client = this.clients.get(provider.id);
    if (!client) {
      throw new Error(`Client not found for provider: ${provider.id}`);
    }
    
    const requestOptions = {
      model: provider.model,
      temperature: options.temperature ?? provider.temperature,
      max_tokens: options.maxTokens ?? provider.maxTokens,
      messages: this.buildMessages(prompt, options),
      ...(options.functions && { functions: options.functions })
    };
    
    let response: any;
    
    switch (provider.type) {
      case 'openai':
        response = await client.chat.completions.create(requestOptions);
        return this.parseOpenAIResponse(response);
        
      case 'anthropic':
        response = await client.messages.create({
          model: provider.model,
          max_tokens: options.maxTokens ?? provider.maxTokens,
          temperature: options.temperature ?? provider.temperature,
          messages: [{ role: 'user', content: prompt }]
        });
        return this.parseAnthropicResponse(response);
        
      case 'google':
        const model = client.getGenerativeModel({ model: provider.model });
        response = await model.generateContent(prompt);
        return this.parseGoogleResponse(response);
        
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }
  }

  /**
   * Stream from a specific provider
   */
  private async *streamProvider(provider: LLMProvider, prompt: string, options: LLMOptions): AsyncIterable<LLMChunk> {
    const client = this.clients.get(provider.id);
    if (!client) {
      throw new Error(`Client not found for provider: ${provider.id}`);
    }
    
    switch (provider.type) {
      case 'openai':
        const stream = await client.chat.completions.create({
          model: provider.model,
          messages: this.buildMessages(prompt, options),
          stream: true
        });
        
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            yield {
              content,
              isComplete: false,
              provider: provider.name,
              timestamp: Date.now()
            };
          }
        }
        
        yield {
          content: '',
          isComplete: true,
          provider: provider.name,
          timestamp: Date.now()
        };
        break;
        
      default:
        // For non-streaming providers, simulate streaming
        const response = await this.callProvider(provider, prompt, options);
        const words = response.content.split(' ');
        
        for (let i = 0; i < words.length; i++) {
          yield {
            content: words[i] + (i < words.length - 1 ? ' ' : ''),
            isComplete: false,
            provider: provider.name,
            timestamp: Date.now()
          };
        }
        
        yield {
          content: '',
          isComplete: true,
          provider: provider.name,
          timestamp: Date.now()
        };
        break;
    }
  }

  /**
   * Build messages array for API calls
   */
  private buildMessages(prompt: string, options: LLMOptions): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];
    
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    
    if (options.context && options.context.length > 0) {
      messages.push({ role: 'system', content: `Context: ${options.context.join('\n')}` });
    }
    
    messages.push({ role: 'user', content: prompt });
    
    return messages;
  }

  /**
   * Parse OpenAI response
   */
  private parseOpenAIResponse(response: any): LLMResponse {
    return {
      content: response.choices[0].message.content,
      provider: 'openai',
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      },
      cost: 0, // Calculate based on provider cost
      latency: 0,
      timestamp: Date.now()
    };
  }

  /**
   * Parse Anthropic response
   */
  private parseAnthropicResponse(response: any): LLMResponse {
    return {
      content: response.content[0].text,
      provider: 'anthropic',
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      },
      cost: 0,
      latency: 0,
      timestamp: Date.now()
    };
  }

  /**
   * Parse Google response
   */
  private parseGoogleResponse(response: any): LLMResponse {
    return {
      content: response.response.text(),
      provider: 'google',
      model: 'gemini-pro',
      usage: {
        promptTokens: 0, // Google doesn't provide token counts
        completionTokens: 0,
        totalTokens: 0
      },
      cost: 0,
      latency: 0,
      timestamp: Date.now()
    };
  }

  /**
   * Update usage statistics
   */
  private updateUsageStats(providerId: string, usage: any, latency: number): void {
    this.usageStats.totalRequests++;
    this.usageStats.totalTokens += usage.totalTokens;
    this.usageStats.totalCost += usage.totalTokens * this.providers.get(providerId)!.costPerToken;
    this.usageStats.averageLatency = (this.usageStats.averageLatency + latency) / 2;
    
    const providerStats = this.usageStats.providerStats[providerId];
    if (providerStats) {
      providerStats.requests++;
      providerStats.tokens += usage.totalTokens;
      providerStats.cost += usage.totalTokens * this.providers.get(providerId)!.costPerToken;
    }
  }

  /**
   * Estimate token count for text
   */
  private estimateTokens(text: string): number {
    // Simple estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Switch to a different provider
   */
  async switchProvider(providerId: string): Promise<void> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`);
    }
    
    if (!provider.enabled) {
      throw new Error(`Provider is disabled: ${providerId}`);
    }
    
    this.activeProvider = provider;
    console.warn(`🔄 Switched to provider: ${provider.name}`);
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): UsageStats {
    return { ...this.usageStats };
  }

  /**
   * Get available providers
   */
  getProviders(): LLMProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get active provider
   */
  getActiveProvider(): LLMProvider | null {
    return this.activeProvider;
  }

  /**
   * Handle rate limiting
   */
  async handleRateLimit(): Promise<void> {
    console.warn('⏳ Rate limit reached, waiting...');
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
  }
}

// Export singleton instance
export const productionLLMService = new ProductionLLMService();
