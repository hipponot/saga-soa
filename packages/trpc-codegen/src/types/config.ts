export interface TRPCCodegenConfig {
  /** Source configuration */
  source: {
    /** Path to sectors directory relative to config file */
    sectorsDir: string;
    /** Glob pattern for router files within sectors */
    routerPattern: string;
    /** Glob pattern for schema files within sectors */
    schemaPattern: string;
  };
  
  /** Generation configuration */
  generation: {
    /** Output directory for generated files */
    outputDir: string;
    /** Package name for the generated types package */
    packageName: string;
    /** Name of the generated router type */
    routerName: string;
  };
  
  /** Parsing configuration */
  parsing: {
    /** Regex pattern for extracting endpoint definitions */
    endpointPattern: RegExp;
    /** Regex pattern for extracting router method content */
    routerMethodPattern: RegExp;
  };
}

export const DEFAULT_CONFIG: TRPCCodegenConfig = {
  source: {
    sectorsDir: 'src/sectors',
    routerPattern: '*/trpc/*.router.ts',
    schemaPattern: '*/trpc/*.schemas.ts'
  },
  generation: {
    outputDir: './generated',
    packageName: '@saga-soa/trpc-types',
    routerName: 'AppRouter'
  },
  parsing: {
    endpointPattern: /(\w+):\s*t(?:[\s\n]*\.input\((\w+Schema)\))?[\s\n]*\.(query|mutation)\(/g,
    routerMethodPattern: /createRouter\(\s*\)\s*\{[\s\S]*?return\s+router\(\s*\{([\s\S]*?)\}\s*\)\s*;?\s*\}/
  }
};