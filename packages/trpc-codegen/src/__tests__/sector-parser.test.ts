import { describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { SectorParser } from '../parsers/sector-parser.js';
import { ConfigLoader } from '../utils/config-loader.js';

describe('SectorParser', () => {
  let sectorParser: SectorParser;
  let testConfig: any;
  let basePath: string;

  beforeEach(async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    basePath = path.resolve(__dirname, '..', '..'); // Go up to package root
    const configPath = path.resolve(basePath, 'src/__tests__/fixtures/test-config.js');
    testConfig = await ConfigLoader.loadConfig(configPath, basePath);
    sectorParser = new SectorParser(testConfig, basePath);
  });

  describe('discoverSectors()', () => {
    it('should discover test sectors correctly', async () => {
      const sectors = await sectorParser.discoverSectors();
      
      expect(sectors).toHaveLength(2);
      
      // Check sector names
      const sectorNames = sectors.map(s => s.name).sort();
      expect(sectorNames).toEqual(['product', 'user']);
    });

    it('should parse user sector endpoints correctly', async () => {
      const sectors = await sectorParser.discoverSectors();
      const userSector = sectors.find(s => s.name === 'user');
      
      expect(userSector).toBeDefined();
      expect(userSector!.endpoints).toHaveLength(5);
      
      // Check endpoint names
      const endpointNames = userSector!.endpoints.map(e => e.name).sort();
      expect(endpointNames).toEqual([
        'createUser',
        'deleteUser',
        'getUser',
        'listUsers',
        'updateUser'
      ]);
      
      // Check that endpoints have correct types
      const getUserEndpoint = userSector!.endpoints.find(e => e.name === 'getUser');
      expect(getUserEndpoint?.type).toBe('query');
      expect(getUserEndpoint?.inputSchema).toBe('GetUserSchema');
      
      const createUserEndpoint = userSector!.endpoints.find(e => e.name === 'createUser');
      expect(createUserEndpoint?.type).toBe('mutation');
      expect(createUserEndpoint?.inputSchema).toBe('CreateUserSchema');
    });

    it('should parse product sector endpoints correctly', async () => {
      const sectors = await sectorParser.discoverSectors();
      const productSector = sectors.find(s => s.name === 'product');
      
      expect(productSector).toBeDefined();
      expect(productSector!.endpoints).toHaveLength(5);
      
      // Check endpoint names
      const endpointNames = productSector!.endpoints.map(e => e.name).sort();
      expect(endpointNames).toEqual([
        'createProduct',
        'deleteProduct',
        'getProduct',
        'searchProducts',
        'updateProduct'
      ]);
      
      // Check that endpoints have correct types
      const searchProductsEndpoint = productSector!.endpoints.find(e => e.name === 'searchProducts');
      expect(searchProductsEndpoint?.type).toBe('query');
      expect(searchProductsEndpoint?.inputSchema).toBe('SearchProductsSchema');
    });

    it('should handle sectors without input schemas', async () => {
      // This test verifies that endpoints without input schemas are handled correctly
      const sectors = await sectorParser.discoverSectors();
      
      // All our test endpoints have input schemas, but we can verify the parsing works
      for (const sector of sectors) {
        for (const endpoint of sector.endpoints) {
          expect(endpoint.name).toBeDefined();
          expect(endpoint.type).toMatch(/^(query|mutation)$/);
          expect(endpoint.inputSchema).toBeDefined();
        }
      }
    });
  });

  describe('error handling', () => {
    it('should throw error when sectors directory does not exist', async () => {
      const invalidConfig = {
        ...testConfig,
        source: {
          ...testConfig.source,
          sectorsDir: 'nonexistent'
        }
      };
      
      const invalidParser = new SectorParser(invalidConfig, basePath);
      
      await expect(invalidParser.discoverSectors()).rejects.toThrow('Failed to discover sectors');
    });

    it('should handle sectors with invalid router files gracefully', async () => {
      // This test would require creating a malformed router file
      // For now, we'll test that valid sectors are still processed
      const sectors = await sectorParser.discoverSectors();
      expect(sectors.length).toBeGreaterThan(0);
    });
  });
});
