import { z, ZodObject } from 'zod';
import { HasConfigType } from '@saga-soa/config';
export declare const MongoProviderSchema: ZodObject<HasConfigType>;
export type MongoProviderConfig = z.infer<typeof MongoProviderSchema>;
//# sourceMappingURL=mongo-provider-config.d.ts.map