# Knowledge Base Creator

A powerful AI-driven documentation generator that uses H²GNN (Hyperbolic Geometric Neural Network) to analyze codebases and create comprehensive documentation, essays, tutorials, and learning materials.

## 🚀 Features

- **Intelligent Code Analysis**: Uses H²GNN to understand code structure and relationships
- **Multiple Document Types**: Generate tutorials, essays, API docs, architecture guides, and more
- **Hierarchical Understanding**: Leverages hyperbolic geometry for better semantic understanding
- **Document Refinement**: Improve existing documentation with AI insights
- **Knowledge Graph**: Build and export semantic knowledge graphs from codebases
- **Multiple Formats**: Output in Markdown, HTML, PDF, or JSON
- **CLI Interface**: Easy-to-use command-line tools
- **Programmatic API**: Use in your own applications

## 📦 Installation

The Knowledge Base Creator is part of the H²GNN project. Install dependencies:

```bash
npm install
```

## 🎯 Quick Start

### 1. Analyze Your Codebase

```bash
# Analyze a TypeScript/JavaScript project
npm run knowledge:analyze -- -s ./src -o ./output

# Analyze with custom patterns
npm run knowledge:analyze -- -s ./src -o ./output --include "**/*.ts" "**/*.tsx" --exclude "**/test/**"
```

### 2. Generate Documentation

```bash
# Generate a tutorial
npm run knowledge:generate -- -s ./src -o ./output/tutorial.md -t tutorial -a beginner

# Generate API documentation
npm run knowledge:generate -- -s ./src -o ./output/api-docs.html -t api-docs -f html -a intermediate

# Generate architecture guide
npm run knowledge:generate -- -s ./src -o ./output/architecture.md -t architecture -a advanced --focus "core" "integration"
```

### 3. Complete Workflow

```bash
# Run the complete workflow: analyze -> generate -> export
npm run knowledge:workflow -- -s ./src -o ./output -t tutorial -a beginner --focus "H²GNN" "PocketFlow"
```

## 📚 Document Types

### Tutorial
Beginner-friendly step-by-step guides with examples and best practices.

```bash
npm run knowledge:generate -- -s ./src -o ./tutorial.md -t tutorial -a beginner
```

### Essay
Academic-style analysis and discussion of concepts.

```bash
npm run knowledge:generate -- -s ./src -o ./essay.md -t essay -a intermediate --style academic
```

### API Documentation
Comprehensive API reference with examples and error codes.

```bash
npm run knowledge:generate -- -s ./src -o ./api-docs.html -t api-docs -f html -a intermediate
```

### Architecture Guide
System overview with components, interactions, and deployment considerations.

```bash
npm run knowledge:generate -- -s ./src -o ./architecture.md -t architecture -a advanced
```

### Learning Guide
Educational content with progressive complexity and exercises.

```bash
npm run knowledge:generate -- -s ./src -o ./learning-guide.md -t learning-guide -a beginner
```

## 🔧 Advanced Usage

### Custom Focus Areas

```bash
# Focus on specific concepts
npm run knowledge:generate -- -s ./src -o ./output.md --focus "H²GNN" "hyperbolic-geometry" "neural-networks"
```

### Document Refinement

```bash
# Refine existing documentation
npm run knowledge:refine -- -s ./existing-doc.md --focus "clarity" "completeness"
```

### Export Knowledge Base

```bash
# Export the knowledge graph
npm run knowledge:export -- -o ./knowledge-base.json
```

### View Statistics

```bash
# Show knowledge base statistics
npm run knowledge:stats
```

## 🎨 Output Formats

### Markdown
```bash
npm run knowledge:generate -- -s ./src -o ./output.md -f markdown
```

### HTML
```bash
npm run knowledge:generate -- -s ./src -o ./output.html -f html
```

### JSON
```bash
npm run knowledge:generate -- -s ./src -o ./output.json -f json
```

## 🧠 How It Works

### 1. Code Analysis
- Scans codebase for functions, classes, interfaces, and patterns
- Extracts semantic relationships between components
- Builds a knowledge graph using H²GNN embeddings

### 2. Knowledge Extraction
- Identifies key concepts and their importance
- Analyzes code complexity and relationships
- Learns from code patterns and best practices

### 3. Document Generation
- Uses H²GNN to understand semantic relationships
- Generates content based on learned patterns
- Structures information hierarchically

### 4. Refinement
- Analyzes existing documentation
- Identifies areas for improvement
- Suggests enhancements based on knowledge graph

## 📊 Knowledge Base Statistics

The system tracks various metrics:

- **Total Concepts**: Number of identified concepts
- **Concept Types**: Distribution of functions, classes, interfaces, etc.
- **Average Complexity**: Overall code complexity score
- **Relationships**: Number of semantic relationships found
- **Source Files**: Files analyzed

## 🔌 Programmatic Usage

```typescript
import KnowledgeBaseCreator from './knowledge-base-creator';

const creator = new KnowledgeBaseCreator();

// Analyze codebase
await creator.analyzeCodebase('./src', {
  includePatterns: ['**/*.ts', '**/*.tsx'],
  excludePatterns: ['**/node_modules/**', '**/dist/**']
});

// Generate documentation
await creator.generateDocumentation(
  {
    type: 'tutorial',
    format: 'markdown',
    targetAudience: 'beginner',
    language: 'english',
    style: 'technical'
  },
  './output/tutorial.md',
  {
    focusAreas: ['H²GNN', 'PocketFlow'],
    includeExamples: true
  }
);

// Export knowledge base
await creator.exportKnowledgeBase('./output/knowledge-base.json');
```

## 🎯 Use Cases

### Documentation Generation
- **API Documentation**: Generate comprehensive API docs from code
- **Tutorials**: Create beginner-friendly learning materials
- **Architecture Guides**: Document system design and components
- **Essays**: Write analytical pieces about code concepts

### Content Refinement
- **Improve Clarity**: Make existing docs more understandable
- **Add Completeness**: Fill in missing information
- **Enhance Accuracy**: Correct and update content
- **Increase Engagement**: Make content more engaging

### Knowledge Management
- **Codebase Understanding**: Get insights into large codebases
- **Learning Paths**: Create structured learning experiences
- **Concept Mapping**: Visualize relationships between concepts
- **Pattern Recognition**: Identify common patterns and practices

## 🛠️ Configuration

### File Patterns
```bash
# Include specific file types
--include "**/*.ts" "**/*.tsx" "**/*.js" "**/*.jsx"

# Exclude directories
--exclude "**/node_modules/**" "**/dist/**" "**/test/**"
```

### File Size Limits
```bash
# Set maximum file size
--max-file-size 100000
```

### Content Length
```bash
# Limit content length
--max-length 10000
```

## 📈 Performance Tips

1. **Use Focus Areas**: Specify relevant concepts to improve relevance
2. **Exclude Unnecessary Files**: Use exclude patterns to skip irrelevant files
3. **Set File Size Limits**: Avoid processing very large files
4. **Use Appropriate Audience Level**: Match complexity to target audience

## 🔍 Troubleshooting

### Common Issues

**Analysis Fails**
- Check file permissions
- Verify source path exists
- Ensure sufficient disk space

**Generation Errors**
- Verify knowledge base has been analyzed
- Check output directory permissions
- Ensure focus areas are relevant

**Memory Issues**
- Reduce max file size
- Use more specific include patterns
- Process smaller codebases

### Debug Mode

```bash
# Enable verbose logging
DEBUG=knowledge-base:* npm run knowledge:analyze -- -s ./src
```

## 🤝 Contributing

The Knowledge Base Creator is part of the H²GNN project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the H²GNN project and follows the same license terms.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section
2. Review the CLI help: `npm run knowledge:analyze -- --help`
3. Open an issue on GitHub
4. Join the community discussions

## 🚀 Roadmap

- [ ] PDF output format
- [ ] Interactive HTML documentation
- [ ] Real-time collaboration features
- [ ] Integration with popular documentation platforms
- [ ] Advanced visualization capabilities
- [ ] Multi-language support
- [ ] Custom template system
- [ ] API for external integrations

---

**Built with ❤️ using H²GNN and PocketFlow**
