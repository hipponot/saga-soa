import { Container }                 from 'inversify';
import { injectable, inject }        from 'inversify';
import type { MongoClient }          from 'mongodb';
import { MockMongoProvider }         from '@saga-soa/db/mocks/mock-mongo-provider';
import { MONGO_CLIENT }              from '@saga-soa/db';
import * as controllers              from './sectors';
import { PinoLogger }                from '@saga-soa/logger';
import type { ILogger, PinoLoggerConfig } from '@saga-soa/logger';

const container = new Container();

// Example config for PinoLogger
const loggerConfig: PinoLoggerConfig = {
  configType: 'PINO_LOGGER',
  level: 'info',
  isExpressContext: true,
  prettyPrint: true,
};

container.bind<PinoLoggerConfig>('PinoLoggerConfig').toConstantValue(loggerConfig);
container.bind<ILogger>('ILogger').to(PinoLogger).inSingletonScope();

// MongoDB binding
const mongoProvider = new MockMongoProvider('MockMongoDB');
mongoProvider.connect().then(() => {
  container.bind<MockMongoProvider>('MongoProvider').toConstantValue(mongoProvider);
  container.bind<MongoClient>(MONGO_CLIENT).toConstantValue(mongoProvider.getClient());

  // Auto-bind all controllers in sectors
  Object.values(controllers).forEach(ctrl => {
    if (typeof ctrl === 'function') {
      container.bind(ctrl).toSelf();
    }
  });
});

export { container };