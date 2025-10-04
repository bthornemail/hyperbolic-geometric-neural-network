#!/usr/bin/env node

/**
 * Minimal MCP server test
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

class MinimalMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "minimal-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "test_tool",
            description: "A test tool",
            inputSchema: {
              type: "object",
              properties: {
                message: { type: "string" }
              }
            }
          }
        ]
      };
    });

    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "test://resource",
            name: "Test Resource",
            description: "A test resource"
          }
        ]
      };
    });

    // List prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "test_prompt",
            description: "A test prompt"
          }
        ]
      };
    });

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (name === "test_tool") {
        return {
          content: [
            {
              type: "text",
              text: `Test tool called with: ${args.message || 'no message'}`
            }
          ]
        };
      }
      
      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Minimal MCP Server running on stdio");
  }
}

// Start the server
const server = new MinimalMCPServer();
server.start().catch(console.error);
