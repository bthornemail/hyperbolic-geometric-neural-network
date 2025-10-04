/**
 * Test suite for Native H²GNN Protocol
 * Tests BIP32 HD addressing, transport management, and protocol communication
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomBytes } from 'crypto';
import { 
  BIP32HDAddressing, 
  H2GNNAddress, 
  ProtocolMessage,
  H2GNNBroker,
  H2GNNProvider,
  H2GNNConsumer,
  H2GNNProtocol
} from '../../core/native-protocol';
import { createVector } from '../../math/hyperbolic-arithmetic';

describe('Native H²GNN Protocol', () => {
  let addressing: BIP32HDAddressing;
  let protocol: H2GNNProtocol;

  beforeEach(() => {
    addressing = new BIP32HDAddressing(randomBytes(32));
    protocol = new H2GNNProtocol();
  });

  afterEach(() => {
    // Cleanup
  });

  describe('BIP32 HD Addressing', () => {
    it('should generate valid HD addresses', () => {
      const address = addressing.generateAddress('test_purpose');
      
      expect(address).toBeDefined();
      expect(address.path).toMatch(/^m\/0x[0-9A-Fa-f]+'\/0x[0-9A-Fa-f]+'\/\d+'\/\d+\/\d+$/);
      expect(address.component).toBeDefined();
      expect(address.hyperbolic).toBeDefined();
      expect(address.network).toBeDefined();
    });

    it('should generate addresses with specific components', () => {
      const brokerAddress = addressing.generateAddress('broker', {
        component: { type: 'broker', instance: 0, transport: 'internal' }
      });
      
      expect(brokerAddress.component.type).toBe('broker');
      expect(brokerAddress.component.instance).toBe(0);
      expect(brokerAddress.component.transport).toBe('internal');
    });

    it('should derive child addresses', () => {
      const parentAddress = addressing.generateAddress('parent');
      const childAddress = addressing.deriveChild(parentAddress, 1);
      
      expect(childAddress.path).toContain(parentAddress.path);
      expect(childAddress.component.instance).toBe(1);
    });

    it('should validate address format', () => {
      const validAddress = addressing.generateAddress('test');
      const isValid = addressing.validateAddress(validAddress);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid addresses', () => {
      const invalidAddress = {
        path: 'invalid/path',
        component: { type: 'broker' as const, instance: -1, transport: 'internal' as const },
        hyperbolic: { curvature: 0, coordinates: [], embedding: [] },
        network: { transport: 'mqtt' as const, endpoint: '' }
      };
      
      const isValid = addressing.validateAddress(invalidAddress);
      expect(isValid).toBe(false);
    });
  });

  describe('Protocol Communication', () => {
    let broker: H2GNNBroker;
    let provider: H2GNNProvider;
    let consumer: H2GNNConsumer;

    beforeEach(async () => {
      broker = new H2GNNBroker();
      provider = new H2GNNProvider();
      consumer = new H2GNNConsumer();
      
      await broker.initialize();
      await provider.initialize();
      await consumer.initialize();
    });

    afterEach(async () => {
      await broker.cleanup();
      await provider.cleanup();
      await consumer.cleanup();
    });

    it('should create protocol messages', () => {
      const message: ProtocolMessage = {
        address: addressing.generateAddress('test'),
        header: {
          version: '1.0.0',
          timestamp: Date.now(),
          messageId: 'test-message-1',
          correlationId: 'correlation-1'
        },
        payload: {
          type: 'embeddings',
          encoding: 'json',
          data: { test: 'data' }
        },
        signature: Buffer.from('test-signature'),
        transport: {
          type: 'mqtt',
          priority: 1
        }
      };
      
      expect(message).toBeDefined();
      expect(message.address).toBeDefined();
      expect(message.header).toBeDefined();
      expect(message.payload).toBeDefined();
    });

    it('should send and receive messages', async () => {
      const testMessage: ProtocolMessage = {
        address: addressing.generateAddress('test'),
        header: {
          version: '1.0.0',
          timestamp: Date.now(),
          messageId: 'test-message-2',
          correlationId: 'correlation-2'
        },
        payload: {
          type: 'embeddings',
          encoding: 'json',
          data: { message: 'hello' }
        },
        signature: Buffer.from('test-signature'),
        transport: {
          type: 'websocket',
          priority: 1
        }
      };
      
      const response = await provider.sendMessage(testMessage);
      
      expect(response).toBeDefined();
      expect(response.header.messageId).toBe(testMessage.header.messageId);
    });

    it('should handle message routing', async () => {
      const message: ProtocolMessage = {
        address: addressing.generateAddress('routing_test'),
        header: {
          version: '1.0.0',
          timestamp: Date.now(),
          messageId: 'routing-message-1',
          correlationId: 'routing-correlation-1'
        },
        payload: {
          type: 'embeddings',
          encoding: 'json',
          data: { route: 'test' }
        },
        signature: Buffer.from('routing-signature'),
        transport: {
          type: 'mqtt',
          priority: 1
        }
      };
      
      const routed = await broker.routeMessage(message);
      
      expect(routed).toBeDefined();
      expect(routed.success).toBe(true);
    });
  });

  describe('Transport Management', () => {
    it('should initialize transport manager', async () => {
      const transportManager = protocol.getTransportManager();
      
      expect(transportManager).toBeDefined();
      expect(transportManager.isInitialized()).toBe(true);
    });

    it('should support multiple transport types', () => {
      const supportedTransports = protocol.getSupportedTransports();
      
      expect(supportedTransports).toContain('mqtt');
      expect(supportedTransports).toContain('webrtc');
      expect(supportedTransports).toContain('websocket');
      expect(supportedTransports).toContain('udp');
      expect(supportedTransports).toContain('tcp');
      expect(supportedTransports).toContain('ipc');
    });

    it('should create transport connections', async () => {
      const connection = await protocol.createConnection('websocket', {
        endpoint: 'ws://localhost:3000',
        port: 3000
      });
      
      expect(connection).toBeDefined();
      expect(connection.isConnected()).toBe(true);
    });

    it('should handle connection errors gracefully', async () => {
      await expect(protocol.createConnection('invalid', {
        endpoint: 'invalid://localhost:9999'
      })).rejects.toThrow('Unsupported transport type');
    });
  });

  describe('Hyperbolic Geometry Integration', () => {
    it('should generate hyperbolic coordinates', () => {
      const address = addressing.createAddress('broker', 0, 'internal', 'mqtt', 'localhost', 1883);
      
      expect(address.hyperbolic).toBeDefined();
      expect(address.hyperbolic.curvature).toBeLessThan(0);
      expect(address.hyperbolic.coordinates).toBeDefined();
      expect(address.hyperbolic.embedding).toBeDefined();
    });

    it('should maintain hyperbolic constraints', () => {
      const address = addressing.createAddress('provider', 0, 'internal', 'mqtt', 'localhost', 1883);
      const coordinates = address.hyperbolic.coordinates;
      
      // Check hyperbolic constraint (norm < 1 for Poincaré ball)
      const norm = Math.sqrt(coordinates.reduce((sum, coord) => sum + coord * coord, 0));
      expect(norm).toBeLessThan(1);
    });

    it('should compute hyperbolic distances', () => {
      const address1 = addressing.generateAddress('distance_test_1');
      const address2 = addressing.generateAddress('distance_test_2');
      
      const distance = addressing.computeHyperbolicDistance(address1, address2);
      
      expect(distance).toBeGreaterThan(0);
      expect(Number.isFinite(distance)).toBe(true);
    });
  });

  describe('Security and Authentication', () => {
    it('should generate secure signatures', () => {
      const message = {
        data: 'test message',
        timestamp: Date.now()
      };
      
      const signature = protocol.generateSignature(message);
      
      expect(signature).toBeDefined();
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should verify signatures', () => {
      const message = {
        data: 'test message',
        timestamp: Date.now()
      };
      
      const signature = protocol.generateSignature(message);
      const isValid = protocol.verifySignature(message, signature);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid signatures', () => {
      const message = {
        data: 'test message',
        timestamp: Date.now()
      };
      
      const invalidSignature = 'invalid-signature';
      const isValid = protocol.verifySignature(message, invalidSignature);
      
      expect(isValid).toBe(false);
    });

    it('should handle message encryption', () => {
      const message = {
        data: 'sensitive data',
        timestamp: Date.now()
      };
      
      const encrypted = protocol.encryptMessage(message);
      const decrypted = protocol.decryptMessage(encrypted);
      
      expect(encrypted).toBeDefined();
      expect(decrypted.data).toBe(message.data);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high-frequency message processing', async () => {
      const startTime = Date.now();
      
      // Send many messages
      const promises = Array.from({ length: 100 }, (_, i) => {
        const message: ProtocolMessage = {
          address: addressing.generateAddress(`perf_test_${i}`),
          header: {
            version: '1.0.0',
            timestamp: Date.now(),
            messageId: `perf-message-${i}`,
            correlationId: `perf-correlation-${i}`
          },
          payload: {
            type: 'embeddings',
            encoding: 'json',
            data: { index: i }
          },
          signature: Buffer.from(`perf-signature-${i}`),
          transport: {
            type: 'mqtt',
            priority: 1
          }
        };
        return protocol.sendMessage(message.address, message);
      });
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should maintain performance with large payloads', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({ index: i, data: `item_${i}` }));
      
      const message: ProtocolMessage = {
        address: addressing.generateAddress('large_payload_test'),
        header: {
          version: '1.0.0',
          timestamp: Date.now(),
          messageId: 'large-message-1',
          correlationId: 'large-correlation-1'
        },
        payload: {
          type: 'embeddings',
          encoding: 'json',
          data: largeData
        },
        signature: Buffer.from('large-signature'),
        transport: {
          type: 'mqtt',
          priority: 1
        }
      };
      
      const startTime = Date.now();
      const response = await protocol.sendMessage(message.address, message);
      const endTime = Date.now();
      
      expect(response).toBeDefined();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const invalidMessage: ProtocolMessage = {
        address: addressing.generateAddress('error_test'),
        header: {
          version: '1.0.0',
          timestamp: Date.now(),
          messageId: 'error-message-1',
          correlationId: 'error-correlation-1'
        },
        payload: {
          type: 'embeddings',
          encoding: 'json',
          data: { error: 'test' }
        },
        signature: Buffer.from('error-signature'),
        transport: {
          type: 'mqtt',
          priority: 1
        }
      };
      
      await expect(protocol.sendMessage(invalidMessage.address, invalidMessage))
        .rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      const timeoutMessage: ProtocolMessage = {
        address: addressing.generateAddress('timeout_test'),
        header: {
          version: '1.0.0',
          timestamp: Date.now(),
          messageId: 'timeout-message-1',
          correlationId: 'timeout-correlation-1'
        },
        payload: {
          type: 'embeddings',
          encoding: 'json',
          data: { timeout: true }
        },
        signature: Buffer.from('timeout-signature'),
        transport: {
          type: 'mqtt',
          priority: 1
        }
      };
      
      // Set a very short timeout
      protocol.setTimeout(1);
      
      await expect(protocol.sendMessage(timeoutMessage.address, timeoutMessage))
        .rejects.toThrow('Request timeout');
    });

    it('should handle malformed addresses', () => {
      const malformedAddress = {
        path: 'invalid',
        component: { type: 'broker' as const, instance: -1, transport: 'internal' as const },
        hyperbolic: { curvature: 0, coordinates: [], embedding: [] },
        network: { transport: 'mqtt' as const, endpoint: '' }
      };
      
      const isValid = addressing.validateAddress(malformedAddress);
      expect(isValid).toBe(false);
    });
  });

  describe('Integration with Core System', () => {
    it('should integrate with H²GNN core functionality', async () => {
      const address = addressing.generateAddress('integration_test');
      const testVector = createVector([0.1, 0.2, 0.3]);
      
      const isValid = protocol.validateHyperbolicConstraints(testVector);
      expect(isValid).toBe(true);
    });

    it('should support geometric operations', () => {
      const address1 = addressing.generateAddress('geo_test_1');
      const address2 = addressing.generateAddress('geo_test_2');
      
      const distance = protocol.computeGeometricDistance(address1, address2);
      expect(distance).toBeGreaterThan(0);
    });
  });
});
