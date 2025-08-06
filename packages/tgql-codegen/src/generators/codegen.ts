import type { TGQLCodegenConfig } from '../types/config.js';
import type { GenerationResult } from '../types/sector.js';
import { SectorParser } from '../parsers/sector-parser.js';
import { ResolverParser } from '../parsers/resolver-parser.js';
import { TypeParser } from '../parsers/type-parser.js';
import { SchemaGenerator } from './schema-generator.js';

export class TGQLCodegen {
  private sectorParser: SectorParser;
  private schemaGenerator: SchemaGenerator;

  constructor(private config: TGQLCodegenConfig) {
    const resolverParser = new ResolverParser(config);
    const typeParser = new TypeParser(config);
    
    this.sectorParser = new SectorParser(config, resolverParser, typeParser);
    this.schemaGenerator = new SchemaGenerator(config);
  }

  async generate(): Promise<GenerationResult> {
    console.log('🚀 Starting TypeGraphQL code generation...');
    
    try {
      // Parse all sectors
      const sectors = await this.sectorParser.parseSectors();
      
      if (sectors.length === 0) {
        console.warn('⚠️  No sectors found with GraphQL resolvers');
        throw new Error('No sectors found with GraphQL resolvers');
      }

      console.log(`📊 Found ${sectors.length} sectors with GraphQL definitions`);
      
      // Generate schema and type files
      const result = await this.schemaGenerator.generateSchema(sectors);
      
      console.log('✅ Code generation completed successfully!');
      console.log(`📁 Schema file: ${result.schemaFile}`);
      console.log(`📁 Type files: ${result.typeFiles.length} generated`);
      
      return result;
    } catch (error) {
      console.error('❌ Code generation failed:', error);
      throw error;
    }
  }

  async watch(): Promise<void> {
    console.log('👀 Starting watch mode for TypeGraphQL codegen...');
    
    const chokidar = await import('chokidar');
    
    const patterns = [
      this.config.source.resolverPattern,
      this.config.source.typePattern,
      this.config.source.inputPattern
    ].map(pattern => `${this.config.source.sectorsDir}/${pattern}`);
    
    const watcher = chokidar.watch(patterns, {
      ignored: /node_modules|\.git/,
      persistent: true
    });
    
    const regenerate = async () => {
      try {
        console.log('\n🔄 Files changed, regenerating...');
        await this.generate();
        console.log('✅ Regeneration complete\n');
      } catch (error) {
        console.error('❌ Regeneration failed:', error);
      }
    };
    
    watcher
      .on('add', regenerate)
      .on('change', regenerate)
      .on('unlink', regenerate);
    
    console.log(`📂 Watching: ${patterns.join(', ')}`);
    console.log('Press Ctrl+C to stop watching');
    
    // Initial generation
    await regenerate();
  }
}