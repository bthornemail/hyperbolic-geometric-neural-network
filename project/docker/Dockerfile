# H²GNN Production Dockerfile
# Multi-stage build for optimized production deployment

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY docs/ ./docs/

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S h2gnn -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# Copy configuration files
COPY docker/entrypoint.sh ./entrypoint.sh
COPY docker/healthcheck.sh ./healthcheck.sh

# Set permissions
RUN chmod +x ./entrypoint.sh ./healthcheck.sh
RUN chown -R h2gnn:nodejs /app

# Switch to non-root user
USER h2gnn

# Expose ports
EXPOSE 3000 3001 3002

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV H2GNN_STORAGE_PATH=/app/storage
ENV H2GNN_LOG_LEVEL=info

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ./healthcheck.sh

# Start the application
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/index.js"]
