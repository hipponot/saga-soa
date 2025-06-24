import { z, ZodObject } from 'zod';
import { HasConfigType } from '@saga-soa/config';
export declare const PinoLoggerSchema: ZodObject<HasConfigType>;
export type PinoLoggerConfig = z.infer<typeof PinoLoggerSchema>;
//# sourceMappingURL=pino-logger-schema.d.ts.map