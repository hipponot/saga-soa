# tgql-codegen SDL Emission Enhancement Plan

## Overview

This plan outlines the implementation of SDL (Schema Definition Language) emission capabilities in the tgql-codegen tool, leveraging the `buildSchema` functionality from the type-graphql package.

## Current State

- tgql-codegen currently generates TypeScript types from GraphQL resolvers
- gql-server.ts in core-api already has SDL emission functionality using `buildSchema` and `printSchema`
- The current tgql-api example has `emitSchema` configuration that emits SDL during startup

## Phase 1: Test and Understand Current SDL Emission

**Objective**: Understand the current SDL emission behavior in tgql-api when `emitSchema` is enabled.

**Steps**:
1. **Enable SDL emission in tgql-api**:
   - Verify `emitSchema: true` is set in the GQLServerConfig
   - Start tgql-api and observe the emitted schema files
   - Document the structure and content of emitted SDL files

2. **Analyze emitted schema structure**:
   - Check the `dist/schema/` directory for emitted files
   - Examine sector-based SDL files (e.g., `user.graphql`, `session.graphql`)

3. **Document current behavior**:
   - Schema file locations and naming conventions
   - Content structure and formatting
   - Sector-based vs. unified schema approaches

## Phase 2: Extract SDL Emission Logic

**Objective**: Extract the core SDL emission logic from `gql-server.ts` into a reusable component.

**Key Components to Extract**:
- `buildSchema` call with resolver classes (line 137 in gql-server.ts)
- `printSchema` conversion to SDL
- Sector-based SDL emission logic from `emitSectorSDL` method
- File writing and directory creation logic

**Implementation**:
1. **Create SDL Generator Class**:
   ```typescript
   // packages/tgql-codegen/src/generators/sdl-generator.ts
   export class SDLGenerator {
     async emitSDL(resolverClasses: Function[], outputPath: string): Promise<void>
     async emitSectorSDL(sectorName: string, resolvers: Function[], outputPath: string): Promise<void>
   }
   ```

2. **Extract Core Logic**:
   - Resolver class loading without full server setup
   - Schema building with `buildSchema` from type-graphql
   - SDL conversion with `printSchema` from graphql
   - File system operations

## Phase 3: Update tgql-codegen Configuration

**Objective**: Add SDL emission capabilities to tgql-codegen configuration.

**Configuration Updates**:
```typescript
// packages/tgql-codegen/src/types/config.ts
export interface TGQLCodegenConfig {
  // ... existing config
  sdl: {
    enabled: boolean;
    outputDir: string;
    fileName?: string;
    emitBySector: boolean;
    sectorFileNamePattern?: string;
  };
}
```

**Default Configuration**:
```typescript
export const DEFAULT_CONFIG: TGQLCodegenConfig = {
  // ... existing defaults
  sdl: {
    enabled: false,
    outputDir: './generated/schema',
    fileName: 'schema.graphql',
    emitBySector: true,
    sectorFileNamePattern: '{sector}.graphql'
  }
};
```

## Phase 4: Update tgql-codegen CLI

**Objective**: Add SDL emission commands to the tgql-codegen CLI.

**New CLI Commands**:
1. **`emit-sdl`**: Generate only SDL files
2. **`generate --include-sdl`**: Generate types and SDL
3. **`generate --sdl-only`**: Generate only SDL (skip types)

**CLI Updates**:
```typescript
// packages/tgql-codegen/bin/tgql-codegen.js
program
  .command('emit-sdl')
  .description('Generate GraphQL SDL files from TypeGraphQL resolvers')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-o, --output <dir>', 'Output directory for SDL files')
  .option('--by-sector', 'Emit separate SDL files for each sector')
  .action(async (options) => {
    // SDL-only generation
  });
```

## Phase 5: Integrate SDL Generation into tgql-codegen

**Objective**: Integrate SDL generation into the existing tgql-codegen workflow.

**Implementation**:
1. **Update TGQLCodegen class**:
   ```typescript
   // packages/tgql-codegen/src/generators/codegen.ts
   export class TGQLCodegen {
     private sdlGenerator: SDLGenerator;
     
     async generate(): Promise<GenerationResult> {
       // ... existing type generation
       
       if (this.config.sdl.enabled) {
         await this.generateSDL();
       }
     }
     
     private async generateSDL(): Promise<void> {
       // SDL generation logic
     }
   }
   ```

2. **Resolver Loading Strategy**:
   - Use existing `SectorParser` to find resolver files
   - Dynamically import resolver classes
   - Handle dependency injection requirements

3. **SDL Generation Options**:
   - Single unified schema file
   - Sector-based schema files
   - Both options simultaneously

## Phase 6: Testing and Validation

**Objective**: Ensure SDL emission works correctly and produces valid schemas.

**Testing Strategy**:
1. **Unit Tests**:
   - Test SDL generator with mock resolvers
   - Test configuration parsing
   - Test file output and formatting

2. **Integration Tests**:
   - Test with actual tgql-api resolvers
   - Compare emitted SDL with runtime schema
   - Validate SDL can be consumed by GraphQL tools

3. **Validation Tests**:
   - Ensure emitted SDL is valid GraphQL schema
   - Test schema introspection
   - Verify compatibility with graphql-codegen

## Phase 7: Documentation and Examples

**Objective**: Document the new SDL emission functionality.

**Documentation Updates**:
1. **README Updates**:
   - Document new SDL emission features
   - Provide configuration examples
   - Show CLI usage examples

2. **Configuration Examples**:
   ```typescript
   // tgql-codegen.config.js
   module.exports = {
     source: { /* existing config */ },
     generation: { /* existing config */ },
     sdl: {
       enabled: true,
       outputDir: './generated/schema',
       emitBySector: true
     }
   };
   ```

3. **CLI Usage Examples**:
   ```bash
   # Generate SDL only
   tgql-codegen emit-sdl
   
   # Generate types and SDL
   tgql-codegen generate --include-sdl
   
   # Generate SDL by sector
   tgql-codegen emit-sdl --by-sector
   ```

## Implementation Order

1. **Phase 1**: Test current tgql-api SDL emission
2. **Phase 2**: Extract SDL emission logic
3. **Phase 3**: Update configuration
4. **Phase 4**: Update CLI
5. **Phase 5**: Integrate into tgql-codegen
6. **Phase 6**: Testing and validation
7. **Phase 7**: Documentation

## Key Technical Considerations

1. **Resolver Loading**: Need to load resolver classes without full DI container setup
2. **Metadata Reflection**: Ensure `reflect-metadata` is available during codegen
3. **Dependencies**: Handle type-graphql and graphql package dependencies
4. **Error Handling**: Graceful handling of invalid resolvers or schema building failures
5. **Performance**: Efficient schema building for large resolver sets
6. **File Organization**: Clear separation between type generation and SDL emission

## Reference Implementation

The core SDL emission logic is already implemented in:
- `packages/core-api/src/gql-server.ts` - `emitSectorSDL` method
- `apps/examples/tgql-api/scripts/emit-schema.ts` - Standalone schema emission

These serve as reference implementations for the tgql-codegen SDL emission feature.