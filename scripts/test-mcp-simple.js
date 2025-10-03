#!/usr/bin/env node

/**
 * Simple test to verify MCP server is working
 */

import { spawn } from "child_process";

async function testMCPServer() {
  console.log("🧪 Testing MCP Server...");
  
  // Start the H²GNN MCP server
  const serverProcess = spawn('npx', ['tsx', 'src/mcp/h2gnn-mcp-server.ts'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Send a tools/list request
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  };

  console.log("📤 Sending tools/list request...");
  serverProcess.stdin.write(JSON.stringify(request) + '\n');

  // Wait for response
  let response = '';
  serverProcess.stdout.on('data', (data) => {
    response += data.toString();
    console.log("📥 Received response:", data.toString());
  });

  // Wait a bit for response
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Clean up
  serverProcess.kill();
  
  console.log("✅ Test completed");
}

testMCPServer().catch(console.error);
