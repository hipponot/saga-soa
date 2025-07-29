import { ExpressServer } from '@saga-soa/core-api/express-server';
import { container } from './inversify.config.js';
import { loadControllers } from '@saga-soa/core-api/utils/loadControllers';
import { AbstractRestController } from '@saga-soa/core-api/abstract-rest-controller';
import type { ILogger } from '@saga-soa/logger';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  const logger = container.get<ILogger>('ILogger');

  // Dynamically load all sector controllers
  const controllers = await loadControllers(
    path.resolve(__dirname, './sectors/*.js'),
    AbstractRestController
  );

  logger.info('Loaded REST controllers:', controllers.map(c => c.name));

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
