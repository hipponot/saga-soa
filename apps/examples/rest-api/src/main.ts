import { container }                         from './inversify.config';
import type { ExpressServerConfig }          from '@saga-soa/core-api/express-server-schema';
import { useContainer, createExpressServer } from 'routing-controllers';
import * as controllers                      from './sectors';
import { HelloMongo } from './sectors/hello-mongo';
import { ILogger }                           from '@saga-soa/logger';
import { MockMongoProvider }                  from '@saga-soa/db/mocks/mock-mongo-provider';
import { MONGO_CLIENT }                      from '@saga-soa/db';
import type { MongoClient }                   from 'mongodb';

const expressConfig: ExpressServerConfig = {
  configType: 'EXPRESS_SERVER',
  port: Number(process.env.PORT) || 3000,
  logLevel: 'info',
  name: 'Example REST API',
};

container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

// Use routing-controllers with Inversify container
useContainer(container);

async function start() {
  // Ensure Mongo is connected and bound before resolving HelloMongoSector
  const mongoProvider = new MockMongoProvider('MockMongoDB');
  await mongoProvider.connect();
  if (!container.isBound(MockMongoProvider)) {
    container.bind(MockMongoProvider).toConstantValue(mongoProvider);
  }
  if (!container.isBound(MONGO_CLIENT)) {
    container.bind<MongoClient>(MONGO_CLIENT).toConstantValue(mongoProvider.getClient());
  }

  // Collect all controller classes, EXCLUDING HelloMongoSector
  const controllerClasses = Object.values(controllers).filter(
    (ctrl) => typeof ctrl === 'function' && ctrl !== HelloMongo
  );

  // Create the Express app with all controllers
  const app = createExpressServer({
    controllers: controllerClasses,
  });

  // Mount HelloMongoSector router for /hello-mongo endpoints
  const helloMongo = container.get(HelloMongo);
  app.use(helloMongo.router);

  // Get logger from DI
  const logger = container.get<ILogger>('ILogger');

  // Start the server
  const port = expressConfig.port;
  app.listen(port, () => {
    logger.info(`Express server '${expressConfig.name}' started on port ${port}`);
  });
}

start();