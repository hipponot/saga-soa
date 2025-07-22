# Getting Started & Build Cheatsheet

## Quickstart

1. Install dependencies:
   ```sh
   pnpm install
   ```
2. Verify everything works:
   ```sh
   pnpm check
   ```

- Always run `pnpm install` before building or running any commands for the first time.
- Run `pnpm check` before every commit or PR to ensure you haven't regressed functionality.

---

This guide covers initial setup and common build/test commands for the saga-soa monorepo.

---

## 📦 Using Published Packages

Our packages are published to GitHub Packages and are publicly available. **No authentication required for installation**.

### Installation
```bash
# Configure npm to use GitHub Packages for @hipponot scope
echo "@hipponot:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Install packages (no authentication needed for public packages)
npm install @hipponot/soa-core-api
npm install @hipponot/soa-db
npm install @hipponot/soa-logger
npm install @hipponot/soa-config

# Or install all at once
npm install @hipponot/soa-core-api @hipponot/soa-db @hipponot/soa-logger @hipponot/soa-config
```

### Usage Example
```typescript
import { ExpressServer } from '@hipponot/soa-core-api';
import { MongoProvider } from '@hipponot/soa-db';
import { PinoLogger } from '@hipponot/soa-logger';
import { DotenvConfigManager } from '@hipponot/soa-config';
```

---

## 1. Development Setup

### 1. Install pnpm (if not already installed)
```sh
npm install -g pnpm
```

### 2. Install dependencies
```sh
pnpm install
```

---

## 2. Build & Workspace Cheatsheet

### Build All Projects Recursively
```sh
turbo run build
```

### Clean and Then Build All Projects Recursively
```sh
pnpm clean
# Then:
turbo run build
```

### List All Projects in the Monorepo
```sh
pnpm list -r --depth 0
# Or, to see workspace projects:
pnpm m ls
```

### Run All Tests in All Projects
```sh
turbo run test
```

### Build or Run Tests for a Particular Subproject
- **Build:**
  ```sh
  turbo run build --filter=packages/logger
  turbo run build --filter=saga-soa-examples/examples/rest-api
  ```
- **Test:**
  ```sh
  turbo run test --filter=packages/config
  turbo run test --filter=saga-soa-examples/examples/rest-api
  ```

### Other Useful Commands
- **Install dependencies for a specific package:**
  ```sh
  pnpm install --filter ./packages/logger
  ```
- **Add a dependency to a specific package:**
  ```sh
  pnpm add <package> --filter ./packages/logger
  ```
- **Run a script in a specific package:**
  ```sh
  pnpm --filter ./packages/logger run <script>
  ```
- **Start a dev server for an app:**
  ```sh
  pnpm --filter ./saga-soa-examples/web dev
  pnpm --filter ./saga-soa-examples/docs dev
  ```
- **Show which tasks will run (dry run):**
  ```sh
  turbo run build --dry
  ```

---

## 3. Publishing Packages

### 📋 Manual Publishing (Development)

For quick development and testing, see our **[Manual Package Management Guide](./manual-package-management.md)** for:
- Publishing individual packages (authentication required)
- Version bumping
- Deleting package versions
- Testing workflows

### Automatic Publishing (Production)

Packages are automatically published to GitHub Packages when:
- **Push to main**: Automatically publishes if package files change  
- **GitHub Release**: Publishes all packages with the release
- **Manual trigger**: Use GitHub Actions workflow

### Manual Publishing

If you're a maintainer and need to publish manually:

```sh
# Build all packages
pnpm build

# Publish all packages to GitHub Packages (authentication required)
pnpm publish:packages
```

### Version Management

```sh
# Bump patch version (1.0.0 → 1.0.1)
pnpm recursive exec -- npm version patch

# Bump minor version (1.0.0 → 1.1.0)  
pnpm recursive exec -- npm version minor

# Bump major version (1.0.0 → 2.0.0)
pnpm recursive exec -- npm version major
```

---

## When to Use Turbo vs. pnpm

- **Use `turbo`** for orchestrated, cached, and dependency-aware tasks across the monorepo (like `build`, `test`, `lint`). Turbo ensures tasks run in the correct order, leverages caching to skip unchanged work, and runs independent tasks in parallel for speed. It's ideal for CI/CD and large monorepos with complex dependencies.
- **Use `pnpm`** for package management (installing, adding, removing dependencies) and for running scripts or dev servers in a single package. pnpm is also useful for ad-hoc or one-off commands in a specific workspace project.

**In short:**
- Use `turbo run <task>` for monorepo-wide pipelines.
- Use `pnpm` for dependency management and single-package scripts.

---

## 4. Example Projects

Explore our example applications:

### REST API Example
```sh
cd saga-soa-examples/examples/rest-api
pnpm install
pnpm dev
```

### GraphQL API Example  
```sh
cd saga-soa-examples/examples/graphql-api
pnpm install
pnpm dev
```

### Using Published Packages in New Projects

Create a new project using our published packages:

```sh
mkdir my-saga-project
cd my-saga-project
npm init -y

# Configure GitHub Packages for @hipponot scope
echo "@hipponot:registry=https://npm.pkg.github.com" > .npmrc

# Install saga-soa packages (no authentication needed for public packages)
npm install @hipponot/soa-core-api @hipponot/soa-db @hipponot/soa-logger @hipponot/soa-config

# Create your application
# See examples in saga-soa-examples/examples/
```

---

## 📚 Related Documentation

- **[📋 Manual Package Management](./manual-package-management.md)** - Quick commands for development publishing
- **[🚀 Automated Publishing](./npm-registry-publishing.md)** - Production GitHub workflow
- **[🔄 Migration Guide](./github-packages-migration.md)** - CodeArtifact to GitHub Packages migration

---

> **Tip:** Use `--filter <package>` with pnpm commands to target specific packages in the monorepo.