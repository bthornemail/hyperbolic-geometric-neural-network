/**
 * Code Embedding Visualizer Component
 * 
 * Visualizes hyperbolic embeddings of code elements in an interactive way.
 * Shows the hierarchical structure and relationships of the codebase.
 */

import React, { useEffect, useRef, useState } from 'react';
import { CodeElement, CodeHierarchy } from '../analysis/code-embeddings';
import { createVector } from '../math/hyperbolic-arithmetic';

interface VisualizationNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  element: CodeElement;
}

interface VisualizationEdge {
  from: string;
  to: string;
  type: string;
  weight: number;
}

// Simulate code analysis for browser demo
async function simulateCodeAnalysis(): Promise<CodeHierarchy> {
  // Create demo code elements based on our actual project structure
  const elements: CodeElement[] = [
    {
      id: 'src/core/H2GNN.ts',
      type: 'file',
      name: 'H2GNN.ts',
      filePath: 'src/core/H2GNN.ts',
      content: '// H²GNN core implementation',
      dependencies: [],
      exports: ['HyperbolicGeometricHGN'],
      imports: ['hyperbolic-arithmetic'],
      complexity: 45,
      lineCount: 572,
      embedding: createVector(Array.from({length: 64}, () => (Math.random() - 0.5) * 0.1))
    },
    {
      id: 'src/math/hyperbolic-arithmetic.ts',
      type: 'file',
      name: 'hyperbolic-arithmetic.ts',
      filePath: 'src/math/hyperbolic-arithmetic.ts',
      content: '// Hyperbolic arithmetic operations',
      dependencies: [],
      exports: ['HyperbolicArithmetic'],
      imports: [],
      complexity: 38,
      lineCount: 425,
      embedding: createVector(Array.from({length: 64}, () => (Math.random() - 0.5) * 0.1))
    },
    {
      id: 'src/pocketflow/core.ts',
      type: 'file',
      name: 'core.ts',
      filePath: 'src/pocketflow/core.ts',
      content: '// PocketFlow core framework',
      dependencies: [],
      exports: ['Flow', 'Node'],
      imports: [],
      complexity: 32,
      lineCount: 380,
      embedding: createVector(Array.from({length: 64}, () => (Math.random() - 0.5) * 0.1))
    },
    {
      id: 'src/analysis/code-embeddings.ts',
      type: 'file', 
      name: 'code-embeddings.ts',
      filePath: 'src/analysis/code-embeddings.ts',
      content: '// Code embedding generator',
      dependencies: [],
      exports: ['CodeEmbeddingGenerator'],
      imports: ['H2GNN', 'hyperbolic-arithmetic'],
      complexity: 61,
      lineCount: 750,
      embedding: createVector(Array.from({length: 64}, () => (Math.random() - 0.5) * 0.1))
    },
    // Add some class and function elements
    {
      id: 'H2GNN:class:HyperbolicGeometricHGN',
      type: 'class',
      name: 'HyperbolicGeometricHGN',
      filePath: 'src/core/H2GNN.ts',
      content: 'class HyperbolicGeometricHGN {...}',
      dependencies: [],
      exports: [],
      imports: [],
      complexity: 28,
      lineCount: 150,
      embedding: createVector(Array.from({length: 64}, () => (Math.random() - 0.5) * 0.1))
    },
    {
      id: 'HyperbolicArithmetic:class:HyperbolicArithmetic',
      type: 'class',
      name: 'HyperbolicArithmetic',
      filePath: 'src/math/hyperbolic-arithmetic.ts',
      content: 'class HyperbolicArithmetic {...}',
      dependencies: [],
      exports: [],
      imports: [],
      complexity: 22,
      lineCount: 120,
      embedding: createVector(Array.from({length: 64}, () => (Math.random() - 0.5) * 0.1))
    }
  ];

  const hierarchy: CodeHierarchy = {
    elements,
    relationships: [
      { from: 'src/core/H2GNN.ts', to: 'src/math/hyperbolic-arithmetic.ts', type: 'imports', weight: 1.0 },
      { from: 'src/analysis/code-embeddings.ts', to: 'src/core/H2GNN.ts', type: 'imports', weight: 1.0 },
      { from: 'src/analysis/code-embeddings.ts', to: 'src/math/hyperbolic-arithmetic.ts', type: 'imports', weight: 1.0 },
      { from: 'src/core/H2GNN.ts', to: 'H2GNN:class:HyperbolicGeometricHGN', type: 'contains', weight: 0.8 },
      { from: 'src/math/hyperbolic-arithmetic.ts', to: 'HyperbolicArithmetic:class:HyperbolicArithmetic', type: 'contains', weight: 0.8 }
    ],
    metrics: {
      totalFiles: 4,
      totalLines: 2127,
      avgComplexity: 37.7,
      maxDepth: 2,
      connectivityScore: 1.25
    }
  };

  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return hierarchy;
}

const CodeEmbeddingVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hierarchy, setHierarchy] = useState<CodeHierarchy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedElement, setSelectedElement] = useState<CodeElement | null>(null);
  const [nodes, setNodes] = useState<VisualizationNode[]>([]);
  const [edges, setEdges] = useState<VisualizationEdge[]>([]);
  const [filter, setFilter] = useState<string>('all');

  const typeColors = {
    file: '#4CAF50',
    class: '#2196F3', 
    function: '#FF9800',
    interface: '#9C27B0',
    import: '#607D8B',
    variable: '#795548'
  };

  const analyzeProject = async () => {
    setIsLoading(true);
    try {
      // In browser context, we'll simulate the analysis with demo data
      // For real deployment, this would call a backend API
      const result = await simulateCodeAnalysis();
      setHierarchy(result);
      
      // Convert to visualization nodes
      const visualNodes = result.elements
        .filter(e => e.embedding)
        .map(element => {
          // Project 64D embedding to 2D using first two dimensions
          const x = element.embedding!.data[0] * 400 + 400;
          const y = element.embedding!.data[1] * 400 + 300;
          
          return {
            id: element.id,
            name: element.name,
            type: element.type,
            x,
            y,
            radius: Math.sqrt(element.complexity) * 2 + 5,
            color: typeColors[element.type as keyof typeof typeColors] || '#666',
            element
          };
        });
      
      setNodes(visualNodes);
      
      // Convert relationships to edges
      const visualEdges = result.relationships.map(rel => ({
        from: rel.from,
        to: rel.to,
        type: rel.type,
        weight: rel.weight
      }));
      
      setEdges(visualEdges);
      
    } catch (error) {
      console.error('Error analyzing project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Filter nodes based on current filter
    const filteredNodes = filter === 'all' 
      ? nodes 
      : nodes.filter(node => node.type === filter);
    
    // Draw edges first (behind nodes)
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    edges.forEach(edge => {
      const fromNode = filteredNodes.find(n => n.id === edge.from);
      const toNode = filteredNodes.find(n => n.id === edge.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }
    });
    
    ctx.globalAlpha = 1;
    
    // Draw nodes
    filteredNodes.forEach(node => {
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw border for selected node
      if (selectedElement && selectedElement.id === node.id) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      
      // Draw label
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.name.substring(0, 15), node.x, node.y + node.radius + 15);
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find clicked node
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.radius;
    });
    
    if (clickedNode) {
      setSelectedElement(clickedNode.element);
    } else {
      setSelectedElement(null);
    }
  };

  useEffect(() => {
    drawVisualization();
  }, [nodes, edges, filter, selectedElement]);

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg h-full flex">
        {/* Controls */}
        <div className="w-80 p-4 border-r">
          <h2 className="text-2xl font-bold mb-4">Code Embedding Visualizer</h2>
          
          <button
            onClick={analyzeProject}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4 disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Project'}
          </button>
          
          {hierarchy && (
            <>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Filter by Type:</h3>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="all">All Elements</option>
                  <option value="file">Files</option>
                  <option value="class">Classes</option>
                  <option value="function">Functions</option>
                  <option value="interface">Interfaces</option>
                </select>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Project Stats:</h3>
                <div className="text-sm space-y-1">
                  <div>Files: {hierarchy.metrics.totalFiles}</div>
                  <div>Lines: {hierarchy.metrics.totalLines.toLocaleString()}</div>
                  <div>Avg Complexity: {hierarchy.metrics.avgComplexity.toFixed(1)}</div>
                  <div>Elements: {hierarchy.elements.length}</div>
                  <div>Relationships: {hierarchy.relationships.length}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Legend:</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(typeColors).map(([type, color]) => (
                    <div key={type} className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: color }}
                      />
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {selectedElement && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Selected Element:</h3>
              <div className="text-sm space-y-1">
                <div><strong>Name:</strong> {selectedElement.name}</div>
                <div><strong>Type:</strong> {selectedElement.type}</div>
                <div><strong>File:</strong> {selectedElement.filePath}</div>
                <div><strong>Lines:</strong> {selectedElement.lineCount}</div>
                <div><strong>Complexity:</strong> {selectedElement.complexity}</div>
                <div><strong>Imports:</strong> {selectedElement.imports.length}</div>
                <div><strong>Exports:</strong> {selectedElement.exports.length}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Visualization Canvas */}
        <div className="flex-1 p-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-300 cursor-pointer w-full h-full"
            onClick={handleCanvasClick}
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
          
          {!hierarchy && (
            <div className="flex items-center justify-center h-full text-gray-500">
              Click "Analyze Project" to generate code embeddings visualization
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEmbeddingVisualizer;
