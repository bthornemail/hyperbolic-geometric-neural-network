#!/usr/bin/env node

/**
 * MQTT Transport Adapter
 * 
 * Implements MQTT (Mosquitto) transport for the Native H²GNN Protocol
 * with BIP32 HD addressing and topic routing
 */

import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import type { H2GNNAddress, ProtocolMessage, MessageHandler } from '../native-protocol.js';

export interface MQTTTransportConfig {
  broker: string;
  port: number;
  username?: string;
  password?: string;
  clientId?: string;
  keepalive?: number;
  clean?: boolean;
  reconnectPeriod?: number;
  connectTimeout?: number;
}

export class MQTTTransport {
  private client: MqttClient | null = null;
  private config: MQTTTransportConfig;
  private isConnected: boolean = false;
  private subscriptions: Map<string, MessageHandler> = new Map();
  private messageHandlers: Map<string, MessageHandler> = new Map();

  constructor(config: MQTTTransportConfig) {
    this.config = config;
  }

  /**
   * Connect to MQTT broker
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    const options: IClientOptions = {
      host: this.config.broker,
      port: this.config.port,
      clientId: this.config.clientId || `h2gnn-${Date.now()}`,
      keepalive: this.config.keepalive || 60,
      clean: this.config.clean !== false,
      reconnectPeriod: this.config.reconnectPeriod || 1000,
      connectTimeout: this.config.connectTimeout || 30 * 1000,
      username: this.config.username,
      password: this.config.password,
    };

    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(options);

      this.client.on('connect', () => {
        console.log('🔗 MQTT Transport connected to broker');
        this.isConnected = true;
        resolve();
      });

      this.client.on('error', (error) => {
        console.error('❌ MQTT Transport connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.client.on('disconnect', () => {
        console.log('🔌 MQTT Transport disconnected');
        this.isConnected = false;
      });

      this.client.on('reconnect', () => {
        console.log('🔄 MQTT Transport reconnecting...');
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });
    });
  }

  /**
   * Disconnect from MQTT broker
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      return new Promise((resolve) => {
        this.client!.end(false, {}, () => {
          console.log('🔌 MQTT Transport disconnected');
          this.isConnected = false;
          resolve();
        });
      });
    }
  }

  /**
   * Publish message to MQTT topic
   */
  async publish(address: H2GNNAddress, message: ProtocolMessage): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('MQTT Transport not connected');
    }

    const topic = this.getTopicFromAddress(address);
    const payload = JSON.stringify(message);
    
    return new Promise((resolve, reject) => {
      this.client!.publish(topic, payload, { qos: 1 }, (error) => {
        if (error) {
          console.error('❌ MQTT publish error:', error);
          reject(error);
        } else {
          console.log(`📤 MQTT published to ${topic}: ${message.header.messageId}`);
          resolve();
        }
      });
    });
  }

  /**
   * Subscribe to MQTT topic
   */
  async subscribe(address: H2GNNAddress, callback: MessageHandler): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('MQTT Transport not connected');
    }

    const topic = this.getTopicFromAddress(address);
    
    return new Promise((resolve, reject) => {
      this.client!.subscribe(topic, { qos: 1 }, (error) => {
        if (error) {
          console.error('❌ MQTT subscribe error:', error);
          reject(error);
        } else {
          console.log(`📥 MQTT subscribed to ${topic}`);
          this.subscriptions.set(topic, callback);
          resolve();
        }
      });
    });
  }

  /**
   * Unsubscribe from MQTT topic
   */
  async unsubscribe(address: H2GNNAddress): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('MQTT Transport not connected');
    }

    const topic = this.getTopicFromAddress(address);
    
    return new Promise((resolve, reject) => {
      this.client!.unsubscribe(topic, (error) => {
        if (error) {
          console.error('❌ MQTT unsubscribe error:', error);
          reject(error);
        } else {
          console.log(`📤 MQTT unsubscribed from ${topic}`);
          this.subscriptions.delete(topic);
          resolve();
        }
      });
    });
  }

  /**
   * Get topic from H²GNN address
   */
  private getTopicFromAddress(address: H2GNNAddress): string {
    const { component, network } = address;
    const baseTopic = `h2gnn/${component.type}/${component.instance}`;
    
    // Add transport-specific routing
    switch (network.transport) {
      case 'mqtt':
        return baseTopic;
      default:
        return `${baseTopic}/${network.transport}`;
    }
  }

  /**
   * Handle incoming MQTT messages
   */
  private handleMessage(topic: string, message: Buffer): void {
    try {
      const protocolMessage: ProtocolMessage = JSON.parse(message.toString());
      
      // Find the appropriate handler for this topic
      const handler = this.subscriptions.get(topic);
      if (handler) {
        console.log(`📥 MQTT received message on ${topic}: ${protocolMessage.header.messageId}`);
        handler(protocolMessage);
      } else {
        console.warn(`⚠️ No handler found for MQTT topic: ${topic}`);
      }
    } catch (error) {
      console.error('❌ Error parsing MQTT message:', error);
    }
  }

  /**
   * Get connection status
   */
  isTransportConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Get transport statistics
   */
  getStats(): {
    connected: boolean;
    subscriptions: number;
    broker: string;
    port: number;
  } {
    return {
      connected: this.isConnected,
      subscriptions: this.subscriptions.size,
      broker: this.config.broker,
      port: this.config.port
    };
  }
}

// Class is already exported above, no need for additional exports
