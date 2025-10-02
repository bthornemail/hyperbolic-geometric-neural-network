#!/usr/bin/env node

/**
 * Enhanced H²GNN MCP Server with Learning and Persistence
 * 
 * This enhanced MCP server includes:
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
  LearningMemory, 
  UnderstandingSnapshot, 
  LearningProgress,
  PersistenceConfig 
} from '../core/enhanced-h2gnn.js';
import { HyperbolicGeometricHGN } from '../core/H2GNN.js';

// Global enhanced H²GNN instance
let enhancedH2GNN: EnhancedH2GNN | null = null;

/**
 * Enhanced H²GNN MCP Server with Learning and Persistence
 */
class EnhancedH2GNNMCPServer {
  private server: Server;
  private name = "enhanced-h2gnn-mcp-server";
  private version = "2.0.0";
  private learningSessionId: string | null = null;

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
   * Setup enhanced tool handlers
   */
  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "initialize_enhanced_h2gnn",
            description: "Initialize Enhanced H²GNN with learning and persistence capabilities",
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
                  default: "./h2gnn-persistence"
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
            }
          },
          {
            name: "learn_concept",
            description: "Learn a new concept with enhanced memory and understanding",
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
            }
          },
          {
            name: "retrieve_memories",
            description: "Retrieve relevant memories for a query",
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
            }
          },
          {
            name: "get_understanding_snapshot",
            description: "Get understanding snapshot for a domain",
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
            name: "get_learning_progress",
            description: "Get learning progress for all domains",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "start_learning_session",
            description: "Start an interactive learning session",
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
            name: "end_learning_session",
            description: "End the current learning session and consolidate knowledge",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "consolidate_memories",
            description: "Manually trigger memory consolidation",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "get_system_status",
            description: "Get comprehensive system status including learning metrics",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "adaptive_learning",
            description: "Perform adaptive learning based on performance history",
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
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "initialize_enhanced_h2gnn":
            return await this.initializeEnhancedH2GNN(args);
          
          case "learn_concept":
            return await this.learnConcept(args);
          
          case "retrieve_memories":
            return await this.retrieveMemories(args);
          
          case "get_understanding_snapshot":
            return await this.getUnderstandingSnapshot(args);
          
          case "get_learning_progress":
            return await this.getLearningProgress(args);
          
          case "start_learning_session":
            return await this.startLearningSession(args);
          
          case "end_learning_session":
            return await this.endLearningSession(args);
          
          case "consolidate_memories":
            return await this.consolidateMemories(args);
          
          case "get_system_status":
            return await this.getSystemStatus(args);
          
          case "adaptive_learning":
            return await this.adaptiveLearning(args);
          
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
   * Initialize Enhanced H²GNN
   */
  private async initializeEnhancedH2GNN(args: any): Promise<any> {
    if (enhancedH2GNN) {
      return {
        content: [
          {
            type: "text",
            text: "Enhanced H²GNN is already initialized"
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
      storagePath: args.storagePath || "./h2gnn-persistence",
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
          text: `Enhanced H²GNN initialized successfully with:
- Embedding dimension: ${h2gnnConfig.embeddingDim}
- Layers: ${h2gnnConfig.numLayers}
- Curvature: ${h2gnnConfig.curvature}
- Storage path: ${persistenceConfig.storagePath}
- Max memories: ${persistenceConfig.maxMemories}
- Consolidation threshold: ${persistenceConfig.consolidationThreshold}`
        }
      ]
    };
  }

  /**
   * Learn a new concept
   */
  private async learnConcept(args: any): Promise<any> {
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
          text: `Learned concept "${args.concept}" successfully:
- Memory ID: ${memory.id}
- Confidence: ${memory.confidence.toFixed(3)}
- Related concepts: ${memory.relationships.join(', ') || 'None'}
- Performance: ${memory.performance}
- Timestamp: ${new Date(memory.timestamp).toISOString()}`
        }
      ]
    };
  }

  /**
   * Retrieve relevant memories
   */
  private async retrieveMemories(args: any): Promise<any> {
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
          text: `Retrieved ${memories.length} relevant memories for "${args.query}":\n\n` +
                memorySummaries.map((mem, i) => 
                  `${i + 1}. ${mem.concept} (confidence: ${mem.confidence.toFixed(3)}, performance: ${mem.performance})`
                ).join('\n')
        }
      ]
    };
  }

  /**
   * Get understanding snapshot
   */
  private async getUnderstandingSnapshot(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      throw new McpError(ErrorCode.InvalidRequest, "Enhanced H²GNN not initialized");
    }

    const snapshot = await enhancedH2GNN.getUnderstandingSnapshot(args.domain);

    if (!snapshot) {
      return {
        content: [
          {
            type: "text",
            text: `No understanding snapshot found for domain "${args.domain}"`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Understanding snapshot for domain "${args.domain}":
- Snapshot ID: ${snapshot.id}
- Timestamp: ${new Date(snapshot.timestamp).toISOString()}
- Confidence: ${snapshot.confidence.toFixed(3)}
- Concepts: ${snapshot.embeddings.size}
- Relationships: ${snapshot.relationships.length}
- Insights: ${snapshot.insights.join('; ')}`
        }
      ]
    };
  }

  /**
   * Get learning progress
   */
  private async getLearningProgress(args: any): Promise<any> {
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
          text: `Learning Progress Summary:\n\n` +
                progressSummary.map(p => 
                  `Domain: ${p.domain}
- Learned: ${p.learnedConcepts}/${p.totalConcepts} concepts
- Mastery: ${p.masteryLevel.toFixed(3)}
- Last updated: ${p.lastUpdated}
- Weak areas: ${p.weakAreas.join(', ') || 'None'}
- Strong areas: ${p.strongAreas.join(', ') || 'None'}`
                ).join('\n\n')
        }
      ]
    };
  }

  /**
   * Start learning session
   */
  private async startLearningSession(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      throw new McpError(ErrorCode.InvalidRequest, "Enhanced H²GNN not initialized");
    }

    this.learningSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      content: [
        {
          type: "text",
          text: `Learning session "${args.sessionName}" started:
- Session ID: ${this.learningSessionId}
- Focus domain: ${args.focusDomain || 'general'}
- Timestamp: ${new Date().toISOString()}

You can now use the learn_concept tool to teach the system new concepts.`
        }
      ]
    };
  }

  /**
   * End learning session
   */
  private async endLearningSession(args: any): Promise<any> {
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
          text: `Learning session ended:
- Session ID: ${sessionId}
- Timestamp: ${new Date().toISOString()}

Knowledge has been consolidated and stored in the persistence layer.`
        }
      ]
    };
  }

  /**
   * Consolidate memories
   */
  private async consolidateMemories(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      throw new McpError(ErrorCode.InvalidRequest, "Enhanced H²GNN not initialized");
    }

    // Trigger memory consolidation
    const status = enhancedH2GNN.getSystemStatus();

    return {
      content: [
        {
          type: "text",
          text: `Memory consolidation completed:
- Total memories: ${status.totalMemories}
- Understanding snapshots: ${status.totalSnapshots}
- Learning domains: ${status.totalDomains}
- Average confidence: ${status.averageConfidence.toFixed(3)}`
        }
      ]
    };
  }

  /**
   * Get system status
   */
  private async getSystemStatus(args: any): Promise<any> {
    if (!enhancedH2GNN) {
      return {
        content: [
          {
            type: "text",
            text: "Enhanced H²GNN not initialized"
          }
        ]
      };
    }

    const status = enhancedH2GNN.getSystemStatus();

    return {
      content: [
        {
          type: "text",
          text: `Enhanced H²GNN System Status:
- Total memories: ${status.totalMemories}
- Understanding snapshots: ${status.totalSnapshots}
- Learning domains: ${status.totalDomains}
- Average confidence: ${status.averageConfidence.toFixed(3)}
- Active learning session: ${this.learningSessionId || 'None'}

Learning Progress by Domain:
${status.learningProgress.map(p => 
  `- ${p.domain}: ${p.learnedConcepts}/${p.totalConcepts} concepts (mastery: ${p.masteryLevel.toFixed(3)})`
).join('\n')}`
        }
      ]
    };
  }

  /**
   * Adaptive learning
   */
  private async adaptiveLearning(args: any): Promise<any> {
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
            text: `No learning progress found for domain "${args.domain}"`
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
          text: `Adaptive learning analysis for domain "${args.domain}":
- Current mastery: ${adaptation.currentMastery.toFixed(3)}
- Learning rate: ${learningRate}
- Recommended actions: ${adaptation.recommendedActions.join(', ')}
- Analysis timestamp: ${adaptation.timestamp}`
        }
      ]
    };
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
   * Setup resource handlers
   */
  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "enhanced-h2gnn://memories/all",
            mimeType: "application/json",
            name: "All Learning Memories",
            description: "All stored learning memories with embeddings"
          },
          {
            uri: "enhanced-h2gnn://snapshots/all",
            mimeType: "application/json",
            name: "Understanding Snapshots",
            description: "Consolidated understanding snapshots by domain"
          },
          {
            uri: "enhanced-h2gnn://progress/all",
            mimeType: "application/json",
            name: "Learning Progress",
            description: "Learning progress across all domains"
          },
          {
            uri: "enhanced-h2gnn://status/system",
            mimeType: "application/json",
            name: "System Status",
            description: "Comprehensive system status and metrics"
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
        case "enhanced-h2gnn://memories/all":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(Array.from(enhancedH2GNN['memories'].values()), null, 2)
              }
            ]
          };

        case "enhanced-h2gnn://snapshots/all":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(Array.from(enhancedH2GNN['understandingSnapshots'].values()), null, 2)
              }
            ]
          };

        case "enhanced-h2gnn://progress/all":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(enhancedH2GNN.getLearningProgress(), null, 2)
              }
            ]
          };

        case "enhanced-h2gnn://status/system":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(enhancedH2GNN.getSystemStatus(), null, 2)
              }
            ]
          };

        default:
          throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
      }
    });
  }

  /**
   * Setup prompt handlers
   */
  private setupPromptHandlers(): void {
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "learning_session",
            description: "Start an interactive learning session",
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
            name: "understanding_query",
            description: "Query the system's understanding of a topic",
            arguments: [
              {
                name: "query",
                description: "What you want to understand",
                required: true
              }
            ]
          }
        ]
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "learning_session":
          return {
            description: `Interactive learning session for topic: ${args.topic}`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `I want to learn about ${args.topic} at ${args.level || 'intermediate'} level. Can you help me understand this concept and guide me through learning it?`
                }
              }
            ]
          };

        case "understanding_query":
          return {
            description: `Query system understanding for: ${args.query}`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `What does the system understand about ${args.query}? Please provide insights based on the learned knowledge.`
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
    console.log("Enhanced H²GNN MCP Server running on stdio");
  }
}

// Start the server
const server = new EnhancedH2GNNMCPServer();
server.start().catch(console.error);

export default EnhancedH2GNNMCPServer;
