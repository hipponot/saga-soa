# Docker Registry Examples

This document shows how to modify the existing Dockerfiles to work with published packages from a private npm registry.

## Modified Dockerfile Examples

### REST API Dockerfile (Registry Version)

```dockerfile
# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Set working directory
WORKDIR /app

# Configure npm registry for scoped packages
ARG NPM_TOKEN
RUN echo "@saga:registry=https://your-registry.com" >> ~/.npmrc
RUN echo "//your-registry.com/:_authToken=${NPM_TOKEN}" >> ~/.npmrc

# Copy workspace files (for turbo configuration)
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY shared-tsup.config.ts ./

# Copy only the REST API app (no packages folder needed)
COPY apps/examples/rest-api/ ./apps/examples/rest-api/

# Install dependencies (will fetch @saga/soa-* from registry)
RUN pnpm install --frozen-lockfile

# Build the project
RUN pnpm turbo run build --filter=rest-api

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/examples/rest-api/dist ./dist
COPY --from=builder /app/apps/examples/rest-api/package.json ./

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
```

### GraphQL API Dockerfile (Registry Version)

```dockerfile
# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Set working directory
WORKDIR /app

# Configure npm registry for scoped packages
ARG NPM_TOKEN
RUN echo "@saga:registry=https://your-registry.com" >> ~/.npmrc
RUN echo "//your-registry.com/:_authToken=${NPM_TOKEN}" >> ~/.npmrc

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY shared-tsup.config.ts ./

# Copy only the GraphQL API app
COPY apps/examples/graphql-api/ ./apps/examples/graphql-api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the project
RUN pnpm turbo run build --filter=graphql-api

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/examples/graphql-api/dist ./dist
COPY --from=builder /app/apps/examples/graphql-api/package.json ./

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "dist/main.js"]
```

## Build Commands

### Single Build
```bash
# Build REST API
docker build \
  --build-arg NPM_TOKEN=$NPM_TOKEN \
  --network=host \
  -t saga-rest-api:latest \
  -f apps/examples/rest-api/Dockerfile .

# Build GraphQL API
docker build \
  --build-arg NPM_TOKEN=$NPM_TOKEN \
  --network=host \
  -t saga-graphql-api:latest \
  -f apps/examples/graphql-api/Dockerfile .
```

### Build Script
Create a build script `scripts/build-docker.sh`:

```bash
#!/bin/bash

# Exit on error
set -e

# Check if NPM_TOKEN is set
if [ -z "$NPM_TOKEN" ]; then
    echo "Error: NPM_TOKEN environment variable is not set"
    exit 1
fi

# Build all API containers
echo "Building REST API..."
docker build \
  --build-arg NPM_TOKEN=$NPM_TOKEN \
  --network=host \
  -t saga-rest-api:latest \
  -f apps/examples/rest-api/Dockerfile .

echo "Building GraphQL API..."
docker build \
  --build-arg NPM_TOKEN=$NPM_TOKEN \
  --network=host \
  -t saga-graphql-api:latest \
  -f apps/examples/graphql-api/Dockerfile .

echo "Building Web App..."
docker build \
  --network=host \
  -t saga-web:latest \
  -f apps/web/Dockerfile .

echo "Building Docs..."
docker build \
  --network=host \
  -t saga-docs:latest \
  -f apps/docs/Dockerfile .

echo "All builds completed successfully!"
```

## Docker Compose Example

```yaml
version: '3.8'

services:
  rest-api:
    build:
      context: .
      dockerfile: apps/examples/rest-api/Dockerfile
      args:
        NPM_TOKEN: ${NPM_TOKEN}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000

  graphql-api:
    build:
      context: .
      dockerfile: apps/examples/graphql-api/Dockerfile
      args:
        NPM_TOKEN: ${NPM_TOKEN}
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production

  docs:
    build:
      context: .
      dockerfile: apps/docs/Dockerfile
    ports:
      - "3002:3001"
    environment:
      - NODE_ENV=production
```

## Multi-Stage Build Optimization

For better caching and security, you can separate the registry authentication:

```dockerfile
# Registry authentication stage
FROM node:18-alpine AS registry-auth

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Configure registry
ARG NPM_TOKEN
RUN echo "@saga:registry=https://your-registry.com" >> ~/.npmrc
RUN echo "//your-registry.com/:_authToken=${NPM_TOKEN}" >> ~/.npmrc

# Dependencies stage
FROM registry-auth AS dependencies

WORKDIR /app

# Copy package files
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/examples/rest-api/package.json ./apps/examples/rest-api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM dependencies AS builder

# Copy source and build files
COPY turbo.json ./
COPY shared-tsup.config.ts ./
COPY apps/examples/rest-api/ ./apps/examples/rest-api/

# Build the project
RUN pnpm turbo run build --filter=rest-api

# Production stage (no registry credentials)
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/examples/rest-api/dist ./dist
COPY --from=builder /app/apps/examples/rest-api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

This approach ensures that:
1. Registry credentials are only in the build stages
2. Final image doesn't contain authentication tokens
3. Better layer caching for dependencies
4. More secure production images