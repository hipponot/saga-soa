import fs from 'fs/promises';
import path from 'path';
import type { TRPCCodegenConfig } from '../types/config.js';
import { DEFAULT_CONFIG } from '../types/config.js';

export class ConfigLoader {
  static async loadConfig(configPath?: string, basePath?: string): Promise<TRPCCodegenConfig> {
    const searchPaths = [
      configPath,
      path.join(basePath || process.cwd(), 'codegen.config.js'),
      path.join(basePath || process.cwd(), 'trpc-codegen.config.js'),
      path.join(basePath || process.cwd(), '.trpc-codegen.js'),
    ].filter(Boolean) as string[];

    for (const searchPath of searchPaths) {
      try {
        await fs.access(searchPath);
        
        // Dynamic import for ESM/CJS compatibility
        const config = await import(path.resolve(searchPath));
        const loadedConfig = config.default || config;
        
        // Merge with defaults
        return this.mergeWithDefaults(loadedConfig);
      } catch (error) {
        // Continue searching if file not found
        if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
          throw new Error(`Error loading config from ${searchPath}: ${error.message}`);
        }
      }
    }

    return DEFAULT_CONFIG;
  }

  private static mergeWithDefaults(userConfig: Partial<TRPCCodegenConfig>): TRPCCodegenConfig {
    return {
      source: {
        ...DEFAULT_CONFIG.source,
        ...userConfig.source
      },
      generation: {
        ...DEFAULT_CONFIG.generation,
        ...userConfig.generation
      },
      parsing: {
        ...DEFAULT_CONFIG.parsing,
        ...userConfig.parsing
      },
      zod2ts: {
        ...DEFAULT_CONFIG.zod2ts,
        ...userConfig.zod2ts
      }
    };
  }

  static validateConfig(config: TRPCCodegenConfig): void {
    if (!config.source.sectorsDir) {
      throw new Error('source.sectorsDir is required');
    }
    if (!config.generation.outputDir) {
      throw new Error('generation.outputDir is required');
    }
    if (!config.generation.packageName) {
      throw new Error('generation.packageName is required');
    }
    if (!config.generation.routerName) {
      throw new Error('generation.routerName is required');
    }
  }

  static displayConfig(config: TRPCCodegenConfig, basePath: string, debug: boolean = false): void {
    console.log('📋 Configuration:');
    console.log(`  Source:`);
    console.log(`    Sectors directory: ${config.source.sectorsDir}`);
    console.log(`    Router pattern: ${config.source.routerPattern}`);
    console.log(`    Schema pattern: ${config.source.schemaPattern}`);
    
    console.log(`  Generation:`);
    console.log(`    Output directory: ${config.generation.outputDir}`);
    console.log(`    Package name: ${config.generation.packageName}`);
    console.log(`    Router name: ${config.generation.routerName}`);
    
    console.log(`  Parsing:`);
    console.log(`    Endpoint pattern: ${config.parsing.endpointPattern}`);
    console.log(`    Router method pattern: ${config.parsing.routerMethodPattern}`);
    
    console.log(`  Zod2TS:`);
    console.log(`    Enabled: ${config.zod2ts.enabled}`);
    if (config.zod2ts.enabled) {
      console.log(`    Output directory: ${config.zod2ts.outputDir}`);
    }
    
    if (debug) {
      console.log(`  Base path: ${basePath}`);
      console.log(`  Resolved paths:`);
      console.log(`    Sectors: ${path.resolve(basePath, config.source.sectorsDir)}`);
      console.log(`    Output: ${path.resolve(basePath, config.generation.outputDir)}`);
      if (config.zod2ts.enabled) {
        console.log(`    Types: ${path.resolve(basePath, config.zod2ts.outputDir)}`);
      }
    }
  }
}