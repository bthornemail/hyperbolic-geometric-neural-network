#!/bin/sh

# H²GNN Production Health Check
# Checks the health of the H²GNN production system

set -e

# Check if the application is running
if ! pgrep -f "node.*dist/index.js" > /dev/null; then
    echo "❌ H²GNN application is not running"
    exit 1
fi

# Check if the API is responding
if ! curl -f http://localhost:${PORT:-3000}/health > /dev/null 2>&1; then
    echo "❌ H²GNN API is not responding"
    exit 1
fi

# Check if storage is accessible
if [ ! -d "/app/storage" ]; then
    echo "❌ Storage directory is not accessible"
    exit 1
fi

# Check if required files exist
if [ ! -f "/app/dist/index.js" ]; then
    echo "❌ Application files are missing"
    exit 1
fi

echo "✅ H²GNN system is healthy"
exit 0
