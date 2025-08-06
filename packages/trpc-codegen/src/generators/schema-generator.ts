import fs from 'fs/promises';
import path from 'path';
import type { SectorInfo } from '../types/sector.js';
import type { TRPCCodegenConfig } from '../types/config.js';

export class SchemaGenerator {
  constructor(private config: TRPCCodegenConfig, private basePath: string) {}

  async generateSchemas(sectorInfos: SectorInfo[]): Promise<string[]> {
    console.log('🔍 Extracting schemas from sector directories...');
    
    const sectorsDir = path.resolve(this.basePath, this.config.source.sectorsDir);
    const outputSchemasDir = path.resolve(this.basePath, this.config.generation.outputDir, 'schemas');
    
    // Ensure output directory exists
    await fs.mkdir(outputSchemasDir, { recursive: true });
    
    const generatedFiles: string[] = [];
    
    // Copy schema files from each sector
    for (const sector of sectorInfos) {
      const sourceSchemaFile = path.join(sectorsDir, sector.name, 'trpc', `${sector.name}.schemas.ts`);
      const targetSchemaFile = path.join(outputSchemasDir, `${sector.name}.schemas.ts`);
      
      try {
        const schemaContent = await fs.readFile(sourceSchemaFile, 'utf-8');
        await fs.writeFile(targetSchemaFile, schemaContent);
        generatedFiles.push(targetSchemaFile);
        console.log(`📋 Copying ${sector.name}.schemas.ts from ${sector.name} sector...`);
      } catch (error) {
        console.warn(`⚠️  Could not copy schema for ${sector.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Generate index file for schemas
    const indexPath = await this.generateSchemasIndex(sectorInfos, outputSchemasDir);
    generatedFiles.push(indexPath);
    
    console.log('✅ Schemas generated successfully!');
    return generatedFiles;
  }

  private async generateSchemasIndex(sectorInfos: SectorInfo[], outputSchemasDir: string): Promise<string> {
    const indexPath = path.join(outputSchemasDir, 'index.ts');
    
    // Generate re-exports for all schemas
    const exports = sectorInfos.map(sector => 
      `export * from './${sector.name}.schemas.js';`
    ).join('\n');
    
    const indexContent = `// Auto-generated - do not edit
// This file re-exports all schemas from sectors
${exports}
`;
    
    await fs.writeFile(indexPath, indexContent);
    return indexPath;
  }
}