import 'reflect-metadata';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import type { ExpressServerConfig } from '@saga-soa/core-api/express-server-schema';
import { TRPCAppRouter } from '@saga-soa/core-api/trpc-app-router';
import { container } from './inversify.config.js';
import { ProjectController } from './sectors/project/index.js';
import { RunController } from './sectors/run/index.js';

const expressConfig: ExpressServerConfig = {
  configType: 'EXPRESS_SERVER',
  port: Number(process.env.PORT) || 5000,
  logLevel: 'info',
  name: 'Example tRPC API',
};

container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

async function start() {
  // Get the ExpressServer instance from DI
  const expressServer = container.get(ExpressServer);
  
  // Initialize the Express server
  await expressServer.init(container, []);
  const app = expressServer.getApp();

  // Get the TRPCAppRouter instance from DI
  const trpcAppRouter = container.get(TRPCAppRouter);
  
  // Get the sector controllers from DI
  const projectController = container.get(ProjectController);
  const runController = container.get(RunController);
  
  // Add routers to the TRPCAppRouter
  trpcAppRouter.addRouter('project', projectController.createRouter());
  trpcAppRouter.addRouter('run', runController.createRouter());

  // Create tRPC middleware using TRPCAppRouter
  const trpcMiddleware = trpcAppRouter.createExpressMiddleware();

  // Mount tRPC on the configured base path
  app.use(trpcAppRouter.getBasePath(), trpcMiddleware);

  // Add a simple health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'tRPC API' });
  });

  // Start the server
  expressServer.start();
}

start().catch(console.error);