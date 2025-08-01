# @saga-soa/trpc-types

A dedicated package that exports only TypeScript types for tRPC clients, with strict separation from server code.

## Purpose

This package provides pure TypeScript types extracted from tRPC server schemas, ensuring that clients can access type definitions without any server dependencies or implementation details.

## Features

- ✅ **Zero Server Dependencies**: No server code or dependencies
- ✅ **Pure TypeScript Types**: Generated from Zod schemas using zod2ts
- ✅ **Build-time Validation**: Automated checks prevent server imports
- ✅ **Type Safety**: Full TypeScript support with proper declarations
- ✅ **Bundle Optimization**: Minimal bundle size for clients

## Usage

### Basic Import

```typescript
import { CreateProjectInput, UpdateProjectInput } from '@saga-soa/trpc-types';
```

### Selective Import

```typescript
import { CreateProjectInput } from '@saga-soa/trpc-types/project';
import { CreateRunInput } from '@saga-soa/trpc-types/run';
```

## Available Types

### Project Types
- `CreateProjectInput`
- `UpdateProjectInput` 
- `GetProjectInput`
- `Project`

### Run Types
- `CreateRunInput`
- `UpdateRunInput`
- `GetRunInput`
- `Run`

## Build Process

Types are automatically generated from server Zod schemas:

1. **Server defines schemas**: `apps/examples/trpc-api/src/sectors/*/trpc/*.types.ts`
2. **Build extracts types**: `zod2ts` generates pure TypeScript types
3. **Package exports types**: `packages/trpc-types/src/generated/*.ts`
4. **Client imports types**: `import { Type } from '@saga-soa/trpc-types'`

## Development

```bash
# Generate types from server schemas
pnpm generate-types

# Build the package
pnpm build

# Validate no server imports
pnpm validate
```

## Security

This package is validated to ensure no server code leaks into client bundles:

- Automated validation prevents server imports
- Only TypeScript types are included
- No runtime dependencies on server packages
- Build-time checks ensure separation

## Migration from Server Package

```typescript
// Before
import { CreateProjectInput } from '@saga-soa/trpc-api';

// After
import { CreateProjectInput } from '@saga-soa/trpc-types';
``` 