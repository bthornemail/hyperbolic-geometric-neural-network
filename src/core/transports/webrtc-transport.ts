#!/usr/bin/env node

/**
 * WebRTC Transport Adapter
 * 
 * Implements WebRTC transport for the Native H²GNN Protocol
 * with BIP32 HD addressing and peer-to-peer communication
 * Note: This is a Node.js implementation using node-webrtc or similar
 */

import type { H2GNNAddress, ProtocolMessage, MessageHandler } from '../native-protocol.js';

export interface WebRTCTransportConfig {
  turn: {
    server: string;
    username: string;
    credential: string;
  };
  stun?: {
    server: string;
    port: number;
  };
  iceServers?: RTCIceServer[];
  connectionTimeout?: number;
  maxRetries?: number;
}

export interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export class WebRTCTransport {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private config: WebRTCTransportConfig;
  private isConnected: boolean = false;
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private connectionAttempts: number = 0;

  constructor(config: WebRTCTransportConfig) {
    this.config = config;
  }

  /**
   * Create peer connection with TURN/STUN servers
   */
  async createPeerConnection(): Promise<RTCPeerConnection> {
    const iceServers: RTCIceServer[] = [
      {
        urls: `turn:${this.config.turn.server}`,
        username: this.config.turn.username,
        credential: this.config.turn.credential
      }
    ];

    if (this.config.stun) {
      iceServers.push({
        urls: `stun:${this.config.stun.server}:${this.config.stun.port}`
      });
    }

    if (this.config.iceServers) {
      iceServers.push(...this.config.iceServers);
    }

    const configuration: RTCConfiguration = {
      iceServers,
      iceCandidatePoolSize: 10
    };

    this.peerConnection = new RTCPeerConnection(configuration);
    
    // Set up event handlers
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.warn('🧊 WebRTC ICE candidate:', event.candidate);
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.warn('🔗 WebRTC ICE connection state:', this.peerConnection?.iceConnectionState);
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.warn('🔗 WebRTC connection state:', this.peerConnection?.connectionState);
      this.isConnected = this.peerConnection?.connectionState === 'connected';
    };

    return this.peerConnection;
  }

  /**
   * Create data channel for communication
   */
  async createDataChannel(channelName: string = 'h2gnn-data'): Promise<RTCDataChannel> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not created');
    }

    this.dataChannel = this.peerConnection.createDataChannel(channelName, {
      ordered: true,
      maxRetransmits: 3
    });

    this.dataChannel.onopen = () => {
      console.warn('📡 WebRTC data channel opened');
    };

    this.dataChannel.onclose = () => {
      console.warn('📡 WebRTC data channel closed');
    };

    this.dataChannel.onerror = (error) => {
      console.error('❌ WebRTC data channel error:', error);
    };

    this.dataChannel.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    return this.dataChannel;
  }

  /**
   * Establish connection with remote peer
   */
  async establishConnection(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not created');
    }

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return answer;
  }

  /**
   * Send message via WebRTC data channel
   */
  async send(address: H2GNNAddress, message: ProtocolMessage): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('WebRTC data channel not open');
    }

    const payload = JSON.stringify({
      address,
      message
    });

    this.dataChannel.send(payload);
    console.warn(`📤 WebRTC sent message: ${message.header.messageId}`);
  }

  /**
   * Subscribe to messages for address
   */
  async subscribe(address: H2GNNAddress, callback: MessageHandler): Promise<void> {
    const addressKey = this.getAddressKey(address);
    this.messageHandlers.set(addressKey, callback);
    
    console.warn(`📥 WebRTC subscribed to address: ${addressKey}`);
  }

  /**
   * Unsubscribe from messages for address
   */
  async unsubscribe(address: H2GNNAddress): Promise<void> {
    const addressKey = this.getAddressKey(address);
    this.messageHandlers.delete(addressKey);
    
    console.warn(`📤 WebRTC unsubscribed from address: ${addressKey}`);
  }

  /**
   * Handle incoming WebRTC messages
   */
  private handleMessage(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.address && parsed.message) {
        const address = parsed.address as H2GNNAddress;
        const message = parsed.message as ProtocolMessage;
        
        const addressKey = this.getAddressKey(address);
        const handler = this.messageHandlers.get(addressKey);
        
        if (handler) {
          console.warn(`📥 WebRTC received message for ${addressKey}: ${message.header.messageId}`);
          handler(message);
        } else {
          console.warn(`⚠️ No handler found for WebRTC address: ${addressKey}`);
        }
      } else {
        console.warn('⚠️ Invalid WebRTC message format');
      }
    } catch (error) {
      console.error('❌ Error parsing WebRTC message:', error);
    }
  }

  /**
   * Get address key for routing
   */
  private getAddressKey(address: H2GNNAddress): string {
    return `${address.component.type}-${address.component.instance}-${address.component.transport}`;
  }

  /**
   * Close WebRTC connection
   */
  async close(): Promise<void> {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.isConnected = false;
    console.warn('🔌 WebRTC Transport closed');
  }

  /**
   * Get connection status
   */
  isTransportConnected(): boolean {
    return this.isConnected && this.dataChannel?.readyState === 'open';
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
    turnServer: string;
    connectionState?: string;
    iceConnectionState?: string;
  } {
    return {
      connected: this.isConnected,
      subscriptions: this.messageHandlers.size,
      turnServer: this.config.turn.server,
      connectionState: this.peerConnection?.connectionState,
      iceConnectionState: this.peerConnection?.iceConnectionState
    };
  }
}

// Class is already exported above, no need for additional exports
