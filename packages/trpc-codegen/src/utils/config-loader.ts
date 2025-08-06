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
        console.log(`📋 Loading config from: ${searchPath}`);
        
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

    console.log('📋 No config file found, using defaults');
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
}