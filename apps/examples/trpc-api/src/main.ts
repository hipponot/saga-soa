import 'reflect-metadata';
import { ExpressServer }            from '@saga-soa/core-api/express-server';
import type { ExpressServerConfig } from '@saga-soa/core-api/express-server-schema';
import { container }                from './inversify.config.js';
import { createExpressMiddleware }  from '@trpc/server/adapters/express';
import { appRouter }                from './app-router.js';
import express                      from 'express';

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

  // Create tRPC middleware with proper configuration
  const trpcMiddleware = createExpressMiddleware({
    router: appRouter,
    createContext: async () => ({}),
    onError: ({ error }) => {
      console.error('tRPC Error:', error);
    },
  });

  // Mount tRPC on /trpc
  app.use('/trpc', trpcMiddleware);

  // Add a simple health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'tRPC API' });
  });

  // Start the server
  expressServer.start();
}

start().catch(console.error);