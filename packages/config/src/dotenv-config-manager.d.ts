import 'reflect-metadata';
import { z, ZodObject } from 'zod';
import { IConfigManager, HasConfigType } from './i-config-manager';
export declare class DotenvConfigManager implements IConfigManager {
    /**
     * Loads and validates configuration from environment variables using the provided Zod object schema.
     * @param schema Zod object schema describing the config shape (must include a configType literal field)
     * @returns Strongly typed config object
     * @throws ConfigValidationError if validation fails
     */
    get<T extends HasConfigType>(schema: ZodObject<T>): z.infer<ZodObject<T>>;
}
//# sourceMappingURL=dotenv-config-manager.d.ts.map