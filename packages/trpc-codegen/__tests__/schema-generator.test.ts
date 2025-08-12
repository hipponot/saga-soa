import { describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { SchemaGenerator } from '../src/generators/schema-generator.js';
import { ConfigLoader } from '../src/utils/config-loader.js';
import { SectorParser } from '../src/parsers/sector-parser.js';

describe('SchemaGenerator', () => {
  let schemaGenerator: SchemaGenerator;
  let testConfig: any;
  let basePath: string;
  let sectors: any[];

  beforeEach(async () => {
    basePath = path.resolve(__dirname);
    testConfig = await ConfigLoader.loadConfig('./__tests__/fixtures/test-config.js', basePath);
    schemaGenerator = new SchemaGenerator(testConfig, basePath);
    
    // Get sectors for testing
    const sectorParser = new SectorParser(testConfig, basePath);
    sectors = await sectorParser.discoverSectors();
  });

  describe('generateSchemas()', () => {
    it('should copy schema files from test sectors', async () => {
      const generatedFiles = await schemaGenerator.generateSchemas(sectors);
      
      expect(generatedFiles.length).toBeGreaterThan(0);
      
      // Check that schema files were copied
      const outputDir = path.resolve(basePath, testConfig.generation.outputDir);
      const schemasDir = path.join(outputDir, 'schemas');
      
      // Verify schemas directory exists
      const schemasDirExists = await fs.access(schemasDir).then(() => true).catch(() => false);
      expect(schemasDirExists).toBe(true);
      
      // Check that both schema files were copied
      const userSchemaPath = path.join(schemasDir, 'user-schemas.ts');
      const productSchemaPath = path.join(schemasDir, 'product-schemas.ts');
      
      const userSchemaExists = await fs.access(userSchemaPath).then(() => true).catch(() => false);
      const productSchemaExists = await fs.access(productSchemaPath).then(() => true).catch(() => false);
      
      expect(userSchemaExists).toBe(true);
      expect(productSchemaExists).toBe(true);
    });

    it('should generate schemas index file', async () => {
      await schemaGenerator.generateSchemas(sectors);
      
      const outputDir = path.resolve(basePath, testConfig.generation.outputDir);
      const schemasIndexPath = path.join(outputDir, 'schemas/index.ts');
      
      // Check that index file exists
      const indexExists = await fs.access(schemasIndexPath).then(() => true).catch(() => false);
      expect(indexExists).toBe(true);
      
      // Check index file content
      const indexContent = await fs.readFile(schemasIndexPath, 'utf-8');
      expect(indexContent).toContain("export * from './user-schemas.js';");
      expect(indexContent).toContain("export * from './product-schemas.js';");
    });

    it('should preserve schema file content', async () => {
      await schemaGenerator.generateSchemas(sectors);
      
      const outputDir = path.resolve(basePath, testConfig.generation.outputDir);
      const userSchemaPath = path.join(outputDir, 'schemas/user-schemas.ts');
      
      // Check that the copied schema file contains expected content
      const userSchemaContent = await fs.readFile(userSchemaPath, 'utf-8');
      expect(userSchemaContent).toContain('CreateUserSchema');
      expect(userSchemaContent).toContain('UpdateUserSchema');
      expect(userSchemaContent).toContain('GetUserSchema');
      expect(userSchemaContent).toContain('DeleteUserSchema');
      expect(userSchemaContent).toContain('ListUsersSchema');
    });

    it('should handle schema files with different patterns', async () => {
      // Test with custom schema pattern
      const customConfig = {
        ...testConfig,
        source: {
          ...testConfig.source,
          schemaPattern: '*/trpc/schema/*-schemas.ts'
        }
      };
      
      const customSchemaGenerator = new SchemaGenerator(customConfig, basePath);
      const generatedFiles = await customSchemaGenerator.generateSchemas(sectors);
      
      expect(generatedFiles.length).toBeGreaterThan(0);
      
      // Verify files were generated
      const outputDir = path.resolve(basePath, testConfig.generation.outputDir);
      const schemasDir = path.join(outputDir, 'schemas');
      
      const userSchemaPath = path.join(schemasDir, 'user-schemas.ts');
      const userSchemaExists = await fs.access(userSchemaPath).then(() => true).catch(() => false);
      expect(userSchemaExists).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle missing schema files gracefully', async () => {
      // Create a sector without a schema file
      const sectorWithoutSchema = {
        name: 'empty',
        endpoints: []
      };
      
      const result = await schemaGenerator.generateSchemas([sectorWithoutSchema]);
      
      // Should still generate the index file
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create output directory if it does not exist', async () => {
      const customConfig = {
        ...testConfig,
        generation: {
          ...testConfig.generation,
          outputDir: './__tests__/output/new-directory'
        }
      };
      
      const customSchemaGenerator = new SchemaGenerator(customConfig, basePath);
      await customSchemaGenerator.generateSchemas(sectors);
      
      // Check that the new directory was created
      const newOutputDir = path.resolve(basePath, customConfig.generation.outputDir);
      const schemasDir = path.join(newOutputDir, 'schemas');
      
      const schemasDirExists = await fs.access(schemasDir).then(() => true).catch(() => false);
      expect(schemasDirExists).toBe(true);
    });
  });
});
