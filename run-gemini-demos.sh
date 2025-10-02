#!/bin/bash

# Run Gemini Code Collaboration Demos
# This script runs the H²GNN demos to test Gemini collaboration features

set -e

echo "🚀 Starting Gemini Code Collaboration Demos"
echo "============================================"

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create logs directory
mkdir -p logs
LOG_DIR="$SCRIPT_DIR/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/gemini-demos-$TIMESTAMP.log"
}

# Function to run a demo
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

# Function to run all demos
run_all_demos() {
    log "🎯 Starting comprehensive Gemini collaboration demos..."
    
    local success_count=0
    local total_count=0
    
    # Demo 1: WordNet Integration
    log "📋 Demo 1: WordNet Integration"
    if run_demo "wordnet-test" "src/demo/simple-wordnet-test.ts" 120; then
        ((success_count++))
    fi
    ((total_count++))
    
    # Demo 2: Code Embedding Demo
    log "📋 Demo 2: Code Embedding Analysis"
    if run_demo "code-embedding" "src/demo/code-embedding-demo.ts" 180; then
        ((success_count++))
    fi
    ((total_count++))
    
    # Demo 3: Knowledge Graph Demo
    log "📋 Demo 3: Knowledge Graph Generation"
    if run_demo "knowledge-graph" "src/demo/knowledge-graph-demo.ts" 240; then
        ((success_count++))
    fi
    ((total_count++))
    
    # Demo 4: WordNet Training Demo
    log "📋 Demo 4: WordNet Training Workflow"
    if run_demo "wordnet-training" "src/demo/wordnet-training-demo.ts" 180; then
        ((success_count++))
    fi
    ((total_count++))
    
    # Demo 5: Integrated Demo
    log "📋 Demo 5: Integrated System Demo"
    if run_demo "integrated-demo" "src/demo/integrated-demo.ts" 360; then
        ((success_count++))
    fi
    ((total_count++))
    
    # Generate summary
    log "📊 Demo Summary:"
    log "   ✅ Successful: $success_count/$total_count"
    log "   ❌ Failed: $((total_count - success_count))/$total_count"
    log "   📈 Success Rate: $(( (success_count * 100) / total_count ))%"
    
    return $((total_count - success_count))
}

# Function to generate detailed report
generate_report() {
    log "📊 Generating detailed demo report..."
    
    local report_file="$LOG_DIR/gemini-demos-report-$TIMESTAMP.md"
    
    cat > "$report_file" << EOF
# Gemini Code Collaboration Demo Report

**Demo Run:** $TIMESTAMP  
**Duration:** $(date)  
**Log Directory:** $LOG_DIR

## Demo Results Summary

EOF

    # Add individual demo results
    for log_file in "$LOG_DIR"/*-$TIMESTAMP.log; do
        if [ -f "$log_file" ]; then
            local demo_name=$(basename "$log_file" | sed "s/-$TIMESTAMP.log//")
            echo "### $demo_name" >> "$report_file"
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
    log "🎯 Starting Gemini Code Collaboration Demo Suite"
    log "📁 Working directory: $SCRIPT_DIR"
    log "📁 Log directory: $LOG_DIR"
    
    # Run all demos
    local failed_demos=0
    if ! run_all_demos; then
        failed_demos=$?
    fi
    
    # Generate report
    generate_report
    
    # Final status
    if [ $failed_demos -eq 0 ]; then
        log "🎉 All demos completed successfully!"
        log "📊 Check logs in: $LOG_DIR"
        log "📄 Report: $LOG_DIR/gemini-demos-report-$TIMESTAMP.md"
        exit 0
    else
        log "⚠️  Some demos failed ($failed_demos failures)"
        log "📊 Check logs in: $LOG_DIR"
        log "📄 Report: $LOG_DIR/gemini-demos-report-$TIMESTAMP.md"
        exit 1
    fi
}

# Run main function
main "$@"
