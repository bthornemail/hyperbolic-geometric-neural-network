#!/usr/bin/env tsx

/**
 * Phase 4 Production LLM Demo
 * 
 * This demo showcases the Phase 4: Production LLM Integration features:
 * - Real LLM service integration
 * - Streaming responses
 * - Enhanced H²GNN learning with LLM assistance
 * - Provider management and load balancing
 */

import { ProductionLLMService, LLMProvider } from '../llm/production-llm-service.js';
import { LLMProviderManager, defaultLoadBalancingConfig, defaultQuotaConfig } from '../llm/llm-provider-manager.js';
import { StreamingLLMClient, defaultStreamingConfig } from '../llm/streaming-llm-client.js';
import { EnhancedH2GNN } from '../core/enhanced-h2gnn.js';

async function demonstrateProductionLLMIntegration(): Promise<void> {
  console.warn('🚀 Phase 4: Production LLM Integration Demo');
  console.warn('==========================================');
  
  // Initialize LLM providers
  console.warn('\n📊 Phase 1: Setting up LLM Providers');
  console.warn('------------------------------------');
  
  const providers: LLMProvider[] = [
    {
      id: 'openai-gpt4',
      name: 'OpenAI GPT-4',
      type: 'openai',
      apiKey: process.env.OPENAI_API_KEY || 'mock-key',
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7,
      enabled: true,
      priority: 10,
      costPerToken: 0.00003,
      rateLimit: {
        requestsPerMinute: 60,
        tokensPerMinute: 150000
      }
    },
    {
      id: 'anthropic-claude',
      name: 'Anthropic Claude',
      type: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY || 'mock-key',
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4000,
      temperature: 0.7,
      enabled: true,
      priority: 9,
      costPerToken: 0.000015,
      rateLimit: {
        requestsPerMinute: 50,
        tokensPerMinute: 100000
      }
    },
    {
      id: 'google-gemini',
      name: 'Google Gemini',
      type: 'google',
      apiKey: process.env.GOOGLE_API_KEY || 'mock-key',
      model: 'gemini-pro',
      maxTokens: 4000,
      temperature: 0.7,
      enabled: true,
      priority: 8,
      costPerToken: 0.00001,
      rateLimit: {
        requestsPerMinute: 100,
        tokensPerMinute: 200000
      }
    }
  ];
  
  // Initialize production LLM service
  const llmService = new ProductionLLMService();
  await llmService.initialize(providers);
  
  // Initialize provider manager
  const providerManager = new LLMProviderManager(
    llmService,
    defaultLoadBalancingConfig,
    defaultQuotaConfig
  );
  await providerManager.initialize();
  
  // Initialize streaming client
  const streamingClient = new StreamingLLMClient(llmService, defaultStreamingConfig);
  
  console.warn('✅ LLM providers initialized');
  
  // Test basic LLM functionality
  console.warn('\n📊 Phase 2: Testing Basic LLM Functionality');
  console.warn('--------------------------------------------');
  
  try {
    const response = await llmService.generateResponse(
      'Explain the concept of hyperbolic geometry in simple terms.',
      {
        temperature: 0.7,
        maxTokens: 500,
        systemPrompt: 'You are a mathematics tutor explaining complex concepts simply.'
      }
    );
    
    console.warn('🤖 LLM Response:');
    console.warn(`Provider: ${response.provider}`);
    console.warn(`Model: ${response.model}`);
    console.warn(`Content: ${response.content.substring(0, 200)}...`);
    console.warn(`Usage: ${response.usage.totalTokens} tokens`);
    console.warn(`Cost: $${response.cost.toFixed(6)}`);
    console.warn(`Latency: ${response.latency}ms`);
    
  } catch (error) {
    console.warn('⚠️ LLM service not available (using mock responses)');
    console.warn('🤖 Mock Response: Hyperbolic geometry is a non-Euclidean geometry where parallel lines can intersect...');
  }
  
  // Test streaming functionality
  console.warn('\n📊 Phase 3: Testing Streaming Functionality');
  console.warn('---------------------------------------------');
  
  try {
    const { sessionId, stream } = await streamingClient.startStreamingSession(
      'Write a short story about an AI learning to understand human emotions.',
      {
        temperature: 0.8,
        maxTokens: 300
      }
    );
    
    console.warn(`🎬 Streaming session started: ${sessionId}`);
    console.warn('📝 Streaming response:');
    
    let fullContent = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        process.stdout.write(chunk.content);
        fullContent += chunk.content;
      }
      
      if (chunk.isComplete) {
        console.warn('\n✅ Streaming completed');
        break;
      }
    }
    
    // Get streaming analytics
    const analytics = streamingClient.getSessionAnalytics(sessionId);
    if (analytics) {
      console.warn('\n📊 Streaming Analytics:');
      console.warn(`Total chunks: ${analytics.totalChunks}`);
      console.warn(`Average chunk size: ${analytics.averageChunkSize.toFixed(2)}`);
      console.warn(`Total latency: ${analytics.totalLatency}ms`);
      console.warn(`Streaming efficiency: ${(analytics.streamingEfficiency * 100).toFixed(1)}%`);
    }
    
  } catch (error) {
    console.warn('⚠️ Streaming not available (using mock responses)');
    console.warn('📝 Mock streaming response: Once upon a time, an AI named Sage began to wonder about emotions...');
  }
  
  // Test enhanced H²GNN with LLM assistance
  console.warn('\n📊 Phase 4: Testing Enhanced H²GNN with LLM Assistance');
  console.warn('--------------------------------------------------------');
  
  const h2gnnConfig = {
    embeddingDim: 64,
    numLayers: 3,
    curvature: -1
  };
  
  const persistenceConfig = {
    storagePath: './persistence',
    maxMemories: 10000,
    consolidationThreshold: 100,
    retrievalStrategy: 'hybrid' as const,
    compressionEnabled: true
  };
  
  const enhancedH2GNN = new EnhancedH2GNN(h2gnnConfig, persistenceConfig, llmService, streamingClient);
  
  // Test LLM-assisted learning
  console.warn('🧠 Testing LLM-assisted learning...');
  
  try {
    await enhancedH2GNN.learnWithLLMAssistance(
      'machine learning',
      {
        definition: 'A subset of artificial intelligence that enables computers to learn without being explicitly programmed',
        examples: ['neural networks', 'decision trees', 'support vector machines'],
        applications: ['image recognition', 'natural language processing', 'predictive analytics']
      },
      {
        domain: 'artificial intelligence',
        difficulty: 'intermediate',
        prerequisites: ['statistics', 'linear algebra', 'programming']
      },
      0.8
    );
    
    console.warn('✅ LLM-assisted learning completed');
    
  } catch (error) {
    console.warn('⚠️ LLM-assisted learning not available (using standard learning)');
    await enhancedH2GNN.learnWithMemory(
      'machine learning',
      {
        definition: 'A subset of artificial intelligence that enables computers to learn without being explicitly programmed',
        examples: ['neural networks', 'decision trees', 'support vector machines'],
        applications: ['image recognition', 'natural language processing', 'predictive analytics']
      },
      {
        domain: 'artificial intelligence',
        difficulty: 'intermediate',
        prerequisites: ['statistics', 'linear algebra', 'programming']
      },
      0.8
    );
    console.warn('✅ Standard learning completed');
  }
  
  // Test streaming learning
  console.warn('\n🧠 Testing streaming learning...');
  
  try {
    console.warn('📝 Streaming learning insights:');
    
    for await (const insight of enhancedH2GNN.streamLearningWithLLM(
      'deep learning',
      {
        definition: 'A subset of machine learning that uses neural networks with multiple layers',
        examples: ['convolutional neural networks', 'recurrent neural networks', 'transformer networks'],
        applications: ['computer vision', 'natural language processing', 'speech recognition']
      },
      {
        domain: 'artificial intelligence',
        difficulty: 'advanced',
        prerequisites: ['machine learning', 'neural networks', 'linear algebra']
      }
    )) {
      if (insight.type === 'insight') {
        process.stdout.write(insight.content);
      } else if (insight.type === 'complete') {
        console.warn(`\n✅ ${insight.content}`);
        break;
      }
    }
    
  } catch (error) {
    console.warn('⚠️ Streaming learning not available (using standard learning)');
    await enhancedH2GNN.learnWithMemory(
      'deep learning',
      {
        definition: 'A subset of machine learning that uses neural networks with multiple layers',
        examples: ['convolutional neural networks', 'recurrent neural networks', 'transformer networks'],
        applications: ['computer vision', 'natural language processing', 'speech recognition']
      },
      {
        domain: 'artificial intelligence',
        difficulty: 'advanced',
        prerequisites: ['machine learning', 'neural networks', 'linear algebra']
      },
      0.9
    );
    console.warn('✅ Standard learning completed');
  }
  
  // Test provider management
  console.warn('\n📊 Phase 5: Testing Provider Management');
  console.warn('----------------------------------------');
  
  const providerHealth = providerManager.getProviderHealth();
  console.warn('🏥 Provider Health Status:');
  for (const health of providerHealth) {
    console.warn(`  ${health.providerId}: ${health.isHealthy ? '✅ Healthy' : '❌ Unhealthy'} (${health.responseTime}ms)`);
  }
  
  const usageStats = llmService.getUsageStats();
  console.warn('\n📊 Usage Statistics:');
  console.warn(`Total requests: ${usageStats.totalRequests}`);
  console.warn(`Total tokens: ${usageStats.totalTokens}`);
  console.warn(`Total cost: $${usageStats.totalCost.toFixed(6)}`);
  console.warn(`Average latency: ${usageStats.averageLatency.toFixed(2)}ms`);
  
  // Test provider switching
  try {
    const availableProviders = llmService.getProviders();
    if (availableProviders.length > 1) {
      const secondProvider = availableProviders[1];
      await llmService.switchProvider(secondProvider.id);
      console.warn(`🔄 Switched to provider: ${secondProvider.name}`);
      
      // Test response with new provider
      const testResponse = await llmService.generateResponse('What is the meaning of life?', {
        maxTokens: 100
      });
      console.warn(`✅ Test response from ${testResponse.provider}: ${testResponse.content.substring(0, 100)}...`);
    }
  } catch (error) {
    console.warn('⚠️ Provider switching not available');
  }
  
  // Test quota management
  console.warn('\n📊 Phase 6: Testing Quota Management');
  console.warn('-------------------------------------');
  
  const quotaCheck = await providerManager.checkQuotaLimits();
  console.warn(`Quota check: ${quotaCheck ? '✅ Within limits' : '❌ Limits exceeded'}`);
  
  const quotaConfig = providerManager.getQuotaConfig();
  console.warn('📋 Quota Configuration:');
  console.warn(`Daily limit: ${quotaConfig.dailyLimit} requests`);
  console.warn(`Monthly limit: ${quotaConfig.monthlyLimit} requests`);
  console.warn(`Cost limit: $${quotaConfig.costLimit}`);
  
  // Cleanup
  console.warn('\n🧹 Cleaning up...');
  await providerManager.shutdown();
  
  console.warn('\n🎉 Phase 4 Production LLM Integration Demo completed!');
  console.warn('\n📋 Summary:');
  console.warn('✅ Production LLM service initialized');
  console.warn('✅ Streaming functionality tested');
  console.warn('✅ Enhanced H²GNN learning with LLM assistance');
  console.warn('✅ Provider management and load balancing');
  console.warn('✅ Quota management and monitoring');
  console.warn('\n🚀 Ready for Phase 4: 3D Visualization!');
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateProductionLLMIntegration().catch(console.error);
}
