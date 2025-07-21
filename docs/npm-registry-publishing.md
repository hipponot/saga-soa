# Publishing Packages to Private NPM Registry

This guide describes how to publish the workspace packages to a private npm registry and use them in Docker builds.

## Prerequisites

- Access to a private npm registry (e.g., GitHub Packages, npm Enterprise, Artifactory, etc.)
- Authentication credentials for the registry
- npm or pnpm installed locally

## Publishing Packages

### 1. Configure Registry Authentication

First, authenticate with your private registry:

```bash
# For npm
npm login --registry=https://your-registry.com

# For GitHub Packages
npm login --scope=@saga --registry=https://npm.pkg.github.com

# Or create .npmrc file
echo "//your-registry.com/:_authToken=YOUR_AUTH_TOKEN" >> ~/.npmrc
```

### 2. Update Package Versions

Before publishing, ensure all packages have the correct version numbers:

```bash
# Update versions in all packages
pnpm recursive exec -- npm version patch

# Or manually update version in each package.json
```

### 3. Configure Package Registry

Add registry configuration to each package's `package.json`:

```json
{
  "name": "@saga/soa-core-api",
  "version": "1.0.0",
  "publishConfig": {
    "registry": "https://your-registry.com"
  }
}
```

### 4. Publish Packages

Publish all workspace packages:

```bash
# Publish all packages
pnpm -r publish --access restricted

# Or publish individually
cd packages/core-api && npm publish
cd packages/logger && npm publish
cd packages/db && npm publish
cd packages/config && npm publish
```

### 5. Verify Publication

Verify packages are available in the registry:

```bash
npm view @saga/soa-core-api --registry=https://your-registry.com
npm view @saga/soa-logger --registry=https://your-registry.com
npm view @saga/soa-db --registry=https://your-registry.com
npm view @saga/soa-config --registry=https://your-registry.com
```

## Using Published Packages in Docker Builds

### 1. Update Application Dependencies

Update the application `package.json` files to use specific versions instead of workspace references:

**Before:**
```json
{
  "dependencies": {
    "@saga/soa-core-api": "workspace:*",
    "@saga/soa-db": "workspace:*",
    "@saga/soa-logger": "workspace:^"
  }
}
```

**After:**
```json
{
  "dependencies": {
    "@saga/soa-core-api": "^1.0.0",
    "@saga/soa-db": "^1.0.0",
    "@saga/soa-logger": "^1.0.0"
  }
}
```

### 2. Update Dockerfile for Registry Access

Modify your Dockerfiles to authenticate with the private registry:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Set working directory
WORKDIR /app

# Configure npm registry (if using scoped packages)
ARG NPM_TOKEN
RUN echo "@saga:registry=https://your-registry.com" >> ~/.npmrc
RUN echo "//your-registry.com/:_authToken=${NPM_TOKEN}" >> ~/.npmrc

# Copy package files
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY shared-tsup.config.ts ./

# Copy packages (only needed if building from source)
COPY packages/ ./packages/

# Copy application source
COPY apps/examples/rest-api/ ./apps/examples/rest-api/

# Install dependencies (will fetch from registry)
RUN pnpm install --frozen-lockfile

# Build the project
RUN pnpm turbo run build --filter=rest-api...

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/examples/rest-api/dist ./dist
COPY --from=builder /app/apps/examples/rest-api/package.json ./

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# No need to copy packages folder anymore!

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### 3. Build Docker Images with Registry Token

Build the Docker images passing the npm token as a build argument:

```bash
# Build with npm token
docker build \
  --build-arg NPM_TOKEN=$NPM_TOKEN \
  --network=host \
  -t saga-rest-api:prod \
  -f apps/examples/rest-api/Dockerfile .

# Or use environment variable
export NPM_TOKEN=your-token-here
docker build --build-arg NPM_TOKEN --network=host -t saga-rest-api:prod -f apps/examples/rest-api/Dockerfile .
```

### 4. CI/CD Integration

For automated builds, store the NPM_TOKEN as a secret in your CI/CD platform:

**GitHub Actions Example:**
```yaml
- name: Build Docker Image
  run: |
    docker build \
      --build-arg NPM_TOKEN=${{ secrets.NPM_TOKEN }} \
      --network=host \
      -t saga-rest-api:${{ github.sha }} \
      -f apps/examples/rest-api/Dockerfile .
```

**GitLab CI Example:**
```yaml
build:
  script:
    - docker build
        --build-arg NPM_TOKEN=$NPM_TOKEN
        --network=host
        -t saga-rest-api:$CI_COMMIT_SHA
        -f apps/examples/rest-api/Dockerfile .
  variables:
    NPM_TOKEN: $NPM_TOKEN
```

## Benefits of This Approach

1. **Proper Dependency Resolution**: No more symlink issues in Docker containers
2. **Version Control**: Explicit versioning of internal packages
3. **Caching**: Docker can cache npm install layers effectively
4. **Security**: Private packages remain secure in your registry
5. **Production Ready**: Standard approach for enterprise deployments

## Troubleshooting

### Authentication Issues
```bash
# Test registry authentication
npm whoami --registry=https://your-registry.com

# View npm configuration
npm config list
```

### Package Not Found
```bash
# Ensure package is published
npm view @saga/soa-core-api --registry=https://your-registry.com

# Check .npmrc configuration
cat ~/.npmrc
```

### Docker Build Failures
```bash
# Build with no cache to debug
docker build --no-cache --progress=plain \
  --build-arg NPM_TOKEN=$NPM_TOKEN \
  -t saga-rest-api:debug \
  -f apps/examples/rest-api/Dockerfile .
```

## Next Steps

1. Set up your private npm registry
2. Create a CI/CD pipeline for automated package publishing
3. Update all Dockerfiles to use the registry approach
4. Remove the packages folder from Docker builds (optional optimization)