# H²GNN Environment Setup Guide

## Overview

This guide explains how to set up environment variables for the H²GNN system across different deployment stages: development, staging, and production.

## Environment Files

The system uses the following environment files:

- **`.env`** - Base configuration (loaded by default)
- **`.env.development`** - Development environment configuration
- **`.env.staging`** - Staging environment configuration  
- **`.env.production`** - Production environment configuration

## Environment Variables

### Core Application Variables

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `NODE_ENV` | Environment mode | `development` | `staging` | `production` |
| `APP_NAME` | Application name | `h2gnn-hyperbolic-geometric-neural-network` | `h2gnn-hyperbolic-geometric-neural-network` | `h2gnn-hyperbolic-geometric-neural-network` |
| `APP_VERSION` | Application version | `1.0.0-dev` | `1.0.0-staging` | `1.0.0` |
| `APP_PORT` | Application port | `3000` | `3000` | `3000` |
| `APP_HOST` | Application host | `localhost` | `0.0.0.0` | `0.0.0.0` |

### H²GNN Core Configuration

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `H2GNN_EMBEDDING_DIM` | Embedding dimension | `32` | `64` | `128` |
| `H2GNN_NUM_LAYERS` | Number of layers | `2` | `3` | `4` |
| `H2GNN_CURVATURE` | Hyperbolic curvature | `-1.0` | `-1.0` | `-1.0` |
| `H2GNN_MAX_MEMORIES` | Maximum memories | `1000` | `5000` | `50000` |
| `H2GNN_CONSOLIDATION_THRESHOLD` | Consolidation threshold | `10` | `25` | `100` |
| `H2GNN_RETRIEVAL_STRATEGY` | Retrieval strategy | `simple` | `hybrid` | `hybrid` |
| `H2GNN_COMPRESSION_ENABLED` | Enable compression | `false` | `true` | `true` |
| `H2GNN_LEARNING_RATE` | Learning rate | `0.1` | `0.05` | `0.01` |
| `H2GNN_BATCH_SIZE` | Batch size | `8` | `16` | `64` |
| `H2GNN_MAX_EPOCHS` | Maximum epochs | `10` | `50` | `200` |

### Persistence Configuration

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `PERSISTENCE_PATH` | Persistence directory | `./persistence/dev` | `./persistence/staging` | `/var/lib/h2gnn/persistence` |
| `PERSISTENCE_ENABLED` | Enable persistence | `true` | `true` | `true` |
| `PERSISTENCE_BACKUP_INTERVAL` | Backup interval (ms) | `1800000` | `1800000` | `3600000` |
| `PERSISTENCE_CLEANUP_INTERVAL` | Cleanup interval (ms) | `3600000` | `43200000` | `86400000` |

### HD Addressing Configuration

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `HD_ADDRESSING_SEED` | HD addressing seed | `h2gnn-development-seed` | `h2gnn-staging-seed` | `h2gnn-production-seed` |
| `HD_ADDRESSING_NETWORK` | Network type | `testnet` | `testnet` | `mainnet` |
| `HD_ADDRESSING_ENABLED` | Enable HD addressing | `true` | `true` | `true` |
| `HD_ADDRESSING_DETERMINISTIC_ROUTING` | Enable deterministic routing | `true` | `true` | `true` |

### MCP Configuration

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `MCP_SERVER_PORT` | MCP server port | `3001` | `3001` | `3001` |
| `MCP_SERVER_HOST` | MCP server host | `localhost` | `0.0.0.0` | `0.0.0.0` |
| `MCP_SERVER_ENABLED` | Enable MCP server | `true` | `true` | `true` |
| `MCP_GEO_INTELLIGENCE_ENABLED` | Enable geo-intelligence | `true` | `true` | `true` |
| `MCP_SEMANTIC_SEARCH_ENABLED` | Enable semantic search | `true` | `true` | `true` |

### Real-time Collaboration Configuration

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `COLLABORATION_MAX_PARTICIPANTS` | Max participants | `10` | `25` | `100` |
| `COLLABORATION_PRESENCE_TIMEOUT` | Presence timeout (ms) | `60000` | `180000` | `300000` |
| `COLLABORATION_SESSION_TIMEOUT` | Session timeout (ms) | `1800000` | `3600000` | `7200000` |
| `COLLABORATION_REAL_TIME_SYNC` | Enable real-time sync | `true` | `true` | `true` |

### Visualization Configuration

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `VISUALIZATION_CONTAINER` | Container selector | `#h2gnn-visualization` | `#h2gnn-visualization` | `#h2gnn-visualization` |
| `VISUALIZATION_WIDTH` | Canvas width | `800` | `1200` | `1920` |
| `VISUALIZATION_HEIGHT` | Canvas height | `600` | `800` | `1080` |
| `VISUALIZATION_REAL_TIME_UPDATES` | Enable real-time updates | `true` | `true` | `true` |
| `VISUALIZATION_COLLABORATION` | Enable collaboration | `true` | `true` | `true` |
| `VISUALIZATION_CONFIDENCE_VISUALIZATION` | Enable confidence visualization | `false` | `true` | `true` |

### LSP-AST Configuration

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `LSP_AST_ENABLED` | Enable LSP-AST | `true` | `true` | `true` |
| `LSP_AST_CODE_ANALYSIS` | Enable code analysis | `true` | `true` | `true` |
| `LSP_AST_REFACTORING` | Enable refactoring | `true` | `true` | `true` |
| `LSP_AST_INTELLIGENT_COMPLETION` | Enable intelligent completion | `true` | `true` | `true` |
| `LSP_AST_MAX_SUGGESTIONS` | Max suggestions | `20` | `30` | `100` |
| `LSP_AST_ANALYSIS_TIMEOUT` | Analysis timeout (ms) | `2000` | `3000` | `10000` |

### Transport Configuration

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `TRANSPORT_MQTT_ENABLED` | Enable MQTT | `false` | `true` | `true` |
| `TRANSPORT_MQTT_HOST` | MQTT host | `localhost` | `staging-mqtt.h2gnn.com` | `prod-mqtt.h2gnn.com` |
| `TRANSPORT_MQTT_PORT` | MQTT port | `1883` | `1883` | `1883` |
| `TRANSPORT_WEBSOCKET_ENABLED` | Enable WebSocket | `true` | `true` | `true` |
| `TRANSPORT_WEBSOCKET_HOST` | WebSocket host | `localhost` | `staging-ws.h2gnn.com` | `prod-ws.h2gnn.com` |
| `TRANSPORT_WEBSOCKET_PORT` | WebSocket port | `8080` | `8080` | `8080` |
| `TRANSPORT_WEBRTC_ENABLED` | Enable WebRTC | `false` | `true` | `true` |
| `TRANSPORT_REDIS_ENABLED` | Enable Redis | `false` | `true` | `true` |
| `TRANSPORT_REDIS_HOST` | Redis host | `localhost` | `staging-redis.h2gnn.com` | `prod-redis.h2gnn.com` |
| `TRANSPORT_REDIS_PORT` | Redis port | `6379` | `6379` | `6379` |

### Security Configuration

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `SECURITY_ENABLED` | Enable security | `false` | `true` | `true` |
| `SECURITY_CORS_ORIGINS` | CORS origins | `*` | `https://staging.h2gnn.com,https://staging-api.h2gnn.com` | `https://h2gnn.com,https://api.h2gnn.com,https://app.h2gnn.com` |
| `SECURITY_RATE_LIMIT_ENABLED` | Enable rate limiting | `false` | `true` | `true` |
| `SECURITY_RATE_LIMIT_MAX` | Rate limit max | `100` | `200` | `1000` |
| `SECURITY_RATE_LIMIT_WINDOW` | Rate limit window (ms) | `60000` | `60000` | `60000` |
| `SECURITY_JWT_SECRET` | JWT secret | - | - | `production_jwt_secret_key` |
| `SECURITY_ENCRYPTION_KEY` | Encryption key | - | - | `production_encryption_key` |

### Logging Configuration

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `LOG_LEVEL` | Log level | `debug` | `info` | `warn` |
| `LOG_FORMAT` | Log format | `pretty` | `json` | `json` |
| `LOG_FILE_ENABLED` | Enable file logging | `true` | `true` | `true` |
| `LOG_FILE_PATH` | Log file path | `./logs/h2gnn-dev.log` | `./logs/h2gnn-staging.log` | `/var/log/h2gnn/h2gnn.log` |
| `LOG_CONSOLE_ENABLED` | Enable console logging | `true` | `true` | `false` |

### Monitoring Configuration

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `MONITORING_ENABLED` | Enable monitoring | `false` | `true` | `true` |
| `MONITORING_METRICS_ENABLED` | Enable metrics | `false` | `true` | `true` |
| `MONITORING_HEALTH_CHECK_ENABLED` | Enable health checks | `true` | `true` | `true` |
| `MONITORING_HEALTH_CHECK_INTERVAL` | Health check interval (ms) | `10000` | `30000` | `60000` |
| `MONITORING_ALERTING_ENABLED` | Enable alerting | - | - | `true` |
| `MONITORING_ALERTING_WEBHOOK_URL` | Alerting webhook URL | - | - | `https://alerts.h2gnn.com/webhook` |

## Usage

### Development

```bash
# Use development environment
npm run dev
npm run mcp:server:dev
npm run unified:demo:dev

# Check environment
npm run env:check
npm run env:validate
```

### Staging

```bash
# Use staging environment
npm run dev:staging
npm run build:staging
npm run mcp:server:staging
npm run unified:demo:staging

# Deploy to staging
npm run deploy:staging
```

### Production

```bash
# Use production environment
npm run dev:production
npm run build:production
npm run mcp:server:prod
npm run unified:demo:prod

# Deploy to production
npm run deploy:production
```

## Environment Validation

The system includes an environment validation script that checks:

- ✅ Required variables are present
- ✅ Variable types are correct
- ✅ Variable values are within valid ranges
- ✅ No unknown variables are present

Run validation:

```bash
# Validate current environment
npm run env:validate

# Check current environment
npm run env:check
```

## Environment File Loading Order

The system loads environment variables in the following order:

1. **`.env`** - Base configuration (always loaded)
2. **`.env.${NODE_ENV}`** - Environment-specific configuration
3. **`process.env`** - System environment variables (highest priority)

## Best Practices

### Development
- Use minimal resource requirements
- Enable debug logging
- Disable security for easier development
- Use local services when possible

### Staging
- Mirror production configuration as closely as possible
- Enable security and monitoring
- Use staging-specific external services
- Enable performance testing

### Production
- Use maximum resource allocation
- Enable all security features
- Use production external services
- Enable comprehensive monitoring and alerting
- Use secure secrets and keys

## Security Considerations

### Development
- Security is disabled by default
- CORS allows all origins
- No rate limiting
- Debug logging enabled

### Staging
- Security is enabled
- CORS restricted to staging domains
- Rate limiting enabled
- Monitoring enabled

### Production
- Full security enabled
- CORS restricted to production domains
- Strict rate limiting
- Comprehensive monitoring and alerting
- Secure secrets and encryption keys

## Troubleshooting

### Common Issues

1. **Missing environment variables**
   ```bash
   npm run env:validate
   ```

2. **Invalid variable values**
   ```bash
   npm run env:validate
   ```

3. **Environment not loading**
   ```bash
   npm run env:check
   ```

### Environment Debugging

```bash
# Check current environment
npm run env:check

# Validate environment
npm run env:validate

# Check specific variable
node -e "console.log(process.env.NODE_ENV)"
```

## Conclusion

The H²GNN system provides comprehensive environment configuration for development, staging, and production deployments. Each environment is optimized for its specific use case while maintaining consistency across the system.

For more information, see:
- [Unified System Integration](./UNIFIED_SYSTEM_INTEGRATION.md)
- [Production Deployment](./PRODUCTION_DEPLOYMENT.md)
- [MCP Integration Guide](./MCP_INTEGRATION_GUIDE.md)
