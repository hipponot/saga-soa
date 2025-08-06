export interface TGQLCodegenConfig {
  source: {
    sectorsDir: string;
    resolverPattern: string;
    typePattern: string;
    inputPattern: string;
  };
  generation: {
    outputDir: string;
    packageName: string;
    schemaName?: string;
  };
  parsing: {
    resolverPattern: RegExp;
    queryPattern: RegExp;
    mutationPattern: RegExp;
  };
}

export const DEFAULT_CONFIG: TGQLCodegenConfig = {
  source: {
    sectorsDir: './src/sectors',
    resolverPattern: '*/gql/*.resolver.ts',
    typePattern: '*/gql/*.type.ts',
    inputPattern: '*/gql/*.input.ts'
  },
  generation: {
    outputDir: './generated',
    packageName: '@saga-soa/tgql-types',
    schemaName: 'AppSchema'
  },
  parsing: {
    resolverPattern: /@Resolver\(\s*\(\)\s*=>\s*(\w+)\s*\)/g,
    queryPattern: /@Query\(\s*\(\)\s*=>\s*(\[?)(\w+)(\]?)/g,
    mutationPattern: /@Mutation\(\s*\(\)\s*=>\s*(\[?)(\w+)(\]?)/g,
  }
};