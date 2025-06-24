import 'reflect-metadata';
import { z, ZodObject } from 'zod';
import { IConfigManager, HasConfigType } from '../i-config-manager';
export declare class MockConfigManager implements IConfigManager {
    /**
     * Creates a mock configuration by introspecting the Zod schema and generating random values
     * @param schema Zod object schema describing the config shape
     * @returns Strongly typed config object with mock data
     */
    get<T extends HasConfigType>(schema: ZodObject<T>): z.infer<ZodObject<T>>;
}
//# sourceMappingURL=mock-config-manager.d.ts.map