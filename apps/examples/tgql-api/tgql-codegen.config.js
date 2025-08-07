export default {
  source: {
    sectorsDir: './src/sectors',
    resolverPattern: '*/gql/*.resolver.ts',
    typePattern: '*/gql/*.type.ts',
    inputPattern: '*/gql/*.input.ts'
  },
  generation: {
    outputDir: './tgql-types/generated',
    packageName: '@saga-soa/tgql-types',
    schemaName: 'AppSchema'
  },
  sdl: {
    enabled: true,
    outputDir: './test-schema',
    emitBySector: true
  }
}; 