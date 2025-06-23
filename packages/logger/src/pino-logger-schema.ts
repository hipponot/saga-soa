import { z, ZodObject } from 'zod';
import { HasConfigType } from '@saga-soa/config';

export const PinoLoggerSchema: ZodObject<HasConfigType> = z.object({
  configType: z.literal('PINO_LOGGER'),
  level: z.enum(['debug', 'info', 'warn', 'error']),
  isExpressContext: z.boolean(),
  prettyPrint: z.boolean().optional(),
  logFile: z.string().optional(),
});

export type PinoLoggerConfig = z.infer<typeof PinoLoggerSchema>; 