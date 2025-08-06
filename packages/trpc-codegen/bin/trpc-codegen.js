#!/usr/bin/env node

import { Command } from 'commander';
import { TRPCCodegen } from '../dist/index.js';
import { ConfigLoader } from '../dist/index.js';
import { watch } from 'chokidar';
import path from 'path';

const program = new Command();

program
  .name('trpc-codegen')
  .description('Generate TypeScript types and router from tRPC sector-based API')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate tRPC types and router')
  .option('-c, --config <path>', 'Path to config file')
  .option('-p, --project <path>', 'Project directory path', process.cwd())
  .action(async (options) => {
    try {
      console.log('🚀 tRPC Code Generation starting...\n');
      
      const config = await ConfigLoader.loadConfig(options.config, options.project);
      ConfigLoader.validateConfig(config);
      
      const codegen = new TRPCCodegen(config, options.project);
      const result = await codegen.generate();
      
      if (result.errors.length > 0) {
        console.error('\n❌ Generation completed with errors:');
        result.errors.forEach(error => console.error(`   - ${error}`));
        process.exit(1);
      }
      
      console.log('\n✅ Generation completed successfully!');
    } catch (error) {
      console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('watch')
  .description('Watch for changes and regenerate automatically')
  .option('-c, --config <path>', 'Path to config file')
  .option('-p, --project <path>', 'Project directory path', process.cwd())
  .action(async (options) => {
    try {
      console.log('👀 Starting tRPC Code Generation in watch mode...\n');
      
      const config = await ConfigLoader.loadConfig(options.config, options.project);
      ConfigLoader.validateConfig(config);
      
      const codegen = new TRPCCodegen(config, options.project);
      
      // Initial generation
      await codegen.generate();
      
      // Watch for changes
      const sectorsPath = path.resolve(options.project, config.source.sectorsDir);
      const watcher = watch(`${sectorsPath}/**/*.{ts,js}`, {
        ignored: /node_modules/,
        persistent: true
      });
      
      console.log(`\n👀 Watching for changes in ${sectorsPath}...`);
      console.log('Press Ctrl+C to stop watching\n');
      
      watcher.on('change', async (filePath) => {
        console.log(`📝 File changed: ${path.relative(options.project, filePath)}`);
        console.log('🔄 Regenerating...\n');
        
        try {
          await codegen.generate();
          console.log('✅ Regeneration completed\n');
        } catch (error) {
          console.error(`❌ Regeneration failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        }
      });
      
      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n👋 Stopping watch mode...');
        watcher.close();
        process.exit(0);
      });
      
    } catch (error) {
      console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program.parse();