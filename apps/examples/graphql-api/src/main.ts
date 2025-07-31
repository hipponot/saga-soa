import 'reflect-metadata';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import { GQLServer } from '@saga-soa/core-api/gql-server';
import { container } from './inversify.config.js';
import { loadControllers } from '@saga-soa/core-api/utils/loadControllers';
import { AbstractRestController } from '@saga-soa/core-api/abstract-rest-controller';
import { AbstractGQLController } from '@saga-soa/core-api/abstract-gql-controller';
import type { ILogger } from '@saga-soa/logger';
import path from 'node:path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  const logger = container.get<ILogger>('ILogger');

  // Dynamically load all REST controllers
  const restControllers = await loadControllers(
    path.resolve(__dirname, './sectors/*/rest/*-routes.js'),
    AbstractRestController
  );
  logger.info('Loaded REST controllers:', restControllers.map(c => c.name));

  // Get the ExpressServer instance from DI
  const expressServer = container.get(ExpressServer);
  // Initialize and register REST controllers
  await expressServer.init(container, restControllers);
  const app = expressServer.getApp();

  // Add express.json() middleware before Apollo middleware
  app.use(express.json());

  // Dynamically load all GQL resolvers
  const gqlResolvers = await loadControllers(
    path.resolve(__dirname, './sectors/*/gql/*.js'),
    AbstractGQLController
  );
  logger.info('Loaded GraphQL resolvers:', gqlResolvers.map(c => c.name));

  // Get the GQLServer instance from DI and initialize it
  const gqlServer = container.get(GQLServer);
  await gqlServer.init(container, gqlResolvers);

  // Mount the GraphQL server to the Express app with basePath
  gqlServer.mountToApp(app, '/saga-soa/v1');

  // Add a simple health check (at root level for easy access)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'GraphQL API' });
  });

  // Start the server
  expressServer.start();
}

start().catch(error => {
  const logger = container.get<ILogger>('ILogger');
  logger.error('Failed to start server:', error);
  process.exit(1);
});
