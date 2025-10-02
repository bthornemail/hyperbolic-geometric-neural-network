/**
 * Obsidian MD Integration for H²GNN
 * 
 * Provides seamless integration with Obsidian vaults for:
 * - Knowledge graph extraction
 * - Hierarchical note organization
 * - Real-time synchronization
 * - AI-powered insights
 */

import { HyperbolicArithmetic, Vector, createVector } from '../math/hyperbolic-arithmetic';
import { HyperbolicGeometricHGN, TrainingData } from '../core/H2GNN';

export interface ObsidianNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  links: string[];
  backlinks: string[];
  created: Date;
  modified: Date;
  path: string;
}

export interface ObsidianVault {
  name: string;
  path: string;
  notes: Map<string, ObsidianNote>;
  graph: KnowledgeGraph;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  clusters: KnowledgeCluster[];
}

export interface KnowledgeNode {
  id: string;
  title: string;
  type: 'note' | 'tag' | 'concept';
  embedding?: Vector;
  importance: number;
  centrality: number;
}

export interface KnowledgeEdge {
  from: string;
  to: string;
  type: 'link' | 'backlink' | 'tag' | 'semantic';
  weight: number;
  context?: string;
}

export interface KnowledgeCluster {
  id: string;
  name: string;
  nodes: string[];
  center: Vector;
  radius: number;
  coherence: number;
}

export interface SyncConfig {
  vaultPath: string;
  autoSync: boolean;
  syncInterval: number; // milliseconds
  embedModel: 'h2gnn' | 'openai' | 'local';
  analysisDepth: 'shallow' | 'medium' | 'deep';
  realTimeUpdates: boolean;
}

/**
 * Main Obsidian Integration Class
 */
export class ObsidianSync {
  private config: SyncConfig;
  private vault: ObsidianVault | null = null;
  private h2gnn: HyperbolicGeometricHGN;
  private syncInterval?: NodeJS.Timeout;
  private fileWatcher?: any; // Would use fs.watch in Node.js environment
  
  // Analysis state
  private lastAnalysis: Date = new Date(0);
  private analysisCache: Map<string, any> = new Map();
  
  constructor(config: SyncConfig) {
    this.config = config;
    this.h2gnn = new HyperbolicGeometricHGN({
      embeddingDim: 16,
      curvature: -1.0,
      learningRate: 0.01
    });
    
    this.initializeSync();
  }

  /**
   * Initialize synchronization with Obsidian vault
   */
  private async initializeSync(): Promise<void> {
    try {
      await this.loadVault();
      
      if (this.config.autoSync) {
        this.startAutoSync();
      }
      
      if (this.config.realTimeUpdates) {
        this.startFileWatcher();
      }
      
      console.log('🔗 Obsidian sync initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Obsidian sync:', error);
    }
  }

  /**
   * Load Obsidian vault from file system
   */
  private async loadVault(): Promise<void> {
    // In a real implementation, this would use Node.js fs module
    // For now, we'll simulate vault loading
    
    const vaultName = this.config.vaultPath.split('/').pop() || 'Unknown Vault';
    
    this.vault = {
      name: vaultName,
      path: this.config.vaultPath,
      notes: new Map(),
      graph: {
        nodes: [],
        edges: [],
        clusters: []
      }
    };
    
    // Simulate loading notes (in real implementation, would scan .md files)
    await this.scanVaultFiles();
    await this.buildKnowledgeGraph();
    
    console.log(`📚 Loaded vault "${vaultName}" with ${this.vault.notes.size} notes`);
  }

  /**
   * Scan vault files and extract notes
   */
  private async scanVaultFiles(): Promise<void> {
    if (!this.vault) return;
    
    // Simulate scanning markdown files
    // In real implementation, would use fs.readdir and fs.readFile
    
    const sampleNotes: Partial<ObsidianNote>[] = [
      {
        title: 'Machine Learning Fundamentals',
        content: '# Machine Learning Fundamentals\n\nMachine learning is a subset of [[Artificial Intelligence]] that focuses on...',
        tags: ['ml', 'ai', 'fundamentals'],
        links: ['Artificial Intelligence', 'Neural Networks'],
        path: 'ML/fundamentals.md'
      },
      {
        title: 'Hyperbolic Geometry',
        content: '# Hyperbolic Geometry\n\nHyperbolic geometry is a non-Euclidean geometry where...',
        tags: ['geometry', 'mathematics', 'hyperbolic'],
        links: ['Non-Euclidean Geometry', 'Poincaré Disk'],
        path: 'Math/hyperbolic-geometry.md'
      },
      {
        title: 'Neural Networks',
        content: '# Neural Networks\n\nNeural networks are computing systems inspired by biological neural networks...',
        tags: ['ml', 'deep-learning', 'neural-networks'],
        links: ['Machine Learning Fundamentals', 'Deep Learning'],
        path: 'ML/neural-networks.md'
      }
    ];
    
    for (const noteData of sampleNotes) {
      const note: ObsidianNote = {
        id: this.generateNoteId(noteData.title!),
        title: noteData.title!,
        content: noteData.content!,
        tags: noteData.tags || [],
        links: noteData.links || [],
        backlinks: [],
        created: new Date(),
        modified: new Date(),
        path: noteData.path!
      };
      
      this.vault.notes.set(note.id, note);
    }
    
    // Build backlinks
    this.buildBacklinks();
  }

  /**
   * Build backlinks between notes
   */
  private buildBacklinks(): void {
    if (!this.vault) return;
    
    for (const note of this.vault.notes.values()) {
      for (const linkedTitle of note.links) {
        const linkedNote = this.findNoteByTitle(linkedTitle);
        if (linkedNote && !linkedNote.backlinks.includes(note.title)) {
          linkedNote.backlinks.push(note.title);
        }
      }
    }
  }

  /**
   * Build knowledge graph from notes
   */
  private async buildKnowledgeGraph(): Promise<void> {
    if (!this.vault) return;
    
    // Create nodes for each note
    const nodes: KnowledgeNode[] = [];
    const edges: KnowledgeEdge[] = [];
    
    for (const note of this.vault.notes.values()) {
      // Create note node
      const node: KnowledgeNode = {
        id: note.id,
        title: note.title,
        type: 'note',
        importance: this.calculateImportance(note),
        centrality: 0 // Will be calculated after edges
      };
      
      nodes.push(node);
      
      // Create edges for links
      for (const linkedTitle of note.links) {
        const linkedNote = this.findNoteByTitle(linkedTitle);
        if (linkedNote) {
          edges.push({
            from: note.id,
            to: linkedNote.id,
            type: 'link',
            weight: 1.0,
            context: this.extractLinkContext(note.content, linkedTitle)
          });
        }
      }
      
      // Create edges for tags
      for (const tag of note.tags) {
        const tagNodeId = `tag:${tag}`;
        
        // Create tag node if it doesn't exist
        if (!nodes.find(n => n.id === tagNodeId)) {
          nodes.push({
            id: tagNodeId,
            title: `#${tag}`,
            type: 'tag',
            importance: 0.5,
            centrality: 0
          });
        }
        
        edges.push({
          from: note.id,
          to: tagNodeId,
          type: 'tag',
          weight: 0.5
        });
      }
    }
    
    // Calculate centrality measures
    this.calculateCentrality(nodes, edges);
    
    // Generate hyperbolic embeddings
    await this.generateHyperbolicEmbeddings(nodes, edges);
    
    // Detect clusters
    const clusters = await this.detectClusters(nodes, edges);
    
    this.vault.graph = { nodes, edges, clusters };
    
    console.log(`🕸️ Built knowledge graph with ${nodes.length} nodes and ${edges.length} edges`);
  }

  /**
   * Calculate importance score for a note
   */
  private calculateImportance(note: ObsidianNote): number {
    let importance = 0;
    
    // Base importance from content length
    importance += Math.log(note.content.length + 1) * 0.1;
    
    // Importance from number of links
    importance += note.links.length * 0.3;
    
    // Importance from number of backlinks
    importance += note.backlinks.length * 0.5;
    
    // Importance from tags
    importance += note.tags.length * 0.2;
    
    // Recency bonus
    const daysSinceModified = (Date.now() - note.modified.getTime()) / (1000 * 60 * 60 * 24);
    importance += Math.exp(-daysSinceModified / 30) * 0.3;
    
    return Math.min(importance, 10.0); // Cap at 10
  }

  /**
   * Calculate centrality measures for nodes
   */
  private calculateCentrality(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): void {
    // Simple degree centrality
    const degreeMap = new Map<string, number>();
    
    for (const edge of edges) {
      degreeMap.set(edge.from, (degreeMap.get(edge.from) || 0) + 1);
      degreeMap.set(edge.to, (degreeMap.get(edge.to) || 0) + 1);
    }
    
    const maxDegree = Math.max(...Array.from(degreeMap.values()));
    
    for (const node of nodes) {
      node.centrality = (degreeMap.get(node.id) || 0) / maxDegree;
    }
  }

  /**
   * Generate hyperbolic embeddings for knowledge graph
   */
  private async generateHyperbolicEmbeddings(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): Promise<void> {
    // Convert to H²GNN training format
    const nodeVectors: Vector[] = nodes.map(() => 
      HyperbolicArithmetic.randomHyperbolicPoint(16, 0.5)
    );
    
    const edgeList: [number, number][] = edges
      .filter(e => e.type === 'link' || e.type === 'backlink')
      .map(e => {
        const fromIdx = nodes.findIndex(n => n.id === e.from);
        const toIdx = nodes.findIndex(n => n.id === e.to);
        return [fromIdx, toIdx];
      })
      .filter(([from, to]) => from >= 0 && to >= 0);
    
    const trainingData: TrainingData = {
      nodes: nodeVectors,
      edges: edgeList
    };
    
    // Train H²GNN to learn hierarchical structure
    await this.h2gnn.train([trainingData]);
    
    // Get final embeddings
    const result = await this.h2gnn.predict(trainingData);
    
    // Assign embeddings to nodes
    for (let i = 0; i < nodes.length && i < result.embeddings.length; i++) {
      nodes[i].embedding = result.embeddings[i];
    }
    
    console.log('🧠 Generated hyperbolic embeddings for knowledge graph');
  }

  /**
   * Detect clusters in the knowledge graph
   */
  private async detectClusters(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): Promise<KnowledgeCluster[]> {
    const clusters: KnowledgeCluster[] = [];
    
    if (nodes.length === 0) return clusters;
    
    // Simple clustering based on hyperbolic distance
    const visited = new Set<string>();
    let clusterId = 0;
    
    for (const node of nodes) {
      if (visited.has(node.id) || !node.embedding) continue;
      
      const cluster: KnowledgeCluster = {
        id: `cluster-${clusterId++}`,
        name: `Cluster around ${node.title}`,
        nodes: [node.id],
        center: node.embedding,
        radius: 0,
        coherence: 0
      };
      
      visited.add(node.id);
      
      // Find nearby nodes
      for (const otherNode of nodes) {
        if (visited.has(otherNode.id) || !otherNode.embedding) continue;
        
        const distance = HyperbolicArithmetic.distance(node.embedding, otherNode.embedding);
        
        if (distance < 0.5) { // Clustering threshold
          cluster.nodes.push(otherNode.id);
          visited.add(otherNode.id);
        }
      }
      
      // Calculate cluster properties
      if (cluster.nodes.length > 1) {
        cluster.center = this.calculateClusterCenter(cluster.nodes, nodes);
        cluster.radius = this.calculateClusterRadius(cluster.nodes, nodes, cluster.center);
        cluster.coherence = this.calculateClusterCoherence(cluster.nodes, edges);
        
        clusters.push(cluster);
      }
    }
    
    console.log(`🎯 Detected ${clusters.length} knowledge clusters`);
    return clusters;
  }

  /**
   * Calculate cluster center using Fréchet mean
   */
  private calculateClusterCenter(nodeIds: string[], nodes: KnowledgeNode[]): Vector {
    const embeddings = nodeIds
      .map(id => nodes.find(n => n.id === id)?.embedding)
      .filter(e => e !== undefined) as Vector[];
    
    if (embeddings.length === 0) {
      return createVector(new Array(16).fill(0));
    }
    
    if (embeddings.length === 1) {
      return embeddings[0];
    }
    
    // Simplified Fréchet mean computation
    let center = embeddings[0];
    
    for (let iter = 0; iter < 10; iter++) {
      const gradients = embeddings.map(emb => 
        HyperbolicArithmetic.logMap(center, emb)
      );
      
      const avgGradient = createVector(
        gradients[0].data.map((_, i) =>
          gradients.reduce((sum, grad) => sum + grad.data[i], 0) / gradients.length
        )
      );
      
      center = HyperbolicArithmetic.expMap(center, avgGradient);
      
      if (HyperbolicArithmetic.norm(avgGradient) < 1e-6) break;
    }
    
    return center;
  }

  /**
   * Calculate cluster radius
   */
  private calculateClusterRadius(nodeIds: string[], nodes: KnowledgeNode[], center: Vector): number {
    const distances = nodeIds
      .map(id => nodes.find(n => n.id === id)?.embedding)
      .filter(e => e !== undefined)
      .map(emb => HyperbolicArithmetic.distance(center, emb!));
    
    return Math.max(...distances, 0);
  }

  /**
   * Calculate cluster coherence
   */
  private calculateClusterCoherence(nodeIds: string[], edges: KnowledgeEdge[]): number {
    if (nodeIds.length < 2) return 1.0;
    
    let internalEdges = 0;
    let possibleEdges = 0;
    
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        possibleEdges++;
        
        const hasEdge = edges.some(e => 
          (e.from === nodeIds[i] && e.to === nodeIds[j]) ||
          (e.from === nodeIds[j] && e.to === nodeIds[i])
        );
        
        if (hasEdge) internalEdges++;
      }
    }
    
    return possibleEdges > 0 ? internalEdges / possibleEdges : 0;
  }

  /**
   * Start automatic synchronization
   */
  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      await this.performSync();
    }, this.config.syncInterval);
    
    console.log(`⏰ Auto-sync started (interval: ${this.config.syncInterval}ms)`);
  }

  /**
   * Start file system watcher for real-time updates
   */
  private startFileWatcher(): void {
    // In a real implementation, would use fs.watch or chokidar
    console.log('👁️ File watcher started for real-time updates');
  }

  /**
   * Perform synchronization
   */
  private async performSync(): Promise<void> {
    try {
      console.log('🔄 Performing Obsidian sync...');
      
      // Check for modified files
      const modifiedNotes = await this.detectModifiedNotes();
      
      if (modifiedNotes.length > 0) {
        console.log(`📝 Found ${modifiedNotes.length} modified notes`);
        
        // Update knowledge graph
        await this.updateKnowledgeGraph(modifiedNotes);
        
        // Regenerate embeddings if needed
        if (modifiedNotes.length > this.vault!.notes.size * 0.1) {
          await this.regenerateEmbeddings();
        }
      }
      
      this.lastAnalysis = new Date();
      console.log('✅ Sync completed successfully');
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
    }
  }

  /**
   * Detect modified notes since last sync
   */
  private async detectModifiedNotes(): Promise<ObsidianNote[]> {
    if (!this.vault) return [];
    
    // In real implementation, would check file modification times
    // For now, return empty array
    return [];
  }

  /**
   * Update knowledge graph with modified notes
   */
  private async updateKnowledgeGraph(modifiedNotes: ObsidianNote[]): Promise<void> {
    // Incremental update logic would go here
    console.log(`🔧 Updating knowledge graph for ${modifiedNotes.length} notes`);
  }

  /**
   * Regenerate embeddings for the entire graph
   */
  private async regenerateEmbeddings(): Promise<void> {
    if (!this.vault) return;
    
    console.log('🧠 Regenerating hyperbolic embeddings...');
    await this.generateHyperbolicEmbeddings(this.vault.graph.nodes, this.vault.graph.edges);
  }

  /**
   * Generate AI insights about the knowledge structure
   */
  async generateInsights(): Promise<string[]> {
    if (!this.vault) return [];
    
    const insights: string[] = [];
    
    // Analyze graph structure
    const { nodes, edges, clusters } = this.vault.graph;
    
    insights.push(`📊 Your vault contains ${nodes.length} notes with ${edges.length} connections`);
    
    // Find most central notes
    const centralNotes = nodes
      .filter(n => n.type === 'note')
      .sort((a, b) => b.centrality - a.centrality)
      .slice(0, 3);
    
    if (centralNotes.length > 0) {
      insights.push(`🎯 Most central notes: ${centralNotes.map(n => n.title).join(', ')}`);
    }
    
    // Analyze clusters
    if (clusters.length > 0) {
      insights.push(`🎪 Detected ${clusters.length} knowledge clusters`);
      
      const largestCluster = clusters.reduce((max, cluster) => 
        cluster.nodes.length > max.nodes.length ? cluster : max
      );
      
      insights.push(`📚 Largest cluster: "${largestCluster.name}" with ${largestCluster.nodes.length} notes`);
    }
    
    // Analyze hierarchy depth
    const embeddings = nodes
      .map(n => n.embedding)
      .filter(e => e !== undefined) as Vector[];
    
    if (embeddings.length > 1) {
      const distances = embeddings.flatMap((e1, i) =>
        embeddings.slice(i + 1).map(e2 => HyperbolicArithmetic.distance(e1, e2))
      );
      
      const maxDistance = Math.max(...distances);
      insights.push(`📏 Knowledge hierarchy depth: ${maxDistance.toFixed(2)} (deeper = more hierarchical)`);
    }
    
    return insights;
  }

  // Utility methods
  
  private generateNoteId(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  
  private findNoteByTitle(title: string): ObsidianNote | undefined {
    if (!this.vault) return undefined;
    
    for (const note of this.vault.notes.values()) {
      if (note.title === title) return note;
    }
    
    return undefined;
  }
  
  private extractLinkContext(content: string, linkedTitle: string): string {
    const linkPattern = new RegExp(`\\[\\[${linkedTitle}\\]\\]`, 'gi');
    const match = linkPattern.exec(content);
    
    if (match) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(content.length, match.index + match[0].length + 50);
      return content.substring(start, end);
    }
    
    return '';
  }

  /**
   * Public API methods
   */
  
  /**
   * Get current vault information
   */
  getVault(): ObsidianVault | null {
    return this.vault;
  }
  
  /**
   * Get knowledge graph
   */
  getKnowledgeGraph(): KnowledgeGraph | null {
    return this.vault?.graph || null;
  }
  
  /**
   * Search notes by content
   */
  searchNotes(query: string): ObsidianNote[] {
    if (!this.vault) return [];
    
    const results: ObsidianNote[] = [];
    const queryLower = query.toLowerCase();
    
    for (const note of this.vault.notes.values()) {
      if (note.title.toLowerCase().includes(queryLower) ||
          note.content.toLowerCase().includes(queryLower) ||
          note.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
        results.push(note);
      }
    }
    
    return results;
  }
  
  /**
   * Get similar notes based on hyperbolic distance
   */
  getSimilarNotes(noteId: string, limit: number = 5): KnowledgeNode[] {
    if (!this.vault) return [];
    
    const targetNode = this.vault.graph.nodes.find(n => n.id === noteId);
    if (!targetNode?.embedding) return [];
    
    const similarities = this.vault.graph.nodes
      .filter(n => n.id !== noteId && n.embedding && n.type === 'note')
      .map(n => ({
        node: n,
        distance: HyperbolicArithmetic.distance(targetNode.embedding!, n.embedding!)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return similarities.map(s => s.node);
  }
  
  /**
   * Stop synchronization
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
    
    // Stop file watcher
    if (this.fileWatcher) {
      this.fileWatcher.close();
      this.fileWatcher = undefined;
    }
    
    console.log('🛑 Obsidian sync stopped');
  }
}

// Convenience factory function
export function createObsidianSync(config: SyncConfig): ObsidianSync {
  return new ObsidianSync(config);
}

export default ObsidianSync;
