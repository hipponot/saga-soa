import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { FileNotFoundError } from './types.js';

export function ensureDirectoryExists(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function validateFileExists(filePath: string): void {
  const resolvedPath = resolve(filePath);
  if (!existsSync(resolvedPath)) {
    throw new FileNotFoundError(resolvedPath);
  }
}

export function writeTypeFile(outputPath: string, typeName: string, typeDefinition: string): void {
  ensureDirectoryExists(outputPath);
  
  // The typeDefinition already contains the full content, so just write it directly
  writeFileSync(outputPath, typeDefinition, 'utf-8');
}

export function generateOutputPath(outputDir: string, typeName: string): string {
  return resolve(outputDir, `${typeName}.ts`);
} 