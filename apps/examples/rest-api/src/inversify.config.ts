import { Container }                      from 'inversify';
import { MockMongoProvider }              from '@saga-soa/db/mocks/mock-mongo-provider';
import { MONGO_CLIENT }                   from '@saga-soa/db';
import * as controllers                   from './sectors';
import { PinoLogger }                     from '@saga-soa/logger';
import type { ILogger, PinoLoggerConfig } from '@saga-soa/logger';
import { HelloMongo }                     from './sectors/hello-mongo';
import type { MongoClient }               from 'mongodb';
import type { IMongoConnMgr }                from '@saga-soa/db';

const container = new Container();

// Synchronously bind all controllers
Object.values(controllers).forEach(ctrl => {
  if (typeof ctrl === 'function' && !container.isBound(ctrl)) {
    container.bind(ctrl).toSelf();
  }
});

// Example config for PinoLogger
const loggerConfig: PinoLoggerConfig = {
  configType: 'PINO_LOGGER',
  level: 'info',
  isExpressContext: true,
  prettyPrint: true,
};

container.bind<PinoLoggerConfig>('PinoLoggerConfig').toConstantValue(loggerConfig);
container.bind<ILogger>('ILogger').to(PinoLogger).inSingletonScope();

// Bind MongoProvider to IMongoConnMgr using async factory (toDynamicValue)
container.bind<IMongoConnMgr>('IMongoConnMgr').toDynamicValue(async () => {
  const provider = new MockMongoProvider('MockMongoDB');
  await provider.connect();
  return provider;
}).inSingletonScope();

export { container };