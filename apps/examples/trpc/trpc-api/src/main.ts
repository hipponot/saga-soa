import 'reflect-metadata';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import { TRPCServer } from '@saga-soa/core-api/trpc-server';
import { ControllerLoader } from '@saga-soa/core-api/utils/controller-loader';
import { AbstractTRPCController } from '@saga-soa/core-api/abstract-trpc-controller';
import { AbstractRestController } from '@saga-soa/core-api/abstract-rest-controller';
import { container } from './inversify.config.js';
import type { ILogger } from '@saga-soa/logger';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define glob patterns for this API
const GLOB_PATTERNS = {
  REST: './sectors/*/rest/*-routes.js',
  TRPC: './sectors/*/trpc/*.router.js',
} as const;

async function start() {
  const logger = container.get<ILogger>('ILogger');

  // Get the ControllerLoader from DI
  const controllerLoader = container.get(ControllerLoader);

  // Dynamically load all REST controllers
  const restControllers = await controllerLoader.loadControllers(
    path.resolve(__dirname, GLOB_PATTERNS.REST),
    AbstractRestController
  );

  // Get the ExpressServer instance from DI
  const expressServer = container.get(ExpressServer);
  // Initialize the Express server with REST controllers
  await expressServer.init(container, restControllers);
  const app = expressServer.getApp();

  // Dynamically load all tRPC controllers
  const trpcControllers = await controllerLoader.loadControllers(
    path.resolve(__dirname, GLOB_PATTERNS.TRPC),
    AbstractTRPCController
  );

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
