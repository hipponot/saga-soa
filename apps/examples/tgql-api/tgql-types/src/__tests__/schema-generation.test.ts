import { describe, it, expect } from 'vitest';
import { TGQLCodegen, ConfigLoader } from '@saga-soa/tgql-codegen';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the directory of this test file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('TGQL Schema Generation', () => {
  it('should generate schema from existing sectors', async () => {
    // Load config from the project - use explicit path to ensure it works from any directory
    const configPath = resolve(__dirname, '../../tgql-codegen.config.js');
    const config = await ConfigLoader.load(configPath);
    
    // Create codegen instance
    const codegen = new TGQLCodegen(config);
    
    // Generate schema and types
    const result = await codegen.generate();
    
    // Verify files were created
    expect(result.sectorCount).toBeGreaterThan(0);
    expect(existsSync(result.schemaFile)).toBe(true);
    expect(result.typeFiles.length).toBeGreaterThan(0);
    
    // Verify schema file contains expected content
    const schemaContent = readFileSync(result.schemaFile, 'utf-8');
    expect(schemaContent).toContain('buildSchema');
    expect(schemaContent).toContain('resolverClasses');
    expect(schemaContent).toContain('UserResolver');
    expect(schemaContent).toContain('SessionResolver');
    
    // Verify type files were generated for each sector
    for (const typeFile of result.typeFiles) {
      expect(existsSync(typeFile)).toBe(true);
      const typeContent = readFileSync(typeFile, 'utf-8');
      expect(typeContent).toContain('// Auto-generated types for');
    }
  });

  it('should parse user resolver correctly', async () => {
    const configPath = resolve(__dirname, '../../tgql-codegen.config.js');
    const config = await ConfigLoader.load(configPath);
    const codegen = new TGQLCodegen(config);
    
    // This will test the parsing logic
    const result = await codegen.generate();
    
    // Check that user types were generated
    const userTypeFile = result.typeFiles.find(f => f.includes('user.types.ts'));
    expect(userTypeFile).toBeDefined();
    
    if (userTypeFile) {
      const content = readFileSync(userTypeFile, 'utf-8');
      expect(content).toContain('export interface User');
      expect(content).toContain('allUsersQuery');
      expect(content).toContain('addUserMutation');
    }
  });

  it('should parse session resolver correctly', async () => {
    const configPath = resolve(__dirname, '../../tgql-codegen.config.js');
    const config = await ConfigLoader.load(configPath);
    const codegen = new TGQLCodegen(config);
    
    const result = await codegen.generate();
    
    // Check that session types were generated  
    const sessionTypeFile = result.typeFiles.find(f => f.includes('session.types.ts'));
    expect(sessionTypeFile).toBeDefined();
    
    if (sessionTypeFile) {
      const content = readFileSync(sessionTypeFile, 'utf-8');
      expect(content).toContain('export interface Session');
    }
  });
});