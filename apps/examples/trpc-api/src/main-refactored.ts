import 'reflect-metadata';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import { TRPCAppRouter } from '@saga-soa/core-api/trpc-app-router';
import type { ExpressServerConfig } from '@saga-soa/core-api/express-server-schema';
import type { TRPCAppRouterConfig } from '@saga-soa/core-api/trpc-app-router-schema';
import { container } from './inversify.config.js';
import express from 'express';

// Express server configuration
const expressConfig: ExpressServerConfig = {
  configType: 'EXPRESS_SERVER',
  port: Number(process.env.PORT) || 5000,
  logLevel: 'info',
  name: 'Example tRPC API',
};

// tRPC app router configuration
const trpcConfig: TRPCAppRouterConfig = {
  configType: 'TRPC_APP_ROUTER',
  name: 'Example tRPC API',
  basePath: '/trpc',
};

// Bind configurations to DI container
container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);
container.bind<TRPCAppRouterConfig>('TRPCAppRouterConfig').toConstantValue(trpcConfig);

async function start() {
  // Get the ExpressServer instance from DI
  const expressServer = container.get(ExpressServer);
  
  // Initialize the Express server
  await expressServer.init(container, []);
  const app = expressServer.getApp();

  // Get the TRPCAppRouter instance from DI
  const trpcAppRouter = container.get(TRPCAppRouter);

  // Create sector routers using the shared tRPC instance
  const projectRouter = trpcAppRouter.router({
    // Get all projects
    getAll: trpcAppRouter.procedures.query(() => {
      return getAllProjects();
    }),

    // Get project by ID
    getById: trpcAppRouter.procedures
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        const project = getProjectById(input.id);
        if (!project) {
          throw new Error('Project not found');
        }
        return project;
      }),

    // Create new project
    create: trpcAppRouter.procedures
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(['active', 'inactive', 'archived']).default('active'),
      }))
      .mutation(({ input }) => {
        return createProject(input);
      }),

    // Update project
    update: trpcAppRouter.procedures
      .input(z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(['active', 'inactive', 'archived']).optional(),
      }))
      .mutation(({ input }) => {
        const project = updateProject(input);
        if (!project) {
          throw new Error('Project not found');
        }
        return project;
      }),

    // Delete project
    delete: trpcAppRouter.procedures
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => {
        const success = deleteProject(input.id);
        if (!success) {
          throw new Error('Project not found');
        }
        return { success: true, message: 'Project deleted successfully' };
      }),
  });

  const runRouter = trpcAppRouter.router({
    // Get all runs
    getAll: trpcAppRouter.procedures.query(() => {
      return getAllRuns();
    }),

    // Get run by ID
    getById: trpcAppRouter.procedures
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        const run = getRunById(input.id);
        if (!run) {
          throw new Error('Run not found');
        }
        return run;
      }),

    // Get runs by project ID
    getByProject: trpcAppRouter.procedures
      .input(z.object({ projectId: z.string() }))
      .query(({ input }) => {
        return getRunsByProject(input.projectId);
      }),

    // Create new run
    create: trpcAppRouter.procedures
      .input(z.object({
        projectId: z.string().min(1),
        name: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
        config: z.record(z.unknown()).optional(),
      }))
      .mutation(({ input }) => {
        return createRun(input);
      }),

    // Update run
    update: trpcAppRouter.procedures
      .input(z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(['pending', 'running', 'completed', 'failed']).optional(),
        config: z.record(z.unknown()).optional(),
      }))
      .mutation(({ input }) => {
        const run = updateRun(input);
        if (!run) {
          throw new Error('Run not found');
        }
        return run;
      }),

    // Delete run
    delete: trpcAppRouter.procedures
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => {
        const success = deleteRun(input.id);
        if (!success) {
          throw new Error('Run not found');
        }
        return { success: true, message: 'Run deleted successfully' };
      }),
  });

  // Add routers to the tRPC app router
  trpcAppRouter.addRouters({
    project: projectRouter,
    run: runRouter,
  });

  // Create tRPC middleware and mount it
  const trpcMiddleware = trpcAppRouter.createExpressMiddleware();
  app.use(trpcAppRouter.getBasePath(), trpcMiddleware);

  // Add a simple health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'tRPC API',
      trpcRouters: trpcAppRouter.getRouterNames()
    });
  });

  // Start the server
  expressServer.start();
}

// Mock data functions (these would normally come from your data layer)
function getAllProjects() {
  return [
    { id: '1', name: 'Saga SOA Platform', description: 'A modern SOA platform', status: 'active' },
    { id: '2', name: 'Example Project', description: 'An example project', status: 'active' },
  ];
}

function getProjectById(id: string) {
  const projects = getAllProjects();
  return projects.find(p => p.id === id);
}

function createProject(input: any) {
  return { id: '3', ...input };
}

function updateProject(input: any) {
  return { id: input.id, ...input };
}

function deleteProject(id: string) {
  return true;
}

function getAllRuns() {
  return [
    { id: '1', projectId: '1', name: 'Test Run 1', status: 'completed' },
    { id: '2', projectId: '1', name: 'Test Run 2', status: 'running' },
  ];
}

function getRunById(id: string) {
  const runs = getAllRuns();
  return runs.find(r => r.id === id);
}

function getRunsByProject(projectId: string) {
  const runs = getAllRuns();
  return runs.filter(r => r.projectId === projectId);
}

function createRun(input: any) {
  return { id: '3', ...input };
}

function updateRun(input: any) {
  return { id: input.id, ...input };
}

function deleteRun(id: string) {
  return true;
}

// Import zod for input validation
import { z } from 'zod';

start().catch(console.error); 