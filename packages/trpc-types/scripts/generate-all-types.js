#!/usr/bin/env node

import { execSync } from 'child_process';
import { glob } from 'glob';
import path from 'path';

const TRPC_API_PATH = '../../apps/examples/trpc-api/src/sectors';
const OUTPUT_DIR = 'src/generated';

async function generateAllTypes() {
  try {
    console.log('🔍 Finding tRPC type files...');
    
    // Find all .types.ts files in the tRPC API
    const typeFiles = await glob(`${TRPC_API_PATH}/*/trpc/*.types.ts`, { cwd: process.cwd() });
    
    if (typeFiles.length === 0) {
      console.log('⚠️  No type files found');
      return;
    }
    
    console.log(`📁 Found ${typeFiles.length} type file(s):`);
    typeFiles.forEach(file => console.log(`  - ${file}`));
    
    // Generate types for each file
    for (const typeFile of typeFiles) {
      console.log(`\n🔄 Generating types from ${typeFile}...`);
      
      const command = `../../build-tools/zod2ts/bin/zod2ts --zod-path "${typeFile}" --output-dir ${OUTPUT_DIR}`;
      
      try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ Generated types from ${typeFile}`);
      } catch (error) {
        console.error(`❌ Failed to generate types from ${typeFile}:`, error.message);
      }
    }
    
    console.log('\n✅ Type generation complete!');
    
  } catch (error) {
    console.error('❌ Error generating types:', error);
    process.exit(1);
  }
}

generateAllTypes(); 