import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, BarChart2, Zap, Shield, Users, Brain, Network, Eye, Settings } from 'lucide-react';
import { GeometricVisualizer, createVisualizer } from './visualization/geometric-visualizer';
import { HyperbolicGeometricHGN, createH2GNN, createHierarchicalDataset } from './core/H2GNN';
import { HyperbolicArithmetic, createVector } from './math/hyperbolic-arithmetic';
import PocketFlowDemo from './components/PocketFlowDemo';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visualizer, setVisualizer] = useState<GeometricVisualizer | null>(null);
  const [h2gnn, setH2gnn] = useState<HyperbolicGeometricHGN | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [geometryMode, setGeometryMode] = useState<'euclidean' | 'hyperbolic' | 'adaptive'>('hyperbolic');
  const [curvature, setCurvature] = useState(-1.0);
  const [showTiling, setShowTiling] = useState(true);
  const [showGeodesics, setShowGeodesics] = useState(true);
  const [trainingProgress, setTrainingProgress] = useState<any[]>([]);

  // Initialize H²GNN and visualizer
  useEffect(() => {
    if (canvasRef.current && !visualizer) {
      const viz = createVisualizer(canvasRef.current, {
        width: 600,
        height: 600,
        model: 'poincare-disk',
        tiling: showTiling ? '{5,3}' : 'none',
        showGeodesics,
        backgroundColor: '#000011',
        pointColor: '#00ff88',
        edgeColor: '#4488ff',
        geodesicColor: '#ff8844'
      });
      
      setVisualizer(viz);
      
      // Initialize H²GNN
      const network = createH2GNN({
        curvature,
        embeddingDim: 8,
        numLayers: 3,
        learningRate: 0.01
      });
      
      setH2gnn(network);
      
      // Generate sample hierarchical data
      const sampleData = createHierarchicalDataset(20, 3);
      viz.renderEmbeddings(sampleData.nodes, sampleData.edges);
    }
  }, [canvasRef.current, showTiling, showGeodesics, curvature]);

  // Update visualizer settings
  useEffect(() => {
    if (visualizer) {
      visualizer.setConfig({
        tiling: showTiling ? '{5,3}' : 'none',
        showGeodesics
      });
    }
  }, [visualizer, showTiling, showGeodesics]);

  // Update H²GNN geometry mode
  useEffect(() => {
    if (h2gnn) {
      h2gnn.setGeometryMode(geometryMode);
    }
  }, [h2gnn, geometryMode]);

  const handleTrainNetwork = async () => {
    if (!h2gnn || isTraining) return;
    
    setIsTraining(true);
    setTrainingProgress([]);
    
    try {
      // Generate training data
      const trainingDatasets = Array.from({ length: 5 }, () => 
        createHierarchicalDataset(15, 3)
      );
      
      console.log('🚀 Starting H²GNN training...');
      
      // Train the network
      await h2gnn.train(trainingDatasets);
      
      // Get training history
      const history = h2gnn.getTrainingHistory();
      setTrainingProgress(history);
      
      // Visualize results
      if (visualizer && trainingDatasets.length > 0) {
        const result = await h2gnn.predict(trainingDatasets[0]);
        visualizer.renderEmbeddings(result.embeddings, trainingDatasets[0].edges);
        
        // Add some geodesics to show hyperbolic structure
        visualizer.clearGeodesics();
        for (let i = 0; i < Math.min(5, result.embeddings.length - 1); i++) {
          visualizer.addGeodesic(result.embeddings[i], result.embeddings[i + 1]);
        }
      }
      
      console.log('✅ Training completed!');
      
    } catch (error) {
      console.error('❌ Training failed:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const handleGenerateData = () => {
    if (!visualizer) return;
    
    const newData = createHierarchicalDataset(
      Math.floor(Math.random() * 20) + 10,
      Math.floor(Math.random() * 3) + 2
    );
    
    visualizer.renderEmbeddings(newData.nodes, newData.edges);
    
    // Add random geodesics
    visualizer.clearGeodesics();
    for (let i = 0; i < 3; i++) {
      const from = HyperbolicArithmetic.randomHyperbolicPoint(2, 0.7);
      const to = HyperbolicArithmetic.randomHyperbolicPoint(2, 0.7);
      visualizer.addGeodesic(from, to);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <nav className="relative container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-white text-2xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-cyan-400" />
              H²GNN
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-white hover:text-cyan-300 transition-colors">Features</a>
              <a href="#demo" className="text-white hover:text-cyan-300 transition-colors">Demo</a>
              <a href="#architecture" className="text-white hover:text-cyan-300 transition-colors">Architecture</a>
            </div>
            <button className="bg-cyan-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-cyan-400 transition duration-300">
              Get Started
            </button>
          </div>
        </nav>

        <div className="relative container mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Hyperbolic Geometric
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                {" "}Neural Networks
              </span>
              </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Revolutionary AI system leveraging hyperbolic geometry for exponentially efficient hierarchical learning and knowledge representation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleTrainNetwork}
                disabled={isTraining}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:from-cyan-400 hover:to-blue-400 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isTraining ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Training...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Train Network
                  </>
                )}
                </button>
              <button 
                onClick={handleGenerateData}
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-900 transition duration-300 flex items-center justify-center gap-2"
              >
                <Network className="h-5 w-5" />
                Generate Data
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-20 bg-black/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Interactive Hyperbolic Visualization
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Explore the Poincaré disk model and see how H²GNN learns hierarchical structures in curved space.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Visualization Canvas */}
            <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-cyan-400" />
                  Poincaré Disk Visualization
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTiling(!showTiling)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      showTiling 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Tiling
                  </button>
                  <button
                    onClick={() => setShowGeodesics(!showGeodesics)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      showGeodesics 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Geodesics
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto border border-white/20 rounded-lg"
                  style={{ maxWidth: '600px', aspectRatio: '1' }}
                />
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs p-2 rounded backdrop-blur-sm">
                  <div>🎯 Click and drag points</div>
                  <div>🔍 Scroll to zoom</div>
                  <div>🖱️ Drag to pan</div>
                </div>
              </div>
            </div>

            {/* Controls and Information */}
            <div className="space-y-6">
              {/* Geometry Controls */}
              <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-cyan-400" />
                  Geometry Controls
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">
                      Geometry Mode
                    </label>
                    <select
                      value={geometryMode}
                      onChange={(e) => setGeometryMode(e.target.value as any)}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="euclidean">Euclidean (κ = 0)</option>
                      <option value="hyperbolic">Hyperbolic (κ = -1)</option>
                      <option value="adaptive">Adaptive (Learned)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">
                      Curvature: {curvature.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="-2"
                      max="0"
                      step="0.1"
                      value={curvature}
                      onChange={(e) => setCurvature(parseFloat(e.target.value))}
                      className="w-full"
                      disabled={geometryMode === 'adaptive'}
                    />
                  </div>
                </div>
              </div>

              {/* Training Progress */}
              {trainingProgress.length > 0 && (
                <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-cyan-400" />
                    Training Progress
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-100">Epochs:</span>
                      <span className="text-white">{trainingProgress.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-100">Final Loss:</span>
                      <span className="text-white">
                        {trainingProgress[trainingProgress.length - 1]?.loss.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-100">Geometric Loss:</span>
                      <span className="text-white">
                        {trainingProgress[trainingProgress.length - 1]?.geometricLoss.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mathematical Foundation */}
              <div className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Mathematical Foundation
                </h3>
                
                <div className="space-y-3 text-sm text-blue-100">
                  <div>
                    <strong className="text-white">Möbius Addition:</strong>
                    <div className="font-mono text-cyan-300 mt-1">
                      u ⊕ v = (u + v) / (1 + ⟨u,v⟩)
                    </div>
                  </div>
                  
                  <div>
                    <strong className="text-white">Hyperbolic Distance:</strong>
                    <div className="font-mono text-cyan-300 mt-1">
                      d_H(u,v) = artanh(||(-u) ⊕ v||)
                    </div>
                  </div>
                  
                  <div>
                    <strong className="text-white">Geometric Attention:</strong>
                    <div className="font-mono text-cyan-300 mt-1">
                      α = exp(-d_H(q,k))
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Revolutionary Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="h-10 w-10 text-cyan-400" />,
                title: "Hyperbolic Geometry",
                description: "Native operations in curved space using Möbius gyrovector arithmetic for exponential representation capacity."
              },
              {
                icon: <Network className="h-10 w-10 text-cyan-400" />,
                title: "Hierarchical Learning",
                description: "Automatically discovers and represents hierarchical structures without explicit tree constraints."
              },
              {
                icon: <Zap className="h-10 w-10 text-cyan-400" />,
                title: "Geometric Attention",
                description: "Attention mechanisms based on hyperbolic distance naturally encode relationships."
              },
              {
                icon: <Eye className="h-10 w-10 text-cyan-400" />,
                title: "Real-time Visualization",
                description: "Interactive Poincaré disk visualization with hyperbolic tilings and geodesics."
              },
              {
                icon: <BarChart2 className="h-10 w-10 text-cyan-400" />,
                title: "Geometric Loss Functions",
                description: "Custom loss functions that preserve hyperbolic structure and geodesic relationships."
              },
              {
                icon: <Shield className="h-10 w-10 text-cyan-400" />,
                title: "Mathematical Rigor",
                description: "Mathematically consistent implementation of Riemannian optimization on manifolds."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-black/30 p-8 rounded-xl backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 transition duration-300">
                {feature.icon}
                <h3 className="text-xl font-semibold mt-4 text-white">{feature.title}</h3>
                <p className="mt-2 text-blue-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PocketFlow Integration Section */}
      <section className="py-20 bg-black/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              PocketFlow + H²GNN Integration
          </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Experience the power of hyperbolic geometry combined with agent workflows and hierarchical knowledge.
            </p>
          </div>
          
          <PocketFlowDemo />
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              System Architecture
          </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Built on solid mathematical foundations with production-ready components.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-black/40 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-6">Core Components</h3>
              <div className="space-y-4">
                {[
                  { name: "Hyperbolic Arithmetic", desc: "Möbius operations & geometric primitives" },
                  { name: "Neural Layers", desc: "Hyperbolic linear, attention, and normalization" },
                  { name: "Message Passing", desc: "Graph neural networks in curved space" },
                  { name: "Geometric Optimization", desc: "Riemannian gradient descent" },
                  { name: "PocketFlow Framework", desc: "Agent workflows, RAG, task decomposition" },
                  { name: "WordNet Integration", desc: "Hierarchical knowledge & semantic relationships" }
                ].map((component, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium">{component.name}</div>
                      <div className="text-blue-100 text-sm">{component.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-black/40 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-6">Applications</h3>
              <div className="space-y-4">
                {[
                  { name: "Knowledge Graphs", desc: "Hierarchical ontologies and taxonomies" },
                  { name: "Social Networks", desc: "Community structure analysis" },
                  { name: "Language Models", desc: "Semantic hierarchy capture" },
                  { name: "Personal AI", desc: "Obsidian vault integration" },
                  { name: "Agent Systems", desc: "Multi-agent reasoning & task decomposition" },
                  { name: "Concept Learning", desc: "Automated domain knowledge acquisition" }
                ].map((app, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium">{app.name}</div>
                      <div className="text-blue-100 text-sm">{app.desc}</div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Brain className="h-6 w-6 text-cyan-400" />
                H²GNN
              </h3>
              <p className="text-blue-100">Revolutionary hyperbolic geometric neural networks for hierarchical learning.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Technology</h4>
              <ul className="space-y-2 text-blue-100">
                <li><a href="#" className="hover:text-white">Hyperbolic Geometry</a></li>
                <li><a href="#" className="hover:text-white">Neural Networks</a></li>
                <li><a href="#" className="hover:text-white">Graph Learning</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Applications</h4>
              <ul className="space-y-2 text-blue-100">
                <li><a href="#" className="hover:text-white">Knowledge Graphs</a></li>
                <li><a href="#" className="hover:text-white">Social Networks</a></li>
                <li><a href="#" className="hover:text-white">Language Models</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-blue-100">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Research Papers</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-blue-100">
            <p>© 2025 H²GNN. Advancing the frontiers of geometric deep learning.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;