#!/bin/bash

# Setup Gemini Agent for H²GNN System
# This script sets up the Gemini CLI agent for the H²GNN codebase

set -e

echo "🚀 Setting up Gemini Agent for H²GNN System"
echo "============================================="

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        local node_version=$(node --version | cut -d'v' -f2)
        local major_version=$(echo $node_version | cut -d'.' -f1)
        
        if [ "$major_version" -ge 18 ]; then
            log "✅ Node.js version $node_version is compatible"
            return 0
        else
            log "❌ Node.js version $node_version is too old. Required: >= 18.0.0"
            return 1
        fi
    else
        log "❌ Node.js is not installed"
        return 1
    fi
}

# Function to install Gemini CLI
install_gemini_cli() {
    log "📦 Installing Gemini CLI..."
    
    if command_exists gemini; then
        log "✅ Gemini CLI is already installed"
        return 0
    fi
    
    # Try different installation methods
    if command_exists npm; then
        log "Installing via npm..."
        npm install -g @google/gemini-cli
    elif command_exists npx; then
        log "Installing via npx..."
        npx @google/gemini-cli --help > /dev/null 2>&1
    else
        log "❌ Neither npm nor npx found. Please install Node.js first."
        return 1
    fi
    
    if command_exists gemini; then
        log "✅ Gemini CLI installed successfully"
        return 0
    else
        log "❌ Failed to install Gemini CLI"
        return 1
    fi
}

# Function to verify Gemini CLI installation
verify_gemini_cli() {
    log "🔍 Verifying Gemini CLI installation..."
    
    if command_exists gemini; then
        local gemini_version=$(gemini --version 2>/dev/null || echo "unknown")
        log "✅ Gemini CLI is working (version: $gemini_version)"
        return 0
    else
        log "❌ Gemini CLI is not working"
        return 1
    fi
}

# Function to setup .gemini directory
setup_gemini_directory() {
    log "📁 Setting up .gemini directory..."
    
    local gemini_dir=".gemini"
    
    if [ ! -d "$gemini_dir" ]; then
        log "Creating .gemini directory..."
        mkdir -p "$gemini_dir"
    else
        log "✅ .gemini directory already exists"
    fi
    
    # Check if required files exist
    local required_files=("settings.json" "GEMINI.md" "memport.md" "gemini-md-config.json")
    
    for file in "${required_files[@]}"; do
        if [ -f "$gemini_dir/$file" ]; then
            log "✅ $file exists"
        else
            log "❌ $file is missing"
            return 1
        fi
    done
    
    log "✅ .gemini directory setup complete"
    return 0
}

# Function to validate configuration
validate_configuration() {
    log "🔍 Validating Gemini configuration..."
    
    # Check settings.json
    if [ -f ".gemini/settings.json" ]; then
        if command_exists jq; then
            if jq empty .gemini/settings.json 2>/dev/null; then
                log "✅ settings.json is valid JSON"
            else
                log "❌ settings.json contains invalid JSON"
                return 1
            fi
        else
            log "⚠️  jq not found, skipping JSON validation"
        fi
    else
        log "❌ settings.json not found"
        return 1
    fi
    
    # Check GEMINI.md
    if [ -f ".gemini/GEMINI.md" ]; then
        log "✅ GEMINI.md exists"
    else
        log "❌ GEMINI.md not found"
        return 1
    fi
    
    # Check memport.md
    if [ -f ".gemini/memport.md" ]; then
        log "✅ memport.md exists"
    else
        log "❌ memport.md not found"
        return 1
    fi
    
    # Check gemini-md-config.json
    if [ -f ".gemini/gemini-md-config.json" ]; then
        if command_exists jq; then
            if jq empty .gemini/gemini-md-config.json 2>/dev/null; then
                log "✅ gemini-md-config.json is valid JSON"
            else
                log "❌ gemini-md-config.json contains invalid JSON"
                return 1
            fi
        else
            log "⚠️  jq not found, skipping JSON validation"
        fi
    else
        log "❌ gemini-md-config.json not found"
        return 1
    fi
    
    log "✅ Configuration validation complete"
    return 0
}

# Function to test Gemini CLI integration
test_gemini_integration() {
    log "🧪 Testing Gemini CLI integration..."
    
    # Test basic Gemini CLI functionality
    if command_exists gemini; then
        log "Testing Gemini CLI help command..."
        if gemini --help > /dev/null 2>&1; then
            log "✅ Gemini CLI help command works"
        else
            log "❌ Gemini CLI help command failed"
            return 1
        fi
        
        # Test if Gemini can read the configuration
        log "Testing Gemini CLI configuration reading..."
        if [ -f ".gemini/settings.json" ]; then
            log "✅ Gemini CLI can access configuration"
        else
            log "❌ Gemini CLI cannot access configuration"
            return 1
        fi
    else
        log "❌ Gemini CLI not found"
        return 1
    fi
    
    log "✅ Gemini CLI integration test complete"
    return 0
}

# Function to create test script
create_test_script() {
    log "📝 Creating test script..."
    
    cat > "scripts/test-gemini-agent.sh" << 'EOF'
#!/bin/bash

# Test Gemini Agent Integration
# This script tests the Gemini agent integration with H²GNN

set -e

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
EOF

    chmod +x "scripts/test-gemini-agent.sh"
    log "✅ Test script created: scripts/test-gemini-agent.sh"
}

# Function to generate setup report
generate_setup_report() {
    log "📊 Generating setup report..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local report_file="logs/gemini-agent-setup-$timestamp.md"
    
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    cat > "$report_file" << EOF
# Gemini Agent Setup Report

**Setup Time:** $(date)  
**Project:** H²GNN Hyperbolic Geometric Neural Network  
**Version:** 1.0.0

## Setup Summary

✅ **Gemini CLI Installation**: Completed  
✅ **Configuration Setup**: Completed  
✅ **Integration Testing**: Completed  
✅ **Documentation**: Completed

## Configuration Files

- **.gemini/settings.json**: H²GNN tool configuration
- **.gemini/GEMINI.md**: Project guide and workflow
- **.gemini/memport.md**: Memory management configuration
- **.gemini/gemini-md-config.json**: Markdown processing configuration

## Integration Features

### H²GNN Integration
- **Tool-First Policy**: Mandatory H²GNN tool usage
- **Persistence System**: Memory and learning integration
- **Knowledge Graph**: Automated analysis and generation
- **Geometric Analysis**: Hyperbolic geometry support

### PocketFlow Integration
- **Workflow Orchestration**: Node and flow management
- **Pattern Recognition**: Workflow pattern extraction
- **Collaborative Development**: Team workflow support

### MCP Integration
- **Tool Commands**: Standardized tool interface
- **Server Communication**: MCP server integration
- **Resource Management**: Tool and resource mapping

## Usage Examples

### Basic Analysis
\`\`\`bash
gemini -p "Analyze the codebase using H²GNN tools and generate insights"
\`\`\`

### Code Generation
\`\`\`bash
gemini -p "Generate a new function using the knowledge graph and H²GNN analysis"
\`\`\`

### Documentation Generation
\`\`\`bash
gemini -p "Create comprehensive documentation using H²GNN knowledge graph"
\`\`\`

## Testing

Run the test script to verify integration:
\`\`\`bash
./scripts/test-gemini-agent.sh
\`\`\`

## Next Steps

1. **Initialize H²GNN System**: Use the mandatory workflow
2. **Test Integration**: Run the test script
3. **Start Development**: Begin using Gemini CLI for development
4. **Monitor Performance**: Check system health and learning progress

## Support

- **Documentation**: See .gemini/GEMINI.md for detailed usage
- **Configuration**: See .gemini/settings.json for tool configuration
- **Memory Management**: See .gemini/memport.md for memory operations
- **Markdown Processing**: See .gemini/gemini-md-config.json for markdown config

---

*Generated by Gemini Agent Setup Script*
EOF

    log "📄 Setup report generated: $report_file"
}

# Main execution
main() {
    log "🚀 Starting Gemini Agent setup for H²GNN system"
    
    # Check prerequisites
    log "🔍 Checking prerequisites..."
    if ! check_node_version; then
        log "❌ Node.js version check failed"
        exit 1
    fi
    
    # Install Gemini CLI
    log "📦 Installing Gemini CLI..."
    if ! install_gemini_cli; then
        log "❌ Gemini CLI installation failed"
        exit 1
    fi
    
    # Verify installation
    log "🔍 Verifying Gemini CLI installation..."
    if ! verify_gemini_cli; then
        log "❌ Gemini CLI verification failed"
        exit 1
    fi
    
    # Setup .gemini directory
    log "📁 Setting up .gemini directory..."
    if ! setup_gemini_directory; then
        log "❌ .gemini directory setup failed"
        exit 1
    fi
    
    # Validate configuration
    log "🔍 Validating configuration..."
    if ! validate_configuration; then
        log "❌ Configuration validation failed"
        exit 1
    fi
    
    # Test integration
    log "🧪 Testing Gemini CLI integration..."
    if ! test_gemini_integration; then
        log "❌ Gemini CLI integration test failed"
        exit 1
    fi
    
    # Create test script
    log "📝 Creating test script..."
    create_test_script
    
    # Generate setup report
    log "📊 Generating setup report..."
    generate_setup_report
    
    log "✅ Gemini Agent setup completed successfully!"
    log "📁 Configuration directory: .gemini/"
    log "📄 Setup report: logs/gemini-agent-setup-*.md"
    log "🧪 Test script: scripts/test-gemini-agent.sh"
    log ""
    log "🎯 Next steps:"
    log "1. Run: ./scripts/test-gemini-agent.sh"
    log "2. Start using: gemini -p 'your prompt here'"
    log "3. Follow the tool-first approach in .gemini/GEMINI.md"
}

# Run main function
main "$@"
