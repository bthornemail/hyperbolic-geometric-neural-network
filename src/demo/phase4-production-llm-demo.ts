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
  console.log('🚀 Phase 4: Production LLM Integration Demo');
  console.log('==========================================');
  
  // Initialize LLM providers
  console.log('\n📊 Phase 1: Setting up LLM Providers');
  console.log('------------------------------------');
  
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
  
  console.log('✅ LLM providers initialized');
  
  // Test basic LLM functionality
  console.log('\n📊 Phase 2: Testing Basic LLM Functionality');
  console.log('--------------------------------------------');
  
  try {
    const response = await llmService.generateResponse(
      'Explain the concept of hyperbolic geometry in simple terms.',
      {
        temperature: 0.7,
        maxTokens: 500,
        systemPrompt: 'You are a mathematics tutor explaining complex concepts simply.'
      }
    );
    
    console.log('🤖 LLM Response:');
    console.log(`Provider: ${response.provider}`);
    console.log(`Model: ${response.model}`);
    console.log(`Content: ${response.content.substring(0, 200)}...`);
    console.log(`Usage: ${response.usage.totalTokens} tokens`);
    console.log(`Cost: $${response.cost.toFixed(6)}`);
    console.log(`Latency: ${response.latency}ms`);
    
  } catch (error) {
    console.log('⚠️ LLM service not available (using mock responses)');
    console.log('🤖 Mock Response: Hyperbolic geometry is a non-Euclidean geometry where parallel lines can intersect...');
  }
  
  // Test streaming functionality
  console.log('\n📊 Phase 3: Testing Streaming Functionality');
  console.log('---------------------------------------------');
  
  try {
    const { sessionId, stream } = await streamingClient.startStreamingSession(
      'Write a short story about an AI learning to understand human emotions.',
      {
        temperature: 0.8,
        maxTokens: 300
      }
    );
    
    console.log(`🎬 Streaming session started: ${sessionId}`);
    console.log('📝 Streaming response:');
    
    let fullContent = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        process.stdout.write(chunk.content);
        fullContent += chunk.content;
      }
      
      if (chunk.isComplete) {
        console.log('\n✅ Streaming completed');
        break;
      }
    }
    
    // Get streaming analytics
    const analytics = streamingClient.getSessionAnalytics(sessionId);
    if (analytics) {
      console.log('\n📊 Streaming Analytics:');
      console.log(`Total chunks: ${analytics.totalChunks}`);
      console.log(`Average chunk size: ${analytics.averageChunkSize.toFixed(2)}`);
      console.log(`Total latency: ${analytics.totalLatency}ms`);
      console.log(`Streaming efficiency: ${(analytics.streamingEfficiency * 100).toFixed(1)}%`);
    }
    
  } catch (error) {
    console.log('⚠️ Streaming not available (using mock responses)');
    console.log('📝 Mock streaming response: Once upon a time, an AI named Sage began to wonder about emotions...');
  }
  
  // Test enhanced H²GNN with LLM assistance
  console.log('\n📊 Phase 4: Testing Enhanced H²GNN with LLM Assistance');
  console.log('--------------------------------------------------------');
  
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
  console.log('🧠 Testing LLM-assisted learning...');
  
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
    
    console.log('✅ LLM-assisted learning completed');
    
  } catch (error) {
    console.log('⚠️ LLM-assisted learning not available (using standard learning)');
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
    console.log('✅ Standard learning completed');
  }
  
  // Test streaming learning
  console.log('\n🧠 Testing streaming learning...');
  
  try {
    console.log('📝 Streaming learning insights:');
    
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
        console.log(`\n✅ ${insight.content}`);
        break;
      }
    }
    
  } catch (error) {
    console.log('⚠️ Streaming learning not available (using standard learning)');
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
    console.log('✅ Standard learning completed');
  }
  
  // Test provider management
  console.log('\n📊 Phase 5: Testing Provider Management');
  console.log('----------------------------------------');
  
  const providerHealth = providerManager.getProviderHealth();
  console.log('🏥 Provider Health Status:');
  for (const health of providerHealth) {
    console.log(`  ${health.providerId}: ${health.isHealthy ? '✅ Healthy' : '❌ Unhealthy'} (${health.responseTime}ms)`);
  }
  
  const usageStats = llmService.getUsageStats();
  console.log('\n📊 Usage Statistics:');
  console.log(`Total requests: ${usageStats.totalRequests}`);
  console.log(`Total tokens: ${usageStats.totalTokens}`);
  console.log(`Total cost: $${usageStats.totalCost.toFixed(6)}`);
  console.log(`Average latency: ${usageStats.averageLatency.toFixed(2)}ms`);
  
  // Test provider switching
  try {
    const availableProviders = llmService.getProviders();
    if (availableProviders.length > 1) {
      const secondProvider = availableProviders[1];
      await llmService.switchProvider(secondProvider.id);
      console.log(`🔄 Switched to provider: ${secondProvider.name}`);
      
      // Test response with new provider
      const testResponse = await llmService.generateResponse('What is the meaning of life?', {
        maxTokens: 100
      });
      console.log(`✅ Test response from ${testResponse.provider}: ${testResponse.content.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log('⚠️ Provider switching not available');
  }
  
  // Test quota management
  console.log('\n📊 Phase 6: Testing Quota Management');
  console.log('-------------------------------------');
  
  const quotaCheck = await providerManager.checkQuotaLimits();
  console.log(`Quota check: ${quotaCheck ? '✅ Within limits' : '❌ Limits exceeded'}`);
  
  const quotaConfig = providerManager.getQuotaConfig();
  console.log('📋 Quota Configuration:');
  console.log(`Daily limit: ${quotaConfig.dailyLimit} requests`);
  console.log(`Monthly limit: ${quotaConfig.monthlyLimit} requests`);
  console.log(`Cost limit: $${quotaConfig.costLimit}`);
  
  // Cleanup
  console.log('\n🧹 Cleaning up...');
  await providerManager.shutdown();
  
  console.log('\n🎉 Phase 4 Production LLM Integration Demo completed!');
  console.log('\n📋 Summary:');
  console.log('✅ Production LLM service initialized');
  console.log('✅ Streaming functionality tested');
  console.log('✅ Enhanced H²GNN learning with LLM assistance');
  console.log('✅ Provider management and load balancing');
  console.log('✅ Quota management and monitoring');
  console.log('\n🚀 Ready for Phase 4: 3D Visualization!');
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateProductionLLMIntegration().catch(console.error);
}
