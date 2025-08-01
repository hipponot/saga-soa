import { z } from 'zod';

export const GQLServerSchema = z.object({
  configType: z.literal('GQL_SERVER'),
  mountPoint: z.string().transform(val => {
    if (!val) return '/graphql';
    // Ensure it starts with '/'
    if (!val.startsWith('/')) {
      throw new Error('mountPoint must start with "/"');
    }
    // Remove trailing slash if present
    return val.endsWith('/') ? val.slice(0, -1) : val;
  }),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']),
  name: z.string().min(1),
  enablePlayground: z.boolean().default(false),
  playgroundPath: z
    .string()
    .transform(val => {
      if (!val) return '/playground';
      // Ensure it starts with '/'
      if (!val.startsWith('/')) {
        throw new Error('playgroundPath must start with "/"');
      }
      // Remove trailing slash if present
      return val.endsWith('/') ? val.slice(0, -1) : val;
    })
    .default('/playground'),
  emitSchema: z.boolean().default(true),
  schemaDir: z.string().default('dist/schema'),
});

export type GQLServerConfig = z.infer<typeof GQLServerSchema>;
