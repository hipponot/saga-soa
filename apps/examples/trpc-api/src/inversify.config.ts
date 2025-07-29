import 'reflect-metadata';
import { Container } from 'inversify';
import { PinoLogger } from '@saga-soa/logger';
import { MongoProvider } from '@saga-soa/db';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import { TRPCAppRouter } from '@saga-soa/core-api/trpc-app-router';
import type { ILogger, PinoLoggerConfig } from '@saga-soa/logger';
import type { IMongoConnMgr } from '@saga-soa/db';
import type { TRPCAppRouterConfig } from '@saga-soa/core-api/trpc-app-router-schema';


export const container = new Container();

// Logger configuration
const loggerConfig: PinoLoggerConfig = {
  configType: 'PINO_LOGGER',
  level: 'info',
  isExpressContext: true,
  prettyPrint: true,
};

// tRPC App Router configuration
const trpcConfig: TRPCAppRouterConfig = {
  configType: 'TRPC_APP_ROUTER',
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

// Bind tRPC App Router
container.bind<TRPCAppRouterConfig>('TRPCAppRouterConfig').toConstantValue(trpcConfig);
container.bind(TRPCAppRouter).toSelf().inSingletonScope();

 