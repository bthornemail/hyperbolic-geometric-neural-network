#!/bin/bash

# Gemini Code Collaboration Test Runner
# This script runs the H²GNN system in the background to test Gemini collaboration features

set -e

echo "🚀 Starting Gemini Code Collaboration Test"
echo "=========================================="

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create logs directory
mkdir -p logs
LOG_DIR="$SCRIPT_DIR/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/gemini-test-$TIMESTAMP.log"
}

# Function to run a demo and capture output
run_demo() {
    local demo_name="$1"
    local demo_script="$2"
    local timeout="${3:-300}"  # Default 5 minutes timeout
    
    log "🎯 Running $demo_name..."
    
    if timeout "$timeout" npx tsx "$demo_script" > "$LOG_DIR/${demo_name}-$TIMESTAMP.log" 2>&1; then
        log "✅ $demo_name completed successfully"
        return 0
    else
        log "❌ $demo_name failed or timed out"
        return 1
    fi
}

# Function to start MCP server in background
start_mcp_server() {
    log "🚀 Starting H²GNN MCP Server in background..."
    
    # Start the MCP server
    npx tsx src/mcp/h2gnn-mcp-server.ts > "$LOG_DIR/mcp-server-$TIMESTAMP.log" 2>&1 &
    MCP_PID=$!
    
    # Store PID for cleanup
    echo $MCP_PID > "$LOG_DIR/mcp-server.pid"
    
    # Wait for server to start
    log "⏳ Waiting for MCP server to initialize..."
    sleep 5
    
    # Check if server is still running
    if kill -0 $MCP_PID 2>/dev/null; then
        log "✅ MCP Server started successfully (PID: $MCP_PID)"
        return 0
    else
        log "❌ MCP Server failed to start"
        return 1
    fi
}

# Function to stop MCP server
stop_mcp_server() {
    if [ -f "$LOG_DIR/mcp-server.pid" ]; then
        MCP_PID=$(cat "$LOG_DIR/mcp-server.pid")
        if kill -0 $MCP_PID 2>/dev/null; then
            log "🛑 Stopping MCP Server (PID: $MCP_PID)..."
            kill $MCP_PID
            sleep 2
            if kill -0 $MCP_PID 2>/dev/null; then
                log "🔨 Force killing MCP Server..."
                kill -9 $MCP_PID
            fi
        fi
        rm -f "$LOG_DIR/mcp-server.pid"
    fi
}

# Function to run all tests
run_all_tests() {
    local success_count=0
    local total_count=0
    
    log "🎯 Starting comprehensive Gemini collaboration tests..."
    
    # Test 1: WordNet Integration
    log "📋 Test 1: WordNet Integration"
    if run_demo "wordnet-test" "src/demo/simple-wordnet-test.ts" 120; then
        ((success_count++))
    fi
    ((total_count++))
    
    # Test 2: Code Embedding Demo
    log "📋 Test 2: Code Embedding Analysis"
    if run_demo "code-embedding" "src/demo/code-embedding-demo.ts" 180; then
        ((success_count++))
    fi
    ((total_count++))
    
    # Test 3: Knowledge Graph Demo
    log "📋 Test 3: Knowledge Graph Generation"
    if run_demo "knowledge-graph" "src/demo/knowledge-graph-demo.ts" 240; then
        ((success_count++))
    fi
    ((total_count++))
    
    # Test 4: MCP Collaboration Demo
    log "📋 Test 4: MCP AI-Human Collaboration"
    if run_demo "mcp-collaboration" "src/demo/mcp-collaboration-demo.ts" 300; then
        ((success_count++))
    fi
    ((total_count++))
    
    # Test 5: Integrated Demo
    log "📋 Test 5: Integrated System Demo"
    if run_demo "integrated-demo" "src/demo/integrated-demo.ts" 360; then
        ((success_count++))
    fi
    ((total_count++))
    
    # Test 6: WordNet Training Demo
    log "📋 Test 6: WordNet Training Workflow"
    if run_demo "wordnet-training" "src/demo/wordnet-training-demo.ts" 180; then
        ((success_count++))
    fi
    ((total_count++))
    
    # Generate summary
    log "📊 Test Summary:"
    log "   ✅ Successful: $success_count/$total_count"
    log "   ❌ Failed: $((total_count - success_count))/$total_count"
    log "   📈 Success Rate: $(( (success_count * 100) / total_count ))%"
    
    return $((total_count - success_count))
}

# Function to generate detailed report
generate_report() {
    log "📊 Generating detailed test report..."
    
    local report_file="$LOG_DIR/gemini-test-report-$TIMESTAMP.md"
    
    cat > "$report_file" << EOF
# Gemini Code Collaboration Test Report

**Test Run:** $TIMESTAMP  
**Duration:** $(date)  
**Log Directory:** $LOG_DIR

## Test Results Summary

EOF

    # Add individual test results
    for log_file in "$LOG_DIR"/*-$TIMESTAMP.log; do
        if [ -f "$log_file" ]; then
            local test_name=$(basename "$log_file" | sed "s/-$TIMESTAMP.log//")
            echo "### $test_name" >> "$report_file"
            echo '```' >> "$report_file"
            tail -20 "$log_file" >> "$report_file"
            echo '```' >> "$report_file"
            echo "" >> "$report_file"
        fi
    done
    
    log "📄 Detailed report generated: $report_file"
}

# Main execution
main() {
    log "🎯 Starting Gemini Code Collaboration Test Suite"
    log "📁 Working directory: $SCRIPT_DIR"
    log "📁 Log directory: $LOG_DIR"
    
    # Trap to ensure cleanup on exit
    trap 'log "🛑 Test interrupted, cleaning up..."; stop_mcp_server; exit 1' INT TERM
    
    # Start MCP server
    if ! start_mcp_server; then
        log "❌ Failed to start MCP server, aborting tests"
        exit 1
    fi
    
    # Run all tests
    local failed_tests=0
    if ! run_all_tests; then
        failed_tests=$?
    fi
    
    # Generate report
    generate_report
    
    # Cleanup
    log "🧹 Cleaning up..."
    stop_mcp_server
    
    # Final status
    if [ $failed_tests -eq 0 ]; then
        log "🎉 All tests completed successfully!"
        exit 0
    else
        log "⚠️  Some tests failed ($failed_tests failures)"
        exit 1
    fi
}

# Run main function
main "$@"
