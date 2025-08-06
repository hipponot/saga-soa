// Re-export the generated schema and its types
export { buildAppSchema, getSchemaSDL, resolvers } from '../generated/schema.js';

// Export generated types from generated directory
export * from '../generated/types/index.js';

// Types are now exported directly from generated directory