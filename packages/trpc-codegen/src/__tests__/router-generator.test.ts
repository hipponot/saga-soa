import { describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { RouterGenerator } from '../generators/router-generator.js';
import { ConfigLoader } from '../utils/config-loader.js';
import { SectorParser } from '../parsers/sector-parser.js';

describe('RouterGenerator', () => {
  let routerGenerator: RouterGenerator;
  let testConfig: any;
  let basePath: string;
  let sectors: any[];

  beforeEach(async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    basePath = path.resolve(__dirname, '..', '..'); // Go up to package root
    testConfig = await ConfigLoader.loadConfig('./src/__tests__/fixtures/test-config.js', basePath);
    routerGenerator = new RouterGenerator(testConfig, basePath);
    
    // Get sectors for testing
    const sectorParser = new SectorParser(testConfig, basePath);
    sectors = await sectorParser.discoverSectors();
  });

  describe('generateRouter()', () => {
    it('should generate router file with correct structure', async () => {
      const routerFile = await routerGenerator.generateRouter(sectors);
      
      expect(routerFile).toBeDefined();
      
      // Check that router file was created
      const outputDir = path.resolve(basePath, testConfig.generation.outputDir);
      const routerPath = path.join(outputDir, 'router.ts');
      
      const routerExists = await fs.access(routerPath).then(() => true).catch(() => false);
      expect(routerExists).toBe(true);
    });

    it('should import all sector schemas correctly', async () => {
      await routerGenerator.generateRouter(sectors);
      
      const outputDir = path.resolve(basePath, testConfig.generation.outputDir);
      const routerPath = path.join(outputDir, 'router.ts');
      
      const routerContent = await fs.readFile(routerPath, 'utf-8');
      
      // Check that both sector schemas are imported
      expect(routerContent).toContain("import * as userSchemas from './schemas/user-schemas.js';");
      expect(routerContent).toContain("import * as productSchemas from './schemas/product-schemas.js';");
    });

    it('should generate router with all sectors', async () => {
      await routerGenerator.generateRouter(sectors);
      
      const outputDir = path.resolve(basePath, testConfig.generation.outputDir);
      const routerPath = path.join(outputDir, 'router.ts');
      
      const routerContent = await fs.readFile(routerPath, 'utf-8');
      
      // Check that both sectors are included in the router
      expect(routerContent).toContain('user: t.router({');
      expect(routerContent).toContain('product: t.router({');
    });

    it('should include all endpoints from each sector', async () => {
      await routerGenerator.generateRouter(sectors);
      
      const outputDir = path.resolve(basePath, testConfig.generation.outputDir);
      const routerPath = path.join(outputDir, 'router.ts');
      
      const routerContent = await fs.readFile(routerPath, 'utf-8');
      
      // Check user sector endpoints
      expect(routerContent).toContain('getUser: t.procedure');
      expect(routerContent).toContain('createUser: t.procedure');
      expect(routerContent).toContain('updateUser: t.procedure');
      expect(routerContent).toContain('deleteUser: t.procedure');
      expect(routerContent).toContain('listUsers: t.procedure');
      
      // Check product sector endpoints
      expect(routerContent).toContain('getProduct: t.procedure');
      expect(routerContent).toContain('createProduct: t.procedure');
      expect(routerContent).toContain('updateProduct: t.procedure');
      expect(routerContent).toContain('deleteProduct: t.procedure');
      expect(routerContent).toContain('searchProducts: t.procedure');
    });

    it('should use correct input schemas for each endpoint', async () => {
      await routerGenerator.generateRouter(sectors);
      
      const outputDir = path.resolve(basePath, testConfig.generation.outputDir);
      const routerPath = path.join(outputDir, 'router.ts');
      
      const routerContent = await fs.readFile(routerPath, 'utf-8');
      
      // Check that input schemas are correctly referenced
      expect(routerContent).toContain('.input(userSchemas.GetUserSchema)');
      expect(routerContent).toContain('.input(userSchemas.CreateUserSchema)');
      expect(routerContent).toContain('.input(productSchemas.GetProductSchema)');
      expect(routerContent).toContain('.input(productSchemas.CreateProductSchema)');
    });

    it('should generate correct procedure types', async () => {
      await routerGenerator.generateRouter(sectors);
      
      const outputDir = path.resolve(basePath, testConfig.generation.outputDir);
      const routerPath = path.join(outputDir, 'router.ts');
      
      const routerContent = await fs.readFile(routerPath, 'utf-8');
      
      // Check that query and mutation procedures are correctly typed
      expect(routerContent).toContain('.query(');
      expect(routerContent).toContain('.mutation(');
    });

    it('should create output directory if it does not exist', async () => {
      const customConfig = {
        ...testConfig,
        generation: {
          ...testConfig.generation,
          outputDir: './__tests__/output/router-test'
        }
      };
      
      const customRouterGenerator = new RouterGenerator(customConfig, basePath);
      await customRouterGenerator.generateRouter(sectors);
      
      // Check that the new directory was created
      const newOutputDir = path.resolve(basePath, customConfig.generation.outputDir);
      const routerPath = path.join(newOutputDir, 'router.ts');
      
      const routerExists = await fs.access(routerPath).then(() => true).catch(() => false);
      expect(routerExists).toBe(true);
    });
  });

  describe('router content validation', () => {
    it('should generate valid TypeScript syntax', async () => {
      await routerGenerator.generateRouter(sectors);
      
      const outputDir = path.resolve(basePath, testConfig.generation.outputDir);
      const routerPath = path.join(outputDir, 'router.ts');
      
      const routerContent = await fs.readFile(routerPath, 'utf-8');
      
      // Check for basic TypeScript structure
      expect(routerContent).toContain('import { initTRPC } from \'@trpc/server\';');
      expect(routerContent).toContain('const t = initTRPC.create();');
      expect(routerContent).toContain('export const staticAppRouter = t.router({');
      expect(routerContent).toContain('export type AppRouter = typeof staticAppRouter;');
    });

    it('should handle sectors with no endpoints gracefully', async () => {
      const emptySector = {
        name: 'empty',
        endpoints: []
      };
      
      const result = await routerGenerator.generateRouter([emptySector]);
      expect(result).toBeDefined();
      
      // Check that router file was created even with empty sector
      const outputDir = path.resolve(basePath, testConfig.generation.outputDir);
      const routerPath = path.join(outputDir, 'router.ts');
      
      const routerExists = await fs.access(routerPath).then(() => true).catch(() => false);
      expect(routerExists).toBe(true);
    });
  });
});
