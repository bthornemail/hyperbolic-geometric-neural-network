# AGENTS.md

## 🤖 AI Agent Collaboration Guide for H²GNN

This document provides comprehensive guidance for AI coding agents working on the H²GNN (Hyperbolic Geometric Neural Network) project, which leverages the PocketFlow framework for collaborative development with persistent AI identity integration.

---

## 📋 Project Overview

**H²GNN** is a revolutionary, self-improving AI system for hierarchical learning and collaborative development. It leverages hyperbolic geometry to understand and reason about complex, hierarchical data structures like codebases and knowledge graphs.

### Key Features
- **Enhanced H²GNN**: Sophisticated "brain" that performs learning and reasoning on a persistent hyperbolic graph structure
- **Persistent AI Identity**: Continuous AI identity management with memory, learning, and context preservation
- **Collaborative Learning**: Shared Learning Database (Redis/PostgreSQL) for synchronizing knowledge across multiple developers
- **PocketFlow Integration**: Minimalist workflow orchestration engine for complex, multi-step tasks
- **Model Context Protocol (MCP)**: Universal language for robust communication between components
- **Agentic Development**: Built for collaborative development with AI agents using a "Tool-First" approach
- **Cursor Rules Integration**: Seamless integration with Cursor IDE for persistent development context

### Architecture
The system uses a three-tier architecture:
- **Broker (Node.js)**: Central authority with `CentralizedH2GNNManager` and `SharedLearningDatabase`
- **Provider (Web Worker)**: High-performance compute engine for H²GNN Core calculations
- **Consumer (DOM)**: Interactive user interface with React/D3 visualizations

---

## 🚀 Setup Commands

### Prerequisites
- Node.js (>=18.0.0)
- npm
- Docker (for containerized deployment)

### Initial Setup
```bash
# Clone and navigate to project
git clone <repository-url>
cd hyperbolic-geometric-neural-network

# Install dependencies
npm install

# Initialize H²GNN system
npm run mcp:server

# Start development environment
npm run dev
```

### Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Configure environment variables
export NODE_ENV=development
export H2GNN_STORAGE_PATH=./persistence
export REDIS_URL=redis://localhost:6379
```

### Docker Setup
```bash
# Start with Docker Compose
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

---

## 🏗️ Build and Test Instructions

### Development Build
```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Development build
npm run build:development
```

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:phase3
npm run test:team-collaboration

# UI testing
npm run test:ui
```

### Production Build
```bash
# Production build
npm run build:production

# Analyze bundle
npm run build:analyze
```

---

## 📝 Code Style Guidelines

### TypeScript Standards
- **Language**: TypeScript 5.9.3+
- **Formatting**: ESLint with Prettier
- **Naming**: 
  - `camelCase` for variables and functions
  - `PascalCase` for classes and interfaces
  - `UPPER_SNAKE_CASE` for constants
- **File Structure**: Organize by feature, not file type

### H²GNN Specific Guidelines
```typescript
// Use H²GNN tool-first approach
import { mcp_enhanced_h2gnn_initialize_enhanced_h2gnn_hd } from './mcp/enhanced-h2gnn';

// Always initialize system first
await mcp_enhanced_h2gnn_initialize_enhanced_h2gnn_hd({
  storagePath: "./persistence",
  maxMemories: 10000,
  consolidationThreshold: 100
});

// Use learning concepts for persistence
await mcp_enhanced_h2gnn_learn_concept_hd({
  concept: "your_concept",
  data: yourData,
  context: { domain: "appropriate_domain" },
  performance: 0.8
});
```

### PocketFlow Integration
```typescript
// Use PocketFlow for workflow orchestration
import { Node, Flow } from './pocketflow/core';

class CollaborativeAgent extends Node {
  async prep(shared: any) {
    // Always use H²GNN tools first
    const status = await mcp_enhanced_h2gnn_get_system_status_hd();
    return { context: shared.context, h2gnnStatus: status };
  }

  async exec(prepRes: any) {
    // Process with H²GNN assistance
    const memories = await mcp_enhanced_h2gnn_retrieve_memories_hd({
      query: "relevant_query",
      maxResults: 10
    });
    return { processed: true, memories };
  }
}
```

---

## 🧠 Persistent AI Identity Integration

### Identity Management System
The H²GNN system now includes a comprehensive persistent AI identity system that maintains context, learning, and memory across sessions.

#### **Identity Endpoints**
- **Health Check**: `http://localhost:3000/health`
- **System Status**: `http://localhost:3000/status`
- **Identity Management**: `http://localhost:3000/api/identities`
- **Memory System**: `http://localhost:3000/api/memories`
- **Learning System**: `http://localhost:3000/api/learn`

#### **Identity Initialization**
```typescript
// Create persistent AI identity
const identity = await fetch('http://localhost:3000/api/identities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'H²GNN Development Assistant',
    type: 'ai',
    capabilities: [
      'hyperbolic_geometry',
      'neural_networks',
      'persistent_memory',
      'code_generation',
      'architecture_design',
      'documentation',
      'testing'
    ],
    preferences: {
      learningStyle: 'hierarchical',
      communicationStyle: 'technical',
      privacyLevel: 'private',
      interactionMode: 'collaborative'
    }
  })
});
```

#### **Memory Management**
```typescript
// Store episodic memory (events, decisions)
await fetch('http://localhost:3000/api/memories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'episodic',
    content: 'Decided to use hyperbolic geometry for memory organization',
    metadata: {
      source: 'development',
      quality: 0.9,
      confidence: 0.95,
      importance: 0.8,
      tags: ['architecture', 'decision', 'hyperbolic_geometry'],
      context: {
        timestamp: new Date().toISOString(),
        project: 'h2gnn',
        component: 'memory_system'
      }
    }
  })
});

// Store semantic memory (concepts, knowledge)
await fetch('http://localhost:3000/api/memories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'semantic',
    content: 'Hyperbolic geometry enables efficient hierarchical memory organization',
    metadata: {
      source: 'learning',
      quality: 0.8,
      confidence: 0.9,
      importance: 0.7,
      tags: ['hyperbolic_geometry', 'memory', 'hierarchy'],
      context: {
        domain: 'mathematics',
        complexity: 'advanced',
        applications: ['neural_networks', 'memory_systems']
      }
    }
  })
});

// Store procedural memory (workflows, processes)
await fetch('http://localhost:3000/api/memories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'procedural',
    content: 'How to initialize H²GNN system with proper configuration',
    metadata: {
      source: 'experience',
      quality: 0.9,
      confidence: 0.95,
      importance: 0.9,
      tags: ['procedure', 'initialization', 'h2gnn'],
      context: {
        domain: 'development',
        skill_level: 'expert',
        tools: ['docker', 'nodejs', 'typescript']
      }
    }
  })
});
```

#### **Learning Integration**
```typescript
// Learn new concepts
await fetch('http://localhost:3000/api/learn', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    concept: 'persistent AI identity management',
    data: {
      description: 'Management of persistent AI identity across sessions',
      examples: ['Identity creation', 'Memory storage', 'Learning progress'],
      relationships: ['hyperbolic_geometry', 'memory_systems', 'learning_systems'],
      applications: ['AI_assistants', 'development_tools', 'collaborative_systems']
    },
    context: {
      domain: 'artificial_intelligence',
      complexity: 'advanced',
      source: 'development'
    },
    performance: 0.9
  })
});
```

#### **Cursor Rules Integration**
The system includes three comprehensive Cursor rules for persistent identity:

1. **`.cursor/rules/ai-persistence-identity.mdc`** - Core persistent identity integration
2. **`.cursor/rules/mcp-integration.mdc`** - Model Context Protocol integration  
3. **`.cursor/rules/persistent-identity-implementation.mdc`** - Practical implementation guide

These rules ensure:
- **Consistent AI Behavior**: Maintains personality and preferences across sessions
- **Context Preservation**: Remembers important decisions and learnings
- **Continuous Learning**: Improves over time through experience
- **Efficient Memory**: Uses hyperbolic geometry for optimal organization
- **Reliable Connection**: Robust error handling and recovery
- **Cursor Integration**: Seamless integration with development workflow

---

## 🔧 H²GNN Integration Guidelines

### Mandatory Tool-First Policy
**CRITICAL**: Always use built-in H²GNN tools before manual analysis:

1. **Initialize System First**
```typescript
await mcp_enhanced_h2gnn_initialize_enhanced_h2gnn_hd({
  storagePath: "./persistence",
  maxMemories: 10000,
  consolidationThreshold: 100,
  embeddingDim: 64,
  numLayers: 3,
  curvature: -1
});
```

2. **Check System Status**
```typescript
const status = await mcp_enhanced_h2gnn_get_system_status_hd();
const progress = await mcp_enhanced_h2gnn_get_learning_progress_hd();
```

3. **Use Analysis Tools**
```typescript
// Knowledge graph analysis
const analysis = await mcp_knowledge_graph_analyze_path_to_knowledge_graph_hd({
  path: "./src",
  recursive: true,
  includeContent: true
});

// AST analysis
const astAnalysis = await mcp_lsp_ast_analyze_code_ast_hd({
  code: codeToAnalyze,
  language: "typescript"
});
```

### Learning and Memory Management
```typescript
// Learn concepts with persistence
await mcp_enhanced_h2gnn_learn_concept_hd({
  concept: "concept_name",
  data: conceptData,
  context: { domain: "domain_name" },
  performance: 0.8
});

// Retrieve relevant memories
const memories = await mcp_enhanced_h2gnn_retrieve_memories_hd({
  query: "search_query",
  maxResults: 10
});

// Consolidate memories
await mcp_enhanced_h2gnn_consolidate_memories_hd();
```

---

## 🔄 PocketFlow Integration

### Workflow Design Patterns
```typescript
// Agent Pattern
class CollaborativeAgent extends Node {
  async prep(shared: any) {
    // Use H²GNN for context
    const memories = await mcp_enhanced_h2gnn_retrieve_memories_hd({
      query: shared.task,
      maxResults: 5
    });
    return { task: shared.task, context: memories };
  }

  async exec(prepRes: any) {
    // Process with H²GNN assistance
    const result = await this.processWithH2GNN(prepRes);
    return result;
  }
}

// RAG Pattern
class KnowledgeRetrievalNode extends Node {
  async exec(prepRes: any) {
    const knowledge = await mcp_knowledge_graph_query_knowledge_graph_hd({
      query: prepRes.query,
      type: "similarity",
      limit: 10
    });
    return knowledge;
  }
}
```

### Flow Orchestration
```typescript
// Create collaborative workflows
const collaborativeFlow = new Flow(
  new CollaborativeAgent()
    .next(new KnowledgeRetrievalNode())
    .next(new CodeGenerationNode())
);

// Run with shared context
await collaborativeFlow.run(sharedContext);
```

---

## 🤝 Collaboration Guidelines

### Branching Strategy
- **Main Branch**: `main` - Production-ready code
- **Development Branch**: `develop` - Integration branch
- **Feature Branches**: `feature/description` - New features
- **Agent Branches**: `agent/agent-name` - Agent-specific work

### Commit Message Format
```
type(scope): description

Examples:
feat(h2gnn): add hyperbolic distance calculation
fix(pocketflow): resolve workflow orchestration issue
docs(agents): update collaboration guidelines
test(coverage): add comprehensive test suite
```

### Code Review Process
1. **Automated Checks**: All PRs must pass linting, type checking, and tests
2. **H²GNN Validation**: Ensure proper tool usage and learning integration
3. **PocketFlow Review**: Verify workflow patterns and node implementations
4. **Collaborative Review**: Multiple agents review complex changes

### Agent Communication
```typescript
// Use MCP for agent communication
const agentMessage = {
  from: "agent_name",
  to: "target_agent",
  type: "collaboration_request",
  data: { task: "specific_task", context: sharedContext }
};

// Broadcast to all agents
await mcp_enhanced_h2gnn_learn_concept_hd({
  concept: "agent_communication",
  data: agentMessage,
  context: { domain: "collaboration" }
});
```

---

## 🧪 Testing Strategy

### Test Categories
- **Unit Tests**: Individual component testing
- **Integration Tests**: H²GNN and PocketFlow integration
- **Collaboration Tests**: Multi-agent workflows
- **Performance Tests**: System scalability and efficiency

### Test Commands
```bash
# Run specific test suites
npm run test:phase3
npm run test:team-collaboration
npm run test:coverage:analysis

# Performance testing
npm run test:phase3:performance
```

### Test Structure
```typescript
// Example collaborative test
describe('Collaborative Agent Workflow', () => {
  it('should process tasks with H²GNN assistance', async () => {
    // Initialize H²GNN
    await mcp_enhanced_h2gnn_initialize_enhanced_h2gnn_hd(config);
    
    // Create collaborative flow
    const flow = createCollaborativeFlow();
    
    // Test execution
    const result = await flow.run(testContext);
    
    // Verify H²GNN integration
    expect(result.h2gnnStatus).toBeDefined();
    expect(result.memories).toBeInstanceOf(Array);
  });
});
```

---

## 📊 Monitoring and Debugging

### System Status Monitoring
```typescript
// Check H²GNN system health
const status = await mcp_enhanced_h2gnn_get_system_status_hd();
console.log('H²GNN Status:', status);

// Monitor learning progress
const progress = await mcp_enhanced_h2gnn_get_learning_progress_hd();
console.log('Learning Progress:', progress);
```

### Debugging Tools
```bash
# View system logs
npm run docker:logs

# Check MCP server status
npm run mcp:server:dev

# Analyze codebase
npm run knowledge:analyze
```

### Performance Monitoring
```typescript
// Monitor memory usage
const memories = await mcp_enhanced_h2gnn_retrieve_memories_hd({
  query: "performance_metrics",
  maxResults: 100
});

// Check system performance
const insights = await mcp_geometric_tools_mcp_server_generate_geographic_insights({
  analysis_type: "comprehensive",
  include_recommendations: true
});
```

---

## 🚀 Deployment

### Development Deployment
```bash
# Start development environment
npm run dev

# Start MCP server
npm run mcp:server:dev

# Start with Docker
npm run docker:up
```

### Production Deployment
```bash
# Build for production
npm run build:production

# Deploy with Kubernetes
npm run k8s:deploy

# Deploy with Terraform
npm run terraform:apply
```

### Environment-Specific Commands
```bash
# Development
npm run dev
npm run mcp:server:dev

# Staging
npm run dev:staging
npm run mcp:server:staging

# Production
npm run dev:production
npm run mcp:server:prod
```

---

## 📚 Additional Resources

### Documentation
- [H²GNN Core Documentation](./docs/01-architecture/core-architecture/)
- [PocketFlow Framework Guide](./docs/04-technical/integrations/)
- [MCP Integration Guide](./docs/04-technical/mcp/)
- [Collaboration Interface](./src/integration/collaboration-interface.ts)

### Key Files
- **Core Framework**: `src/pocketflow/pocket-flow.ts`
- **Enhanced H²GNN**: `src/core/enhanced-h2gnn.ts`
- **MCP Server**: `src/mcp/h2gnn-mcp-server.ts`
- **Collaboration Interface**: `src/integration/collaboration-interface.ts`

### External Resources
- [PocketFlow GitHub](https://github.com/the-pocket/PocketFlow)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Hyperbolic Geometry Research](https://arxiv.org/abs/2412.12158)

---

## ⚠️ Important Notes

### Tool-First Policy Enforcement
- **NEVER** perform manual analysis without using H²GNN tools first
- **ALWAYS** initialize the system before any operations
- **MUST** use built-in tools for learning, memory, and analysis
- **REQUIRED** to follow the mandatory workflow hierarchy

### Collaboration Requirements
- All agents must use the shared learning database
- Communication through MCP protocol is mandatory
- Workflow orchestration must use PocketFlow patterns
- Knowledge sharing through H²GNN persistence system

### Quality Assurance
- All code must pass automated checks
- H²GNN integration must be validated
- PocketFlow patterns must be followed
- Collaborative workflows must be tested

---

## 🎯 Success Criteria

A task is considered complete when:
1. ✅ H²GNN system properly initialized and status checked
2. ✅ Persistent AI identity established and maintained
3. ✅ All mandatory tools used in correct order
4. ✅ Analysis performed using built-in tools
5. ✅ Learning integrated with persistence system
6. ✅ Knowledge graph properly utilized
7. ✅ Memory system properly managed
8. ✅ Geometric analysis completed
9. ✅ Results generated using appropriate tools
10. ✅ Collaborative workflow implemented with PocketFlow
11. ✅ Cursor rules integration validated
12. ✅ All tests passing and code quality maintained

---

*This AGENTS.md file ensures consistent, efficient collaboration between AI agents and the H²GNN development team. Follow these guidelines to maximize productivity and maintain code quality.*
