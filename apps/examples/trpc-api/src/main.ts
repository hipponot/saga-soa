import 'reflect-metadata';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import { TRPCServer } from '@saga-soa/core-api/trpc-server';
import { loadControllers } from '@saga-soa/core-api/utils/loadControllers';
import { AbstractTRPCController } from '@saga-soa/core-api/abstract-trpc-controller';
import { container } from './inversify.config.js';
import type { ILogger } from '@saga-soa/logger';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  const logger = container.get<ILogger>('ILogger');

  // Dynamically load all tRPC controllers
  const controllers = await loadControllers(
    path.resolve(__dirname, './sectors/*/trpc/*.router.js'),
    AbstractTRPCController
  );

  logger.info('Loaded tRPC controllers:', controllers.map(c => c.name));

  // Bind all loaded controllers to the DI container
  for (const controller of controllers) {
    container.bind(controller).toSelf().inSingletonScope();
  }

  // Get the ExpressServer instance from DI
  const expressServer = container.get(ExpressServer);

  // Initialize the Express server
  await expressServer.init(container, []);
  const app = expressServer.getApp();

  // Get the TRPCServer instance from DI
  const trpcServer = container.get(TRPCServer);

  // Add routers to the TRPCServer using dynamically loaded controllers
  for (const controller of controllers) {
    const controllerInstance = container.get(controller) as any;
    trpcServer.addRouter(controllerInstance.sectorName, controllerInstance.createRouter());
  }

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
