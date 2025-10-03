#!/usr/bin/env node

/**
 * Transport Manager
 * 
 * Unified interface for all transport adapters in the Native H²GNN Protocol
 * Manages MQTT, WebSocket, WebRTC, UDP, TCP, and IPC transports
 */

import { MQTTTransport, MQTTTransportConfig } from './mqtt-transport.js';
import { WebSocketTransport, WebSocketTransportConfig } from './websocket-transport.js';
import { WebRTCTransport, WebRTCTransportConfig } from './webrtc-transport.js';
import { UDPTransport, TCPTransport, NetworkTransportConfig } from './network-transport.js';
import { IPCTransport, IPCServer, IPCTransportConfig } from './ipc-transport.js';
import type { H2GNNAddress, ProtocolMessage, MessageHandler } from '../native-protocol.js';

export interface TransportManagerConfig {
  mqtt?: MQTTTransportConfig;
  websocket?: WebSocketTransportConfig;
  webrtc?: WebRTCTransportConfig;
  udp?: NetworkTransportConfig;
  tcp?: NetworkTransportConfig;
  ipc?: IPCTransportConfig;
}

export class TransportManager {
  private mqttTransport?: MQTTTransport;
  private websocketTransport?: WebSocketTransport;
  private webrtcTransport?: WebRTCTransport;
  private udpTransport?: UDPTransport;
  private tcpTransport?: TCPTransport;
  private ipcTransport?: IPCTransport;
  private ipcServer?: IPCServer;
  private config: TransportManagerConfig;
  private isInitialized: boolean = false;

  constructor(config: TransportManagerConfig) {
    this.config = config;
  }

  /**
   * Initialize all configured transports
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Transport Manager...');

    try {
      // Initialize MQTT transport
      if (this.config.mqtt) {
        console.log('📡 Initializing MQTT transport...');
        this.mqttTransport = new MQTTTransport(this.config.mqtt);
        await this.mqttTransport.connect();
      }

      // Initialize WebSocket transport
      if (this.config.websocket) {
        console.log('📡 Initializing WebSocket transport...');
        this.websocketTransport = new WebSocketTransport(this.config.websocket);
        await this.websocketTransport.connect();
      }

      // Initialize WebRTC transport
      if (this.config.webrtc) {
        console.log('📡 Initializing WebRTC transport...');
        this.webrtcTransport = new WebRTCTransport(this.config.webrtc);
        await this.webrtcTransport.createPeerConnection();
      }

      // Initialize UDP transport
      if (this.config.udp) {
        console.log('📡 Initializing UDP transport...');
        this.udpTransport = new UDPTransport(this.config.udp);
        await this.udpTransport.connect();
      }

      // Initialize TCP transport
      if (this.config.tcp) {
        console.log('📡 Initializing TCP transport...');
        this.tcpTransport = new TCPTransport(this.config.tcp);
        await this.tcpTransport.connect();
      }

      // Initialize IPC transport
      if (this.config.ipc) {
        console.log('📡 Initializing IPC transport...');
        this.ipcTransport = new IPCTransport(this.config.ipc);
        await this.ipcTransport.connect();
      }

      this.isInitialized = true;
      console.log('✅ Transport Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Transport Manager:', error);
      throw error;
    }
  }

  /**
   * Send message using appropriate transport
   */
  async sendMessage(address: H2GNNAddress, message: ProtocolMessage): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Transport Manager not initialized');
    }

    const transport = address.network.transport;
    
    switch (transport) {
      case 'mqtt':
        if (this.mqttTransport) {
          await this.mqttTransport.publish(address, message);
        } else {
          throw new Error('MQTT transport not configured');
        }
        break;
        
      case 'websocket':
        if (this.websocketTransport) {
          await this.websocketTransport.send(address, message);
        } else {
          throw new Error('WebSocket transport not configured');
        }
        break;
        
      case 'webrtc':
        if (this.webrtcTransport) {
          await this.webrtcTransport.send(address, message);
        } else {
          throw new Error('WebRTC transport not configured');
        }
        break;
        
      case 'udp':
        if (this.udpTransport) {
          await this.udpTransport.send(address, message);
        } else {
          throw new Error('UDP transport not configured');
        }
        break;
        
      case 'tcp':
        if (this.tcpTransport) {
          await this.tcpTransport.send(address, message);
        } else {
          throw new Error('TCP transport not configured');
        }
        break;
        
      case 'ipc':
        if (this.ipcTransport) {
          await this.ipcTransport.send(address, message);
        } else {
          throw new Error('IPC transport not configured');
        }
        break;
        
      default:
        throw new Error(`Unsupported transport: ${transport}`);
    }
  }

  /**
   * Subscribe to messages using appropriate transport
   */
  async subscribe(address: H2GNNAddress, callback: MessageHandler): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Transport Manager not initialized');
    }

    const transport = address.network.transport;
    
    switch (transport) {
      case 'mqtt':
        if (this.mqttTransport) {
          await this.mqttTransport.subscribe(address, callback);
        } else {
          throw new Error('MQTT transport not configured');
        }
        break;
        
      case 'websocket':
        if (this.websocketTransport) {
          await this.websocketTransport.subscribe(address, callback);
        } else {
          throw new Error('WebSocket transport not configured');
        }
        break;
        
      case 'webrtc':
        if (this.webrtcTransport) {
          await this.webrtcTransport.subscribe(address, callback);
        } else {
          throw new Error('WebRTC transport not configured');
        }
        break;
        
      case 'udp':
        if (this.udpTransport) {
          await this.udpTransport.subscribe(address, callback);
        } else {
          throw new Error('UDP transport not configured');
        }
        break;
        
      case 'tcp':
        if (this.tcpTransport) {
          await this.tcpTransport.subscribe(address, callback);
        } else {
          throw new Error('TCP transport not configured');
        }
        break;
        
      case 'ipc':
        if (this.ipcTransport) {
          await this.ipcTransport.subscribe(address, callback);
        } else {
          throw new Error('IPC transport not configured');
        }
        break;
        
      default:
        throw new Error(`Unsupported transport: ${transport}`);
    }
  }

  /**
   * Unsubscribe from messages using appropriate transport
   */
  async unsubscribe(address: H2GNNAddress): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Transport Manager not initialized');
    }

    const transport = address.network.transport;
    
    switch (transport) {
      case 'mqtt':
        if (this.mqttTransport) {
          await this.mqttTransport.unsubscribe(address);
        }
        break;
        
      case 'websocket':
        if (this.websocketTransport) {
          await this.websocketTransport.unsubscribe(address);
        }
        break;
        
      case 'webrtc':
        if (this.webrtcTransport) {
          await this.webrtcTransport.unsubscribe(address);
        }
        break;
        
      case 'udp':
        if (this.udpTransport) {
          await this.udpTransport.unsubscribe(address);
        }
        break;
        
      case 'tcp':
        if (this.tcpTransport) {
          await this.tcpTransport.unsubscribe(address);
        }
        break;
        
      case 'ipc':
        if (this.ipcTransport) {
          await this.ipcTransport.unsubscribe(address);
        }
        break;
        
      default:
        throw new Error(`Unsupported transport: ${transport}`);
    }
  }

  /**
   * Get transport statistics
   */
  getTransportStats(): {
    mqtt?: any;
    websocket?: any;
    webrtc?: any;
    udp?: any;
    tcp?: any;
    ipc?: any;
  } {
    const stats: any = {};
    
    if (this.mqttTransport) {
      stats.mqtt = this.mqttTransport.getStats();
    }
    
    if (this.websocketTransport) {
      stats.websocket = this.websocketTransport.getStats();
    }
    
    if (this.webrtcTransport) {
      stats.webrtc = this.webrtcTransport.getStats();
    }
    
    if (this.udpTransport) {
      stats.udp = this.udpTransport.getStats();
    }
    
    if (this.tcpTransport) {
      stats.tcp = this.tcpTransport.getStats();
    }
    
    if (this.ipcTransport) {
      stats.ipc = this.ipcTransport.getStats();
    }
    
    return stats;
  }

  /**
   * Check if transport is connected
   */
  isTransportConnected(transport: string): boolean {
    switch (transport) {
      case 'mqtt':
        return this.mqttTransport?.isTransportConnected() || false;
      case 'websocket':
        return this.websocketTransport?.isTransportConnected() || false;
      case 'webrtc':
        return this.webrtcTransport?.isTransportConnected() || false;
      case 'udp':
        return this.udpTransport?.isTransportConnected() || false;
      case 'tcp':
        return this.tcpTransport?.isTransportConnected() || false;
      case 'ipc':
        return this.ipcTransport?.isTransportConnected() || false;
      default:
        return false;
    }
  }

  /**
   * Close all transports
   */
  async close(): Promise<void> {
    console.log('🔌 Closing all transports...');
    
    const closePromises: Promise<void>[] = [];
    
    if (this.mqttTransport) {
      closePromises.push(this.mqttTransport.disconnect());
    }
    
    if (this.websocketTransport) {
      closePromises.push(this.websocketTransport.disconnect());
    }
    
    if (this.webrtcTransport) {
      closePromises.push(this.webrtcTransport.close());
    }
    
    if (this.udpTransport) {
      closePromises.push(this.udpTransport.close());
    }
    
    if (this.tcpTransport) {
      closePromises.push(this.tcpTransport.close());
    }
    
    if (this.ipcTransport) {
      closePromises.push(this.ipcTransport.close());
    }
    
    await Promise.all(closePromises);
    this.isInitialized = false;
    console.log('✅ All transports closed');
  }
}

// Class is already exported above, no need for additional exports
