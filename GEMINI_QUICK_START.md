# Gemini Agent Quick Start Guide

## 🚀 Quick Setup

### 1. Run the Setup Script
```bash
# Make the script executable (if not already done)
chmod +x scripts/setup-gemini-agent.sh

# Run the setup script
./scripts/setup-gemini-agent.sh
```

### 2. Verify Installation
```bash
# Test the Gemini agent integration
./scripts/test-gemini-agent.sh
```

### 3. Start Using Gemini CLI
```bash
# Basic usage
gemini -p "Analyze the codebase using H²GNN tools and generate insights"

# Code generation
gemini -p "Generate a new function using the knowledge graph and H²GNN analysis"

# Documentation generation
gemini -p "Create comprehensive documentation using H²GNN knowledge graph"
```

## 📁 Configuration Files

The setup creates the following configuration files in `.gemini/`:

- **`settings.json`**: H²GNN tool configuration with 19 prioritized tools
- **`GEMINI.md`**: Project guide and mandatory workflow
- **`memport.md`**: Memory management configuration
- **`gemini-md-config.json`**: Markdown processing configuration

## 🔧 Key Features

### **Tool-First Policy**
- **Mandatory H²GNN Tools**: 8 mandatory tools must be used in order
- **Priority System**: 19 tools with priority ordering
- **MCP Integration**: 12 specialized MCP servers
- **Persistence System**: Memory and learning integration

### **Mandatory Workflow**
1. **Initialize H²GNN System** - `initialize_enhanced_h2gnn_hd`
2. **Check System Status** - `get_system_status_hd`
3. **Check Learning Progress** - `get_learning_progress_hd`
4. **Learn Concepts** - `learn_concept_hd`
5. **Retrieve Memories** - `retrieve_memories_hd`
6. **Analyze with Knowledge Graph** - `analyze_path_to_knowledge_graph_hd`
7. **Analyze with AST** - `analyze_code_ast_hd`
8. **Consolidate Memories** - `consolidate_memories_hd`

## 🎯 Usage Examples

### **Basic Analysis**
```bash
gemini -p "Analyze the codebase using H²GNN tools and generate insights"
```

### **Code Generation**
```bash
gemini -p "Generate a new function using the knowledge graph and H²GNN analysis"
```

### **Documentation Generation**
```bash
gemini -p "Create comprehensive documentation using H²GNN knowledge graph"
```

### **Memory Management**
```bash
gemini -p "Consolidate memories and optimize the H²GNN system"
```

### **Geometric Analysis**
```bash
gemini -p "Analyze geographic clustering patterns using hyperbolic geometry"
```

## 🔍 Monitoring and Debugging

### **Check System Status**
```bash
# Check Gemini agent status
./scripts/check-gemini-status.sh

# View logs
ls -la logs/
```

### **Test Integration**
```bash
# Run comprehensive tests
./scripts/test-gemini-agent.sh

# Run specific H²GNN tests
npm run test:phase3
```

## 📊 Benefits

### **Persistent Learning**
- All analysis stored in H²GNN system
- Continuous learning from code and interactions
- Knowledge graph integration

### **Geometric Awareness**
- Hyperbolic geometry for hierarchical understanding
- Geometric analysis and clustering
- Spatial relationship understanding

### **Tool-First Approach**
- Mandatory use of built-in tools
- Structured workflow enforcement
- Quality assurance and validation

### **Scalable Architecture**
- Exponential capacity in hyperbolic space
- Distributed learning and collaboration
- Memory optimization and consolidation

## 🚨 Important Notes

### **Tool-First Policy Enforcement**
- **NEVER** perform manual analysis without using H²GNN tools first
- **ALWAYS** initialize the system before any operations
- **MUST** use built-in tools for learning, memory, and analysis
- **REQUIRED** to follow the mandatory workflow hierarchy

### **Quality Assurance**
- All code must pass automated checks
- H²GNN integration must be validated
- PocketFlow patterns must be followed
- Collaborative workflows must be tested

## 🆘 Troubleshooting

### **Common Issues**

#### **Gemini CLI Not Found**
```bash
# Install Gemini CLI
npm install -g @google/gemini-cli

# Verify installation
gemini --help
```

#### **Configuration Issues**
```bash
# Check configuration files
ls -la .gemini/

# Validate JSON files
jq . .gemini/settings.json
jq . .gemini/gemini-md-config.json
```

#### **Integration Issues**
```bash
# Run test script
./scripts/test-gemini-agent.sh

# Check system status
./scripts/check-gemini-status.sh
```

### **Debug Commands**
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Gemini CLI version
gemini --version

# Check system resources
free -h
df -h
```

## 📚 Additional Resources

### **Documentation**
- **`.gemini/GEMINI.md`**: Detailed project guide and workflow
- **`.gemini/memport.md`**: Memory management configuration
- **`AGENTS.md`**: AI agent collaboration guide
- **`README.md`**: Project overview and setup

### **Scripts**
- **`scripts/setup-gemini-agent.sh`**: Complete setup script
- **`scripts/test-gemini-agent.sh`**: Integration testing
- **`scripts/check-gemini-status.sh`**: Status monitoring

### **Configuration**
- **`.gemini/settings.json`**: Tool configuration and priorities
- **`.gemini/gemini-md-config.json`**: Markdown processing
- **`package.json`**: Project dependencies and scripts

## 🎯 Success Criteria

A task is considered complete when:
1. ✅ H²GNN system initialized and status checked
2. ✅ All mandatory tools used in correct order
3. ✅ Analysis performed using built-in tools
4. ✅ Learning integrated with persistence system
5. ✅ Knowledge graph properly utilized
6. ✅ Memory system properly managed
7. ✅ Geometric analysis completed
8. ✅ Results generated using appropriate tools
9. ✅ Collaborative workflow implemented with PocketFlow
10. ✅ All tests passing and code quality maintained

---

*This quick start guide provides everything needed to get started with the Gemini agent for H²GNN development. Follow the tool-first approach and mandatory workflow for optimal results.*
