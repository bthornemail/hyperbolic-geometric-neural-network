# H²GNN Production Deployment Guide

This guide covers the complete production deployment process for the H²GNN (Hyperbolic Geometric Neural Network) application.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Kubernetes (for production)
- Terraform (for infrastructure)

### Build Commands

```bash
# Development
npm run dev

# Production Build
npm run build:production

# Staging Build  
npm run build:staging

# Build with Analysis
npm run build:analyze
```

## 📦 Production Build Process

### 1. Pre-Build Checks
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test:ci

# Security audit
npm run security:audit
```

### 2. Production Build
```bash
# Clean build
npm run clean
npm run build:production

# Or use the automated script
./scripts/build-production.sh
```

### 3. Build Analysis
```bash
# Bundle size analysis
npm run size:analyze

# Build with visualizer
npm run build:analyze
```

## 🐳 Docker Deployment

### Single Container
```bash
# Build Docker image
npm run build:docker

# Run container
docker run -p 3000:3000 h2gnn:latest
```

### Multi-Platform Build
```bash
# Build for multiple architectures
npm run build:docker:multi
```

### Docker Compose
```bash
# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## ☸️ Kubernetes Deployment

### Deploy to Kubernetes
```bash
# Deploy all resources
npm run k8s:deploy

# Check status
npm run k8s:status

# Remove deployment
npm run k8s:delete
```

### Manual Kubernetes Commands
```bash
# Apply configurations
kubectl apply -f k8s/

# Check pods
kubectl get pods -l app=h2gnn

# View logs
kubectl logs -l app=h2gnn -f
```

## 🏗️ Infrastructure as Code

### Terraform Deployment
```bash
# Initialize Terraform
npm run terraform:init

# Plan infrastructure
npm run terraform:plan

# Apply infrastructure
npm run terraform:apply

# Destroy infrastructure
npm run terraform:destroy
```

## 🔧 Environment Configuration

### Production Environment Variables
```bash
# Required environment variables
NODE_ENV=production
PORT=3000
H2GNN_STORAGE_PATH=/app/storage
H2GNN_LOG_LEVEL=info

# API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Database
POSTGRES_PASSWORD=your_postgres_password
REDIS_URL=redis://redis:6379

# Monitoring
SENTRY_DSN=your_sentry_dsn
GRAFANA_PASSWORD=your_grafana_password
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- `GET /health` - Application health
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

### Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization  
- **Sentry**: Error tracking
- **Custom**: Application-specific metrics

## 🚀 Deployment Strategies

### 1. Blue-Green Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Test staging environment
npm run health:check

# Deploy to production
npm run deploy:production
```

### 2. Rolling Deployment
```bash
# Update Kubernetes deployment
kubectl set image deployment/h2gnn-app h2gnn=h2gnn:v2.0.0

# Monitor rollout
kubectl rollout status deployment/h2gnn-app
```

### 3. Canary Deployment
```bash
# Deploy canary version
kubectl apply -f k8s/canary-deployment.yaml

# Monitor canary metrics
kubectl get pods -l version=canary
```

## 🔒 Security Considerations

### Security Checklist
- [ ] Environment variables secured
- [ ] API keys rotated regularly
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Security headers set
- [ ] Dependencies audited
- [ ] Container images scanned

### Security Commands
```bash
# Audit dependencies
npm run security:audit

# Fix vulnerabilities
npm run security:fix

# Update dependencies
npm run deps:update
```

## 📈 Performance Optimization

### Build Optimizations
- **Code Splitting**: Automatic chunk splitting
- **Tree Shaking**: Dead code elimination
- **Minification**: Terser for production
- **Compression**: Gzip/Brotli support
- **Caching**: Service worker caching

### Runtime Optimizations
- **CDN**: Static asset delivery
- **Caching**: Redis for session storage
- **Database**: Connection pooling
- **Monitoring**: Performance metrics

## 🧪 Testing in Production

### Production Testing
```bash
# Health check
npm run health:check

# Load testing
npm run test:load

# Smoke tests
npm run test:smoke
```

### Monitoring Tests
```bash
# Check application status
curl -f http://localhost:3000/health

# Check database connectivity
curl -f http://localhost:3000/health/db

# Check external services
curl -f http://localhost:3000/health/external
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Security audit clean
- [ ] Dependencies updated
- [ ] Environment variables configured
- [ ] Database migrations ready

### Deployment
- [ ] Build successful
- [ ] Docker image created
- [ ] Kubernetes resources applied
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Logs accessible

### Post-Deployment
- [ ] Application responding
- [ ] Metrics collecting
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team notified

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clean and rebuild
npm run clean:all
npm run install:clean
npm run build:production
```

#### Docker Issues
```bash
# Rebuild Docker image
docker build --no-cache -f docker/Dockerfile -t h2gnn:latest .

# Check container logs
docker logs h2gnn-app
```

#### Kubernetes Issues
```bash
# Check pod status
kubectl describe pod <pod-name>

# View pod logs
kubectl logs <pod-name> -f

# Restart deployment
kubectl rollout restart deployment/h2gnn-app
```

### Debug Commands
```bash
# Check application logs
npm run docker:logs

# Check Kubernetes events
kubectl get events --sort-by=.metadata.creationTimestamp

# Check resource usage
kubectl top pods -l app=h2gnn
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Terraform Documentation](https://terraform.io/docs/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [React Production Guide](https://reactjs.org/docs/optimizing-performance.html)

## 🤝 Support

For deployment issues or questions:
- Check the logs first
- Review this documentation
- Contact the development team
- Create an issue in the repository
