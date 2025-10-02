/**
 * PocketFlow + H²GNN Integration Demo Component
 * 
 * Showcases the integrated system with interactive demos
 */

import React, { useState, useEffect } from 'react';
import { Brain, MessageSquare, BookOpen, Search, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { runQuickDemo, IntegratedDemo } from '../demo/integrated-demo';
import AgentWorkflows from '../workflows/agent-workflows';
const { HierarchicalQAWorkflow } = AgentWorkflows;

interface DemoState {
  isRunning: boolean;
  results: any;
  logs: string[];
  error?: string;
}

interface QAState {
  workflow: HierarchicalQAWorkflow | null;
  isInitializing: boolean;
  isProcessing: boolean;
  input: string;
  response: string;
  history: Array<{ question: string; answer: string; timestamp: Date }>;
}

export function PocketFlowDemo() {
  const [demoState, setDemoState] = useState<DemoState>({
    isRunning: false,
    results: null,
    logs: []
  });

  const [qaState, setQaState] = useState<QAState>({
    workflow: null,
    isInitializing: true,
    isProcessing: false,
    input: 'What is a mammal?',
    response: '',
    history: []
  });

  const [activeTab, setActiveTab] = useState<'demo' | 'qa' | 'logs'>('demo');

  // Initialize QA workflow
  useEffect(() => {
    const initializeQA = async () => {
      try {
        setQaState(prev => ({ ...prev, isInitializing: true }));
        
        const workflow = new HierarchicalQAWorkflow();
        await workflow.initialize();
        
        setQaState(prev => ({ 
          ...prev, 
          workflow, 
          isInitializing: false 
        }));
      } catch (error) {
        console.error('Failed to initialize QA workflow:', error);
        setQaState(prev => ({ 
          ...prev, 
          isInitializing: false 
        }));
      }
    };

    initializeQA();
  }, []);

  const runIntegratedDemo = async () => {
    setDemoState(prev => ({ ...prev, isRunning: true, logs: [], error: undefined }));
    
    try {
      // Capture console logs
      const originalLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args) => {
        const message = args.join(' ');
        logs.push(message);
        setDemoState(prev => ({ ...prev, logs: [...prev.logs, message] }));
        originalLog(...args);
      };

      // Run the integrated demo
      const results = await runQuickDemo();
      
      // Restore console.log
      console.log = originalLog;
      
      setDemoState(prev => ({
        ...prev,
        isRunning: false,
        results,
        logs
      }));

    } catch (error) {
      setDemoState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const askQuestion = async () => {
    if (!qaState.workflow || !qaState.input.trim() || qaState.isProcessing) return;
    
    setQaState(prev => ({ ...prev, isProcessing: true, response: 'Processing...' }));
    
    try {
      const result = await qaState.workflow.answerQuestion(qaState.input);
      const answer = result.answer || 'No answer generated';
      
      setQaState(prev => ({
        ...prev,
        isProcessing: false,
        response: answer,
        history: [{
          question: prev.input,
          answer,
          timestamp: new Date()
        }, ...prev.history]
      }));
    } catch (error) {
      const errorMsg = 'Error: ' + (error instanceof Error ? error.message : 'Unknown error');
      setQaState(prev => ({
        ...prev,
        isProcessing: false,
        response: errorMsg
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <div className="bg-black/30 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Brain className="h-8 w-8 text-cyan-400" />
          PocketFlow + H²GNN Integration
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'demo' 
                ? 'bg-cyan-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Zap className="h-4 w-4 inline mr-2" />
            Demo
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'qa' 
                ? 'bg-cyan-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MessageSquare className="h-4 w-4 inline mr-2" />
            Q&A
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'logs' 
                ? 'bg-cyan-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <BookOpen className="h-4 w-4 inline mr-2" />
            Logs
          </button>
        </div>
      </div>

      {/* Demo Tab */}
      {activeTab === 'demo' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">System Overview</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-purple-900/30 rounded p-3 border border-purple-500/30">
                <h4 className="font-semibold text-purple-400 mb-2">🧮 H²GNN Core</h4>
                <p className="text-gray-300">Hyperbolic geometry, Möbius arithmetic, geometric neural layers</p>
              </div>
              <div className="bg-blue-900/30 rounded p-3 border border-blue-500/30">
                <h4 className="font-semibold text-blue-400 mb-2">🔄 PocketFlow</h4>
                <p className="text-gray-300">Agent workflows, RAG, task decomposition, node-based flows</p>
              </div>
              <div className="bg-green-900/30 rounded p-3 border border-green-500/30">
                <h4 className="font-semibold text-green-400 mb-2">📚 WordNet</h4>
                <p className="text-gray-300">Hierarchical knowledge, semantic relationships, concept learning</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={runIntegratedDemo}
              disabled={demoState.isRunning}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              {demoState.isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Running Integration Demo...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Run Full Integration Demo
                </>
              )}
            </button>
          </div>

          {demoState.error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                <AlertCircle className="h-5 w-5" />
                Error
              </div>
              <p className="text-red-300">{demoState.error}</p>
            </div>
          )}

          {demoState.results && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Demo Results
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">Training Results</h4>
                  {demoState.results.trainingResults ? (
                    <div className="space-y-1 text-gray-300">
                      <p>Overall Score: <span className="text-green-400 font-semibold">
                        {(demoState.results.trainingResults.overallScore * 100).toFixed(1)}%
                      </span></p>
                      <p>H²GNN: <span className="text-blue-400">
                        {(demoState.results.trainingResults.componentScores.h2gnn * 100).toFixed(1)}%
                      </span></p>
                      <p>WordNet: <span className="text-green-400">
                        {(demoState.results.trainingResults.componentScores.wordnet * 100).toFixed(1)}%
                      </span></p>
                      <p>Workflows: <span className="text-yellow-400">
                        {(demoState.results.trainingResults.componentScores.workflows * 100).toFixed(1)}%
                      </span></p>
                    </div>
                  ) : (
                    <p className="text-gray-400">No training results</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">Workflow Performance</h4>
                  <div className="space-y-1 text-gray-300">
                    {Array.from(demoState.results.workflowResults.entries()).map(([name, results]) => (
                      <p key={name}>
                        {name}: <span className="text-green-400">
                          {Array.isArray(results) ? `${results.filter((r: any) => !r.error).length}/${results.length}` : 'N/A'}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Duration: <span className="text-cyan-400">{(demoState.results.duration / 1000).toFixed(2)}s</span></span>
                  <span>Success Rate: <span className="text-green-400">
                    {((demoState.results.performanceMetrics?.workflows?.successRate || 0) * 100).toFixed(1)}%
                  </span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Q&A Tab */}
      {activeTab === 'qa' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Hierarchical Question Answering</h3>
            <p className="text-gray-300 text-sm mb-4">
              Ask questions about hierarchical concepts. The system uses WordNet knowledge with hyperbolic embeddings.
            </p>
            
            {qaState.isInitializing ? (
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                Initializing QA workflow...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qaState.input}
                    onChange={(e) => setQaState(prev => ({ ...prev, input: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="e.g., What is a mammal? How are cats related to animals?"
                    disabled={qaState.isProcessing}
                  />
                  <button
                    onClick={askQuestion}
                    disabled={qaState.isProcessing || !qaState.workflow}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors flex items-center gap-2"
                  >
                    {qaState.isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Ask
                  </button>
                </div>
                
                {qaState.response && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-400 mb-2">Response:</h4>
                    <p className="text-gray-300">{qaState.response}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {qaState.history.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Q&A History</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {qaState.history.map((item, index) => (
                  <div key={index} className="bg-gray-700/50 rounded p-3">
                    <div className="text-sm text-gray-400 mb-1">
                      {item.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="text-blue-300 font-medium mb-1">
                      Q: {item.question}
                    </div>
                    <div className="text-gray-300 text-sm">
                      A: {item.answer.substring(0, 200)}{item.answer.length > 200 ? '...' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">System Logs</h3>
            {demoState.logs.length > 0 ? (
              <div className="bg-black/50 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
                {demoState.logs.map((log, index) => (
                  <div key={index} className="text-gray-300 mb-1 break-words">
                    <span className="text-gray-500">[{index + 1}]</span> {log}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No logs available. Run the demo to see system logs.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PocketFlowDemo;
