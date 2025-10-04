#!/usr/bin/env tsx

/**
 * LLM Provider Manager
 * 
 * This module manages LLM providers, load balancing, and provider selection:
 * - Provider configuration and management
 * - Load balancing across providers
 * - Health monitoring and failover
 * - Cost optimization
 * - Rate limiting and quota management
 */

import { ProductionLLMService, LLMProvider, UsageStats } from './production-llm-service.js';

export interface ProviderHealth {
  providerId: string;
  isHealthy: boolean;
  lastCheck: number;
  responseTime: number;
  errorRate: number;
  availability: number;
}

export interface LoadBalancingConfig {
  strategy: 'round_robin' | 'least_connections' | 'cost_optimized' | 'performance_optimized';
  weights: Record<string, number>;
  healthCheckInterval: number;
  failoverThreshold: number;
}

export interface QuotaConfig {
  dailyLimit: number;
  monthlyLimit: number;
  costLimit: number;
  requestLimit: number;
}

export class LLMProviderManager {
  private llmService: ProductionLLMService;
  private providerHealth: Map<string, ProviderHealth> = new Map();
  private loadBalancingConfig: LoadBalancingConfig;
  private quotaConfig: QuotaConfig;
  private currentProviderIndex: number = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(
    llmService: ProductionLLMService,
    loadBalancingConfig: LoadBalancingConfig,
    quotaConfig: QuotaConfig
  ) {
    this.llmService = llmService;
    this.loadBalancingConfig = loadBalancingConfig;
    this.quotaConfig = quotaConfig;
  }

  /**
   * Initialize the provider manager
   */
  async initialize(): Promise<void> {
    console.warn('🔧 Initializing LLM Provider Manager...');
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    // Initialize provider health
    const providers = this.llmService.getProviders();
    for (const provider of providers) {
      this.providerHealth.set(provider.id, {
        providerId: provider.id,
        isHealthy: true,
        lastCheck: Date.now(),
        responseTime: 0,
        errorRate: 0,
        availability: 1.0
      });
    }
    
    console.warn('✅ LLM Provider Manager initialized');
  }

  /**
   * Select the best provider based on load balancing strategy
   */
  async selectProvider(): Promise<string> {
    const healthyProviders = this.getHealthyProviders();
    
    if (healthyProviders.length === 0) {
      throw new Error('No healthy providers available');
    }
    
    switch (this.loadBalancingConfig.strategy) {
      case 'round_robin':
        return this.selectRoundRobin(healthyProviders);
        
      case 'least_connections':
        return this.selectLeastConnections(healthyProviders);
        
      case 'cost_optimized':
        return this.selectCostOptimized(healthyProviders);
        
      case 'performance_optimized':
        return this.selectPerformanceOptimized(healthyProviders);
        
      default:
        return healthyProviders[0].id;
    }
  }

  /**
   * Round-robin provider selection
   */
  private selectRoundRobin(providers: LLMProvider[]): string {
    const provider = providers[this.currentProviderIndex % providers.length];
    this.currentProviderIndex++;
    return provider.id;
  }

  /**
   * Least connections provider selection
   */
  private selectLeastConnections(providers: LLMProvider[]): string {
    // For now, use round-robin as a proxy for least connections
    // In a real implementation, you'd track active connections
    return this.selectRoundRobin(providers);
  }

  /**
   * Cost-optimized provider selection
   */
  private selectCostOptimized(providers: LLMProvider[]): string {
    const sortedProviders = providers.sort((a, b) => a.costPerToken - b.costPerToken);
    return sortedProviders[0].id;
  }

  /**
   * Performance-optimized provider selection
   */
  private selectPerformanceOptimized(providers: LLMProvider[]): string {
    const sortedProviders = providers.sort((a, b) => {
      const healthA = this.providerHealth.get(a.id);
      const healthB = this.providerHealth.get(b.id);
      
      if (!healthA || !healthB) return 0;
      
      // Sort by response time (lower is better)
      return healthA.responseTime - healthB.responseTime;
    });
    
    return sortedProviders[0].id;
  }

  /**
   * Get healthy providers
   */
  private getHealthyProviders(): LLMProvider[] {
    const providers = this.llmService.getProviders();
    return providers.filter(provider => {
      const health = this.providerHealth.get(provider.id);
      return health && health.isHealthy && provider.enabled;
    });
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.loadBalancingConfig.healthCheckInterval);
  }

  /**
   * Perform health checks on all providers
   */
  private async performHealthChecks(): Promise<void> {
    const providers = this.llmService.getProviders();
    
    for (const provider of providers) {
      try {
        const startTime = Date.now();
        
        // Simple health check - try to generate a minimal response
        await this.llmService.generateResponse('Hello', {
          maxTokens: 1,
          temperature: 0
        });
        
        const responseTime = Date.now() - startTime;
        
        // Update health status
        const health = this.providerHealth.get(provider.id);
        if (health) {
          health.isHealthy = true;
          health.lastCheck = Date.now();
          health.responseTime = responseTime;
          health.errorRate = Math.max(0, health.errorRate - 0.1); // Gradually improve error rate
        }
        
      } catch (error) {
        console.warn(`⚠️ Health check failed for provider ${provider.id}:`, error);
        
        // Update health status
        const health = this.providerHealth.get(provider.id);
        if (health) {
          health.isHealthy = false;
          health.lastCheck = Date.now();
          health.errorRate = Math.min(1, health.errorRate + 0.2); // Increase error rate
        }
      }
    }
  }

  /**
   * Check if quota limits are exceeded
   */
  async checkQuotaLimits(): Promise<boolean> {
    const usageStats = this.llmService.getUsageStats();
    
    // Check daily limits
    const today = new Date().toDateString();
    const dailyUsage = this.getDailyUsage(today);
    
    if (dailyUsage.requests >= this.quotaConfig.dailyLimit) {
      console.warn('⚠️ Daily request limit exceeded');
      return false;
    }
    
    if (dailyUsage.cost >= this.quotaConfig.costLimit) {
      console.warn('⚠️ Daily cost limit exceeded');
      return false;
    }
    
    // Check monthly limits
    const monthlyUsage = this.getMonthlyUsage();
    
    if (monthlyUsage.requests >= this.quotaConfig.monthlyLimit) {
      console.warn('⚠️ Monthly request limit exceeded');
      return false;
    }
    
    return true;
  }

  /**
   * Get daily usage for a specific date
   */
  private getDailyUsage(date: string): { requests: number; cost: number } {
    // In a real implementation, you'd query a database
    // For now, return mock data
    return {
      requests: 0,
      cost: 0
    };
  }

  /**
   * Get monthly usage
   */
  private getMonthlyUsage(): { requests: number; cost: number } {
    // In a real implementation, you'd query a database
    // For now, return mock data
    return {
      requests: 0,
      cost: 0
    };
  }

  /**
   * Handle provider failure
   */
  async handleProviderFailure(providerId: string, error: Error): Promise<void> {
    console.error(`❌ Provider failure: ${providerId}`, error);
    
    const health = this.providerHealth.get(providerId);
    if (health) {
      health.isHealthy = false;
      health.errorRate = Math.min(1, health.errorRate + 0.5);
    }
    
    // If this was the active provider, switch to a healthy one
    const activeProvider = this.llmService.getActiveProvider();
    if (activeProvider && activeProvider.id === providerId) {
      try {
        const newProviderId = await this.selectProvider();
        await this.llmService.switchProvider(newProviderId);
        console.warn(`🔄 Switched to provider: ${newProviderId}`);
      } catch (error) {
        console.error('❌ Failed to switch to healthy provider:', error);
      }
    }
  }

  /**
   * Get provider health status
   */
  getProviderHealth(): ProviderHealth[] {
    return Array.from(this.providerHealth.values());
  }

  /**
   * Get load balancing configuration
   */
  getLoadBalancingConfig(): LoadBalancingConfig {
    return { ...this.loadBalancingConfig };
  }

  /**
   * Update load balancing configuration
   */
  updateLoadBalancingConfig(config: Partial<LoadBalancingConfig>): void {
    this.loadBalancingConfig = { ...this.loadBalancingConfig, ...config };
  }

  /**
   * Get quota configuration
   */
  getQuotaConfig(): QuotaConfig {
    return { ...this.quotaConfig };
  }

  /**
   * Update quota configuration
   */
  updateQuotaConfig(config: Partial<QuotaConfig>): void {
    this.quotaConfig = { ...this.quotaConfig, ...config };
  }

  /**
   * Shutdown the provider manager
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    console.warn('🔧 LLM Provider Manager shutdown complete');
  }
}

// Export default configuration
export const defaultLoadBalancingConfig: LoadBalancingConfig = {
  strategy: 'performance_optimized',
  weights: {},
  healthCheckInterval: 30000, // 30 seconds
  failoverThreshold: 0.5
};

export const defaultQuotaConfig: QuotaConfig = {
  dailyLimit: 1000,
  monthlyLimit: 30000,
  costLimit: 100,
  requestLimit: 10000
};
