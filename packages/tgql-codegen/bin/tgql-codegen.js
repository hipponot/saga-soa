#!/usr/bin/env node

import 'reflect-metadata';
import { Command } from 'commander';
import { TGQLCodegen, ConfigLoader } from '../dist/index.js';

const program = new Command();

program
  .name('tgql-codegen')
  .description('TypeGraphQL code generation CLI for saga-soa')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate TypeScript types from GraphQL resolvers')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('--include-sdl', 'Include SDL generation')
  .option('--sdl-only', 'Generate only SDL files (skip types)')
  .action(async (options) => {
    try {
      const config = await ConfigLoader.load(options.config);
      
      // Update config based on CLI options
      if (options.includeSdl) {
        config.sdl.enabled = true;
      }
      
      const codegen = new TGQLCodegen(config);
      
      if (options.sdlOnly) {
        await codegen.generateSDLOnly();
      } else {
        await codegen.generate();
      }
    } catch (error) {
      console.error('Generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('emit-sdl')
  .description('Generate GraphQL SDL files from TypeGraphQL resolvers')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-o, --output <dir>', 'Output directory for SDL files')
  .option('--by-sector', 'Emit separate SDL files for each sector')
  .option('--unified', 'Emit single unified SDL file')
  .action(async (options) => {
    try {
      const config = await ConfigLoader.load(options.config);
      
      // Update config based on CLI options
      config.sdl.enabled = true;
      
      if (options.output) {
        config.sdl.outputDir = options.output;
      }
      
      if (options.bySector) {
        config.sdl.emitBySector = true;
      } else if (options.unified) {
        config.sdl.emitBySector = false;
      }
      
      const codegen = new TGQLCodegen(config);
      await codegen.generateSDLOnly();
    } catch (error) {
      console.error('SDL generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('watch')
  .description('Watch for file changes and regenerate types')
  .option('-c, --config <path>', 'Path to configuration file')
  .action(async (options) => {
    try {
      const config = await ConfigLoader.load(options.config);
      const codegen = new TGQLCodegen(config);
      await codegen.watch();
    } catch (error) {
      console.error('Watch mode failed:', error);
      process.exit(1);
    }
  });

program.parse();