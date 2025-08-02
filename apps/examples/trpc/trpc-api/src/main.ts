import 'reflect-metadata';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import { TRPCServer } from '@saga-soa/core-api/trpc-server';
import { ControllerLoader } from '@saga-soa/core-api/utils/controller-loader';
import { AbstractTRPCController } from '@saga-soa/core-api/abstract-trpc-controller';
import { AbstractRestController } from '@saga-soa/core-api/abstract-rest-controller';
import { container } from './inversify.config.js';
import type { ILogger } from '@saga-soa/logger';
import type { Request, Response } from 'express';
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

  // Add CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Dynamically load all tRPC controllers
  const trpcControllers = await controllerLoader.loadControllers(
    path.resolve(__dirname, GLOB_PATTERNS.TRPC),
    AbstractTRPCController
  );

  // Get the TRPCServer instance from DI
  const trpcServer = container.get(TRPCServer);
  // Initialize the tRPC server with tRPC controllers
  await trpcServer.init(container, trpcControllers);

  // Mount tRPC middleware
  await trpcServer.mountToApp(app);

  // Add a simple health check (at root level for easy access)
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'tRPC API' });
  });

  // Start the server
  expressServer.start();
}

// Add global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

start().catch(error => {
  const logger = container.get<ILogger>('ILogger');
  logger.error('Failed to start server:', error);
  process.exit(1);
});
