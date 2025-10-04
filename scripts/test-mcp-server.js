#!/usr/bin/env node

/**
 * Test script to verify MCP server functionality
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

async function testMCPServer() {
  console.log("🧪 Testing MCP Server...");
  
  // Start the H²GNN MCP server
  const serverProcess = spawn('npx', ['tsx', 'src/mcp/h2gnn-mcp-server.ts'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Create client transport
  const transport = new StdioClientTransport({
    reader: serverProcess.stdout!,
    writer: serverProcess.stdin!
  });

  // Create MCP client
  const client = new Client({
    name: "test-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  try {
    // Connect to the server
    await client.connect(transport);
    console.log("✅ Connected to MCP server");

    // Test tools
    console.log("\n🔧 Testing Tools...");
    const tools = await client.listTools();
    console.log(`Found ${tools.tools.length} tools:`);
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });

    // Test resources
    console.log("\n📚 Testing Resources...");
    const resources = await client.listResources();
    console.log(`Found ${resources.resources.length} resources:`);
    resources.resources.forEach(resource => {
      console.log(`  - ${resource.name}: ${resource.description}`);
    });

    // Test prompts
    console.log("\n💬 Testing Prompts...");
    const prompts = await client.listPrompts();
    console.log(`Found ${prompts.prompts.length} prompts:`);
    prompts.prompts.forEach(prompt => {
      console.log(`  - ${prompt.name}: ${prompt.description}`);
    });

    console.log("\n✅ MCP Server test completed successfully!");
    
  } catch (error) {
    console.error("❌ Error testing MCP server:", error);
  } finally {
    // Clean up
    serverProcess.kill();
    await client.close();
  }
}

testMCPServer().catch(console.error);
