#!/usr/bin/env node

/**
 * Robotics Knowledge Graph Training Script
 * Fetches InternRobotics dataset and builds a knowledge graph
 */

import fetch from 'node-fetch';

// Knowledge Graph Data Structures
const knowledgeGraph = {
  entities: new Map(),
  relationships: new Map(),
  tasks: new Map(),
  objects: new Map(),
  locations: new Map(),
  actions: new Map()
};

// Entity types
const ENTITY_TYPES = {
  OBJECT: 'object',
  LOCATION: 'location', 
  ACTION: 'action',
  TASK: 'task',
  CONTAINER: 'container'
};

/**
 * Extract entities from task description
 */
function extractEntities(taskDescription) {
  const entities = {
    objects: [],
    locations: [],
    actions: [],
    containers: []
  };

  // Common robotics objects
  const objectPatterns = [
    /\b(apple|orange|banana|grape|fruit)\b/gi,
    /\b(chip|bag|chips|snack)\b/gi,
    /\b(can|coke|soda|drink|bottle|water)\b/gi,
    /\b(sponge|towel|cloth)\b/gi,
    /\b(rxbar|chocolate|food|snack)\b/gi,
    /\b(book|paper|document)\b/gi,
    /\b(toy|ball|block|object)\b/gi
  ];

  // Common locations
  const locationPatterns = [
    /\b(drawer|shelf|counter|table|desk)\b/gi,
    /\b(fridge|refrigerator|cabinet|cupboard)\b/gi,
    /\b(bowl|plate|container|box)\b/gi,
    /\b(top|bottom|middle|left|right|center)\b/gi
  ];

  // Common actions
  const actionPatterns = [
    /\b(pick|grab|take|hold)\b/gi,
    /\b(place|put|set|drop)\b/gi,
    /\b(move|push|pull|drag)\b/gi,
    /\b(open|close|shut)\b/gi,
    /\b(knock|push|tip|tilt)\b/gi,
    /\b(clean|wipe|wash)\b/gi
  ];

  // Extract objects
  objectPatterns.forEach(pattern => {
    const matches = taskDescription.match(pattern);
    if (matches) {
      entities.objects.push(...matches.map(m => m.toLowerCase()));
    }
  });

  // Extract locations
  locationPatterns.forEach(pattern => {
    const matches = taskDescription.match(pattern);
    if (matches) {
      entities.locations.push(...matches.map(m => m.toLowerCase()));
    }
  });

  // Extract actions
  actionPatterns.forEach(pattern => {
    const matches = taskDescription.match(pattern);
    if (matches) {
      entities.actions.push(...matches.map(m => m.toLowerCase()));
    }
  });

  return entities;
}

/**
 * Create relationships between entities
 */
function createRelationships(taskDescription, entities, taskId) {
  const relationships = [];

  // Action-Object relationships
  entities.actions.forEach(action => {
    entities.objects.forEach(obj => {
      relationships.push({
        from: action,
        to: obj,
        type: 'acts_on',
        task: taskId,
        description: `${action} ${obj}`
      });
    });
  });

  // Object-Location relationships
  entities.objects.forEach(obj => {
    entities.locations.forEach(loc => {
      relationships.push({
        from: obj,
        to: loc,
        type: 'located_at',
        task: taskId,
        description: `${obj} at ${loc}`
      });
    });
  });

  // Action-Location relationships
  entities.actions.forEach(action => {
    entities.locations.forEach(loc => {
      relationships.push({
        from: action,
        to: loc,
        type: 'performed_at',
        task: taskId,
        description: `${action} at ${loc}`
      });
    });
  });

  return relationships;
}

/**
 * Add entity to knowledge graph
 */
function addEntity(entity, type, properties = {}) {
  if (!knowledgeGraph.entities.has(entity)) {
    knowledgeGraph.entities.set(entity, {
      id: entity,
      type: type,
      properties: properties,
      relationships: []
    });
  }
  return knowledgeGraph.entities.get(entity);
}

/**
 * Add relationship to knowledge graph
 */
function addRelationship(relationship) {
  const relId = `${relationship.from}_${relationship.type}_${relationship.to}`;
  
  if (!knowledgeGraph.relationships.has(relId)) {
    knowledgeGraph.relationships.set(relId, {
      id: relId,
      from: relationship.from,
      to: relationship.to,
      type: relationship.type,
      tasks: new Set(),
      description: relationship.description
    });
  }
  
  // Add task to relationship
  knowledgeGraph.relationships.get(relId).tasks.add(relationship.task);
  
  // Add to entity relationships
  const fromEntity = knowledgeGraph.entities.get(relationship.from);
  const toEntity = knowledgeGraph.entities.get(relationship.to);
  
  if (fromEntity) fromEntity.relationships.push(relId);
  if (toEntity) toEntity.relationships.push(relId);
}

/**
 * Fetch robotics dataset
 */
async function fetchRoboticsDataset(limit = 100) {
  console.log(`🤖 Fetching robotics dataset (limit: ${limit})...`);
  
  try {
    const response = await fetch(
      `https://datasets-server.huggingface.co/rows?dataset=InternRobotics%2FInternData-fractal20220817_data&config=default&split=test&offset=0&length=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${data.rows.length} robotics tasks`);
    return data.rows;
  } catch (error) {
    console.error('❌ Error fetching dataset:', error.message);
    throw error;
  }
}

/**
 * Process robotics tasks and build knowledge graph
 */
async function processRoboticsTasks(tasks) {
  console.log('🧠 Processing robotics tasks and building knowledge graph...');
  
  let processedTasks = 0;
  
  for (const taskRow of tasks) {
    const task = taskRow.row;
    const taskId = `task_${task.episode_index}`;
    
    // Add task to knowledge graph
    addEntity(taskId, ENTITY_TYPES.TASK, {
      episode_index: task.episode_index,
      length: task.length,
      description: task.tasks[0]
    });
    
    // Process each task description
    for (const taskDescription of task.tasks) {
      console.log(`  📝 Processing: "${taskDescription}"`);
      
      // Extract entities
      const entities = extractEntities(taskDescription);
      
      // Add entities to knowledge graph
      entities.objects.forEach(obj => addEntity(obj, ENTITY_TYPES.OBJECT));
      entities.locations.forEach(loc => addEntity(loc, ENTITY_TYPES.LOCATION));
      entities.actions.forEach(action => addEntity(action, ENTITY_TYPES.ACTION));
      
      // Create relationships
      const relationships = createRelationships(taskDescription, entities, taskId);
      relationships.forEach(rel => addRelationship(rel));
    }
    
    processedTasks++;
    if (processedTasks % 10 === 0) {
      console.log(`  📊 Processed ${processedTasks} tasks...`);
    }
  }
  
  console.log(`✅ Processed ${processedTasks} tasks total`);
}

/**
 * Analyze knowledge graph
 */
function analyzeKnowledgeGraph() {
  console.log('\n📊 Knowledge Graph Analysis:');
  console.log(`  📦 Total entities: ${knowledgeGraph.entities.size}`);
  console.log(`  🔗 Total relationships: ${knowledgeGraph.relationships.size}`);
  
  // Count by type
  const entityCounts = {};
  knowledgeGraph.entities.forEach(entity => {
    entityCounts[entity.type] = (entityCounts[entity.type] || 0) + 1;
  });
  
  console.log('\n📈 Entity breakdown:');
  Object.entries(entityCounts).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  // Most connected entities
  const entityConnections = new Map();
  knowledgeGraph.entities.forEach(entity => {
    entityConnections.set(entity.id, entity.relationships.length);
  });
  
  const topEntities = Array.from(entityConnections.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  console.log('\n🔝 Most connected entities:');
  topEntities.forEach(([entity, connections]) => {
    console.log(`  ${entity}: ${connections} connections`);
  });
  
  // Relationship types
  const relationshipTypes = {};
  knowledgeGraph.relationships.forEach(rel => {
    relationshipTypes[rel.type] = (relationshipTypes[rel.type] || 0) + 1;
  });
  
  console.log('\n🔗 Relationship types:');
  Object.entries(relationshipTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
}

/**
 * Export knowledge graph
 */
async function exportKnowledgeGraph() {
  const exportData = {
    entities: Array.from(knowledgeGraph.entities.values()),
    relationships: Array.from(knowledgeGraph.relationships.values()),
    metadata: {
      totalEntities: knowledgeGraph.entities.size,
      totalRelationships: knowledgeGraph.relationships.size,
      created: new Date().toISOString()
    }
  };
  
  console.log('\n💾 Exporting knowledge graph...');
  
  // Save to file
  const fs = await import('fs');
  const filename = `robotics-knowledge-graph-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
  
  console.log(`✅ Knowledge graph exported to: ${filename}`);
  return filename;
}

/**
 * Main training function
 */
async function trainRoboticsKnowledgeGraph() {
  console.log('🚀 Starting Robotics Knowledge Graph Training...\n');
  
  try {
    // Step 1: Fetch dataset
    const tasks = await fetchRoboticsDataset(100);
    
    // Step 2: Process tasks and build knowledge graph
    await processRoboticsTasks(tasks);
    
    // Step 3: Analyze results
    analyzeKnowledgeGraph();
    
    // Step 4: Export knowledge graph
    const filename = await exportKnowledgeGraph();
    
    console.log('\n🎉 Robotics Knowledge Graph training completed successfully!');
    console.log(`📁 Knowledge graph saved to: ${filename}`);
    
  } catch (error) {
    console.error('❌ Training failed:', error);
    process.exit(1);
  }
}

// Run the training
trainRoboticsKnowledgeGraph();
