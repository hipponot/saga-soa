import 'reflect-metadata';
import { ExpressServer } from '@saga/soa-core-api/express-server';
import type { ExpressServerConfig } from '@saga/soa-core-api/express-server-schema';
import { container } from './inversify.config.js';
import { loadControllers } from '@saga/soa-core-api/utils/loadControllers';
import { RestControllerBase } from '@saga/soa-core-api/rest-controller';
import { GQLControllerBase } from '@saga/soa-core-api/gql-controller';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSchema } from 'type-graphql';
import path from 'node:path';
import { fileURLToPath } from 'url';
import express from 'express';

// In ESM (ECMAScript Modules), __filename and __dirname are not available by default as they are in CommonJS.
// The following workaround uses import.meta.url and path utilities to replicate their behavior:
//   - __filename: the absolute path to the current module file
//   - __dirname: the directory name of the current module file
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
  // Dynamically load all REST controllers from user and session sectors
  const controllers = await loadControllers(
    [
      path.resolve(__dirname, './sectors/user/rest/*.js'),
      path.resolve(__dirname, './sectors/session/rest/*.js'),
    ],
    RestControllerBase
  );
  // Get the ExpressServer instance from DI
  const expressServer = container.get(ExpressServer);
  // Initialize and register REST controllers
  await expressServer.init(container, controllers);
  const app = expressServer.getApp();

  // Add express.json() middleware before Apollo middleware
  app.use(express.json());

  // Dynamically load all GQL resolvers from user and session sectors
  const resolvers = await loadControllers(
    [
      path.resolve(__dirname, './sectors/user/gql/*.js'),
      path.resolve(__dirname, './sectors/session/gql/*.js'),
    ],
    GQLControllerBase
  );
  // Build TypeGraphQL schema with dynamically loaded resolvers
  const schema = await buildSchema({
    // @ts-expect-error - loadControllers returns a tuple, but buildSchema expects an array
    resolvers: resolvers,
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