#!/bin/bash

# H²GNN MCP Servers Startup Script
# This script starts all the H²GNN MCP servers needed for the Obsidian plugin

echo "🚀 Starting H²GNN MCP Servers..."

# Change to the project directory
cd /home/main/devops/hyperbolic-geometric-neural-network

# Set environment variables
export H2GNN_DEBUG=false
export H2GNN_HEARTBEAT_INTERVAL=0
export H2GNN_SYNC_FREQUENCY=0

# Start H²GNN Core Server
echo "Starting H²GNN Core Server..."
npx tsx src/mcp/h2gnn-mcp-server.ts &
H2GNN_PID=$!

# Start Knowledge Graph Server
echo "Starting Knowledge Graph Server..."
npx tsx src/mcp/knowledge-graph-mcp-server.ts &
KG_PID=$!

# Start LSP/AST Server
echo "Starting LSP/AST Server..."
npx tsx src/mcp/lsp-ast-mcp-server.ts &
LSP_PID=$!

# Start Geometric Tools Server
echo "Starting Geometric Tools Server..."
npx tsx src/mcp/geometric-tools-mcp-server.ts &
GEO_PID=$!

# Wait a moment for servers to start
sleep 3

# Check if servers are running
echo "Checking server status..."
if ps -p $H2GNN_PID > /dev/null; then
    echo "✅ H²GNN Core Server is running (PID: $H2GNN_PID)"
else
    echo "❌ H²GNN Core Server failed to start"
fi

if ps -p $KG_PID > /dev/null; then
    echo "✅ Knowledge Graph Server is running (PID: $KG_PID)"
else
    echo "❌ Knowledge Graph Server failed to start"
fi

if ps -p $LSP_PID > /dev/null; then
    echo "✅ LSP/AST Server is running (PID: $LSP_PID)"
else
    echo "❌ LSP/AST Server failed to start"
fi

if ps -p $GEO_PID > /dev/null; then
    echo "✅ Geometric Tools Server is running (PID: $GEO_PID)"
else
    echo "❌ Geometric Tools Server failed to start"
fi

echo ""
echo "🎉 H²GNN MCP Servers startup complete!"
echo "You can now use the Obsidian plugin with full H²GNN functionality."
echo ""
echo "To stop the servers, run:"
echo "kill $H2GNN_PID $KG_PID $LSP_PID $GEO_PID"
echo ""
echo "Or use the 'Stop H²GNN Servers' command in Obsidian."

