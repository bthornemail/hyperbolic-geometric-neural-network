/**
 * WordNet Dataset Integration for H²GNN + PocketFlow
 * 
 * Provides comprehensive WordNet integration including:
 * - Synset and word relationship extraction
 * - Hierarchical structure processing
 * - Hyperbolic embedding generation
 * - Training data preparation
 * - Semantic relationship analysis
 */

import { HyperbolicGeometricHGN, TrainingData } from '../core/H2GNN';
import { HyperbolicArithmetic, Vector, createVector } from '../math/hyperbolic-arithmetic';
import LLMNodes from '../pocketflow/llm-nodes';
const { RAGNode } = LLMNodes;

// WordNet Data Structures
export interface WordNetSynset {
  id: string;
  pos: 'noun' | 'verb' | 'adjective' | 'adverb';
  words: string[];
  definition: string;
  examples: string[];
  hypernyms: string[]; // parent concepts
  hyponyms: string[];  // child concepts
  meronyms: string[];  // part-of relationships
  holonyms: string[];  // whole-of relationships
  similarTo: string[]; // similar concepts
  antonyms: string[];  // opposite concepts
}

export interface WordNetWord {
  word: string;
  pos: 'noun' | 'verb' | 'adjective' | 'adverb';
  synsets: string[];
  frequency?: number;
}

export interface WordNetRelation {
  from: string;
  to: string;
  type: 'hypernym' | 'hyponym' | 'meronym' | 'holonym' | 'similar' | 'antonym';
  weight: number;
}

export interface WordNetHierarchy {
  nodes: WordNetNode[];
  edges: WordNetEdge[];
  roots: string[];
  maxDepth: number;
}

export interface WordNetNode {
  id: string;
  synset: WordNetSynset;
  embedding?: Vector;
  depth: number;
  children: string[];
  parents: string[];
}

export interface WordNetEdge {
  from: string;
  to: string;
  type: string;
  weight: number;
  hyperbolicDistance?: number;
}

/**
 * WordNet Dataset Loader and Processor
 */
export class WordNetProcessor {
  private synsets: Map<string, WordNetSynset> = new Map();
  private words: Map<string, WordNetWord> = new Map();
  private relations: WordNetRelation[] = [];
  private hierarchy: WordNetHierarchy | null = null;
  private h2gnn: HyperbolicGeometricHGN;
  private ragNode: RAGNode;

  constructor(h2gnn?: HyperbolicGeometricHGN) {
    this.h2gnn = h2gnn || new HyperbolicGeometricHGN({
      embeddingDim: 32, // Larger dimension for WordNet complexity
      curvature: -1.0,
      numLayers: 4
    });
    
    this.ragNode = new RAGNode({ h2gnn: this.h2gnn });
  }

  /**
   * Load WordNet data (mock implementation - replace with actual WordNet parser)
   */
  async loadWordNetData(): Promise<void> {
    console.log('📚 Loading WordNet dataset...');
    
    // Mock WordNet data - in production, load from actual WordNet files
    await this.loadMockWordNetData();
    
    console.log(`✅ Loaded ${this.synsets.size} synsets and ${this.words.size} words`);
  }

  /**
   * Mock WordNet data for demonstration
   */
  private async loadMockWordNetData(): Promise<void> {
    // Sample hierarchical structure from WordNet
    const mockSynsets: Partial<WordNetSynset>[] = [
      // Root concepts
      {
        id: 'entity.n.01',
        pos: 'noun',
        words: ['entity'],
        definition: 'that which is perceived or known or inferred to have its own distinct existence',
        examples: [],
        hypernyms: [],
        hyponyms: ['physical_entity.n.01', 'abstraction.n.06']
      },
      
      // Physical entities
      {
        id: 'physical_entity.n.01',
        pos: 'noun',
        words: ['physical entity'],
        definition: 'an entity that has physical existence',
        examples: [],
        hypernyms: ['entity.n.01'],
        hyponyms: ['object.n.01', 'substance.n.01', 'process.n.06']
      },
      
      {
        id: 'object.n.01',
        pos: 'noun',
        words: ['object', 'physical object'],
        definition: 'a tangible and visible entity; an entity that can cast a shadow',
        examples: ['it was full of rackets, balls and other objects'],
        hypernyms: ['physical_entity.n.01'],
        hyponyms: ['whole.n.02', 'living_thing.n.01', 'artifact.n.01']
      },
      
      // Living things
      {
        id: 'living_thing.n.01',
        pos: 'noun',
        words: ['living thing', 'animate thing'],
        definition: 'a living (or once living) entity',
        examples: [],
        hypernyms: ['object.n.01'],
        hyponyms: ['organism.n.01', 'benthos.n.02']
      },
      
      {
        id: 'organism.n.01',
        pos: 'noun',
        words: ['organism', 'being'],
        definition: 'a living thing that has (or can develop) the ability to act or function independently',
        examples: [],
        hypernyms: ['living_thing.n.01'],
        hyponyms: ['animal.n.01', 'plant.n.02', 'microorganism.n.01']
      },
      
      // Animals
      {
        id: 'animal.n.01',
        pos: 'noun',
        words: ['animal', 'animate being', 'beast', 'brute', 'creature', 'fauna'],
        definition: 'a living organism characterized by voluntary movement',
        examples: [],
        hypernyms: ['organism.n.01'],
        hyponyms: ['chordate.n.01', 'invertebrate.n.01']
      },
      
      {
        id: 'chordate.n.01',
        pos: 'noun',
        words: ['chordate'],
        definition: 'any animal of the phylum Chordata having a notochord or spinal column',
        examples: [],
        hypernyms: ['animal.n.01'],
        hyponyms: ['vertebrate.n.01']
      },
      
      {
        id: 'vertebrate.n.01',
        pos: 'noun',
        words: ['vertebrate', 'craniate'],
        definition: 'animals having a bony or cartilaginous skeleton with a segmented spinal column',
        examples: [],
        hypernyms: ['chordate.n.01'],
        hyponyms: ['mammal.n.01', 'bird.n.01', 'reptile.n.01', 'fish.n.01']
      },
      
      // Mammals
      {
        id: 'mammal.n.01',
        pos: 'noun',
        words: ['mammal', 'mammalian'],
        definition: 'any warm-blooded vertebrate having the skin more or less covered with hair',
        examples: [],
        hypernyms: ['vertebrate.n.01'],
        hyponyms: ['placental.n.01', 'marsupial.n.01', 'monotreme.n.01']
      },
      
      {
        id: 'placental.n.01',
        pos: 'noun',
        words: ['placental', 'placental mammal', 'eutherian', 'eutherian mammal'],
        definition: 'mammals having a placenta; all mammals except monotremes and marsupials',
        examples: [],
        hypernyms: ['mammal.n.01'],
        hyponyms: ['carnivore.n.01', 'herbivore.n.01', 'primate.n.02']
      },
      
      // Specific animals
      {
        id: 'carnivore.n.01',
        pos: 'noun',
        words: ['carnivore'],
        definition: 'a terrestrial or aquatic flesh-eating mammal',
        examples: [],
        hypernyms: ['placental.n.01'],
        hyponyms: ['feline.n.01', 'canine.n.02', 'bear.n.01']
      },
      
      {
        id: 'feline.n.01',
        pos: 'noun',
        words: ['feline', 'felid'],
        definition: 'any of various lithe-bodied roundheaded fissiped mammals, many with retractile claws',
        examples: [],
        hypernyms: ['carnivore.n.01'],
        hyponyms: ['cat.n.01', 'big_cat.n.01']
      },
      
      {
        id: 'cat.n.01',
        pos: 'noun',
        words: ['cat', 'true cat'],
        definition: 'feline mammal usually having thick soft fur and no ability to roar',
        examples: ['cats liked to sit in the window'],
        hypernyms: ['feline.n.01'],
        hyponyms: ['house_cat.n.01', 'wildcat.n.03']
      },
      
      {
        id: 'house_cat.n.01',
        pos: 'noun',
        words: ['house cat', 'domestic cat', 'Felis domesticus', 'Felis catus'],
        definition: 'any domesticated member of the genus Felis',
        examples: [],
        hypernyms: ['cat.n.01'],
        hyponyms: []
      },
      
      // Abstract concepts
      {
        id: 'abstraction.n.06',
        pos: 'noun',
        words: ['abstraction', 'abstract entity'],
        definition: 'a general concept formed by extracting common features from specific examples',
        examples: [],
        hypernyms: ['entity.n.01'],
        hyponyms: ['attribute.n.02', 'group.n.01', 'relation.n.01', 'communication.n.02']
      },
      
      {
        id: 'attribute.n.02',
        pos: 'noun',
        words: ['attribute'],
        definition: 'an abstraction belonging to or characteristic of an entity',
        examples: [],
        hypernyms: ['abstraction.n.06'],
        hyponyms: ['property.n.02', 'state.n.02']
      },
      
      // Verbs
      {
        id: 'move.v.01',
        pos: 'verb',
        words: ['move'],
        definition: 'change location; move, travel, or proceed, also metaphorically',
        examples: ['How fast does your new car go?'],
        hypernyms: [],
        hyponyms: ['travel.v.01', 'go.v.02', 'come.v.01']
      },
      
      {
        id: 'travel.v.01',
        pos: 'verb',
        words: ['travel', 'go', 'move', 'locomote'],
        definition: 'change location; move, travel, or proceed',
        examples: ['We travelled from Rome to Naples by bus'],
        hypernyms: ['move.v.01'],
        hyponyms: ['walk.v.01', 'run.v.01', 'fly.v.01']
      }
    ];

    // Convert to full synsets and store
    for (const synsetData of mockSynsets) {
      const synset: WordNetSynset = {
        id: synsetData.id!,
        pos: synsetData.pos!,
        words: synsetData.words!,
        definition: synsetData.definition!,
        examples: synsetData.examples || [],
        hypernyms: synsetData.hypernyms || [],
        hyponyms: synsetData.hyponyms || [],
        meronyms: [],
        holonyms: [],
        similarTo: [],
        antonyms: []
      };
      
      this.synsets.set(synset.id, synset);
      
      // Create word entries
      for (const word of synset.words) {
        if (!this.words.has(word)) {
          this.words.set(word, {
            word,
            pos: synset.pos,
            synsets: [synset.id]
          });
        } else {
          const existing = this.words.get(word)!;
          existing.synsets.push(synset.id);
        }
      }
    }

    // Build relations
    this.buildRelations();
  }

  /**
   * Build relations from synset data
   */
  private buildRelations(): void {
    this.relations = [];
    
    for (const synset of this.synsets.values()) {
      // Hypernym relations (is-a)
      for (const hypernym of synset.hypernyms) {
        this.relations.push({
          from: synset.id,
          to: hypernym,
          type: 'hypernym',
          weight: 1.0
        });
      }
      
      // Hyponym relations (reverse of hypernym)
      for (const hyponym of synset.hyponyms) {
        this.relations.push({
          from: synset.id,
          to: hyponym,
          type: 'hyponym',
          weight: 1.0
        });
      }
      
      // Other relation types
      for (const meronym of synset.meronyms) {
        this.relations.push({
          from: synset.id,
          to: meronym,
          type: 'meronym',
          weight: 0.8
        });
      }
    }
    
    console.log(`📊 Built ${this.relations.length} relations`);
  }

  /**
   * Build hierarchical structure
   */
  async buildHierarchy(): Promise<WordNetHierarchy> {
    console.log('🏗️ Building WordNet hierarchy...');
    
    const nodes: WordNetNode[] = [];
    const edges: WordNetEdge[] = [];
    const roots: string[] = [];
    
    // Find root nodes (no hypernyms)
    for (const synset of this.synsets.values()) {
      if (synset.hypernyms.length === 0) {
        roots.push(synset.id);
      }
    }
    
    // Build nodes with depth calculation
    const depthMap = new Map<string, number>();
    const visited = new Set<string>();
    
    // Calculate depths using BFS
    const queue = roots.map(id => ({ id, depth: 0 }));
    
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      depthMap.set(id, depth);
      
      const synset = this.synsets.get(id);
      if (synset) {
        // Add children to queue
        for (const hyponym of synset.hyponyms) {
          if (!visited.has(hyponym)) {
            queue.push({ id: hyponym, depth: depth + 1 });
          }
        }
      }
    }
    
    // Create nodes
    for (const synset of this.synsets.values()) {
      const node: WordNetNode = {
        id: synset.id,
        synset,
        depth: depthMap.get(synset.id) || 0,
        children: synset.hyponyms,
        parents: synset.hypernyms
      };
      nodes.push(node);
    }
    
    // Create edges
    for (const relation of this.relations) {
      const edge: WordNetEdge = {
        from: relation.from,
        to: relation.to,
        type: relation.type,
        weight: relation.weight
      };
      edges.push(edge);
    }
    
    const maxDepth = Math.max(...Array.from(depthMap.values()));
    
    this.hierarchy = {
      nodes,
      edges,
      roots,
      maxDepth
    };
    
    console.log(`✅ Built hierarchy with ${nodes.length} nodes, ${edges.length} edges, max depth: ${maxDepth}`);
    return this.hierarchy;
  }

  /**
   * Generate hyperbolic embeddings for WordNet concepts
   */
  async generateHyperbolicEmbeddings(): Promise<void> {
    if (!this.hierarchy) {
      await this.buildHierarchy();
    }
    
    console.log('🧠 Generating hyperbolic embeddings for WordNet concepts...');
    
    // Prepare training data for H²GNN
    const trainingData = this.prepareTrainingData();
    
    // Train H²GNN on WordNet structure
    await this.h2gnn.train([trainingData]);
    
    // Generate embeddings
    const result = await this.h2gnn.predict(trainingData);
    
    // Assign embeddings to nodes
    for (let i = 0; i < this.hierarchy!.nodes.length && i < result.embeddings.length; i++) {
      this.hierarchy!.nodes[i].embedding = result.embeddings[i];
    }
    
    // Calculate hyperbolic distances for edges
    for (const edge of this.hierarchy!.edges) {
      const fromNode = this.hierarchy!.nodes.find(n => n.id === edge.from);
      const toNode = this.hierarchy!.nodes.find(n => n.id === edge.to);
      
      if (fromNode?.embedding && toNode?.embedding) {
        edge.hyperbolicDistance = HyperbolicArithmetic.distance(fromNode.embedding, toNode.embedding);
      }
    }
    
    console.log('✅ Generated hyperbolic embeddings for all concepts');
  }

  /**
   * Prepare training data for H²GNN
   */
  private prepareTrainingData(): TrainingData {
    if (!this.hierarchy) {
      throw new Error('Hierarchy not built yet');
    }
    
    // Convert synsets to feature vectors
    const nodes: Vector[] = [];
    const nodeMap = new Map<string, number>();
    
    for (let i = 0; i < this.hierarchy.nodes.length; i++) {
      const node = this.hierarchy.nodes[i];
      const features = this.synsetToFeatures(node.synset);
      nodes.push(createVector(features));
      nodeMap.set(node.id, i);
    }
    
    // Convert relations to edges
    const edges: [number, number][] = [];
    
    for (const edge of this.hierarchy.edges) {
      const fromIdx = nodeMap.get(edge.from);
      const toIdx = nodeMap.get(edge.to);
      
      if (fromIdx !== undefined && toIdx !== undefined) {
        edges.push([fromIdx, toIdx]);
      }
    }
    
    return { nodes, edges };
  }

  /**
   * Convert synset to feature vector
   */
  private synsetToFeatures(synset: WordNetSynset): number[] {
    const features = new Array(32).fill(0);
    
    // POS features
    const posMap = { noun: 0, verb: 1, adjective: 2, adverb: 3 };
    features[0] = (posMap[synset.pos] || 0) / 3;
    
    // Word count features
    features[1] = Math.min(synset.words.length / 10, 1);
    
    // Definition length features
    features[2] = Math.min(synset.definition.length / 200, 1);
    
    // Example count features
    features[3] = Math.min(synset.examples.length / 5, 1);
    
    // Relation count features
    features[4] = Math.min(synset.hypernyms.length / 5, 1);
    features[5] = Math.min(synset.hyponyms.length / 10, 1);
    features[6] = Math.min(synset.meronyms.length / 5, 1);
    features[7] = Math.min(synset.holonyms.length / 5, 1);
    
    // Semantic features from definition
    const definitionWords = synset.definition.toLowerCase().split(/\s+/);
    const semanticKeywords = [
      'entity', 'object', 'thing', 'concept', 'abstract', 'physical',
      'living', 'animal', 'plant', 'person', 'place', 'action',
      'quality', 'state', 'process', 'event'
    ];
    
    semanticKeywords.forEach((keyword, i) => {
      if (i < 16) {
        features[8 + i] = definitionWords.includes(keyword) ? 1 : 0;
      }
    });
    
    // Word-based features
    const primaryWord = synset.words[0] || '';
    for (let i = 24; i < 32; i++) {
      const charIndex = (i - 24) % primaryWord.length;
      if (charIndex < primaryWord.length) {
        features[i] = (primaryWord.charCodeAt(charIndex) || 0) / 256;
      }
    }
    
    return features;
  }

  /**
   * Add WordNet knowledge to RAG system
   */
  async populateRAGKnowledge(): Promise<void> {
    console.log('📚 Populating RAG system with WordNet knowledge...');
    
    let count = 0;
    for (const synset of this.synsets.values()) {
      const document = this.synsetToDocument(synset);
      await this.ragNode.addDocument(synset.id, document);
      count++;
      
      if (count % 100 === 0) {
        console.log(`   Added ${count}/${this.synsets.size} synsets to RAG...`);
      }
    }
    
    console.log(`✅ Added ${count} WordNet synsets to RAG system`);
  }

  /**
   * Convert synset to document text for RAG
   */
  private synsetToDocument(synset: WordNetSynset): string {
    const parts = [
      `Synset: ${synset.id}`,
      `Words: ${synset.words.join(', ')}`,
      `Part of Speech: ${synset.pos}`,
      `Definition: ${synset.definition}`
    ];
    
    if (synset.examples.length > 0) {
      parts.push(`Examples: ${synset.examples.join('; ')}`);
    }
    
    if (synset.hypernyms.length > 0) {
      const hypernyms = synset.hypernyms.map(id => {
        const hyperSynset = this.synsets.get(id);
        return hyperSynset ? hyperSynset.words[0] : id;
      }).join(', ');
      parts.push(`Parent concepts: ${hypernyms}`);
    }
    
    if (synset.hyponyms.length > 0) {
      const hyponyms = synset.hyponyms.slice(0, 5).map(id => {
        const hypoSynset = this.synsets.get(id);
        return hypoSynset ? hypoSynset.words[0] : id;
      }).join(', ');
      parts.push(`Child concepts: ${hyponyms}${synset.hyponyms.length > 5 ? '...' : ''}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Find semantic neighbors using hyperbolic distance
   */
  findSemanticNeighbors(conceptId: string, topK: number = 10): Array<{ id: string; synset: WordNetSynset; distance: number }> {
    if (!this.hierarchy) {
      throw new Error('Hierarchy not built yet');
    }
    
    const targetNode = this.hierarchy.nodes.find(n => n.id === conceptId);
    if (!targetNode?.embedding) {
      throw new Error(`Concept ${conceptId} not found or no embedding available`);
    }
    
    const neighbors: Array<{ id: string; synset: WordNetSynset; distance: number }> = [];
    
    for (const node of this.hierarchy.nodes) {
      if (node.id === conceptId || !node.embedding) continue;
      
      const distance = HyperbolicArithmetic.distance(targetNode.embedding, node.embedding);
      neighbors.push({
        id: node.id,
        synset: node.synset,
        distance
      });
    }
    
    // Sort by hyperbolic distance
    neighbors.sort((a, b) => a.distance - b.distance);
    
    return neighbors.slice(0, topK);
  }

  /**
   * Analyze hierarchical structure using hyperbolic geometry
   */
  analyzeHierarchicalStructure(): any {
    if (!this.hierarchy) {
      throw new Error('Hierarchy not built yet');
    }
    
    const analysis = {
      totalNodes: this.hierarchy.nodes.length,
      totalEdges: this.hierarchy.edges.length,
      maxDepth: this.hierarchy.maxDepth,
      rootNodes: this.hierarchy.roots.length,
      avgBranchingFactor: 0,
      hyperbolicMetrics: {
        avgDistance: 0,
        maxDistance: 0,
        clusteringCoefficient: 0
      }
    };
    
    // Calculate branching factor
    let totalChildren = 0;
    let nodesWithChildren = 0;
    
    for (const node of this.hierarchy.nodes) {
      if (node.children.length > 0) {
        totalChildren += node.children.length;
        nodesWithChildren++;
      }
    }
    
    analysis.avgBranchingFactor = nodesWithChildren > 0 ? totalChildren / nodesWithChildren : 0;
    
    // Calculate hyperbolic metrics
    const distances: number[] = [];
    
    for (const edge of this.hierarchy.edges) {
      if (edge.hyperbolicDistance !== undefined) {
        distances.push(edge.hyperbolicDistance);
      }
    }
    
    if (distances.length > 0) {
      analysis.hyperbolicMetrics.avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
      analysis.hyperbolicMetrics.maxDistance = Math.max(...distances);
    }
    
    return analysis;
  }

  /**
   * Export training data for external use
   */
  exportTrainingData(): { wordnet: any; h2gnn: TrainingData } {
    if (!this.hierarchy) {
      throw new Error('Hierarchy not built yet');
    }
    
    return {
      wordnet: {
        synsets: Array.from(this.synsets.values()),
        words: Array.from(this.words.values()),
        relations: this.relations,
        hierarchy: this.hierarchy
      },
      h2gnn: this.prepareTrainingData()
    };
  }

  // Getters
  getSynsets(): Map<string, WordNetSynset> {
    return this.synsets;
  }

  getWords(): Map<string, WordNetWord> {
    return this.words;
  }

  getHierarchy(): WordNetHierarchy | null {
    return this.hierarchy;
  }

  getH2GNN(): HyperbolicGeometricHGN {
    return this.h2gnn;
  }

  getRAGNode(): RAGNode {
    return this.ragNode;
  }

  /**
   * Compute hyperbolic distance between two concepts
   */
  computeHyperbolicDistance(embedding1: number[], embedding2: number[]): number {
    if (!embedding1 || !embedding2) {
      throw new Error('Embeddings are required for distance computation');
    }

    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimension');
    }

    // Use hyperbolic distance formula: d(x,y) = arccosh(1 + 2 * ||x-y||² / ((1-||x||²)(1-||y||²)))
    const diff = embedding1.map((val, i) => val - embedding2[i]);
    const diffNormSquared = diff.reduce((sum, val) => sum + val * val, 0);
    
    const norm1Squared = embedding1.reduce((sum, val) => sum + val * val, 0);
    const norm2Squared = embedding2.reduce((sum, val) => sum + val * val, 0);
    
    const denominator = (1 - norm1Squared) * (1 - norm2Squared);
    
    if (denominator <= 0) {
      throw new Error('Invalid embeddings: norms must be less than 1 for hyperbolic space');
    }
    
    const argument = 1 + (2 * diffNormSquared) / denominator;
    
    if (argument <= 1) {
      return 0; // Same point
    }
    
    return Math.acosh(argument);
  }

  /**
   * Find similar concepts using hyperbolic distance
   */
  findSimilarConcepts(concept: string, maxResults: number = 10): Array<{concept: string, distance: number}> {
    if (!this.hierarchy) {
      throw new Error('Hierarchy not built. Call buildHierarchy() first.');
    }

    const targetNode = this.hierarchy.nodes.find(n => 
      n.synset.words.some(w => w.toLowerCase().includes(concept.toLowerCase()))
    );

    if (!targetNode || !targetNode.embedding) {
      throw new Error(`Concept "${concept}" not found or has no embedding`);
    }

    const similarities: Array<{concept: string, distance: number}> = [];

    for (const node of this.hierarchy.nodes) {
      if (node.id !== targetNode.id && node.embedding) {
        try {
          const distance = this.computeHyperbolicDistance(
            targetNode.embedding.data,
            node.embedding.data
          );
          similarities.push({
            concept: node.synset.words.join(', '),
            distance
          });
        } catch (error) {
          // Skip nodes with invalid embeddings
          continue;
        }
      }
    }

    return similarities
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxResults);
  }
}

/**
 * WordNet Training Pipeline
 */
export class WordNetTrainingPipeline {
  private processor: WordNetProcessor;

  constructor(h2gnn?: HyperbolicGeometricHGN) {
    this.processor = new WordNetProcessor(h2gnn);
  }

  /**
   * Run complete training pipeline
   */
  async runPipeline(): Promise<void> {
    console.log('🚀 Starting WordNet + H²GNN training pipeline...');
    
    // Step 1: Load WordNet data
    await this.processor.loadWordNetData();
    
    // Step 2: Build hierarchy
    await this.processor.buildHierarchy();
    
    // Step 3: Generate hyperbolic embeddings
    await this.processor.generateHyperbolicEmbeddings();
    
    // Step 4: Populate RAG system
    await this.processor.populateRAGKnowledge();
    
    // Step 5: Analyze results
    const analysis = this.processor.analyzeHierarchicalStructure();
    console.log('📊 Hierarchical Structure Analysis:', analysis);
    
    console.log('✅ WordNet training pipeline completed successfully!');
  }

  getProcessor(): WordNetProcessor {
    return this.processor;
  }
}

// Export convenience functions
export function createWordNetProcessor(h2gnn?: HyperbolicGeometricHGN): WordNetProcessor {
  return new WordNetProcessor(h2gnn);
}

export function createWordNetPipeline(h2gnn?: HyperbolicGeometricHGN): WordNetTrainingPipeline {
  return new WordNetTrainingPipeline(h2gnn);
}

export default {
  WordNetProcessor,
  WordNetTrainingPipeline,
  createWordNetProcessor,
  createWordNetPipeline
};
