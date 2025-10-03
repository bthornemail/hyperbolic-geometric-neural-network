#!/usr/bin/env node

/**
 * IPC Transport Adapter
 * 
 * Implements Inter-Process Communication transport for the Native H²GNN Protocol
 * with BIP32 HD addressing and local process communication
 */

import { createConnection, Socket } from 'net';
import { spawn, ChildProcess } from 'child_process';
import type { H2GNNAddress, ProtocolMessage, MessageHandler } from '../native-protocol.js';

export interface IPCTransportConfig {
  socketPath: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export class IPCTransport {
  private socket: Socket | null = null;
  private config: IPCTransportConfig;
  private isConnected: boolean = false;
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private messageBuffer: string = '';

  constructor(config: IPCTransportConfig) {
    this.config = config;
  }

  /**
   * Connect to IPC socket
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    return new Promise((resolve, reject) => {
      this.socket = createConnection(this.config.socketPath);

      this.socket.on('connect', () => {
        console.log('🔗 IPC Transport connected');
        this.isConnected = true;
        resolve();
      });

      this.socket.on('error', (error) => {
        console.error('❌ IPC Transport error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('close', () => {
        console.log('🔌 IPC Transport disconnected');
        this.isConnected = false;
      });

      this.socket.on('data', (data) => {
        this.handleMessage(data);
      });
    });
  }

  /**
   * Send message via IPC
   */
  async send(address: H2GNNAddress, message: ProtocolMessage): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('IPC Transport not connected');
    }

    const payload = JSON.stringify({
      address,
      message
    });

    return new Promise((resolve, reject) => {
      this.socket!.write(payload + '\n', (error) => {
        if (error) {
          console.error('❌ IPC send error:', error);
          reject(error);
        } else {
          console.log(`📤 IPC sent message: ${message.header.messageId}`);
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
    
    console.log(`📥 IPC subscribed to address: ${addressKey}`);
  }

  /**
   * Unsubscribe from messages for address
   */
  async unsubscribe(address: H2GNNAddress): Promise<void> {
    const addressKey = this.getAddressKey(address);
    this.messageHandlers.delete(addressKey);
    
    console.log(`📤 IPC unsubscribed from address: ${addressKey}`);
  }

  /**
   * Handle incoming IPC messages
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
              console.log(`📥 IPC received message for ${addressKey}: ${message.header.messageId}`);
              handler(message);
            } else {
              console.warn(`⚠️ No handler found for IPC address: ${addressKey}`);
            }
          } else {
            console.warn('⚠️ Invalid IPC message format');
          }
        } catch (error) {
          console.error('❌ Error parsing IPC message:', error);
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
   * Close IPC connection
   */
  async close(): Promise<void> {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
    this.isConnected = false;
    console.log('🔌 IPC Transport closed');
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
    socketPath: string;
  } {
    return {
      connected: this.isConnected,
      subscriptions: this.messageHandlers.size,
      socketPath: this.config.socketPath
    };
  }
}

/**
 * IPC Server for handling incoming connections
 */
export class IPCServer {
  private server: any;
  private config: IPCTransportConfig;
  private connections: Map<string, Socket> = new Map();
  private messageHandlers: Map<string, MessageHandler> = new Map();

  constructor(config: IPCTransportConfig) {
    this.config = config;
  }

  /**
   * Start IPC server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const net = require('net');
      
      this.server = net.createServer((socket: Socket) => {
        const connectionId = `${Date.now()}-${Math.random()}`;
        this.connections.set(connectionId, socket);
        
        console.log(`🔗 IPC Server: New connection ${connectionId}`);
        
        socket.on('data', (data) => {
          this.handleMessage(data, connectionId);
        });
        
        socket.on('close', () => {
          console.log(`🔌 IPC Server: Connection ${connectionId} closed`);
          this.connections.delete(connectionId);
        });
        
        socket.on('error', (error) => {
          console.error(`❌ IPC Server: Connection ${connectionId} error:`, error);
          this.connections.delete(connectionId);
        });
      });

      this.server.listen(this.config.socketPath, () => {
        console.log(`🚀 IPC Server listening on ${this.config.socketPath}`);
        resolve();
      });

      this.server.on('error', (error: Error) => {
        console.error('❌ IPC Server error:', error);
        reject(error);
      });
    });
  }

  /**
   * Stop IPC server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('🔌 IPC Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Broadcast message to all connections
   */
  async broadcast(address: H2GNNAddress, message: ProtocolMessage): Promise<void> {
    const payload = JSON.stringify({
      address,
      message
    });

    for (const [connectionId, socket] of this.connections) {
      try {
        socket.write(payload + '\n');
        console.log(`📤 IPC Server broadcast to ${connectionId}: ${message.header.messageId}`);
      } catch (error) {
        console.error(`❌ IPC Server broadcast error to ${connectionId}:`, error);
        this.connections.delete(connectionId);
      }
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: Buffer, connectionId: string): void {
    try {
      const parsed = JSON.parse(data.toString());
      
      if (parsed.address && parsed.message) {
        const address = parsed.address as H2GNNAddress;
        const message = parsed.message as ProtocolMessage;
        
        const addressKey = this.getAddressKey(address);
        const handler = this.messageHandlers.get(addressKey);
        
        if (handler) {
          console.log(`📥 IPC Server received message for ${addressKey}: ${message.header.messageId}`);
          handler(message);
        } else {
          console.warn(`⚠️ No handler found for IPC Server address: ${addressKey}`);
        }
      } else {
        console.warn('⚠️ Invalid IPC Server message format');
      }
    } catch (error) {
      console.error('❌ Error parsing IPC Server message:', error);
    }
  }

  /**
   * Get address key for routing
   */
  private getAddressKey(address: H2GNNAddress): string {
    return `${address.component.type}-${address.component.instance}-${address.component.transport}`;
  }

  /**
   * Subscribe to messages for address
   */
  async subscribe(address: H2GNNAddress, callback: MessageHandler): Promise<void> {
    const addressKey = this.getAddressKey(address);
    this.messageHandlers.set(addressKey, callback);
    
    console.log(`📥 IPC Server subscribed to address: ${addressKey}`);
  }

  /**
   * Get server statistics
   */
  getStats(): {
    connections: number;
    subscriptions: number;
    socketPath: string;
  } {
    return {
      connections: this.connections.size,
      subscriptions: this.messageHandlers.size,
      socketPath: this.config.socketPath
    };
  }
}

// Classes are already exported above, no need for additional exports
