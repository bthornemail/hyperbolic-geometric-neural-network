#!/usr/bin/env node

/**
 * Network Transport Adapter (UDP/TCP)
 * 
 * Implements UDP and TCP transport for the Native H²GNN Protocol
 * with BIP32 HD addressing and low-latency communication
 */

import { createSocket, Socket } from 'dgram';
import { createConnection, Socket as NetSocket } from 'net';
import type { H2GNNAddress, ProtocolMessage, MessageHandler } from '../native-protocol.js';

export interface NetworkTransportConfig {
  host: string;
  port: number;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export class UDPTransport {
  private socket: Socket | null = null;
  private config: NetworkTransportConfig;
  private isConnected: boolean = false;
  private messageHandlers: Map<string, MessageHandler> = new Map();

  constructor(config: NetworkTransportConfig) {
    this.config = config;
  }

  /**
   * Create UDP socket
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    this.socket = createSocket('udp4');
    
    this.socket.on('message', (msg, rinfo) => {
      this.handleMessage(msg, rinfo);
    });

    this.socket.on('error', (error) => {
      console.error('❌ UDP Transport error:', error);
      this.isConnected = false;
    });

    this.socket.on('close', () => {
      console.log('🔌 UDP Transport socket closed');
      this.isConnected = false;
    });

    this.isConnected = true;
    console.log('🔗 UDP Transport connected');
  }

  /**
   * Send message via UDP
   */
  async send(address: H2GNNAddress, message: ProtocolMessage): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('UDP Transport not connected');
    }

    const payload = JSON.stringify({
      address,
      message
    });

    return new Promise((resolve, reject) => {
      this.socket!.send(payload, this.config.port, this.config.host, (error) => {
        if (error) {
          console.error('❌ UDP send error:', error);
          reject(error);
        } else {
          console.log(`📤 UDP sent message: ${message.header.messageId}`);
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
    
    console.log(`📥 UDP subscribed to address: ${addressKey}`);
  }

  /**
   * Unsubscribe from messages for address
   */
  async unsubscribe(address: H2GNNAddress): Promise<void> {
    const addressKey = this.getAddressKey(address);
    this.messageHandlers.delete(addressKey);
    
    console.log(`📤 UDP unsubscribed from address: ${addressKey}`);
  }

  /**
   * Handle incoming UDP messages
   */
  private handleMessage(msg: Buffer, rinfo: any): void {
    try {
      const parsed = JSON.parse(msg.toString());
      
      if (parsed.address && parsed.message) {
        const address = parsed.address as H2GNNAddress;
        const message = parsed.message as ProtocolMessage;
        
        const addressKey = this.getAddressKey(address);
        const handler = this.messageHandlers.get(addressKey);
        
        if (handler) {
          console.log(`📥 UDP received message for ${addressKey}: ${message.header.messageId}`);
          handler(message);
        } else {
          console.warn(`⚠️ No handler found for UDP address: ${addressKey}`);
        }
      } else {
        console.warn('⚠️ Invalid UDP message format');
      }
    } catch (error) {
      console.error('❌ Error parsing UDP message:', error);
    }
  }

  /**
   * Get address key for routing
   */
  private getAddressKey(address: H2GNNAddress): string {
    return `${address.component.type}-${address.component.instance}-${address.component.transport}`;
  }

  /**
   * Close UDP socket
   */
  async close(): Promise<void> {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    console.log('🔌 UDP Transport closed');
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
    host: string;
    port: number;
  } {
    return {
      connected: this.isConnected,
      subscriptions: this.messageHandlers.size,
      host: this.config.host,
      port: this.config.port
    };
  }
}

export class TCPTransport {
  private socket: NetSocket | null = null;
  private config: NetworkTransportConfig;
  private isConnected: boolean = false;
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private messageBuffer: string = '';

  constructor(config: NetworkTransportConfig) {
    this.config = config;
  }

  /**
   * Connect to TCP server
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    return new Promise((resolve, reject) => {
      this.socket = createConnection({
        host: this.config.host,
        port: this.config.port,
        timeout: this.config.timeout || 30000
      });

      this.socket.on('connect', () => {
        console.log('🔗 TCP Transport connected');
        this.isConnected = true;
        resolve();
      });

      this.socket.on('error', (error) => {
        console.error('❌ TCP Transport error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('close', () => {
        console.log('🔌 TCP Transport disconnected');
        this.isConnected = false;
      });

      this.socket.on('data', (data) => {
        this.handleMessage(data);
      });
    });
  }

  /**
   * Send message via TCP
   */
  async send(address: H2GNNAddress, message: ProtocolMessage): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('TCP Transport not connected');
    }

    const payload = JSON.stringify({
      address,
      message
    });

    return new Promise((resolve, reject) => {
      this.socket!.write(payload + '\n', (error) => {
        if (error) {
          console.error('❌ TCP send error:', error);
          reject(error);
        } else {
          console.log(`📤 TCP sent message: ${message.header.messageId}`);
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
    
    console.log(`📥 TCP subscribed to address: ${addressKey}`);
  }

  /**
   * Unsubscribe from messages for address
   */
  async unsubscribe(address: H2GNNAddress): Promise<void> {
    const addressKey = this.getAddressKey(address);
    this.messageHandlers.delete(addressKey);
    
    console.log(`📤 TCP unsubscribed from address: ${addressKey}`);
  }

  /**
   * Handle incoming TCP messages
   */
  private handleMessage(data: Buffer): void {
    this.messageBuffer += data.toString();
    
    // Process complete messages (separated by newlines)
    const lines = this.messageBuffer.split('\n');
    this.messageBuffer = lines.pop() || ''; // Keep incomplete message in buffer
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const parsed = JSON.parse(line);
          
          if (parsed.address && parsed.message) {
            const address = parsed.address as H2GNNAddress;
            const message = parsed.message as ProtocolMessage;
            
            const addressKey = this.getAddressKey(address);
            const handler = this.messageHandlers.get(addressKey);
            
            if (handler) {
              console.log(`📥 TCP received message for ${addressKey}: ${message.header.messageId}`);
              handler(message);
            } else {
              console.warn(`⚠️ No handler found for TCP address: ${addressKey}`);
            }
          } else {
            console.warn('⚠️ Invalid TCP message format');
          }
        } catch (error) {
          console.error('❌ Error parsing TCP message:', error);
        }
      }
    }
  }

  /**
   * Get address key for routing
   */
  private getAddressKey(address: H2GNNAddress): string {
    return `${address.component.type}-${address.component.instance}-${address.component.transport}`;
  }

  /**
   * Close TCP connection
   */
  async close(): Promise<void> {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
    this.isConnected = false;
    console.log('🔌 TCP Transport closed');
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
    host: string;
    port: number;
  } {
    return {
      connected: this.isConnected,
      subscriptions: this.messageHandlers.size,
      host: this.config.host,
      port: this.config.port
    };
  }
}

// Classes are already exported above, no need for additional exports
