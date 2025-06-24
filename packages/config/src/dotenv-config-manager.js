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
import { ConfigValidationError } from './config-validation-error';
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
