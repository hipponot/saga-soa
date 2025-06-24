var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import 'reflect-metadata';
import { z } from 'zod';
import dotenvFlow from 'dotenv-flow';
import { injectable } from 'inversify';
export class ConfigValidationError extends Error {
    configType;
    validationError;
    constructor(configType, validationError) {
        super(`Configuration validation failed for ${configType}`);
        this.configType = configType;
        this.validationError = validationError;
        this.name = 'ConfigValidationError';
    }
}
let DotenvConfigManager = class DotenvConfigManager {
    /**
     * Loads and validates configuration from environment variables using the provided Zod object schema.
     * @param schema Zod object schema describing the config shape (must include a configType literal field)
     * @returns Strongly typed config object
     * @throws ConfigValidationError if validation fails
     */
    get(schema) {
        dotenvFlow.config();
        // Extract configType from schema (assumes a literal field named configType)
        const configType = schema.shape.configType.value;
        const prefix = configType.toUpperCase() + '_';
        const env = process.env;
        const input = {};
        for (const key in schema.shape) {
            if (key === 'configType')
                continue;
            const envVar = prefix + key.toUpperCase();
            if (env[envVar] !== undefined) {
                input[key] = env[envVar];
            }
        }
        input.configType = configType;
        try {
            return schema.parse(input);
        }
        catch (err) {
            if (err instanceof z.ZodError) {
                throw new ConfigValidationError(configType, err);
            }
            throw err;
        }
    }
};
DotenvConfigManager = __decorate([
    injectable()
], DotenvConfigManager);
export { DotenvConfigManager };
let MockConfigManager = class MockConfigManager {
    /**
     * Creates a mock configuration by introspecting the Zod schema and generating random values
     * @param schema Zod object schema describing the config shape
     * @returns Strongly typed config object with mock data
     */
    get(schema) {
        const configType = schema.shape.configType.value;
        const input = { configType };
        for (const [key, def] of Object.entries(schema.shape)) {
            if (key === 'configType')
                continue;
            // Generate mock data based on the Zod type
            if (def instanceof z.ZodString) {
                input[key] = def.minLength || 0 ? 'mock'.padEnd(def.minLength || 3, 'x') : 'mock';
            }
            else if (def instanceof z.ZodNumber || def instanceof z.ZodEffects) {
                input[key] = '42'; // String for preprocessed numbers
            }
            else if (def instanceof z.ZodBoolean || def instanceof z.ZodEffects) {
                input[key] = 'true'; // String for preprocessed booleans
            }
            else if (def instanceof z.ZodEnum) {
                input[key] = def.options[0];
            }
            else if (def instanceof z.ZodOptional) {
                input[key] = undefined;
            }
        }
        try {
            return schema.parse(input);
        }
        catch (err) {
            if (err instanceof z.ZodError) {
                throw new ConfigValidationError(configType, err);
            }
            throw err;
        }
    }
};
MockConfigManager = __decorate([
    injectable()
], MockConfigManager);
export { MockConfigManager };
