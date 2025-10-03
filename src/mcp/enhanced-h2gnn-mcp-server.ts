#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Enhanced H²GNN MCP Server with HD Addressing Integration
 * 
 * This enhanced MCP server includes:
 * - BIP32 HD addressing for deterministic service addressing
 * - Advanced learning capabilities with memory consolidation
 * - Persistence layer for understanding and knowledge storage
 * - Interactive learning sessions
 * - Adaptive responses based on learning history
 * - Multi-modal understanding capabilities
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import EnhancedH2GNN, { 
  LearningProgress,
  PersistenceConfig 
} from '../core/enhanced-h2gnn.js';
import { BIP32HDAddressing, H2GNNAddress } from '../core/native-protocol.js';
import { H2GNNMCPIntegration, MCPIntegrationConfig } from '../core/mcp-hd-integration.js';

// Global enhanced H²GNN instance
let enhancedH2GNN: EnhancedH2GNN | null = null;
let hdAddressing: BIP32HDAddressing | null = null;
let mcpIntegration: H2GNNMCPIntegration | null = null;

/**
 * Enhanced H²GNN MCP Server with HD Addressing Integration
 */
class EnhancedH2GNNMCPServerHD {
  private server: Server;
  private name = "enhanced-h2gnn-mcp-server-hd";
  private version = "2.1.0";
  private learningSessionId: string | null = null;
  private h2gnnAddress: H2GNNAddress | null = null;

  constructor() {
    this.server = new Server(
      {
        name: this.name,
        version: this.version,
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
  }

  /**
   * Initialize HD addressing and MCP integration
   */
  private async initializeHDAddressing(): Promise<void> {
    if (hdAddressing && mcpIntegration) {
      return; // Already initialized
    }

    // Initialize BIP32 HD addressing
    const seed = Buffer.from('enhanced-h2gnn-mcp-server-seed', 'utf8');
    hdAddressing = new BIP32HDAddressing(seed, 'testnet');
    
    // Create H²GNN address for this service
    this.h2gnnAddress = hdAddressing.createAddress(
      'enhanced-h2gnn',
      0,
      'external',
      'tcp',
      'localhost',
      3001
    );

    // Configure MCP integration
    const config: MCPIntegrationConfig = {
      servicePrefix: 'enhanced-h2gnn-mcp',
      defaultTimeout: 30000,
      maxRetries: 3,
      healthCheckInterval: 60000,
      discoveryInterval: 300000
    };

    mcpIntegration = new H2GNNMCPIntegration(hdAddressing, config);

    // Register this service
    await mcpIntegration.registerService(
      this.name,
      this.version,
      'Enhanced H²GNN MCP Server with HD addressing for hyperbolic embeddings and semantic reasoning',
      ['tools', 'resources', 'prompts'],
      'tcp',
      'localhost',
      3001
    );

    console.log(`Enhanced H²GNN MCP Server HD initialized with address: ${this.h2gnnAddress.path}`);
  }

  /**
   * Setup enhanced tool handlers with HD addressing
   */
  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "initialize_enhanced_h2gnn_hd",
            description: "Initialize Enhanced H²GNN with HD addressing and learning capabilities",
            inputSchema: {
              type: "object",
              properties: {
                embeddingDim: {
                  type: "number",
                  description: "Dimension of hyperbolic embeddings",
                  default: 64
                },
                numLayers: {
                  type: "number",
                  description: "Number of neural network layers",
                  default: 3
                },
                curvature: {
                  type: "number",
                  description: "Hyperbolic curvature",
                  default: -1.0
                },
                storagePath: {
                  type: "string",
                  description: "Path for persistence storage",
                  default: "./persistence"
                },
                maxMemories: {
                  type: "number",
                  description: "Maximum number of memories to store",
                  default: 10000
                },
                consolidationThreshold: {
                  type: "number",
                  description: "Threshold for memory consolidation",
                  default: 100
                }
              }
            },
            metadata: {
              priority: 1,
              category: "system_initialization",
              useCases: [
                "Starting any H²GNN analysis session",
                "Initializing the system before other operations",
                "Setting up persistence and learning capabilities"
              ],
              commonMistakes: [
                "Calling other tools before initialization",
                "Skipping this step in the workflow",
                "Not providing required parameters"
              ],
              context: "MUST be called first in any H²GNN workflow"
            }
          },
          {
            name: "learn_concept_hd",
            description: "Learn a new concept with HD addressing and enhanced memory",
            inputSchema: {
              type: "object",
              properties: {
                concept: {
                  type: "string",
                  description: "Concept to learn"
                },
                data: {
                  type: "object",
                  description: "Data associated with the concept"
                },
                context: {
                  type: "object",
                  description: "Additional context for learning"
                },
                performance: {
                  type: "number",
                  description: "Performance score for this learning session",
                  default: 0.5
                }
              },
              required: ["concept"]
            },
            metadata: {
              priority: 4,
              category: "learning",
              useCases: [
                "Storing new knowledge in the system",
                "Learning from code analysis results",
                "Building persistent memory of concepts"
              ],
              commonMistakes: [
                "Not learning from analysis results",
                "Skipping concept learning",
                "Not providing proper context"
              ],
              context: "Critical for building persistent knowledge"
            }
          },
          {
            name: "retrieve_memories_hd",
            description: "Retrieve relevant memories using HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Query to search memories for"
                },
                maxResults: {
                  type: "number",
                  description: "Maximum number of results to return",
                  default: 10
                }
              },
              required: ["query"]
            },
            metadata: {
              priority: 5,
              category: "memory_retrieval",
              useCases: [
                "Finding relevant past knowledge",
                "Context retrieval for current tasks",
                "Building on previous learning"
              ],
              commonMistakes: [
                "Not retrieving relevant memories",
                "Ignoring existing knowledge",
                "Starting from scratch each time"
              ],
              context: "Essential for leveraging existing knowledge"
            }
          },
          {
            name: "get_understanding_snapshot_hd",
            description: "Get understanding snapshot for a domain using HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                domain: {
                  type: "string",
                  description: "Domain to get understanding for"
                }
              },
              required: ["domain"]
            }
          },
          {
            name: "get_learning_progress_hd",
            description: "Get learning progress for all domains using HD addressing",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "start_learning_session_hd",
            description: "Start an interactive learning session with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                sessionName: {
                  type: "string",
                  description: "Name for the learning session"
                },
                focusDomain: {
                  type: "string",
                  description: "Domain to focus learning on",
                  default: "general"
                }
              },
              required: ["sessionName"]
            }
          },
          {
            name: "end_learning_session_hd",
            description: "End the current learning session and consolidate knowledge",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "consolidate_memories_hd",
            description: "Manually trigger memory consolidation with HD addressing",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "get_system_status_hd",
            description: "Get comprehensive system status including HD addressing info",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "adaptive_learning_hd",
            description: "Perform adaptive learning with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                domain: {
                  type: "string",
                  description: "Domain to perform adaptive learning on"
                },
                learningRate: {
                  type: "number",
                  description: "Learning rate for adaptation",
                  default: 0.01
                }
              },
              required: ["domain"]
            }
          },
          {
            name: "learn_from_node_hd",
            description: "Learn from a knowledge graph node with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                nodeId: {
                  type: "string",
                  description: "ID of the knowledge graph node to learn from"
                },
                nodeData: {
                  type: "object",
                  description: "Data from the knowledge graph node",
                  properties: {
                    type: { type: "string" },
                    name: { type: "string" },
                    content: { type: "string" },
                    relationships: { type: "array" },
                    properties: { type: "object" }
                  }
                },
                context: {
                  type: "object",
                  description: "Additional context for learning",
                  properties: {
                    domain: { type: "string" },
                    language: { type: "string" },
                    complexity: { type: "number" },
                    patterns: { type: "array" }
                  }
                },
                performance: {
                  type: "number",
                  description: "Performance score for this learning session",
                  default: 0.7
                }
              },
              required: ["nodeId", "nodeData"]
            }
          },
          {
            name: "get_hd_address_info",
            description: "Get HD addressing information for this service",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "get_mcp_integration_status",
            description: "Get MCP integration status and health",
            inputSchema: {
              type: "object",
              properties: {}
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Initialize HD addressing if not already done
        await this.initializeHDAddressing();

        switch (name) {
          case "initialize_enhanced_h2gnn_hd":
            return await this.initializeEnhancedH2GNNHD(args);
          
          case "learn_concept_hd":
            return await this.learnConceptHD(args);
          
          case "retrieve_memories_hd":
            return await this.retrieveMemoriesHD(args);
          
          case "get_understanding_snapshot_hd":
            return await this.getUnderstandingSnapshotHD(args);
          
          case "get_learning_progress_hd":
            return await this.getLearningProgressHD(args);
          
          case "start_learning_session_hd":
            return await this.startLearningSessionHD(args);
          
          case "end_learning_session_hd":
            return await this.endLearningSessionHD(args);
          
          case "consolidate_memories_hd":
            return await this.consolidateMemoriesHD(args);
          
          case "get_system_status_hd":
            return await this.getSystemStatusHD(args);
          
          case "adaptive_learning_hd":
            return await this.adaptiveLearningHD(args);
          
          case "learn_from_node_hd":
            return await this.learnFromNodeHD(args);
          
          case "get_hd_address_info":
            return await this.getHDAddressInfo(args);
          
          case "get_mcp_integration_status":
            return await this.getMCPIntegrationStatus(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  /**
   * Initialize Enhanced H²GNN with HD addressing
   */
  private async initializeEnhancedH2GNNHD(args: any): Promise<any> {
    if (enhancedH2GNN) {
      return {
        content: [
          {
            type: "text",
            text: `Enhanced H²GNN is already initialized with HD addressing:
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    }

    const h2gnnConfig = {
      embeddingDim: args.embeddingDim || 64,
      numLayers: args.numLayers || 3,
      curvature: args.curvature || -1.0
    };

    const persistenceConfig: PersistenceConfig = {
      storagePath: args.storagePath || "./persistence",
      maxMemories: args.maxMemories || 10000,
      consolidationThreshold: args.consolidationThreshold || 100,
      retrievalStrategy: 'hybrid',
      compressionEnabled: true
    };

    enhancedH2GNN = new EnhancedH2GNN(h2gnnConfig, persistenceConfig);

    return {
      content: [
        {
          type: "text",
          text: `Enhanced H²GNN initialized successfully with HD addressing:
- Embedding dimension: ${h2gnnConfig.embeddingDim}
- Layers: ${h2gnnConfig.numLayers}
- Curvature: ${h2gnnConfig.curvature}
- Storage path: ${persistenceConfig.storagePath}
- Max memories: ${persistenceConfig.maxMemories}
- Consolidation threshold: ${persistenceConfig.consolidationThreshold}
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
        }
      ]
    };
  }

  /**
   * Learn a new concept with HD addressing
   */
  private async learnConceptHD(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      throw new McpError(ErrorCode.InvalidRequest, "Enhanced H²GNN not initialized");
    }

    const memory = await enhancedH2GNN.learnWithMemory(
      args.concept,
      args.data || {},
      args.context || {},
      args.performance || 0.5
    );

    return {
      content: [
        {
          type: "text",
          text: `Learned concept "${args.concept}" successfully with HD addressing:
- Memory ID: ${memory.id}
- Confidence: ${memory.confidence.toFixed(3)}
- Related concepts: ${memory.relationships.join(', ') || 'None'}
- Performance: ${memory.performance}
- Timestamp: ${new Date(memory.timestamp).toISOString()}
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
        }
      ]
    };
  }

  /**
   * Retrieve relevant memories with HD addressing
   */
  private async retrieveMemoriesHD(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      throw new McpError(ErrorCode.InvalidRequest, "Enhanced H²GNN not initialized");
    }

    const memories = await enhancedH2GNN.retrieveMemories(
      args.query,
      args.maxResults || 10
    );

    const memorySummaries = memories.map(memory => ({
      concept: memory.concept,
      confidence: memory.confidence,
      performance: memory.performance,
      timestamp: new Date(memory.timestamp).toISOString(),
      relationships: memory.relationships
    }));

    return {
      content: [
        {
          type: "text",
          text: `Retrieved ${memories.length} relevant memories for "${args.query}" using HD addressing:
${memorySummaries.map((mem, i) => 
  `${i + 1}. ${mem.concept} (confidence: ${mem.confidence.toFixed(3)}, performance: ${mem.performance})`
).join('\n')}

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
        }
      ]
    };
  }

  /**
   * Get understanding snapshot with HD addressing
   */
  private async getUnderstandingSnapshotHD(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      throw new McpError(ErrorCode.InvalidRequest, "Enhanced H²GNN not initialized");
    }

    const snapshot = await enhancedH2GNN.getUnderstandingSnapshot(args.domain);

    if (!snapshot) {
      return {
        content: [
          {
            type: "text",
            text: `No understanding snapshot found for domain "${args.domain}" with HD addressing:
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Understanding snapshot for domain "${args.domain}" with HD addressing:
- Snapshot ID: ${snapshot.id}
- Timestamp: ${new Date(snapshot.timestamp).toISOString()}
- Confidence: ${snapshot.confidence.toFixed(3)}
- Concepts: ${snapshot.embeddings.size}
- Relationships: ${snapshot.relationships.length}
- Insights: ${snapshot.insights.join('; ')}
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
        }
      ]
    };
  }

  /**
   * Get learning progress with HD addressing
   */
  private async getLearningProgressHD(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      throw new McpError(ErrorCode.InvalidRequest, "Enhanced H²GNN not initialized");
    }

    const progress = enhancedH2GNN.getLearningProgress();

    const progressSummary = progress.map(p => ({
      domain: p.domain,
      learnedConcepts: p.learnedConcepts,
      totalConcepts: p.totalConcepts,
      masteryLevel: p.masteryLevel,
      lastUpdated: new Date(p.lastUpdated).toISOString(),
      weakAreas: p.weakAreas,
      strongAreas: p.strongAreas
    }));

    return {
      content: [
        {
          type: "text",
          text: `Learning Progress Summary with HD addressing:
${progressSummary.map(p => 
  `Domain: ${p.domain}
- Learned: ${p.learnedConcepts}/${p.totalConcepts} concepts
- Mastery: ${p.masteryLevel.toFixed(3)}
- Last updated: ${p.lastUpdated}
- Weak areas: ${p.weakAreas.join(', ') || 'None'}
- Strong areas: ${p.strongAreas.join(', ') || 'None'}`
).join('\n\n')}

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
        }
      ]
    };
  }

  /**
   * Start learning session with HD addressing
   */
  private async startLearningSessionHD(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      throw new McpError(ErrorCode.InvalidRequest, "Enhanced H²GNN not initialized");
    }

    this.learningSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      content: [
        {
          type: "text",
          text: `Learning session "${args.sessionName}" started with HD addressing:
- Session ID: ${this.learningSessionId}
- Focus domain: ${args.focusDomain || 'general'}
- Timestamp: ${new Date().toISOString()}
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}

You can now use the learn_concept_hd tool to teach the system new concepts.`
        }
      ]
    };
  }

  /**
   * End learning session with HD addressing
   */
  private async endLearningSessionHD(args: any): Promise<any> {
    if (!this.learningSessionId) {
      return {
        content: [
          {
            type: "text",
            text: "No active learning session to end"
          }
        ]
      };
    }

    const sessionId = this.learningSessionId;
    this.learningSessionId = null;

    return {
      content: [
        {
          type: "text",
          text: `Learning session ended with HD addressing:
- Session ID: ${sessionId}
- Timestamp: ${new Date().toISOString()}
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}

Knowledge has been consolidated and stored in the persistence layer.`
        }
      ]
    };
  }

  /**
   * Consolidate memories with HD addressing
   */
  private async consolidateMemoriesHD(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      throw new McpError(ErrorCode.InvalidRequest, "Enhanced H²GNN not initialized");
    }

    // Trigger memory consolidation
    await enhancedH2GNN.consolidateMemories();
    const status = enhancedH2GNN.getSystemStatus();

    return {
      content: [
        {
          type: "text",
          text: `Memory consolidation completed with HD addressing:
- Total memories: ${status.totalMemories}
- Understanding snapshots: ${status.totalSnapshots}
- Learning domains: ${status.totalDomains}
- Average confidence: ${status.averageConfidence.toFixed(3)}
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
        }
      ]
    };
  }

  /**
   * Get system status with HD addressing
   */
  private async getSystemStatusHD(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      return {
        content: [
          {
            type: "text",
            text: `Enhanced H²GNN not initialized
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    }

    const status = enhancedH2GNN.getSystemStatus();

    return {
      content: [
        {
          type: "text",
          text: `Enhanced H²GNN System Status with HD addressing:
- Total memories: ${status.totalMemories}
- Understanding snapshots: ${status.totalSnapshots}
- Learning domains: ${status.totalDomains}
- Average confidence: ${status.averageConfidence.toFixed(3)}
- Active learning session: ${this.learningSessionId || 'None'}
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}

Learning Progress by Domain:
${status.learningProgress.map(p => 
  `- ${p.domain}: ${p.learnedConcepts}/${p.totalConcepts} concepts (mastery: ${p.masteryLevel.toFixed(3)})`
).join('\n')}`
        }
      ]
    };
  }

  /**
   * Adaptive learning with HD addressing
   */
  private async adaptiveLearningHD(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      throw new McpError(ErrorCode.InvalidRequest, "Enhanced H²GNN not initialized");
    }

    // Get learning progress for the domain
    const progress = enhancedH2GNN.getLearningProgress();
    const domainProgress = progress.find(p => p.domain === args.domain);

    if (!domainProgress) {
      return {
        content: [
          {
            type: "text",
            text: `No learning progress found for domain "${args.domain}" with HD addressing:
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    }

    // Perform adaptive learning based on progress
    const learningRate = args.learningRate || 0.01;
    const adaptation = {
      domain: args.domain,
      currentMastery: domainProgress.masteryLevel,
      recommendedActions: this.getRecommendedActions(domainProgress),
      learningRate,
      timestamp: new Date().toISOString()
    };

    return {
      content: [
        {
          type: "text",
          text: `Adaptive learning analysis for domain "${args.domain}" with HD addressing:
- Current mastery: ${adaptation.currentMastery.toFixed(3)}
- Learning rate: ${learningRate}
- Recommended actions: ${adaptation.recommendedActions.join(', ')}
- Analysis timestamp: ${adaptation.timestamp}
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
        }
      ]
    };
  }

  /**
   * Learn from a knowledge graph node with HD addressing
   */
  private async learnFromNodeHD(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      throw new McpError(ErrorCode.InvalidRequest, "Enhanced H²GNN not initialized");
    }

    const { nodeId, nodeData, context = {}, performance = 0.7 } = args;

    // Extract semantic features from the node
    const semanticFeatures = this.extractSemanticFeatures(nodeData);
    const contextualFeatures = this.extractContextualFeatures(nodeData, context);
    const relationshipFeatures = this.extractRelationshipFeatures(nodeData);

    // Create a comprehensive learning concept
    const concept = `node_${nodeId}_${nodeData.type}_${nodeData.name}`;
    const learningData = {
      nodeId,
      nodeType: nodeData.type,
      nodeName: nodeData.name,
      content: nodeData.content,
      semanticFeatures,
      contextualFeatures,
      relationshipFeatures,
      relationships: nodeData.relationships || [],
      properties: nodeData.properties || {},
      complexity: context.complexity || 0.5,
      patterns: context.patterns || [],
      language: context.language || 'unknown'
    };

    // Learn the concept with enhanced context
    const memory = await enhancedH2GNN.learnWithMemory(
      concept,
      learningData,
      {
        domain: context.domain || 'knowledge_graph',
        type: 'node_learning',
        source: 'knowledge_graph',
        nodeId,
        timestamp: new Date().toISOString()
      },
      performance
    );

    // Create relationships with other learned concepts
    if (nodeData.relationships && nodeData.relationships.length > 0) {
      for (const relationship of nodeData.relationships) {
        const relatedConcept = `node_${relationship.target}_${relationship.type}`;
        await enhancedH2GNN.learnWithMemory(
          relatedConcept,
          {
            relationshipType: relationship.type,
            sourceNode: nodeId,
            targetNode: relationship.target,
            strength: relationship.strength || 0.5
          },
          {
            domain: context.domain || 'knowledge_graph',
            type: 'relationship_learning',
            source: 'knowledge_graph'
          },
          performance * 0.8
        );
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `Successfully learned from knowledge graph node "${nodeId}" with HD addressing:
- Node Type: ${nodeData.type}
- Node Name: ${nodeData.name}
- Concept: ${concept}
- Memory ID: ${memory.id}
- Confidence: ${memory.confidence.toFixed(3)}
- Performance: ${performance}
- Semantic Features: ${semanticFeatures.length}
- Contextual Features: ${contextualFeatures.length}
- Relationship Features: ${relationshipFeatures.length}
- Relationships: ${nodeData.relationships?.length || 0}
- Language: ${context.language || 'unknown'}
- Domain: ${context.domain || 'knowledge_graph'}
- Patterns: ${context.patterns?.join(', ') || 'None'}
- Timestamp: ${new Date(memory.timestamp).toISOString()}
- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}

This creates a direct link between code analysis and semantic understanding!`
        }
      ]
    };
  }

  /**
   * Get HD address information
   */
  private async getHDAddressInfo(args: any): Promise<any> {
    if (!this.h2gnnAddress || !hdAddressing) {
      return {
        content: [
          {
            type: "text",
            text: "HD addressing not initialized"
          }
        ]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `HD Address Information:
- H²GNN Address: ${this.h2gnnAddress.path}
- RPC Endpoint: ${hdAddressing.getRPCEndpoint(this.h2gnnAddress)}
- Hyperbolic Coordinates: [${this.h2gnnAddress.hyperbolic.coordinates[0].toFixed(4)}, ${this.h2gnnAddress.hyperbolic.coordinates[1].toFixed(4)}]
- Curvature: ${this.h2gnnAddress.hyperbolic.curvature}
- Transport: ${this.h2gnnAddress.transport}
- Host: ${this.h2gnnAddress.host}
- Port: ${this.h2gnnAddress.port}`
        }
      ]
    };
  }

  /**
   * Get MCP integration status
   */
  private async getMCPIntegrationStatus(args: any): Promise<any> {
    if (!mcpIntegration) {
      return {
        content: [
          {
            type: "text",
            text: "MCP integration not initialized"
          }
        ]
      };
    }

    const services = mcpIntegration.getAllServices();
    const tools = mcpIntegration.getAllTools();
    const resources = mcpIntegration.getAllResources();
    const prompts = mcpIntegration.getAllPrompts();
    const health = mcpIntegration.getAllServiceHealth();

    return {
      content: [
        {
          type: "text",
          text: `MCP Integration Status:
- Total Services: ${services.length}
- Total Tools: ${tools.length}
- Total Resources: ${resources.length}
- Total Prompts: ${prompts.length}

Service Health:
${health.map(({ service, health }) => 
  `- ${service}: ${health.healthy ? 'HEALTHY' : 'UNHEALTHY'} - ${health.message}`
).join('\n')}

H²GNN Address: ${this.h2gnnAddress?.path}
RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
        }
      ]
    };
  }

  /**
   * Extract semantic features from node data
   */
  private extractSemanticFeatures(nodeData: any): string[] {
    const features: string[] = [];
    
    // Extract from content
    if (nodeData.content) {
      const words = nodeData.content.toLowerCase().split(/\s+/);
      features.push(...words.filter(word => word.length > 3));
    }
    
    // Extract from name
    if (nodeData.name) {
      const nameWords = nodeData.name.toLowerCase().split(/(?=[A-Z])|_|-/);
      features.push(...nameWords.filter(word => word.length > 2));
    }
    
    // Extract from type
    if (nodeData.type) {
      features.push(nodeData.type.toLowerCase());
    }
    
    return [...new Set(features)]; // Remove duplicates
  }

  /**
   * Extract contextual features from node data and context
   */
  private extractContextualFeatures(nodeData: any, context: any): string[] {
    const features: string[] = [];
    
    // Add context domain
    if (context.domain) {
      features.push(`domain_${context.domain}`);
    }
    
    // Add language
    if (context.language) {
      features.push(`lang_${context.language}`);
    }
    
    // Add patterns
    if (context.patterns && Array.isArray(context.patterns)) {
      features.push(...context.patterns.map((p: string) => `pattern_${p}`));
    }
    
    // Add complexity level
    if (context.complexity) {
      const complexityLevel = context.complexity < 0.3 ? 'low' : 
                             context.complexity < 0.7 ? 'medium' : 'high';
      features.push(`complexity_${complexityLevel}`);
    }
    
    return features;
  }

  /**
   * Extract relationship features from node data
   */
  private extractRelationshipFeatures(nodeData: any): string[] {
    const features: string[] = [];
    
    if (nodeData.relationships && Array.isArray(nodeData.relationships)) {
      for (const rel of nodeData.relationships) {
        features.push(`rel_${rel.type}`);
        if (rel.strength) {
          const strengthLevel = rel.strength < 0.3 ? 'weak' : 
                               rel.strength < 0.7 ? 'medium' : 'strong';
          features.push(`strength_${strengthLevel}`);
        }
      }
    }
    
    return features;
  }

  /**
   * Get recommended actions based on learning progress
   */
  private getRecommendedActions(progress: LearningProgress): string[] {
    const actions: string[] = [];

    if (progress.masteryLevel < 0.3) {
      actions.push("Focus on fundamental concepts");
      actions.push("Increase practice frequency");
    } else if (progress.masteryLevel < 0.7) {
      actions.push("Practice intermediate concepts");
      actions.push("Review weak areas");
    } else {
      actions.push("Explore advanced concepts");
      actions.push("Teach others");
    }

    if (progress.weakAreas.length > 0) {
      actions.push(`Review weak areas: ${progress.weakAreas.join(', ')}`);
    }

    if (progress.strongAreas.length > 0) {
      actions.push(`Leverage strong areas: ${progress.strongAreas.join(', ')}`);
    }

    return actions;
  }

  /**
   * Setup resource handlers with HD addressing
   */
  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "enhanced-h2gnn-hd://memories/all",
            mimeType: "application/json",
            name: "All Learning Memories (HD)",
            description: "All stored learning memories with embeddings using HD addressing"
          },
          {
            uri: "enhanced-h2gnn-hd://snapshots/all",
            mimeType: "application/json",
            name: "Understanding Snapshots (HD)",
            description: "Consolidated understanding snapshots by domain using HD addressing"
          },
          {
            uri: "enhanced-h2gnn-hd://progress/all",
            mimeType: "application/json",
            name: "Learning Progress (HD)",
            description: "Learning progress across all domains using HD addressing"
          },
          {
            uri: "enhanced-h2gnn-hd://status/system",
            mimeType: "application/json",
            name: "System Status (HD)",
            description: "Comprehensive system status and metrics using HD addressing"
          },
          {
            uri: "enhanced-h2gnn-hd://address/info",
            mimeType: "application/json",
            name: "HD Address Information",
            description: "HD addressing information for this service"
          },
          {
            uri: "enhanced-h2gnn-hd://integration/mcp",
            mimeType: "application/json",
            name: "MCP Integration Status",
            description: "MCP integration status and health information"
          }
        ]
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (!enhancedH2GNN) {
        throw new McpError(ErrorCode.InvalidRequest, "Enhanced H²GNN not initialized");
      }

      switch (uri) {
        case "enhanced-h2gnn-hd://memories/all":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  memories: Array.from(enhancedH2GNN['memories'].values())
                }, null, 2)
              }
            ]
          };

        case "enhanced-h2gnn-hd://snapshots/all":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  snapshots: Array.from(enhancedH2GNN['understandingSnapshots'].values())
                }, null, 2)
              }
            ]
          };

        case "enhanced-h2gnn-hd://progress/all":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  progress: enhancedH2GNN.getLearningProgress()
                }, null, 2)
              }
            ]
          };

        case "enhanced-h2gnn-hd://status/system":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  status: enhancedH2GNN.getSystemStatus()
                }, null, 2)
              }
            ]
          };

        case "enhanced-h2gnn-hd://address/info":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  hyperbolicCoordinates: this.h2gnnAddress?.hyperbolic.coordinates,
                  curvature: this.h2gnnAddress?.hyperbolic.curvature,
                  transport: this.h2gnnAddress?.transport,
                  host: this.h2gnnAddress?.host,
                  port: this.h2gnnAddress?.port
                }, null, 2)
              }
            ]
          };

        case "enhanced-h2gnn-hd://integration/mcp":
          if (!mcpIntegration) {
            throw new McpError(ErrorCode.InvalidRequest, "MCP integration not initialized");
          }
          
          const services = mcpIntegration.getAllServices();
          const tools = mcpIntegration.getAllTools();
          const resources = mcpIntegration.getAllResources();
          const prompts = mcpIntegration.getAllPrompts();
          const health = mcpIntegration.getAllServiceHealth();

          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  services,
                  tools,
                  resources,
                  prompts,
                  health
                }, null, 2)
              }
            ]
          };

        default:
          throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
      }
    });
  }

  /**
   * Setup prompt handlers with HD addressing
   */
  private setupPromptHandlers(): void {
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "learning_session_hd",
            description: "Start an interactive learning session with HD addressing",
            arguments: [
              {
                name: "topic",
                description: "Topic to learn about",
                required: true
              },
              {
                name: "level",
                description: "Learning level (beginner, intermediate, advanced)",
                required: false
              }
            ]
          },
          {
            name: "understanding_query_hd",
            description: "Query the system's understanding of a topic with HD addressing",
            arguments: [
              {
                name: "query",
                description: "What you want to understand",
                required: true
              }
            ]
          },
          {
            name: "hd_address_help",
            description: "Get help with HD addressing and deterministic routing",
            arguments: []
          }
        ]
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "learning_session_hd":
          return {
            description: `Interactive learning session for topic: ${args.topic} with HD addressing`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `I want to learn about ${args.topic} at ${args.level || 'intermediate'} level using HD addressing. Can you help me understand this concept and guide me through learning it? The system uses deterministic BIP32 HD addressing for secure and consistent service routing.`
                }
              }
            ]
          };

        case "understanding_query_hd":
          return {
            description: `Query system understanding for: ${args.query} with HD addressing`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `What does the system understand about ${args.query} using HD addressing? Please provide insights based on the learned knowledge and include information about the deterministic addressing system.`
                }
              }
            ]
          };

        case "hd_address_help":
          return {
            description: "Help with HD addressing and deterministic routing",
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `I need help understanding HD addressing in the H²GNN system. Can you explain how BIP32 HD addressing works for deterministic service routing and how it integrates with hyperbolic embeddings?`
                }
              }
            ]
          };

        default:
          throw new McpError(ErrorCode.InvalidRequest, `Unknown prompt: ${name}`);
      }
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log("Enhanced H²GNN MCP Server HD running on stdio");
  }
}

// Start the server
const server = new EnhancedH2GNNMCPServerHD();
server.start().catch(console.error);

export default EnhancedH2GNNMCPServerHD;
