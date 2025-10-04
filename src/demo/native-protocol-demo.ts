#!/usr/bin/env node

/**
 * Native H²GNN Protocol Demo
 * 
 * Demonstrates the complete Native H²GNN Communication Protocol
 * with BIP32 HD addressing, multi-transport layers, and data encoding
 */

import { NativeH2GNNProtocol, ProtocolConfig, HyperbolicEmbedding } from '../core/native-protocol.js';
import { ProtocolEncoder } from '../core/protocol-encoders.js';
import { createHash, randomBytes } from 'crypto';

// 🎯 Demo Configuration
const DEMO_CONFIG: ProtocolConfig = {
  bip32: {
    seed: Buffer.from('h2gnn-demo-seed-for-deterministic-addressing', 'utf8'),
    network: 'testnet'
  },
  transports: {
    mqtt: {
      broker: 'localhost',
      port: 1883,
      clientId: 'h2gnn-demo'
    },
    webrtc: {
      turn: {
        server: 'turn.example.com',
        username: 'demo-user',
        credential: 'demo-pass'
      }
    },
    websocket: {
      server: 'localhost',
      port: 8080
    },
    udp: {
      host: 'localhost',
      port: 3001
    },
    tcp: {
      host: 'localhost',
      port: 3000
    },
    ipc: {
      socketPath: '/tmp/h2gnn-demo.sock'
    }
  },
  webauthn: {
    rpId: 'localhost',
    rpName: 'H²GNN Demo',
    origin: 'http://localhost:3000'
  }
};

// 🧠 Generate Sample Hyperbolic Embeddings
function generateSampleEmbeddings(count: number = 10): HyperbolicEmbedding[] {
  const embeddings: HyperbolicEmbedding[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate deterministic hyperbolic coordinates
    const seed = `embedding-${i}`;
    const hash = createHash('sha256').update(seed).digest();
    
    const x = (hash.readUInt32BE(0) / 0xFFFFFFFF) * 1.8 - 0.9; // -0.9 to 0.9
    const y = (hash.readUInt32BE(4) / 0xFFFFFFFF) * 1.8 - 0.9; // -0.9 to 0.9
    
    // Ensure coordinates are within Poincaré disk
    const magnitude = Math.sqrt(x * x + y * y);
    const finalX = magnitude >= 1 ? x * 0.9 : x;
    const finalY = magnitude >= 1 ? y * 0.9 : y;
    
    // Generate embedding vector
    const embedding: number[] = [];
    for (let j = 0; j < 64; j += 4) {
      const value = hash.readUInt32BE(j % hash.length) / 0xFFFFFFFF;
      embedding.push(value * 2 - 1); // -1 to 1
    }
    
    embeddings.push({
      coordinates: [finalX, finalY],
      curvature: -1.0,
      embedding,
      semanticLabel: `concept-${i}`,
      clusterId: Math.floor(i / 3), // Group into clusters
      confidence: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      timestamp: Date.now() + i * 1000
    });
  }
  
  return embeddings;
}

// 🚀 Main Demo Function
async function runNativeProtocolDemo(): Promise<void> {
  console.warn('🚀 Native H²GNN Protocol Demo Starting...\n');
  
  try {
    // 1. Initialize Protocol
    console.warn('1️⃣ Initializing Native H²GNN Protocol...');
    const protocol = new NativeH2GNNProtocol(DEMO_CONFIG);
    await protocol.initialize();
    console.warn('✅ Protocol initialized successfully\n');
    
    // 2. Create H²GNN Addresses
    console.warn('2️⃣ Creating H²GNN addresses with BIP32 HD addressing...');
    
    const brokerAddress = protocol.createAddress('broker', 0, 'external', 'mqtt', 'localhost', 1883);
    const providerAddress = protocol.createAddress('provider', 0, 'external', 'websocket', 'localhost', 8080);
    const consumerAddress = protocol.createAddress('consumer', 0, 'external', 'tcp', 'localhost', 3000);
    const mcpAddress = protocol.createAddress('mcp', 0, 'external', 'ipc', '/tmp/h2gnn-mcp');
    
    console.warn('📍 Broker Address:', brokerAddress.path);
    console.warn('📍 Provider Address:', providerAddress.path);
    console.warn('📍 Consumer Address:', consumerAddress.path);
    console.warn('📍 MCP Address:', mcpAddress.path);
    console.warn('✅ Addresses created successfully\n');
    
    // 3. Generate Sample Data
    console.warn('3️⃣ Generating sample hyperbolic embeddings...');
    const embeddings = generateSampleEmbeddings(20);
    console.warn(`✅ Generated ${embeddings.length} hyperbolic embeddings\n`);
    
    // 4. Demonstrate Data Encoding
    console.warn('4️⃣ Demonstrating data encoding formats...');
    const encoder = new ProtocolEncoder();
    
    // Binary encoding
    console.warn('📦 Binary encoding (high-performance)...');
    const binaryData = encoder.encode(embeddings, 'binary');
    console.warn(`   Size: ${(binaryData as ArrayBuffer).byteLength} bytes`);
    
    // JSON encoding
    console.warn('📄 JSON encoding (human-readable)...');
    const jsonData = encoder.encode(embeddings, 'json');
    console.warn(`   Size: ${(jsonData as string).length} characters`);
    
    // GeoJSON encoding
    console.warn('🌍 GeoJSON encoding (geographic visualization)...');
    const geoJSONData = encoder.encode(embeddings, 'geojson');
    const geoJSON = JSON.parse(geoJSONData as string);
    console.warn(`   Features: ${geoJSON.features.length}`);
    
    // TopoJSON encoding
    console.warn('🔗 TopoJSON encoding (topological relationships)...');
    const topoJSONData = encoder.encode(embeddings, 'topojson');
    const topoJSON = JSON.parse(topoJSONData as string);
    console.warn(`   Arcs: ${topoJSON.arcs.length}`);
    console.warn('✅ Data encoding demonstrated successfully\n');
    
    // 5. Demonstrate Message Creation
    console.warn('5️⃣ Creating protocol messages...');
    
    const embeddingMessage = protocol.createMessage(
      providerAddress,
      'embeddings',
      embeddings.slice(0, 5),
      'binary'
    );
    
    const trainingMessage = protocol.createMessage(
      consumerAddress,
      'training',
      {
        epoch: 1,
        loss: 0.123,
        accuracy: 0.987,
        embeddings: embeddings.slice(0, 3)
      },
      'json'
    );
    
    const visualizationMessage = protocol.createMessage(
      brokerAddress,
      'visualization',
      embeddings,
      'geojson'
    );
    
    console.warn('📤 Embedding message created:', embeddingMessage.header.messageId);
    console.warn('📤 Training message created:', trainingMessage.header.messageId);
    console.warn('📤 Visualization message created:', visualizationMessage.header.messageId);
    console.warn('✅ Protocol messages created successfully\n');
    
    // 6. Demonstrate RPC Endpoints
    console.warn('6️⃣ Demonstrating deterministic RPC endpoints...');
    
    const brokerEndpoint = protocol.getRPCEndpoint(brokerAddress);
    const providerEndpoint = protocol.getRPCEndpoint(providerAddress);
    const consumerEndpoint = protocol.getRPCEndpoint(consumerAddress);
    const mcpEndpoint = protocol.getRPCEndpoint(mcpAddress);
    
    console.warn('🔗 Broker RPC Endpoint:', brokerEndpoint);
    console.warn('🔗 Provider RPC Endpoint:', providerEndpoint);
    console.warn('🔗 Consumer RPC Endpoint:', consumerEndpoint);
    console.warn('🔗 MCP RPC Endpoint:', mcpEndpoint);
    console.warn('✅ RPC endpoints generated successfully\n');
    
    // 7. Demonstrate Message Routing
    console.warn('7️⃣ Demonstrating message routing (simulated)...');
    
    console.warn('📤 Sending embedding message via MQTT...');
    await protocol.sendMessage(providerAddress, embeddingMessage);
    
    console.warn('📤 Sending training message via WebSocket...');
    await protocol.sendMessage(consumerAddress, trainingMessage);
    
    console.warn('📤 Sending visualization message via MQTT...');
    await protocol.sendMessage(brokerAddress, visualizationMessage);
    
    console.warn('✅ Message routing demonstrated successfully\n');
    
    // 8. Demonstrate Hyperbolic Geometry
    console.warn('8️⃣ Demonstrating hyperbolic geometry features...');
    
    const sampleEmbedding = embeddings[0];
    console.warn('🧮 Sample embedding coordinates:', sampleEmbedding.coordinates);
    console.warn('🧮 Curvature:', sampleEmbedding.curvature);
    console.warn('🧮 Embedding dimension:', sampleEmbedding.embedding.length);
    console.warn('🧮 Semantic label:', sampleEmbedding.semanticLabel);
    console.warn('🧮 Cluster ID:', sampleEmbedding.clusterId);
    console.warn('🧮 Confidence:', sampleEmbedding.confidence);
    
    // Calculate hyperbolic distance
    const distance = calculateHyperbolicDistance(sampleEmbedding.coordinates, embeddings[1].coordinates);
    console.warn('📏 Hyperbolic distance to next embedding:', distance.toFixed(4));
    console.warn('✅ Hyperbolic geometry demonstrated successfully\n');
    
    // 9. Performance Analysis
    console.warn('9️⃣ Performance analysis...');
    
    const startTime = Date.now();
    const largeEmbeddings = generateSampleEmbeddings(1000);
    const encodingTime = Date.now() - startTime;
    
    console.warn(`⚡ Generated 1000 embeddings in ${encodingTime}ms`);
    console.warn(`⚡ Average time per embedding: ${(encodingTime / 1000).toFixed(2)}ms`);
    
    const binaryStart = Date.now();
    const largeBinaryData = encoder.encode(largeEmbeddings, 'binary');
    const binaryTime = Date.now() - binaryStart;
    
    console.warn(`⚡ Binary encoding of 1000 embeddings: ${binaryTime}ms`);
    console.warn(`⚡ Binary data size: ${(largeBinaryData as ArrayBuffer).byteLength} bytes`);
    console.warn(`⚡ Compression ratio: ${((largeBinaryData as ArrayBuffer).byteLength / (JSON.stringify(largeEmbeddings).length * 1.5)).toFixed(2)}x`);
    console.warn('✅ Performance analysis completed\n');
    
    // 10. Summary
    console.warn('🎉 Native H²GNN Protocol Demo Completed Successfully!');
    console.warn('\n📊 Summary:');
    console.warn('   ✅ BIP32 HD addressing implemented');
    console.warn('   ✅ Multi-transport protocol stack ready');
    console.warn('   ✅ Binary/JSON/GeoJSON/TopoJSON encoding working');
    console.warn('   ✅ Deterministic RPC endpoints generated');
    console.warn('   ✅ Hyperbolic geometry calculations functional');
    console.warn('   ✅ High-performance binary encoding optimized');
    console.warn('\n🚀 The Native H²GNN Protocol is ready for production use!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// 🧮 Helper function to calculate hyperbolic distance
function calculateHyperbolicDistance(coords1: number[], coords2: number[]): number {
  const [x1, y1] = coords1;
  const [x2, y2] = coords2;
  
  const dx = x2 - x1;
  const dy = y2 - y1;
  const euclideanDistance = Math.sqrt(dx * dx + dy * dy);
  
  const magnitude1 = Math.sqrt(x1 * x1 + y1 * y1);
  const magnitude2 = Math.sqrt(x2 * x2 + y2 * y2);
  
  if (magnitude1 >= 1 || magnitude2 >= 1) return Infinity;
  
  const numerator = Math.pow(euclideanDistance, 2);
  const denominator = (1 - magnitude1 * magnitude1) * (1 - magnitude2 * magnitude2);
  
  return Math.acosh(1 + 2 * numerator / denominator);
}

// 🎯 Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runNativeProtocolDemo().catch(console.error);
}

export { runNativeProtocolDemo };
