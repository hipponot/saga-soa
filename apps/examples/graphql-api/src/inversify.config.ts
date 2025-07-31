import { Container } from 'inversify';
import type { MongoClient } from 'mongodb';
import { MONGO_CLIENT } from '@saga-soa/db';
import type { IMongoConnMgr } from '@saga-soa/db';
import { MockMongoProvider } from '@saga-soa/db/mocks/mock-mongo-provider';
import type { ILogger, PinoLoggerConfig } from '@saga-soa/logger';
import { PinoLogger } from '@saga-soa/logger';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import { GQLServer } from '@saga-soa/core-api/gql-server';
import { ControllerLoader } from '@saga-soa/core-api/utils/controller-loader';
import type { ExpressServerConfig } from '@saga-soa/core-api/express-server-schema';
import type { GQLServerConfig } from '@saga-soa/core-api/gql-server-schema';

const container = new Container();

// Example config for PinoLogger
const loggerConfig: PinoLoggerConfig = {
  configType: 'PINO_LOGGER',
  level: 'info',
  isExpressContext: true,
  prettyPrint: true,
};

// Express Server configuration
const expressConfig: ExpressServerConfig = {
  configType: 'EXPRESS_SERVER',
  port: Number(process.env.PORT) || 4000,
  logLevel: 'info',
  name: 'Example GraphQL API',
  basePath: '/saga-soa/v1', // All routes will be prefixed with this base path
};

// GraphQL Server configuration
const gqlConfig: GQLServerConfig = {
  configType: 'GQL_SERVER',
  mountPoint: '/graphql', // Will be mounted at /saga-soa/v1/graphql
  logLevel: 'info',
  name: 'GraphQL API',
  enablePlayground: true, // Enable GraphQL playground
  playgroundPath: '/playground', // Optional: custom playground path
};

container.bind<PinoLoggerConfig>('PinoLoggerConfig').toConstantValue(loggerConfig);
container.bind<ILogger>('ILogger').to(PinoLogger).inSingletonScope();

// Bind ExpressServer configuration
container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

// Bind GraphQL Server configuration
container.bind<GQLServerConfig>('GQLServerConfig').toConstantValue(gqlConfig);

// Bind MongoProvider to IMongoConnMgr using async factory (toDynamicValue, Inversify v6.x)
container
  .bind<IMongoConnMgr>('IMongoConnMgr')
  .toDynamicValue(async () => {
    const provider = new MockMongoProvider('MockMongoDB');
    await provider.connect();
    return provider;
  })
  .inSingletonScope();

// Bind MongoClient to an async factory that returns the connected client
container
  .bind<MongoClient>(MONGO_CLIENT)
  .toDynamicValue(async () => {
    const mgr = await container.getAsync<IMongoConnMgr>('IMongoConnMgr');
    return mgr.getClient();
  })
  .inSingletonScope();

container.bind(ExpressServer).toSelf().inSingletonScope();
container.bind(GQLServer).toSelf().inSingletonScope();

// Bind ControllerLoader
container.bind(ControllerLoader).toSelf().inSingletonScope();

export { container };
