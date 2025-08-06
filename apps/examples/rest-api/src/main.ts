import { ExpressServer } from '@saga-soa/core-api/express-server';
import { container } from './inversify.config.js';
import { ControllerLoader } from '@saga-soa/core-api/utils/controller-loader';
import { AbstractRestController } from '@saga-soa/core-api/abstract-rest-controller';
import type { ILogger } from '@saga-soa/logger';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define glob patterns for this API
const GLOB_PATTERNS = {
  REST: './sectors/*.js',
} as const;

async function start() {
  const logger = container.get<ILogger>('ILogger');

  // Get the ControllerLoader from DI
  const controllerLoader = container.get(ControllerLoader);

  // Dynamically load all sector controllers
  const controllers = await controllerLoader.loadControllers(
    path.resolve(__dirname, GLOB_PATTERNS.REST),
    AbstractRestController
  );

  // Start the Express server
  const expressServer = container.get(ExpressServer);
  await expressServer.init(container, controllers);
  const app = expressServer.getApp();

  // Add a simple health check (at root level for easy access)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'REST API' });
  });

  expressServer.start();
}

start().catch(error => {
  const logger = container.get<ILogger>('ILogger');
  logger.error('Failed to start server:', error);
  process.exit(1);
});
