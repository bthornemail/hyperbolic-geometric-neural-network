#!/bin/bash

# Stop Gemini Code Collaboration Background Test
# This script stops all running H²GNN background processes

set -e

echo "🛑 Stopping Gemini Code Collaboration Background Test"
echo "===================================================="

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Create logs directory if it doesn't exist
mkdir -p logs
LOG_DIR="logs"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to stop processes
stop_processes() {
    local stopped_count=0
    local total_count=0
    
    log "🔍 Looking for running processes..."
    
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
            ((stopped_count++))
        fi
        rm -f "$LOG_DIR/mcp-server.pid"
        ((total_count++))
    fi
    
    # Stop demo processes
    for pid_file in "$LOG_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            local demo_name=$(basename "$pid_file" .pid)
            local demo_pid=$(cat "$pid_file")
            if kill -0 $demo_pid 2>/dev/null; then
                log "🛑 Stopping $demo_name (PID: $demo_pid)..."
                kill $demo_pid
                sleep 1
                if kill -0 $demo_pid 2>/dev/null; then
                    log "🔨 Force killing $demo_name..."
                    kill -9 $demo_pid
                fi
                ((stopped_count++))
            fi
            rm -f "$pid_file"
            ((total_count++))
        fi
    done
    
    log "📊 Stopped $stopped_count/$total_count processes"
}

# Function to check for any remaining processes
check_remaining() {
    log "🔍 Checking for any remaining processes..."
    
    local remaining=0
    
    # Check for any tsx processes related to our demos
    local tsx_processes=$(pgrep -f "tsx.*demo" 2>/dev/null || true)
    if [ -n "$tsx_processes" ]; then
        log "⚠️  Found remaining tsx processes:"
        echo "$tsx_processes" | while read pid; do
            local cmd=$(ps -p $pid -o cmd= 2>/dev/null || echo "Unknown")
            log "   PID $pid: $cmd"
            ((remaining++))
        done
    fi
    
    # Check for any node processes related to our server
    local node_processes=$(pgrep -f "h2gnn-mcp-server" 2>/dev/null || true)
    if [ -n "$node_processes" ]; then
        log "⚠️  Found remaining node processes:"
        echo "$node_processes" | while read pid; do
            local cmd=$(ps -p $pid -o cmd= 2>/dev/null || echo "Unknown")
            log "   PID $pid: $cmd"
            ((remaining++))
        done
    fi
    
    if [ $remaining -eq 0 ]; then
        log "✅ No remaining processes found"
    else
        log "⚠️  $remaining processes still running"
    fi
}

# Function to generate cleanup report
generate_cleanup_report() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local report_file="$LOG_DIR/cleanup-report-$timestamp.md"
    
    log "📊 Generating cleanup report..."
    
    cat > "$report_file" << EOF
# Gemini Code Collaboration Cleanup Report

**Cleanup Time:** $(date)  
**Log Directory:** $LOG_DIR

## Cleanup Summary

- **Processes Stopped:** $(ls "$LOG_DIR"/*.pid 2>/dev/null | wc -l || echo "0")
- **Log Files:** $(ls "$LOG_DIR"/*.log 2>/dev/null | wc -l || echo "0")
- **Status:** Cleanup completed

## Remaining Log Files

EOF

    # List remaining log files
    for log_file in "$LOG_DIR"/*.log; do
        if [ -f "$log_file" ]; then
            local log_name=$(basename "$log_file")
            local log_size=$(du -h "$log_file" | cut -f1)
            echo "- **$log_name**: $log_size" >> "$report_file"
        fi
    done
    
    log "📄 Cleanup report generated: $report_file"
}

# Main execution
main() {
    log "🛑 Starting cleanup of Gemini Code Collaboration processes"
    
    # Stop all processes
    stop_processes
    
    # Check for remaining processes
    check_remaining
    
    # Generate cleanup report
    generate_cleanup_report
    
    log "✅ Cleanup completed successfully!"
    log "📁 Logs preserved in: $LOG_DIR"
    log "📄 Cleanup report generated"
}

# Run main function
main "$@"
