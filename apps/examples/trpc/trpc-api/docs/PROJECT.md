# TRPC API Project Documentation

## Overview

This project implements a modular tRPC-based API using a sector-based architecture. The API dynamically loads tRPC routers from sector directories and provides strongly-typed client interfaces through a companion `trpc-types` package.

## Architecture

### Sector-Based Organization

The API is organized into **sectors**, each representing a distinct business domain:

```
src/sectors/
├── project/
│   ├── trpc/
│   │   ├── project.router.ts    # tRPC controller implementation
│   │   ├── project.schemas.ts   # Zod schemas + TypeScript types  
│   │   ├── project.types.ts     # Re-exports for sector interface
│   │   ├── project.data.ts      # Business logic/data access
│   │   └── index.ts             # Sector exports
│   └── rest/                    # REST endpoints (if needed)
└── run/
    └── trpc/                    # Same structure as project
```

### Files in `sectors/*/trpc/`

Each sector's tRPC directory contains:

- **`*.router.ts`** - Main tRPC controller extending `AbstractTRPCController`
  - Implements the actual API endpoints (queries/mutations)
  - Uses dependency injection for logger and business logic
  - Defines the sector's `createRouter()` method

- **`*.schemas.ts`** - **Core type definitions** 
  - Zod schemas for runtime validation (`CreateProjectSchema`, `GetProjectSchema`, etc.)
  - TypeScript types derived from schemas (`CreateProjectInput`, `Project`, etc.)
  - This is the **single source of truth** for all type information

- **`*.types.ts`** - Re-export facade
  - Simply re-exports everything from `*.schemas.ts` 
  - Provides a stable import interface for the sector

- **`*.data.ts`** - Business logic implementation
  - Contains the actual CRUD operations
  - Isolated from tRPC concerns for testability

## Dynamic Router Loading

### Runtime (trpc-api)

The main application uses **fully dynamic router loading**:

```typescript
// main.ts
const trpcControllers = await controllerLoader.loadControllers(
  path.resolve(__dirname, './sectors/*/trpc/*.router.js'),
  AbstractTRPCController
);
```

**Key characteristics:**
- Uses glob patterns to discover sectors at runtime
- No hardcoded sector names or imports
- New sectors are automatically discovered and loaded
- Controllers are instantiated through dependency injection
- **Truly dynamic** - scales automatically with new sectors

### Static Type Generation (trpc-types)

The `trpc-types` subproject generates static types for client consumption, but uses a **hybrid approach**:

#### Dynamic Discovery Phase
```typescript
// scripts/generate-router.ts (lines 21-37)
const sectors = await fs.readdir(TRPC_API_SECTORS_DIR);
for (const sector of sectors) {
  const trpcDir = path.join(sectorPath, 'trpc');
  try {
    await fs.access(trpcDir);
    routerSectors.push(sector);  // Dynamic discovery
  } catch {
    // Skip non-tRPC sectors
  }
}
```

#### Static Code Generation Phase  
```typescript
// scripts/generate-router.ts (lines 42-68)
const routerContent = `
import * as projectSchemas from './schemas/project.schemas.js';  // ❌ Hardcoded
import * as runSchemas from './schemas/run.schemas.js';          // ❌ Hardcoded

export const staticAppRouter = t.router({
  project: t.router({ /* hardcoded structure */ }),              // ❌ Hardcoded
  run: t.router({ /* hardcoded structure */ }),                  // ❌ Hardcoded
});
`;
```

## Type Sharing with web-client

### Flow Overview

1. **Source**: Sector schemas define types in `src/sectors/*/trpc/*.schemas.ts`
2. **Copy**: `trpc-types` copies schemas to `generated/schemas/`
3. **Generate**: Creates static `AppRouter` type matching runtime structure
4. **Export**: Publishes strongly-typed package for client consumption
5. **Consume**: `web-client` imports `AppRouter` type for `createTRPCClient<AppRouter>()`

### Benefits

- ✅ **Single Source of Truth**: All types originate from sector schemas
- ✅ **Runtime Safety**: Zod schemas validate requests at runtime  
- ✅ **Compile-time Safety**: TypeScript ensures client/server compatibility
- ✅ **Auto-completion**: Full IntelliSense in client code
- ✅ **Refactoring Safety**: Type changes are caught at build time

### Current Implementation

```typescript
// web-client usage
import { createTRPCClient } from '@trpc/client';
import type { AppRouter } from '@saga-soa/trpc-types';

const client = createTRPCClient<AppRouter>({...});

// Fully typed API calls
const project = await client.project.getProjectById.query({ id: '123' });
const newRun = await client.run.createRun.mutate({ 
  projectId: '123', 
  name: 'test run' 
});
```

## Current Limitations & Inconsistencies

### ⚠️ Static vs Dynamic Mismatch

**Problem**: The `trpc-types` generation is **not fully dynamic** like the runtime router loading.

- **Runtime (trpc-api)**: ✅ Truly dynamic - automatically handles new sectors
- **Type generation (trpc-types)**: ❌ Semi-dynamic - discovers sectors but generates hardcoded imports/structure

### Specific Issues

1. **Hardcoded Imports**: 
   ```typescript
   // Generated code has hardcoded imports
   import * as projectSchemas from './schemas/project.schemas.js';
   import * as runSchemas from './schemas/run.schemas.js';
   ```

2. **Hardcoded Router Structure**:
   ```typescript
   // Generated router has hardcoded sector definitions
   export const staticAppRouter = t.router({
     project: t.router({...}),  // Must manually add new sectors here
     run: t.router({...}),      // Must manually add new sectors here  
   });
   ```

3. **Manual Maintenance**: Adding a new sector requires updating the generation script

### 🎯 Recommended Improvements

To achieve **true dynamic parity** between runtime and type generation:

1. **Dynamic Import Generation**: Generate imports based on discovered sectors
   ```typescript
   // Should generate dynamically:
   ${routerSectors.map(sector => 
     `import * as ${sector}Schemas from './schemas/${sector}.schemas.js';`
   ).join('\\n')}
   ```

2. **Dynamic Router Structure**: Generate router based on discovered endpoints  
   ```typescript
   // Should generate dynamically:  
   export const staticAppRouter = t.router({
     ${routerSectors.map(sector => `${sector}: t.router({...})`).join(',\\n')}
   });
   ```

3. **Schema Analysis**: Parse actual router files to extract endpoint definitions rather than hardcoding them

## Build Pipeline

### Current Process

1. **`generate:schemas`** - Copy schemas from sectors to `generated/schemas/`
2. **`generate:router`** - Create static AppRouter (semi-dynamic)
3. **`tsup`** - Build final package with proper exports

### Generated Artifacts

```
trpc-types/generated/
├── schemas/           # Copied from sectors (✅ fully dynamic)
│   ├── project.schemas.ts
│   ├── run.schemas.ts  
│   └── index.ts
└── router.ts          # Static AppRouter (❌ semi-dynamic)
```

## Future Enhancements

1. **Full Dynamic Type Generation**: Make `generate-router.ts` truly dynamic to match runtime behavior
2. **Endpoint Discovery**: Parse router files to extract actual endpoint definitions
3. **Schema Validation**: Ensure generated types match runtime router structure
4. **Hot Reload Support**: Watch for sector changes during development
5. **Documentation Generation**: Auto-generate API docs from sector definitions

This architecture provides a solid foundation for a scalable, type-safe tRPC API, but the type generation component needs enhancement to fully match the dynamic runtime capabilities.