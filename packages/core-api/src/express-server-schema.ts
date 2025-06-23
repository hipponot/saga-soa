import { z, ZodObject } from 'zod';
import { HasConfigType } from '@saga-soa/config';

export const ExpressServerSchema: ZodObject<HasConfigType> = z.object({
  configType: z.literal('EXPRESS_SERVER'),
  port: z.number().int().positive(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']),
  name: z.string().min(1),
});

export type ExpressServerConfig = z.infer<typeof ExpressServerSchema>; 