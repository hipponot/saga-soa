import 'reflect-metadata';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv-flow';
import { Container } from 'inversify';
import { DotenvConfigManager } from '../dotenv-config-manager';
import { ConfigValidationError } from '../config-validation-error';
import { MockConfigManager } from '../mocks/mock-config-manager';
describe('ConfigManager', () => {
    let container;
    const originalEnv = process.env;
    const dotEnvPath = path.join(__dirname, '../../', '.env.test');
    // This is the schema that drives the initialization of the TEST_CONFIG
    const TestSchema = z.object({
        configType: z.literal('TEST_CONFIG'),
        string: z.string().min(3),
        number: z.preprocess((val) => Number(val), z.number().int().positive()),
        bool: z.preprocess((val) => val === 'true', z.boolean()),
        optional: z.string().optional(),
        enum: z.enum(['option1', 'option2', 'option3'])
    });
    beforeAll(() => {
        // Write a .env.test file for the test
        fs.writeFileSync(dotEnvPath, [
            'TEST_CONFIG_STRING=hello',
            'TEST_CONFIG_NUMBER=42',
            'TEST_CONFIG_BOOL=true',
            'TEST_CONFIG_OPTIONAL=optional-value',
            'TEST_CONFIG_ENUM=option2',
        ].join('\n'));
        dotenv.config();
    });
    beforeEach(() => {
        container = new Container();
    });
    afterAll(() => {
        fs.unlinkSync(path.join(dotEnvPath));
        process.env = originalEnv;
    });
    describe('DotenvConfigManager', () => {
        beforeEach(() => {
            container.bind('IConfigManager').to(DotenvConfigManager);
        });
        it('should load and validate config from .env.test using Zod schema', () => {
            const configManager = container.get('IConfigManager');
            const config = configManager.get(TestSchema);
            expect(config).toEqual({
                configType: 'TEST_CONFIG',
                string: 'hello',
                number: 42,
                bool: true,
                optional: 'optional-value',
                enum: 'option2',
            });
        });
        it('should throw ConfigValidationError for invalid config', () => {
            const configManager = container.get('IConfigManager');
            // Set invalid values
            process.env.TEST_CONFIG_STRING = 'hi'; // too short
            process.env.TEST_CONFIG_NUMBER = '-1'; // not positive
            process.env.TEST_CONFIG_BOOL = 'notabool'; // not 'true'
            process.env.TEST_CONFIG_ENUM = 'invalid'; // not in enum
            expect(() => configManager.get(TestSchema)).toThrow(ConfigValidationError);
        });
    });
    describe('MockConfigManager', () => {
        beforeEach(() => {
            container.bind('IConfigManager').to(MockConfigManager);
        });
        it('should generate valid mock data based on schema', () => {
            const configManager = container.get('IConfigManager');
            const config = configManager.get(TestSchema);
            // Verify the mock data matches schema requirements
            expect(config.configType).toBe('TEST_CONFIG');
            expect(config.string.length).toBeGreaterThanOrEqual(3);
            expect(typeof config.number).toBe('number');
            expect(config.number).toBeGreaterThan(0);
            expect(typeof config.bool).toBe('boolean');
            expect(config.optional).toBeUndefined();
            expect(TestSchema.shape.enum.options).toContain(config.enum);
        });
        it('should generate data that passes schema validation', () => {
            const configManager = container.get('IConfigManager');
            expect(() => configManager.get(TestSchema)).not.toThrow();
        });
    });
});
