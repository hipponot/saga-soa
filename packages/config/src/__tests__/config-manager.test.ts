import { z }                                    from 'zod';
import fs                                       from 'fs';
import path                                     from 'path';
import dotenv                                   from 'dotenv-flow';
import { ConfigManager, ConfigValidationError } from '../config-manager';

describe('ConfigManager', () => {
  const envPath = path.join(__dirname, '../../.env.test');
  const originalEnv = process.env;

  beforeAll(() => {
    // Write a .env.test file for the test
    fs.writeFileSync(envPath, [
      'TEST_CONFIG_STRING=hello',
      'TEST_CONFIG_NUMBER=42',
      'TEST_CONFIG_BOOL=true',
      'TEST_CONFIG_OPTIONAL=optional-value',
      'TEST_CONFIG_ENUM=option2',
    ].join('\n'));
    dotenv.config({ path: envPath, override: true });
  });

  afterAll(() => {
    fs.unlinkSync(envPath);
    process.env = originalEnv;
  });

  it('should load and validate config from .env.test using Zod schema', () => {
    const TestSchema = z.object({
      configType: z.literal('TEST_CONFIG'),
      string: z.string().min(3),
      number: z.preprocess((val) => Number(val), z.number().int().positive()),
      bool: z.preprocess((val) => val === 'true', z.boolean()),
      optional: z.string().optional(),
      enum: z.enum(['option1', 'option2', 'option3'])
    });

    type TestConfig = z.infer<typeof TestSchema>;

    // Simulate the environment variables as loaded by ConfigManager
    process.env.TEST_CONFIG_STRING = 'hello';
    process.env.TEST_CONFIG_NUMBER = '42';
    process.env.TEST_CONFIG_BOOL = 'true';
    process.env.TEST_CONFIG_OPTIONAL = 'optional-value';
    process.env.TEST_CONFIG_ENUM = 'option2';

    const config = ConfigManager.get(TestSchema);

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
    const TestSchema = z.object({
      configType: z.literal('TEST_CONFIG'),
      string: z.string().min(3),
      number: z.preprocess((val) => Number(val), z.number().int().positive()),
      bool: z.preprocess((val) => val === 'true', z.boolean()),
      optional: z.string().optional(),
      enum: z.enum(['option1', 'option2', 'option3'])
    });

    // Set an invalid value
    process.env.TEST_CONFIG_STRING = 'hi'; // too short
    process.env.TEST_CONFIG_NUMBER = '-1'; // not positive
    process.env.TEST_CONFIG_BOOL = 'notabool'; // not 'true'
    process.env.TEST_CONFIG_ENUM = 'invalid'; // not in enum

    expect(() => ConfigManager.get(TestSchema)).toThrow(ConfigValidationError);
  });
});