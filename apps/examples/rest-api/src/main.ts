import { ExpressServer } from '@saga/soa-core-api/express-server';
import type { ExpressServerConfig } from '@saga/soa-core-api/express-server-schema';
import { container } from './inversify.config.js';
import { loadControllers } from '@saga/soa-core-api/utils/loadControllers';
import { RestControllerBase } from '@saga/soa-core-api/rest-controller';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const expressConfig: ExpressServerConfig = {
  configType: 'EXPRESS_SERVER',
  port: Number(process.env.PORT) || 3000,
  logLevel: 'info',
  name: 'Example REST API',
};

container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

async function start() {
  // Dynamically load all sector controllers
  const controllers = await loadControllers(
    path.resolve(__dirname, './sectors/*.js'),
    RestControllerBase
  );
  // Get the ExpressServer instance from DI
  const expressServer = container.get(ExpressServer);
  // Initialize and register controllers via ExpressServer
  await expressServer.init(container, controllers);
  // Start the server using ExpressServer
  expressServer.start();
}

start();