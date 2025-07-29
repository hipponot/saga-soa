import 'reflect-metadata';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import { GQLServer } from '@saga-soa/core-api/gql-server';
import { container } from './inversify.config.js';
import { loadControllers } from '@saga-soa/core-api/utils/loadControllers';
import { AbstractRestController } from '@saga-soa/core-api/abstract-rest-controller';
import { AbstractGQLController } from '@saga-soa/core-api/abstract-gql-controller';
import path from 'node:path';
import { fileURLToPath } from 'url';
import express from 'express';

// In ESM (ECMAScript Modules), __filename and __dirname are not available by default as they are in CommonJS.
// The following workaround uses import.meta.url and path utilities to replicate their behavior:
//   - __filename: the absolute path to the current module file
//   - __dirname: the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  // Dynamically load all REST controllers from user and session sectors
  const controllers = await loadControllers(
    [
      path.resolve(__dirname, './sectors/user/rest/*.js'),
      path.resolve(__dirname, './sectors/session/rest/*.js'),
    ],
    AbstractRestController
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
    AbstractGQLController
  );

  // Get the GQLServer instance from DI and initialize it
  const gqlServer = container.get(GQLServer);
  await gqlServer.init(container, resolvers);

  // Mount the GraphQL server to the Express app with basePath
  gqlServer.mountToApp(app, '/saga-soa/v1');

  // Start the server
  expressServer.start();
}

start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
