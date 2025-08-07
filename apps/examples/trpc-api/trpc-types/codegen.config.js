export default {
  // Source configuration
  source: {
    sectorsDir: '../src/sectors',
    routerPattern: '*/trpc/*.router.ts',
    schemaPattern: '*/trpc/*.schemas.ts'
  },
  
  // Generation configuration  
  generation: {
    outputDir: './generated',
    packageName: '@saga-soa/trpc-types',
    routerName: 'AppRouter'
  },
  
  // Parsing configuration
  parsing: {
    endpointPattern: /(\w+):\s*t(?:[\s\n]*\.input\((\w+Schema)\))?[\s\n]*\.(query|mutation)\(/g,
    routerMethodPattern: /createRouter\(\s*\)\s*\{[\s\S]*?return\s+router\(\s*\{([\s\S]*?)\}\s*\)\s*;?\s*\}/
  }
}; 