import * as vscode from 'vscode';
import { AgenticFramework } from '../agentic/agenticFramework';

/**
 * Webview Manager for H²GNN PocketFlow Extension
 * 
 * Manages all webview-based interfaces including chat, knowledge graph
 * visualization, workflow designer, and code insights.
 */
export class WebviewManager {
  private context: vscode.ExtensionContext;
  private agenticFramework: AgenticFramework;
  private activeWebviews: Map<string, vscode.WebviewPanel> = new Map();
  private chatConversations: Map<string, ChatConversation> = new Map();

  constructor(context: vscode.ExtensionContext, agenticFramework: AgenticFramework) {
    this.context = context;
    this.agenticFramework = agenticFramework;
  }

  /**
   * Show chat interface
   */
  showChatInterface(): void {
    const existingPanel = this.activeWebviews.get('chat');
    
    if (existingPanel) {
      existingPanel.reveal(vscode.ViewColumn.Beside);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'h2gnn-chat',
      'H²GNN Chat Assistant',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(this.context.extensionPath)]
      }
    );

    panel.iconPath = {
      light: vscode.Uri.file(this.context.asAbsolutePath('assets/chat-light.svg')),
      dark: vscode.Uri.file(this.context.asAbsolutePath('assets/chat-dark.svg'))
    };

    panel.webview.html = this.getChatWebviewContent(panel.webview);
    
    // Handle messages from webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        await this.handleChatMessage(message, panel);
      },
      undefined,
      this.context.subscriptions
    );

    // Clean up when panel is disposed
    panel.onDidDispose(
      () => {
        this.activeWebviews.delete('chat');
      },
      null,
      this.context.subscriptions
    );

    this.activeWebviews.set('chat', panel);
  }

  /**
   * Show knowledge graph visualization
   */
  showKnowledgeGraph(graphData: any): void {
    const existingPanel = this.activeWebviews.get('knowledge-graph');
    
    if (existingPanel) {
      existingPanel.reveal(vscode.ViewColumn.Beside);
      existingPanel.webview.postMessage({ type: 'updateGraph', data: graphData });
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'h2gnn-knowledge-graph',
      'H²GNN Knowledge Graph',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(this.context.extensionPath)]
      }
    );

    panel.iconPath = {
      light: vscode.Uri.file(this.context.asAbsolutePath('assets/graph-light.svg')),
      dark: vscode.Uri.file(this.context.asAbsolutePath('assets/graph-dark.svg'))
    };

    panel.webview.html = this.getKnowledgeGraphWebviewContent(panel.webview, graphData);
    
    // Handle messages from webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        await this.handleKnowledgeGraphMessage(message, panel);
      },
      undefined,
      this.context.subscriptions
    );

    panel.onDidDispose(
      () => {
        this.activeWebviews.delete('knowledge-graph');
      },
      null,
      this.context.subscriptions
    );

    this.activeWebviews.set('knowledge-graph', panel);
  }

  /**
   * Show workflow designer
   */
  showWorkflowDesigner(): void {
    const existingPanel = this.activeWebviews.get('workflow-designer');
    
    if (existingPanel) {
      existingPanel.reveal(vscode.ViewColumn.Active);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'h2gnn-workflow-designer',
      'PocketFlow Workflow Designer',
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(this.context.extensionPath)]
      }
    );

    panel.iconPath = {
      light: vscode.Uri.file(this.context.asAbsolutePath('assets/workflow-light.svg')),
      dark: vscode.Uri.file(this.context.asAbsolutePath('assets/workflow-dark.svg'))
    };

    panel.webview.html = this.getWorkflowDesignerWebviewContent(panel.webview);
    
    // Handle messages from webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        await this.handleWorkflowDesignerMessage(message, panel);
      },
      undefined,
      this.context.subscriptions
    );

    panel.onDidDispose(
      () => {
        this.activeWebviews.delete('workflow-designer');
      },
      null,
      this.context.subscriptions
    );

    this.activeWebviews.set('workflow-designer', panel);
  }

  /**
   * Show code explanation
   */
  showCodeExplanation(explanation: any, code: string): void {
    const panel = vscode.window.createWebviewPanel(
      'h2gnn-code-explanation',
      'Code Explanation',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: false,
        localResourceRoots: [vscode.Uri.file(this.context.extensionPath)]
      }
    );

    panel.webview.html = this.getCodeExplanationWebviewContent(panel.webview, explanation, code);
  }

  /**
   * Show similar code results
   */
  showSimilarCode(similarCode: any[], originalCode: string): void {
    const panel = vscode.window.createWebviewPanel(
      'h2gnn-similar-code',
      'Similar Code',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: false,
        localResourceRoots: [vscode.Uri.file(this.context.extensionPath)]
      }
    );

    panel.webview.html = this.getSimilarCodeWebviewContent(panel.webview, similarCode, originalCode);
  }

  /**
   * Dispose all webviews
   */
  dispose(): void {
    for (const [id, panel] of this.activeWebviews) {
      panel.dispose();
    }
    this.activeWebviews.clear();
    this.chatConversations.clear();
  }

  // Private methods for handling webview content and messages

  /**
   * Get chat webview content
   */
  private getChatWebviewContent(webview: vscode.Webview): string {
    const styleUri = webview.asWebviewUri(vscode.Uri.file(this.context.asAbsolutePath('assets/chat.css')));
    const scriptUri = webview.asWebviewUri(vscode.Uri.file(this.context.asAbsolutePath('assets/chat.js')));

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>H²GNN Chat Assistant</title>
        <link href="${styleUri}" rel="stylesheet">
    </head>
    <body>
        <div class="chat-container">
            <div class="chat-header">
                <h2>🧠 H²GNN AI Assistant</h2>
                <p>Powered by hyperbolic geometry and knowledge graphs</p>
            </div>
            
            <div class="chat-messages" id="chatMessages">
                <div class="message assistant">
                    <div class="avatar">🤖</div>
                    <div class="content">
                        <p>Hello! I'm your H²GNN AI assistant. I can help you with:</p>
                        <ul>
                            <li>Code generation and completion</li>
                            <li>Code explanation and analysis</li>
                            <li>Refactoring suggestions</li>
                            <li>Architecture insights</li>
                            <li>Finding similar code patterns</li>
                        </ul>
                        <p>What would you like to work on today?</p>
                    </div>
                </div>
            </div>
            
            <div class="chat-input-container">
                <div class="input-wrapper">
                    <textarea 
                        id="chatInput" 
                        placeholder="Ask me anything about your code..."
                        rows="1"
                    ></textarea>
                    <button id="sendButton" class="send-button">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M1.724 1.053a.5.5 0 0 0-.714.545l1.403 4.85a.5.5 0 0 0 .397.354l5.69.953a.125.125 0 0 1 0 .25l-5.69.953a.5.5 0 0 0-.397.354L1.01 14.402a.5.5 0 0 0 .714.545L15.33 8.371a.25.25 0 0 0 0-.444L1.724 1.053z"/>
                        </svg>
                    </button>
                </div>
                <div class="quick-actions">
                    <button class="quick-action" data-action="explain">Explain Code</button>
                    <button class="quick-action" data-action="generate">Generate Code</button>
                    <button class="quick-action" data-action="refactor">Refactor</button>
                    <button class="quick-action" data-action="analyze">Analyze Project</button>
                </div>
            </div>
        </div>
        
        <script src="${scriptUri}"></script>
    </body>
    </html>`;
  }

  /**
   * Get knowledge graph webview content
   */
  private getKnowledgeGraphWebviewContent(webview: vscode.Webview, graphData: any): string {
    const styleUri = webview.asWebviewUri(vscode.Uri.file(this.context.asAbsolutePath('assets/graph.css')));
    const d3Uri = 'https://d3js.org/d3.v7.min.js';

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>H²GNN Knowledge Graph</title>
        <link href="${styleUri}" rel="stylesheet">
        <script src="${d3Uri}"></script>
    </head>
    <body>
        <div class="graph-container">
            <div class="graph-header">
                <h2>🕸️ Knowledge Graph</h2>
                <div class="graph-controls">
                    <button id="layoutForce" class="control-button active">Force</button>
                    <button id="layoutHierarchical" class="control-button">Hierarchical</button>
                    <button id="layoutCircular" class="control-button">Circular</button>
                    <button id="resetZoom" class="control-button">Reset Zoom</button>
                </div>
            </div>
            
            <div class="graph-stats">
                <span class="stat">Nodes: <strong id="nodeCount">0</strong></span>
                <span class="stat">Edges: <strong id="edgeCount">0</strong></span>
                <span class="stat">Layout: <strong id="currentLayout">force</strong></span>
            </div>
            
            <div class="graph-svg-container">
                <svg id="knowledgeGraph" width="100%" height="100%"></svg>
            </div>
            
            <div class="node-details" id="nodeDetails" style="display: none;">
                <h3 id="nodeTitle"></h3>
                <div id="nodeContent"></div>
            </div>
        </div>
        
        <script>
            const graphData = ${JSON.stringify(graphData)};
            
            // Initialize the knowledge graph visualization
            class KnowledgeGraphVisualizer {
                constructor(data) {
                    this.data = data;
                    this.svg = d3.select('#knowledgeGraph');
                    this.width = 800;
                    this.height = 600;
                    this.currentLayout = 'force';
                    
                    this.setupSVG();
                    this.setupEventListeners();
                    this.render();
                }
                
                setupSVG() {
                    this.svg.selectAll('*').remove();
                    
                    // Create zoom behavior
                    this.zoom = d3.zoom()
                        .scaleExtent([0.1, 4])
                        .on('zoom', (event) => {
                            this.container.attr('transform', event.transform);
                        });
                    
                    this.svg.call(this.zoom);
                    this.container = this.svg.append('g');
                    
                    // Create arrow markers
                    this.svg.append('defs').selectAll('marker')
                        .data(['end'])
                        .enter().append('marker')
                        .attr('id', String)
                        .attr('viewBox', '0 -5 10 10')
                        .attr('refX', 15)
                        .attr('refY', -1.5)
                        .attr('markerWidth', 6)
                        .attr('markerHeight', 6)
                        .attr('orient', 'auto')
                        .append('path')
                        .attr('d', 'M0,-5L10,0L0,5')
                        .attr('fill', '#999');
                }
                
                setupEventListeners() {
                    document.getElementById('layoutForce').addEventListener('click', () => this.setLayout('force'));
                    document.getElementById('layoutHierarchical').addEventListener('click', () => this.setLayout('hierarchical'));
                    document.getElementById('layoutCircular').addEventListener('click', () => this.setLayout('circular'));
                    document.getElementById('resetZoom').addEventListener('click', () => this.resetZoom());
                }
                
                setLayout(layout) {
                    this.currentLayout = layout;
                    document.querySelectorAll('.control-button').forEach(btn => btn.classList.remove('active'));
                    document.getElementById('layout' + layout.charAt(0).toUpperCase() + layout.slice(1)).classList.add('active');
                    document.getElementById('currentLayout').textContent = layout;
                    this.render();
                }
                
                resetZoom() {
                    this.svg.transition().duration(750).call(
                        this.zoom.transform,
                        d3.zoomIdentity
                    );
                }
                
                render() {
                    if (!this.data.nodes || !this.data.edges) return;
                    
                    // Update stats
                    document.getElementById('nodeCount').textContent = this.data.nodes.length;
                    document.getElementById('edgeCount').textContent = this.data.edges.length;
                    
                    // Clear previous render
                    this.container.selectAll('*').remove();
                    
                    // Create links
                    const link = this.container.append('g')
                        .selectAll('line')
                        .data(this.data.edges)
                        .enter().append('line')
                        .attr('stroke', d => d.color || '#999')
                        .attr('stroke-opacity', 0.6)
                        .attr('stroke-width', d => Math.sqrt(d.weight || 1))
                        .attr('marker-end', 'url(#end)');
                    
                    // Create nodes
                    const node = this.container.append('g')
                        .selectAll('circle')
                        .data(this.data.nodes)
                        .enter().append('circle')
                        .attr('r', d => d.size || 5)
                        .attr('fill', d => d.color || '#69b3a2')
                        .attr('stroke', '#fff')
                        .attr('stroke-width', 1.5)
                        .on('click', (event, d) => this.showNodeDetails(d))
                        .call(d3.drag()
                            .on('start', this.dragstarted.bind(this))
                            .on('drag', this.dragged.bind(this))
                            .on('end', this.dragended.bind(this)));
                    
                    // Add labels
                    const label = this.container.append('g')
                        .selectAll('text')
                        .data(this.data.nodes)
                        .enter().append('text')
                        .text(d => d.name)
                        .attr('font-size', 10)
                        .attr('dx', 15)
                        .attr('dy', 4);
                    
                    // Apply layout
                    this.applyLayout(node, link, label);
                }
                
                applyLayout(node, link, label) {
                    if (this.currentLayout === 'force') {
                        this.applyForceLayout(node, link, label);
                    } else if (this.currentLayout === 'hierarchical') {
                        this.applyHierarchicalLayout(node, link, label);
                    } else if (this.currentLayout === 'circular') {
                        this.applyCircularLayout(node, link, label);
                    }
                }
                
                applyForceLayout(node, link, label) {
                    const simulation = d3.forceSimulation(this.data.nodes)
                        .force('link', d3.forceLink(this.data.edges).id(d => d.id).distance(100))
                        .force('charge', d3.forceManyBody().strength(-300))
                        .force('center', d3.forceCenter(this.width / 2, this.height / 2));
                    
                    simulation.on('tick', () => {
                        link
                            .attr('x1', d => d.source.x)
                            .attr('y1', d => d.source.y)
                            .attr('x2', d => d.target.x)
                            .attr('y2', d => d.target.y);
                        
                        node
                            .attr('cx', d => d.x)
                            .attr('cy', d => d.y);
                        
                        label
                            .attr('x', d => d.x)
                            .attr('y', d => d.y);
                    });
                }
                
                applyHierarchicalLayout(node, link, label) {
                    // Simple hierarchical layout
                    const levels = this.calculateNodeLevels();
                    const levelHeight = this.height / (levels.length + 1);
                    
                    levels.forEach((levelNodes, levelIndex) => {
                        const levelWidth = this.width / (levelNodes.length + 1);
                        levelNodes.forEach((nodeData, nodeIndex) => {
                            nodeData.x = (nodeIndex + 1) * levelWidth;
                            nodeData.y = (levelIndex + 1) * levelHeight;
                        });
                    });
                    
                    this.updatePositions(node, link, label);
                }
                
                applyCircularLayout(node, link, label) {
                    const radius = Math.min(this.width, this.height) / 2 - 50;
                    const angleStep = (2 * Math.PI) / this.data.nodes.length;
                    
                    this.data.nodes.forEach((nodeData, index) => {
                        const angle = index * angleStep;
                        nodeData.x = this.width / 2 + radius * Math.cos(angle);
                        nodeData.y = this.height / 2 + radius * Math.sin(angle);
                    });
                    
                    this.updatePositions(node, link, label);
                }
                
                calculateNodeLevels() {
                    // Simplified level calculation
                    const levels = [];
                    const typeOrder = ['directory', 'file', 'class', 'function', 'interface'];
                    
                    typeOrder.forEach(type => {
                        const nodesOfType = this.data.nodes.filter(n => n.type === type);
                        if (nodesOfType.length > 0) {
                            levels.push(nodesOfType);
                        }
                    });
                    
                    return levels;
                }
                
                updatePositions(node, link, label) {
                    node.transition().duration(1000)
                        .attr('cx', d => d.x)
                        .attr('cy', d => d.y);
                    
                    link.transition().duration(1000)
                        .attr('x1', d => d.source.x || 0)
                        .attr('y1', d => d.source.y || 0)
                        .attr('x2', d => d.target.x || 0)
                        .attr('y2', d => d.target.y || 0);
                    
                    label.transition().duration(1000)
                        .attr('x', d => d.x)
                        .attr('y', d => d.y);
                }
                
                showNodeDetails(nodeData) {
                    const details = document.getElementById('nodeDetails');
                    const title = document.getElementById('nodeTitle');
                    const content = document.getElementById('nodeContent');
                    
                    title.textContent = nodeData.name;
                    content.innerHTML = \`
                        <p><strong>Type:</strong> \${nodeData.type}</p>
                        \${nodeData.metadata ? Object.entries(nodeData.metadata).map(([key, value]) => 
                            \`<p><strong>\${key}:</strong> \${value}</p>\`
                        ).join('') : ''}
                    \`;
                    
                    details.style.display = 'block';
                }
                
                dragstarted(event, d) {
                    if (!event.active && this.simulation) this.simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }
                
                dragged(event, d) {
                    d.fx = event.x;
                    d.fy = event.y;
                }
                
                dragended(event, d) {
                    if (!event.active && this.simulation) this.simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }
            }
            
            // Initialize visualization
            const visualizer = new KnowledgeGraphVisualizer(graphData);
            
            // Handle window resize
            window.addEventListener('resize', () => {
                const container = document.querySelector('.graph-svg-container');
                visualizer.width = container.clientWidth;
                visualizer.height = container.clientHeight;
                visualizer.setupSVG();
                visualizer.render();
            });
        </script>
    </body>
    </html>`;
  }

  /**
   * Get workflow designer webview content
   */
  private getWorkflowDesignerWebviewContent(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PocketFlow Workflow Designer</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
            }
            
            .designer-container {
                display: grid;
                grid-template-columns: 250px 1fr;
                gap: 20px;
                height: calc(100vh - 40px);
            }
            
            .toolbox {
                background-color: var(--vscode-sidebar-background);
                border-radius: 8px;
                padding: 15px;
                overflow-y: auto;
            }
            
            .canvas-container {
                background-color: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                position: relative;
                overflow: hidden;
            }
            
            .node-category {
                margin-bottom: 20px;
            }
            
            .node-category h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
                color: var(--vscode-foreground);
            }
            
            .node-item {
                display: block;
                width: 100%;
                padding: 8px 12px;
                margin-bottom: 5px;
                background-color: var(--vscode-button-secondaryBackground);
                border: none;
                border-radius: 4px;
                color: var(--vscode-button-secondaryForeground);
                cursor: grab;
                text-align: left;
                font-size: 12px;
            }
            
            .node-item:hover {
                background-color: var(--vscode-button-secondaryHoverBackground);
            }
            
            .workflow-canvas {
                width: 100%;
                height: 100%;
                position: relative;
                background-image: 
                    radial-gradient(circle, var(--vscode-panel-border) 1px, transparent 1px);
                background-size: 20px 20px;
            }
        </style>
    </head>
    <body>
        <div class="designer-container">
            <div class="toolbox">
                <h2>🔧 Node Toolbox</h2>
                
                <div class="node-category">
                    <h3>Basic Nodes</h3>
                    <button class="node-item" draggable="true" data-type="Node">Node</button>
                    <button class="node-item" draggable="true" data-type="BatchNode">Batch Node</button>
                    <button class="node-item" draggable="true" data-type="AsyncNode">Async Node</button>
                </div>
                
                <div class="node-category">
                    <h3>LLM Nodes</h3>
                    <button class="node-item" draggable="true" data-type="LLMNode">LLM Node</button>
                    <button class="node-item" draggable="true" data-type="RAGNode">RAG Node</button>
                    <button class="node-item" draggable="true" data-type="ChatNode">Chat Node</button>
                </div>
                
                <div class="node-category">
                    <h3>Control Flow</h3>
                    <button class="node-item" draggable="true" data-type="ConditionNode">Condition</button>
                    <button class="node-item" draggable="true" data-type="LoopNode">Loop</button>
                    <button class="node-item" draggable="true" data-type="ParallelNode">Parallel</button>
                </div>
                
                <div class="node-category">
                    <h3>Data Processing</h3>
                    <button class="node-item" draggable="true" data-type="TransformNode">Transform</button>
                    <button class="node-item" draggable="true" data-type="FilterNode">Filter</button>
                    <button class="node-item" draggable="true" data-type="AggregateNode">Aggregate</button>
                </div>
            </div>
            
            <div class="canvas-container">
                <div class="workflow-canvas" id="workflowCanvas">
                    <h2>🎯 Workflow Canvas</h2>
                    <p>Drag nodes from the toolbox to create your PocketFlow workflow</p>
                </div>
            </div>
        </div>
        
        <script>
            // Workflow Designer Implementation
            class WorkflowDesigner {
                constructor() {
                    this.canvas = document.getElementById('workflowCanvas');
                    this.nodes = [];
                    this.connections = [];
                    this.setupEventListeners();
                }
                
                setupEventListeners() {
                    // Handle drag and drop from toolbox
                    document.querySelectorAll('.node-item').forEach(item => {
                        item.addEventListener('dragstart', (e) => {
                            e.dataTransfer.setData('text/plain', e.target.dataset.type);
                        });
                    });
                    
                    this.canvas.addEventListener('dragover', (e) => {
                        e.preventDefault();
                    });
                    
                    this.canvas.addEventListener('drop', (e) => {
                        e.preventDefault();
                        const nodeType = e.dataTransfer.getData('text/plain');
                        const rect = this.canvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        this.createNode(nodeType, x, y);
                    });
                }
                
                createNode(type, x, y) {
                    const nodeId = 'node_' + Date.now();
                    const nodeElement = document.createElement('div');
                    nodeElement.className = 'workflow-node';
                    nodeElement.id = nodeId;
                    nodeElement.style.cssText = \`
                        position: absolute;
                        left: \${x}px;
                        top: \${y}px;
                        width: 120px;
                        height: 60px;
                        background-color: var(--vscode-button-background);
                        border: 2px solid var(--vscode-button-border);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--vscode-button-foreground);
                        font-size: 12px;
                        cursor: move;
                        user-select: none;
                    \`;
                    nodeElement.textContent = type;
                    
                    // Make node draggable
                    nodeElement.addEventListener('mousedown', this.startDrag.bind(this));
                    
                    this.canvas.appendChild(nodeElement);
                    this.nodes.push({ id: nodeId, type, x, y, element: nodeElement });
                }
                
                startDrag(e) {
                    const node = e.target;
                    const rect = node.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const offsetY = e.clientY - rect.top;
                    
                    const mouseMoveHandler = (e) => {
                        const canvasRect = this.canvas.getBoundingClientRect();
                        const newX = e.clientX - canvasRect.left - offsetX;
                        const newY = e.clientY - canvasRect.top - offsetY;
                        
                        node.style.left = newX + 'px';
                        node.style.top = newY + 'px';
                    };
                    
                    const mouseUpHandler = () => {
                        document.removeEventListener('mousemove', mouseMoveHandler);
                        document.removeEventListener('mouseup', mouseUpHandler);
                    };
                    
                    document.addEventListener('mousemove', mouseMoveHandler);
                    document.addEventListener('mouseup', mouseUpHandler);
                }
            }
            
            // Initialize designer
            const designer = new WorkflowDesigner();
        </script>
    </body>
    </html>`;
  }

  /**
   * Get code explanation webview content
   */
  private getCodeExplanationWebviewContent(webview: vscode.Webview, explanation: any, code: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Explanation</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                line-height: 1.6;
            }
            
            .explanation-container {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .code-block {
                background-color: var(--vscode-textCodeBlock-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 15px;
                margin: 15px 0;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 14px;
                overflow-x: auto;
            }
            
            .explanation-section {
                margin: 20px 0;
                padding: 15px;
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                border-radius: 4px;
            }
            
            .complexity-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: bold;
                margin-left: 10px;
            }
            
            .complexity-low { background-color: #4CAF50; color: white; }
            .complexity-medium { background-color: #FF9800; color: white; }
            .complexity-high { background-color: #F44336; color: white; }
            
            .suggestions {
                background-color: var(--vscode-editorInfo-background);
                border-left: 4px solid var(--vscode-editorInfo-foreground);
                padding: 10px 15px;
                margin: 15px 0;
            }
            
            .examples {
                background-color: var(--vscode-editorHint-background);
                border-left: 4px solid var(--vscode-editorHint-foreground);
                padding: 10px 15px;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="explanation-container">
            <h1>🔍 Code Explanation</h1>
            
            <h2>📝 Original Code</h2>
            <div class="code-block">${this.escapeHtml(code)}</div>
            
            <div class="explanation-section">
                <h2>
                    💡 Summary
                    <span class="complexity-badge complexity-${explanation.complexity}">
                        ${explanation.complexity.toUpperCase()} COMPLEXITY
                    </span>
                </h2>
                <p>${explanation.summary}</p>
            </div>
            
            <div class="explanation-section">
                <h2>📖 Detailed Explanation</h2>
                <div>${this.formatMarkdown(explanation.details)}</div>
            </div>
            
            ${explanation.suggestions && explanation.suggestions.length > 0 ? `
            <div class="suggestions">
                <h3>💡 Suggestions for Improvement</h3>
                <ul>
                    ${explanation.suggestions.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${explanation.examples && explanation.examples.length > 0 ? `
            <div class="examples">
                <h3>📚 Usage Examples</h3>
                ${explanation.examples.map(ex => `<div class="code-block">${this.escapeHtml(ex)}</div>`).join('')}
            </div>
            ` : ''}
            
            ${explanation.diagrams && explanation.diagrams.length > 0 ? `
            <div class="explanation-section">
                <h3>📊 Diagrams</h3>
                ${explanation.diagrams.map(d => `<pre>${this.escapeHtml(d)}</pre>`).join('')}
            </div>
            ` : ''}
        </div>
    </body>
    </html>`;
  }

  /**
   * Get similar code webview content
   */
  private getSimilarCodeWebviewContent(webview: vscode.Webview, similarCode: any[], originalCode: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Similar Code</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                line-height: 1.6;
            }
            
            .similar-code-container {
                max-width: 1000px;
                margin: 0 auto;
            }
            
            .original-code {
                background-color: var(--vscode-textCodeBlock-background);
                border: 2px solid var(--vscode-focusBorder);
                border-radius: 4px;
                padding: 15px;
                margin: 15px 0;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 14px;
            }
            
            .similar-item {
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                margin: 15px 0;
                overflow: hidden;
            }
            
            .similar-header {
                background-color: var(--vscode-sidebar-background);
                padding: 10px 15px;
                border-bottom: 1px solid var(--vscode-panel-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .similarity-score {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: bold;
            }
            
            .similar-content {
                padding: 15px;
            }
            
            .code-snippet {
                background-color: var(--vscode-textCodeBlock-background);
                border-radius: 4px;
                padding: 10px;
                margin: 10px 0;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 13px;
                overflow-x: auto;
            }
            
            .no-results {
                text-align: center;
                padding: 40px;
                color: var(--vscode-descriptionForeground);
            }
        </style>
    </head>
    <body>
        <div class="similar-code-container">
            <h1>🔍 Similar Code Analysis</h1>
            
            <h2>📝 Original Code</h2>
            <div class="original-code">${this.escapeHtml(originalCode)}</div>
            
            <h2>🎯 Similar Code Found</h2>
            
            ${similarCode.length === 0 ? `
                <div class="no-results">
                    <h3>No similar code found</h3>
                    <p>Try analyzing a larger codebase or adjusting the similarity threshold.</p>
                </div>
            ` : ''}
            
            ${similarCode.map(item => `
                <div class="similar-item">
                    <div class="similar-header">
                        <h3>${item.name}</h3>
                        <span class="similarity-score">${(item.similarity * 100).toFixed(1)}% similar</span>
                    </div>
                    <div class="similar-content">
                        ${item.snippet ? `
                            <div class="code-snippet">${this.escapeHtml(item.snippet)}</div>
                        ` : ''}
                        ${item.context ? `
                            <p><strong>Context:</strong> ${item.context}</p>
                        ` : ''}
                        ${item.location ? `
                            <p><strong>Location:</strong> ${item.location.uri.fsPath}:${item.location.range.start.line + 1}</p>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </body>
    </html>`;
  }

  // Message handlers

  private async handleChatMessage(message: any, panel: vscode.WebviewPanel): Promise<void> {
    switch (message.type) {
      case 'chat':
        await this.processChatMessage(message.content, panel);
        break;
      case 'quickAction':
        await this.processQuickAction(message.action, panel);
        break;
    }
  }

  private async handleKnowledgeGraphMessage(message: any, panel: vscode.WebviewPanel): Promise<void> {
    switch (message.type) {
      case 'nodeSelected':
        // Handle node selection
        break;
      case 'layoutChanged':
        // Handle layout change
        break;
    }
  }

  private async handleWorkflowDesignerMessage(message: any, panel: vscode.WebviewPanel): Promise<void> {
    switch (message.type) {
      case 'saveWorkflow':
        await this.saveWorkflow(message.workflow);
        break;
      case 'loadWorkflow':
        await this.loadWorkflow(message.workflowId, panel);
        break;
    }
  }

  private async processChatMessage(content: string, panel: vscode.WebviewPanel): Promise<void> {
    try {
      // Get or create conversation
      const conversationId = 'default';
      
      // Send user message to webview
      panel.webview.postMessage({
        type: 'addMessage',
        message: {
          type: 'user',
          content,
          timestamp: new Date().toISOString()
        }
      });
      
      // Generate AI response
      const response = await this.agenticFramework.chat(content, conversationId);
      
      // Send AI response to webview
      panel.webview.postMessage({
        type: 'addMessage',
        message: {
          type: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
          suggestions: response.suggestions
        }
      });
      
    } catch (error) {
      console.error('Chat message processing failed:', error);
      panel.webview.postMessage({
        type: 'addMessage',
        message: {
          type: 'error',
          content: 'Sorry, I encountered an error processing your message. Please try again.',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  private async processQuickAction(action: string, panel: vscode.WebviewPanel): Promise<void> {
    const activeEditor = vscode.window.activeTextEditor;
    
    switch (action) {
      case 'explain':
        if (activeEditor && !activeEditor.selection.isEmpty) {
          const code = activeEditor.document.getText(activeEditor.selection);
          vscode.commands.executeCommand('h2gnn.explainCode');
        } else {
          panel.webview.postMessage({
            type: 'addMessage',
            message: {
              type: 'assistant',
              content: 'Please select some code first, then try the "Explain Code" action.',
              timestamp: new Date().toISOString()
            }
          });
        }
        break;
        
      case 'generate':
        vscode.commands.executeCommand('h2gnn.generateCode');
        break;
        
      case 'refactor':
        if (activeEditor && !activeEditor.selection.isEmpty) {
          vscode.commands.executeCommand('h2gnn.refactorCode');
        } else {
          panel.webview.postMessage({
            type: 'addMessage',
            message: {
              type: 'assistant',
              content: 'Please select some code first, then try the "Refactor" action.',
              timestamp: new Date().toISOString()
            }
          });
        }
        break;
        
      case 'analyze':
        vscode.commands.executeCommand('h2gnn.analyzeProject');
        break;
    }
  }

  private async saveWorkflow(workflow: any): Promise<void> {
    // Save workflow to workspace
    console.log('Saving workflow:', workflow);
  }

  private async loadWorkflow(workflowId: string, panel: vscode.WebviewPanel): Promise<void> {
    // Load workflow from workspace
    console.log('Loading workflow:', workflowId);
  }

  // Utility methods

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private formatMarkdown(text: string): string {
    // Simple markdown formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
}

// Type definitions

interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
}

interface ChatMessage {
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: string;
  suggestions?: string[];
}
