# Publishing Packages to GitHub Packages

This guide describes how the workspace packages are published to GitHub Packages and how to use them in your projects.

## 📦 Available Packages

All packages are published to GitHub Packages and are publicly available:

- `@hipponot/soa-config` - Configuration management with Zod validation
- `@hipponot/soa-core-api` - Express-based REST API framework  
- `@hipponot/soa-db` - Database connection helpers (MongoDB, Redis)
- `@hipponot/soa-logger` - Structured logging with Pino

## 📋 Installation (No Authentication Required)

**Great News**: Since these packages are public, no authentication is required for installation!

### Step 1: Configure GitHub Packages Registry

```bash
# Configure npm to use GitHub Packages for @hipponot scope
echo "@hipponot:registry=https://npm.pkg.github.com" >> ~/.npmrc
```

### Step 2: Install Packages

```bash
# Now you can install packages without authentication
npm install @hipponot/soa-core-api
npm install @hipponot/soa-db  
npm install @hipponot/soa-logger
npm install @hipponot/soa-config

# Or with pnpm
pnpm add @hipponot/soa-core-api @hipponot/soa-db @hipponot/soa-logger @hipponot/soa-config

# Or with yarn
yarn add @hipponot/soa-core-api @hipponot/soa-db @hipponot/soa-logger @hipponot/soa-config
```

## Usage in Your Projects

### Basic Usage

```typescript
// Using the core API framework
import { ExpressServer } from '@hipponot/soa-core-api';
import { MongoProvider } from '@hipponot/soa-db';
import { PinoLogger } from '@hipponot/soa-logger';
import { DotenvConfigManager } from '@hipponot/soa-config';

// Set up your application
const config = new DotenvConfigManager();
const logger = new PinoLogger();
const db = new MongoProvider(config, logger);
const server = new ExpressServer(config, logger);
```

### Package.json Example

```json
{
  "name": "my-api-project",
  "dependencies": {
    "@hipponot/soa-core-api": "^1.0.0",
    "@hipponot/soa-db": "^1.0.0", 
    "@hipponot/soa-logger": "^1.0.0",
    "@hipponot/soa-config": "^1.0.0"
  }
}
```

## Automated Publishing

Packages are automatically published to GitHub Packages when:

1. **Push to main branch** - Automatically publishes if package files change
2. **GitHub Release** - Publishes all packages with release
3. **Manual trigger** - Maintainers can trigger publishing with version bumps

### Publishing Workflow

The GitHub Actions workflow:
1. ✅ Runs tests and type checking
2. ✅ Builds all packages
3. ✅ Publishes to GitHub Packages
4. ✅ Creates release summary

## For Package Maintainers

### Publishing Authentication Required

**Note**: While installation is public, publishing requires authentication.

#### Setup for Publishing

1. **Create GitHub Personal Access Token (classic)**:
   - Go to [GitHub Personal Access Tokens (classic)](https://github.com/settings/tokens)
   - Select scopes: `packages:write` and `repo`

2. **Configure Publishing Authentication**:
   ```bash
   npm login --scope=@hipponot --auth-type=legacy --registry=https://npm.pkg.github.com
   # Enter your GitHub username and token as password
   ```

### Publishing New Versions

1. **Automatic (Recommended)**: Create a GitHub Release
   ```bash
   # GitHub will automatically publish packages
   gh release create v1.1.0 --title "Release v1.1.0" --notes "Bug fixes and improvements"
   ```

2. **Manual Trigger**: Use GitHub Actions workflow
   - Go to Actions → "Publish Packages to GitHub Packages"  
   - Click "Run workflow"
   - Choose version bump type (patch/minor/major)

3. **Local Publishing** (if needed):
   ```bash
   # Build packages
   pnpm build
   
   # Publish all packages (authentication required)
   pnpm publish:packages
   ```

### Version Management

Packages use semantic versioning:
- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features, backwards compatible
- **Major** (2.0.0): Breaking changes

## Using Published Packages in Docker

### Dockerfile Example

```dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Configure GitHub Packages (no authentication needed for public packages)
RUN echo "@hipponot:registry=https://npm.pkg.github.com" > .npmrc

# Install dependencies
RUN npm install -g pnpm@9.0.0
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY src/ ./src/
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Docker Compose Example

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
```

## Benefits of GitHub Packages

✅ **Public Access**: No authentication required for installation  
✅ **Integrated**: Works seamlessly with GitHub workflow  
✅ **Secure**: Built-in security scanning  
✅ **Standard**: Uses standard npm registry protocol  
✅ **Reliable**: GitHub's infrastructure and uptime  
✅ **Free**: No cost for public packages (with usage limits)  

## Migration from CodeArtifact

If you were previously using our private CodeArtifact registry:

### Before (CodeArtifact - Private)
```bash
# Required AWS authentication
aws codeartifact login --tool npm --domain saga --repository saga_js
npm install @hipponot/soa-core-api
```

### After (GitHub Packages - Public)
```bash
# No authentication needed for installation!
echo "@hipponot:registry=https://npm.pkg.github.com" >> ~/.npmrc
npm install @hipponot/soa-core-api
```

## Troubleshooting

### Package Not Found
If you get "package not found" errors:

1. **Check registry configuration**:
   ```bash
   cat ~/.npmrc
   # Should contain: @hipponot:registry=https://npm.pkg.github.com
   ```

2. **Verify package name spelling**:
   ```bash
   # Correct
   npm install @hipponot/soa-core-api
   
   # Incorrect  
   npm install @saga-soa/core-api
   ```

3. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

4. **Check network connectivity**:
   ```bash
   npm ping --registry=https://npm.pkg.github.com
   ```

### Publishing Issues (For Maintainers)

```bash
# Check current authentication
npm whoami --registry=https://npm.pkg.github.com

# Re-authenticate for publishing
npm logout --registry=https://npm.pkg.github.com
npm login --scope=@hipponot --registry=https://npm.pkg.github.com
```

### Version Issues

To see available versions:
```bash
npm view @hipponot/soa-core-api versions --json --registry=https://npm.pkg.github.com
```

To install specific version:
```bash
npm install @hipponot/soa-core-api@1.0.0
```

## Important Notes

- **Installation**: No authentication required for public packages
- **Publishing**: Authentication required (maintainers only)
- **Repository Visibility**: Repository must be public for packages to be publicly accessible
- **Rate Limits**: GitHub has rate limits for package operations
- **Version Immutability**: Once published, package contents are immutable

## Links

- 📦 [GitHub Packages](https://github.com/hipponot/saga-soa/packages)
- 🛠️ [Source Code](https://github.com/hipponot/saga-soa)
- 📖 [Documentation](https://github.com/hipponot/saga-soa/tree/main/docs)
- 🚀 [Examples](https://github.com/hipponot/saga-soa/tree/main/saga-soa-examples/examples)
- 🔑 [GitHub Personal Access Tokens (for publishing)](https://github.com/settings/tokens)