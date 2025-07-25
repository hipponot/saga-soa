import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SchemaExtractor } from '../src/schema-extractor.js';
import { ZodSchemaLoader } from '../src/zod-loader.js';
import { TypeGenerator } from '../src/type-generator.js';
import { NoSchemasFoundError, InvalidSchemaError } from '../src/types.js';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

describe('SchemaExtractor', () => {
  let extractor: SchemaExtractor;
  const testOutputDir = resolve(__dirname, 'test-output');

  beforeEach(() => {
    const zodLoader = new ZodSchemaLoader();
    const typeGenerator = new TypeGenerator();
    extractor = new SchemaExtractor(zodLoader, typeGenerator);
    // Clean up test output directory
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test output directory
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  it('should extract schemas from a file with multiple schemas', async () => {
    const fixturePath = resolve(__dirname, 'fixtures/user-schema.ts');
    const result = await extractor.extractSchemas(fixturePath, testOutputDir);

    expect(result.schemas).toHaveLength(2);
    expect(result.schemas[0]?.name).toBe('UserSchema');
    expect(result.schemas[0]?.typeName).toBe('User');
    expect(result.schemas[1]?.name).toBe('UserProfileSchema');
    expect(result.schemas[1]?.typeName).toBe('UserProfile');

    expect(result.outputFiles).toHaveLength(2);
    expect(result.outputFiles[0]).toContain('User.ts');
    expect(result.outputFiles[1]).toContain('UserProfile.ts');
  });

  it('should extract complex schemas correctly', async () => {
    const fixturePath = resolve(__dirname, 'fixtures/complex-schema.ts');
    const result = await extractor.extractSchemas(fixturePath, testOutputDir);

    expect(result.schemas).toHaveLength(1);
    expect(result.schemas[0]?.name).toBe('ComplexSchema');
    expect(result.schemas[0]?.typeName).toBe('Complex');

    expect(result.outputFiles).toHaveLength(1);
    expect(result.outputFiles[0]).toContain('Complex.ts');
  });

  it('should throw NoSchemasFoundError when no schemas are found', async () => {
    const fixturePath = resolve(__dirname, 'fixtures/empty-file.ts');
    
    await expect(async () => {
      await extractor.extractSchemas(fixturePath, testOutputDir);
    }).rejects.toThrow(NoSchemasFoundError);
  });

  it('should generate valid TypeScript type files', async () => {
    const fixturePath = resolve(__dirname, 'fixtures/user-schema.ts');
    const result = await extractor.extractSchemas(fixturePath, testOutputDir);

    // Check that output files exist
    for (const file of result.outputFiles) {
      expect(existsSync(file)).toBe(true);
    }
  });

  it('should handle schemas that do not end with Schema', async () => {
    const fixturePath = resolve(__dirname, 'fixtures/no-schemas.ts');
    const result = await extractor.extractSchemas(fixturePath, testOutputDir);

    expect(result.schemas).toHaveLength(2);
    expect(result.schemas[0]?.name).toBe('user');
    expect(result.schemas[0]?.typeName).toBe('user');
    expect(result.schemas[1]?.name).toBe('profile');
    expect(result.schemas[1]?.typeName).toBe('profile');

    expect(result.outputFiles).toHaveLength(2);
    expect(result.outputFiles[0]).toContain('user.ts');
    expect(result.outputFiles[1]).toContain('profile.ts');
  });
}); 