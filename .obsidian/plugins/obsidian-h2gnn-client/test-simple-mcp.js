#!/usr/bin/env node

/**
 * Simple MCP server test to verify basic functionality
 */

const { spawn } = require('child_process');

async function testSimpleMCPServer() {
  return new Promise((resolve, reject) => {
    console.log('Testing simple MCP server...');
    
    // Create a simple MCP server for testing
    const simpleServer = `
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");

const server = new Server({
  name: "test-server",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "test_tool",
        description: "A test tool",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

const transport = new StdioServerTransport();
server.connect(transport);
console.log('Test MCP server running on stdio');
`;

    const process = spawn('node', ['-e', simpleServer], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        H2GNN_DEBUG: 'false',
        H2GNN_HEARTBEAT_INTERVAL: '0',
        H2GNN_SYNC_FREQUENCY: '0'
      }
    });

    let resolved = false;
    let output = '';

    process.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('Server output:', text);
      
      if (text.includes('running on stdio') || text.includes('Test MCP server running')) {
        if (!resolved) {
          resolved = true;
          console.log('✅ Simple MCP server is working');
          process.kill();
          resolve({ status: 'success', output });
        }
      }
    });

    process.stderr.on('data', (data) => {
      const error = data.toString();
      console.error('Server error:', error);
      
      if (!resolved && error.includes('Error')) {
        resolved = true;
        process.kill();
        resolve({ status: 'error', error });
      }
    });

    process.on('error', (error) => {
      console.error('Failed to start server:', error);
      if (!resolved) {
        resolved = true;
        resolve({ status: 'error', error: error.message });
      }
    });

    process.on('exit', (code) => {
      if (!resolved) {
        resolved = true;
        if (code === 0) {
          console.log('✅ Simple MCP server started successfully');
          resolve({ status: 'success', output });
        } else {
          resolve({ status: 'error', error: `Exited with code ${code}` });
        }
      }
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        process.kill();
        resolve({ status: 'timeout', error: 'Server startup timeout' });
      }
    }, 5000);
  });
}

async function testMCPDependencies() {
  console.log('🔍 Checking MCP dependencies...');
  
  try {
    const { spawn } = require('child_process');
    
    // Test if @modelcontextprotocol/sdk is available
    const testProcess = spawn('node', ['-e', 'console.log(require("@modelcontextprotocol/sdk/server/index.js"))'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    return new Promise((resolve) => {
      let output = '';
      
      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      testProcess.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      testProcess.on('exit', (code) => {
        if (code === 0) {
          console.log('✅ MCP SDK is available');
          resolve(true);
        } else {
          console.log('❌ MCP SDK not available:', output);
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.log('❌ MCP SDK not available:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing MCP server functionality...\n');
  
  // Check dependencies first
  const depsAvailable = await testMCPDependencies();
  if (!depsAvailable) {
    console.log('\n❌ MCP dependencies not available. Please install them:');
    console.log('npm install @modelcontextprotocol/sdk');
    return;
  }
  
  // Test simple MCP server
  const result = await testSimpleMCPServer();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  
  if (result.status === 'success') {
    console.log('✅ Basic MCP server functionality is working');
    console.log('💡 The issue might be with the H²GNN server imports or dependencies');
  } else {
    console.log('❌ Basic MCP server functionality failed:', result.error);
    console.log('💡 Please check MCP SDK installation and Node.js setup');
  }
}

main().catch(console.error);

