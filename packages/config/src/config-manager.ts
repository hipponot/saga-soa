import { z, ZodObject, ZodRawShape } from 'zod';
import dotenvFlow                    from 'dotenv-flow';

export class ConfigValidationError extends Error {
  constructor(public readonly configType: string, public readonly validationError: z.ZodError) {
    super(`Configuration validation failed for ${configType}`);
    this.name = 'ConfigValidationError';
  }
}

export class ConfigManager {
  /**
   * Loads and validates configuration from environment variables using the provided Zod object schema.
   * @param schema Zod object schema describing the config shape (must include a configType literal field)
   * @returns Strongly typed config object
   * @throws ConfigValidationError if validation fails
   */
  static get<T extends ZodRawShape>(schema: ZodObject<T>): z.infer<ZodObject<T>> {
    dotenvFlow.config();
    // Extract configType from schema (assumes a literal field named configType)
    const configType = (schema.shape as any).configType.value as string;
    const prefix = configType.toUpperCase() + '_';
    const env = process.env;
    const input: Record<string, any> = {};

    for (const key in schema.shape) {
      if (key === 'configType') continue;
      const envVar = prefix + key.toUpperCase();
      if (env[envVar] !== undefined) {
        input[key] = env[envVar];
      }
    }
    input.configType = configType;

    try {
      return schema.parse(input);
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new ConfigValidationError(configType, err);
      }
      throw err;
    }
  }
}