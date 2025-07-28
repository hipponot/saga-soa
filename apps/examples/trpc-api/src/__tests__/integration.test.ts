import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { appRouter } from '../app-router.js';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express from 'express';

describe('tRPC API Integration Tests', () => {
  let app: express.Application;
  let client: ReturnType<typeof createTRPCProxyClient<typeof appRouter>>;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Create tRPC middleware with proper configuration
    const trpcMiddleware = createExpressMiddleware({
      router: appRouter,
      createContext: async () => ({}),
      onError: ({ error }) => {
        console.error('tRPC Error:', error);
      },
    });

    app.use('/trpc', trpcMiddleware);

    // Start the server on a random port
    const server = app.listen(0);
    const port = (server.address() as any).port;

    // Create tRPC client
    client = createTRPCProxyClient<typeof appRouter>({
      links: [
        httpBatchLink({
          url: `http://localhost:${port}/trpc`,
        }),
      ],
    });

    // Store server for cleanup
    (app as any).server = server;
  });

  afterAll(() => {
    if ((app as any).server) {
      (app as any).server.close();
    }
  });

  describe('Project Router', () => {
    it('should get all projects', async () => {
      const result = await client.project.getAll.query();
      console.log('Result:', JSON.stringify(result, null, 2));
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get project by ID', async () => {
      const result = await client.project.getById.query({ id: '1' });
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
      const result = await client.project.create.mutate(newProject);
      console.log('Result:', JSON.stringify(result, null, 2));
      expect(result.name).toBe(newProject.name);
      expect(result.description).toBe(newProject.description);
    });
  });

  describe('Run Router', () => {
    it('should get all runs', async () => {
      const result = await client.run.getAll.query();
      console.log('Result:', JSON.stringify(result, null, 2));
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get runs by project ID', async () => {
      const result = await client.run.getByProject.query({ projectId: '1' });
      console.log('Result:', JSON.stringify(result, null, 2));
      expect(Array.isArray(result)).toBe(true);
      expect(result.every((run: any) => run.projectId === '1')).toBe(true);
    });

    it('should create a new run', async () => {
      const newRun = {
        projectId: '1',
        name: 'Test Run',
        description: 'A test run',
        status: 'pending' as const,
      };

      console.log('Request input:', JSON.stringify(newRun, null, 2));
      const result = await client.run.create.mutate(newRun);
      console.log('Result:', JSON.stringify(result, null, 2));
      expect(result.name).toBe(newRun.name);
      expect(result.projectId).toBe(newRun.projectId);
    });
  });
}); 