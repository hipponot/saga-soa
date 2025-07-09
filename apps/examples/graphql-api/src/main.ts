import 'reflect-metadata';
import { ExpressServer }            from '@saga-soa/core-api/express-server';
import type { ExpressServerConfig } from '@saga-soa/core-api/express-server-schema';
import { container }                from './inversify.config.js';
import * as userControllers         from './sectors/user/rest/index.js';
import * as sessionControllers      from './sectors/session/rest/index.js';
import { UserResolver }             from './sectors/user/gql/user.resolver.js';
import { SessionResolver }          from './sectors/session/gql/session.resolver.js';
import { ApolloServer }             from '@apollo/server';
import { expressMiddleware }        from '@apollo/server/express4';
import { buildSchema }              from 'type-graphql';
import path                         from 'node:path';
import { fileURLToPath }            from 'url';
import express                      from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const expressConfig: ExpressServerConfig = {
  configType: 'EXPRESS_SERVER',
  port: Number(process.env.PORT) || 4000,
  logLevel: 'info',
  name: 'Example GraphQL API',
};

container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

async function start() {
  // Compose array of all REST controllers from user and session sectors
  const controllers = [
    ...Object.values(userControllers),
    ...Object.values(sessionControllers),
  ];
  // Get the ExpressServer instance from DI
  const expressServer = container.get(ExpressServer);
  // Initialize and register REST controllers
  await expressServer.init(container, controllers);
  const app = expressServer.getApp();

  // Add express.json() middleware before Apollo middleware
  app.use(express.json());

  // Build TypeGraphQL schema with explicit resolver imports
  const schema = await buildSchema({
    resolvers: [UserResolver, SessionResolver],
    emitSchemaFile: path.resolve(__dirname, 'schema.graphql'),
  });

  // Set up ApolloServer v4+ on /graphql
  const apolloServer = new ApolloServer({ schema });
  await apolloServer.start();
  // @ts-expect-error Apollo Server v4+ middleware type mismatch with Express
  app.use('/graphql', expressMiddleware(apolloServer, { context: async () => ({}) }));

  // Start the server
  expressServer.start();
}

start();