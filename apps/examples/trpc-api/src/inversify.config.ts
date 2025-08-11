import 'reflect-metadata';
import { Container }                      from 'inversify';
import { PinoLogger }                     from '@saga-soa/logger';
import { MongoProvider }                  from '@saga-soa/db';
import { ExpressServer }                  from '@saga-soa/api-core/express-server';
import { TRPCServer }                     from '@saga-soa/api-core/trpc-server';
import { ControllerLoader }               from '@saga-soa/api-core/utils/controller-loader';
import type { ILogger, PinoLoggerConfig } from '@saga-soa/logger';
import type { IMongoConnMgr }             from '@saga-soa/db';
import type { TRPCServerConfig }          from '@saga-soa/api-core/trpc-server-schema';
import type { ExpressServerConfig }       from '@saga-soa/api-core/express-server-schema';

export const container = new Container();

// Logger configuration
const loggerConfig: PinoLoggerConfig = {
  configType: 'PINO_LOGGER',
  level: 'info',
  isExpressContext: true,
  prettyPrint: true,
};

// Express Server configuration
const expressConfig: ExpressServerConfig = {
  configType: 'EXPRESS_SERVER',
  port: Number(process.env.PORT) || 5000,
  logLevel: 'info',
  name: 'Example tRPC API',
  basePath: '/saga-soa/v1', // Add basePath like other examples
};

// tRPC Server configuration
const trpcConfig: TRPCServerConfig = {
  configType: 'TRPC_SERVER',
  name: 'Example tRPC API',
  basePath: '/saga-soa/v1/trpc',
  contextFactory: async () => ({}),
};

// Bind logger
container.bind<PinoLoggerConfig>('PinoLoggerConfig').toConstantValue(loggerConfig);
container.bind<ILogger>('ILogger').to(PinoLogger).inSingletonScope();

// Bind ExpressServer configuration
container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

// Bind database
container.bind<IMongoConnMgr>('IMongoConnMgr').to(MongoProvider);

// Bind ExpressServer
container.bind(ExpressServer).toSelf().inSingletonScope();

// Bind tRPC Server
container.bind<TRPCServerConfig>('TRPCServerConfig').toConstantValue(trpcConfig);
container.bind(TRPCServer).toSelf().inSingletonScope();

// Bind ControllerLoader
container.bind(ControllerLoader).toSelf().inSingletonScope();
