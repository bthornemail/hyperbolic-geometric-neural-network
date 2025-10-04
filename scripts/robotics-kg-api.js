#!/usr/bin/env node

/**
 * Robotics Knowledge Graph API
 * Simple API to query the trained knowledge graph
 */

import fs from 'fs';

let knowledgeGraph = null;

/**
 * Load knowledge graph from file
 */
function loadKnowledgeGraph(filename) {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    knowledgeGraph = JSON.parse(data);
    console.log(`✅ Loaded knowledge graph with ${knowledgeGraph.entities.length} entities and ${knowledgeGraph.relationships.length} relationships`);
    return true;
  } catch (error) {
    console.error('❌ Error loading knowledge graph:', error.message);
    return false;
  }
}

/**
 * Find entities by type
 */
function findEntitiesByType(type) {
  if (!knowledgeGraph) return [];
  
  return knowledgeGraph.entities.filter(entity => entity.type === type);
}

/**
 * Find entities by name (partial match)
 */
function findEntitiesByName(name) {
  if (!knowledgeGraph) return [];
  
  const searchTerm = name.toLowerCase();
  return knowledgeGraph.entities.filter(entity => 
    entity.id.toLowerCase().includes(searchTerm)
  );
}

/**
 * Find relationships involving an entity
 */
function findRelationshipsForEntity(entityId) {
  if (!knowledgeGraph) return [];
  
  return knowledgeGraph.relationships.filter(rel => 
    rel.from === entityId || rel.to === entityId
  );
}

/**
 * Find all objects that can be picked
 */
function findPickableObjects() {
  const pickRelationships = knowledgeGraph.relationships.filter(rel => 
    rel.type === 'acts_on' && rel.from === 'pick'
  );
  
  return [...new Set(pickRelationships.map(rel => rel.to))];
}

/**
 * Find all locations where objects can be placed
 */
function findPlacementLocations() {
  const placeRelationships = knowledgeGraph.relationships.filter(rel => 
    rel.type === 'performed_at' && rel.from === 'place'
  );
  
  return [...new Set(placeRelationships.map(rel => rel.to))];
}

/**
 * Find task patterns
 */
function findTaskPatterns() {
  const patterns = {};
  
  knowledgeGraph.entities
    .filter(entity => entity.type === 'task')
    .forEach(task => {
      const description = task.properties.description;
      const words = description.split(' ');
      
      // Extract action-object-location patterns
      const action = words[0];
      const object = words.slice(1, -3).join(' ');
      const location = words.slice(-2).join(' ');
      
      const pattern = `${action} ${object} ${location}`;
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    });
  
  return Object.entries(patterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}

/**
 * Interactive CLI
 */
function startInteractiveCLI() {
  console.log('\n🤖 Robotics Knowledge Graph API');
  console.log('Available commands:');
  console.log('  objects - Show all objects');
  console.log('  locations - Show all locations');
  console.log('  actions - Show all actions');
  console.log('  pickable - Show pickable objects');
  console.log('  places - Show placement locations');
  console.log('  patterns - Show common task patterns');
  console.log('  search <term> - Search for entities');
  console.log('  relations <entity> - Show relationships for entity');
  console.log('  quit - Exit');
  
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = () => {
    rl.question('\n> ', (input) => {
      const [command, ...args] = input.trim().split(' ');
      
      switch (command.toLowerCase()) {
        case 'objects':
          const objects = findEntitiesByType('object');
          console.log(`\n📦 Objects (${objects.length}):`);
          objects.forEach(obj => console.log(`  - ${obj.id}`));
          break;
          
        case 'locations':
          const locations = findEntitiesByType('location');
          console.log(`\n📍 Locations (${locations.length}):`);
          locations.forEach(loc => console.log(`  - ${loc.id}`));
          break;
          
        case 'actions':
          const actions = findEntitiesByType('action');
          console.log(`\n🎬 Actions (${actions.length}):`);
          actions.forEach(action => console.log(`  - ${action.id}`));
          break;
          
        case 'pickable':
          const pickable = findPickableObjects();
          console.log(`\n🤏 Pickable Objects (${pickable.length}):`);
          pickable.forEach(obj => console.log(`  - ${obj}`));
          break;
          
        case 'places':
          const places = findPlacementLocations();
          console.log(`\n🏠 Placement Locations (${places.length}):`);
          places.forEach(place => console.log(`  - ${place}`));
          break;
          
        case 'patterns':
          const patterns = findTaskPatterns();
          console.log(`\n📋 Common Task Patterns:`);
          patterns.forEach(([pattern, count]) => 
            console.log(`  ${pattern} (${count} times)`)
          );
          break;
          
        case 'search':
          if (args.length === 0) {
            console.log('❌ Please provide a search term');
            break;
          }
          const searchTerm = args.join(' ');
          const results = findEntitiesByName(searchTerm);
          console.log(`\n🔍 Search results for "${searchTerm}" (${results.length}):`);
          results.forEach(entity => 
            console.log(`  - ${entity.id} (${entity.type})`)
          );
          break;
          
        case 'relations':
          if (args.length === 0) {
            console.log('❌ Please provide an entity name');
            break;
          }
          const entityName = args.join(' ');
          const relations = findRelationshipsForEntity(entityName);
          console.log(`\n🔗 Relationships for "${entityName}" (${relations.length}):`);
          relations.forEach(rel => 
            console.log(`  ${rel.from} --[${rel.type}]--> ${rel.to}`)
          );
          break;
          
        case 'quit':
        case 'exit':
          console.log('👋 Goodbye!');
          rl.close();
          return;
          
        default:
          console.log('❌ Unknown command. Type "quit" to exit.');
      }
      
      askQuestion();
    });
  };
  
  askQuestion();
}

/**
 * Main function
 */
async function main() {
  // Find the most recent knowledge graph file
  const files = fs.readdirSync('..').filter(f => f.startsWith('robotics-knowledge-graph-') && f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('❌ No knowledge graph files found. Please run the training script first.');
    process.exit(1);
  }
  
  const latestFile = files.sort().pop();
  console.log(`📁 Loading knowledge graph from: ${latestFile}`);
  
  if (!loadKnowledgeGraph(`../${latestFile}`)) {
    process.exit(1);
  }
  
  // Start interactive CLI
  await startInteractiveCLI();
}

// Run the API
main().catch(console.error);
