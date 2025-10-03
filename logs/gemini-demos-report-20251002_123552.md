# Gemini Code Collaboration Demo Report

**Demo Run:** 20251002_123552  
**Duration:** Thu Oct  2 12:36:54 PM PDT 2025  
**Log Directory:** /home/main/devops/hyperbolic-geometric-neural-network/logs

## Demo Results Summary

### code-embedding
```
  • Min embedding norm: 0.0912

🔍 Finding elements similar to "H2GNN.ts":
  1. BatchNode (class)
     Distance: 0.0002
     Path: pocketflow/core.ts
  2. createWordNetProcessor (function)
     Distance: 0.0002
     Path: datasets/wordnet-integration.ts
  3. code-embedding-demo.ts (file)
     Distance: 0.0003
     Path: demo/code-embedding-demo.ts

📏 Sample inter-file distance: 0.0006
📏 Sample file-to-class distance: 0.0004

✅ Code embedding analysis completed successfully!

The hyperbolic embeddings capture the hierarchical structure of your codebase,
where similar code elements are closer together in hyperbolic space.
```

### gemini-demos
```
[2025-10-02 12:35:52] 📋 Demo 1: WordNet Integration
[2025-10-02 12:35:52] 🎯 Running wordnet-test...
[2025-10-02 12:35:54] ✅ wordnet-test completed successfully
[2025-10-02 12:35:54] 📋 Demo 2: Code Embedding Analysis
[2025-10-02 12:35:54] 🎯 Running code-embedding...
[2025-10-02 12:36:48] ✅ code-embedding completed successfully
[2025-10-02 12:36:48] 📋 Demo 3: Knowledge Graph Generation
[2025-10-02 12:36:48] 🎯 Running knowledge-graph...
[2025-10-02 12:36:50] ✅ knowledge-graph completed successfully
[2025-10-02 12:36:50] 📋 Demo 4: WordNet Training Workflow
[2025-10-02 12:36:50] 🎯 Running wordnet-training...
[2025-10-02 12:36:52] ❌ wordnet-training failed or timed out
[2025-10-02 12:36:52] 📋 Demo 5: Integrated System Demo
[2025-10-02 12:36:52] 🎯 Running integrated-demo...
[2025-10-02 12:36:53] ✅ integrated-demo completed successfully
[2025-10-02 12:36:54] 📊 Demo Summary:
[2025-10-02 12:36:54]    ✅ Successful: 4/5
[2025-10-02 12:36:54]    ❌ Failed: 1/5
[2025-10-02 12:36:54]    📈 Success Rate: 80%
[2025-10-02 12:36:54] 📊 Generating detailed demo report...
```

### integrated-demo
```
```

### knowledge-graph
```
        "filePath": "/home/main/devops/hyperbolic-geometric-neural-network/src"
      },
      "position": {
        "x": 50,
        "y": 50
      }
    },
    {
      "id": "L2hvbWUvbWFpbi9k",
      "name": "Ap...

============================================================

🎉 Demo completed successfully!
The knowledge graph system can:
  ✓ Analyze codebases and generate hyperbolic embeddings
  ✓ Query relationships and similarities
  ✓ Generate code based on graph insights
  ✓ Create documentation from code structure
  ✓ Visualize code relationships in hyperbolic space
```

### wordnet-test
```
  🧠 Available concepts: dog.n.01, canine.n.02, carnivore.n.01
  💡 Answer: A carnivore is a terrestrial or aquatic flesh-eating mammal

📊 Test 6: Performance Metrics
  📊 Average embedding norm: 0.8000
  📊 Max embedding norm: 0.8000
  📊 Min embedding norm: 0.8000
  ✅ All norms < 1.0: Yes

🎉 Simple WordNet Training Test Completed Successfully!

📋 Summary:
  • Processed 3 WordNet concepts
  • Built 3 hierarchical relationships
  • Generated 3 hyperbolic embeddings
  • Validated 3 valid embeddings
  • Tested 3 QA scenarios
  • All core functionality working correctly ✅

🚀 Ready for full integration with H²GNN + PocketFlow!
```

### wordnet-training
```
/home/main/devops/hyperbolic-geometric-neural-network/src/demo/wordnet-training-demo.ts:207
if (require.main === module) {
^

ReferenceError: require is not defined in ES module scope, you can use import instead
    at <anonymous> (/home/main/devops/hyperbolic-geometric-neural-network/src/demo/wordnet-training-demo.ts:207:1)
    at ModuleJob.run (node:internal/modules/esm/module_job:377:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:689:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.9.0
```

