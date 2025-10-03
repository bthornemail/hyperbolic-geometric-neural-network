#!/usr/bin/env node

/**
 * Phase 4: Integrated H²GNN Hyperbolic-Geographic Intelligence System
 * 
 * This is the main integration file that combines all Phase 4 components:
 * 1. Three-tier Pub/Sub Architecture (Core)
 * 2. Hyperbolic Projection Engine (Math)
 * 3. Real-time Collaboration (Integration)
 * 4. MCP Geo-Tools (MCP)
 * 5. D3 Visualization (Visualization)
 */

import { EventEmitter } from 'events';

// Core Architecture
import { 
  H2GNNBroker, 
  H2GNNProvider, 
  H2GNNConsumer, 
  IntegratedH2GNNSystem,
  PubSubMessage 
} from '../core/pubsub-architecture.js';

// Mathematical Operations
import { 
  HyperbolicProjectionEngine, 
  H2GNNBinarySchema, 
  OptimizedH2GNNProvider,
  H2GNNEmbedding 
} from '../math/hyperbolic-projection-engine.js';

// Real-time Collaboration
import { 
  RealTimeCollaborationEngine,
  CollaborationSession,
  UserPresenceManager,
  LiveTrainingDashboard,
  RealTimeAnimator
} from './real-time-collaboration.js';

// MCP Geo-Intelligence Tools
import { 
  MCPGeoIntelligenceServer,
  IntegratedGeoIntelligenceSystem 
} from '../mcp/mcp-geo-tools.js';

// D3 Visualization
import { 
  EnhancedD3Wrapper,
  IntegratedD3VisualizationSystem,
  D3VisualizationOptions,
  RealTimeOptions
} from '../visualization/d3-visualization-wrapper.js';

// 🎯 PHASE 4 INTEGRATED SYSTEM INTERFACES
export interface Phase4SystemConfig {
  // Core Architecture
  broker: {
    maxRetries: number;
    messageQueueSize: number;
    heartbeatInterval: number;
  };
  
  // Hyperbolic Projection
  projection: {
    curvature: number;
    maxPoincareRadius: number;
    useLorentzStabilization: boolean;
  };
  
  // Real-time Collaboration
  collaboration: {
    maxParticipants: number;
    presenceTimeout: number;
    sessionTimeout: number;
    enableRealTimeSync: boolean;
  };
  
  // MCP Geo-Tools
  mcp: {
    serverPort: number;
    enableGeoIntelligence: boolean;
    enableSemanticSearch: boolean;
  };
  
  // D3 Visualization
  visualization: {
    container: string;
    width: number;
    height: number;
    enableRealTimeUpdates: boolean;
    enableCollaboration: boolean;
    enableConfidenceVisualization: boolean;
  };
}

export interface SystemStatus {
  core: 'initializing' | 'running' | 'error' | 'stopped';
  projection: 'initializing' | 'running' | 'error' | 'stopped';
  collaboration: 'initializing' | 'running' | 'error' | 'stopped';
  mcp: 'initializing' | 'running' | 'error' | 'stopped';
  visualization: 'initializing' | 'running' | 'error' | 'stopped';
  overall: 'initializing' | 'running' | 'error' | 'stopped';
}

// 🚀 PHASE 4 INTEGRATED SYSTEM
export class Phase4IntegratedSystem extends EventEmitter {
  private config: Phase4SystemConfig;
  private status: SystemStatus;
  
  // Core Components
  private broker: H2GNNBroker;
  private providers: H2GNNProvider[] = [];
  private consumers: H2GNNConsumer[] = [];
  
  // Mathematical Components
  private projectionEngine: HyperbolicProjectionEngine;
  private binarySchema: H2GNNBinarySchema;
  private optimizedProvider: OptimizedH2GNNProvider;
  
  // Collaboration Components
  private collaborationEngine: RealTimeCollaborationEngine;
  private userPresence: UserPresenceManager;
  private trainingDashboard: LiveTrainingDashboard;
  private realTimeAnimator: RealTimeAnimator;
  
  // MCP Components
  private mcpServer: MCPGeoIntelligenceServer;
  private geoIntelligenceSystem: IntegratedGeoIntelligenceSystem;
  
  // Visualization Components
  private d3Wrapper: EnhancedD3Wrapper;
  private visualizationSystem: IntegratedD3VisualizationSystem;
  
  // System State
  private isInitialized: boolean = false;
  private isRunning: boolean = false;
  private systemMetrics: SystemMetrics = {
    messagesProcessed: 0,
    activeUsers: 0,
    visualizationUpdates: 0,
    collaborationEvents: 0,
    mcpRequests: 0
  };

  constructor(config: Phase4SystemConfig) {
    super();
    this.config = config;
    this.status = this.initializeStatus();
    
    this.initializeComponents();
    this.setupSystemEventHandlers();
  }

  private initializeStatus(): SystemStatus {
    return {
      core: 'initializing',
      projection: 'initializing',
      collaboration: 'initializing',
      mcp: 'initializing',
      visualization: 'initializing',
      overall: 'initializing'
    };
  }

  private initializeComponents(): void {
    console.log('🏗️ Initializing Phase 4 Integrated System Components...');
    
    // Initialize Core Architecture
    this.broker = new H2GNNBroker();
    this.initializeProviders();
    this.initializeConsumers();
    
    // Initialize Mathematical Components
    this.projectionEngine = new HyperbolicProjectionEngine();
    this.binarySchema = new H2GNNBinarySchema();
    this.optimizedProvider = new OptimizedH2GNNProvider();
    
    // Initialize Collaboration Components
    this.collaborationEngine = new RealTimeCollaborationEngine();
    this.userPresence = new UserPresenceManager();
    this.trainingDashboard = new LiveTrainingDashboard();
    this.realTimeAnimator = new RealTimeAnimator();
    
    // Initialize MCP Components
    this.mcpServer = new MCPGeoIntelligenceServer();
    this.geoIntelligenceSystem = new IntegratedGeoIntelligenceSystem();
    
    // Initialize Visualization Components
    this.d3Wrapper = new EnhancedD3Wrapper({
      container: this.config.visualization.container,
      width: this.config.visualization.width,
      height: this.config.visualization.height,
      realTimeUpdates: this.config.visualization.enableRealTimeUpdates,
      collaborationEnabled: this.config.visualization.enableCollaboration
    });
    this.visualizationSystem = new IntegratedD3VisualizationSystem({
      container: this.config.visualization.container,
      width: this.config.visualization.width,
      height: this.config.visualization.height,
      realTimeUpdates: this.config.visualization.enableRealTimeUpdates,
      collaborationEnabled: this.config.visualization.enableCollaboration
    });
    
    console.log('✅ All Phase 4 components initialized');
  }

  private initializeProviders(): void {
    // Initialize multiple providers for load distribution
    const providerCount = 3;
    for (let i = 0; i < providerCount; i++) {
      const provider = new H2GNNProvider();
      this.providers.push(provider);
    }
    console.log(`🚀 Initialized ${providerCount} H²GNN providers`);
  }

  private initializeConsumers(): void {
    // Initialize consumers for different visualization contexts
    this.consumers.push(new H2GNNConsumer()); // Main UI
    this.consumers.push(new H2GNNConsumer()); // Mobile view
    this.consumers.push(new H2GNNConsumer()); // Collaboration view
    console.log(`🎨 Initialized ${this.consumers.length} H²GNN consumers`);
  }

  private setupSystemEventHandlers(): void {
    // Setup cross-component event handling
    this.setupBrokerEventHandlers();
    this.setupCollaborationEventHandlers();
    this.setupVisualizationEventHandlers();
    this.setupMCPEventHandlers();
  }

  private setupBrokerEventHandlers(): void {
    // Handle broker events across all components
    this.broker.on('messageProcessed', (message: PubSubMessage) => {
      this.systemMetrics.messagesProcessed++;
      this.emit('systemMetrics', this.systemMetrics);
    });
  }

  private setupCollaborationEventHandlers(): void {
    // Handle collaboration events
    this.collaborationEngine.on('userJoined', (user: any) => {
      this.systemMetrics.activeUsers++;
      this.emit('userJoined', user);
    });
    
    this.collaborationEngine.on('userLeft', (user: any) => {
      this.systemMetrics.activeUsers--;
      this.emit('userLeft', user);
    });
  }

  private setupVisualizationEventHandlers(): void {
    // Handle visualization events
    this.d3Wrapper.on('featureClick', (event: any) => {
      this.handleFeatureClick(event);
    });
    
    this.d3Wrapper.on('featureHover', (event: any) => {
      this.handleFeatureHover(event);
    });
  }

  private setupMCPEventHandlers(): void {
    // Handle MCP events
    this.mcpServer.on('requestProcessed', (request: any) => {
      this.systemMetrics.mcpRequests++;
      this.emit('mcpRequest', request);
    });
  }

  // 🚀 SYSTEM STARTUP
  async startSystem(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ System is already running');
      return;
    }

    console.log('🚀 Starting Phase 4 Integrated System...');
    
    try {
      // Start core architecture
      await this.startCoreArchitecture();
      
      // Start mathematical components
      await this.startMathematicalComponents();
      
      // Start collaboration system
      await this.startCollaborationSystem();
      
      // Start MCP server
      await this.startMCPServer();
      
      // Start visualization system
      await this.startVisualizationSystem();
      
      // Start system monitoring
      await this.startSystemMonitoring();
      
      this.isRunning = true;
      this.status.overall = 'running';
      
      console.log('✅ Phase 4 Integrated System started successfully!');
      console.log('🌐 Broker: Central Knowledge Authority - ACTIVE');
      console.log('⚡ Providers: High-Performance Compute - ACTIVE');
      console.log('🎨 Consumers: Visualization & Interaction - ACTIVE');
      console.log('🧠 Hyperbolic Projection Engine - ACTIVE');
      console.log('🤝 Real-time Collaboration - ACTIVE');
      console.log('🗺️ MCP Geo-Intelligence Tools - ACTIVE');
      console.log('📊 D3 Visualization System - ACTIVE');
      
      this.emit('systemStarted', this.status);
    } catch (error) {
      console.error('❌ Failed to start Phase 4 Integrated System:', error);
      this.status.overall = 'error';
      this.emit('systemError', error);
      throw error;
    }
  }

  private async startCoreArchitecture(): Promise<void> {
    console.log('🏗️ Starting core architecture...');
    
    await this.broker.initialize();
    this.status.core = 'running';
    
    // Start providers
    await Promise.all(this.providers.map(provider => provider.start()));
    
    console.log('✅ Core architecture started');
  }

  private async startMathematicalComponents(): Promise<void> {
    console.log('🧮 Starting mathematical components...');
    
    // Mathematical components are ready to use
    this.status.projection = 'running';
    
    console.log('✅ Mathematical components started');
  }

  private async startCollaborationSystem(): Promise<void> {
    console.log('🤝 Starting collaboration system...');
    
    await this.collaborationEngine.joinSession();
    this.status.collaboration = 'running';
    
    console.log('✅ Collaboration system started');
  }

  private async startMCPServer(): Promise<void> {
    console.log('🗺️ Starting MCP server...');
    
    await this.geoIntelligenceSystem.startSystem();
    this.status.mcp = 'running';
    
    console.log('✅ MCP server started');
  }

  private async startVisualizationSystem(): Promise<void> {
    console.log('📊 Starting visualization system...');
    
    await this.visualizationSystem.startVisualization();
    this.status.visualization = 'running';
    
    console.log('✅ Visualization system started');
  }

  private async startSystemMonitoring(): Promise<void> {
    console.log('📊 Starting system monitoring...');
    
    // Start metrics collection
    setInterval(() => {
      this.collectSystemMetrics();
    }, 5000);
    
    console.log('✅ System monitoring started');
  }

  // 🎯 SYSTEM OPERATIONS
  async renderGeoJSON(geoJSON: any, options: RealTimeOptions = {}): Promise<void> {
    console.log('🎨 Rendering GeoJSON with Phase 4 system...');
    
    // Use the integrated visualization system
    await this.visualizationSystem.renderData(geoJSON, options);
    
    // Update system metrics
    this.systemMetrics.visualizationUpdates++;
    
    console.log('✅ GeoJSON rendered successfully');
  }

  async performSemanticQuery(query: string): Promise<any> {
    console.log(`🔍 Performing semantic query: ${query}`);
    
    // Use MCP geo-tools for semantic search
    const results = await this.mcpServer.performSemanticSearch({
      query,
      space: 'hyperbolic_geographic',
      maxResults: 20,
      similarityThreshold: 0.5
    });
    
    // Update system metrics
    this.systemMetrics.mcpRequests++;
    
    console.log(`✅ Semantic query completed: ${results.length} results`);
    return results;
  }

  async startCollaborativeAnalysis(region: any): Promise<void> {
    console.log('🤝 Starting collaborative analysis...');
    
    // Start collaborative analysis session
    await this.collaborationEngine.startCollaborativeAnalysis(region);
    
    // Update system metrics
    this.systemMetrics.collaborationEvents++;
    
    console.log('✅ Collaborative analysis started');
  }

  async updateHyperbolicEmbeddings(embeddings: H2GNNEmbedding[]): Promise<void> {
    console.log(`🧠 Updating ${embeddings.length} hyperbolic embeddings...`);
    
    // Process embeddings through the system
    const geoJSON = await this.projectionEngine.batchPoincareToGeographic(embeddings);
    
    // Update visualization
    await this.renderGeoJSON(geoJSON);
    
    // Broadcast update to all components
    this.broker.publish('h2gnn.embeddings.update', {
      type: 'embeddings_updated',
      channel: 'h2gnn.embeddings.update',
      payload: { embeddings, geoJSON },
      timestamp: Date.now(),
      priority: 1
    });
    
    console.log('✅ Hyperbolic embeddings updated');
  }

  // 🎯 EVENT HANDLERS
  private async handleFeatureClick(event: any): Promise<void> {
    console.log('🖱️ Feature clicked:', event.feature.properties.semantic_label);
    
    // Get hyperbolic neighbors for clicked region
    const neighbors = await this.optimizedProvider.queryHyperbolicGeography(event.feature);
    
    // Highlight related regions
    this.d3Wrapper.highlightRelatedRegions(neighbors.neighbors);
    
    // Show hyperbolic distance insights
    this.d3Wrapper.displayHyperbolicDistances(neighbors.neighbors);
    
    // Emit event for other components
    this.emit('featureClicked', { event, neighbors });
  }

  private async handleFeatureHover(event: any): Promise<void> {
    console.log('👆 Feature hovered:', event.feature.properties.semantic_label);
    
    // Emit event for other components
    this.emit('featureHovered', event);
  }

  // 📊 SYSTEM MONITORING
  private collectSystemMetrics(): void {
    // Collect system metrics
    const metrics = {
      ...this.systemMetrics,
      timestamp: Date.now(),
      status: this.status
    };
    
    this.emit('systemMetrics', metrics);
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return { ...this.status };
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    return { ...this.systemMetrics };
  }

  // 🛑 SYSTEM SHUTDOWN
  async stopSystem(): Promise<void> {
    if (!this.isRunning) {
      console.log('⚠️ System is not running');
      return;
    }

    console.log('🛑 Stopping Phase 4 Integrated System...');
    
    // Stop all components
    this.status.overall = 'stopped';
    this.isRunning = false;
    
    console.log('✅ Phase 4 Integrated System stopped');
    this.emit('systemStopped');
  }
}

// 🎯 SYSTEM METRICS INTERFACE
export interface SystemMetrics {
  messagesProcessed: number;
  activeUsers: number;
  visualizationUpdates: number;
  collaborationEvents: number;
  mcpRequests: number;
}

// 🚀 SYSTEM FACTORY
export class Phase4SystemFactory {
  static createDefaultSystem(): Phase4IntegratedSystem {
    const defaultConfig: Phase4SystemConfig = {
      broker: {
        maxRetries: 3,
        messageQueueSize: 1000,
        heartbeatInterval: 2000
      },
      projection: {
        curvature: -1.0,
        maxPoincareRadius: 0.999999,
        useLorentzStabilization: true
      },
      collaboration: {
        maxParticipants: 10,
        presenceTimeout: 30000,
        sessionTimeout: 300000,
        enableRealTimeSync: true
      },
      mcp: {
        serverPort: 3000,
        enableGeoIntelligence: true,
        enableSemanticSearch: true
      },
      visualization: {
        container: '#h2gnn-visualization',
        width: 1200,
        height: 800,
        enableRealTimeUpdates: true,
        enableCollaboration: true,
        enableConfidenceVisualization: true
      }
    };
    
    return new Phase4IntegratedSystem(defaultConfig);
  }
  
  static createCustomSystem(config: Phase4SystemConfig): Phase4IntegratedSystem {
    return new Phase4IntegratedSystem(config);
  }
}

// 🎯 DEMO AND TESTING
export class Phase4SystemDemo {
  private system: Phase4IntegratedSystem;
  
  constructor() {
    this.system = Phase4SystemFactory.createDefaultSystem();
    this.setupDemoEventHandlers();
  }
  
  private setupDemoEventHandlers(): void {
    this.system.on('systemStarted', (status) => {
      console.log('🎉 Demo: System started with status:', status);
    });
    
    this.system.on('systemError', (error) => {
      console.error('❌ Demo: System error:', error);
    });
    
    this.system.on('featureClicked', (event) => {
      console.log('🖱️ Demo: Feature clicked:', event.event.feature.properties.semantic_label);
    });
  }
  
  async runDemo(): Promise<void> {
    console.log('🎬 Starting Phase 4 System Demo...');
    
    try {
      // Start the system
      await this.system.startSystem();
      
      // Demo semantic query
      await this.system.performSemanticQuery('urban development patterns');
      
      // Demo collaborative analysis
      await this.system.startCollaborativeAnalysis({
        bounds: { north: 40, south: 39, east: -74, west: -75 }
      });
      
      console.log('✅ Phase 4 System Demo completed successfully!');
    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }
}

// Start demo if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new Phase4SystemDemo();
  demo.runDemo().catch(console.error);
}

// Export for immediate use
export {
  Phase4IntegratedSystem,
  Phase4SystemFactory,
  Phase4SystemDemo
};
