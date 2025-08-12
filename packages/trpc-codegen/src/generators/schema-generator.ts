import fs from 'fs/promises';
import path from 'path';
import type { SectorInfo } from '../types/sector.js';
import type { TRPCCodegenConfig } from '../types/config.js';

export class SchemaGenerator {
  constructor(private config: TRPCCodegenConfig, private basePath: string) {}

  async generateSchemas(sectorInfos: SectorInfo[]): Promise<string[]> {
    
    const sectorsDir = path.resolve(this.basePath, this.config.source.sectorsDir);
    const outputSchemasDir = path.resolve(this.basePath, this.config.generation.outputDir, 'schemas');
    
    // Ensure output directory exists
    await fs.mkdir(outputSchemasDir, { recursive: true });
    
    const generatedFiles: string[] = [];
    
          // Copy schema files from each sector
      for (const sector of sectorInfos) {
        // Use the configured schema pattern to find the schema file
        const schemaPattern = this.config.source.schemaPattern
          .replace(/\*/g, sector.name);
        const sourceSchemaFile = path.join(sectorsDir, schemaPattern);
        const targetSchemaFile = path.join(outputSchemasDir, `${sector.name}-schemas.ts`);
        
        try {
          const schemaContent = await fs.readFile(sourceSchemaFile, 'utf-8');
          await fs.writeFile(targetSchemaFile, schemaContent);
          generatedFiles.push(targetSchemaFile);
        } catch (error) {
        }
      }
    
    // Generate index file for schemas
    const indexPath = await this.generateSchemasIndex(sectorInfos, outputSchemasDir);
    generatedFiles.push(indexPath);
    
    return generatedFiles;
  }

  private async generateSchemasIndex(sectorInfos: SectorInfo[], outputSchemasDir: string): Promise<string> {
    const indexPath = path.join(outputSchemasDir, 'index.ts');
    
    // Generate re-exports for all schemas
    const exports = sectorInfos.map(sector => 
      `export * from './${sector.name}-schemas.js';`
    ).join('\n');
    
    const indexContent = `// Auto-generated - do not edit
// This file re-exports all schemas from sectors
${exports}
`;
    
    await fs.writeFile(indexPath, indexContent);
    return indexPath;
  }
}