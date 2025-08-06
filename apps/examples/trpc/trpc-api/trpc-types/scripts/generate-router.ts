#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRPC_API_SECTORS_DIR = path.resolve(__dirname, '../../src/sectors');
const GENERATED_ROUTER_FILE = path.resolve(__dirname, '../generated/router.ts');

interface EndpointInfo {
  name: string;
  type: 'query' | 'mutation';
  inputSchema?: string;
}

interface SectorInfo {
  name: string;
  endpoints: EndpointInfo[];
}

async function parseSectorRouter(sectorName: string): Promise<SectorInfo> {
  const routerFilePath = path.join(TRPC_API_SECTORS_DIR, sectorName, 'trpc', `${sectorName}.router.ts`);
  const routerContent = await fs.readFile(routerFilePath, 'utf-8');
  
  const endpoints: EndpointInfo[] = [];
  
  // Parse the router content to extract endpoints
  // Look for the pattern: return router({ ... }) inside createRouter()
  const createRouterMatch = routerContent.match(/createRouter\(\s*\)\s*\{[\s\S]*?return\s+router\(\s*\{([\s\S]*?)\}\s*\)\s*;?\s*\}/);
  
  if (!createRouterMatch) {
    console.warn(`⚠️  Could not find router definition in ${sectorName}.router.ts`);
    return { name: sectorName, endpoints };
  }
  
  const routerObjectContent = createRouterMatch[1];
  
  // Extract individual endpoint definitions
  // Pattern: endpointName: t.input(Schema).query/mutation(...) or t.query/mutation(...)
  // Also handle multiline patterns like t\n  .input(...)\n  .query/mutation(...)
  const endpointPattern = /(\w+):\s*t(?:[\s\n]*\.input\((\w+Schema)\))?[\s\n]*\.(query|mutation)\(/g;
  
  let match;
  while ((match = endpointPattern.exec(routerObjectContent)) !== null) {
    const [, endpointName, inputSchema, methodType] = match;
    
    if (methodType === 'query' || methodType === 'mutation') {
      endpoints.push({
        name: endpointName,
        type: methodType,
        inputSchema: inputSchema || undefined
      });
    }
  }
  
  return { name: sectorName, endpoints };
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateEndpointDefinition(endpoint: EndpointInfo, sectorName: string): string {
  const schemaRef = endpoint.inputSchema 
    ? `${sectorName}Schemas.${endpoint.inputSchema}` 
    : undefined;
  
  if (endpoint.inputSchema) {
    return `${endpoint.name}: t.procedure.input(${schemaRef}).${endpoint.type}(() => ({}))`;
  } else {
    return `${endpoint.name}: t.procedure.${endpoint.type}(() => ${endpoint.type === 'query' ? '[]' : '{}'})`;
  }
}

async function generateRouter() {
  try {
    console.log('🔍 Analyzing sector routers...');
    
    // Ensure generated directory exists
    await fs.mkdir(path.dirname(GENERATED_ROUTER_FILE), { recursive: true });
    
    // Read sectors directory
    const sectors = await fs.readdir(TRPC_API_SECTORS_DIR);
    const sectorInfos: SectorInfo[] = [];
    
    for (const sector of sectors) {
      const sectorPath = path.join(TRPC_API_SECTORS_DIR, sector);
      const stat = await fs.stat(sectorPath);
      
      if (stat.isDirectory()) {
        const trpcDir = path.join(sectorPath, 'trpc');
        try {
          await fs.access(trpcDir);
          // Parse the router file for this sector
          const sectorInfo = await parseSectorRouter(sector);
          sectorInfos.push(sectorInfo);
          console.log(`📋 Found ${sectorInfo.endpoints.length} endpoints in ${sector} sector`);
        } catch (error) {
          console.warn(`⚠️  Skipping ${sector}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
    
    if (sectorInfos.length === 0) {
      throw new Error('No sectors with tRPC routers found');
    }
    
    console.log(`📋 Found sectors with tRPC routers: ${sectorInfos.map(s => s.name).join(', ')}`);
    
    // Generate dynamic imports
    const imports = sectorInfos.map(sector => 
      `import * as ${sector.name}Schemas from './schemas/${sector.name}.schemas.js';`
    ).join('\n');
    
    // Generate dynamic router structure
    const routerSections = sectorInfos.map(sector => {
      const endpointDefinitions = sector.endpoints.map(endpoint =>
        `    ${generateEndpointDefinition(endpoint, sector.name)},`
      ).join('\n');
      
      return `  ${sector.name}: t.router({\n${endpointDefinitions}\n  })`;
    }).join(',\n');
    
    // Generate the complete router content
    const routerContent = `// Auto-generated - do not edit
// This file is dynamically generated based on sectors in src/sectors/*/trpc/
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
${imports}

const t = initTRPC.create();

export const staticAppRouter = t.router({
${routerSections},
});

export type AppRouter = typeof staticAppRouter;
`;
    
    await fs.writeFile(GENERATED_ROUTER_FILE, routerContent);
    
    console.log('✅ Static router generated successfully!');
    console.log(`   - Generated router with ${sectorInfos.length} sectors`);
    console.log(`   - Total endpoints: ${sectorInfos.reduce((sum, s) => sum + s.endpoints.length, 0)}`);
  } catch (error) {
    console.error('❌ Error generating router:', error);
    process.exit(1);
  }
}

generateRouter(); 