// Re-export the generated static router and its types
export { staticAppRouter as appRouter, type AppRouter } from '../generated/router.js';

// Export Zod schemas for runtime validation from generated directory
export * from '../generated/schemas/index.js';

// Types are now exported directly from schemas - no need for separate type files 