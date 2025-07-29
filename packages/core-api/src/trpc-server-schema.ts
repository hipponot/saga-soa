import { z } from 'zod';
import type { CreateContextCallback } from '@trpc/server';

export const TRPCServerSchema = z.object({
  configType: z.literal('TRPC_SERVER'),
  name: z.string().min(1),
  basePath: z.string().optional().default('/trpc'),
  contextFactory: z.function().optional(),
  // Playground configuration
  enablePlayground: z.boolean().optional().default(false),
  playgroundPath: z.string().optional().default('/playground'),
  playgroundConfig: z.object({
    // Additional playground-specific configuration can be added here
  }).optional(),
});

export type TRPCServerConfig = z.infer<typeof TRPCServerSchema>; 