import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  // Source configuration
  source: {
    sectorsDir: path.resolve(__dirname, 'sectors'),
    routerPattern: '*/trpc/*-router.ts',
    schemaPattern: '*/trpc/schema/*-schemas.ts'
  },
  
  // Generation configuration  
  generation: {
    outputDir: path.resolve(__dirname, 'output'),
    packageName: '@test/trpc-types',
    routerName: 'AppRouter'
  },
  
  // Parsing configuration
  parsing: {
    endpointPattern: /(\w+):\s*t\.procedure\s*(?:\n\s*\.input\((\w+Schema)\))?\s*\n\s*\.(query|mutation)\(/g,
    routerMethodPattern: /(?:createRouter\(\s*\)\s*\{[\s\S]*?)?return\s+router\(\s*\{([\s\S]*)\}\s*\)\s*;?\s*\}?/
  },

  // Zod2ts configuration
  zod2ts: {
    enabled: true,
    outputDir: './types'
  }
}
