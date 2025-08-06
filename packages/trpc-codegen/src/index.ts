// Main exports for @saga-soa/trpc-codegen
export { TRPCCodegen } from './generators/codegen.js';
export { ConfigLoader } from './utils/config-loader.js';
export { SectorParser } from './parsers/sector-parser.js';
export { RouterGenerator } from './generators/router-generator.js';
export { SchemaGenerator } from './generators/schema-generator.js';

// Type exports
export type { TRPCCodegenConfig } from './types/config.js';
export type { SectorInfo, EndpointInfo, GenerationResult } from './types/sector.js';
export { DEFAULT_CONFIG } from './types/config.js';