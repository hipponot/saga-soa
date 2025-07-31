import 'reflect-metadata';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import { TRPCServer } from '@saga-soa/core-api/trpc-server';
import { loadControllers } from '@saga-soa/core-api/utils/loadControllers';
import { AbstractTRPCController } from '@saga-soa/core-api/abstract-trpc-controller';
import { AbstractRestController } from '@saga-soa/core-api/abstract-rest-controller';
import { container } from './inversify.config.js';
import type { ILogger } from '@saga-soa/logger';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  // Initialize the Express server with REST controllers
  await expressServer.init(container, restControllers);
  const app = expressServer.getApp();

  // Dynamically load all tRPC controllers
  const trpcControllers = await loadControllers(
    path.resolve(__dirname, './sectors/*/trpc/*.router.js'),
    AbstractTRPCController
  );
  logger.info('Loaded tRPC controllers:', trpcControllers.map(c => c.name));

  // Get the TRPCServer instance from DI
  const trpcServer = container.get(TRPCServer);
  // Initialize the tRPC server with tRPC controllers
  await trpcServer.init(container, trpcControllers);

  // Mount tRPC and playground middleware with basePath support
  await trpcServer.mountToApp(app, '/saga-soa/v1');

  // Add a simple health check (at root level for easy access)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'tRPC API' });
  });

  // Start the server
  expressServer.start();
}

start().catch(error => {
  const logger = container.get<ILogger>('ILogger');
  logger.error('Failed to start server:', error);
  process.exit(1);
});
