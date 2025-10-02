#!/bin/bash

# Check Gemini Code Collaboration Status
# This script checks the status of running H²GNN background processes

set -e

echo "📊 Checking Gemini Code Collaboration Status"
echo "============================================"

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create logs directory if it doesn't exist
mkdir -p logs
LOG_DIR="$SCRIPT_DIR/logs"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check process status
check_process_status() {
    local process_name="$1"
    local pid_file="$2"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            local runtime=$(ps -o etime= -p $pid 2>/dev/null | tr -d ' ' || echo "Unknown")
            local memory=$(ps -o rss= -p $pid 2>/dev/null | tr -d ' ' || echo "Unknown")
            local cpu=$(ps -o %cpu= -p $pid 2>/dev/null | tr -d ' ' || echo "Unknown")
            
            log "✅ $process_name: Running (PID: $pid, Runtime: $runtime, Memory: ${memory}KB, CPU: ${cpu}%)"
            return 0
        else
            log "❌ $process_name: Process not running (PID file exists but process dead)"
            return 1
        fi
    else
        log "❌ $process_name: No PID file found"
        return 1
    fi
}

# Function to check log files
check_log_files() {
    log "📁 Checking log files..."
    
    local log_count=0
    local total_size=0
    
    for log_file in "$LOG_DIR"/*.log; do
        if [ -f "$log_file" ]; then
            local log_name=$(basename "$log_file")
            local log_size=$(du -h "$log_file" | cut -f1)
            local log_lines=$(wc -l < "$log_file" 2>/dev/null || echo "0")
            local last_modified=$(stat -c %y "$log_file" 2>/dev/null || echo "Unknown")
            
            log "📄 $log_name: $log_size, $log_lines lines, modified: $last_modified"
            ((log_count++))
            total_size=$((total_size + $(du -k "$log_file" | cut -f1)))
        fi
    done
    
    if [ $log_count -eq 0 ]; then
        log "❌ No log files found"
    else
        log "📊 Total: $log_count files, $(du -h "$LOG_DIR" | cut -f1) total size"
    fi
}

# Function to check system resources
check_system_resources() {
    log "💻 Checking system resources..."
    
    # Check memory usage
    local memory_info=$(free -h | grep "Mem:" | awk '{print "Total: " $2 ", Used: " $3 ", Available: " $7}')
    log "🧠 Memory: $memory_info"
    
    # Check disk usage
    local disk_info=$(df -h "$LOG_DIR" | tail -1 | awk '{print "Used: " $3 "/" $2 " (" $5 ")"}')
    log "💾 Disk: $disk_info"
    
    # Check CPU load
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | tr -d ' ')
    log "⚡ CPU Load: $cpu_load"
}

# Function to check demo outputs
check_demo_outputs() {
    log "🎯 Checking demo outputs..."
    
    local success_count=0
    local total_count=0
    
    # Check for demo completion indicators
    for log_file in "$LOG_DIR"/*.log; do
        if [ -f "$log_file" ]; then
            local log_name=$(basename "$log_file" | sed 's/-[0-9]*\.log$//')
            local last_line=$(tail -1 "$log_file" 2>/dev/null || echo "")
            
            if echo "$last_line" | grep -q "completed successfully\|Demo.*completed\|✅\|Success"; then
                log "✅ $log_name: Completed successfully"
                ((success_count++))
            elif echo "$last_line" | grep -q "failed\|error\|❌\|Error"; then
                log "❌ $log_name: Failed or error detected"
            else
                log "⏳ $log_name: Still running or unknown status"
            fi
            ((total_count++))
        fi
    done
    
    if [ $total_count -gt 0 ]; then
        log "📊 Demo Status: $success_count/$total_count completed successfully"
    fi
}

# Function to generate status report
generate_status_report() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local report_file="$LOG_DIR/status-report-$timestamp.md"
    
    log "📊 Generating status report..."
    
    cat > "$report_file" << EOF
# Gemini Code Collaboration Status Report

**Check Time:** $(date)  
**Log Directory:** $LOG_DIR

## Process Status

EOF

    # Check MCP server
    if [ -f "$LOG_DIR/mcp-server.pid" ]; then
        local mcp_pid=$(cat "$LOG_DIR/mcp-server.pid")
        if kill -0 $mcp_pid 2>/dev/null; then
            echo "- **MCP Server**: ✅ Running (PID: $mcp_pid)" >> "$report_file"
        else
            echo "- **MCP Server**: ❌ Not running" >> "$report_file"
        fi
    else
        echo "- **MCP Server**: ❌ No PID file" >> "$report_file"
    fi
    
    # Check demo processes
    for pid_file in "$LOG_DIR"/*.pid; do
        if [ -f "$pid_file" ] && [ "$(basename "$pid_file")" != "mcp-server.pid" ]; then
            local demo_name=$(basename "$pid_file" .pid)
            local demo_pid=$(cat "$pid_file")
            if kill -0 $demo_pid 2>/dev/null; then
                echo "- **$demo_name**: ✅ Running (PID: $demo_pid)" >> "$report_file"
            else
                echo "- **$demo_name**: ❌ Not running" >> "$report_file"
            fi
        fi
    done
    
    echo "" >> "$report_file"
    echo "## System Resources" >> "$report_file"
    echo "" >> "$report_file"
    echo "- **Memory**: $(free -h | grep "Mem:" | awk '{print "Total: " $2 ", Used: " $3 ", Available: " $7}')" >> "$report_file"
    echo "- **Disk**: $(df -h "$LOG_DIR" | tail -1 | awk '{print "Used: " $3 "/" $2 " (" $5 ")"}')" >> "$report_file"
    echo "- **CPU Load**: $(uptime | awk -F'load average:' '{print $2}' | tr -d ' ')" >> "$report_file"
    
    echo "" >> "$report_file"
    echo "## Log Files" >> "$report_file"
    echo "" >> "$report_file"
    for log_file in "$LOG_DIR"/*.log; do
        if [ -f "$log_file" ]; then
            local log_name=$(basename "$log_file")
            local log_size=$(du -h "$log_file" | cut -f1)
            local log_lines=$(wc -l < "$log_file" 2>/dev/null || echo "0")
            echo "- **$log_name**: $log_size, $log_lines lines" >> "$report_file"
        fi
    done
    
    log "📄 Status report generated: $report_file"
}

# Main execution
main() {
    log "📊 Starting Gemini Code Collaboration status check"
    
    # Check process status
    log "🔍 Checking process status..."
    check_process_status "MCP Server" "$LOG_DIR/mcp-server.pid"
    
    # Check demo processes
    for pid_file in "$LOG_DIR"/*.pid; do
        if [ -f "$pid_file" ] && [ "$(basename "$pid_file")" != "mcp-server.pid" ]; then
            local demo_name=$(basename "$pid_file" .pid)
            check_process_status "$demo_name" "$pid_file"
        fi
    done
    
    # Check log files
    check_log_files
    
    # Check system resources
    check_system_resources
    
    # Check demo outputs
    check_demo_outputs
    
    # Generate status report
    generate_status_report
    
    log "✅ Status check completed!"
    log "📁 Logs directory: $LOG_DIR"
    log "📄 Status report generated"
}

# Run main function
main "$@"
