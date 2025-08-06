#!/usr/bin/env node

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
  .action(async (options) => {
    try {
      const config = await ConfigLoader.load(options.config);
      const codegen = new TGQLCodegen(config);
      await codegen.generate();
    } catch (error) {
      console.error('Generation failed:', error);
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