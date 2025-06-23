import { z, ZodObject }  from 'zod';
import { HasConfigType } from '@saga-soa/config';

export const MongoProviderSchema: ZodObject<HasConfigType> = z.object({
  configType: z.literal('MONGO'),
  instanceName: z.string().min(1),
  host: z.string().min(1),
  port: z.number().int().positive(),
  database: z.string().min(1),
  username: z.string().optional(),
  password: z.string().optional(),
  options: z.record(z.string(), z.any()).optional(),
});

export type MongoProviderConfig = z.infer<typeof MongoProviderSchema>;