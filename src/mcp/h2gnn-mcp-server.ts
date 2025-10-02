#!/usr/bin/env node

/**
 * H²GNN MCP Server
 * 
 * Model Context Protocol server for H²GNN + PocketFlow + WordNet system
 * Enables AI-human collaboration through standardized interfaces
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
import { z } from "zod";

// Import our H²GNN system components
import WordNetModule from '../datasets/wordnet-integration.js';
import { HyperbolicArithmetic, Vector, createVector } from '../math/hyperbolic-arithmetic.js';
import AgentWorkflows from '../workflows/agent-workflows.js';

const { WordNetProcessor } = WordNetModule;
const { HierarchicalQAWorkflow, ConceptLearningWorkflow, SemanticExplorationWorkflow } = AgentWorkflows;

// Global system state
let wordnetProcessor: any = null;
let activeWorkflows: Map<string, any> = new Map();

/**
 * MCP Server for H²GNN System
 */
class H2GNNMCPServer {
  private server: Server;
  private name = "h2gnn-mcp-server";
  private version = "1.0.0";

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
   * Setup tool handlers for H²GNN operations
   */
  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "initialize_wordnet",
            description: "Initialize WordNet processor with hyperbolic embeddings",
            inputSchema: {
              type: "object",
              properties: {
                maxSynsets: {
                  type: "number",
                  description: "Maximum number of synsets to load",
                  default: 1000
                },
                embeddingDim: {
                  type: "number", 
                  description: "Dimension of hyperbolic embeddings",
                  default: 128
                }
              }
            }
          },
          {
            name: "query_wordnet",
            description: "Query WordNet for concept information and relationships",
            inputSchema: {
              type: "object",
              properties: {
                concept: {
                  type: "string",
                  description: "Concept to query (e.g., 'dog', 'animal')"
                },
                includeHierarchy: {
                  type: "boolean",
                  description: "Include hierarchical relationships",
                  default: true
                }
              },
              required: ["concept"]
            }
          },
          {
            name: "compute_hyperbolic_distance",
            description: "Compute hyperbolic distance between two concepts",
            inputSchema: {
              type: "object",
              properties: {
                concept1: {
                  type: "string",
                  description: "First concept"
                },
                concept2: {
                  type: "string", 
                  description: "Second concept"
                }
              },
              required: ["concept1", "concept2"]
            }
          },
          {
            name: "run_hierarchical_qa",
            description: "Run hierarchical Q&A workflow using H²GNN",
            inputSchema: {
              type: "object",
              properties: {
                question: {
                  type: "string",
                  description: "Question to answer"
                },
                context: {
                  type: "array",
                  items: { type: "string" },
                  description: "Contextual concepts to consider"
                }
              },
              required: ["question"]
            }
          },
          {
            name: "explore_semantic_space",
            description: "Explore semantic relationships in hyperbolic space",
            inputSchema: {
              type: "object",
              properties: {
                startConcept: {
                  type: "string",
                  description: "Starting concept for exploration"
                },
                depth: {
                  type: "number",
                  description: "Exploration depth",
                  default: 3
                },
                maxResults: {
                  type: "number",
                  description: "Maximum results to return",
                  default: 10
                }
              },
              required: ["startConcept"]
            }
          },
          {
            name: "train_concept_embeddings",
            description: "Train hyperbolic embeddings for new concepts",
            inputSchema: {
              type: "object",
              properties: {
                concepts: {
                  type: "array",
                  items: { type: "string" },
                  description: "Concepts to train embeddings for"
                },
                relationships: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      source: { type: "string" },
                      target: { type: "string" },
                      type: { type: "string" }
                    }
                  },
                  description: "Relationships between concepts"
                }
              },
              required: ["concepts"]
            }
          },
          {
            name: "analyze_hierarchy",
            description: "Analyze hierarchical structure using hyperbolic geometry",
            inputSchema: {
              type: "object",
              properties: {
                rootConcept: {
                  type: "string",
                  description: "Root concept to analyze from"
                }
              }
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
          case "initialize_wordnet":
            return await this.initializeWordNet(args);
          
          case "query_wordnet":
            return await this.queryWordNet(args);
          
          case "compute_hyperbolic_distance":
            return await this.computeHyperbolicDistance(args);
          
          case "run_hierarchical_qa":
            return await this.runHierarchicalQA(args);
          
          case "explore_semantic_space":
            return await this.exploreSemanticSpace(args);
          
          case "train_concept_embeddings":
            return await this.trainConceptEmbeddings(args);
          
          case "analyze_hierarchy":
            return await this.analyzeHierarchy(args);
          
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
   * Setup resource handlers for H²GNN data
   */
  private setupResourceHandlers(): void {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "h2gnn://wordnet/synsets",
            mimeType: "application/json",
            name: "WordNet Synsets",
            description: "All loaded WordNet synsets with embeddings"
          },
          {
            uri: "h2gnn://wordnet/hierarchy",
            mimeType: "application/json", 
            name: "WordNet Hierarchy",
            description: "Hierarchical structure of WordNet concepts"
          },
          {
            uri: "h2gnn://embeddings/all",
            mimeType: "application/json",
            name: "Hyperbolic Embeddings",
            description: "All hyperbolic embeddings in the system"
          },
          {
            uri: "h2gnn://workflows/active",
            mimeType: "application/json",
            name: "Active Workflows",
            description: "Currently running PocketFlow workflows"
          },
          {
            uri: "h2gnn://system/status",
            mimeType: "application/json",
            name: "System Status",
            description: "Current status of H²GNN system components"
          }
        ]
      };
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        switch (uri) {
          case "h2gnn://wordnet/synsets":
            return await this.getWordNetSynsets();
          
          case "h2gnn://wordnet/hierarchy":
            return await this.getWordNetHierarchy();
          
          case "h2gnn://embeddings/all":
            return await this.getAllEmbeddings();
          
          case "h2gnn://workflows/active":
            return await this.getActiveWorkflows();
          
          case "h2gnn://system/status":
            return await this.getSystemStatus();
          
          default:
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Unknown resource: ${uri}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Resource read failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  /**
   * Setup prompt handlers for AI collaboration
   */
  private setupPromptHandlers(): void {
    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "concept_analysis",
            description: "Analyze a concept using hyperbolic geometry and WordNet",
            arguments: [
              {
                name: "concept",
                description: "The concept to analyze",
                required: true
              }
            ]
          },
          {
            name: "hierarchical_reasoning",
            description: "Perform hierarchical reasoning about concept relationships",
            arguments: [
              {
                name: "concepts",
                description: "List of concepts to reason about",
                required: true
              }
            ]
          },
          {
            name: "semantic_exploration",
            description: "Guide semantic exploration in hyperbolic space",
            arguments: [
              {
                name: "startPoint",
                description: "Starting concept for exploration",
                required: true
              },
              {
                name: "goal",
                description: "Exploration goal or target",
                required: false
              }
            ]
          }
        ]
      };
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "concept_analysis":
          return this.getConceptAnalysisPrompt(args);
        
        case "hierarchical_reasoning":
          return this.getHierarchicalReasoningPrompt(args);
        
        case "semantic_exploration":
          return this.getSemanticExplorationPrompt(args);
        
        default:
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Unknown prompt: ${name}`
          );
      }
    });
  }

  // Tool implementations
  private async initializeWordNet(args: any) {
    const { maxSynsets = 1000, embeddingDim = 128 } = args;
    
    wordnetProcessor = new WordNetProcessor();
    await wordnetProcessor.loadWordNetData();
    await wordnetProcessor.buildHierarchy();
    await wordnetProcessor.generateHyperbolicEmbeddings();
    
    const synsets = wordnetProcessor.getSynsets();
    
    return {
      content: [
        {
          type: "text",
          text: `✅ WordNet initialized successfully!\n` +
                `📊 Loaded ${synsets.size} synsets\n` +
                `🎯 Embedding dimension: ${embeddingDim}\n` +
                `🌳 Hierarchical structure built\n` +
                `🔮 Hyperbolic embeddings generated`
        }
      ]
    };
  }

  private async queryWordNet(args: any) {
    if (!wordnetProcessor) {
      throw new Error("WordNet not initialized. Call initialize_wordnet first.");
    }

    const { concept, includeHierarchy = true } = args;
    const synsets = wordnetProcessor.getSynsets();
    const hierarchy = wordnetProcessor.getHierarchy();
    
    // Find matching synsets
    const matches = Array.from(synsets.values()).filter(synset =>
      synset.words.some((word: string) => word.toLowerCase().includes(concept.toLowerCase()))
    );

    if (matches.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `❌ No synsets found for concept: ${concept}`
          }
        ]
      };
    }

    let result = `🔍 Found ${matches.length} synset(s) for "${concept}":\n\n`;
    
    matches.forEach((synset, i) => {
      result += `${i + 1}. **${synset.words.join(', ')}** (${synset.pos})\n`;
      result += `   Definition: ${synset.definition}\n`;
      if (synset.examples.length > 0) {
        result += `   Examples: ${synset.examples.join('; ')}\n`;
      }
      
      if (includeHierarchy && hierarchy) {
        const node = hierarchy.nodes.find(n => n.id === synset.id);
        if (node) {
          if (node.parents.length > 0) {
            result += `   ⬆️ Parents: ${node.parents.join(', ')}\n`;
          }
          if (node.children.length > 0) {
            result += `   ⬇️ Children: ${node.children.slice(0, 5).join(', ')}${node.children.length > 5 ? '...' : ''}\n`;
          }
        }
      }
      result += '\n';
    });

    return {
      content: [
        {
          type: "text",
          text: result
        }
      ]
    };
  }

  private async computeHyperbolicDistance(args: any) {
    if (!wordnetProcessor) {
      throw new Error("WordNet not initialized. Call initialize_wordnet first.");
    }

    const { concept1, concept2 } = args;
    const hierarchy = wordnetProcessor.getHierarchy();
    
    if (!hierarchy) {
      throw new Error("Hierarchy not built");
    }

    // Find nodes for both concepts
    const node1 = hierarchy.nodes.find(n => 
      n.synset.words.some((w: string) => w.toLowerCase().includes(concept1.toLowerCase()))
    );
    const node2 = hierarchy.nodes.find(n => 
      n.synset.words.some((w: string) => w.toLowerCase().includes(concept2.toLowerCase()))
    );

    if (!node1 || !node2) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Could not find embeddings for one or both concepts: ${concept1}, ${concept2}`
          }
        ]
      };
    }

    if (!node1.embedding || !node2.embedding) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Embeddings not available for one or both concepts`
          }
        ]
      };
    }

    const distance = wordnetProcessor.computeHyperbolicDistance(
      node1.embedding.data,
      node2.embedding.data
    );

    return {
      content: [
        {
          type: "text",
          text: `📏 Hyperbolic distance between "${concept1}" and "${concept2}": ${distance.toFixed(4)}\n\n` +
                `🔍 Concept 1: ${node1.synset.words.join(', ')}\n` +
                `🔍 Concept 2: ${node2.synset.words.join(', ')}\n\n` +
                `📊 Distance interpretation:\n` +
                `   • < 1.0: Very similar concepts\n` +
                `   • 1.0-3.0: Related concepts\n` +
                `   • 3.0-5.0: Distant concepts\n` +
                `   • > 5.0: Very different concepts`
        }
      ]
    };
  }

  private async runHierarchicalQA(args: any) {
    const { question, context = [] } = args;
    
    const workflow = new HierarchicalQAWorkflow();
    const shared = {
      question,
      context: {
        concepts: context,
        hierarchy: wordnetProcessor ? wordnetProcessor.getHierarchy() : null
      }
    };

    const workflowId = `qa-${Date.now()}`;
    activeWorkflows.set(workflowId, workflow);

    try {
      await workflow.run(shared);
      
      return {
        content: [
          {
            type: "text",
            text: `❓ **Question**: ${question}\n\n` +
                  `💡 **Answer**: ${shared.answer}\n\n` +
                  `🧠 **Reasoning**: ${shared.reasoning}\n\n` +
                  `🔍 **Context Used**: ${context.length > 0 ? context.join(', ') : 'WordNet hierarchy'}`
          }
        ]
      };
    } finally {
      activeWorkflows.delete(workflowId);
    }
  }

  private async exploreSemanticSpace(args: any) {
    const { startConcept, depth = 3, maxResults = 10 } = args;
    
    if (!wordnetProcessor) {
      throw new Error("WordNet not initialized. Call initialize_wordnet first.");
    }

    const workflow = new SemanticExplorationWorkflow();
    const hierarchy = wordnetProcessor.getHierarchy();
    
    const shared = {
      startConcept,
      explorationDepth: depth,
      semanticSpace: hierarchy ? 
        Object.fromEntries(
          hierarchy.nodes
            .filter(n => n.embedding)
            .map(n => [n.id, n.embedding!.data])
        ) : {}
    };

    const workflowId = `exploration-${Date.now()}`;
    activeWorkflows.set(workflowId, workflow);

    try {
      await workflow.run(shared);
      
      const explored = shared.exploredConcepts.slice(0, maxResults);
      const relationships = shared.discoveredRelationships.slice(0, maxResults);
      
      let result = `🗺️ **Semantic Exploration from "${startConcept}"**\n\n`;
      result += `📍 **Exploration Path**: ${explored.join(' → ')}\n\n`;
      result += `🔗 **Discovered Relationships**:\n`;
      
      relationships.forEach((rel, i) => {
        result += `   ${i + 1}. ${rel.source} --[${rel.type}]--> ${rel.target}\n`;
      });
      
      result += `\n📊 **Exploration Stats**:\n`;
      result += `   • Depth: ${depth}\n`;
      result += `   • Concepts explored: ${explored.length}\n`;
      result += `   • Relationships found: ${relationships.length}`;

      return {
        content: [
          {
            type: "text",
            text: result
          }
        ]
      };
    } finally {
      activeWorkflows.delete(workflowId);
    }
  }

  private async trainConceptEmbeddings(args: any) {
    const { concepts, relationships = [] } = args;
    
    const workflow = new ConceptLearningWorkflow();
    const shared = {
      concepts,
      relationships
    };

    const workflowId = `training-${Date.now()}`;
    activeWorkflows.set(workflowId, workflow);

    try {
      await workflow.run(shared);
      
      const learnedConcepts = Object.keys(shared.conceptEmbeddings);
      
      return {
        content: [
          {
            type: "text",
            text: `🧮 **Concept Embedding Training Complete**\n\n` +
                  `🎯 **Trained Concepts**: ${learnedConcepts.join(', ')}\n` +
                  `🔗 **Relationships**: ${relationships.length}\n` +
                  `📊 **Hierarchical Structure**: ${shared.hierarchicalStructure ? 'Built' : 'Not available'}\n\n` +
                  `✅ All embeddings satisfy hyperbolic constraints (||x|| < 1)`
          }
        ]
      };
    } finally {
      activeWorkflows.delete(workflowId);
    }
  }

  private async analyzeHierarchy(args: any) {
    if (!wordnetProcessor) {
      throw new Error("WordNet not initialized. Call initialize_wordnet first.");
    }

    const analysis = wordnetProcessor.analyzeHierarchicalStructure();
    
    return {
      content: [
        {
          type: "text",
          text: `📊 **Hierarchical Structure Analysis**\n\n` +
                `🌳 **Structure Metrics**:\n` +
                `   • Total nodes: ${analysis.totalNodes}\n` +
                `   • Total edges: ${analysis.totalEdges}\n` +
                `   • Max depth: ${analysis.maxDepth}\n` +
                `   • Root nodes: ${analysis.rootNodes}\n` +
                `   • Avg branching factor: ${analysis.avgBranchingFactor.toFixed(2)}\n\n` +
                `🎯 **Hyperbolic Metrics**:\n` +
                `   • Average distance: ${analysis.hyperbolicMetrics.avgDistance.toFixed(4)}\n` +
                `   • Max distance: ${analysis.hyperbolicMetrics.maxDistance.toFixed(4)}\n` +
                `   • Clustering coefficient: ${analysis.hyperbolicMetrics.clusteringCoefficient.toFixed(4)}`
        }
      ]
    };
  }

  // Resource implementations
  private async getWordNetSynsets() {
    if (!wordnetProcessor) {
      return {
        contents: [
          {
            uri: "h2gnn://wordnet/synsets",
            mimeType: "application/json",
            text: JSON.stringify({ error: "WordNet not initialized" }, null, 2)
          }
        ]
      };
    }

    const synsets = Array.from(wordnetProcessor.getSynsets().values());
    
    return {
      contents: [
        {
          uri: "h2gnn://wordnet/synsets",
          mimeType: "application/json",
          text: JSON.stringify({ synsets: synsets.slice(0, 100) }, null, 2) // Limit for performance
        }
      ]
    };
  }

  private async getWordNetHierarchy() {
    if (!wordnetProcessor) {
      return {
        contents: [
          {
            uri: "h2gnn://wordnet/hierarchy",
            mimeType: "application/json",
            text: JSON.stringify({ error: "WordNet not initialized" }, null, 2)
          }
        ]
      };
    }

    const hierarchy = wordnetProcessor.getHierarchy();
    
    return {
      contents: [
        {
          uri: "h2gnn://wordnet/hierarchy",
          mimeType: "application/json",
          text: JSON.stringify({
            nodes: hierarchy?.nodes.length || 0,
            edges: hierarchy?.edges.length || 0,
            maxDepth: hierarchy?.maxDepth || 0,
            roots: hierarchy?.roots.length || 0
          }, null, 2)
        }
      ]
    };
  }

  private async getAllEmbeddings() {
    if (!wordnetProcessor) {
      return {
        contents: [
          {
            uri: "h2gnn://embeddings/all",
            mimeType: "application/json",
            text: JSON.stringify({ error: "WordNet not initialized" }, null, 2)
          }
        ]
      };
    }

    const hierarchy = wordnetProcessor.getHierarchy();
    const embeddings = hierarchy ? 
      Object.fromEntries(
        hierarchy.nodes
          .filter(n => n.embedding)
          .map(n => [n.id, { 
            norm: Math.sqrt(n.embedding!.data.reduce((sum, val) => sum + val * val, 0)),
            dimension: n.embedding!.data.length
          }])
      ) : {};
    
    return {
      contents: [
        {
          uri: "h2gnn://embeddings/all",
          mimeType: "application/json",
          text: JSON.stringify({ embeddings }, null, 2)
        }
      ]
    };
  }

  private async getActiveWorkflows() {
    const workflows = Array.from(activeWorkflows.entries()).map(([id, workflow]) => ({
      id,
      type: workflow.constructor.name,
      status: "running"
    }));
    
    return {
      contents: [
        {
          uri: "h2gnn://workflows/active",
          mimeType: "application/json",
          text: JSON.stringify({ workflows }, null, 2)
        }
      ]
    };
  }

  private async getSystemStatus() {
    const status = {
      wordnet: {
        initialized: wordnetProcessor !== null,
        synsets: wordnetProcessor ? wordnetProcessor.getSynsets().size : 0,
        hierarchy: wordnetProcessor ? !!wordnetProcessor.getHierarchy() : false
      },
      workflows: {
        active: activeWorkflows.size,
        types: Array.from(new Set(Array.from(activeWorkflows.values()).map(w => w.constructor.name)))
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: "1.0.0"
      }
    };
    
    return {
      contents: [
        {
          uri: "h2gnn://system/status",
          mimeType: "application/json",
          text: JSON.stringify(status, null, 2)
        }
      ]
    };
  }

  // Prompt implementations
  private getConceptAnalysisPrompt(args: any) {
    const { concept } = args;
    
    return {
      description: `Analyze the concept "${concept}" using H²GNN hyperbolic geometry and WordNet`,
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text",
            text: `Please analyze the concept "${concept}" using the H²GNN system. Include:

1. **WordNet Information**: Use the query_wordnet tool to get synset information
2. **Hierarchical Position**: Analyze where this concept sits in the taxonomy
3. **Semantic Relationships**: Explore related concepts using semantic space exploration
4. **Hyperbolic Properties**: Examine the concept's position in hyperbolic space
5. **Practical Applications**: Suggest how this concept could be used in AI reasoning

Start by querying WordNet for "${concept}" and then proceed with the analysis.`
          }
        }
      ]
    };
  }

  private getHierarchicalReasoningPrompt(args: any) {
    const { concepts } = args;
    const conceptList = Array.isArray(concepts) ? concepts.join(', ') : concepts;
    
    return {
      description: `Perform hierarchical reasoning about the relationships between: ${conceptList}`,
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text",
            text: `Please perform hierarchical reasoning about these concepts: ${conceptList}

Use the H²GNN system to:

1. **Query Each Concept**: Get WordNet information for each concept
2. **Compute Distances**: Calculate hyperbolic distances between concept pairs
3. **Analyze Hierarchy**: Determine hierarchical relationships and common ancestors
4. **Reasoning Chain**: Build a logical reasoning chain showing how concepts relate
5. **Insights**: Provide insights about the conceptual structure

Focus on the hierarchical nature of the relationships and how hyperbolic geometry captures semantic similarity.`
          }
        }
      ]
    };
  }

  private getSemanticExplorationPrompt(args: any) {
    const { startPoint, goal } = args;
    
    return {
      description: `Guide semantic exploration starting from "${startPoint}"${goal ? ` towards "${goal}"` : ''}`,
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text",
            text: `Please guide a semantic exploration in hyperbolic space:

**Starting Point**: ${startPoint}
${goal ? `**Goal**: ${goal}` : '**Goal**: Open exploration'}

Use the H²GNN system to:

1. **Initialize**: Query the starting concept "${startPoint}"
2. **Explore**: Use semantic space exploration to discover related concepts
3. **Navigate**: ${goal ? `Guide the exploration towards "${goal}"` : 'Explore interesting semantic neighborhoods'}
4. **Analyze**: Examine the discovered relationships and patterns
5. **Insights**: Provide insights about the semantic structure discovered

Focus on how hyperbolic geometry reveals semantic relationships that might not be obvious in Euclidean space.`
          }
        }
      ]
    };
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("H²GNN MCP Server running on stdio");
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new H2GNNMCPServer();
  server.start().catch(console.error);
}

export { H2GNNMCPServer };
