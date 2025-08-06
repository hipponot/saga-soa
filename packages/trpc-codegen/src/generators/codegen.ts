import path from 'path';
import type { TRPCCodegenConfig } from '../types/config.js';
import type { GenerationResult } from '../types/sector.js';
import { SectorParser } from '../parsers/sector-parser.js';
import { RouterGenerator } from './router-generator.js';
import { SchemaGenerator } from './schema-generator.js';

export class TRPCCodegen {
  private sectorParser: SectorParser;
  private routerGenerator: RouterGenerator;
  private schemaGenerator: SchemaGenerator;

  constructor(private config: TRPCCodegenConfig, private basePath: string) {
    this.sectorParser = new SectorParser(config, basePath);
    this.routerGenerator = new RouterGenerator(config, basePath);
    this.schemaGenerator = new SchemaGenerator(config, basePath);
  }

  async generate(): Promise<GenerationResult> {
    console.log('🚀 Starting tRPC code generation...');
    
    const errors: string[] = [];
    const generatedFiles: string[] = [];

    try {
      // Step 1: Discover and parse sectors
      console.log('🔍 Analyzing sector routers...');
      const sectors = await this.sectorParser.discoverSectors();

      // Step 2: Generate schemas
      try {
        const schemaFiles = await this.schemaGenerator.generateSchemas(sectors);
        generatedFiles.push(...schemaFiles);
      } catch (error) {
        const errorMsg = `Schema generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }

      // Step 3: Generate router
      try {
        const routerFile = await this.routerGenerator.generateRouter(sectors);
        generatedFiles.push(routerFile);
      } catch (error) {
        const errorMsg = `Router generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }

      // Step 4: Generate package index
      try {
        const indexFile = await this.generatePackageIndex();
        generatedFiles.push(indexFile);
      } catch (error) {
        const errorMsg = `Index generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }

      if (errors.length === 0) {
        console.log('✅ tRPC code generation completed successfully!');
        console.log(`   - Generated ${generatedFiles.length} files`);
        console.log(`   - Processed ${sectors.length} sectors`);
        console.log(`   - Total endpoints: ${sectors.reduce((sum, s) => sum + s.endpoints.length, 0)}`);
      } else {
        console.log(`⚠️  tRPC code generation completed with ${errors.length} errors`);
      }

      return {
        sectors,
        generatedFiles,
        errors
      };

    } catch (error) {
      const errorMsg = `Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`❌ ${errorMsg}`);
      return {
        sectors: [],
        generatedFiles,
        errors: [errorMsg]
      };
    }
  }

  private async generatePackageIndex(): Promise<string> {
    const { writeFile, mkdir } = await import('fs/promises');
    const outputPath = path.resolve(this.basePath, this.config.generation.outputDir);
    const indexPath = path.join(outputPath, 'index.ts');

    await mkdir(outputPath, { recursive: true });

    const indexContent = `// Auto-generated - do not edit
// Main exports for ${this.config.generation.packageName}
export * from './router.js';
export * from './schemas/index.js';
`;

    await writeFile(indexPath, indexContent);
    return indexPath;
  }
}