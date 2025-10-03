#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * Validates that all required environment variables are set correctly
 * for the H²GNN system based on the current NODE_ENV.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment configuration schema
const ENV_SCHEMA = {
  development: {
    required: [
      'NODE_ENV',
      'APP_NAME',
      'APP_VERSION',
      'APP_PORT',
      'APP_HOST',
      'H2GNN_EMBEDDING_DIM',
      'H2GNN_NUM_LAYERS',
      'H2GNN_CURVATURE',
      'PERSISTENCE_PATH',
      'HD_ADDRESSING_SEED',
      'HD_ADDRESSING_NETWORK',
      'MCP_SERVER_PORT',
      'MCP_SERVER_HOST',
      'LOG_LEVEL'
    ],
    optional: [
      'TRANSPORT_MQTT_ENABLED',
      'TRANSPORT_WEBSOCKET_ENABLED',
      'TRANSPORT_WEBRTC_ENABLED',
      'TRANSPORT_REDIS_ENABLED',
      'SECURITY_ENABLED',
      'MONITORING_ENABLED'
    ]
  },
  staging: {
    required: [
      'NODE_ENV',
      'APP_NAME',
      'APP_VERSION',
      'APP_PORT',
      'APP_HOST',
      'H2GNN_EMBEDDING_DIM',
      'H2GNN_NUM_LAYERS',
      'H2GNN_CURVATURE',
      'PERSISTENCE_PATH',
      'HD_ADDRESSING_SEED',
      'HD_ADDRESSING_NETWORK',
      'MCP_SERVER_PORT',
      'MCP_SERVER_HOST',
      'LOG_LEVEL',
      'SECURITY_ENABLED',
      'SECURITY_CORS_ORIGINS'
    ],
    optional: [
      'TRANSPORT_MQTT_HOST',
      'TRANSPORT_MQTT_PORT',
      'TRANSPORT_WEBSOCKET_HOST',
      'TRANSPORT_WEBSOCKET_PORT',
      'TRANSPORT_REDIS_HOST',
      'TRANSPORT_REDIS_PORT',
      'MONITORING_ENABLED'
    ]
  },
  production: {
    required: [
      'NODE_ENV',
      'APP_NAME',
      'APP_VERSION',
      'APP_PORT',
      'APP_HOST',
      'H2GNN_EMBEDDING_DIM',
      'H2GNN_NUM_LAYERS',
      'H2GNN_CURVATURE',
      'PERSISTENCE_PATH',
      'HD_ADDRESSING_SEED',
      'HD_ADDRESSING_NETWORK',
      'MCP_SERVER_PORT',
      'MCP_SERVER_HOST',
      'LOG_LEVEL',
      'SECURITY_ENABLED',
      'SECURITY_CORS_ORIGINS',
      'SECURITY_JWT_SECRET',
      'SECURITY_ENCRYPTION_KEY'
    ],
    optional: [
      'TRANSPORT_MQTT_HOST',
      'TRANSPORT_MQTT_PORT',
      'TRANSPORT_MQTT_USERNAME',
      'TRANSPORT_MQTT_PASSWORD',
      'TRANSPORT_WEBSOCKET_HOST',
      'TRANSPORT_WEBSOCKET_PORT',
      'TRANSPORT_REDIS_HOST',
      'TRANSPORT_REDIS_PORT',
      'TRANSPORT_REDIS_PASSWORD',
      'MONITORING_ENABLED',
      'MONITORING_ALERTING_ENABLED',
      'DATABASE_URL'
    ]
  }
};

// Validation rules
const VALIDATION_RULES = {
  NODE_ENV: {
    type: 'string',
    values: ['development', 'staging', 'production'],
    required: true
  },
  APP_PORT: {
    type: 'number',
    min: 1000,
    max: 65535,
    required: true
  },
  H2GNN_EMBEDDING_DIM: {
    type: 'number',
    min: 8,
    max: 512,
    required: true
  },
  H2GNN_NUM_LAYERS: {
    type: 'number',
    min: 1,
    max: 10,
    required: true
  },
  H2GNN_CURVATURE: {
    type: 'number',
    max: 0,
    required: true
  },
  LOG_LEVEL: {
    type: 'string',
    values: ['error', 'warn', 'info', 'debug'],
    required: true
  }
};

/**
 * Load environment variables from .env file
 */
function loadEnvFile(envFile) {
  const envPath = path.resolve(process.cwd(), envFile);
  
  if (!fs.existsSync(envPath)) {
    console.warn(`⚠️  Environment file ${envFile} not found`);
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        envVars[key.trim()] = value;
      }
    }
  });
  
  return envVars;
}

/**
 * Validate a single environment variable
 */
function validateEnvVar(key, value, rules) {
  const errors = [];
  
  if (rules.required && (!value || value.trim() === '')) {
    errors.push(`Required environment variable ${key} is missing or empty`);
    return errors;
  }
  
  if (!value || value.trim() === '') {
    return errors; // Skip validation for empty optional values
  }
  
  // Type validation
  if (rules.type === 'number') {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      errors.push(`Environment variable ${key} must be a number, got: ${value}`);
    } else {
      if (rules.min !== undefined && numValue < rules.min) {
        errors.push(`Environment variable ${key} must be >= ${rules.min}, got: ${numValue}`);
      }
      if (rules.max !== undefined && numValue > rules.max) {
        errors.push(`Environment variable ${key} must be <= ${rules.max}, got: ${numValue}`);
      }
    }
  }
  
  // Value validation
  if (rules.values && !rules.values.includes(value)) {
    errors.push(`Environment variable ${key} must be one of: ${rules.values.join(', ')}, got: ${value}`);
  }
  
  return errors;
}

/**
 * Validate environment configuration
 */
function validateEnvironment() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envFile = `.env.${nodeEnv}`;
  
  console.log(`🔍 Validating environment for ${nodeEnv}...`);
  console.log(`📁 Loading environment from ${envFile}`);
  
  // Load environment variables
  const envVars = loadEnvFile(envFile);
  
  // Merge with process.env (process.env takes precedence)
  const allEnvVars = { ...envVars, ...process.env };
  
  // Get schema for current environment
  const schema = ENV_SCHEMA[nodeEnv];
  if (!schema) {
    console.error(`❌ Unknown environment: ${nodeEnv}`);
    console.error(`   Supported environments: ${Object.keys(ENV_SCHEMA).join(', ')}`);
    process.exit(1);
  }
  
  const errors = [];
  const warnings = [];
  
  // Validate required variables
  console.log(`\n📋 Checking required variables...`);
  schema.required.forEach(key => {
    const value = allEnvVars[key];
    const rules = VALIDATION_RULES[key] || { required: true };
    
    if (!value || value.trim() === '') {
      errors.push(`❌ Required environment variable ${key} is missing`);
    } else {
      const validationErrors = validateEnvVar(key, value, rules);
      errors.push(...validationErrors);
    }
  });
  
  // Validate optional variables
  console.log(`\n📋 Checking optional variables...`);
  schema.optional.forEach(key => {
    const value = allEnvVars[key];
    const rules = VALIDATION_RULES[key];
    
    if (value && rules) {
      const validationErrors = validateEnvVar(key, value, rules);
      errors.push(...validationErrors);
    }
  });
  
  // Check for unknown variables
  console.log(`\n📋 Checking for unknown variables...`);
  const knownVars = [...schema.required, ...schema.optional];
  Object.keys(allEnvVars).forEach(key => {
    if (key.startsWith('H2GNN_') || key.startsWith('MCP_') || key.startsWith('TRANSPORT_') || 
        key.startsWith('COLLABORATION_') || key.startsWith('VISUALIZATION_') || 
        key.startsWith('LSP_AST_') || key.startsWith('SECURITY_') || 
        key.startsWith('LOG_') || key.startsWith('MONITORING_') ||
        key.startsWith('APP_') || key.startsWith('PERSISTENCE_') ||
        key.startsWith('HD_ADDRESSING_') || key.startsWith('DEV_') ||
        key.startsWith('STAGING_') || key.startsWith('PRODUCTION_')) {
      if (!knownVars.includes(key)) {
        warnings.push(`⚠️  Unknown environment variable: ${key}`);
      }
    }
  });
  
  // Display results
  console.log(`\n📊 Validation Results:`);
  
  if (errors.length === 0) {
    console.log(`✅ All required environment variables are valid`);
  } else {
    console.log(`❌ Found ${errors.length} validation errors:`);
    errors.forEach(error => console.log(`   ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Found ${warnings.length} warnings:`);
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  // Display current environment summary
  console.log(`\n🌍 Environment Summary:`);
  console.log(`   NODE_ENV: ${allEnvVars.NODE_ENV || 'not set'}`);
  console.log(`   APP_NAME: ${allEnvVars.APP_NAME || 'not set'}`);
  console.log(`   APP_VERSION: ${allEnvVars.APP_VERSION || 'not set'}`);
  console.log(`   APP_PORT: ${allEnvVars.APP_PORT || 'not set'}`);
  console.log(`   APP_HOST: ${allEnvVars.APP_HOST || 'not set'}`);
  console.log(`   H2GNN_EMBEDDING_DIM: ${allEnvVars.H2GNN_EMBEDDING_DIM || 'not set'}`);
  console.log(`   H2GNN_NUM_LAYERS: ${allEnvVars.H2GNN_NUM_LAYERS || 'not set'}`);
  console.log(`   LOG_LEVEL: ${allEnvVars.LOG_LEVEL || 'not set'}`);
  
  // Exit with error code if validation failed
  if (errors.length > 0) {
    console.log(`\n❌ Environment validation failed!`);
    process.exit(1);
  } else {
    console.log(`\n✅ Environment validation passed!`);
    process.exit(0);
  }
}

// Run validation
if (import.meta.url === `file://${process.argv[1]}`) {
  validateEnvironment();
}

export { validateEnvironment, loadEnvFile, validateEnvVar };
