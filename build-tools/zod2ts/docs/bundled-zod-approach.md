# Bundled Zod Approach

## Overview

zod2ts uses a **string replacement + bundled dependencies** approach to ensure it works reliably in any environment without requiring external zod installations.

## The Problem

Traditional approaches to loading Zod schemas face a fundamental issue:

```bash
# External directory without zod installed
/tmp/project/
├── my-schema.ts         # Contains: import { z } from 'zod'
└── package.json         # No zod dependency

# Running zod2ts fails:
zod2ts --zod-path /tmp/project/my-schema.ts --output-dir ./output
# ❌ Error: Cannot find package 'zod' imported from /tmp/project/my-schema.ts
```

Even with zod bundled into the CLI, Node.js resolves `import { z } from 'zod'` from the **schema file's location**, not from the CLI's bundled context.

## Our Solution: String Replacement + Eval

### 1. **Bundle Dependencies**
zod2ts includes a self-contained CommonJS bundle (`dist/cli/index.cjs`) with:
- ✅ zod (bundled)
- ✅ zod-to-ts (bundled) 
- ✅ All other dependencies (bundled)

### 2. **String Replacement**
Instead of dynamic import, we:

1. **Read schema file content** as plain text
2. **Replace zod imports** with bundled references:
   ```typescript
   // Before:
   import { z } from 'zod';
   
   // After:
   const { z } = globalThis.__bundledZod;
   ```

3. **Transform ES modules** to CommonJS-compatible format:
   ```typescript
   // Before:
   export const UserSchema = z.object({...});
   
   // After: 
   const UserSchema = z.object({...});
   exports.UserSchema = UserSchema;
   ```

### 3. **Safe Evaluation**
Execute the transformed code in a controlled environment:

```typescript
// Inject bundled zod into global scope
globalThis.__bundledZod = { z };

// Create module-like environment
const moduleScope = {
  exports: {},
  console,
  // ... other globals
};

// Evaluate transformed content
const func = new Function(...Object.keys(moduleScope), transformedContent);
const module = func(...Object.values(moduleScope));
```

## Benefits

✅ **Universal compatibility**: Works anywhere Node.js runs
✅ **No external dependencies**: Self-contained executable  
✅ **Handles multiple import patterns**:
- `import { z } from 'zod'`
- `import * as z from 'zod'` 
- `import z from 'zod'`
- `const { z } = require('zod')`

✅ **Supports both .ts and .js files**
✅ **Fast execution**: Direct code evaluation, no file system overhead
✅ **Safe**: Controlled execution environment

## Technical Implementation

### Schema Loading Process

```typescript
class ZodSchemaLoader {
  async loadSchemasFromFile(filePath: string): Promise<Map<string, z.ZodSchema>> {
    // 1. Read original schema file
    const originalContent = await readFile(filePath, 'utf-8');
    
    // 2. Replace zod imports 
    const modifiedContent = this.replaceZodImports(originalContent);
    
    // 3. Transform ES modules to CommonJS
    const transformedContent = this.transformESModuleExports(modifiedContent);
    
    // 4. Evaluate in controlled environment
    const module = new Function(/* ... */)(/* transformed content */);
    
    // 5. Extract zod schemas
    return this.extractZodSchemas(module);
  }
}
```

### Import Pattern Matching

The replacement handles various import patterns:

```typescript
private replaceZodImports(content: string): string {
  return content
    // import { z } from 'zod';
    .replace(/import\s*{\s*z\s*}\s*from\s*['"]zod['"];?/g, 
             'const { z } = globalThis.__bundledZod;')
    
    // import * as z from 'zod';  
    .replace(/import\s*\*\s*as\s+z\s*from\s*['"]zod['"];?/g,
             'const z = globalThis.__bundledZod;')
             
    // const { z } = require('zod');
    .replace(/const\s*{\s*z\s*}\s*=\s*require\s*\(\s*['"]zod['"]\s*\);?/g,
             'const { z } = globalThis.__bundledZod;');
}
```

## Comparison with Alternatives

| Approach | External Deps | TS Support | Complexity | Reliability |
|----------|---------------|------------|------------|-------------|
| **String Replacement** ✅ | None | Full | Low | High |
| Dynamic Import | Requires zod | Full | Low | Low |
| Module Resolution Hooks | None | Full | High | Medium |
| File System Temp Copy | Requires zod | Full | Medium | Medium |
| TypeScript Compilation | None | Full | High | High |

## Conclusion

The string replacement approach provides the optimal balance of:
- **Simplicity**: Straightforward implementation
- **Reliability**: Works in all environments
- **Performance**: Fast execution without external dependencies
- **Maintainability**: Single, well-defined code path

This makes zod2ts a truly portable, self-contained CLI tool that can process Zod schemas anywhere Node.js runs.