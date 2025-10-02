#!/usr/bin/env tsx

/**
 * Collaborative Visualization
 * 
 * This module provides collaborative visualization capabilities:
 * - Multi-user visualization sessions
 * - Real-time synchronization
 * - Shared viewport control
 * - Collaborative annotation
 * - Session management
 */

import { HyperbolicEmbedding } from './3d-hyperbolic-renderer.js';
import { ConceptNavigator, NavigationState } from './concept-navigator.js';

export interface CollaborationSession {
  id: string;
  name: string;
  participants: CollaborationParticipant[];
  viewport: SharedViewport;
  annotations: CollaborationAnnotation[];
  chat: CollaborationMessage[];
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface CollaborationParticipant {
  id: string;
  name: string;
  role: 'viewer' | 'presenter' | 'moderator';
  cursor: HyperbolicPoint;
  selection: string[];
  isOnline: boolean;
  lastSeen: number;
}

export interface SharedViewport {
  position: HyperbolicPoint;
  target: HyperbolicPoint;
  zoom: number;
  rotation: HyperbolicPoint;
  viewMode: NavigationState['viewMode'];
  lockedBy: string | null;
}

export interface CollaborationAnnotation {
  id: string;
  author: string;
  position: HyperbolicPoint;
  content: string;
  type: 'note' | 'highlight' | 'question' | 'insight';
  color: [number, number, number, number];
  createdAt: number;
  updatedAt: number;
  isVisible: boolean;
}

export interface CollaborationMessage {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  type: 'chat' | 'system' | 'annotation';
  metadata?: Record<string, any>;
}

export interface CollaborationEvent {
  type: 'join' | 'leave' | 'move' | 'select' | 'annotate' | 'chat' | 'viewport_change';
  participant: string;
  data: any;
  timestamp: number;
}

export class CollaborativeVisualization {
  private sessions: Map<string, CollaborationSession> = new Map();
  private activeSessions: Set<string> = new Set();
  private eventHandlers: Map<string, (event: CollaborationEvent) => void> = new Map();
  private conceptNavigator: ConceptNavigator;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncFrequency: number = 1000; // 1 second

  constructor(conceptNavigator: ConceptNavigator) {
    this.conceptNavigator = conceptNavigator;
    this.startSyncProcess();
  }

  /**
   * Create a new collaboration session
   */
  createSession(name: string, creatorId: string, creatorName: string): CollaborationSession {
    const sessionId = this.generateSessionId();
    
    const session: CollaborationSession = {
      id: sessionId,
      name,
      participants: [{
        id: creatorId,
        name: creatorName,
        role: 'moderator',
        cursor: { x: 0, y: 0, z: 0, w: 1 },
        selection: [],
        isOnline: true,
        lastSeen: Date.now()
      }],
      viewport: {
        position: { x: 0, y: 0, z: 0, w: 1 },
        target: { x: 0, y: 0, z: 0, w: 1 },
        zoom: 1.0,
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        viewMode: 'overview',
        lockedBy: null
      },
      annotations: [],
      chat: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true
    };
    
    this.sessions.set(sessionId, session);
    this.activeSessions.add(sessionId);
    
    console.log(`🤝 Created collaboration session: ${name} (${sessionId})`);
    return session;
  }

  /**
   * Join an existing session
   */
  joinSession(sessionId: string, participantId: string, participantName: string, role: 'viewer' | 'presenter' = 'viewer'): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      return false;
    }
    
    // Check if participant already exists
    const existingParticipant = session.participants.find(p => p.id === participantId);
    if (existingParticipant) {
      existingParticipant.isOnline = true;
      existingParticipant.lastSeen = Date.now();
    } else {
      session.participants.push({
        id: participantId,
        name: participantName,
        role,
        cursor: { x: 0, y: 0, z: 0, w: 1 },
        selection: [],
        isOnline: true,
        lastSeen: Date.now()
      });
    }
    
    session.updatedAt = Date.now();
    
    // Emit join event
    this.emitEvent(sessionId, {
      type: 'join',
      participant: participantId,
      data: { participantName, role },
      timestamp: Date.now()
    });
    
    console.log(`👋 ${participantName} joined session ${sessionId}`);
    return true;
  }

  /**
   * Leave a session
   */
  leaveSession(sessionId: string, participantId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    const participant = session.participants.find(p => p.id === participantId);
    if (participant) {
      participant.isOnline = false;
      participant.lastSeen = Date.now();
    }
    
    session.updatedAt = Date.now();
    
    // Emit leave event
    this.emitEvent(sessionId, {
      type: 'leave',
      participant: participantId,
      data: {},
      timestamp: Date.now()
    });
    
    console.log(`👋 Participant ${participantId} left session ${sessionId}`);
    return true;
  }

  /**
   * Update participant cursor position
   */
  updateCursor(sessionId: string, participantId: string, position: HyperbolicPoint): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    const participant = session.participants.find(p => p.id === participantId);
    if (participant) {
      participant.cursor = position;
      participant.lastSeen = Date.now();
    }
    
    // Emit move event
    this.emitEvent(sessionId, {
      type: 'move',
      participant: participantId,
      data: { position },
      timestamp: Date.now()
    });
  }

  /**
   * Update participant selection
   */
  updateSelection(sessionId: string, participantId: string, selection: string[]): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    const participant = session.participants.find(p => p.id === participantId);
    if (participant) {
      participant.selection = selection;
      participant.lastSeen = Date.now();
    }
    
    // Emit select event
    this.emitEvent(sessionId, {
      type: 'select',
      participant: participantId,
      data: { selection },
      timestamp: Date.now()
    });
  }

  /**
   * Add annotation to session
   */
  addAnnotation(
    sessionId: string,
    authorId: string,
    position: HyperbolicPoint,
    content: string,
    type: CollaborationAnnotation['type'] = 'note',
    color: [number, number, number, number] = [1, 1, 0, 0.8]
  ): string {
    const session = this.sessions.get(sessionId);
    if (!session) return '';
    
    const annotation: CollaborationAnnotation = {
      id: this.generateAnnotationId(),
      author: authorId,
      position,
      content,
      type,
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isVisible: true
    };
    
    session.annotations.push(annotation);
    session.updatedAt = Date.now();
    
    // Emit annotation event
    this.emitEvent(sessionId, {
      type: 'annotate',
      participant: authorId,
      data: { annotation },
      timestamp: Date.now()
    });
    
    console.log(`📝 Added annotation by ${authorId} in session ${sessionId}`);
    return annotation.id;
  }

  /**
   * Send chat message
   */
  sendChatMessage(sessionId: string, authorId: string, content: string, type: 'chat' | 'system' = 'chat'): string {
    const session = this.sessions.get(sessionId);
    if (!session) return '';
    
    const message: CollaborationMessage = {
      id: this.generateMessageId(),
      author: authorId,
      content,
      timestamp: Date.now(),
      type
    };
    
    session.chat.push(message);
    session.updatedAt = Date.now();
    
    // Emit chat event
    this.emitEvent(sessionId, {
      type: 'chat',
      participant: authorId,
      data: { message },
      timestamp: Date.now()
    });
    
    console.log(`💬 Chat message from ${authorId} in session ${sessionId}: ${content}`);
    return message.id;
  }

  /**
   * Update shared viewport
   */
  updateViewport(sessionId: string, participantId: string, viewport: Partial<SharedViewport>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    // Check if viewport is locked by another participant
    if (session.viewport.lockedBy && session.viewport.lockedBy !== participantId) {
      return;
    }
    
    // Update viewport
    session.viewport = { ...session.viewport, ...viewport };
    session.updatedAt = Date.now();
    
    // Emit viewport change event
    this.emitEvent(sessionId, {
      type: 'viewport_change',
      participant: participantId,
      data: { viewport: session.viewport },
      timestamp: Date.now()
    });
  }

  /**
   * Lock viewport for a participant
   */
  lockViewport(sessionId: string, participantId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    // Check if participant has permission to lock
    const participant = session.participants.find(p => p.id === participantId);
    if (!participant || (participant.role !== 'moderator' && participant.role !== 'presenter')) {
      return false;
    }
    
    session.viewport.lockedBy = participantId;
    session.updatedAt = Date.now();
    
    console.log(`🔒 Viewport locked by ${participantId} in session ${sessionId}`);
    return true;
  }

  /**
   * Unlock viewport
   */
  unlockViewport(sessionId: string, participantId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    if (session.viewport.lockedBy === participantId) {
      session.viewport.lockedBy = null;
      session.updatedAt = Date.now();
      
      console.log(`🔓 Viewport unlocked by ${participantId} in session ${sessionId}`);
      return true;
    }
    
    return false;
  }

  /**
   * Get session information
   */
  getSession(sessionId: string): CollaborationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }

  /**
   * Get session participants
   */
  getSessionParticipants(sessionId: string): CollaborationParticipant[] {
    const session = this.sessions.get(sessionId);
    return session ? session.participants : [];
  }

  /**
   * Get session annotations
   */
  getSessionAnnotations(sessionId: string): CollaborationAnnotation[] {
    const session = this.sessions.get(sessionId);
    return session ? session.annotations : [];
  }

  /**
   * Get session chat
   */
  getSessionChat(sessionId: string): CollaborationMessage[] {
    const session = this.sessions.get(sessionId);
    return session ? session.chat : [];
  }

  /**
   * Register event handler
   */
  onEvent(sessionId: string, handler: (event: CollaborationEvent) => void): void {
    this.eventHandlers.set(sessionId, handler);
  }

  /**
   * Emit event to handlers
   */
  private emitEvent(sessionId: string, event: CollaborationEvent): void {
    const handler = this.eventHandlers.get(sessionId);
    if (handler) {
      handler(event);
    }
  }

  /**
   * Start synchronization process
   */
  private startSyncProcess(): void {
    this.syncInterval = setInterval(() => {
      this.syncSessions();
    }, this.syncFrequency);
  }

  /**
   * Synchronize sessions
   */
  private syncSessions(): void {
    const now = Date.now();
    const timeout = 30000; // 30 seconds
    
    for (const session of this.sessions.values()) {
      if (!session.isActive) continue;
      
      // Check for offline participants
      for (const participant of session.participants) {
        if (participant.isOnline && (now - participant.lastSeen) > timeout) {
          participant.isOnline = false;
          console.log(`⏰ Participant ${participant.id} timed out in session ${session.id}`);
        }
      }
      
      // Update session timestamp
      session.updatedAt = now;
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate annotation ID
   */
  private generateAnnotationId(): string {
    return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate message ID
   */
  private generateMessageId(): string {
    return `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown collaborative visualization
   */
  shutdown(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    // Mark all sessions as inactive
    for (const session of this.sessions.values()) {
      session.isActive = false;
    }
    
    console.log('🔧 Collaborative visualization shutdown complete');
  }
}
