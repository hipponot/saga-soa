// Auto-generated schema file - do not edit manually
import { buildSchema } from 'type-graphql';
import { printSchema } from 'graphql';
import { SessionResolver } from '../../src/sectors/session/gql/session.resolver.js';
import { UserResolver } from '../../src/sectors/user/gql/user.resolver.js';

export const resolverClasses = [
  SessionResolver,
  UserResolver
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
