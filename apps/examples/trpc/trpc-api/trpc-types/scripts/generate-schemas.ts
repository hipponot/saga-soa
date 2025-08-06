#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRPC_API_DIR = path.resolve(__dirname, '../../src/sectors');
const GENERATED_SCHEMAS_DIR = path.resolve(__dirname, '../generated/schemas');

async function generateSchemas() {
  try {
    console.log('🔍 Extracting schemas from sector directories...');
    
    // Ensure generated directory exists
    await fs.mkdir(GENERATED_SCHEMAS_DIR, { recursive: true });
    
    // Find all schema files in sector directories
    const sectors = await fs.readdir(TRPC_API_DIR);
    
    for (const sector of sectors) {
      const sectorTrpcDir = path.join(TRPC_API_DIR, sector, 'trpc');
      
      try {
        const files = await fs.readdir(sectorTrpcDir);
        
        for (const file of files) {
          if (file.endsWith('.schemas.ts')) {
            const sourcePath = path.join(sectorTrpcDir, file);
            const targetPath = path.join(GENERATED_SCHEMAS_DIR, file);
            
            console.log(`📋 Copying ${file} from ${sector} sector...`);
            await fs.copyFile(sourcePath, targetPath);
          }
        }
      } catch (error) {
        // Skip if sector doesn't have trpc directory
        continue;
      }
    }
    
    // Create index file for generated schemas
    const indexContent = `// Auto-generated - do not edit
export * from './project.schemas.js';
export * from './run.schemas.js';
`;
    
    await fs.writeFile(path.join(GENERATED_SCHEMAS_DIR, 'index.ts'), indexContent);
    
    console.log('✅ Schemas generated successfully!');
  } catch (error) {
    console.error('❌ Error generating schemas:', error);
    process.exit(1);
  }
}

generateSchemas(); 