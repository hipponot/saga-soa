import { z } from 'zod';
import { resolve } from 'node:path';
import { SchemaLoadingError } from './types.js';

export class ZodSchemaLoader {
  async loadSchemasFromFile(filePath: string): Promise<Map<string, z.ZodSchema>> {
    try {
      const resolvedPath = resolve(filePath);
      
      // Dynamic import with proper error handling
      const module = await import(resolvedPath);
      const schemas = new Map<string, z.ZodSchema>();
      
      // Extract Zod schemas from module exports
      for (const [name, export_] of Object.entries(module)) {
        if (this.isZodSchema(export_)) {
          schemas.set(name, export_);
        }
      }
      
      return schemas;
    } catch (error) {
      throw new SchemaLoadingError(`Failed to load schemas from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private isZodSchema(value: any): value is z.ZodSchema {
    return value && typeof value === 'object' && '_def' in value;
  }
} 