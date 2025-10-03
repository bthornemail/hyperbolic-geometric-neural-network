#!/usr/bin/env node

/**
 * Direct test of MCP server functionality
 */

import { spawn } from "child_process";

async function testMCPServer() {
  console.log("🧪 Testing MCP Server directly...");
  
  // Start the H²GNN MCP server
  const serverProcess = spawn('npx', ['tsx', 'src/mcp/h2gnn-mcp-server.ts'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });

  // Handle server output
  serverProcess.stderr.on('data', (data) => {
    console.log("Server:", data.toString().trim());
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test tools/list
  console.log("\n🔧 Testing tools/list...");
  const toolsRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  };

  serverProcess.stdin.write(JSON.stringify(toolsRequest) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test resources/list
  console.log("\n📚 Testing resources/list...");
  const resourcesRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "resources/list",
    params: {}
  };

  serverProcess.stdin.write(JSON.stringify(resourcesRequest) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test prompts/list
  console.log("\n💬 Testing prompts/list...");
  const promptsRequest = {
    jsonrpc: "2.0",
    id: 3,
    method: "prompts/list",
    params: {}
  };

  serverProcess.stdin.write(JSON.stringify(promptsRequest) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Clean up
  serverProcess.kill();
  
  console.log("\n✅ Direct test completed");
}

testMCPServer().catch(console.error);
