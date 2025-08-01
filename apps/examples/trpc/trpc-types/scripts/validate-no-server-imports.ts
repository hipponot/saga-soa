#!/usr/bin/env tsx

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const FORBIDDEN_IMPORTS = [
  '@saga-soa/trpc-api',
  '@saga-soa/db',
  '@saga-soa/core-api',
  '@saga-soa/logger',
  '@saga-soa/config'
];

function scanDirectory(dir: string): string[] {
  const files: string[] = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
      files.push(...scanDirectory(fullPath));
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.js'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function validateFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    for (const forbiddenImport of FORBIDDEN_IMPORTS) {
      if (content.includes(forbiddenImport)) {
        console.error(`❌ Server import detected in ${filePath}: ${forbiddenImport}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🔍 Validating no server imports in trpc-types package...');
  
  const srcDir = join(process.cwd(), 'src');
  const files = scanDirectory(srcDir);
  
  let hasErrors = false;
  
  for (const file of files) {
    if (!validateFile(file)) {
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.error('\n❌ Validation failed: Server imports detected!');
    console.error('This package should only contain type definitions with no server dependencies.');
    process.exit(1);
  } else {
    console.log('✅ Validation passed: No server imports detected');
  }
}

main(); 