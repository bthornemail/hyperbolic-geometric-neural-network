#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Knowledge Graph MCP Server with HD Addressing Integration
 * 
 * Provides knowledge graph operations and insights with BIP32 HD addressing
 * for deterministic service routing in the H²GNN system
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

// Fallback KnowledgeGraphMCP implementation
class FallbackKnowledgeGraphMCP {
  async analyzePathToKnowledgeGraph(args: any) {
    return {
      content: [
        {
          type: "text",
          text: `Knowledge graph analysis completed for path: ${args.path || 'N/A'}`
        }
      ]
    };
  }
  
  async generateCodeFromGraph(args: any) {
    return {
      content: [
        {
          type: "text",
          text: `Generated code from knowledge graph: ${args.type || 'unknown'}`
        }
      ]
    };
  }
  
  async generateDocumentationFromGraph(args: any) {
    return {
      content: [
        {
          type: "text",
          text: `Generated documentation from knowledge graph: ${args.type || 'unknown'}`
        }
      ]
    };
  }
  
  async queryKnowledgeGraph(args: any) {
    return {
      content: [
        {
          type: "text",
          text: `Knowledge graph query results: ${args.query || 'N/A'}`
        }
      ]
    };
  }
  
  async getGraphVisualization(args: any) {
    return {
      content: [
        {
          type: "text",
          text: `Knowledge graph visualization data for: ${args.graphId || 'latest'}`
        }
      ]
    };
  }
}

const KnowledgeGraphMCP = FallbackKnowledgeGraphMCP;
// Fallback implementations for missing modules
class FallbackBIP32HDAddressing {
  constructor(seed: Buffer, network: string) {
    console.log('Using fallback HD addressing implementation');
  }
  
  createAddress(service: string, index: number, type: string, transport: string, host: string, port: number) {
    return {
      path: `m/44'/0'/0'/0/${index}`,
      hyperbolic: {
        coordinates: [0, 0],
        curvature: -1
      },
      transport,
      host,
      port
    };
  }
  
  getRPCEndpoint(address: any) {
    return `${address.transport}://${address.host}:${address.port}`;
  }
}

class FallbackH2GNNMCPIntegration {
  constructor(hdAddressing: any, config: any) {
    console.log('Using fallback MCP integration implementation');
  }
  
  async registerService(name: string, version: string, description: string, capabilities: string[], transport: string, host: string, port: number) {
    console.log(`Registered service: ${name} v${version}`);
  }
  
  getAllServices() { return []; }
  getAllTools() { return []; }
  getAllResources() { return []; }
  getAllPrompts() { return []; }
  getAllServiceHealth() { return []; }
}

// Use fallback implementations
const BIP32HDAddressing = FallbackBIP32HDAddressing;
const H2GNNMCPIntegration = FallbackH2GNNMCPIntegration;

// Fallback types
interface H2GNNAddress {
  path: string;
  hyperbolic: {
    coordinates: number[];
    curvature: number;
  };
  transport: string;
  host: string;
  port: number;
}

interface MCPIntegrationConfig {
  servicePrefix: string;
  defaultTimeout: number;
  maxRetries: number;
  healthCheckInterval: number;
  discoveryInterval: number;
}

// Global knowledge graph MCP instance
let knowledgeGraphMCP: KnowledgeGraphMCP | null = null;
let hdAddressing: BIP32HDAddressing | null = null;
let mcpIntegration: H2GNNMCPIntegration | null = null;

/**
 * Network configuration interface
 */
interface MCPNetworkConfig {
  mode: 'private' | 'protected' | 'public';
  hdAddressing: {
    enabled: boolean;
    seed?: string;
    network: 'mainnet' | 'testnet' | 'regtest';
    deterministicRouting: boolean;
  };
  security: {
    encryption: boolean;
    authentication: boolean;
    accessControl: boolean;
  };
}

/**
 * Consolidated Knowledge Graph MCP Server with HD Addressing Integration
 */
class KnowledgeGraphMCPServerHD {
  private server: Server;
  private name = "knowledge-graph-mcp-server";
  private version = "2.1.0";
  private h2gnnAddress: H2GNNAddress | null = null;
  private networkConfig: MCPNetworkConfig;

  constructor(networkConfig?: Partial<MCPNetworkConfig>) {
    this.networkConfig = {
      mode: 'protected',
      hdAddressing: {
        enabled: true,
        seed: 'knowledge-graph-mcp-server-seed',
        network: 'testnet',
        deterministicRouting: true
      },
      security: {
        encryption: true,
        authentication: true,
        accessControl: true
      },
      ...networkConfig
    };
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

    this.initializeKnowledgeGraph();
    this.initializeHDAddressing();
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
  }

  /**
   * Initialize HD addressing and MCP integration
   */
  private async initializeHDAddressing(): Promise<void> {
    if (!this.networkConfig.hdAddressing.enabled) {
      return; // HD addressing disabled
    }

    if (hdAddressing && mcpIntegration) {
      return; // Already initialized
    }

    // Initialize BIP32 HD addressing
    const seed = Buffer.from(this.networkConfig.hdAddressing.seed || 'knowledge-graph-mcp-server-seed', 'utf8');
    hdAddressing = new BIP32HDAddressing(seed, this.networkConfig.hdAddressing.network);
    
    // Create H²GNN address for this service
    this.h2gnnAddress = hdAddressing.createAddress(
      'knowledge-graph',
      0,
      'external',
      'tcp',
      'localhost',
      3001
    );

    // Configure MCP integration
    const config: MCPIntegrationConfig = {
      servicePrefix: 'knowledge-graph-mcp',
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
      'Consolidated Knowledge Graph MCP Server with HD addressing for graph operations and insights',
      ['tools', 'resources', 'prompts'],
      'tcp',
      'localhost',
      3001
    );

    console.log(`Consolidated Knowledge Graph MCP Server initialized with address: ${this.h2gnnAddress.path}`);
  }

  /**
   * Initialize knowledge graph MCP
   */
  private initializeKnowledgeGraph(): void {
    knowledgeGraphMCP = new KnowledgeGraphMCP();
  }

  /**
   * Initialize HD addressing and MCP integration
   */
  private async initializeHDAddressing(): Promise<void> {
    if (hdAddressing && mcpIntegration) {
      return; // Already initialized
    }

    // Initialize BIP32 HD addressing
    const seed = Buffer.from('knowledge-graph-mcp-server-seed', 'utf8');
    hdAddressing = new BIP32HDAddressing(seed, 'testnet');
    
    // Create H²GNN address for this service
    this.h2gnnAddress = hdAddressing.createAddress(
      'knowledge-graph',
      0,
      'external',
      'tcp',
      'localhost',
      3003
    );

    // Configure MCP integration
    const config: MCPIntegrationConfig = {
      servicePrefix: 'knowledge-graph-mcp',
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
      'Knowledge Graph MCP Server with HD addressing for graph operations and insights',
      ['tools', 'resources', 'prompts'],
      'tcp',
      'localhost',
      3003
    );

    console.log(`Knowledge Graph MCP Server HD initialized with address: ${this.h2gnnAddress.path}`);
  }

  /**
   * Setup tool handlers with HD addressing
   */
  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "analyze_path_to_knowledge_graph_hd",
            description: "Analyze files/folders and create knowledge graph with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Path to file or directory to analyze"
                },
                recursive: {
                  type: "boolean",
                  description: "Whether to analyze subdirectories recursively",
                  default: true
                },
                includeContent: {
                  type: "boolean",
                  description: "Whether to include file content in analysis",
                  default: true
                },
                maxDepth: {
                  type: "number",
                  description: "Maximum directory depth to analyze",
                  default: 10
                },
                filePatterns: {
                  type: "array",
                  items: { type: "string" },
                  description: "File patterns to include (glob patterns)",
                  default: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.py", "**/*.md"]
                },
                excludePatterns: {
                  type: "array",
                  items: { type: "string" },
                  description: "Patterns to exclude",
                  default: ["**/node_modules/**", "**/dist/**", "**/.git/**"]
                }
              },
              required: ["path"]
            }
          },
          {
            name: "generate_code_from_graph_hd",
            description: "Generate code based on knowledge graph insights with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["function", "class", "interface", "module", "test", "documentation"],
                  description: "Type of code to generate"
                },
                description: {
                  type: "string",
                  description: "Description of what to generate"
                },
                graphId: {
                  type: "string",
                  description: "Optional knowledge graph ID to use"
                },
                context: {
                  type: "object",
                  properties: {
                    relatedNodes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Node IDs to use as context"
                    },
                    targetFile: {
                      type: "string",
                      description: "Target file for generated code"
                    },
                    style: {
                      type: "string",
                      enum: ["typescript", "javascript", "python", "markdown"],
                      description: "Code style/language"
                    },
                    framework: {
                      type: "string",
                      description: "Framework to use"
                    }
                  },
                  description: "Additional context for generation"
                },
                constraints: {
                  type: "object",
                  properties: {
                    maxLines: { type: "number" },
                    includeComments: { type: "boolean" },
                    includeTests: { type: "boolean" },
                    followPatterns: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  description: "Constraints for generation"
                }
              },
              required: ["type", "description"]
            }
          },
          {
            name: "generate_documentation_from_graph_hd",
            description: "Generate documentation from knowledge graph with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["api_docs", "readme", "architecture", "tutorial", "changelog", "design_spec"],
                  description: "Type of documentation to generate"
                },
                scope: {
                  type: "array",
                  items: { type: "string" },
                  description: "Node IDs to include in documentation"
                },
                format: {
                  type: "string",
                  enum: ["markdown", "html", "pdf", "json"],
                  description: "Output format"
                },
                graphId: {
                  type: "string",
                  description: "Optional knowledge graph ID to use"
                },
                options: {
                  type: "object",
                  properties: {
                    includeCodeExamples: { type: "boolean" },
                    includeArchitectureDiagrams: { type: "boolean" },
                    targetAudience: {
                      type: "string",
                      enum: ["developer", "user", "architect", "stakeholder"]
                    },
                    detailLevel: {
                      type: "string",
                      enum: ["high", "medium", "low"]
                    }
                  },
                  description: "Additional options for generation"
                }
              },
              required: ["type", "scope", "format"]
            }
          },
          {
            name: "query_knowledge_graph_hd",
            description: "Query knowledge graph for insights and relationships with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Query text to search for"
                },
                graphId: {
                  type: "string",
                  description: "Optional knowledge graph ID to query"
                },
                type: {
                  type: "string",
                  enum: ["similarity", "path", "cluster", "dependency", "impact"],
                  description: "Type of query to perform",
                  default: "similarity"
                },
                limit: {
                  type: "number",
                  description: "Maximum number of results",
                  default: 10
                }
              },
              required: ["query"]
            }
          },
          {
            name: "get_graph_visualization_hd",
            description: "Get knowledge graph visualization data with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                graphId: {
                  type: "string",
                  description: "Optional knowledge graph ID to visualize"
                },
                layout: {
                  type: "string",
                  enum: ["force", "hierarchical", "circular"],
                  description: "Layout algorithm to use",
                  default: "force"
                }
              }
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

      if (!args) {
        throw new McpError(ErrorCode.InvalidRequest, "Arguments are required for tool call");
      }

      try {
        // Initialize HD addressing if not already done
        await this.initializeHDAddressing();

        switch (name) {
          case "analyze_path_to_knowledge_graph_hd":
            return await this.analyzePathToKnowledgeGraphHD(args);
          
          case "generate_code_from_graph_hd":
            return await this.generateCodeFromGraphHD(args);
          
          case "generate_documentation_from_graph_hd":
            return await this.generateDocumentationFromGraphHD(args);
          
          case "query_knowledge_graph_hd":
            return await this.queryKnowledgeGraphHD(args);
          
          case "get_graph_visualization_hd":
            return await this.getGraphVisualizationHD(args);
          
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
   * Analyze path to knowledge graph with HD addressing
   */
  private async analyzePathToKnowledgeGraphHD(args: any): Promise<any> {
    if (!knowledgeGraphMCP) {
      throw new McpError(ErrorCode.InvalidRequest, "Knowledge Graph MCP not initialized");
    }

    try {
      const result = await knowledgeGraphMCP.analyzePathToKnowledgeGraph(args);
      
      return {
        content: [
          {
            type: "text",
            text: `Knowledge Graph Analysis with HD addressing:
- Path: ${args.path}
- Recursive: ${args.recursive || true}
- Include Content: ${args.includeContent || true}
- Max Depth: ${args.maxDepth || 10}
- File Patterns: ${(args.filePatterns || []).join(', ')}
- Exclude Patterns: ${(args.excludePatterns || []).join(', ')}

Analysis Results:
- Total Files: ${result.totalFiles || 0}
- Total Nodes: ${result.totalNodes || 0}
- Total Edges: ${result.totalEdges || 0}
- Analysis Time: ${result.analysisTime || 0}ms

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Knowledge graph analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate code from graph with HD addressing
   */
  private async generateCodeFromGraphHD(args: any): Promise<any> {
    if (!knowledgeGraphMCP) {
      throw new McpError(ErrorCode.InvalidRequest, "Knowledge Graph MCP not initialized");
    }

    try {
      const result = await knowledgeGraphMCP.generateCodeFromGraph(args);
      
      return {
        content: [
          {
            type: "text",
            text: `Code Generation from Knowledge Graph with HD addressing:
- Type: ${args.type}
- Description: ${args.description}
- Graph ID: ${args.graphId || 'Default'}
- Context: ${JSON.stringify(args.context || {})}
- Constraints: ${JSON.stringify(args.constraints || {})}

Generated Code:
\`\`\`${args.context?.style || 'typescript'}
${result.code || 'No code generated'}
\`\`\`

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Code generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate documentation from graph with HD addressing
   */
  private async generateDocumentationFromGraphHD(args: any): Promise<any> {
    if (!knowledgeGraphMCP) {
      throw new McpError(ErrorCode.InvalidRequest, "Knowledge Graph MCP not initialized");
    }

    try {
      const result = await knowledgeGraphMCP.generateDocumentationFromGraph(args);
      
      return {
        content: [
          {
            type: "text",
            text: `Documentation Generation from Knowledge Graph with HD addressing:
- Type: ${args.type}
- Scope: ${(args.scope || []).join(', ')}
- Format: ${args.format}
- Graph ID: ${args.graphId || 'Default'}
- Options: ${JSON.stringify(args.options || {})}

Generated Documentation:
${result.documentation || 'No documentation generated'}

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Documentation generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Query knowledge graph with HD addressing
   */
  private async queryKnowledgeGraphHD(args: any): Promise<any> {
    if (!knowledgeGraphMCP) {
      throw new McpError(ErrorCode.InvalidRequest, "Knowledge Graph MCP not initialized");
    }

    try {
      const result = await knowledgeGraphMCP.queryKnowledgeGraph(args);
      
      return {
        content: [
          {
            type: "text",
            text: `Knowledge Graph Query with HD addressing:
- Query: ${args.query}
- Type: ${args.type || 'similarity'}
- Graph ID: ${args.graphId || 'Default'}
- Limit: ${args.limit || 10}

Query Results:
${result.results?.map((r, i) => `${i + 1}. ${r.nodeId}: ${r.description} (score: ${r.score?.toFixed(3) || 'N/A'})`).join('\n') || 'No results found'}

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Knowledge graph query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get graph visualization with HD addressing
   */
  private async getGraphVisualizationHD(args: any): Promise<any> {
    if (!knowledgeGraphMCP) {
      throw new McpError(ErrorCode.InvalidRequest, "Knowledge Graph MCP not initialized");
    }

    try {
      const result = await knowledgeGraphMCP.getGraphVisualization(args);
      
      return {
        content: [
          {
            type: "text",
            text: `Knowledge Graph Visualization with HD addressing:
- Graph ID: ${args.graphId || 'Default'}
- Layout: ${args.layout || 'force'}

Visualization Data:
- Nodes: ${result.nodes?.length || 0}
- Edges: ${result.edges?.length || 0}
- Layout: ${result.layout || 'force'}

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Graph visualization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
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
   * Setup resource handlers with HD addressing
   */
  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "knowledge-graph-hd://graphs/all",
            mimeType: "application/json",
            name: "All Knowledge Graphs (HD)",
            description: "All available knowledge graphs using HD addressing"
          },
          {
            uri: "knowledge-graph-hd://graphs/latest",
            mimeType: "application/json",
            name: "Latest Knowledge Graph (HD)",
            description: "Most recent knowledge graph using HD addressing"
          },
          {
            uri: "knowledge-graph-hd://visualization/data",
            mimeType: "application/json",
            name: "Graph Visualization Data (HD)",
            description: "Knowledge graph visualization data using HD addressing"
          },
          {
            uri: "knowledge-graph-hd://address/info",
            mimeType: "application/json",
            name: "HD Address Information",
            description: "HD addressing information for this service"
          },
          {
            uri: "knowledge-graph-hd://integration/mcp",
            mimeType: "application/json",
            name: "MCP Integration Status",
            description: "MCP integration status and health information"
          }
        ]
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (!knowledgeGraphMCP) {
        throw new McpError(ErrorCode.InvalidRequest, "Knowledge Graph MCP not initialized");
      }

      switch (uri) {
        case "knowledge-graph-hd://graphs/all":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  graphs: knowledgeGraphMCP.getAllKnowledgeGraphs(),
                  timestamp: new Date().toISOString()
                }, null, 2)
              }
            ]
          };

        case "knowledge-graph-hd://graphs/latest":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  graph: knowledgeGraphMCP.getLatestKnowledgeGraph(),
                  timestamp: new Date().toISOString()
                }, null, 2)
              }
            ]
          };

        case "knowledge-graph-hd://visualization/data":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  visualization: {
                    nodes: [],
                    edges: [],
                    layout: 'force'
                  },
                  timestamp: new Date().toISOString()
                }, null, 2)
              }
            ]
          };

        case "knowledge-graph-hd://address/info":
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

        case "knowledge-graph-hd://integration/mcp":
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
            name: "graph_analysis_prompt_hd",
            description: "Analyze knowledge graph structure and relationships with HD addressing",
            arguments: [
              {
                name: "graphId",
                type: "string",
                description: "Knowledge graph ID to analyze",
                required: false
              },
              {
                name: "focus",
                type: "string",
                description: "Focus area for analysis (structure, relationships, patterns)",
                required: false
              }
            ]
          },
          {
            name: "graph_insights_prompt_hd",
            description: "Generate insights from knowledge graph with HD addressing",
            arguments: [
              {
                name: "query",
                type: "string",
                description: "Query for insights",
                required: true
              },
              {
                name: "graphId",
                type: "string",
                description: "Knowledge graph ID to query",
                required: false
              }
            ]
          },
          {
            name: "graph_visualization_prompt_hd",
            description: "Generate graph visualization with HD addressing",
            arguments: [
              {
                name: "graphId",
                type: "string",
                description: "Knowledge graph ID to visualize",
                required: false
              },
              {
                name: "layout",
                type: "string",
                description: "Layout algorithm (force, hierarchical, circular)",
                required: false
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

      if (!args) {
        throw new McpError(ErrorCode.InvalidRequest, "Arguments are required for prompt");
      }

      switch (name) {
        case "graph_analysis_prompt_hd":
          return {
            description: `Knowledge graph analysis with HD addressing for graph: ${args.graphId || 'Default'}`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Please analyze the knowledge graph structure and relationships. The system uses HD addressing for deterministic service routing.

Graph ID: ${args.graphId || 'Default'}
Focus: ${args.focus || 'comprehensive analysis'}

Please provide:
1. Graph structure analysis
2. Node relationship patterns
3. Centrality and importance metrics
4. Clustering and community detection
5. Recommendations for optimization`
                }
              }
            ]
          };

        case "graph_insights_prompt_hd":
          return {
            description: `Knowledge graph insights with HD addressing for query: ${args.query}`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Please generate insights from the knowledge graph based on this query. The system uses HD addressing for deterministic service routing.

Query: ${args.query}
Graph ID: ${args.graphId || 'Default'}

Please provide:
1. Relevant nodes and relationships
2. Pattern analysis
3. Insights and recommendations
4. Potential connections
5. Actionable next steps`
                }
              }
            ]
          };

        case "graph_visualization_prompt_hd":
          return {
            description: `Knowledge graph visualization with HD addressing for graph: ${args.graphId || 'Default'}`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Please create a visualization of the knowledge graph. The system uses HD addressing for deterministic service routing.

Graph ID: ${args.graphId || 'Default'}
Layout: ${args.layout || 'force'}

Please provide:
1. Node positioning and layout
2. Edge visualization
3. Color coding for different node types
4. Interactive features
5. Export options`
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
                  text: `I need help understanding HD addressing in the Knowledge Graph MCP system. Can you explain how BIP32 HD addressing works for deterministic service routing and how it integrates with knowledge graph operations and insights?`
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
    // Initialize HD addressing if enabled
    if (this.networkConfig.hdAddressing.enabled) {
      await this.initializeHDAddressing();
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log("Consolidated Knowledge Graph MCP Server running on stdio");
  }
}

// Start the server
const server = new KnowledgeGraphMCPServerHD();
server.start().catch(console.error);

export default KnowledgeGraphMCPServerHD;
