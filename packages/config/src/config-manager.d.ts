import 'reflect-metadata';
import { z, ZodObject, ZodRawShape, ZodLiteral } from 'zod';
export declare class ConfigValidationError extends Error {
    readonly configType: string;
    readonly validationError: z.ZodError;
    constructor(configType: string, validationError: z.ZodError);
}
type HasConfigType = ZodRawShape & {
    configType: ZodLiteral<any>;
};
export interface IConfigManager {
    /**
     * Loads and validates configuration using the provided Zod object schema.
     * @param schema Zod object schema describing the config shape (must include a configType literal field)
     * @returns Strongly typed config object
     * @throws ConfigValidationError if validation fails
     */
    get<T extends HasConfigType>(schema: ZodObject<T>): z.infer<ZodObject<T>>;
}
export declare class DotenvConfigManager implements IConfigManager {
    /**
     * Loads and validates configuration from environment variables using the provided Zod object schema.
     * @param schema Zod object schema describing the config shape (must include a configType literal field)
     * @returns Strongly typed config object
     * @throws ConfigValidationError if validation fails
     */
    get<T extends HasConfigType>(schema: ZodObject<T>): z.infer<ZodObject<T>>;
}
export declare class MockConfigManager implements IConfigManager {
    /**
     * Creates a mock configuration by introspecting the Zod schema and generating random values
     * @param schema Zod object schema describing the config shape
     * @returns Strongly typed config object with mock data
     */
    get<T extends HasConfigType>(schema: ZodObject<T>): z.infer<ZodObject<T>>;
}
export {};
//# sourceMappingURL=config-manager.d.ts.map