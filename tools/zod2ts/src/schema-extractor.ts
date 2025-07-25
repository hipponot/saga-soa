import { resolve } from 'node:path';
import { z } from 'zod';
import { SchemaInfo, ExtractionResult, NoSchemasFoundError, InvalidSchemaError } from './types.js';
import { writeTypeFile, generateOutputPath } from './file-utils.js';
import { ZodSchemaLoader } from './zod-loader.js';
import { TypeGenerator } from './type-generator.js';

export class SchemaExtractor {
  constructor(
    private zodLoader: ZodSchemaLoader,
    private typeGenerator: TypeGenerator
  ) {}

  public async extractSchemas(zodPath: string, outputDir: string): Promise<ExtractionResult> {
    const resolvedPath = resolve(zodPath);
    
    // Load all Zod schemas from the file
    const zodSchemas = await this.zodLoader.loadSchemasFromFile(resolvedPath);
    
    // Filter schemas that end with 'Schema'
    const schemaEntries = Array.from(zodSchemas.entries()).filter(([name]) => 
      name.endsWith('Schema')
    );

    if (schemaEntries.length === 0) {
      throw new NoSchemasFoundError(zodPath);
    }

    const schemas: SchemaInfo[] = [];
    const outputFiles: string[] = [];

    for (const [schemaName, zodSchema] of schemaEntries) {
      const typeName = schemaName.replace(/Schema$/, '');
      
      try {
        // Generate TypeScript type using the type generator
        const typeDefinition = this.typeGenerator.generateType(zodSchema, typeName);
        
        // Write the type to a file
        const outputPath = generateOutputPath(outputDir, typeName);
        writeTypeFile(outputPath, typeName, typeDefinition);
        
        schemas.push({
          name: schemaName,
          typeName,
          resolvedType: typeDefinition,
        });
        outputFiles.push(outputPath);

      } catch (error) {
        console.error(`Error processing schema ${schemaName}:`, error);
        throw new InvalidSchemaError(schemaName);
      }
    }

    return { schemas, outputFiles };
  }
} 