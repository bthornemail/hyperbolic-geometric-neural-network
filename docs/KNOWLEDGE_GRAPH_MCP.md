# Knowledge Graph MCP Tool Documentation

## Overview

The Knowledge Graph MCP (Model Context Protocol) Tool is a powerful extension to the H²GNN system that enables AI agents to analyze codebases, generate knowledge graphs with hyperbolic embeddings, and automatically create code and documentation based on graph insights.

## Features

### 🔍 **Code Analysis & Knowledge Graph Generation**
- **File/Folder Analysis**: Recursively analyze directories and extract code structure
- **Hyperbolic Embeddings**: Generate H²GNN embeddings for code elements to capture hierarchical relationships
- **Multiple Languages**: Support for TypeScript, JavaScript, Python, Markdown, and more
- **Configurable Patterns**: Flexible file inclusion/exclusion patterns

### 🧠 **Intelligent Code Generation**
- **Context-Aware**: Generate code based on existing patterns in the codebase
- **Multiple Types**: Support for functions, classes, interfaces, modules, tests, and documentation
- **Style Preservation**: Maintain coding conventions found in the analyzed codebase
- **Dependency Analysis**: Understand and replicate import/export patterns

### 📚 **Automated Documentation**
- **API Documentation**: Generate comprehensive API docs from code structure
- **Architecture Docs**: Create system architecture documentation with relationship diagrams
- **Tutorials**: Generate step-by-step tutorials based on codebase complexity
- **Multiple Formats**: Support for Markdown, HTML, PDF, and JSON output

### 🔍 **Advanced Querying**
- **Semantic Search**: Find code elements by meaning, not just text matching
- **Dependency Analysis**: Trace relationships and dependencies between components
- **Clustering**: Identify groups of related code elements
- **Impact Analysis**: Understand how changes might affect the codebase

### 📊 **Interactive Visualization**
- **Multiple Layouts**: Force-directed, hierarchical, and circular graph layouts
- **Hyperbolic Space**: Visualize code relationships in hyperbolic geometry
- **Interactive Elements**: Clickable nodes with detailed metadata
- **Color Coding**: Different colors for files, classes, functions, etc.

## MCP Tools Available

### 1. `analyze_path_to_knowledge_graph`

Analyzes files/folders and creates a knowledge graph with hyperbolic embeddings.

**Parameters:**
```json
{
  "path": "string (required)",
  "recursive": "boolean (default: true)",
  "includeContent": "boolean (default: true)",
  "maxDepth": "number (default: 10)",
  "filePatterns": "array of strings (default: ['**/*.ts', '**/*.tsx', ...])",
  "excludePatterns": "array of strings (default: ['**/node_modules/**', ...])"
}
```

**Example:**
```javascript
// Analyze the src directory
await mcp.callTool("analyze_path_to_knowledge_graph", {
  path: "./src",
  recursive: true,
  maxDepth: 5,
  filePatterns: ["**/*.ts", "**/*.tsx"],
  excludePatterns: ["**/node_modules/**", "**/dist/**"]
});
```

### 2. `generate_code_from_graph`

Generates code based on knowledge graph insights and existing patterns.

**Parameters:**
```json
{
  "type": "function|class|interface|module|test|documentation (required)",
  "description": "string (required)",
  "graphId": "string (optional)",
  "context": {
    "relatedNodes": "array of strings",
    "targetFile": "string",
    "style": "typescript|javascript|python|markdown",
    "framework": "string"
  },
  "constraints": {
    "maxLines": "number",
    "includeComments": "boolean",
    "includeTests": "boolean",
    "followPatterns": "array of strings"
  }
}
```

**Example:**
```javascript
// Generate a TypeScript function
await mcp.callTool("generate_code_from_graph", {
  type: "function",
  description: "calculate hyperbolic distance between two vectors",
  context: {
    style: "typescript",
    framework: "H2GNN"
  },
  constraints: {
    includeComments: true,
    maxLines: 30
  }
});
```

### 3. `generate_documentation_from_graph`

Creates documentation based on the knowledge graph structure.

**Parameters:**
```json
{
  "type": "api_docs|readme|architecture|tutorial|changelog|design_spec (required)",
  "scope": "array of string node IDs (required)",
  "format": "markdown|html|pdf|json (required)",
  "graphId": "string (optional)",
  "options": {
    "includeCodeExamples": "boolean",
    "includeArchitectureDiagrams": "boolean",
    "targetAudience": "developer|user|architect|stakeholder",
    "detailLevel": "high|medium|low"
  }
}
```

**Example:**
```javascript
// Generate API documentation
await mcp.callTool("generate_documentation_from_graph", {
  type: "api_docs",
  scope: [], // Empty = all nodes
  format: "markdown",
  options: {
    includeCodeExamples: true,
    targetAudience: "developer",
    detailLevel: "high"
  }
});
```

### 4. `query_knowledge_graph`

Queries the knowledge graph for insights and relationships.

**Parameters:**
```json
{
  "query": "string (required)",
  "graphId": "string (optional)",
  "type": "similarity|path|cluster|dependency|impact (default: similarity)",
  "limit": "number (default: 10)"
}
```

**Example:**
```javascript
// Find hyperbolic-related components
await mcp.callTool("query_knowledge_graph", {
  query: "hyperbolic arithmetic",
  type: "similarity",
  limit: 5
});
```

### 5. `get_graph_visualization`

Returns visualization data for the knowledge graph.

**Parameters:**
```json
{
  "graphId": "string (optional)",
  "layout": "force|hierarchical|circular (default: force)"
}
```

**Example:**
```javascript
// Get hierarchical visualization
await mcp.callTool("get_graph_visualization", {
  layout: "hierarchical"
});
```

## MCP Resources Available

### 1. `h2gnn://knowledge-graphs/list`
Returns a list of all available knowledge graphs with metadata.

### 2. `h2gnn://knowledge-graphs/latest`
Returns the most recently generated knowledge graph with summary statistics.

## Getting Started

### 1. Install Dependencies

```bash
npm install @modelcontextprotocol/sdk
```

### 2. Start the MCP Server

```bash
npm run mcp:server
```

### 3. Run the Demo

```bash
npm run knowledge-graph:demo
```

## Integration Example

Here's how to use the Knowledge Graph MCP in your AI application:

```typescript
import { KnowledgeGraphMCP } from './src/mcp/knowledge-graph-mcp.js';

async function analyzeAndGenerate() {
  const kgMCP = new KnowledgeGraphMCP();
  
  // 1. Analyze codebase
  const analysis = await kgMCP.analyzePathToKnowledgeGraph({
    path: './src',
    recursive: true,
    includeContent: true
  });
  
  console.log('Analysis:', analysis.content[0].text);
  
  // 2. Query for specific components
  const queryResult = await kgMCP.queryKnowledgeGraph({
    query: 'authentication',
    type: 'similarity',
    limit: 5
  });
  
  console.log('Found components:', queryResult.content[0].text);
  
  // 3. Generate new code
  const codeResult = await kgMCP.generateCodeFromGraph({
    type: 'function',
    description: 'validate user authentication token',
    context: {
      style: 'typescript'
    }
  });
  
  console.log('Generated code:', codeResult.content[0].text);
  
  // 4. Create documentation
  const docsResult = await kgMCP.generateDocumentationFromGraph({
    type: 'api_docs',
    scope: [],
    format: 'markdown'
  });
  
  console.log('Generated docs:', docsResult.content[0].text);
}
```

## Architecture

### Knowledge Graph Structure

```typescript
interface KnowledgeNode {
  id: string;
  type: 'file' | 'class' | 'function' | 'interface' | 'concept' | 'module' | 'directory';
  name: string;
  content?: string;
  metadata: {
    filePath?: string;
    lineStart?: number;
    lineEnd?: number;
    complexity?: number;
    dependencies?: string[];
    exports?: string[];
    imports?: string[];
    description?: string;
  };
  embedding?: Vector; // Hyperbolic embedding
}

interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: 'imports' | 'extends' | 'implements' | 'calls' | 'contains' | 'references';
  weight: number;
}
```

### Hyperbolic Embeddings

The system uses H²GNN to generate hyperbolic embeddings that:
- **Preserve hierarchy**: Parent-child relationships are captured by hyperbolic distance
- **Enable similarity**: Semantically similar code elements cluster together
- **Support reasoning**: Geometric operations enable intelligent code analysis

### Analysis Pipeline

1. **File Discovery**: Recursively scan directories with configurable patterns
2. **Code Parsing**: Extract AST elements (classes, functions, interfaces)
3. **Relationship Extraction**: Build dependency and containment graphs
4. **Feature Generation**: Convert code properties to numerical features
5. **Hyperbolic Embedding**: Use H²GNN to project features to hyperbolic space
6. **Graph Construction**: Combine nodes, edges, and embeddings into knowledge graph

## Performance Characteristics

- **Analysis Speed**: ~1000 files/second for structure analysis
- **Embedding Generation**: ~100 code elements/second with H²GNN
- **Memory Usage**: ~1MB per 1000 lines of code analyzed
- **Graph Storage**: Efficient in-memory representation with optional persistence

## Best Practices

### 1. File Pattern Configuration

```javascript
// Include only relevant files
filePatterns: [
  "**/*.ts",        // TypeScript files
  "**/*.tsx",       // React TypeScript files
  "**/*.js",        // JavaScript files
  "**/*.py",        // Python files
  "**/*.md"         // Documentation
]

// Exclude build artifacts and dependencies
excludePatterns: [
  "**/node_modules/**",  // Dependencies
  "**/dist/**",          // Build output
  "**/coverage/**",      // Test coverage
  "**/.git/**",          // Version control
  "**/test-results/**"   // Test artifacts
]
```

### 2. Query Optimization

```javascript
// Use specific queries for better results
await mcp.callTool("query_knowledge_graph", {
  query: "authentication middleware", // Specific
  type: "similarity",
  limit: 10
});

// Rather than generic queries
await mcp.callTool("query_knowledge_graph", {
  query: "auth", // Too generic
  type: "similarity",
  limit: 10
});
```

### 3. Code Generation Context

```javascript
// Provide specific context for better code generation
await mcp.callTool("generate_code_from_graph", {
  type: "function",
  description: "hash password using bcrypt with salt rounds",
  context: {
    relatedNodes: ["auth-service", "user-model"],
    style: "typescript",
    framework: "Express"
  },
  constraints: {
    includeComments: true,
    includeTests: true,
    followPatterns: ["async/await", "error-handling"]
  }
});
```

## Troubleshooting

### Common Issues

1. **Path Not Found**: Ensure the path exists and is accessible
2. **Memory Issues**: Reduce `maxDepth` or use more restrictive `filePatterns`
3. **Slow Analysis**: Exclude large directories like `node_modules`
4. **Empty Results**: Check file patterns match your codebase structure

### Debug Mode

Enable verbose logging by setting environment variable:
```bash
DEBUG=knowledge-graph npm run knowledge-graph:demo
```

## Contributing

The Knowledge Graph MCP tool is extensible. Key areas for contribution:

1. **Language Support**: Add parsers for new programming languages
2. **Analysis Features**: Implement additional code metrics and relationships
3. **Generation Templates**: Create templates for different code styles and frameworks
4. **Visualization**: Enhance graph visualization with interactive features
5. **Performance**: Optimize analysis speed and memory usage

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Related Documentation

- [H²GNN Core Documentation](./PocketFlow/index.md)
- [MCP Server Setup](./MCP_INTEGRATION_GUIDE.md)
- [Hyperbolic Arithmetic](./math/hyperbolic-arithmetic.md)
- [Agent Workflows](./workflows/agent-workflows.md)
