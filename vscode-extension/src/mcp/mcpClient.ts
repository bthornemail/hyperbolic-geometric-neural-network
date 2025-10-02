import * as vscode from 'vscode';
import { WebSocket } from 'ws';

/**
 * MCP Client for connecting to H²GNN PocketFlow MCP Server
 * 
 * Handles communication with the H²GNN MCP server for knowledge graphs,
 * hyperbolic embeddings, and AI operations.
 */
export class MCPClient {
  private context: vscode.ExtensionContext;
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private messageId: number = 0;
  private pendingRequests: Map<number, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Initialize MCP client and connect to server
   */
  async initialize(): Promise<void> {
    console.log('🔌 Initializing MCP Client');
    
    const config = vscode.workspace.getConfiguration('h2gnn');
    const endpoint = config.get<string>('apiEndpoint', 'ws://localhost:3001');
    
    await this.connect(endpoint);
    
    console.log('✅ MCP Client initialized');
  }

  /**
   * Connect to MCP server
   */
  private async connect(endpoint: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Convert HTTP endpoint to WebSocket endpoint
        const wsEndpoint = endpoint.replace(/^https?:/, 'ws:') + '/mcp';
        
        console.log(`🔗 Connecting to MCP server at ${wsEndpoint}`);
        
        this.socket = new WebSocket(wsEndpoint);
        
        this.socket.on('open', () => {
          console.log('✅ Connected to MCP server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });
        
        this.socket.on('message', (data) => {
          this.handleMessage(data.toString());
        });
        
        this.socket.on('close', () => {
          console.log('🔌 Disconnected from MCP server');
          this.isConnected = false;
          this.handleDisconnection();
        });
        
        this.socket.on('error', (error) => {
          console.error('❌ MCP connection error:', error);
          this.isConnected = false;
          
          if (this.reconnectAttempts === 0) {
            reject(new Error(`Failed to connect to MCP server: ${error.message}`));
          }
        });
        
        // Timeout for initial connection
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages from MCP server
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      if (message.id && this.pendingRequests.has(message.id)) {
        const request = this.pendingRequests.get(message.id)!;
        this.pendingRequests.delete(message.id);
        
        if (message.error) {
          request.reject(new Error(message.error.message || 'MCP request failed'));
        } else {
          request.resolve(message.result);
        }
      } else {
        // Handle notifications or other message types
        this.handleNotification(message);
      }
    } catch (error) {
      console.error('❌ Failed to parse MCP message:', error);
    }
  }

  /**
   * Handle notifications from MCP server
   */
  private handleNotification(message: any): void {
    switch (message.method) {
      case 'knowledge_graph_updated':
        this.onKnowledgeGraphUpdated(message.params);
        break;
      case 'analysis_complete':
        this.onAnalysisComplete(message.params);
        break;
      default:
        console.log('📨 Received MCP notification:', message.method);
    }
  }

  /**
   * Handle disconnection and attempt reconnection
   */
  private async handleDisconnection(): Promise<void> {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(async () => {
        try {
          const config = vscode.workspace.getConfiguration('h2gnn');
          const endpoint = config.get<string>('apiEndpoint', 'ws://localhost:3001');
          await this.connect(endpoint);
        } catch (error) {
          console.error('❌ Reconnection failed:', error);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      vscode.window.showErrorMessage(
        'Lost connection to H²GNN MCP server. Please restart the extension.',
        'Restart Extension'
      ).then(selection => {
        if (selection === 'Restart Extension') {
          vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
      });
    }
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(toolName: string, params: any = {}): Promise<any> {
    if (!this.isConnected || !this.socket) {
      throw new Error('Not connected to MCP server');
    }

    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      
      const message = {
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params
        }
      };

      this.pendingRequests.set(id, { resolve, reject });
      
      this.socket!.send(JSON.stringify(message));
      
      // Timeout for requests
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`MCP request timeout for tool: ${toolName}`));
        }
      }, 30000);
    });
  }

  /**
   * List available tools
   */
  async listTools(): Promise<any[]> {
    if (!this.isConnected || !this.socket) {
      throw new Error('Not connected to MCP server');
    }

    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      
      const message = {
        jsonrpc: '2.0',
        id,
        method: 'tools/list',
        params: {}
      };

      this.pendingRequests.set(id, { resolve, reject });
      
      this.socket!.send(JSON.stringify(message));
      
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('MCP request timeout for tools/list'));
        }
      }, 10000);
    });
  }

  /**
   * Get a resource from the MCP server
   */
  async getResource(uri: string): Promise<any> {
    if (!this.isConnected || !this.socket) {
      throw new Error('Not connected to MCP server');
    }

    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      
      const message = {
        jsonrpc: '2.0',
        id,
        method: 'resources/read',
        params: { uri }
      };

      this.pendingRequests.set(id, { resolve, reject });
      
      this.socket!.send(JSON.stringify(message));
      
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`MCP request timeout for resource: ${uri}`));
        }
      }, 15000);
    });
  }

  /**
   * List available resources
   */
  async listResources(): Promise<any[]> {
    if (!this.isConnected || !this.socket) {
      throw new Error('Not connected to MCP server');
    }

    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      
      const message = {
        jsonrpc: '2.0',
        id,
        method: 'resources/list',
        params: {}
      };

      this.pendingRequests.set(id, { resolve, reject });
      
      this.socket!.send(JSON.stringify(message));
      
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('MCP request timeout for resources/list'));
        }
      }, 10000);
    });
  }

  /**
   * Analyze project using knowledge graph
   */
  async analyzeProject(path: string): Promise<any> {
    return await this.callTool('analyze_path_to_knowledge_graph', {
      path,
      recursive: true,
      includeContent: true,
      maxDepth: 10,
      filePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.py'],
      excludePatterns: ['**/node_modules/**', '**/dist/**', '**/.git/**']
    });
  }

  /**
   * Generate code using knowledge graph insights
   */
  async generateCode(params: {
    type: string;
    description: string;
    context?: any;
    constraints?: any;
  }): Promise<any> {
    return await this.callTool('generate_code_from_graph', params);
  }

  /**
   * Generate documentation from knowledge graph
   */
  async generateDocumentation(params: {
    type: string;
    scope: string[];
    format: string;
    options?: any;
  }): Promise<any> {
    return await this.callTool('generate_documentation_from_graph', params);
  }

  /**
   * Query knowledge graph
   */
  async queryKnowledgeGraph(params: {
    query: string;
    type?: string;
    limit?: number;
  }): Promise<any> {
    return await this.callTool('query_knowledge_graph', params);
  }

  /**
   * Get knowledge graph visualization
   */
  async getGraphVisualization(params?: { layout?: string }): Promise<any> {
    return await this.callTool('get_graph_visualization', params || {});
  }

  /**
   * Initialize WordNet processor
   */
  async initializeWordNet(params?: {
    maxSynsets?: number;
    embeddingDim?: number;
  }): Promise<any> {
    return await this.callTool('initialize_wordnet', params || {});
  }

  /**
   * Query WordNet concepts
   */
  async queryWordNet(params: {
    concept: string;
    includeHierarchy?: boolean;
  }): Promise<any> {
    return await this.callTool('query_wordnet', params);
  }

  /**
   * Compute hyperbolic distance between concepts
   */
  async computeHyperbolicDistance(params: {
    concept1: string;
    concept2: string;
  }): Promise<any> {
    return await this.callTool('compute_hyperbolic_distance', params);
  }

  /**
   * Run hierarchical Q&A workflow
   */
  async runHierarchicalQA(params: {
    question: string;
    context?: string[];
  }): Promise<any> {
    return await this.callTool('run_hierarchical_qa', params);
  }

  /**
   * Explore semantic space
   */
  async exploreSemanticSpace(params: {
    startConcept: string;
    depth?: number;
    maxResults?: number;
  }): Promise<any> {
    return await this.callTool('explore_semantic_space', params);
  }

  /**
   * Train concept embeddings
   */
  async trainConceptEmbeddings(params: {
    concepts: string[];
    relationships?: any[];
  }): Promise<any> {
    return await this.callTool('train_concept_embeddings', params);
  }

  /**
   * Analyze hierarchical structure
   */
  async analyzeHierarchy(params: {
    rootConcept: string;
  }): Promise<any> {
    return await this.callTool('analyze_hierarchy', params);
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<any> {
    return await this.getResource('h2gnn://system/status');
  }

  /**
   * Get knowledge graphs list
   */
  async getKnowledgeGraphsList(): Promise<any> {
    return await this.getResource('h2gnn://knowledge-graphs/list');
  }

  /**
   * Get latest knowledge graph
   */
  async getLatestKnowledgeGraph(): Promise<any> {
    return await this.getResource('h2gnn://knowledge-graphs/latest');
  }

  /**
   * Update configuration
   */
  updateConfiguration(config: vscode.WorkspaceConfiguration): void {
    const newEndpoint = config.get<string>('apiEndpoint');
    
    // Reconnect if endpoint changed
    if (newEndpoint && this.isConnected) {
      console.log('🔧 Configuration changed, reconnecting...');
      this.disconnect();
      this.connect(newEndpoint).catch(error => {
        console.error('❌ Failed to reconnect with new configuration:', error);
      });
    }
  }

  /**
   * Event handlers for notifications
   */
  private onKnowledgeGraphUpdated(params: any): void {
    // Notify extension about knowledge graph updates
    vscode.commands.executeCommand('h2gnn.knowledgeGraphUpdated', params);
  }

  private onAnalysisComplete(params: any): void {
    // Notify extension about completed analysis
    vscode.commands.executeCommand('h2gnn.analysisComplete', params);
  }

  /**
   * Check connection status
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection info
   */
  getConnectionInfo(): {
    connected: boolean;
    endpoint: string;
    reconnectAttempts: number;
  } {
    const config = vscode.workspace.getConfiguration('h2gnn');
    return {
      connected: this.isConnected,
      endpoint: config.get<string>('apiEndpoint', 'ws://localhost:3001'),
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Manually disconnect
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  /**
   * Dispose of resources
   */
  async dispose(): Promise<void> {
    console.log('🧹 Disposing MCP Client');
    
    // Cancel all pending requests
    for (const [id, request] of this.pendingRequests) {
      request.reject(new Error('MCP client shutting down'));
    }
    this.pendingRequests.clear();
    
    // Close connection
    this.disconnect();
    
    console.log('✅ MCP Client disposed');
  }
}

/**
 * MCP Error types
 */
export class MCPError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'MCPError';
  }
}

/**
 * MCP Response types
 */
export interface MCPResponse<T = any> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}
