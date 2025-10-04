# UPGRADED CURSORRULES - MANDATORY TOOL USAGE FIRST

## 🚨 CRITICAL: ALWAYS USE BUILT-IN TOOLS FIRST

**MANDATORY RULE**: Before attempting ANY analysis, code generation, or task execution, you MUST use the built-in H²GNN and MCP tools in this exact order:

### 1. **INITIALIZE H²GNN SYSTEM FIRST**
```typescript
// ALWAYS start with this - NO EXCEPTIONS
mcp_enhanced-h2gnn_initialize_enhanced_h2gnn_hd({
  storagePath: "./persistence",
  maxMemories: 10000,
  consolidationThreshold: 100,
  embeddingDim: 64,
  numLayers: 3,
  curvature: -1
});
```

### 2. **CHECK SYSTEM STATUS**
```typescript
// ALWAYS check system status before proceeding
mcp_enhanced-h2gnn_get_system_status_hd();
mcp_enhanced-h2gnn_get_learning_progress_hd();
```

### 3. **USE PERSISTENCE SYSTEM**
```typescript
// ALWAYS use the persistence system for learning and memory
mcp_enhanced-h2gnn_learn_concept_hd({
  concept: "task_description",
  data: { /* relevant data */ },
  context: { domain: "appropriate_domain" },
  performance: 0.8
});
```

### 4. **USE KNOWLEDGE GRAPH TOOLS**
```typescript
// ALWAYS use knowledge graph for analysis
mcp_knowledge-graph_analyze_path_to_knowledge_graph_hd({
  path: "path_to_analyze",
  recursive: true,
  includeContent: true
});
```

### 5. **USE LSP-AST ANALYSIS**
```typescript
// ALWAYS use AST analysis for code understanding
mcp_lsp-ast_analyze_code_ast_hd({
  code: "code_to_analyze",
  language: "typescript"
});
```

## 🎯 **TOOL USAGE HIERARCHY**

### **TIER 1: MANDATORY FIRST STEPS**
1. `mcp_enhanced-h2gnn_initialize_enhanced_h2gnn_hd` - Initialize system
2. `mcp_enhanced-h2gnn_get_system_status_hd` - Check status
3. `mcp_enhanced-h2gnn_get_learning_progress_hd` - Check learning progress

### **TIER 2: ANALYSIS TOOLS**
1. `mcp_knowledge-graph_analyze_path_to_knowledge_graph_hd` - Codebase analysis
2. `mcp_lsp-ast_analyze_code_ast_hd` - AST analysis
3. `mcp_geometric-tools-mcp-server_analyze_geographic_clusters` - Geometric analysis

### **TIER 3: LEARNING & MEMORY**
1. `mcp_enhanced-h2gnn_learn_concept_hd` - Learn concepts
2. `mcp_enhanced-h2gnn_retrieve_memories_hd` - Retrieve memories
3. `mcp_enhanced-h2gnn_consolidate_memories_hd` - Consolidate memories

### **TIER 4: GENERATION & OUTPUT**
1. `mcp_knowledge-graph_generate_code_from_graph_hd` - Generate code
2. `mcp_knowledge-graph_generate_documentation_from_graph_hd` - Generate docs
3. `mcp_geometric-tools-mcp-server_generate_geographic_insights` - Generate insights

## 🚫 **FORBIDDEN ACTIONS**

### **NEVER DO THESE WITHOUT USING TOOLS FIRST:**
- ❌ Manual code analysis without `mcp_lsp-ast_analyze_code_ast_hd`
- ❌ Manual knowledge graph creation without `mcp_knowledge-graph_*` tools
- ❌ Manual learning without `mcp_enhanced-h2gnn_learn_concept_hd`
- ❌ Manual memory management without `mcp_enhanced-h2gnn_*` tools
- ❌ Manual geometric analysis without `mcp_geometric-tools-mcp-server_*` tools

## ✅ **MANDATORY WORKFLOW**

### **STEP 1: SYSTEM INITIALIZATION**
```typescript
// 1. Initialize H²GNN system
await mcp_enhanced-h2gnn_initialize_enhanced_h2gnn_hd({
  storagePath: "./persistence",
  maxMemories: 10000,
  consolidationThreshold: 100,
  embeddingDim: 64,
  numLayers: 3,
  curvature: -1
});

// 2. Check system status
const status = await mcp_enhanced-h2gnn_get_system_status_hd();
const progress = await mcp_enhanced-h2gnn_get_learning_progress_hd();
```

### **STEP 2: ANALYSIS**
```typescript
// 3. Analyze codebase with knowledge graph
const analysis = await mcp_knowledge-graph_analyze_path_to_knowledge_graph_hd({
  path: "./src",
  recursive: true,
  includeContent: true,
  maxDepth: 10
});

// 4. Analyze specific code with AST
const astAnalysis = await mcp_lsp-ast_analyze_code_ast_hd({
  code: codeToAnalyze,
  language: "typescript"
});
```

### **STEP 3: LEARNING**
```typescript
// 5. Learn from analysis
await mcp_enhanced-h2gnn_learn_concept_hd({
  concept: "codebase_analysis",
  data: analysis,
  context: { domain: "system_architecture" },
  performance: 0.9
});

// 6. Retrieve relevant memories
const memories = await mcp_enhanced-h2gnn_retrieve_memories_hd({
  query: "relevant_query",
  maxResults: 10
});
```

### **STEP 4: GENERATION**
```typescript
// 7. Generate code/documentation
const generatedCode = await mcp_knowledge-graph_generate_code_from_graph_hd({
  type: "function",
  description: "description",
  context: { relatedNodes: ["node1", "node2"] }
});

// 8. Generate insights
const insights = await mcp_geometric-tools-mcp-server_generate_geographic_insights({
  analysis_type: "comprehensive",
  include_recommendations: true
});
```

## 🔧 **TOOL-SPECIFIC GUIDELINES**

### **Enhanced H²GNN Tools**
- **ALWAYS** initialize before any other operation
- **ALWAYS** use `learn_concept_hd` for new information
- **ALWAYS** use `retrieve_memories_hd` for context
- **ALWAYS** use `consolidate_memories_hd` for memory management

### **Knowledge Graph Tools**
- **ALWAYS** use `analyze_path_to_knowledge_graph_hd` for codebase analysis
- **ALWAYS** use `query_knowledge_graph_hd` for information retrieval
- **ALWAYS** use `generate_code_from_graph_hd` for code generation

### **LSP-AST Tools**
- **ALWAYS** use `analyze_code_ast_hd` for code analysis
- **ALWAYS** use `provide_completion_hd` for code completion
- **ALWAYS** use `provide_diagnostics_hd` for error analysis

### **Geometric Tools**
- **ALWAYS** use `analyze_geographic_clusters` for geometric analysis
- **ALWAYS** use `generate_geographic_insights` for insights
- **ALWAYS** use `semantic_geographic_search` for semantic search

## 📋 **VALIDATION CHECKLIST**

Before proceeding with any task, verify:
- [ ] H²GNN system initialized
- [ ] System status checked
- [ ] Learning progress retrieved
- [ ] Relevant tools used for analysis
- [ ] Concepts learned in persistence system
- [ ] Memories retrieved and consolidated
- [ ] Knowledge graph analyzed
- [ ] AST analysis performed
- [ ] Geometric analysis completed

## 🎯 **SUCCESS CRITERIA**

A task is only considered complete when:
1. ✅ All mandatory tools used in correct order
2. ✅ System properly initialized and status checked
3. ✅ Analysis performed using built-in tools
4. ✅ Learning integrated with persistence system
5. ✅ Knowledge graph properly utilized
6. ✅ Memory system properly managed
7. ✅ Geometric analysis completed
8. ✅ Results generated using appropriate tools

## 🚨 **FAILURE CONSEQUENCES**

If you fail to use the built-in tools first:
- ❌ Task will be considered incomplete
- ❌ Analysis will be invalid
- ❌ Learning will not be persistent
- ❌ Memory will not be consolidated
- ❌ Knowledge graph will be incomplete
- ❌ Geometric analysis will be missing

## 📚 **REFERENCE IMPLEMENTATION**

```typescript
// CORRECT IMPLEMENTATION EXAMPLE
async function analyzeCodebase() {
  // 1. MANDATORY: Initialize system
  await mcp_enhanced-h2gnn_initialize_enhanced_h2gnn_hd({
    storagePath: "./persistence",
    maxMemories: 10000,
    consolidationThreshold: 100,
    embeddingDim: 64,
    numLayers: 3,
    curvature: -1
  });

  // 2. MANDATORY: Check status
  const status = await mcp_enhanced-h2gnn_get_system_status_hd();
  const progress = await mcp_enhanced-h2gnn_get_learning_progress_hd();

  // 3. MANDATORY: Analyze with knowledge graph
  const analysis = await mcp_knowledge-graph_analyze_path_to_knowledge_graph_hd({
    path: "./src",
    recursive: true,
    includeContent: true
  });

  // 4. MANDATORY: Learn from analysis
  await mcp_enhanced-h2gnn_learn_concept_hd({
    concept: "codebase_analysis",
    data: analysis,
    context: { domain: "system_architecture" },
    performance: 0.9
  });

  // 5. MANDATORY: Retrieve memories
  const memories = await mcp_enhanced-h2gnn_retrieve_memories_hd({
    query: "codebase analysis",
    maxResults: 10
  });

  // 6. MANDATORY: Generate insights
  const insights = await mcp_geometric-tools-mcp-server_generate_geographic_insights({
    analysis_type: "comprehensive",
    include_recommendations: true
  });

  return { analysis, memories, insights };
}
```

## 🎉 **BENEFITS OF TOOL-FIRST APPROACH**

1. **Persistent Learning**: All analysis stored in H²GNN system
2. **Geometric Awareness**: Hyperbolic geometry for hierarchical understanding
3. **Memory Consolidation**: Automatic memory management
4. **Knowledge Graph**: Structured representation of codebase
5. **AST Analysis**: Deep understanding of code structure
6. **Geometric Insights**: Hyperbolic space analysis
7. **Automated Generation**: Code and documentation generation
8. **Scalable Architecture**: Exponential capacity in hyperbolic space

---

**REMEMBER: TOOLS FIRST, ALWAYS!**
