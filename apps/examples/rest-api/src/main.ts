import { container }                from './inversify.config';
import { ExpressServer }            from '@saga-soa/core-api/express-server';
import type { ExpressServerConfig } from '@saga-soa/core-api/express-server-schema';

// Example config for ExpressServer
const expressConfig: ExpressServerConfig = {
  configType: 'EXPRESS_SERVER',
  port: Number(process.env.PORT) || 3000,
  logLevel: 'info',
  name: 'Example REST API',
};

container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

const server = container.resolve(ExpressServer);
server.start();