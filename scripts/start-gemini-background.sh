#!/bin/bash

# Start Gemini Code Collaboration Test in Background
# This script runs the H²GNN system tests in the background for Gemini collaboration testing

set -e

echo "🚀 Starting Gemini Code Collaboration Background Test"
echo "====================================================="

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Create logs directory
mkdir -p logs
LOG_DIR="logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/gemini-background-$TIMESTAMP.log"
}

# Function to run a demo in background
run_demo_background() {
    local demo_name="$1"
    local demo_script="$2"
    local timeout="${3:-300}"  # Default 5 minutes timeout
    
    log "🎯 Starting $demo_name in background..."
    
    # Run demo in background with timeout
    (
        timeout "$timeout" npx tsx "$demo_script" > "$LOG_DIR/${demo_name}-$TIMESTAMP.log" 2>&1
        echo "Demo $demo_name completed with exit code: $?" >> "$LOG_DIR/${demo_name}-$TIMESTAMP.log"
    ) &
    
    local demo_pid=$!
    echo $demo_pid > "$LOG_DIR/${demo_name}.pid"
    log "✅ $demo_name started (PID: $demo_pid)"
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

# Function to start all demos in background
start_all_demos() {
    log "🎯 Starting all Gemini collaboration demos in background..."
    
    # Start all demos in parallel
    run_demo_background "wordnet-test" "src/demo/simple-wordnet-test.ts" 120
    run_demo_background "code-embedding" "src/demo/code-embedding-demo.ts" 180
    run_demo_background "knowledge-graph" "src/demo/knowledge-graph-demo.ts" 240
    run_demo_background "mcp-collaboration" "src/demo/mcp-collaboration-demo.ts" 300
    run_demo_background "integrated-demo" "src/demo/integrated-demo.ts" 360
    run_demo_background "wordnet-training" "src/demo/wordnet-training-demo.ts" 180
    
    log "✅ All demos started in background"
}

# Function to monitor running processes
monitor_processes() {
    log "👀 Monitoring background processes..."
    
    local check_interval=30  # Check every 30 seconds
    local max_runtime=1800   # Maximum 30 minutes
    
    local start_time=$(date +%s)
    
    while [ $(($(date +%s) - start_time)) -lt $max_runtime ]; do
        local running_count=0
        local completed_count=0
        
        # Check MCP server
        if [ -f "$LOG_DIR/mcp-server.pid" ]; then
            local mcp_pid=$(cat "$LOG_DIR/mcp-server.pid")
            if kill -0 $mcp_pid 2>/dev/null; then
                ((running_count++))
            else
                log "📊 MCP Server completed"
            fi
        fi
        
        # Check demo processes
        for pid_file in "$LOG_DIR"/*.pid; do
            if [ -f "$pid_file" ] && [ "$(basename "$pid_file")" != "mcp-server.pid" ]; then
                local demo_pid=$(cat "$pid_file")
                if kill -0 $demo_pid 2>/dev/null; then
                    ((running_count++))
                else
                    ((completed_count++))
                    local demo_name=$(basename "$pid_file" .pid)
                    log "📊 Demo $demo_name completed"
                fi
            fi
        done
        
        log "📊 Status: $running_count running, $completed_count completed"
        
        # If all processes are done, break
        if [ $running_count -eq 0 ]; then
            log "✅ All processes completed"
            break
        fi
        
        sleep $check_interval
    done
    
    # Check for any remaining processes
    local remaining=0
    for pid_file in "$LOG_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            if kill -0 $pid 2>/dev/null; then
                ((remaining++))
                log "⚠️  Process $pid still running"
            fi
        fi
    done
    
    if [ $remaining -gt 0 ]; then
        log "⚠️  $remaining processes still running after timeout"
    fi
}

# Function to generate status report
generate_status_report() {
    log "📊 Generating status report..."
    
    local report_file="$LOG_DIR/gemini-background-status-$TIMESTAMP.md"
    
    cat > "$report_file" << EOF
# Gemini Code Collaboration Background Test Status

**Test Run:** $TIMESTAMP  
**Status Time:** $(date)  
**Log Directory:** $LOG_DIR

## Process Status

EOF

    # Check MCP server status
    if [ -f "$LOG_DIR/mcp-server.pid" ]; then
        local mcp_pid=$(cat "$LOG_DIR/mcp-server.pid")
        if kill -0 $mcp_pid 2>/dev/null; then
            echo "- **MCP Server**: Running (PID: $mcp_pid)" >> "$report_file"
        else
            echo "- **MCP Server**: Completed" >> "$report_file"
        fi
    else
        echo "- **MCP Server**: Not started" >> "$report_file"
    fi
    
    # Check demo processes
    for pid_file in "$LOG_DIR"/*.pid; do
        if [ -f "$pid_file" ] && [ "$(basename "$pid_file")" != "mcp-server.pid" ]; then
            local demo_name=$(basename "$pid_file" .pid)
            local demo_pid=$(cat "$pid_file")
            if kill -0 $demo_pid 2>/dev/null; then
                echo "- **$demo_name**: Running (PID: $demo_pid)" >> "$report_file"
            else
                echo "- **$demo_name**: Completed" >> "$report_file"
            fi
        fi
    done
    
    echo "" >> "$report_file"
    echo "## Log Files" >> "$report_file"
    echo "" >> "$report_file"
    for log_file in "$LOG_DIR"/*-$TIMESTAMP.log; do
        if [ -f "$log_file" ]; then
            local log_name=$(basename "$log_file" | sed "s/-$TIMESTAMP.log//")
            echo "- **$log_name**: \`$log_file\`" >> "$report_file"
        fi
    done
    
    log "📄 Status report generated: $report_file"
}

# Function to cleanup processes
cleanup_processes() {
    log "🧹 Cleaning up processes..."
    
    # Stop MCP server
    if [ -f "$LOG_DIR/mcp-server.pid" ]; then
        local mcp_pid=$(cat "$LOG_DIR/mcp-server.pid")
        if kill -0 $mcp_pid 2>/dev/null; then
            log "🛑 Stopping MCP Server (PID: $mcp_pid)..."
            kill $mcp_pid
            sleep 2
            if kill -0 $mcp_pid 2>/dev/null; then
                log "🔨 Force killing MCP Server..."
                kill -9 $mcp_pid
            fi
        fi
        rm -f "$LOG_DIR/mcp-server.pid"
    fi
    
    # Stop demo processes
    for pid_file in "$LOG_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            local demo_pid=$(cat "$pid_file")
            if kill -0 $demo_pid 2>/dev/null; then
                local demo_name=$(basename "$pid_file" .pid)
                log "🛑 Stopping $demo_name (PID: $demo_pid)..."
                kill $demo_pid
                sleep 1
                if kill -0 $demo_pid 2>/dev/null; then
                    log "🔨 Force killing $demo_name..."
                    kill -9 $demo_pid
                fi
            fi
            rm -f "$pid_file"
        fi
    done
    
    log "✅ Cleanup completed"
}

# Main execution
main() {
    log "🎯 Starting Gemini Code Collaboration Background Test"
    log "📁 Working directory: $SCRIPT_DIR"
    log "📁 Log directory: $LOG_DIR"
    
    # Trap to ensure cleanup on exit
    trap 'log "🛑 Test interrupted, cleaning up..."; cleanup_processes; exit 1' INT TERM
    
    # Start MCP server
    if ! start_mcp_server; then
        log "❌ Failed to start MCP server, aborting tests"
        exit 1
    fi
    
    # Start all demos in background
    start_all_demos
    
    # Monitor processes
    monitor_processes
    
    # Generate status report
    generate_status_report
    
    log "🎉 Background test setup completed!"
    log "📊 Check logs in: $LOG_DIR"
    log "📄 Status report: $LOG_DIR/gemini-background-status-$TIMESTAMP.md"
    log ""
    log "💡 To stop all processes, run:"
    log "   ./scripts/stop-gemini-background.sh"
    log ""
    log "💡 To check status, run:"
    log "   ./scripts/check-gemini-status.sh"
}

# Run main function
main "$@"
