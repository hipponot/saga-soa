import { z, ZodObject } from 'zod';
import { HasConfigType } from '@saga-soa/config';
export declare const ExpressServerSchema: ZodObject<HasConfigType>;
export type ExpressServerConfig = z.infer<typeof ExpressServerSchema>;
//# sourceMappingURL=express-server-schema.d.ts.map