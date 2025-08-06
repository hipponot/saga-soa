# TGQL Codegen

TypeGraphQL code generation utilities for the saga-soa monorepo.

## Overview

This package provides code generation capabilities for TypeGraphQL-based GraphQL APIs. It:

- Parses TypeGraphQL decorators (@Resolver, @Query, @Mutation, @ObjectType, @InputType)
- Extracts type information from sector-based code organization
- Generates TypeScript interfaces and schema building utilities
- Supports both one-time generation and file watching

## Installation

```bash
pnpm add -D @saga-soa/tgql-codegen
```

## CLI Usage

```bash
# Generate types once
tgql-codegen generate

# Watch for changes and regenerate
tgql-codegen watch

# Use custom config file
tgql-codegen generate -c my-config.js
```

## Configuration

Create a `tgql-codegen.config.js` file:

```javascript
module.exports = {
  source: {
    sectorsDir: './src/sectors',
    resolverPattern: '*/gql/*.resolver.ts',
    typePattern: '*/gql/*.type.ts',
    inputPattern: '*/gql/*.input.ts'
  },
  generation: {
    outputDir: './generated',
    packageName: '@my/graphql-types',
    schemaName: 'AppSchema'
  },
  parsing: {
    resolverPattern: /@Resolver\(\s*\(\)\s*=>\s*(\w+)\s*\)/g,
    queryPattern: /@Query\(\s*\(\)\s*=>\s*(\[?)(\w+)(\]?)/g,
    mutationPattern: /@Mutation\(\s*\(\)\s*=>\s*(\[?)(\w+)(\]?)/g,
  }
};
```

## API Usage

```typescript
import { TGQLCodegen, ConfigLoader } from '@saga-soa/tgql-codegen';

// Load configuration
const config = ConfigLoader.load();

// Create codegen instance
const codegen = new TGQLCodegen(config);

// Generate types
const result = await codegen.generate();

// Start watch mode
await codegen.watch();
```

## Features

- **Sector-based parsing**: Organizes code by business domains (sectors)
- **TypeGraphQL decorator support**: Parses @Resolver, @Query, @Mutation, @ObjectType, @InputType
- **Type-safe generation**: Generates strongly-typed interfaces and utilities
- **Watch mode**: Automatically regenerates on file changes
- **Configurable patterns**: Customize file patterns and output structure

## Generated Output

The codegen generates:

1. **Schema file** (`schema.ts`): Contains resolver classes and schema building utilities
2. **Type files** (`types/*.types.ts`): TypeScript interfaces for each sector
3. **Index file** (`index.ts`): Main exports

## Sector Organization

Expected file structure:

```
src/sectors/
├── user/
│   └── gql/
│       ├── user.resolver.ts    # @Resolver() class
│       ├── user.type.ts        # @ObjectType() class
│       └── user.input.ts       # @InputType() class
└── session/
    └── gql/
        ├── session.resolver.ts
        ├── session.type.ts
        └── session.input.ts
```