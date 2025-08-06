# @saga-soa/trpc-types

A comprehensive TypeScript types package for tRPC APIs that provides both compile-time type safety and runtime validation capabilities.

## Features

- **AppRouter Type**: Proper tRPC client typing for full type safety (defined in trpc-types)
- **Zod Schemas**: Runtime validation capabilities for client-side validation
- **Generated Types**: Pure TypeScript types for compile-time safety
- **Flexible Usage**: Choose between runtime validation or compile-time types
- **Source of Truth**: Single package for all type definitions

## Package Structure

```
src/
├── index.ts                 # Main exports (AppRouter + schemas + generated types)
├── schemas/                 # Zod schemas for runtime validation
│   ├── project.schemas.ts  # Project Zod schemas
│   ├── run.schemas.ts      # Run Zod schemas
│   └── index.ts            # Schema exports
└── generated/              # Generated TypeScript types
    ├── CreateProject.ts
    ├── UpdateProject.ts
    ├── GetProject.ts
    ├── CreateRun.ts
    ├── UpdateRun.ts
    ├── GetRun.ts
    └── GetRunsByProject.ts
```

## Usage

### 1. **AppRouter Type (Recommended)**

For proper tRPC client typing:

```typescript
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@saga-soa/trpc-types';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:5000/saga-soa/v1/trpc',
    }),
  ],
});

// Full type safety with autocomplete
const projects = await trpc.project.getAllProjects.query();
const project = await trpc.project.getProjectById.query({ id: '1' });
const newProject = await trpc.project.createProject.mutate({
  name: 'New Project',
  description: 'Description',
  status: 'active'
});
```

### 2. **Zod Schemas for Runtime Validation**

For client-side validation:

```typescript
import { 
  CreateProjectSchema, 
  UpdateProjectSchema,
  type CreateProjectInput 
} from '@saga-soa/trpc-types/schemas';

// Validate input before sending to server
const input = { name: 'Project', status: 'active' };
const validatedInput = CreateProjectSchema.parse(input);

// Type inference from schemas
const createProject = (data: CreateProjectInput) => {
  // data is fully typed
  return trpc.project.createProject.mutate(data);
};
```

### 3. **Generated Types for Compile-time Safety**

For pure TypeScript usage:

```typescript
import type { 
  CreateProjectInput, 
  UpdateProjectInput,
  GetProjectInput 
} from '@saga-soa/trpc-types';

// Use generated types directly
const createProject = (data: CreateProjectInput) => {
  return trpc.project.createProject.mutate(data);
};
```

## Package Exports

### Main Export
```typescript
import { AppRouter } from '@saga-soa/trpc-types';
```

### Schemas Export
```typescript
import { 
  CreateProjectSchema,
  UpdateProjectSchema,
  GetProjectSchema,
  CreateRunSchema,
  UpdateRunSchema,
  GetRunSchema,
  GetRunsByProjectSchema
} from '@saga-soa/trpc-types/schemas';
```



### Generated Types Export
```typescript
import type { 
  CreateProjectInput,
  UpdateProjectInput,
  GetProjectInput,
  CreateRunInput,
  UpdateRunInput,
  GetRunInput,
  GetRunsByProjectInput
} from '@saga-soa/trpc-types/generated';
```

## Available Types

### Project Types
- `CreateProjectInput` - Input for creating a project
- `UpdateProjectInput` - Input for updating a project
- `GetProjectInput` - Input for getting a project by ID
- `Project` - Project entity type

### Run Types
- `CreateRunInput` - Input for creating a run
- `UpdateRunInput` - Input for updating a run
- `GetRunInput` - Input for getting a run by ID
- `GetRunsByProjectInput` - Input for getting runs by project ID
- `Run` - Run entity type

## Available Schemas

### Project Schemas
- `CreateProjectSchema` - Zod schema for project creation
- `UpdateProjectSchema` - Zod schema for project updates
- `GetProjectSchema` - Zod schema for project retrieval

### Run Schemas
- `CreateRunSchema` - Zod schema for run creation
- `UpdateRunSchema` - Zod schema for run updates
- `GetRunSchema` - Zod schema for run retrieval
- `GetRunsByProjectSchema` - Zod schema for getting runs by project

## Build Process

The package automatically:

1. **Generates TypeScript types** from server Zod schemas using `zod2ts`
2. **Copies Zod schemas** from server for client-side validation
3. **Builds all exports** with proper TypeScript declarations

```bash
# Build the package
pnpm run build

# Generate types from server schemas
pnpm run generate-types

# Validate no server imports
pnpm run validate
```

## Benefits

### **Type Safety**
- Full TypeScript support with proper AppRouter typing
- Compile-time error detection
- IntelliSense and autocomplete support

### **Runtime Validation**
- Client-side input validation using Zod schemas
- Consistent validation between client and server
- Detailed error messages for validation failures

### **Flexibility**
- Choose between runtime validation or compile-time types
- Mix and match based on your needs
- No runtime overhead when using generated types

### **Maintainability**
- Single source of truth for all type definitions
- Automatic type generation from server schemas
- Consistent API contracts between client and server

## Migration Guide

### From Previous Version

If you were using the previous version:

```typescript
// Before
import type { CreateProjectInput } from '@saga-soa/trpc-types';

// After (same import still works)
import type { CreateProjectInput } from '@saga-soa/trpc-types';

// New: Add runtime validation
import { CreateProjectSchema } from '@saga-soa/trpc-types/schemas';
```

### Adding Runtime Validation

```typescript
// Before: No validation
const createProject = (data: CreateProjectInput) => {
  return trpc.project.createProject.mutate(data);
};

// After: With validation
import { CreateProjectSchema } from '@saga-soa/trpc-types/schemas';

const createProject = (data: unknown) => {
  const validatedData = CreateProjectSchema.parse(data);
  return trpc.project.createProject.mutate(validatedData);
};
```

## Examples

### Full Example with Validation

```typescript
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@saga-soa/trpc-types';
import { CreateProjectSchema, type CreateProjectInput } from '@saga-soa/trpc-types/schemas';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:5000/saga-soa/v1/trpc',
    }),
  ],
});

// Function with runtime validation
const createProject = (input: unknown) => {
  try {
    const validatedInput = CreateProjectSchema.parse(input);
    return trpc.project.createProject.mutate(validatedInput);
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
};

// Usage
const newProject = await createProject({
  name: 'My Project',
  description: 'A new project',
  status: 'active'
});
```

This package provides the best of both worlds: compile-time type safety and runtime validation capabilities, allowing you to choose the approach that best fits your needs. 