/**
 * Redis Caching with BIP32 HD Addressing
 * 
 * Implements Redis caching with BIP32 HD addressing for deterministic
 * cache key generation and hierarchical data management in the H²GNN system
 */

import { BIP32HDAddressing, H2GNNAddress } from './native-protocol.js';
import { createHash } from 'crypto';

// Redis client interface (simplified)
export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<boolean>;
  del(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
  flushdb(): Promise<boolean>;
  ping(): Promise<string>;
}

// Cache configuration
export interface H2GNNRedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix: string;
  defaultTTL: number;
  maxMemory?: string;
  evictionPolicy?: 'allkeys-lru' | 'allkeys-lfu' | 'volatile-lru' | 'volatile-lfu';
}

// Cache entry types
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  h2gnnAddress: H2GNNAddress;
  metadata: {
    purpose: string;
    component: string;
    version: string;
    compression?: string;
  };
}

export interface CacheStats {
  totalKeys: number;
  memoryUsage: string;
  hitRate: number;
  missRate: number;
  evictions: number;
  connectedClients: number;
}

/**
 * Redis Caching with BIP32 HD Addressing
 * 
 * Provides deterministic cache key generation and hierarchical
 * data management using BIP32 HD addressing
 */
export class H2GNNRedisCache {
  private hdAddressing: BIP32HDAddressing;
  private redis: RedisClient;
  private config: H2GNNRedisConfig;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
  } = { hits: 0, misses: 0, evictions: 0 };

  constructor(hdAddressing: BIP32HDAddressing, redis: RedisClient, config: H2GNNRedisConfig) {
    this.hdAddressing = hdAddressing;
    this.redis = redis;
    this.config = config;
  }

  /**
   * Generate deterministic cache key from H²GNN address
   */
  private generateCacheKey(h2gnnAddress: H2GNNAddress, purpose: string, component: string): string {
    const pathHash = createHash('sha256').update(h2gnnAddress.path).digest('hex').substring(0, 16);
    const purposeHash = createHash('sha256').update(purpose).digest('hex').substring(0, 8);
    const componentHash = createHash('sha256').update(component).digest('hex').substring(0, 8);
    
    return `${this.config.keyPrefix}:${pathHash}:${purposeHash}:${componentHash}`;
  }

  /**
   * Store data in cache with H²GNN addressing
   */
  async set<T>(
    h2gnnAddress: H2GNNAddress,
    purpose: string,
    component: string,
    data: T,
    ttl?: number,
    metadata?: Partial<CacheEntry<T>['metadata']>
  ): Promise<boolean> {
    try {
      const key = this.generateCacheKey(h2gnnAddress, purpose, component);
      
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        h2gnnAddress,
        metadata: {
          purpose,
          component,
          version: '1.0.0',
          ...metadata
        }
      };

      const serialized = JSON.stringify(entry);
      const result = await this.redis.set(key, serialized, ttl || this.config.defaultTTL);
      
      return result;
    } catch (error) {
      console.error('Redis cache set error:', error);
      return false;
    }
  }

  /**
   * Retrieve data from cache using H²GNN addressing
   */
  async get<T>(
    h2gnnAddress: H2GNNAddress,
    purpose: string,
    component: string
  ): Promise<T | null> {
    try {
      const key = this.generateCacheKey(h2gnnAddress, purpose, component);
      const serialized = await this.redis.get(key);
      
      if (!serialized) {
        this.stats.misses++;
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(serialized);
      
      // Check if entry is expired
      if (Date.now() - entry.timestamp > entry.ttl * 1000) {
        await this.redis.del(key);
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return entry.data;
    } catch (error) {
      console.error('Redis cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Delete data from cache using H²GNN addressing
   */
  async delete(
    h2gnnAddress: H2GNNAddress,
    purpose: string,
    component: string
  ): Promise<boolean> {
    try {
      const key = this.generateCacheKey(h2gnnAddress, purpose, component);
      return await this.redis.del(key);
    } catch (error) {
      console.error('Redis cache delete error:', error);
      return false;
    }
  }

  /**
   * Check if data exists in cache
   */
  async exists(
    h2gnnAddress: H2GNNAddress,
    purpose: string,
    component: string
  ): Promise<boolean> {
    try {
      const key = this.generateCacheKey(h2gnnAddress, purpose, component);
      return await this.redis.exists(key);
    } catch (error) {
      console.error('Redis cache exists error:', error);
      return false;
    }
  }

  /**
   * Set TTL for existing cache entry
   */
  async expire(
    h2gnnAddress: H2GNNAddress,
    purpose: string,
    component: string,
    ttl: number
  ): Promise<boolean> {
    try {
      const key = this.generateCacheKey(h2gnnAddress, purpose, component);
      return await this.redis.expire(key, ttl);
    } catch (error) {
      console.error('Redis cache expire error:', error);
      return false;
    }
  }

  /**
   * Get all cache keys for a specific H²GNN address
   */
  async getKeysForAddress(h2gnnAddress: H2GNNAddress): Promise<string[]> {
    try {
      const pathHash = createHash('sha256').update(h2gnnAddress.path).digest('hex').substring(0, 16);
      const pattern = `${this.config.keyPrefix}:${pathHash}:*`;
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error('Redis cache getKeysForAddress error:', error);
      return [];
    }
  }

  /**
   * Get all cache keys for a specific purpose
   */
  async getKeysForPurpose(purpose: string): Promise<string[]> {
    try {
      const purposeHash = createHash('sha256').update(purpose).digest('hex').substring(0, 8);
      const pattern = `${this.config.keyPrefix}:*:${purposeHash}:*`;
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error('Redis cache getKeysForPurpose error:', error);
      return [];
    }
  }

  /**
   * Get all cache keys for a specific component
   */
  async getKeysForComponent(component: string): Promise<string[]> {
    try {
      const componentHash = createHash('sha256').update(component).digest('hex').substring(0, 8);
      const pattern = `${this.config.keyPrefix}:*:*:${componentHash}`;
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error('Redis cache getKeysForComponent error:', error);
      return [];
    }
  }

  /**
   * Clear all cache entries for a specific H²GNN address
   */
  async clearAddress(h2gnnAddress: H2GNNAddress): Promise<number> {
    try {
      const keys = await this.getKeysForAddress(h2gnnAddress);
      let deletedCount = 0;
      
      for (const key of keys) {
        if (await this.redis.del(key)) {
          deletedCount++;
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Redis cache clearAddress error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache entries for a specific purpose
   */
  async clearPurpose(purpose: string): Promise<number> {
    try {
      const keys = await this.getKeysForPurpose(purpose);
      let deletedCount = 0;
      
      for (const key of keys) {
        if (await this.redis.del(key)) {
          deletedCount++;
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Redis cache clearPurpose error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache entries for a specific component
   */
  async clearComponent(component: string): Promise<number> {
    try {
      const keys = await this.getKeysForComponent(component);
      let deletedCount = 0;
      
      for (const key of keys) {
        if (await this.redis.del(key)) {
          deletedCount++;
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Redis cache clearComponent error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<boolean> {
    try {
      return await this.redis.flushdb();
    } catch (error) {
      console.error('Redis cache clearAll error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const totalKeys = (await this.redis.keys(`${this.config.keyPrefix}:*`)).length;
      const totalRequests = this.stats.hits + this.stats.misses;
      const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
      const missRate = totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0;
      
      return {
        totalKeys,
        memoryUsage: 'N/A', // Would need Redis INFO command
        hitRate,
        missRate,
        evictions: this.stats.evictions,
        connectedClients: 1 // Would need Redis INFO command
      };
    } catch (error) {
      console.error('Redis cache getStats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'N/A',
        hitRate: 0,
        missRate: 0,
        evictions: 0,
        connectedClients: 0
      };
    }
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  /**
   * Get cache entry metadata
   */
  async getEntryMetadata(
    h2gnnAddress: H2GNNAddress,
    purpose: string,
    component: string
  ): Promise<CacheEntry['metadata'] | null> {
    try {
      const key = this.generateCacheKey(h2gnnAddress, purpose, component);
      const serialized = await this.redis.get(key);
      
      if (!serialized) {
        return null;
      }

      const entry: CacheEntry = JSON.parse(serialized);
      return entry.metadata;
    } catch (error) {
      console.error('Redis cache getEntryMetadata error:', error);
      return null;
    }
  }

  /**
   * Batch operations for multiple H²GNN addresses
   */
  async batchSet<T>(
    entries: Array<{
      h2gnnAddress: H2GNNAddress;
      purpose: string;
      component: string;
      data: T;
      ttl?: number;
      metadata?: Partial<CacheEntry<T>['metadata']>;
    }>
  ): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const entry of entries) {
      const result = await this.set(
        entry.h2gnnAddress,
        entry.purpose,
        entry.component,
        entry.data,
        entry.ttl,
        entry.metadata
      );
      results.push(result);
    }
    
    return results;
  }

  /**
   * Batch get operations for multiple H²GNN addresses
   */
  async batchGet<T>(
    queries: Array<{
      h2gnnAddress: H2GNNAddress;
      purpose: string;
      component: string;
    }>
  ): Promise<Array<T | null>> {
    const results: Array<T | null> = [];
    
    for (const query of queries) {
      const result = await this.get<T>(
        query.h2gnnAddress,
        query.purpose,
        query.component
      );
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get cache health status
   */
  async getHealthStatus(): Promise<{ healthy: boolean; message: string }> {
    try {
      const pong = await this.redis.ping();
      if (pong === 'PONG') {
        return { healthy: true, message: 'Redis cache is healthy' };
      } else {
        return { healthy: false, message: 'Redis cache ping failed' };
      }
    } catch (error) {
      return { healthy: false, message: `Redis cache error: ${error}` };
    }
  }
}

/**
 * Mock Redis client for demonstration
 */
class MockRedisClient implements RedisClient {
  private data: Map<string, { value: string; ttl?: number; timestamp: number }> = new Map();

  async get(key: string): Promise<string | null> {
    const entry = this.data.get(key);
    if (!entry) return null;
    
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.data.delete(key);
      return null;
    }
    
    return entry.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    this.data.set(key, {
      value,
      ttl,
      timestamp: Date.now()
    });
    return true;
  }

  async del(key: string): Promise<boolean> {
    return this.data.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.data.has(key);
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    const entry = this.data.get(key);
    if (!entry) return false;
    
    entry.ttl = ttl;
    return true;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.data.keys()).filter(key => regex.test(key));
  }

  async flushdb(): Promise<boolean> {
    this.data.clear();
    return true;
  }

  async ping(): Promise<string> {
    return 'PONG';
  }
}

/**
 * Redis + BIP32 HD Addressing Demo
 */
export async function demonstrateRedisHDCaching(): Promise<void> {
  console.log('🗄️ Redis + BIP32 HD Addressing Demo Starting...\n');
  
  try {
    // Initialize BIP32 HD addressing
    const seed = Buffer.from('h2gnn-redis-demo-seed', 'utf8');
    const hdAddressing = new BIP32HDAddressing(seed, 'testnet');
    
    // Initialize mock Redis client
    const mockRedis = new MockRedisClient();
    
    // Configure Redis cache
    const config: H2GNNRedisConfig = {
      host: 'localhost',
      port: 6379,
      keyPrefix: 'h2gnn',
      defaultTTL: 3600,
      maxMemory: '100mb',
      evictionPolicy: 'allkeys-lru'
    };
    
    const cache = new H2GNNRedisCache(hdAddressing, mockRedis, config);
    
    console.log('✅ Redis cache with BIP32 HD addressing initialized\n');
    
    // Create H²GNN addresses for different components
    const brokerAddress = hdAddressing.createAddress('broker', 0, 'external', 'mqtt', 'localhost', 1883);
    const providerAddress = hdAddressing.createAddress('provider', 0, 'external', 'websocket', 'localhost', 8080);
    const consumerAddress = hdAddressing.createAddress('consumer', 0, 'external', 'tcp', 'localhost', 3000);
    
    console.log('📍 Created H²GNN addresses:');
    console.log(`   Broker: ${brokerAddress.path}`);
    console.log(`   Provider: ${providerAddress.path}`);
    console.log(`   Consumer: ${consumerAddress.path}\n`);
    
    // Store data in cache
    console.log('💾 Storing data in cache...');
    
    const embeddingData = {
      coordinates: [0.5, -0.3],
      curvature: -1.0,
      embedding: Array.from({ length: 64 }, () => Math.random()),
      semanticLabel: 'concept-1',
      confidence: 0.95
    };
    
    const trainingData = {
      epoch: 1,
      loss: 0.123,
      accuracy: 0.987,
      learningRate: 0.01
    };
    
    const visualizationData = {
      nodes: [
        { id: 'node1', x: 0.1, y: 0.2, label: 'Concept A' },
        { id: 'node2', x: -0.3, y: 0.4, label: 'Concept B' }
      ],
      edges: [
        { source: 'node1', target: 'node2', weight: 0.8 }
      ]
    };
    
    // Store different types of data
    await cache.set(brokerAddress, 'embeddings', 'hyperbolic', embeddingData, 1800);
    await cache.set(providerAddress, 'training', 'progress', trainingData, 3600);
    await cache.set(consumerAddress, 'visualization', 'graph', visualizationData, 900);
    
    console.log('✅ Data stored in cache successfully\n');
    
    // Retrieve data from cache
    console.log('📥 Retrieving data from cache...');
    
    const retrievedEmbedding = await cache.get(brokerAddress, 'embeddings', 'hyperbolic');
    const retrievedTraining = await cache.get(providerAddress, 'training', 'progress');
    const retrievedVisualization = await cache.get(consumerAddress, 'visualization', 'graph');
    
    console.log('✅ Data retrieved from cache:');
    console.log(`   Embedding data: ${retrievedEmbedding ? 'Found' : 'Not found'}`);
    console.log(`   Training data: ${retrievedTraining ? 'Found' : 'Not found'}`);
    console.log(`   Visualization data: ${retrievedVisualization ? 'Found' : 'Not found'}\n`);
    
    // Check cache existence
    console.log('🔍 Checking cache existence...');
    
    const embeddingExists = await cache.exists(brokerAddress, 'embeddings', 'hyperbolic');
    const trainingExists = await cache.exists(providerAddress, 'training', 'progress');
    const visualizationExists = await cache.exists(consumerAddress, 'visualization', 'graph');
    
    console.log('✅ Cache existence check:');
    console.log(`   Embedding exists: ${embeddingExists}`);
    console.log(`   Training exists: ${trainingExists}`);
    console.log(`   Visualization exists: ${visualizationExists}\n`);
    
    // Get cache keys for different criteria
    console.log('🔑 Getting cache keys...');
    
    const brokerKeys = await cache.getKeysForAddress(brokerAddress);
    const embeddingKeys = await cache.getKeysForPurpose('embeddings');
    const hyperbolicKeys = await cache.getKeysForComponent('hyperbolic');
    
    console.log('✅ Cache keys retrieved:');
    console.log(`   Broker keys: ${brokerKeys.length}`);
    console.log(`   Embedding keys: ${embeddingKeys.length}`);
    console.log(`   Hyperbolic keys: ${hyperbolicKeys.length}\n`);
    
    // Batch operations
    console.log('📦 Demonstrating batch operations...');
    
    const batchEntries = [
      {
        h2gnnAddress: brokerAddress,
        purpose: 'embeddings',
        component: 'batch-1',
        data: { id: 1, value: 'batch-data-1' }
      },
      {
        h2gnnAddress: providerAddress,
        purpose: 'embeddings',
        component: 'batch-2',
        data: { id: 2, value: 'batch-data-2' }
      },
      {
        h2gnnAddress: consumerAddress,
        purpose: 'embeddings',
        component: 'batch-3',
        data: { id: 3, value: 'batch-data-3' }
      }
    ];
    
    const batchSetResults = await cache.batchSet(batchEntries);
    console.log(`✅ Batch set results: ${batchSetResults.filter(r => r).length}/${batchSetResults.length} successful`);
    
    const batchQueries = batchEntries.map(entry => ({
      h2gnnAddress: entry.h2gnnAddress,
      purpose: entry.purpose,
      component: entry.component
    }));
    
    const batchGetResults = await cache.batchGet(batchQueries);
    console.log(`✅ Batch get results: ${batchGetResults.filter(r => r !== null).length}/${batchGetResults.length} successful\n`);
    
    // Get cache statistics
    console.log('📊 Getting cache statistics...');
    
    const stats = await cache.getStats();
    console.log('✅ Cache statistics:');
    console.log(`   Total keys: ${stats.totalKeys}`);
    console.log(`   Hit rate: ${stats.hitRate.toFixed(2)}%`);
    console.log(`   Miss rate: ${stats.missRate.toFixed(2)}%`);
    console.log(`   Evictions: ${stats.evictions}`);
    console.log(`   Connected clients: ${stats.connectedClients}\n`);
    
    // Get cache health status
    console.log('🏥 Checking cache health...');
    
    const health = await cache.getHealthStatus();
    console.log(`✅ Cache health: ${health.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    console.log(`   Message: ${health.message}\n`);
    
    // Clear cache operations
    console.log('🧹 Demonstrating cache clearing...');
    
    const clearedBroker = await cache.clearAddress(brokerAddress);
    const clearedEmbeddings = await cache.clearPurpose('embeddings');
    const clearedHyperbolic = await cache.clearComponent('hyperbolic');
    
    console.log('✅ Cache clearing results:');
    console.log(`   Cleared broker keys: ${clearedBroker}`);
    console.log(`   Cleared embedding keys: ${clearedEmbeddings}`);
    console.log(`   Cleared hyperbolic keys: ${clearedHyperbolic}\n`);
    
    // Final statistics
    const finalStats = await cache.getStats();
    console.log('📊 Final cache statistics:');
    console.log(`   Total keys: ${finalStats.totalKeys}`);
    console.log(`   Hit rate: ${finalStats.hitRate.toFixed(2)}%`);
    console.log(`   Miss rate: ${finalStats.missRate.toFixed(2)}%`);
    
    console.log('\n🎉 Redis + BIP32 HD Addressing Demo Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Deterministic cache key generation');
    console.log('   ✅ Hierarchical data management');
    console.log('   ✅ Batch operations support');
    console.log('   ✅ Cache statistics and health monitoring');
    console.log('   ✅ Efficient cache clearing operations');
    
  } catch (error) {
    console.error('❌ Redis + BIP32 HD addressing demo failed:', error);
    throw error;
  }
}

// 🎯 Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateRedisHDCaching().catch(console.error);
}

