#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRPC_API_SECTORS_DIR = path.resolve(__dirname, '../../src/sectors');
const GENERATED_ROUTER_FILE = path.resolve(__dirname, '../generated/router.ts');

async function generateRouter() {
  try {
    console.log('🔍 Analyzing sector routers...');
    
    // Ensure generated directory exists
    await fs.mkdir(path.dirname(GENERATED_ROUTER_FILE), { recursive: true });
    
    // Read sectors directory
    const sectors = await fs.readdir(TRPC_API_SECTORS_DIR);
    const routerSectors: string[] = [];
    
    for (const sector of sectors) {
      const sectorPath = path.join(TRPC_API_SECTORS_DIR, sector);
      const stat = await fs.stat(sectorPath);
      
      if (stat.isDirectory()) {
        const trpcDir = path.join(sectorPath, 'trpc');
        try {
          await fs.access(trpcDir);
          routerSectors.push(sector);
        } catch {
          // No trpc directory, skip
        }
      }
    }
    
    console.log(`📋 Found sectors with tRPC routers: ${routerSectors.join(', ')}`);
    
    // Generate static router definition
    const routerContent = `// Auto-generated - do not edit
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import * as projectSchemas from './schemas/project.schemas.js';
import * as runSchemas from './schemas/run.schemas.js';

const t = initTRPC.create();

export const staticAppRouter = t.router({
  project: t.router({
    getAllProjects: t.procedure.query(() => []),
    getProjectById: t.procedure.input(projectSchemas.GetProjectSchema).query(() => ({})),
    createProject: t.procedure.input(projectSchemas.CreateProjectSchema).mutation(() => ({})),
    updateProject: t.procedure.input(projectSchemas.UpdateProjectSchema).mutation(() => ({})),
    deleteProject: t.procedure.input(projectSchemas.GetProjectSchema).mutation(() => ({})),
  }),
  run: t.router({
    getAllRuns: t.procedure.query(() => []),
    getRunById: t.procedure.input(runSchemas.GetRunSchema).query(() => ({})),
    createRun: t.procedure.input(runSchemas.CreateRunSchema).mutation(() => ({})),
    updateRun: t.procedure.input(runSchemas.UpdateRunSchema).mutation(() => ({})),
    deleteRun: t.procedure.input(runSchemas.GetRunSchema).mutation(() => ({})),
  }),
});

export type AppRouter = typeof staticAppRouter;
`;
    
    await fs.writeFile(GENERATED_ROUTER_FILE, routerContent);
    
    console.log('✅ Static router generated successfully!');
  } catch (error) {
    console.error('❌ Error generating router:', error);
    process.exit(1);
  }
}

generateRouter(); 