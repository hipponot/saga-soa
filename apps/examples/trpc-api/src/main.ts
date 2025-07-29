import 'reflect-metadata';
import { ExpressServer }            from '@saga-soa/core-api/express-server';
import type { ExpressServerConfig } from '@saga-soa/core-api/express-server-schema';
import { TRPCServer }            from '@saga-soa/core-api/trpc-server';
import { loadControllers }          from '@saga-soa/core-api/utils/loadControllers';
import { AbstractTRPCController }   from '@saga-soa/core-api/abstract-trpc-controller';
import { container }                from './inversify.config.js';
import path                         from 'node:path';
import { fileURLToPath }            from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const expressConfig: ExpressServerConfig = {
  configType: 'EXPRESS_SERVER',
  port: Number(process.env.PORT) || 5000,
  logLevel: 'info',
  name: 'Example tRPC API',
};

container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

async function start() {
  // Dynamically load all tRPC controllers
  const controllers = await loadControllers(
    path.resolve(__dirname, './sectors/*/trpc/*.router.js'),
    AbstractTRPCController
  );
  
  console.log('Loaded tRPC controllers:', controllers.map(c => c.name));

  // Bind all loaded controllers to the DI container
  for (const controller of controllers) {
    container.bind(controller).toSelf().inSingletonScope();
  }

  // Get the ExpressServer instance from DI
  const expressServer = container.get(ExpressServer);
  
  // Initialize the Express server
  await expressServer.init(container, []);
  const app = expressServer.getApp();

  // Get the TRPCServer instance from DI
  const trpcServer = container.get(TRPCServer);
  
  // Add routers to the TRPCServer using dynamically loaded controllers
  for (const controller of controllers) {
    const controllerInstance = container.get(controller) as any;
    trpcServer.addRouter(controllerInstance.sectorName, controllerInstance.createRouter());
  }

  // Create tRPC middleware using TRPCServer
  const trpcMiddleware = trpcServer.createExpressMiddleware();

  // Mount tRPC on the configured base path
  app.use(trpcServer.getBasePath(), trpcMiddleware);

  // Add a simple health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'tRPC API' });
  });

  // Start the server
  expressServer.start();
}

start().catch(console.error);