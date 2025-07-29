import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { injectable, inject } from 'inversify';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import type { ILogger } from '@saga-soa/logger';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import { TRPCAppRouter } from '@saga-soa/core-api/trpc-app-router';
import { loadControllers } from '@saga-soa/core-api/utils/loadControllers';
import { AbstractTRPCController } from '@saga-soa/core-api/abstract-trpc-controller';
import type { TRPCAppRouterConfig } from '@saga-soa/core-api/trpc-app-router-schema';
import type { ExpressServerConfig } from '@saga-soa/core-api/express-server-schema';
import { container } from '../inversify.config.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('tRPC API Integration Tests', () => {
  let app: express.Application;
  let client: any;
  let server: any;

  beforeAll(async () => {
    // Add ExpressServerConfig binding for tests
    const expressConfig: ExpressServerConfig = {
      configType: 'EXPRESS_SERVER',
      port: 0, // Use random port
      logLevel: 'info',
      name: 'Test tRPC API',
    };
    container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

    // Dynamically load all tRPC controllers
    const controllers = await loadControllers(
      path.resolve(__dirname, '../sectors/*/trpc/*.router.ts'),
      AbstractTRPCController
    );
    
    console.log('Loaded tRPC controllers:', controllers.map(c => c.name));

    // Bind all loaded controllers to the DI container
    for (const controller of controllers) {
      container.bind(controller).toSelf().inSingletonScope();
    }

    // Configure Express server
    const expressServer = container.get(ExpressServer);
    await expressServer.init(container, []);
    app = expressServer.getApp();

    // Get the TRPCAppRouter instance from DI
    const trpcAppRouter = container.get(TRPCAppRouter);
    
    // Add routers to the TRPCAppRouter using dynamically loaded controllers
    for (const controller of controllers) {
      const controllerInstance = container.get(controller) as any;
      trpcAppRouter.addRouter(controllerInstance.sectorName, controllerInstance.createRouter());
    }

    // Create tRPC middleware using TRPCAppRouter
    const trpcMiddleware = trpcAppRouter.createExpressMiddleware();

    // Mount tRPC on the configured base path
    app.use(trpcAppRouter.getBasePath(), trpcMiddleware);

    // Start the server on a random port
    server = app.listen(0);
    const port = (server.address() as any).port;

    // Create tRPC client
    client = createTRPCProxyClient({
      links: [
        httpBatchLink({
          url: `http://localhost:${port}${trpcAppRouter.getBasePath()}`,
        }),
      ],
    });
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('Project Router', () => {
    it('should get all projects', async () => {
      const result = await client.project.getAllProjects.query();
      console.log('Result:', JSON.stringify(result, null, 2));
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get project by ID', async () => {
      const result = await client.project.getProjectById.query({ id: '1' });
      console.log('Result:', JSON.stringify(result, null, 2));
      expect(result.id).toBe('1');
      expect(result.name).toBe('Saga SOA Platform');
    });

    it('should create a new project', async () => {
      const newProject = {
        name: 'Test Project',
        description: 'A test project',
        status: 'active' as const,
      };

      console.log('Request input:', JSON.stringify(newProject, null, 2));
      const result = await client.project.createProject.mutate(newProject);
      console.log('Result:', JSON.stringify(result, null, 2));
      expect(result.name).toBe(newProject.name);
      expect(result.description).toBe(newProject.description);
    });
  });

  describe('Run Router', () => {
    it('should get all runs', async () => {
      const result = await client.run.getAllRuns.query();
      console.log('Result:', JSON.stringify(result, null, 2));
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get run by ID', async () => {
      const result = await client.run.getRunById.query({ id: '1' });
      console.log('Result:', JSON.stringify(result, null, 2));
      expect(result.id).toBe('1');
      expect(result.name).toBe('Initial Build');
    });

    it('should create a new run', async () => {
      const newRun = {
        projectId: '1',
        name: 'Test Run',
        description: 'A test run',
        status: 'pending' as const,
      };

      console.log('Request input:', JSON.stringify(newRun, null, 2));
      const result = await client.run.createRun.mutate(newRun);
      console.log('Result:', JSON.stringify(result, null, 2));
      expect(result.name).toBe(newRun.name);
      expect(result.projectId).toBe(newRun.projectId);
    });
  });
});