#!/bin/bash

# H²GNN Production Build Script
# This script handles the complete production build process

set -e  # Exit on any error

echo "🚀 Starting H²GNN Production Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "NPM version: $(npm --version)"

# Clean previous builds
print_status "Cleaning previous builds..."
npm run clean

# Install dependencies
print_status "Installing dependencies..."
npm ci --only=production

# Run pre-build checks
print_status "Running pre-build checks..."
npm run type-check
npm run lint
npm run test:ci

# Build for production
print_status "Building for production..."
npm run build:production

# Verify build
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

print_success "Production build completed successfully!"

# Show build statistics
print_status "Build statistics:"
du -sh dist/
echo "Files in dist/:"
ls -la dist/

# Optional: Run bundle analysis
if [ "$1" = "--analyze" ]; then
    print_status "Running bundle analysis..."
    npm run build:analyze
fi

# Optional: Docker build
if [ "$1" = "--docker" ]; then
    print_status "Building Docker image..."
    npm run build:docker
fi

print_success "🎉 Production build process completed!"
print_status "You can now deploy using:"
print_status "  - npm run deploy:staging (for staging)"
print_status "  - npm run deploy:production (for production)"
print_status "  - npm run docker:up (for local Docker deployment)"
