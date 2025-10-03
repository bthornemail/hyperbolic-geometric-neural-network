#!/usr/bin/env node

/**
 * Phase 4: MCP Tools for Geographic-Hyperbolic Integration
 * 
 * Implements MCP tools for bridging geographic and hyperbolic spaces
 * enabling AI agents to work with geographic-hyperbolic intelligence
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { H2GNNBroker } from '../core/pubsub-architecture.js';
import { HyperbolicProjectionEngine, H2GNNEmbedding } from '../math/hyperbolic-projection-engine.js';
import { RealTimeCollaborationEngine } from '../integration/real-time-collaboration.js';

// 🌐 MCP GEO-INTELLIGENCE TOOLS
export class MCPGeoIntelligenceServer {
  private server: Server;
  private broker: H2GNNBroker;
  private projectionEngine: HyperbolicProjectionEngine;
  private collaborationEngine: RealTimeCollaborationEngine;

  constructor() {
    this.server = new Server(
      {
        name: "mcp-geo-intelligence-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.broker = new H2GNNBroker();
    this.projectionEngine = new HyperbolicProjectionEngine();
    this.collaborationEngine = new RealTimeCollaborationEngine();
    
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_geojson_map",
            description: "Generate GeoJSON map from H²GNN embeddings with optional semantic filtering",
            inputSchema: {
              type: "object",
              properties: {
                semantic_filter: {
                  type: "string",
                  description: "Optional semantic filter for embeddings",
                  default: null
                },
                projection_type: {
                  type: "string",
                  enum: ["stereographic", "mercator", "orthographic"],
                  description: "Type of projection to use",
                  default: "stereographic"
                },
                include_hyperbolic_metrics: {
                  type: "boolean",
                  description: "Include hyperbolic distance and topology metrics",
                  default: true
                }
              }
            }
          },
          {
            name: "define_geo_concept",
            description: "Associate geographic region with H²GNN semantic concept",
            inputSchema: {
              type: "object",
              properties: {
                geo_json: {
                  type: "object",
                  description: "GeoJSON feature or feature collection defining the region"
                },
                semantic_concept: {
                  type: "string",
                  description: "Semantic concept to associate with the region"
                },
                confidence_threshold: {
                  type: "number",
                  description: "Minimum confidence for association",
                  default: 0.7
                }
              },
              required: ["geo_json", "semantic_concept"]
            }
          },
          {
            name: "query_hyperbolic_geography",
            description: "Find hyperbolic neighbors for geographic location",
            inputSchema: {
              type: "object",
              properties: {
                geo_point: {
                  type: "object",
                  description: "GeoJSON Point feature with coordinates [longitude, latitude]"
                },
                max_neighbors: {
                  type: "number",
                  description: "Maximum number of neighbors to return",
                  default: 10
                },
                distance_threshold: {
                  type: "number",
                  description: "Maximum hyperbolic distance for neighbors",
                  default: 1.0
                },
                include_semantic_similarity: {
                  type: "boolean",
                  description: "Include semantic similarity scores",
                  default: true
                }
              },
              required: ["geo_point"]
            }
          },
          {
            name: "semantic_geographic_search",
            description: "Search across hyperbolic-geographic space using semantic queries",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Semantic search query"
                },
                space: {
                  type: "string",
                  enum: ["hyperbolic_geographic", "hyperbolic_only", "geographic_only"],
                  description: "Search space to use",
                  default: "hyperbolic_geographic"
                },
                max_results: {
                  type: "number",
                  description: "Maximum number of results to return",
                  default: 20
                },
                similarity_threshold: {
                  type: "number",
                  description: "Minimum similarity score for results",
                  default: 0.5
                }
              },
              required: ["query"]
            }
          },
          {
            name: "analyze_geographic_clusters",
            description: "Analyze geographic clustering patterns using hyperbolic geometry",
            inputSchema: {
              type: "object",
              properties: {
                region_bounds: {
                  type: "object",
                  description: "Bounding box for analysis region"
                },
                cluster_algorithm: {
                  type: "string",
                  enum: ["hyperbolic_kmeans", "hyperbolic_hierarchical", "topology_based"],
                  description: "Clustering algorithm to use",
                  default: "hyperbolic_kmeans"
                },
                min_cluster_size: {
                  type: "number",
                  description: "Minimum size for clusters",
                  default: 3
                },
                include_topology_analysis: {
                  type: "boolean",
                  description: "Include topological feature analysis",
                  default: true
                }
              }
            }
          },
          {
            name: "generate_geographic_insights",
            description: "Generate insights about geographic patterns using H²GNN analysis",
            inputSchema: {
              type: "object",
              properties: {
                analysis_type: {
                  type: "string",
                  enum: ["semantic_density", "topological_features", "hyperbolic_distances", "comprehensive"],
                  description: "Type of analysis to perform",
                  default: "comprehensive"
                },
                focus_region: {
                  type: "object",
                  description: "Optional focus region for analysis"
                },
                include_recommendations: {
                  type: "boolean",
                  description: "Include actionable recommendations",
                  default: true
                }
              }
            }
          }
        ]
      };
    });

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        throw new McpError(ErrorCode.InvalidRequest, "Arguments are required");
      }

      try {
        switch (name) {
          case "get_geojson_map":
            return await this.getGeoJSONMap(args);
          case "define_geo_concept":
            return await this.defineGeoConcept(args);
          case "query_hyperbolic_geography":
            return await this.queryHyperbolicGeography(args);
          case "semantic_geographic_search":
            return await this.semanticGeographicSearch(args);
          case "analyze_geographic_clusters":
            return await this.analyzeGeographicClusters(args);
          case "generate_geographic_insights":
            return await this.generateGeographicInsights(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });

    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "geo://hyperbolic-embeddings/current",
            mimeType: "application/json",
            name: "Current Hyperbolic Embeddings",
            description: "Latest hyperbolic embeddings with geographic projections"
          },
          {
            uri: "geo://semantic-concepts/registry",
            mimeType: "application/json",
            name: "Semantic Concepts Registry",
            description: "Registry of semantic concepts associated with geographic regions"
          },
          {
            uri: "geo://topology/features",
            mimeType: "application/json",
            name: "Topological Features",
            description: "Current topological features and persistent homology data"
          },
          {
            uri: "geo://collaboration/sessions",
            mimeType: "application/json",
            name: "Active Collaboration Sessions",
            description: "Currently active collaboration sessions and participants"
          }
        ]
      };
    });

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case "geo://hyperbolic-embeddings/current":
          return await this.getCurrentHyperbolicEmbeddings();
        case "geo://semantic-concepts/registry":
          return await this.getSemanticConceptsRegistry();
        case "geo://topology/features":
          return await this.getTopologicalFeatures();
        case "geo://collaboration/sessions":
          return await this.getActiveCollaborationSessions();
        default:
          throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
      }
    });

    // List prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "geographic_analysis",
            description: "Analyze geographic patterns using hyperbolic geometry",
            arguments: [
              {
                name: "region",
                description: "Geographic region to analyze",
                required: true
              },
              {
                name: "analysis_depth",
                description: "Depth of analysis (shallow, medium, deep)",
                required: false
              }
            ]
          },
          {
            name: "semantic_exploration",
            description: "Explore semantic relationships in geographic space",
            arguments: [
              {
                name: "concept",
                description: "Semantic concept to explore",
                required: true
              },
              {
                name: "geographic_scope",
                description: "Geographic scope for exploration",
                required: false
              }
            ]
          },
          {
            name: "collaborative_insights",
            description: "Generate collaborative insights from multiple perspectives",
            arguments: [
              {
                name: "focus_area",
                description: "Area of focus for collaborative analysis",
                required: true
              },
              {
                name: "participant_count",
                description: "Number of participants for collaboration",
                required: false
              }
            ]
          }
        ]
      };
    });

    // Get prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "geographic_analysis":
          return {
            description: `Analyze geographic patterns in region: ${args?.region || 'unknown'}`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Please analyze the geographic patterns in the region: ${args?.region || 'unknown'}. Use hyperbolic geometry to understand the underlying semantic structure and provide insights about the spatial relationships. Analysis depth: ${args?.analysis_depth || 'medium'}.`
                }
              }
            ]
          };

        case "semantic_exploration":
          return {
            description: `Explore semantic concept: ${args?.concept || 'unknown'}`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Please explore the semantic concept "${args?.concept || 'unknown'}" in geographic space. Use the H²GNN to find related concepts and geographic regions, and explain the hyperbolic relationships between them. Geographic scope: ${args?.geographic_scope || 'global'}.`
                }
              }
            ]
          };

        case "collaborative_insights":
          return {
            description: `Generate collaborative insights for: ${args?.focus_area || 'unknown'}`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Please generate collaborative insights for the focus area: ${args?.focus_area || 'unknown'}. Consider multiple perspectives and use the H²GNN to find consensus and identify divergent views. Participant count: ${args?.participant_count || 'multiple'}.`
                }
              }
            ]
          };

        default:
          throw new McpError(ErrorCode.InvalidRequest, `Unknown prompt: ${name}`);
      }
    });
  }

  // 🛠️ TOOL IMPLEMENTATIONS
  private async getGeoJSONMap(args: any): Promise<any> {
    const { semantic_filter, projection_type, include_hyperbolic_metrics } = args;
    
    console.log(`🌐 Generating GeoJSON map with filter: ${semantic_filter}`);
    
    // Get embeddings from H²GNN
    const embeddings = await this.getHyperbolicEmbeddings();
    
    // Apply semantic filter if provided
    const filteredEmbeddings = semantic_filter 
      ? embeddings.filter(e => e.semanticLabel.includes(semantic_filter))
      : embeddings;
    
    // Convert to GeoJSON using projection engine
    const features = this.projectionEngine.batchPoincareToGeographic(filteredEmbeddings);
    
    const geoJSON = {
      type: 'FeatureCollection',
      features: features,
      metadata: {
        projection_type,
        total_features: features.length,
        semantic_filter,
        generated_at: new Date().toISOString(),
        hyperbolic_metrics_included: include_hyperbolic_metrics
      }
    };
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(geoJSON, null, 2)
        }
      ]
    };
  }

  private async defineGeoConcept(args: any): Promise<any> {
    const { geo_json, semantic_concept, confidence_threshold } = args;
    
    console.log(`🎯 Defining geo concept: ${semantic_concept}`);
    
    // Associate geographic region with semantic concept
    await this.broker.defineGeoConcept(geo_json, semantic_concept);
    
    // Publish update to collaboration channels
    this.broker.publish('mcp.collaboration.events', {
      type: 'geo_concept_defined',
      channel: 'mcp.collaboration.events',
      payload: {
        geo_json,
        semantic_concept,
        confidence_threshold,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      priority: 1
    });
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully associated geographic region with semantic concept: ${semantic_concept}`
        }
      ]
    };
  }

  private async queryHyperbolicGeography(args: any): Promise<any> {
    const { geo_point, max_neighbors, distance_threshold, include_semantic_similarity } = args;
    
    console.log(`🔍 Querying hyperbolic geography for point: ${JSON.stringify(geo_point.coordinates)}`);
    
    // Convert geographic point to hyperbolic coordinates
    const hyperbolicPoint = this.projectionEngine.geographicToPoincare([
      geo_point.coordinates[0],
      geo_point.coordinates[1]
    ]);
    
    // Find hyperbolic neighbors
    const neighbors = await this.findHyperbolicNeighbors(
      hyperbolicPoint, 
      max_neighbors, 
      distance_threshold
    );
    
    // Convert neighbors back to geographic coordinates
    const geographicNeighbors = neighbors.map(neighbor => ({
      geographic_coordinates: this.projectionEngine.poincareToGeographic(neighbor.hyperbolicCoords),
      hyperbolic_distance: neighbor.distance,
      semantic_similarity: include_semantic_similarity ? neighbor.similarity : undefined,
      cluster_id: neighbor.clusterId,
      confidence: neighbor.confidence
    }));
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            center_point: geo_point,
            neighbors: geographicNeighbors,
            total_neighbors: geographicNeighbors.length,
            query_confidence: this.calculateQueryConfidence(neighbors)
          }, null, 2)
        }
      ]
    };
  }

  private async semanticGeographicSearch(args: any): Promise<any> {
    const { query, space, max_results, similarity_threshold } = args;
    
    console.log(`🔍 Performing semantic geographic search: ${query}`);
    
    // Perform semantic search in the specified space
    const results = await this.performSemanticSearch(query, space, max_results, similarity_threshold);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            query,
            search_space: space,
            results: results,
            total_results: results.length,
            search_confidence: this.calculateSearchConfidence(results)
          }, null, 2)
        }
      ]
    };
  }

  private async analyzeGeographicClusters(args: any): Promise<any> {
    const { region_bounds, cluster_algorithm, min_cluster_size, include_topology_analysis } = args;
    
    console.log(`📊 Analyzing geographic clusters using ${cluster_algorithm}`);
    
    // Get embeddings within region bounds
    const regionEmbeddings = await this.getEmbeddingsInRegion(region_bounds);
    
    // Perform clustering analysis
    const clusters = await this.performClusteringAnalysis(
      regionEmbeddings,
      cluster_algorithm,
      min_cluster_size
    );
    
    // Include topology analysis if requested
    const topologyAnalysis = include_topology_analysis 
      ? await this.performTopologyAnalysis(clusters)
      : null;
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            region_bounds,
            cluster_algorithm,
            clusters: clusters,
            topology_analysis: topologyAnalysis,
            total_clusters: clusters.length,
            analysis_confidence: this.calculateClusterAnalysisConfidence(clusters)
          }, null, 2)
        }
      ]
    };
  }

  private async generateGeographicInsights(args: any): Promise<any> {
    const { analysis_type, focus_region, include_recommendations } = args;
    
    console.log(`🧠 Generating geographic insights: ${analysis_type}`);
    
    // Perform the requested analysis
    const insights = await this.performGeographicAnalysis(analysis_type, focus_region);
    
    // Include recommendations if requested
    const recommendations = include_recommendations 
      ? await this.generateRecommendations(insights)
      : null;
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            analysis_type,
            focus_region,
            insights: insights,
            recommendations: recommendations,
            generated_at: new Date().toISOString(),
            confidence: this.calculateInsightsConfidence(insights)
          }, null, 2)
        }
      ]
    };
  }

  // 📊 RESOURCE IMPLEMENTATIONS
  private async getCurrentHyperbolicEmbeddings(): Promise<any> {
    const embeddings = await this.getHyperbolicEmbeddings();
    
    return {
      contents: [
        {
          uri: "geo://hyperbolic-embeddings/current",
          mimeType: "application/json",
          text: JSON.stringify({
            embeddings: embeddings,
            total_count: embeddings.length,
            last_updated: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  private async getSemanticConceptsRegistry(): Promise<any> {
    // Get registry of semantic concepts
    const concepts = await this.getSemanticConcepts();
    
    return {
      contents: [
        {
          uri: "geo://semantic-concepts/registry",
          mimeType: "application/json",
          text: JSON.stringify({
            concepts: concepts,
            total_concepts: concepts.length,
            last_updated: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  private async getTopologicalFeatures(): Promise<any> {
    // Get current topological features
    const features = await this.getTopologyData();
    
    return {
      contents: [
        {
          uri: "geo://topology/features",
          mimeType: "application/json",
          text: JSON.stringify({
            features: features,
            last_updated: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  private async getActiveCollaborationSessions(): Promise<any> {
    // Get active collaboration sessions
    const sessions = await this.getCollaborationSessions();
    
    return {
      contents: [
        {
          uri: "geo://collaboration/sessions",
          mimeType: "application/json",
          text: JSON.stringify({
            sessions: sessions,
            total_sessions: sessions.length,
            last_updated: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  // 🎯 HELPER METHODS
  private async getHyperbolicEmbeddings(): Promise<H2GNNEmbedding[]> {
    // Mock implementation - in production, this would get real embeddings
    return [
      {
        hyperbolicCoords: [0.1, 0.2],
        semanticLabel: 'urban_development',
        clusterId: 1,
        semanticCohesion: 0.8,
        usedLorentzStability: false,
        confidence: 0.9,
        topologicalPersistence: 0.7,
        hierarchicalDepth: 2,
        timestamp: Date.now(),
        version: '1.0.0'
      },
      {
        hyperbolicCoords: [0.3, 0.4],
        semanticLabel: 'natural_resources',
        clusterId: 2,
        semanticCohesion: 0.6,
        usedLorentzStability: false,
        confidence: 0.8,
        topologicalPersistence: 0.5,
        hierarchicalDepth: 3,
        timestamp: Date.now(),
        version: '1.0.0'
      }
    ];
  }

  private async findHyperbolicNeighbors(
    center: number[], 
    maxNeighbors: number, 
    distanceThreshold: number
  ): Promise<any[]> {
    // Mock implementation - in production, this would use actual H²GNN
    const neighbors = [];
    for (let i = 0; i < maxNeighbors; i++) {
      neighbors.push({
        hyperbolicCoords: [Math.random() * 2 - 1, Math.random() * 2 - 1],
        distance: Math.random() * distanceThreshold,
        similarity: Math.random(),
        clusterId: i % 5,
        confidence: Math.random()
      });
    }
    return neighbors.sort((a, b) => a.distance - b.distance);
  }

  private calculateQueryConfidence(neighbors: any[]): number {
    return neighbors.reduce((sum, n) => sum + n.confidence, 0) / neighbors.length;
  }

  private async performSemanticSearch(
    query: string, 
    space: string, 
    maxResults: number, 
    threshold: number
  ): Promise<any[]> {
    // Mock implementation
    return Array.from({ length: maxResults }, (_, i) => ({
      result: `Search result ${i + 1} for "${query}"`,
      similarity: Math.random(),
      location: [Math.random() * 360 - 180, Math.random() * 180 - 90],
      confidence: Math.random()
    }));
  }

  private calculateSearchConfidence(results: any[]): number {
    return results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  }

  private async getEmbeddingsInRegion(bounds: any): Promise<H2GNNEmbedding[]> {
    // Mock implementation
    return await this.getHyperbolicEmbeddings();
  }

  private async performClusteringAnalysis(
    embeddings: H2GNNEmbedding[], 
    algorithm: string, 
    minSize: number
  ): Promise<any[]> {
    // Mock implementation
    return [
      {
        id: 'cluster_1',
        size: 5,
        center: [0.1, 0.2],
        members: embeddings.slice(0, 5),
        cohesion: 0.8
      }
    ];
  }

  private async performTopologyAnalysis(clusters: any[]): Promise<any> {
    // Mock implementation
    return {
      bettiNumbers: [1, 2, 0],
      persistentHomology: [],
      topologicalStability: 0.7
    };
  }

  private calculateClusterAnalysisConfidence(clusters: any[]): number {
    return clusters.reduce((sum, c) => sum + c.cohesion, 0) / clusters.length;
  }

  private async performGeographicAnalysis(type: string, region: any): Promise<any> {
    // Mock implementation
    return {
      analysis_type: type,
      key_findings: ['Finding 1', 'Finding 2'],
      patterns: ['Pattern 1', 'Pattern 2'],
      confidence: 0.8
    };
  }

  private async generateRecommendations(insights: any): Promise<string[]> {
    // Mock implementation
    return ['Recommendation 1', 'Recommendation 2'];
  }

  private calculateInsightsConfidence(insights: any): number {
    return insights.confidence || 0.8;
  }

  private async getSemanticConcepts(): Promise<any[]> {
    // Mock implementation
    return [
      { id: 'concept_1', name: 'urban_development', frequency: 10 },
      { id: 'concept_2', name: 'natural_resources', frequency: 8 }
    ];
  }

  private async getTopologyData(): Promise<any> {
    // Mock implementation
    return {
      bettiNumbers: [1, 2, 0],
      persistentHomology: [],
      topologicalStability: 0.7
    };
  }

  private async getCollaborationSessions(): Promise<any[]> {
    // Mock implementation
    return [
      { id: 'session_1', participants: 3, active: true },
      { id: 'session_2', participants: 2, active: false }
    ];
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log("🌐 MCP Geo-Intelligence Server running on stdio");
  }
}

// 🚀 INTEGRATED DEPLOYMENT
export class IntegratedGeoIntelligenceSystem {
  private geoServer: MCPGeoIntelligenceServer;
  private broker: H2GNNBroker;
  private collaborationEngine: RealTimeCollaborationEngine;

  constructor() {
    this.geoServer = new MCPGeoIntelligenceServer();
    this.broker = new H2GNNBroker();
    this.collaborationEngine = new RealTimeCollaborationEngine();
  }

  async startSystem(): Promise<void> {
    // Start all components
    await this.broker.initialize();
    await this.geoServer.start();
    await this.collaborationEngine.joinSession();
    
    console.log('🌐 Integrated Geo-Intelligence System Started');
    console.log('🗺️ MCP Geo-Tools: ACTIVE');
    console.log('🤝 Real-time Collaboration: ENABLED');
    console.log('🧠 H²GNN Intelligence: OPERATIONAL');
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const system = new IntegratedGeoIntelligenceSystem();
  system.startSystem().catch(console.error);
}

export { MCPGeoIntelligenceServer, IntegratedGeoIntelligenceSystem };
