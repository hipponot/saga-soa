import { describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { fileURLToPath } from 'url';
import { TRPCCodegen } from '../src/generators/codegen.js';
import { ConfigLoader } from '../src/utils/config-loader.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('TRPCCodegen', () => {
  let codegen: TRPCCodegen;
  let testConfig: any;
  let basePath: string;
  let outputDir: string;

  beforeEach(async () => {
    basePath = path.resolve(__dirname);
    
    // Create unique temporary directory for this test
    outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'trpc-codegen-test-'));
    
    // Load base config and override output directory
    const configPath = path.join(__dirname, 'fixtures', 'test-config.js');
    const baseConfig = await ConfigLoader.loadConfig(configPath, basePath);
    testConfig = {
      ...baseConfig,
      generation: {
        ...baseConfig.generation,
        outputDir: path.relative(basePath, outputDir)
      }
    };
    
    codegen = new TRPCCodegen(testConfig, basePath);
  });

  describe('generate()', () => {
    it('should discover and process test sectors correctly', async () => {
      const result = await codegen.generate();
      
      expect(result.errors).toHaveLength(0);
      expect(result.sectors).toHaveLength(2);
      expect(result.generatedFiles.length).toBeGreaterThan(0);
      
      // Check that both sectors were discovered
      const sectorNames = result.sectors.map(s => s.name).sort();
      expect(sectorNames).toEqual(['product', 'user']);
    });

    it('should generate the expected number of endpoints', async () => {
      const result = await codegen.generate();
      
      // User sector: 5 endpoints (getUser, createUser, updateUser, deleteUser, listUsers)
      // Product sector: 5 endpoints (getProduct, createProduct, updateProduct, deleteProduct, searchProducts)
      const totalEndpoints = result.sectors.reduce((sum, s) => sum + s.endpoints.length, 0);
      expect(totalEndpoints).toBe(10);
    });

    it('should generate files in the correct output directory', async () => {
      const result = await codegen.generate();
      
      // Check that output directory exists
      const outputExists = await fs.access(outputDir).then(() => true).catch(() => false);
      expect(outputExists).toBe(true);
      
      // Check that expected files were generated
      const expectedFiles = [
        'index.ts',
        'router.ts',
        'schemas/index.ts',
        'schemas/user-schemas.ts',
        'schemas/product-schemas.ts'
      ];
      
      // Add type files only if zod2ts is enabled
      if (testConfig.zod2ts?.enabled) {
        expectedFiles.push(
          'types/index.ts',
          'types/user/index.ts',
          'types/product/index.ts'
        );
      }
      
      for (const file of expectedFiles) {
        const filePath = path.join(outputDir, file);
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      }
    });

    it('should generate router with correct structure', async () => {
      await codegen.generate();
      
      const routerPath = path.join(outputDir, 'router.ts');
      const routerContent = await fs.readFile(routerPath, 'utf-8');
      
      // Check that router imports both sector schemas
      expect(routerContent).toContain("import * as userSchemas from './schemas/user-schemas.js';");
      expect(routerContent).toContain("import * as productSchemas from './schemas/product-schemas.js';");
      
      // Check that router has both sectors
      expect(routerContent).toContain('user: t.router({');
      expect(routerContent).toContain('product: t.router({');
      
      // Check that endpoints are included
      expect(routerContent).toContain('getUser: t.procedure');
      expect(routerContent).toContain('createProduct: t.procedure');
    });

    it('should generate schemas index with correct exports', async () => {
      await codegen.generate();
      
      const schemasIndexPath = path.join(outputDir, 'schemas/index.ts');
      const schemasIndexContent = await fs.readFile(schemasIndexPath, 'utf-8');
      
      expect(schemasIndexContent).toContain("export * from './user-schemas.js';");
      expect(schemasIndexContent).toContain("export * from './product-schemas.js';");
    });

    it('should generate types index with correct exports', async () => {
      await codegen.generate();
      
      // Only check types if zod2ts is enabled
      if (testConfig.zod2ts?.enabled) {
        const typesIndexPath = path.join(outputDir, 'types/index.ts');
        const typesIndexContent = await fs.readFile(typesIndexPath, 'utf-8');
        
        expect(typesIndexContent).toContain("export * from './user/index.js';");
        expect(typesIndexContent).toContain("export * from './product/index.js';");
      } else {
        // Skip this test when zod2ts is disabled
        expect(true).toBe(true);
      }
    });

    it('should generate main index with correct exports', async () => {
      await codegen.generate();
      
      const mainIndexPath = path.join(outputDir, 'index.ts');
      const mainIndexContent = await fs.readFile(mainIndexPath, 'utf-8');
      
      expect(mainIndexContent).toContain("export * from './router.js';");
      expect(mainIndexContent).toContain("export * from './schemas/index.js';");
      
      // Only check types export if zod2ts is enabled
      if (testConfig.zod2ts?.enabled) {
        expect(mainIndexContent).toContain("export * from './types/index.js';");
      }
    });
  });

  describe('error handling', () => {
    it('should handle missing sectors gracefully', async () => {
      const invalidConfig = {
        ...testConfig,
        source: {
          ...testConfig.source,
          sectorsDir: 'nonexistent'
        }
      };
      
      const invalidCodegen = new TRPCCodegen(invalidConfig, basePath);
      const result = await invalidCodegen.generate();
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.sectors).toHaveLength(0);
    });
  });

});
