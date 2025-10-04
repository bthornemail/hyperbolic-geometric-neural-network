# H²GNN Obsidian Plugin - Installation Guide

## Prerequisites

### System Requirements
- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher
- **Obsidian**: Version 0.15.0 or higher
- **Operating System**: Windows, macOS, or Linux

### H²GNN System Requirements
- **H²GNN MCP Servers**: Running in the parent directory
- **Persistence Directory**: `./persistence` directory with proper permissions
- **Network Access**: Access to MCP servers on localhost

## Installation Steps

### 1. Clone or Download the Plugin
```bash
# If cloning from repository
git clone <repository-url> .obsidian/plugins/obsidian-h2gnn-client

# Or download and extract to the plugin directory
# Extract to: .obsidian/plugins/obsidian-h2gnn-client/
```

### 2. Install Dependencies
```bash
cd .obsidian/plugins/obsidian-h2gnn-client
npm install
```

### 3. Build the Plugin
```bash
# Development build
npm run dev

# Production build
npm run build
```

### 4. Verify H²GNN MCP Servers
Ensure the following MCP servers are running in the parent directory:
- `src/mcp/h2gnn-mcp-server.ts`
- `src/mcp/knowledge-graph-mcp-server.ts`
- `src/mcp/lsp-ast-mcp-server.ts`
- `src/mcp/geometric-tools-mcp-server.ts`

### 5. Enable the Plugin in Obsidian
1. Open Obsidian
2. Go to Settings → Community Plugins
3. Enable "H²GNN Client"
4. Configure plugin settings if needed

## Configuration

### Plugin Settings
The plugin automatically configures itself with default settings:

```typescript
const h2gnnConfig: H2GNNConfig = {
    h2gnnServerPath: '../../src/mcp/h2gnn-mcp-server.ts',
    knowledgeGraphServerPath: '../../src/mcp/knowledge-graph-mcp-server.ts',
    lspAstServerPath: '../../src/mcp/lsp-ast-mcp-server.ts',
    geometricToolsServerPath: '../../src/mcp/geometric-tools-mcp-server.ts',
    enhancedH2gnnServerPath: '../../src/mcp/h2gnn-mcp-server.ts'
};
```

### Custom Configuration
To customize the configuration, modify the `main.ts` file:

```typescript
const h2gnnConfig: H2GNNConfig = {
    h2gnnServerPath: '/path/to/your/h2gnn-server',
    knowledgeGraphServerPath: '/path/to/your/knowledge-graph-server',
    lspAstServerPath: '/path/to/your/lsp-ast-server',
    geometricToolsServerPath: '/path/to/your/geometric-tools-server',
    enhancedH2gnnServerPath: '/path/to/your/enhanced-h2gnn-server'
};
```

## Verification

### 1. Check Plugin Status
1. Open Obsidian
2. Go to Settings → Community Plugins
3. Verify "H²GNN Client" is enabled
4. Check for any error messages

### 2. Test MCP Server Connections
1. Open the command palette (Ctrl/Cmd + P)
2. Run "🔍 Get System Status" command
3. Verify all servers are connected
4. Check console for any connection errors

### 3. Test Basic Functionality
1. Open a code file in Obsidian
2. Run "🔍 Analyze Code with H²GNN" command
3. Verify the analysis completes successfully
4. Check console for any errors

## Troubleshooting

### Common Issues

#### 1. Plugin Not Loading
**Symptoms**: Plugin doesn't appear in the plugin list
**Solutions**:
- Check that all files are in the correct directory
- Verify `manifest.json` is properly formatted
- Check Obsidian console for errors
- Ensure Obsidian version is 0.15.0 or higher

#### 2. MCP Server Connection Failures
**Symptoms**: "Failed to connect to H²GNN servers" error
**Solutions**:
- Verify MCP servers are running in the parent directory
- Check server paths in configuration
- Ensure servers are accessible on localhost
- Check console for detailed error messages

#### 3. Build Errors
**Symptoms**: Build fails with TypeScript or dependency errors
**Solutions**:
- Run `npm install` to install dependencies
- Check Node.js version (should be 16+)
- Verify TypeScript configuration
- Check for missing dependencies

#### 4. Performance Issues
**Symptoms**: Slow response times or timeouts
**Solutions**:
- Check system resources (CPU, memory)
- Verify MCP server performance
- Check network connectivity
- Monitor console for errors

### Debug Mode

#### Enable Debug Logging
Set environment variables for debug logging:

```bash
export H2GNN_DEBUG=true
export H2GNN_HEARTBEAT_INTERVAL=60000
export H2GNN_SYNC_FREQUENCY=600000
```

#### Check Console Logs
1. Open Obsidian
2. Go to Settings → Advanced → Developer Tools
3. Open Console tab
4. Look for H²GNN related messages

#### Check MCP Server Logs
Check the console output of MCP servers for errors:

```bash
# Check H²GNN server logs
npx tsx src/mcp/h2gnn-mcp-server.ts

# Check Knowledge Graph server logs
npx tsx src/mcp/knowledge-graph-mcp-server.ts

# Check LSP/AST server logs
npx tsx src/mcp/lsp-ast-mcp-server.ts

# Check Geometric Tools server logs
npx tsx src/mcp/geometric-tools-mcp-server.ts
```

## Development

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development build: `npm run dev`
4. Make changes to TypeScript files
5. Test in Obsidian

### Testing
```bash
# Run tests
npm test

# Run specific tests
npm test -- --grep "H²GNN"

# Run with coverage
npm test -- --coverage
```

### Building for Production
```bash
# Build for production
npm run build

# Verify build
ls -la main.js manifest.json styles.css
```

## Uninstallation

### Remove Plugin
1. Open Obsidian
2. Go to Settings → Community Plugins
3. Disable "H²GNN Client"
4. Delete the plugin directory: `.obsidian/plugins/obsidian-h2gnn-client`

### Clean Up
1. Remove any generated files
2. Clear any cached data
3. Remove any configuration files if needed

## Support

### Getting Help
1. Check the console for error messages
2. Review the troubleshooting section
3. Check the GitHub repository for issues
4. Consult the H²GNN documentation

### Reporting Issues
When reporting issues, include:
1. Obsidian version
2. Plugin version
3. Operating system
4. Console error messages
5. Steps to reproduce the issue

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This plugin is licensed under the MIT License. See the LICENSE file for details.

