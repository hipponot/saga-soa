import express                            from 'express';
import { useExpressServer, useContainer } from 'routing-controllers';
import * as controllers                   from './sectors';
import { container }                      from './inversify.config';
import type { ExpressServerConfig }       from '@saga-soa/core-api/express-server-schema';
import type { ILogger }                   from '@saga-soa/logger';
import type { IMongoConnMgr }             from '@saga-soa/db';

const expressConfig: ExpressServerConfig = {
  configType: 'EXPRESS_SERVER',
  port: Number(process.env.PORT) || 3000,
  logLevel: 'info',
  name: 'Example REST API',
};

container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

async function start() {
  // Get the singleton Mongo provider from DI (already connected)
  const mongoProvider = await container.getAsync<IMongoConnMgr>('IMongoConnMgr');
  // No need to bind MongoClient; use the factory provider pattern instead

  // Ensure routing-controllers uses Inversify for controller resolution
  useContainer(container);

  // Discover all sector controller classes (extending RestControllerBase)
  const controllerClasses = Object.values(controllers).filter(
    (ctrl) => typeof ctrl === 'function' && ctrl.prototype && ctrl.prototype.init
  );

  // Resolve and initialize all controllers
  for (const Ctrl of controllerClasses) {
    const instance = await container.getAsync(Ctrl);
    if (typeof instance.init === 'function') {
      await instance.init();
    }
  }

  // Create Express app and register controller classes
  const app = express();
  useExpressServer(app, {
    controllers: controllerClasses,
  });

  // Get logger from DI
  const logger = container.get<ILogger>('ILogger');

  // Start the server
  const port = expressConfig.port;
  app.listen(port, () => {
    logger.info(`Express server '${expressConfig.name}' started on port ${port}`);
  });
}

start();