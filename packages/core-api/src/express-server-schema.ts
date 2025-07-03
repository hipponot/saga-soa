import { z, ZodObject }       from 'zod';
import { injectable }         from 'inversify';

export const ExpressServerSchema = z.object({
  configType: z.literal('EXPRESS_SERVER'),
  port: z.number().int().positive(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']),
  name: z.string().min(1),
});

export type ExpressServerConfig = z.infer<typeof ExpressServerSchema>;