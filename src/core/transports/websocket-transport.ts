#!/usr/bin/env node

/**
 * WebSocket Transport Adapter
 * 
 * Implements WebSocket transport for the Native H²GNN Protocol
 * with BIP32 HD addressing and real-time communication
 */

import WebSocket from 'ws';
import type { H2GNNAddress, ProtocolMessage, MessageHandler } from '../native-protocol.js';

export interface WebSocketTransportConfig {
  server: string;
  port: number;
  path?: string;
  protocols?: string[];
  timeout?: number;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketTransport {
  private socket: WebSocket | null = null;
  private config: WebSocketTransportConfig;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: WebSocketTransportConfig) {
    this.config = config;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    const url = `ws://${this.config.server}:${this.config.port}${this.config.path || ''}`;
    
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(url, this.config.protocols, {
        handshakeTimeout: this.config.timeout || 30000,
      });

      this.socket.on('open', () => {
        console.log('🔗 WebSocket Transport connected to server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('error', (error) => {
        console.error('❌ WebSocket Transport connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('close', (code, reason) => {
        console.log(`🔌 WebSocket Transport disconnected: ${code} - ${reason}`);
        this.isConnected = false;
        this.handleReconnect();
      });

      this.socket.on('message', (data) => {
        this.handleMessage(data);
      });
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  async disconnect(): Promise<void> {
    if (this.socket && this.isConnected) {
      this.socket.close(1000, 'Normal closure');
      this.isConnected = false;
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }
  }

  /**
   * Send message via WebSocket
   */
  async send(address: H2GNNAddress, message: ProtocolMessage): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket Transport not connected');
    }

    const payload = JSON.stringify({
      address,
      message
    });

    return new Promise((resolve, reject) => {
      this.socket!.send(payload, (error) => {
        if (error) {
          console.error('❌ WebSocket send error:', error);
          reject(error);
        } else {
          console.log(`📤 WebSocket sent message: ${message.header.messageId}`);
          resolve();
        }
      });
    });
  }

  /**
   * Subscribe to messages for address
   */
  async subscribe(address: H2GNNAddress, callback: MessageHandler): Promise<void> {
    const addressKey = this.getAddressKey(address);
    this.messageHandlers.set(addressKey, callback);
    
    console.log(`📥 WebSocket subscribed to address: ${addressKey}`);
  }

  /**
   * Unsubscribe from messages for address
   */
  async unsubscribe(address: H2GNNAddress): Promise<void> {
    const addressKey = this.getAddressKey(address);
    this.messageHandlers.delete(addressKey);
    
    console.log(`📤 WebSocket unsubscribed from address: ${addressKey}`);
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      console.error('❌ WebSocket Transport: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval || 5000;
    
    console.log(`🔄 WebSocket Transport: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('❌ WebSocket Transport: Reconnection failed:', error);
        this.handleReconnect();
      });
    }, delay);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: WebSocket.Data): void {
    try {
      const parsed = JSON.parse(data.toString());
      
      if (parsed.address && parsed.message) {
        const address = parsed.address as H2GNNAddress;
        const message = parsed.message as ProtocolMessage;
        
        const addressKey = this.getAddressKey(address);
        const handler = this.messageHandlers.get(addressKey);
        
        if (handler) {
          console.log(`📥 WebSocket received message for ${addressKey}: ${message.header.messageId}`);
          handler(message);
        } else {
          console.warn(`⚠️ No handler found for WebSocket address: ${addressKey}`);
        }
      } else {
        console.warn('⚠️ Invalid WebSocket message format');
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }

  /**
   * Get address key for routing
   */
  private getAddressKey(address: H2GNNAddress): string {
    return `${address.component.type}-${address.component.instance}-${address.component.transport}`;
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
    return Array.from(this.messageHandlers.keys());
  }

  /**
   * Get transport statistics
   */
  getStats(): {
    connected: boolean;
    subscriptions: number;
    server: string;
    port: number;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      subscriptions: this.messageHandlers.size,
      server: this.config.server,
      port: this.config.port,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Class is already exported above, no need for additional exports
