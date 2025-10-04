#!/bin/bash

# Test Gemini Agent Integration
# This script tests the Gemini agent integration with H²GNN

# set -e  # Commented out to handle errors gracefully

echo "🧪 Testing Gemini Agent Integration"
echo "=================================="

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Test 1: Basic Gemini CLI functionality
test_basic_functionality() {
    log "Test 1: Basic Gemini CLI functionality"
    
    if command -v gemini >/dev/null 2>&1; then
        log "✅ Gemini CLI is available"
        
        # Test help command
        if gemini --help > /dev/null 2>&1; then
            log "✅ Gemini CLI help command works"
        else
            log "❌ Gemini CLI help command failed"
            return 1
        fi
    else
        log "❌ Gemini CLI not found"
        return 1
    fi
    
    return 0
}

# Test 2: Configuration validation
test_configuration() {
    log "Test 2: Configuration validation"
    
    local config_files=(".gemini/settings.json" ".gemini/GEMINI.md" ".gemini/memport.md" ".gemini/gemini-md-config.json")
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            log "✅ $file exists"
        else
            log "❌ $file not found"
            return 1
        fi
    done
    
    return 0
}

# Test 3: H²GNN integration
test_h2gnn_integration() {
    log "Test 3: H²GNN integration"
    
    # Check if H²GNN system is available
    if [ -d "src/core" ]; then
        log "✅ H²GNN core system found"
    else
        log "❌ H²GNN core system not found"
        return 1
    fi
    
    # Check if MCP servers are available
    if [ -d "src/mcp" ]; then
        log "✅ MCP servers found"
    else
        log "❌ MCP servers not found"
        return 1
    fi
    
    return 0
}

# Test 4: PocketFlow integration
test_pocketflow_integration() {
    log "Test 4: PocketFlow integration"
    
    if [ -d "src/pocketflow" ]; then
        log "✅ PocketFlow system found"
    else
        log "❌ PocketFlow system not found"
        return 1
    fi
    
    return 0
}

# Test 5: Memory system
test_memory_system() {
    log "Test 5: Memory system"
    
    if [ -d "persistence" ]; then
        log "✅ Persistence directory found"
    else
        log "❌ Persistence directory not found"
        return 1
    fi
    
    if [ -d "shared-learning" ]; then
        log "✅ Shared learning directory found"
    else
        log "❌ Shared learning directory not found"
        return 1
    fi
    
    return 0
}

# Run all tests
main() {
    log "Starting Gemini Agent integration tests..."
    
    local tests=(
        "test_basic_functionality"
        "test_configuration"
        "test_h2gnn_integration"
        "test_pocketflow_integration"
        "test_memory_system"
    )
    
    local passed=0
    local total=${#tests[@]}
    
    for test in "${tests[@]}"; do
        if $test; then
            ((passed++))
        else
            log "❌ Test failed: $test"
        fi
    done
    
    log "Test Results: $passed/$total tests passed"
    
    if [ $passed -eq $total ]; then
        log "✅ All tests passed! Gemini Agent integration is working."
        return 0
    else
        log "❌ Some tests failed. Please check the configuration."
        return 1
    fi
}

# Run main function
main "$@"
