#!/usr/bin/env node

/**
 * Test script to verify H²GNN MCP server connections
 */

const { spawn } = require('child_process');
const path = require('path');

const servers = [
  { name: 'h2gnn', path: '/home/main/devops/hyperbolic-geometric-neural-network/src/mcp/h2gnn-mcp-server.ts' },
  { name: 'knowledge-graph', path: '/home/main/devops/hyperbolic-geometric-neural-network/src/mcp/knowledge-graph-mcp-server.ts' },
  { name: 'lsp-ast', path: '/home/main/devops/hyperbolic-geometric-neural-network/src/mcp/lsp-ast-mcp-server.ts' },
  { name: 'geometric-tools', path: '/home/main/devops/hyperbolic-geometric-neural-network/src/mcp/geometric-tools-mcp-server.ts' }
];

async function testServer(server) {
  return new Promise((resolve, reject) => {
    console.log(`Testing ${server.name} server at ${server.path}`);
    
    const process = spawn('npx', ['tsx', server.path], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: '/home/main/devops/hyperbolic-geometric-neural-network',
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
      console.log(`${server.name} output:`, text);
      
      if (text.includes('running on stdio') || text.includes('MCP server started')) {
        if (!resolved) {
          resolved = true;
          console.log(`✅ ${server.name} server is working`);
          process.kill();
          resolve({ name: server.name, status: 'success', output });
        }
      }
    });

    process.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`${server.name} error:`, error);
      
      if (!resolved && error.includes('Error') && !error.includes('warning')) {
        resolved = true;
        process.kill();
        resolve({ name: server.name, status: 'error', error });
      }
    });

    process.on('error', (error) => {
      console.error(`Failed to start ${server.name} server:`, error);
      if (!resolved) {
        resolved = true;
        resolve({ name: server.name, status: 'error', error: error.message });
      }
    });

    process.on('exit', (code) => {
      if (!resolved) {
        resolved = true;
        if (code === 0) {
          console.log(`✅ ${server.name} server started successfully (exit code 0)`);
          resolve({ name: server.name, status: 'success', output });
        } else {
          resolve({ name: server.name, status: 'error', error: `Exited with code ${code}` });
        }
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        process.kill();
        resolve({ name: server.name, status: 'timeout', error: 'Server startup timeout' });
      }
    }, 10000);
  });
}

async function testAllServers() {
  console.log('🧪 Testing H²GNN MCP servers...\n');
  
  const results = [];
  
  for (const server of servers) {
    try {
      const result = await testServer(server);
      results.push(result);
      console.log(`\n--- ${server.name} test completed ---\n`);
    } catch (error) {
      results.push({ name: server.name, status: 'error', error: error.message });
      console.error(`\n--- ${server.name} test failed: ${error.message} ---\n`);
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status !== 'success');
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  successful.forEach(r => console.log(`  - ${r.name}`));
  
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    failed.forEach(r => console.log(`  - ${r.name}: ${r.error}`));
  }
  
  console.log('\n💡 Recommendations:');
  if (successful.length === results.length) {
    console.log('🎉 All servers are working! The Obsidian plugin should work correctly.');
  } else if (successful.length > 0) {
    console.log('⚠️ Some servers are working. The plugin will work with limited functionality.');
    console.log('💡 Try restarting the failed servers or check for missing dependencies.');
  } else {
    console.log('❌ No servers are working. Please check:');
    console.log('  1. Ensure you are in the correct directory');
    console.log('  2. Check that all MCP server files exist');
    console.log('  3. Verify Node.js and npm are installed');
    console.log('  4. Check for any missing dependencies');
  }
}

// Run the tests
testAllServers().catch(console.error);

