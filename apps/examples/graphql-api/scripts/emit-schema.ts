import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import { loadControllers } from '@saga-soa/core-api/utils/loadControllers';
import { GQLControllerBase } from '@saga-soa/core-api/gql-controller';
import { printSchema } from 'graphql';
import { UserResolver } from '../dist/sectors/user/gql/user.resolver.js';
import { SessionResolver } from '../dist/sectors/session/gql/session.resolver.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function emitSchema() {
  
  // Build TypeGraphQL schema with dynamically loaded resolvers
  const schema = await buildSchema({
    resolvers: [UserResolver, SessionResolver],
  });
  // Emit SDL to schema.graphql in project root
  const sdl = printSchema(schema);
  const outPath = path.resolve(__dirname, '../schema.graphql');
  writeFileSync(outPath, sdl, 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`Schema SDL emitted to ${outPath}`);
}

emitSchema().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});