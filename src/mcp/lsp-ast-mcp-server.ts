#!/usr/bin/env tsx

/**
 * LSP + AST + MCP Server with HD Addressing Integration
 * 
 * A complete MCP server that provides LSP and AST analysis capabilities
 * with BIP32 HD addressing for deterministic service routing.
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

import EnhancedH2GNN from '../core/enhanced-h2gnn.js';
import { AdvancedASTAnalyzer } from '../analysis/advanced-ast-analyzer.js';
import { AutomatedRefactoringTool } from '../refactoring/automated-refactoring-tool.js';
import { CentralizedH2GNNManager, CentralizedH2GNNConfig } from '../core/centralized-h2gnn-config.js';
import { BIP32HDAddressing, H2GNNAddress } from '../core/native-protocol.js';
import { H2GNNMCPIntegration, MCPIntegrationConfig } from '../core/mcp-hd-integration.js';
import * as ts from 'typescript';
import { parse } from '@babel/parser';

interface LSPCapabilities {
  completion: boolean;
  hover: boolean;
  definition: boolean;
  references: boolean;
  rename: boolean;
  codeAction: boolean;
  diagnostics: boolean;
}

interface ASTAnalysis {
  nodes: any[];
  patterns: string[];
  violations: string[];
  suggestions: string[];
  quality: number;
}

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
 * Consolidated LSP/AST MCP Server with HD Addressing Integration
 */
class LSPASTMCPServerHD {
  private server: Server;
  private h2gnn!: EnhancedH2GNN;
  private astAnalyzer: AdvancedASTAnalyzer;
  private refactoringTool: AutomatedRefactoringTool;
  private capabilities: LSPCapabilities;
  private hdAddressing: BIP32HDAddressing | null = null;
  private mcpIntegration: H2GNNMCPIntegration | null = null;
  private h2gnnAddress: H2GNNAddress | null = null;
  private networkConfig: MCPNetworkConfig;

  constructor(networkConfig?: Partial<MCPNetworkConfig>) {
    this.networkConfig = {
      mode: 'protected',
      hdAddressing: {
        enabled: true,
        seed: 'lsp-ast-mcp-server-seed',
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
        name: "lsp-ast-mcp-server-hd",
        version: "1.1.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.capabilities = {
      completion: true,
      hover: true,
      definition: true,
      references: true,
      rename: true,
      codeAction: true,
      diagnostics: true,
    };

    this.initializeH2GNN();
    this.initializeHDAddressing();
    // Initialize analyzers after H²GNN is set up
    this.astAnalyzer = new AdvancedASTAnalyzer();
    this.refactoringTool = new AutomatedRefactoringTool();
    this.setupHandlers();
  }

  private initializeH2GNN(): void {
    const config: CentralizedH2GNNConfig = {
      embeddingDim: 64,
      numLayers: 3,
      curvature: -1,
      storagePath: './persistence',
      maxMemories: 10000,
      consolidationThreshold: 50,
      retrievalStrategy: 'hybrid',
      compressionEnabled: true,
      learningRate: 0.01,
      batchSize: 32,
      maxEpochs: 100
    };

    // Initialize the centralized H²GNN manager
    const manager = CentralizedH2GNNManager.getInstance(config);
    this.h2gnn = manager.getH2GNN();
  }

  private async initializeHDAddressing(): Promise<void> {
    if (this.hdAddressing && this.mcpIntegration) {
      return; // Already initialized
    }

    // Initialize BIP32 HD addressing
    const seed = Buffer.from('lsp-ast-mcp-server-seed', 'utf8');
    this.hdAddressing = new BIP32HDAddressing(seed, 'testnet');
    
    // Create H²GNN address for this service
    this.h2gnnAddress = this.hdAddressing.createAddress(
      'lsp-ast',
      0,
      'external',
      'tcp',
      'localhost',
      3002
    );

    // Configure MCP integration
    const config: MCPIntegrationConfig = {
      servicePrefix: 'lsp-ast-mcp',
      defaultTimeout: 30000,
      maxRetries: 3,
      healthCheckInterval: 60000,
      discoveryInterval: 300000
    };

    this.mcpIntegration = new H2GNNMCPIntegration(this.hdAddressing, config);

    // Register this service
    await this.mcpIntegration.registerService(
      'lsp-ast-mcp-server-hd',
      '1.1.0',
      'LSP AST MCP Server with HD addressing for code analysis and assistance',
      ['tools', 'resources', 'prompts'],
      'tcp',
      'localhost',
      3002
    );

    // LSP AST MCP Server HD initialized with address: ${this.h2gnnAddress.path}
  }

  private setupHandlers(): void {
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "analyze_code_ast_hd",
            description: "Analyze code using Abstract Syntax Tree with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "Code to analyze"
                },
                language: {
                  type: "string",
                  description: "Programming language",
                  default: "typescript"
                },
                filePath: {
                  type: "string",
                  description: "Optional file path for context"
                }
              },
              required: ["code"]
            },
            metadata: {
              priority: 7,
              category: "code_analysis",
              useCases: [
                "Deep code understanding",
                "Syntax analysis and parsing",
                "Code structure examination"
              ],
              commonMistakes: [
                "Not analyzing code syntax",
                "Skipping AST analysis",
                "Not understanding code structure"
              ],
              context: "Essential for deep code comprehension"
            }
          },
          {
            name: "provide_completion_hd",
            description: "Provide intelligent code completion suggestions using LSP with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "Code context"
                },
                position: {
                  type: "object",
                  properties: {
                    line: { type: "number" },
                    character: { type: "number" }
                  },
                  description: "Cursor position"
                },
                language: {
                  type: "string",
                  description: "Programming language",
                  default: "typescript"
                }
              },
              required: ["code", "position"]
            }
          },
          {
            name: "provide_hover_hd",
            description: "Provide hover information for symbols at a specific position with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "Code context"
                },
                position: {
                  type: "object",
                  properties: {
                    line: { type: "number" },
                    character: { type: "number" }
                  },
                  description: "Hover position"
                },
                language: {
                  type: "string",
                  description: "Programming language",
                  default: "typescript"
                }
              },
              required: ["code", "position"]
            }
          },
          {
            name: "provide_diagnostics_hd",
            description: "Analyze code and provide diagnostic information with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "Code to analyze"
                },
                language: {
                  type: "string",
                  description: "Programming language",
                  default: "typescript"
                },
                filePath: {
                  type: "string",
                  description: "Optional file path for context"
                }
              },
              required: ["code"]
            }
          },
          {
            name: "provide_code_actions_hd",
            description: "Provide code actions (quick fixes, refactorings) for a given range with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "Code context"
                },
                range: {
                  type: "object",
                  properties: {
                    start: {
                      type: "object",
                      properties: {
                        line: { type: "number" },
                        character: { type: "number" }
                      }
                    },
                    end: {
                      type: "object",
                      properties: {
                        line: { type: "number" },
                        character: { type: "number" }
                      }
                    }
                  },
                  description: "Code range for actions"
                },
                language: {
                  type: "string",
                  description: "Programming language",
                  default: "typescript"
                }
              },
              required: ["code", "range"]
            }
          },
          {
            name: "advanced_code_analysis_hd",
            description: "Perform advanced code analysis with cognitive complexity, code smells, and anti-patterns using HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "Code to analyze"
                },
                language: {
                  type: "string",
                  description: "Programming language",
                  default: "typescript"
                },
                filePath: {
                  type: "string",
                  description: "Optional file path for context"
                }
              },
              required: ["code"]
            }
          },
          {
            name: "propose_and_apply_refactoring_hd",
            description: "Propose and optionally apply automated refactoring suggestions with HD addressing",
            inputSchema: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "Code to refactor"
                },
                language: {
                  type: "string",
                  description: "Programming language",
                  default: "typescript"
                },
                filePath: {
                  type: "string",
                  description: "Optional file path for context"
                },
                autoApply: {
                  type: "boolean",
                  description: "Whether to automatically apply refactoring",
                  default: false
                }
              },
              required: ["code"]
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
          case "analyze_code_ast_hd":
            return await this.analyzeCodeASTHD(args);
          
          case "provide_completion_hd":
            return await this.provideCompletionHD(args);
          
          case "provide_hover_hd":
            return await this.provideHoverHD(args);
          
          case "provide_diagnostics_hd":
            return await this.provideDiagnosticsHD(args);
          
          case "provide_code_actions_hd":
            return await this.provideCodeActionsHD(args);
          
          case "advanced_code_analysis_hd":
            return await this.advancedCodeAnalysisHD(args);
          
          case "propose_and_apply_refactoring_hd":
            return await this.proposeAndApplyRefactoringHD(args);
          
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

  private async analyzeCodeASTHD(args: any): Promise<any> {
    const { code, language = 'typescript', filePath } = args;
    
    try {
      const analysis = await this.astAnalyzer.analyzeCode(code, language, filePath);
      
      return {
        content: [
          {
            type: "text",
            text: `Code AST Analysis with HD addressing:
- Language: ${language}
- File Path: ${filePath || 'N/A'}
- Total Nodes: ${analysis.nodes.length}
- Patterns Found: ${analysis.patterns.length}
- Violations: ${analysis.violations.length}
- Suggestions: ${analysis.suggestions.length}
- Quality Score: ${analysis.quality.toFixed(2)}/10

Patterns:
${analysis.patterns.map(p => `- ${p}`).join('\n')}

Violations:
${analysis.violations.map(v => `- ${v}`).join('\n')}

Suggestions:
${analysis.suggestions.map(s => `- ${s}`).join('\n')}

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `AST analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async provideCompletionHD(args: any): Promise<any> {
    const { code, position, language = 'typescript' } = args;
    
    try {
      const completions = await this.astAnalyzer.provideCompletion(code, position, language);
      
      return {
        content: [
          {
            type: "text",
            text: `Code Completion with HD addressing:
- Language: ${language}
- Position: Line ${position.line}, Character ${position.character}
- Completions: ${completions.length}

Suggestions:
${completions.map((c, i) => `${i + 1}. ${c.label} - ${c.detail || 'No description'}`).join('\n')}

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Completion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async provideHoverHD(args: any): Promise<any> {
    const { code, position, language = 'typescript' } = args;
    
    try {
      const hover = await this.astAnalyzer.provideHover(code, position, language);
      
      return {
        content: [
          {
            type: "text",
            text: `Hover Information with HD addressing:
- Language: ${language}
- Position: Line ${position.line}, Character ${position.character}
- Symbol: ${hover.symbol || 'Unknown'}
- Type: ${hover.type || 'Unknown'}
- Description: ${hover.description || 'No description available'}

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Hover failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async provideDiagnosticsHD(args: any): Promise<any> {
    const { code, language = 'typescript', filePath } = args;
    
    try {
      const diagnostics = await this.astAnalyzer.provideDiagnostics(code, language, filePath);
      
      return {
        content: [
          {
            type: "text",
            text: `Code Diagnostics with HD addressing:
- Language: ${language}
- File Path: ${filePath || 'N/A'}
- Total Issues: ${diagnostics.length}

Issues:
${diagnostics.map((d, i) => `${i + 1}. [${d.severity}] ${d.message} (Line ${d.range.start.line}:${d.range.start.character})`).join('\n')}

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Diagnostics failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async provideCodeActionsHD(args: any): Promise<any> {
    const { code, range, language = 'typescript' } = args;
    
    try {
      const actions = await this.astAnalyzer.provideCodeActions(code, range, language);
      
      return {
        content: [
          {
            type: "text",
            text: `Code Actions with HD addressing:
- Language: ${language}
- Range: Line ${range.start.line}:${range.start.character} to ${range.end.line}:${range.end.character}
- Actions: ${actions.length}

Available Actions:
${actions.map((a, i) => `${i + 1}. ${a.title} - ${a.description || 'No description'}`).join('\n')}

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Code actions failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async advancedCodeAnalysisHD(args: any): Promise<any> {
    const { code, language = 'typescript', filePath } = args;
    
    try {
      const analysis = await this.astAnalyzer.advancedCodeAnalysis(code, language, filePath);
      
      return {
        content: [
          {
            type: "text",
            text: `Advanced Code Analysis with HD addressing:
- Language: ${language}
- File Path: ${filePath || 'N/A'}
- Cognitive Complexity: ${analysis.cognitiveComplexity}
- Code Smells: ${analysis.codeSmells.length}
- Anti-patterns: ${analysis.antiPatterns.length}
- Maintainability Index: ${analysis.maintainabilityIndex.toFixed(2)}

Code Smells:
${analysis.codeSmells.map(s => `- ${s.type}: ${s.description}`).join('\n')}

Anti-patterns:
${analysis.antiPatterns.map(a => `- ${a.type}: ${a.description}`).join('\n')}

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Advanced analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async proposeAndApplyRefactoringHD(args: any): Promise<any> {
    const { code, language = 'typescript', filePath, autoApply = false } = args;
    
    try {
      const refactoring = await this.refactoringTool.proposeAndApplyRefactoring(code, language, filePath, autoApply);
      
      return {
        content: [
          {
            type: "text",
            text: `Refactoring with HD addressing:
- Language: ${language}
- File Path: ${filePath || 'N/A'}
- Auto Apply: ${autoApply}
- Suggestions: ${refactoring.suggestions.length}
- Applied: ${refactoring.applied ? 'Yes' : 'No'}

Refactoring Suggestions:
${refactoring.suggestions.map((s, i) => `${i + 1}. ${s.type}: ${s.description}`).join('\n')}

${refactoring.applied ? `Applied Changes:
${refactoring.changes.map(c => `- ${c.description}`).join('\n')}` : ''}

- H²GNN Address: ${this.h2gnnAddress?.path}
- RPC Endpoint: ${this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Refactoring failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getHDAddressInfo(args: any): Promise<any> {
    if (!this.h2gnnAddress || !this.hdAddressing) {
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
- RPC Endpoint: ${this.hdAddressing.getRPCEndpoint(this.h2gnnAddress)}
- Hyperbolic Coordinates: [${this.h2gnnAddress.hyperbolic.coordinates[0].toFixed(4)}, ${this.h2gnnAddress.hyperbolic.coordinates[1].toFixed(4)}]
- Curvature: ${this.h2gnnAddress.hyperbolic.curvature}
- Transport: ${this.h2gnnAddress.transport}
- Host: ${this.h2gnnAddress.host}
- Port: ${this.h2gnnAddress.port}`
        }
      ]
    };
  }

  private async getMCPIntegrationStatus(args: any): Promise<any> {
    if (!this.mcpIntegration) {
      return {
        content: [
          {
            type: "text",
            text: "MCP integration not initialized"
          }
        ]
      };
    }

    const services = this.mcpIntegration.getAllServices();
    const tools = this.mcpIntegration.getAllTools();
    const resources = this.mcpIntegration.getAllResources();
    const prompts = this.mcpIntegration.getAllPrompts();
    const health = this.mcpIntegration.getAllServiceHealth();

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
RPC Endpoint: ${this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A'}`
        }
      ]
    };
  }

  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "lsp-ast-hd://analysis/results",
            mimeType: "application/json",
            name: "LSP AST Analysis Results (HD)",
            description: "Latest LSP and AST analysis results using HD addressing"
          },
          {
            uri: "lsp-ast-hd://diagnostics/all",
            mimeType: "application/json",
            name: "All Diagnostics (HD)",
            description: "All diagnostic information using HD addressing"
          },
          {
            uri: "lsp-ast-hd://refactoring/suggestions",
            mimeType: "application/json",
            name: "Refactoring Suggestions (HD)",
            description: "Available refactoring suggestions using HD addressing"
          },
          {
            uri: "lsp-ast-hd://address/info",
            mimeType: "application/json",
            name: "HD Address Information",
            description: "HD addressing information for this service"
          },
          {
            uri: "lsp-ast-hd://integration/mcp",
            mimeType: "application/json",
            name: "MCP Integration Status",
            description: "MCP integration status and health information"
          }
        ]
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case "lsp-ast-hd://analysis/results":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  capabilities: this.capabilities,
                  timestamp: new Date().toISOString()
                }, null, 2)
              }
            ]
          };

        case "lsp-ast-hd://diagnostics/all":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  diagnostics: [],
                  timestamp: new Date().toISOString()
                }, null, 2)
              }
            ]
          };

        case "lsp-ast-hd://refactoring/suggestions":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  suggestions: [],
                  timestamp: new Date().toISOString()
                }, null, 2)
              }
            ]
          };

        case "lsp-ast-hd://address/info":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
                  hyperbolicCoordinates: this.h2gnnAddress?.hyperbolic.coordinates,
                  curvature: this.h2gnnAddress?.hyperbolic.curvature,
                  transport: this.h2gnnAddress?.transport,
                  host: this.h2gnnAddress?.host,
                  port: this.h2gnnAddress?.port
                }, null, 2)
              }
            ]
          };

        case "lsp-ast-hd://integration/mcp":
          if (!this.mcpIntegration) {
            throw new McpError(ErrorCode.InvalidRequest, "MCP integration not initialized");
          }
          
          const services = this.mcpIntegration.getAllServices();
          const tools = this.mcpIntegration.getAllTools();
          const resources = this.mcpIntegration.getAllResources();
          const prompts = this.mcpIntegration.getAllPrompts();
          const health = this.mcpIntegration.getAllServiceHealth();

          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  h2gnnAddress: this.h2gnnAddress?.path,
                  rpcEndpoint: this.h2gnnAddress ? this.hdAddressing?.getRPCEndpoint(this.h2gnnAddress) : 'N/A',
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

  private setupPromptHandlers(): void {
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "code_review_prompt_hd",
            description: "Generate code review suggestions with HD addressing",
            arguments: [
              {
                name: "code",
                type: "string",
                description: "Code to review",
                required: true
              },
              {
                name: "language",
                type: "string",
                description: "Programming language",
                required: false
              }
            ]
          },
          {
            name: "refactoring_suggestions_prompt_hd",
            description: "Generate refactoring suggestions with HD addressing",
            arguments: [
              {
                name: "code",
                type: "string",
                description: "Code to refactor",
                required: true
              },
              {
                name: "language",
                type: "string",
                description: "Programming language",
                required: false
              }
            ]
          },
          {
            name: "architecture_analysis_prompt_hd",
            description: "Analyze code architecture with HD addressing",
            arguments: [
              {
                name: "code",
                type: "string",
                description: "Code to analyze",
                required: true
              },
              {
                name: "language",
                type: "string",
                description: "Programming language",
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
        case "code_review_prompt_hd":
          return {
            description: `Code review for ${args.language || 'TypeScript'} code with HD addressing`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Please review this ${args.language || 'TypeScript'} code and provide suggestions for improvement. The system uses HD addressing for deterministic service routing.

Code:
\`\`\`${args.language || 'typescript'}
${args.code}
\`\`\`

Please provide:
1. Code quality assessment
2. Potential issues and bugs
3. Performance improvements
4. Best practices recommendations
5. Security considerations`
                }
              }
            ]
          };

        case "refactoring_suggestions_prompt_hd":
          return {
            description: `Refactoring suggestions for ${args.language || 'TypeScript'} code with HD addressing`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Please analyze this ${args.language || 'TypeScript'} code and provide refactoring suggestions. The system uses HD addressing for deterministic service routing.

Code:
\`\`\`${args.language || 'typescript'}
${args.code}
\`\`\`

Please provide:
1. Code structure improvements
2. Performance optimizations
3. Readability enhancements
4. Maintainability improvements
5. Specific refactoring techniques to apply`
                }
              }
            ]
          };

        case "architecture_analysis_prompt_hd":
          return {
            description: `Architecture analysis for ${args.language || 'TypeScript'} code with HD addressing`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Please analyze the architecture of this ${args.language || 'TypeScript'} code. The system uses HD addressing for deterministic service routing.

Code:
\`\`\`${args.language || 'typescript'}
${args.code}
\`\`\`

Please provide:
1. Architectural patterns identified
2. Design principles adherence
3. Coupling and cohesion analysis
4. Scalability considerations
5. Integration points and dependencies
6. Recommendations for improvement`
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
                  text: `I need help understanding HD addressing in the LSP AST MCP system. Can you explain how BIP32 HD addressing works for deterministic service routing and how it integrates with code analysis and LSP capabilities?`
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
    // LSP AST MCP Server HD running on stdio
  }
}

// Start the server
const server = new LSPASTMCPServerHD();
server.start().catch(console.error);

export default LSPASTMCPServerHD;
