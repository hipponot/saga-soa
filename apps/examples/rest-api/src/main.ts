import { ExpressServer } from '@saga-soa/core-api/express-server';
import { container } from './inversify.config.js';
import { loadControllers } from '@saga-soa/core-api/utils/loadControllers';
import { AbstractRestController } from '@saga-soa/core-api/abstract-rest-controller';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  // Dynamically load all sector controllers
  const controllers = await loadControllers(
    path.resolve(__dirname, './sectors/*.js'),
    AbstractRestController
  );

  // Start the Express server
  const expressServer = container.get(ExpressServer);
  await expressServer.init(container, controllers);
  expressServer.start();
}

start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
