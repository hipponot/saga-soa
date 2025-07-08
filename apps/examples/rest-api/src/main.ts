import { ExpressServer }            from '@saga-soa/core-api/express-server';
import type { ExpressServerConfig } from '@saga-soa/core-api/express-server-schema';
import { container }                from './inversify.config';
import * as sectorControllers       from './sectors';

const expressConfig: ExpressServerConfig = {
  configType: 'EXPRESS_SERVER',
  port: Number(process.env.PORT) || 3000,
  logLevel: 'info',
  name: 'Example REST API',
};

container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

async function start() {
  // Compose array of all controllers (sector controllers only)
  const controllers = Object.values(sectorControllers);
  // Get the ExpressServer instance from DI
  const expressServer = container.get(ExpressServer);
  // Initialize and register controllers via ExpressServer
  await expressServer.init(container, controllers);
  // Start the server using ExpressServer
  expressServer.start();
}

start();