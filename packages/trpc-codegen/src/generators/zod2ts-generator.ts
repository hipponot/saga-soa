import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import type { TRPCCodegenConfig } from '../types/config.js';
import type { SectorInfo } from '../types/sector.js';

export class Zod2tsGenerator {
  constructor(private config: TRPCCodegenConfig, private basePath: string) {}

  async generateTypes(sectorInfos: SectorInfo[]): Promise<string[]> {
    if (!this.config.zod2ts.enabled) {
      console.log('⏭️  Zod2ts generation skipped (disabled in config)');
      return [];
    }

    console.log('🔧 Generating TypeScript types from Zod schemas...');
    
    const outputPath = path.resolve(this.basePath, this.config.generation.outputDir);
    const typesOutputDir = path.join(outputPath, this.config.zod2ts.outputDir);
    
    // Ensure types output directory exists
    await fs.mkdir(typesOutputDir, { recursive: true });
    
    const generatedFiles: string[] = [];
    
    try {
      // Process each sector's schema file
      for (const sector of sectorInfos) {
        const schemaFilePath = path.join(outputPath, 'schemas', `${sector.name}-schemas.ts`);
        
        // Check if schema file exists
        try {
          await fs.access(schemaFilePath);
        } catch (error) {
          console.warn(`⚠️  Schema file not found for ${sector.name}: ${schemaFilePath}`);
          continue;
        }
        
        const sectorTypesDir = path.join(typesOutputDir, sector.name);
        await fs.mkdir(sectorTypesDir, { recursive: true });
        
        try {
          // Run zod2ts for this sector's schema file
          const result = await this.runZod2ts(schemaFilePath, sectorTypesDir);
          if (result.success && result.files) {
            generatedFiles.push(...result.files);
            console.log(`📋 Generated types for ${sector.name} sector`);
          } else {
            console.warn(`⚠️  Failed to generate types for ${sector.name}: ${result.error}`);
          }
        } catch (error) {
          console.warn(`⚠️  Error generating types for ${sector.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      // Generate types index file
      const typesIndexPath = await this.generateTypesIndex(sectorInfos, typesOutputDir);
      generatedFiles.push(typesIndexPath);
      
      console.log('✅ TypeScript types generated successfully!');
      return generatedFiles;
      
    } catch (error) {
      const errorMsg = `TypeScript types generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`❌ ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }

  private async runZod2ts(zodPath: string, outputDir: string): Promise<{ success: boolean; files?: string[]; error?: string }> {
    return new Promise(async (resolve) => {
      // Try to find zod2ts in the project - look for it relative to the project root
      // The basePath might be apps/examples/trpc-api, so we need to go up to the project root
      let zod2tsPath = path.resolve(this.basePath, '../../build-tools/zod2ts/bin/zod2ts');
      
      // If that doesn't exist, try alternative paths
      try {
        await fs.access(zod2tsPath);
      } catch {
        try {
          zod2tsPath = path.resolve(this.basePath, '../../../build-tools/zod2ts/bin/zod2ts');
          await fs.access(zod2tsPath);
        } catch {
          try {
            zod2tsPath = path.resolve(this.basePath, '../../../../build-tools/zod2ts/bin/zod2ts');
            await fs.access(zod2tsPath);
          } catch {
            resolve({ 
              success: false, 
              error: `Could not find zod2ts binary. Tried paths: ${path.resolve(this.basePath, '../../build-tools/zod2ts/bin/zod2ts')}, ${path.resolve(this.basePath, '../../../build-tools/zod2ts/bin/zod2ts')}, ${path.resolve(this.basePath, '../../../../build-tools/zod2ts/bin/zod2ts')}` 
            });
            return;
          }
        }
      }
      
      const args = [
        '--zod-path', zodPath,
        '--output-dir', outputDir
      ];
      
      const child = spawn('node', [zod2tsPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: this.basePath
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', async (code) => {
        if (code === 0) {
          try {
            // List generated files
            const files = await this.listGeneratedFiles(outputDir);
            resolve({ success: true, files });
          } catch (error) {
            resolve({ success: true, files: [] });
          }
        } else {
          resolve({ 
            success: false, 
            error: stderr || `Process exited with code ${code}` 
          });
        }
      });
      
      child.on('error', (error) => {
        resolve({ 
          success: false, 
          error: `Failed to start zod2ts: ${error.message}` 
        });
      });
    });
  }

  private async listGeneratedFiles(directory: string): Promise<string[]> {
    try {
      const files = await fs.readdir(directory, { recursive: true });
      return files
        .filter(file => typeof file === 'string' && file.endsWith('.ts'))
        .map(file => path.join(directory, file));
    } catch (error) {
      return [];
    }
  }

  private async generateTypesIndex(sectorInfos: SectorInfo[], typesOutputDir: string): Promise<string> {
    const indexPath = path.join(typesOutputDir, 'index.ts');
    
    // Generate re-exports for all sector types
    const exports = sectorInfos.map(sector => 
      `export * from './${sector.name}/index.js';`
    ).join('\n');
    
    const indexContent = `// Auto-generated - do not edit
// This file re-exports all TypeScript types from sectors
${exports}
`;
    
    await fs.writeFile(indexPath, indexContent);
    return indexPath;
  }
}
