import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SectorInfo, GenerationResult } from '../types/sector.js';
import type { TGQLCodegenConfig } from '../types/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SchemaGenerator {
  constructor(private config: TGQLCodegenConfig) {}

  async generateSchema(sectors: SectorInfo[]): Promise<GenerationResult> {
    const outputDir = this.config.generation.outputDir;
    
    console.log(`🔧 Generating GraphQL schema files in ${outputDir}...`);
    
    // Ensure output directory exists
    mkdirSync(outputDir, { recursive: true });
    
    // Generate main schema file
    const schemaFile = join(outputDir, 'schema.ts');
    const schemaContent = this.generateSchemaFile(sectors);
    writeFileSync(schemaFile, schemaContent);
    
    // Generate type definitions for each sector
    const typeFiles: string[] = [];
    const typesDir = join(outputDir, 'types');
    mkdirSync(typesDir, { recursive: true });
    
    for (const sector of sectors) {
      const typeFile = join(typesDir, `${sector.name}.types.ts`);
      const typeContent = this.generateSectorTypes(sector);
      writeFileSync(typeFile, typeContent);
      typeFiles.push(typeFile);
    }
    
    // Generate types index file
    const typesIndexFile = join(typesDir, 'index.ts');
    const typesIndexContent = this.generateTypesIndexFile(sectors);
    writeFileSync(typesIndexFile, typesIndexContent);
    
    // Generate main index file
    const indexFile = join(outputDir, 'index.ts');
    const indexContent = this.generateIndexFile(sectors);
    writeFileSync(indexFile, indexContent);
    
    console.log(`✅ Generated schema for ${sectors.length} sectors`);
    
    return {
      schemaFile,
      typeFiles,
      sectorCount: sectors.length
    };
  }

  private generateSchemaFile(sectors: SectorInfo[]): string {
    const imports: string[] = [];
    const resolverClasses: string[] = [];
    
    // Generate imports for all resolvers
    for (const sector of sectors) {
      for (const resolver of sector.resolvers) {
        const importPath = this.getRelativeImportPath(resolver.filePath);
        imports.push(`import { ${resolver.className} } from '${importPath}';`);
        resolverClasses.push(resolver.className);
      }
    }
    
    return `// Auto-generated schema file - do not edit manually
import { buildSchema } from 'type-graphql';
import { printSchema } from 'graphql';
${imports.join('\n')}

export const resolverClasses = [
  ${resolverClasses.join(',\n  ')}
];

export async function buildAppSchema() {
  const schema = await buildSchema({
    resolvers: resolverClasses as any,
    validate: false
  });
  
  return schema;
}

export async function getSchemaSDL(): Promise<string> {
  const schema = await buildAppSchema();
  return printSchema(schema);
}

export { resolverClasses as resolvers };
`;
  }

  private generateSectorTypes(sector: SectorInfo): string {
    const lines: string[] = [];
    
    lines.push(`// Auto-generated types for ${sector.name} sector - do not edit manually`);
    lines.push('');
    
    // Generate type interfaces
    for (const type of sector.types) {
      lines.push(`export interface ${type.className} {`);
      for (const field of type.fields) {
        const mappedType = this.mapGraphQLTypeToTypeScript(field.type);
        const typeStr = field.isArray ? `${mappedType}[]` : mappedType;
        const nullableStr = field.nullable ? '?' : '';
        lines.push(`  ${field.name}${nullableStr}: ${typeStr};`);
      }
      lines.push('}');
      lines.push('');
    }
    
    // Generate input interfaces
    for (const input of sector.inputs) {
      lines.push(`export interface ${input.className} {`);
      for (const field of input.fields) {
        const mappedType = this.mapGraphQLTypeToTypeScript(field.type);
        const typeStr = field.isArray ? `${mappedType}[]` : mappedType;
        const nullableStr = field.nullable ? '?' : '';
        lines.push(`  ${field.name}${nullableStr}: ${typeStr};`);
      }
      lines.push('}');
      lines.push('');
    }
    
    // Generate resolver operation types
    for (const resolver of sector.resolvers) {
      lines.push(`// Operations for ${resolver.className}`);
      
      // Query types
      for (const query of resolver.queries) {
        const mappedReturnType = this.mapGraphQLTypeToTypeScript(query.returnType);
        const returnType = query.isArray ? `${mappedReturnType}[]` : mappedReturnType;
        const argTypes = query.args.map(arg => 
          `${arg.name}${arg.nullable ? '?' : ''}: ${this.mapGraphQLTypeToTypeScript(arg.type)}`
        ).join(', ');
        
        lines.push(`export type ${query.name}Query = {`);
        if (argTypes) {
          lines.push(`  args: { ${argTypes} };`);
        }
        lines.push(`  result: ${returnType};`);
        lines.push('};');
      }
      
      // Mutation types
      for (const mutation of resolver.mutations) {
        const mappedReturnType = this.mapGraphQLTypeToTypeScript(mutation.returnType);
        const returnType = mutation.isArray ? `${mappedReturnType}[]` : mappedReturnType;
        const argTypes = mutation.args.map(arg => 
          `${arg.name}${arg.nullable ? '?' : ''}: ${this.mapGraphQLTypeToTypeScript(arg.type)}`
        ).join(', ');
        
        lines.push(`export type ${mutation.name}Mutation = {`);
        if (argTypes) {
          lines.push(`  args: { ${argTypes} };`);
        }
        lines.push(`  result: ${returnType};`);
        lines.push('};');
      }
    }
    
    return lines.join('\n');
  }

  private generateIndexFile(sectors: SectorInfo[]): string {
    const lines: string[] = [];
    
    lines.push('// Auto-generated index file - do not edit manually');
    lines.push('');
    lines.push("export * from './schema.js';");
    lines.push('');
    
    // Export all sector types
    for (const sector of sectors) {
      lines.push(`export * from './types/${sector.name}.types.js';`);
    }
    
    return lines.join('\n');
  }

  private generateTypesIndexFile(sectors: SectorInfo[]): string {
    const lines: string[] = [];
    
    lines.push('// Auto-generated types index file - do not edit manually');
    lines.push('');
    
    // Export all sector types
    for (const sector of sectors) {
      lines.push(`export * from './${sector.name}.types.js';`);
    }
    
    return lines.join('\n');
  }

  private getRelativeImportPath(filePath: string): string {
    // Convert absolute path to relative import path from the generated schema file
    const outputDir = this.config.generation.outputDir;
    
    // Ensure we have absolute paths for reliable relative path calculation
    const absoluteOutputDir = path.isAbsolute(outputDir) ? outputDir : path.resolve(outputDir);
    const absoluteFilePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
    
    // Calculate relative path from the output directory to the resolver file
    const relativePath = path.relative(absoluteOutputDir, absoluteFilePath);
    
    // Convert .ts to .js for import
    return relativePath.replace(/\.ts$/, '.js');
  }

  private mapGraphQLTypeToTypeScript(graphqlType: string): string {
    // Map GraphQL scalar types to TypeScript types
    const typeMap: { [key: string]: string } = {
      'ID': 'string',
      'String': 'string',
      'Int': 'number',
      'Float': 'number',
      'Boolean': 'boolean',
      'Date': 'Date',
      'DateTime': 'Date',
    };

    return typeMap[graphqlType] || graphqlType;
  }
}