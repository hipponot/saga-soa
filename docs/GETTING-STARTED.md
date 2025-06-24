# Getting Started & Build Cheatsheet

This guide covers initial setup and common build/test commands for the saga-soa monorepo.

---

## 1. Setup Instructions

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
  turbo run build --filter=apps/example_rest
  ```
- **Test:**
  ```sh
  turbo run test --filter=packages/config
  turbo run test --filter=apps/example_rest
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
  pnpm --filter ./apps/web dev
  pnpm --filter ./apps/docs dev
  ```
- **Show which tasks will run (dry run):**
  ```sh
  turbo run build --dry
  ```

---

## When to Use Turbo vs. pnpm

- **Use `turbo`** for orchestrated, cached, and dependency-aware tasks across the monorepo (like `build`, `test`, `lint`). Turbo ensures tasks run in the correct order, leverages caching to skip unchanged work, and runs independent tasks in parallel for speed. It's ideal for CI/CD and large monorepos with complex dependencies.
- **Use `pnpm`** for package management (installing, adding, removing dependencies) and for running scripts or dev servers in a single package. pnpm is also useful for ad-hoc or one-off commands in a specific workspace project.

**In short:**
- Use `turbo run <task>` for monorepo-wide pipelines.
- Use `pnpm` for dependency management and single-package scripts.

---

> **Tip:** Use `--filter <package>`