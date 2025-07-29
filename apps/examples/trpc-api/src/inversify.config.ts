import 'reflect-metadata';
import { Container } from 'inversify';
import { PinoLogger } from '@saga-soa/logger';
import { MongoProvider } from '@saga-soa/db';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import { TRPCServer } from '@saga-soa/core-api/trpc-server';
import type { ILogger, PinoLoggerConfig } from '@saga-soa/logger';
import type { IMongoConnMgr } from '@saga-soa/db';
import type { TRPCServerConfig } from '@saga-soa/core-api/trpc-server-schema';


export const container = new Container();

// Logger configuration
const loggerConfig: PinoLoggerConfig = {
  configType: 'PINO_LOGGER',
  level: 'info',
  isExpressContext: true,
  prettyPrint: true,
};

// tRPC Server configuration
const trpcConfig: TRPCServerConfig = {
  configType: 'TRPC_SERVER',
  name: 'Example tRPC API',
  basePath: '/trpc',
  contextFactory: async () => ({}),
};

// Bind logger
container.bind<PinoLoggerConfig>('PinoLoggerConfig').toConstantValue(loggerConfig);
container.bind<ILogger>('ILogger').to(PinoLogger).inSingletonScope();

// Bind database
container.bind<IMongoConnMgr>('IMongoConnMgr').to(MongoProvider);

// Bind ExpressServer
container.bind(ExpressServer).toSelf().inSingletonScope();

// Bind tRPC Server
container.bind<TRPCServerConfig>('TRPCServerConfig').toConstantValue(trpcConfig);
container.bind(TRPCServer).toSelf().inSingletonScope();

 