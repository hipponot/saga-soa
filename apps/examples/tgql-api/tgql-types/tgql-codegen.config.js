export default {
  source: {
    sectorsDir: '../src/sectors',
    resolverPattern: 'gql/*.resolver.ts',
    typePattern: 'gql/*.type.ts',
    inputPattern: 'gql/*.input.ts'
  },
  generation: {
    outputDir: './generated',
    packageName: '@saga-soa/tgql-types',
    schemaName: 'AppSchema'
  }
};