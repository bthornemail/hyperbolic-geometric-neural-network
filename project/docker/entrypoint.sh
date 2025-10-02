#!/bin/sh

# H²GNN Production Entrypoint
# Handles initialization and startup of the H²GNN production system

set -e

echo "🚀 Starting H²GNN Production System..."

# Create storage directories
mkdir -p /app/storage/memories
mkdir -p /app/storage/snapshots
mkdir -p /app/storage/progress
mkdir -p /app/storage/teams
mkdir -p /app/storage/conflicts
mkdir -p /app/storage/insights

# Set proper permissions
chown -R h2gnn:nodejs /app/storage

# Initialize H²GNN system
echo "🧠 Initializing H²GNN system..."
node -e "
const { CentralizedH2GNNManager } = require('./dist/core/centralized-h2gnn-config.js');
const manager = CentralizedH2GNNManager.getInstance();
console.log('✅ H²GNN system initialized');
"

# Start the application
echo "🎯 Starting H²GNN application..."
exec "$@"
