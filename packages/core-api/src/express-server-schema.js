import { z } from 'zod';
export const ExpressServerSchema = z.object({
    configType: z.literal('EXPRESS_SERVER'),
    port: z.number().int().positive(),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']),
    name: z.string().min(1),
});
