# @saga-soa/trpc-codegen

Reusable tRPC code generation utilities for saga-soa monorepo. Automatically generates TypeScript types and router definitions from sector-based tRPC APIs.

## Features

- 🔄 **Fully Dynamic**: Automatically discovers sectors and parses router files
- 📦 **Reusable**: Single package supports multiple tRPC API projects
- ⚙️ **Configurable**: Flexible configuration for different project structures
- 🔍 **Smart Parsing**: Extracts endpoint definitions from actual router files
- 👀 **Watch Mode**: Automatically regenerates on file changes
- 🛠 **CLI Interface**: Easy to use command-line tools

## Installation

```bash
# Install in your tRPC API project
pnpm add -D @saga-soa/trpc-codegen
```

## Usage

### CLI Commands

```bash
# Generate types once
pnpm trpc-codegen generate

# Watch mode for development
pnpm trpc-codegen watch

# Custom config file
pnpm trpc-codegen generate --config=./my-config.js

# Custom project path
pnpm trpc-codegen generate --project=/path/to/project
```

### Configuration

Create a `codegen.config.js` file in your project root:

```javascript
module.exports = {
  // Source configuration
  source: {
    sectorsDir: '../src/sectors',        // Path to sectors directory
    routerPattern: '*/trpc/*.router.ts', // Router file pattern
    schemaPattern: '*/trpc/*.schemas.ts' // Schema file pattern
  },
  
  // Generation configuration  
  generation: {
    outputDir: './generated',            // Output directory
    packageName: '@my-org/my-trpc-types', // Package name
    routerName: 'AppRouter'              // Router type name
  },
  
  // Parsing configuration (advanced)
  parsing: {
    endpointPattern: /(\w+):\s*t(?:[\s\n]*\.input\((\w+Schema)\))?[\s\n]*\.(query|mutation)\(/g,
    routerMethodPattern: /createRouter\(\s*\)\s*\{[\s\S]*?return\s+router\(\s*\{([\s\S]*?)\}\s*\)\s*;?\s*\}/
  }
};
```

### Project Structure

Your tRPC API should follow the sector-based pattern:

```
my-trpc-api/
├── trpc-types/                  # Generated types package
│   ├── package.json            # Package configuration
│   ├── codegen.config.js       # Codegen configuration
│   ├── generated/              # Auto-generated files (gitignored)
│   │   ├── router.ts           # Generated router type
│   │   ├── schemas/            # Copied schemas
│   │   └── index.ts            # Main exports
│   └── src/index.ts            # Package entry point
├── src/
│   └── sectors/                # Sector-based organization
│       ├── user/
│       │   └── trpc/
│       │       ├── user.router.ts   # Router implementation
│       │       └── user.schemas.ts  # Zod schemas
│       └── project/
│           └── trpc/
│               ├── project.router.ts
│               └── project.schemas.ts
└── package.json
```

## Generated Output

The codegen automatically creates:

1. **Router Types** (`generated/router.ts`):
   ```typescript
   export const staticAppRouter = t.router({
     user: t.router({
       getUser: t.procedure.input(userSchemas.GetUserSchema).query(() => ({})),
       createUser: t.procedure.input(userSchemas.CreateUserSchema).mutation(() => ({})),
     }),
     project: t.router({
       // ... project endpoints
     }),
   });
   
   export type AppRouter = typeof staticAppRouter;
   ```

2. **Schema Copies** (`generated/schemas/`):
   - Copies all `*.schemas.ts` files from sectors
   - Creates index file with re-exports

3. **Package Index** (`generated/index.ts`):
   - Exports router and schema types
   - Ready for consumption by client applications

## Integration with Build Process

Add to your `package.json`:

```json
{
  "scripts": {
    "generate": "trpc-codegen generate",
    "generate:watch": "trpc-codegen watch",
    "build": "pnpm generate && tsup"
  }
}
```

## Programmatic API

```typescript
import { TRPCCodegen, ConfigLoader } from '@saga-soa/trpc-codegen';

// Load configuration
const config = await ConfigLoader.loadConfig('./codegen.config.js');

// Generate code
const codegen = new TRPCCodegen(config, process.cwd());
const result = await codegen.generate();

console.log(`Generated ${result.generatedFiles.length} files`);
console.log(`Processed ${result.sectors.length} sectors`);
```

## Requirements

- Node.js 18+
- TypeScript 5.0+
- Sector-based tRPC API structure
- Router files must extend `AbstractTRPCController` pattern
- Schema files must export Zod schemas

## License

MIT