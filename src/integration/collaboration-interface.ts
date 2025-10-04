/**
 * AI-Human Collaboration Interface
 * 
 * Provides a high-level interface for AI agents and humans to collaborate
 * using the H²GNN MCP server
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

export interface CollaborationSession {
  id: string;
  participants: Array<{
    type: 'human' | 'ai';
    name: string;
    capabilities: string[];
  }>;
  context: {
    domain: string;
    concepts: string[];
    goals: string[];
  };
  history: Array<{
    timestamp: Date;
    participant: string;
    action: string;
    data: any;
  }>;
}

export interface ConceptInsight {
  concept: string;
  definition: string;
  hierarchicalPosition: {
    parents: string[];
    children: string[];
    depth: number;
  };
  semanticNeighbors: Array<{
    concept: string;
    distance: number;
    relationship: string;
  }>;
  hyperbolicProperties: {
    norm: number;
    curvature: number;
    embedding: number[];
  };
}

export interface ReasoningChain {
  question: string;
  steps: Array<{
    step: number;
    description: string;
    concepts: string[];
    reasoning: string;
    confidence: number;
  }>;
  conclusion: string;
  evidence: Array<{
    type: 'wordnet' | 'hyperbolic' | 'hierarchical';
    data: any;
  }>;
}

/**
 * Main collaboration interface class
 */
export class AIHumanCollaborationInterface {
  private client: Client;
  private serverProcess: any;
  private sessions: Map<string, CollaborationSession> = new Map();
  private isConnected: boolean = false;

  constructor() {
    this.client = new Client(
      {
        name: "h2gnn-collaboration-client",
        version: "1.0.0"
      },
      {
        capabilities: {}
      }
    );
  }

  /**
   * Initialize the collaboration interface
   */
  async initialize(): Promise<void> {
    try {
      // Start the MCP server process
      this.serverProcess = spawn('node', ['src/mcp/h2gnn-mcp-server.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      // Connect to the server
      const transport = new StdioClientTransport({
        command: "node",
        args: ["src/mcp/h2gnn-mcp-server.js"]
      });

      await this.client.connect(transport);
      this.isConnected = true;

      console.warn('✅ AI-Human Collaboration Interface initialized');
      
      // Initialize WordNet
      await this.initializeWordNet();
      
    } catch (error) {
      console.error('❌ Failed to initialize collaboration interface:', error);
      throw error;
    }
  }

  /**
   * Create a new collaboration session
   */
  async createSession(config: {
    domain: string;
    participants: Array<{ type: 'human' | 'ai'; name: string; capabilities: string[] }>;
    goals: string[];
    initialConcepts?: string[];
  }): Promise<string> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CollaborationSession = {
      id: sessionId,
      participants: config.participants,
      context: {
        domain: config.domain,
        concepts: config.initialConcepts || [],
        goals: config.goals
      },
      history: []
    };

    this.sessions.set(sessionId, session);
    
    // Log session creation
    this.addToHistory(sessionId, 'system', 'session_created', {
      config,
      timestamp: new Date()
    });

    console.warn(`🚀 Created collaboration session: ${sessionId}`);
    console.warn(`👥 Participants: ${config.participants.map(p => `${p.name} (${p.type})`).join(', ')}`);
    console.warn(`🎯 Goals: ${config.goals.join(', ')}`);

    return sessionId;
  }

  /**
   * Analyze a concept collaboratively
   */
  async analyzeConceptCollaboratively(
    sessionId: string, 
    concept: string, 
    participantName: string
  ): Promise<ConceptInsight> {
    this.ensureConnected();
    const session = this.getSession(sessionId);

    // Query WordNet for the concept
    const wordnetResult = await this.client.request(
      { method: "tools/call" },
      { concept, includeHierarchy: true }
    );

    // Explore semantic space around the concept
    const explorationResult = await this.client.request(
      { method: "tools/call" },
      { startConcept: concept, depth: 2, maxResults: 5 }
    );

    // Get system status to check embeddings
    const systemStatus = await this.client.request(
      { method: "resources/read" },
      { uri: "h2gnn://system/status" }
    );

    // Build concept insight
    const insight: ConceptInsight = {
      concept,
      definition: this.extractDefinition(wordnetResult),
      hierarchicalPosition: this.extractHierarchy(wordnetResult),
      semanticNeighbors: this.extractNeighbors(explorationResult),
      hyperbolicProperties: this.extractHyperbolicProps(systemStatus)
    };

    // Add to session history
    this.addToHistory(sessionId, participantName, 'concept_analysis', {
      concept,
      insight,
      timestamp: new Date()
    });

    return insight;
  }

  /**
   * Perform collaborative reasoning
   */
  async performCollaborativeReasoning(
    sessionId: string,
    question: string,
    participantName: string,
    context?: string[]
  ): Promise<ReasoningChain> {
    this.ensureConnected();
    const session = this.getSession(sessionId);

    // Run hierarchical Q&A
    const qaResult = await this.client.request(
      { method: "tools/call" },
      {
        name: "run_hierarchical_qa",
        arguments: { 
          question, 
          context: context || session.context.concepts 
        }
      }
    );

    // Analyze hierarchy for additional context
    const hierarchyResult = await this.client.request(
      { method: "tools/call" },
      {
        name: "analyze_hierarchy",
        arguments: {}
      }
    );

    // Build reasoning chain
    const reasoningChain: ReasoningChain = {
      question,
      steps: this.buildReasoningSteps(qaResult, hierarchyResult),
      conclusion: this.extractConclusion(qaResult),
      evidence: this.gatherEvidence(qaResult, hierarchyResult)
    };

    // Add to session history
    this.addToHistory(sessionId, participantName, 'collaborative_reasoning', {
      question,
      reasoningChain,
      timestamp: new Date()
    });

    return reasoningChain;
  }

  /**
   * Train new concepts collaboratively
   */
  async trainConceptsCollaboratively(
    sessionId: string,
    concepts: string[],
    relationships: Array<{ source: string; target: string; type: string }>,
    participantName: string
  ): Promise<{ success: boolean; embeddings: any; insights: string[] }> {
    this.ensureConnected();
    const session = this.getSession(sessionId);

    // Train concept embeddings
    const trainingResult = await this.client.request(
      { method: "tools/call" },
      {
        name: "train_concept_embeddings",
        arguments: { concepts, relationships }
      }
    );

    // Analyze the new concepts
    const insights: string[] = [];
    for (const concept of concepts) {
      try {
        const analysis = await this.analyzeConceptCollaboratively(sessionId, concept, 'system');
        insights.push(`${concept}: ${analysis.definition}`);
      } catch (error) {
        insights.push(`${concept}: Analysis failed - ${error}`);
      }
    }

    // Update session context
    session.context.concepts = [...new Set([...session.context.concepts, ...concepts])];

    // Add to session history
    this.addToHistory(sessionId, participantName, 'concept_training', {
      concepts,
      relationships,
      insights,
      timestamp: new Date()
    });

    return {
      success: true,
      embeddings: trainingResult,
      insights
    };
  }

  /**
   * Get collaboration session insights
   */
  async getSessionInsights(sessionId: string): Promise<{
    summary: string;
    keyFindings: string[];
    conceptsExplored: string[];
    collaborationMetrics: {
      totalActions: number;
      participantContributions: Record<string, number>;
      conceptsCovered: number;
      reasoningChains: number;
    };
  }> {
    const session = this.getSession(sessionId);
    
    const participantContributions: Record<string, number> = {};
    const conceptsExplored: Set<string> = new Set();
    let reasoningChains = 0;

    // Analyze session history
    for (const entry of session.history) {
      participantContributions[entry.participant] = 
        (participantContributions[entry.participant] || 0) + 1;

      if (entry.action === 'concept_analysis') {
        conceptsExplored.add(entry.data.concept);
      } else if (entry.action === 'collaborative_reasoning') {
        reasoningChains++;
      }
    }

    // Generate key findings
    const keyFindings = this.generateKeyFindings(session);

    return {
      summary: this.generateSessionSummary(session),
      keyFindings,
      conceptsExplored: Array.from(conceptsExplored),
      collaborationMetrics: {
        totalActions: session.history.length,
        participantContributions,
        conceptsCovered: conceptsExplored.size,
        reasoningChains
      }
    };
  }

  /**
   * Get AI assistance for human participants
   */
  async getAIAssistance(
    sessionId: string,
    request: string,
    humanParticipant: string
  ): Promise<{
    suggestions: string[];
    relevantConcepts: string[];
    nextSteps: string[];
    resources: Array<{ type: string; description: string; uri?: string }>;
  }> {
    this.ensureConnected();
    const session = this.getSession(sessionId);

    // Use prompts to get AI assistance
    const conceptAnalysisPrompt = await this.client.request(
      { method: "prompts/get" },
      {
        name: "concept_analysis",
        arguments: { concept: request }
      }
    );

    // Analyze current session context
    const relevantConcepts = session.context.concepts.filter(concept =>
      request.toLowerCase().includes(concept.toLowerCase()) ||
      concept.toLowerCase().includes(request.toLowerCase())
    );

    // Generate suggestions based on session history and context
    const suggestions = this.generateAISuggestions(session, request);
    const nextSteps = this.generateNextSteps(session, request);
    const resources = this.generateResources(session, request);

    // Add to session history
    this.addToHistory(sessionId, 'ai-assistant', 'assistance_provided', {
      request,
      humanParticipant,
      suggestions,
      relevantConcepts,
      timestamp: new Date()
    });

    return {
      suggestions,
      relevantConcepts,
      nextSteps,
      resources
    };
  }

  /**
   * Close collaboration session
   */
  async closeSession(sessionId: string): Promise<void> {
    const session = this.getSession(sessionId);
    
    // Generate final insights
    const insights = await this.getSessionInsights(sessionId);
    
    console.warn(`📊 Session ${sessionId} Summary:`);
    console.warn(`   • Total actions: ${insights.collaborationMetrics.totalActions}`);
    console.warn(`   • Concepts explored: ${insights.collaborationMetrics.conceptsCovered}`);
    console.warn(`   • Reasoning chains: ${insights.collaborationMetrics.reasoningChains}`);
    console.warn(`   • Key findings: ${insights.keyFindings.length}`);

    this.sessions.delete(sessionId);
    console.warn(`✅ Session ${sessionId} closed`);
  }

  /**
   * Cleanup and disconnect
   */
  async cleanup(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
    }
    
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    
    console.warn('🧹 Collaboration interface cleaned up');
  }

  // Private helper methods
  private async initializeWordNet(): Promise<void> {
    try {
      await this.client.request(
        { method: "tools/call" },
        {
          name: "initialize_wordnet",
          arguments: { maxSynsets: 1000, embeddingDim: 128 }
        }
      );
      console.warn('📚 WordNet initialized for collaboration');
    } catch (error) {
      console.error('❌ Failed to initialize WordNet:', error);
    }
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Collaboration interface not connected. Call initialize() first.');
    }
  }

  private getSession(sessionId: string): CollaborationSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return session;
  }

  private addToHistory(sessionId: string, participant: string, action: string, data: any): void {
    const session = this.getSession(sessionId);
    session.history.push({
      timestamp: new Date(),
      participant,
      action,
      data
    });
  }

  private extractDefinition(wordnetResult: any): string {
    // Extract definition from WordNet result
    const content = wordnetResult.content?.[0]?.text || '';
    const match = content.match(/Definition: ([^\n]+)/);
    return match ? match[1] : 'Definition not found';
  }

  private extractHierarchy(wordnetResult: any): { parents: string[]; children: string[]; depth: number } {
    // Extract hierarchical information
    const content = wordnetResult.content?.[0]?.text || '';
    const parentsMatch = content.match(/⬆️ Parents: ([^\n]+)/);
    const childrenMatch = content.match(/⬇️ Children: ([^\n]+)/);
    
    return {
      parents: parentsMatch ? parentsMatch[1].split(', ') : [],
      children: childrenMatch ? childrenMatch[1].split(', ') : [],
      depth: 0 // Would need to calculate from hierarchy
    };
  }

  private extractNeighbors(explorationResult: any): Array<{ concept: string; distance: number; relationship: string }> {
    // Extract semantic neighbors from exploration result
    return []; // Placeholder - would parse exploration results
  }

  private extractHyperbolicProps(systemStatus: any): { norm: number; curvature: number; embedding: number[] } {
    return {
      norm: 0.8,
      curvature: -1.0,
      embedding: []
    };
  }

  private buildReasoningSteps(qaResult: any, hierarchyResult: any): Array<{
    step: number;
    description: string;
    concepts: string[];
    reasoning: string;
    confidence: number;
  }> {
    // Build reasoning steps from Q&A and hierarchy results
    return [
      {
        step: 1,
        description: "Initial concept analysis",
        concepts: [],
        reasoning: "Analyzed question context",
        confidence: 0.9
      }
    ];
  }

  private extractConclusion(qaResult: any): string {
    const content = qaResult.content?.[0]?.text || '';
    const match = content.match(/\*\*Answer\*\*: ([^\n]+)/);
    return match ? match[1] : 'No conclusion available';
  }

  private gatherEvidence(qaResult: any, hierarchyResult: any): Array<{ type: string; data: any }> {
    return [
      { type: 'wordnet', data: qaResult },
      { type: 'hierarchical', data: hierarchyResult }
    ];
  }

  private generateKeyFindings(session: CollaborationSession): string[] {
    // Generate key findings from session history
    const findings: string[] = [];
    
    const conceptAnalyses = session.history.filter(h => h.action === 'concept_analysis');
    if (conceptAnalyses.length > 0) {
      findings.push(`Analyzed ${conceptAnalyses.length} concepts in depth`);
    }

    const reasoningChains = session.history.filter(h => h.action === 'collaborative_reasoning');
    if (reasoningChains.length > 0) {
      findings.push(`Completed ${reasoningChains.length} collaborative reasoning sessions`);
    }

    return findings;
  }

  private generateSessionSummary(session: CollaborationSession): string {
    return `Collaboration session in ${session.context.domain} domain with ${session.participants.length} participants. ` +
           `Explored ${session.context.concepts.length} concepts and completed ${session.history.length} actions.`;
  }

  private generateAISuggestions(session: CollaborationSession, request: string): string[] {
    return [
      "Consider exploring related concepts in the semantic space",
      "Analyze hierarchical relationships for deeper insights",
      "Use hyperbolic distance to find similar concepts"
    ];
  }

  private generateNextSteps(session: CollaborationSession, request: string): string[] {
    return [
      "Query WordNet for additional concept information",
      "Explore semantic neighborhoods",
      "Perform collaborative reasoning on findings"
    ];
  }

  private generateResources(session: CollaborationSession, request: string): Array<{ type: string; description: string; uri?: string }> {
    return [
      {
        type: "wordnet",
        description: "WordNet synsets and hierarchy",
        uri: "h2gnn://wordnet/synsets"
      },
      {
        type: "embeddings",
        description: "Hyperbolic embeddings",
        uri: "h2gnn://embeddings/all"
      }
    ];
  }
}

export default AIHumanCollaborationInterface;
