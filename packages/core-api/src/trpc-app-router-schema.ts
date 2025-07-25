import { z } from 'zod';
import type { CreateContextCallback } from '@trpc/server';

export const TRPCAppRouterSchema = z.object({
  configType: z.literal('TRPC_APP_ROUTER'),
  name: z.string().min(1),
  basePath: z.string().optional().default('/trpc'),
  contextFactory: z.function().optional(),
});

export type TRPCAppRouterConfig = z.infer<typeof TRPCAppRouterSchema>; 