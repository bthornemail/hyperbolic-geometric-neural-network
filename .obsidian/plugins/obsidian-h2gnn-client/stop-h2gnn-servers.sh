#!/bin/bash

# H²GNN MCP Servers Stop Script
# This script stops all the H²GNN MCP servers

echo "🛑 Stopping H²GNN MCP Servers..."

# Find and kill all H²GNN MCP server processes
echo "Stopping H²GNN Core Server..."
pkill -f "h2gnn-mcp-server.ts"

echo "Stopping Knowledge Graph Server..."
pkill -f "knowledge-graph-mcp-server.ts"

echo "Stopping LSP/AST Server..."
pkill -f "lsp-ast-mcp-server.ts"

echo "Stopping Geometric Tools Server..."
pkill -f "geometric-tools-mcp-server.ts"

# Wait a moment for processes to stop
sleep 2

# Check if any processes are still running
REMAINING=$(pgrep -f "mcp-server.ts" | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "✅ All H²GNN MCP Servers stopped successfully"
else
    echo "⚠️ Some servers may still be running. Remaining processes: $REMAINING"
    echo "You may need to stop them manually:"
    pgrep -f "mcp-server.ts" | xargs ps -p
fi

echo ""
echo "🎉 H²GNN MCP Servers shutdown complete!"
