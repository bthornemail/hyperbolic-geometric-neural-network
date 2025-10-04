
# Codebase Coverage Analysis Report
=====================================

## 📊 Overall Coverage
- **Total Files**: 78
- **Tested Files**: 13
- **Untested Files**: 65
- **Coverage**: 17%

## 📋 Coverage by Category

### Analysis Components
- **Total**: 4
- **Tested**: 0
- **Coverage**: 0%
- **Untested**: analysis/advanced-ast-analyzer.ts, analysis/code-embeddings.ts, analysis/persistent-knowledge-graph.ts, analysis/system-audit-knowledge-graph.ts

### Core Components
- **Total**: 16
- **Tested**: 5
- **Coverage**: 31%
- **Untested**: core/centralized-h2gnn-config.ts, core/mcp-hd-integration.ts, core/protocol-encoders.ts, core/redis-hd-caching.ts, core/transports/ipc-transport.ts

### Datasets
- **Total**: 1
- **Tested**: 0
- **Coverage**: 0%
- **Untested**: datasets/wordnet-integration.ts

### Other Components
- **Total**: 22
- **Tested**: 1
- **Coverage**: 5%
- **Untested**: demo/code-embedding-demo.ts, demo/devops-semantic-analysis-demo.ts, demo/enhanced-h2gnn-learning-demo.ts, demo/h2gnn-self-optimization-demo.ts, demo/integrated-demo.ts

### Code Generation
- **Total**: 2
- **Tested**: 0
- **Coverage**: 0%
- **Untested**: generation/intelligent-code-generator.ts, generation/knowledge-base-integrated.ts

### Integration Components
- **Total**: 6
- **Tested**: 0
- **Coverage**: 0%
- **Untested**: integration/collaboration-interface.ts, integration/enhanced-collaboration-interface.ts, integration/lsp-ast-integration.ts, integration/obsidian-sync.ts, integration/real-time-collaboration.ts

### Neural Layers
- **Total**: 1
- **Tested**: 1
- **Coverage**: 100%
- **Untested**: None

### LLM Components
- **Total**: 3
- **Tested**: 0
- **Coverage**: 0%
- **Untested**: llm/llm-provider-manager.ts, llm/production-llm-service.ts, llm/streaming-llm-client.ts

### Mathematical Components
- **Total**: 2
- **Tested**: 2
- **Coverage**: 100%
- **Untested**: None

### MCP Servers
- **Total**: 5
- **Tested**: 2
- **Coverage**: 40%
- **Untested**: mcp/geometric-tools-mcp-server.ts, mcp/knowledge-graph-mcp-server.ts, mcp/lsp-ast-mcp-server.ts

### Refactoring Tools
- **Total**: 1
- **Tested**: 0
- **Coverage**: 0%
- **Untested**: refactoring/automated-refactoring-tool.ts

### Rules Engine
- **Total**: 1
- **Tested**: 1
- **Coverage**: 100%
- **Untested**: None

### Training Pipeline
- **Total**: 1
- **Tested**: 0
- **Coverage**: 0%
- **Untested**: training/training-pipeline.ts

### Transfer Learning
- **Total**: 3
- **Tested**: 0
- **Coverage**: 0%
- **Untested**: transfer/domain-adaptation.ts, transfer/knowledge-distillation.ts, transfer/transfer-learning-workflow.ts

### Visualization
- **Total**: 5
- **Tested**: 0
- **Coverage**: 0%
- **Untested**: visualization/3d-hyperbolic-renderer.ts, visualization/collaborative-viz.ts, visualization/concept-navigator.ts, visualization/d3-visualization-wrapper.ts, visualization/geometric-visualizer.ts

### Workflows
- **Total**: 5
- **Tested**: 1
- **Coverage**: 20%
- **Untested**: workflows/agent-workflows.ts, workflows/automated-refactoring-workflow.ts, workflows/knowledge-sharing-workflow.ts, workflows/team-standards-workflow.ts

## 🎯 Recommendations
- 🎯 Priority: Core Components has 31% coverage. Add tests for: core/centralized-h2gnn-config.ts, core/mcp-hd-integration.ts, core/protocol-encoders.ts
- 🎯 Priority: MCP Servers has 40% coverage. Add tests for: mcp/geometric-tools-mcp-server.ts, mcp/knowledge-graph-mcp-server.ts, mcp/lsp-ast-mcp-server.ts
- 🎯 Priority: Workflows has 20% coverage. Add tests for: workflows/agent-workflows.ts, workflows/automated-refactoring-workflow.ts, workflows/knowledge-sharing-workflow.ts
- 📊 65 files need test coverage
- 🔧 Run 'npm run test:coverage' to see current coverage
- 📝 Create test files for untested components

## 🚀 Next Steps
1. Run coverage analysis: `npm run test:coverage`
2. Create missing test files
3. Focus on high-priority categories first
4. Aim for 80%+ coverage across all categories
