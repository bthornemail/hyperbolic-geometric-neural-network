# H²GNN Obsidian Plugin - Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to connect to local agent runtime" Error

**Problem**: The plugin shows "Failed to connect to local agent runtime" when trying to use H²GNN features.

**Root Cause**: The plugin is trying to connect to the old "local agent runtime" instead of the new H²GNN MCP servers.

**Solution**:
1. The plugin has been updated to use H²GNN MCP servers instead of the old runtime
2. Make sure the H²GNN MCP servers are running
3. Use the new H²GNN commands instead of the old agent runtime commands

### 2. H²GNN MCP Servers Not Starting

**Problem**: MCP servers fail to start with "Cannot access 'process' before initialization" error.

**Root Cause**: There are issues with the MCP server code or dependencies.

**Solutions**:

#### Option A: Start Servers Manually
```bash
cd /home/main/devops/hyperbolic-geometric-neural-network

# Start each server in a separate terminal
npx tsx src/mcp/h2gnn-mcp-server.ts
npx tsx src/mcp/knowledge-graph-mcp-server.ts
npx tsx src/mcp/lsp-ast-mcp-server.ts
npx tsx src/mcp/geometric-tools-mcp-server.ts
```

#### Option B: Use the Startup Script
```bash
cd /home/main/devops/hyperbolic-geometric-neural-network/.obsidian/plugins/obsidian-h2gnn-client
./start-h2gnn-servers.sh
```

#### Option C: Check Dependencies
```bash
cd /home/main/devops/hyperbolic-geometric-neural-network
npm install
```

### 3. Plugin Commands Not Working

**Problem**: H²GNN commands in Obsidian don't work or show errors.

**Solutions**:

1. **Check Plugin Status**:
   - Go to Settings → Community Plugins
   - Ensure "H²GNN Client" is enabled
   - Check for any error messages

2. **Test Connection**:
   - Use the "🔌 Test H²GNN Connection" command
   - Check the console for error messages

3. **Restart Plugin**:
   - Disable the plugin
   - Re-enable the plugin
   - Reload Obsidian

### 4. MCP Server Connection Issues

**Problem**: Plugin can't connect to MCP servers.

**Solutions**:

1. **Check Server Status**:
   ```bash
   ps aux | grep mcp-server
   ```

2. **Start Servers**:
   ```bash
   cd /home/main/devops/hyperbolic-geometric-neural-network
   ./start-h2gnn-servers.sh
   ```

3. **Check Server Logs**:
   - Look at the console output when starting servers
   - Check for error messages

### 5. Limited Functionality Mode

**Problem**: Plugin works but with limited functionality.

**Cause**: MCP servers are not running or not fully connected.

**Solutions**:

1. **Start MCP Servers**:
   - Use the startup script or start manually
   - Ensure all servers are running

2. **Check Connection**:
   - Use "🔌 Test H²GNN Connection" command
   - Verify servers are responding

3. **Restart Plugin**:
   - Disable and re-enable the plugin
   - Try the connection test again

## Debugging Steps

### 1. Check Plugin Logs
1. Open Obsidian
2. Go to Settings → Advanced → Developer Tools
3. Open Console tab
4. Look for H²GNN related messages

### 2. Check MCP Server Logs
1. Start servers manually to see output
2. Check for error messages
3. Verify all dependencies are installed

### 3. Test Individual Components
1. Test MCP servers individually
2. Test plugin connection
3. Test specific H²GNN features

## Available Commands

### H²GNN Commands
- **🤖 H²GNN Agentic Coding**: Main interface for all operations
- **🧠 H²GNN Knowledge Graph**: Knowledge graph operations
- **⚡ Generate Code with H²GNN**: Generate code based on active file
- **🔍 Analyze Code with H²GNN**: Analyze active file
- **🔧 Refactor Code with H²GNN**: Refactor code
- **📚 Generate Documentation with H²GNN**: Generate documentation
- **🧠 Query Knowledge Graph**: Query knowledge graph
- **📊 Get Learning Progress**: View learning progress
- **🔍 Get System Status**: Check system status
- **🧠 Consolidate Memories**: Consolidate learning memories
- **🔌 Test H²GNN Connection**: Test connection status
- **🚀 Start H²GNN MCP Servers**: Start MCP servers
- **🛑 Stop H²GNN MCP Servers**: Stop MCP servers

### Legacy Commands (Still Available)
- **Connect to local agent runtime**: Legacy connection (deprecated)
- **Create new agent vault**: Create agent vault
- **Execute shell command**: Execute shell commands
- **Manage Agent Identity**: Manage agent identity
- **Push context to agent**: Push context to agent
- **Wikify document**: Wikify document
- **Verify node history**: Verify node history
- **Publish node to global**: Publish node
- **Commit agent state**: Commit agent state
- **Visualize graph**: Visualize graph

## Manual Server Management

### Start Servers
```bash
cd /home/main/devops/hyperbolic-geometric-neural-network
./start-h2gnn-servers.sh
```

### Stop Servers
```bash
cd /home/main/devops/hyperbolic-geometric-neural-network
./stop-h2gnn-servers.sh
```

### Check Server Status
```bash
ps aux | grep mcp-server
```

### Kill All Servers
```bash
pkill -f mcp-server.ts
```

## Environment Variables

Set these environment variables for debugging:
```bash
export H2GNN_DEBUG=true
export H2GNN_HEARTBEAT_INTERVAL=60000
export H2GNN_SYNC_FREQUENCY=600000
```

## Getting Help

1. **Check Console Logs**: Look for error messages in Obsidian console
2. **Test Connection**: Use the connection test command
3. **Check Server Status**: Verify MCP servers are running
4. **Restart Everything**: Restart servers and plugin
5. **Check Dependencies**: Ensure all dependencies are installed

## Common Error Messages

### "Cannot access 'process' before initialization"
- **Cause**: MCP server code issues
- **Solution**: Check server code and dependencies

### "Failed to connect to H²GNN servers"
- **Cause**: MCP servers not running
- **Solution**: Start MCP servers manually

### "Interface not initialized"
- **Cause**: Plugin not properly initialized
- **Solution**: Restart plugin or Obsidian

### "H²GNN servers not available"
- **Cause**: No connection to MCP servers
- **Solution**: Start MCP servers and test connection

## Performance Issues

### Slow Response Times
1. Check system resources (CPU, memory)
2. Verify MCP server performance
3. Check network connectivity
4. Monitor console for errors

### Memory Issues
1. Restart MCP servers periodically
2. Check memory usage
3. Consolidate memories regularly

### Connection Timeouts
1. Increase timeout values
2. Check server responsiveness
3. Verify network connectivity

