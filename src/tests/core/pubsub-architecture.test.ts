/**
 * Test suite for Pub/Sub Architecture
 * Tests the three-tier architecture: Broker, Provider, Consumer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  H2GNNBroker, 
  H2GNNProvider, 
  H2GNNConsumer,
  IntegratedH2GNNSystem,
  PubSubMessage,
  H2GNNEmbeddingsUpdatePayload
} from '../../core/pubsub-architecture';
import { createVector } from '../../math/hyperbolic-arithmetic';

describe('Pub/Sub Architecture', () => {
  let broker: H2GNNBroker;
  let provider: H2GNNProvider;
  let consumer: H2GNNConsumer;
  let integratedSystem: IntegratedH2GNNSystem;

  beforeEach(async () => {
    broker = new H2GNNBroker();
    provider = new H2GNNProvider();
    consumer = new H2GNNConsumer();
    integratedSystem = new IntegratedH2GNNSystem();
    
    await broker.initialize();
    await provider.initialize();
    await consumer.initialize();
    await integratedSystem.initialize();
  });

  afterEach(async () => {
    await broker.cleanup();
    await provider.cleanup();
    await consumer.cleanup();
    await integratedSystem.cleanup();
  });

  describe('Broker Component', () => {
    it('should initialize broker correctly', () => {
      expect(broker).toBeDefined();
      expect(broker.isInitialized()).toBe(true);
    });

    it('should handle message routing', async () => {
      const message: PubSubMessage = {
        type: 'embeddings_update',
        channel: 'h2gnn.embeddings',
        payload: { embeddings: [] },
        timestamp: Date.now(),
        source: 'provider',
        priority: 1
      };
      
      const result = await broker.routeMessage(message);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should manage subscriptions', async () => {
      const unsubscribe = await broker.subscribe('h2gnn.embeddings', (message) => {
        expect(message).toBeDefined();
      });
      
      expect(unsubscribe).toBeDefined();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle message broadcasting', async () => {
      const subscribers = await Promise.all([
        broker.subscribe('test.channel', () => {}),
        broker.subscribe('test.channel', () => {}),
        broker.subscribe('test.channel', () => {})
      ]);
      
      const message: PubSubMessage = {
        type: 'test_message',
        channel: 'test.channel',
        payload: { test: 'data' },
        timestamp: Date.now()
      };
      
      const result = await broker.broadcast(message);
      
      expect(result).toBeDefined();
      expect(result.subscribersNotified).toBe(3);
    });

    it('should handle message queuing', async () => {
      const message: PubSubMessage = {
        type: 'queued_message',
        channel: 'test.queue',
        payload: { data: 'test' },
        timestamp: Date.now(),
        priority: 2
      };
      
      await broker.queueMessage(message);
      const queued = await broker.getQueuedMessages();
      
      expect(queued).toHaveLength(1);
      expect(queued[0].payload.data).toBe('test');
    });
  });

  describe('Provider Component', () => {
    it('should initialize provider correctly', () => {
      expect(provider).toBeDefined();
      expect(provider.isInitialized()).toBe(true);
    });

    it('should process embeddings updates', async () => {
      const embeddings = [
        createVector([0.1, 0.2, 0.3]),
        createVector([0.4, 0.5, 0.6]),
        createVector([0.7, 0.8, 0.9])
      ];
      
      const payload: H2GNNEmbeddingsUpdatePayload = {
        header: {
          schemaVersion: '1.0.0',
          timestamp: Date.now(),
          curvature: -1.0,
          embeddingDimension: 3,
          totalEmbeddings: 3
        },
        binaryData: {
          embeddings: new ArrayBuffer(24), // 3 * 3 * 4 bytes
          confidenceScores: new ArrayBuffer(12), // 3 * 4 bytes
          clusterAssignments: new ArrayBuffer(12),
          semanticLabels: new ArrayBuffer(12)
        },
        metadata: {
          trainingEpoch: 1,
          lossMetrics: {
            total: 0.5,
            manifold: 0.2,
            topological: 0.1,
            hyperbolic: 0.2
          },
          topologicalFeatures: {
            bettiNumbers: [1, 0, 0],
            persistentHomology: []
          }
        }
      };
      
      const result = await provider.processEmbeddingsUpdate(payload);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.processedEmbeddings).toBe(3);
    });

    it('should handle high-performance computations', async () => {
      const startTime = Date.now();
      
      const result = await provider.computeEmbeddings({
        nodes: Array.from({ length: 100 }, (_, i) => createVector([i * 0.01, i * 0.02])),
        edges: Array.from({ length: 50 }, (_, i) => [i, i + 50])
      });
      
      const endTime = Date.now();
      
      expect(result).toBeDefined();
      expect(result.embeddings).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should manage compute resources', () => {
      const resources = provider.getResourceUsage();
      
      expect(resources).toBeDefined();
      expect(resources.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(resources.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(resources.gpuUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Consumer Component', () => {
    it('should initialize consumer correctly', () => {
      expect(consumer).toBeDefined();
      expect(consumer.isInitialized()).toBe(true);
    });

    it('should handle visualization updates', async () => {
      const visualizationData = {
        embeddings: [
          { x: 0.1, y: 0.2, z: 0.3, label: 'point1' },
          { x: 0.4, y: 0.5, z: 0.6, label: 'point2' }
        ],
        clusters: [
          { id: 1, points: [0, 1], color: '#ff0000' }
        ]
      };
      
      const result = await consumer.updateVisualization(visualizationData);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle user interactions', async () => {
      const interaction = {
        type: 'click',
        coordinates: { x: 100, y: 200 },
        target: 'embedding_point',
        data: { id: 'point1', embedding: [0.1, 0.2, 0.3] }
      };
      
      const result = await consumer.handleInteraction(interaction);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should manage real-time updates', async () => {
      const updateCallback = (data: any) => {
        expect(data).toBeDefined();
      };
      
      await consumer.subscribeToUpdates('embeddings', updateCallback);
      
      const update = {
        type: 'embedding_update',
        data: { embeddings: [] }
      };
      
      await consumer.publishUpdate(update);
    });
  });

  describe('Integrated System', () => {
    it('should initialize integrated system', () => {
      expect(integratedSystem).toBeDefined();
      expect(integratedSystem.isInitialized()).toBe(true);
    });

    it('should coordinate between components', async () => {
      const message: PubSubMessage = {
        type: 'coordination_test',
        channel: 'system.coordination',
        payload: { test: 'coordination' },
        timestamp: Date.now()
      };
      
      const result = await integratedSystem.coordinateMessage(message);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle system-wide events', async () => {
      const event = {
        type: 'system_event',
        data: { event: 'test' },
        timestamp: Date.now()
      };
      
      const result = await integratedSystem.handleSystemEvent(event);
      
      expect(result).toBeDefined();
      expect(result.processed).toBe(true);
    });

    it('should manage system health', () => {
      const health = integratedSystem.getSystemHealth();
      
      expect(health).toBeDefined();
      expect(health.broker).toBeDefined();
      expect(health.provider).toBeDefined();
      expect(health.consumer).toBeDefined();
      expect(health.overall).toBeDefined();
    });
  });

  describe('Message Flow', () => {
    it('should handle end-to-end message flow', async () => {
      const message: PubSubMessage = {
        type: 'end_to_end_test',
        channel: 'test.flow',
        payload: { data: 'flow_test' },
        timestamp: Date.now()
      };
      
      // Provider sends message
      await provider.sendMessage(message);
      
      // Broker routes message
      const routed = await broker.routeMessage(message);
      
      // Consumer receives message
      const received = await consumer.receiveMessage(message);
      
      expect(routed.success).toBe(true);
      expect(received.success).toBe(true);
    });

    it('should handle message acknowledgments', async () => {
      const message: PubSubMessage = {
        type: 'ack_test',
        channel: 'test.ack',
        payload: { data: 'ack_test' },
        timestamp: Date.now()
      };
      
      const ack = await broker.sendWithAck(message);
      
      expect(ack).toBeDefined();
      expect(ack.acknowledged).toBe(true);
      expect(ack.timestamp).toBeGreaterThan(message.timestamp);
    });

    it('should handle message retries', async () => {
      const message: PubSubMessage = {
        type: 'retry_test',
        channel: 'test.retry',
        payload: { data: 'retry_test' },
        timestamp: Date.now()
      };
      
      // Simulate failure
      broker.setFailureRate(1.0);
      
      const result = await broker.sendWithRetry(message, 3);
      
      expect(result).toBeDefined();
      expect(result.attempts).toBeGreaterThan(1);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high message throughput', async () => {
      const startTime = Date.now();
      
      // Send many messages
      const promises = Array.from({ length: 100 }, (_, i) => {
        const message: PubSubMessage = {
          type: 'throughput_test',
          channel: 'test.throughput',
          payload: { index: i },
          timestamp: Date.now()
        };
        return broker.routeMessage(message);
      });
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle large payloads efficiently', async () => {
      const largePayload = {
        embeddings: Array.from({ length: 1000 }, (_, i) => [i * 0.001, i * 0.002, i * 0.003]),
        metadata: Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `item_${i}` }))
      };
      
      const message: PubSubMessage = {
        type: 'large_payload_test',
        channel: 'test.large',
        payload: largePayload,
        timestamp: Date.now()
      };
      
      const startTime = Date.now();
      const result = await broker.routeMessage(message);
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Error Handling', () => {
    it('should handle broker failures gracefully', async () => {
      await broker.cleanup();
      
      const message: PubSubMessage = {
        type: 'failure_test',
        channel: 'test.failure',
        payload: { data: 'test' },
        timestamp: Date.now()
      };
      
      await expect(broker.routeMessage(message))
        .rejects.toThrow('Broker not initialized');
    });

    it('should handle provider failures gracefully', async () => {
      await provider.cleanup();
      
      const payload: H2GNNEmbeddingsUpdatePayload = {
        header: {
          schemaVersion: '1.0.0',
          timestamp: Date.now(),
          curvature: -1.0,
          embeddingDimension: 3,
          totalEmbeddings: 1
        },
        binaryData: {
          embeddings: new ArrayBuffer(12),
          confidenceScores: new ArrayBuffer(4),
          clusterAssignments: new ArrayBuffer(4),
          semanticLabels: new ArrayBuffer(4)
        },
        metadata: {
          trainingEpoch: 1,
          lossMetrics: { total: 0.5, manifold: 0.2, topological: 0.1, hyperbolic: 0.2 },
          topologicalFeatures: { bettiNumbers: [1, 0, 0], persistentHomology: [] }
        }
      };
      
      await expect(provider.processEmbeddingsUpdate(payload))
        .rejects.toThrow('Provider not initialized');
    });

    it('should handle consumer failures gracefully', async () => {
      await consumer.cleanup();
      
      const interaction = {
        type: 'click',
        coordinates: { x: 100, y: 200 },
        target: 'test',
        data: {}
      };
      
      await expect(consumer.handleInteraction(interaction))
        .rejects.toThrow('Consumer not initialized');
    });
  });

  describe('Security and Validation', () => {
    it('should validate message signatures', async () => {
      const message: PubSubMessage = {
        type: 'signature_test',
        channel: 'test.signature',
        payload: { data: 'test' },
        timestamp: Date.now(),
        signature: 'valid-signature'
      };
      
      const isValid = await broker.validateMessageSignature(message);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signatures', async () => {
      const message: PubSubMessage = {
        type: 'invalid_signature_test',
        channel: 'test.invalid',
        payload: { data: 'test' },
        timestamp: Date.now(),
        signature: 'invalid-signature'
      };
      
      const isValid = await broker.validateMessageSignature(message);
      expect(isValid).toBe(false);
    });

    it('should handle message encryption', async () => {
      const message: PubSubMessage = {
        type: 'encryption_test',
        channel: 'test.encryption',
        payload: { sensitive: 'data' },
        timestamp: Date.now()
      };
      
      const encrypted = await broker.encryptMessage(message);
      const decrypted = await broker.decryptMessage(encrypted);
      
      expect(encrypted).toBeDefined();
      expect(decrypted.payload.sensitive).toBe('data');
    });
  });
});
