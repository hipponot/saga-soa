import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { appRouter } from '../app-router.js';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express from 'express';

describe('tRPC API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const trpcMiddleware = createExpressMiddleware({
      router: appRouter,
      createContext: async () => ({}),
    });

    app.use('/trpc', trpcMiddleware);
  });

  describe('Project Router', () => {
    it('should get all projects', async () => {
      const response = await request(app)
        .post('/trpc/project.getAll')
        .send({})
        .expect(200);

      expect(response.body.result.data).toBeDefined();
      expect(Array.isArray(response.body.result.data)).toBe(true);
    });

    it('should get project by ID', async () => {
      const response = await request(app)
        .post('/trpc/project.getById')
        .send({ input: { id: '1' } })
        .expect(200);

      expect(response.body.result.data).toBeDefined();
      expect(response.body.result.data.id).toBe('1');
      expect(response.body.result.data.name).toBe('Saga SOA Platform');
    });

    it('should create a new project', async () => {
      const newProject = {
        name: 'Test Project',
        description: 'A test project',
        status: 'active' as const,
      };

      const response = await request(app)
        .post('/trpc/project.create')
        .send({ input: newProject })
        .expect(200);

      expect(response.body.result.data).toBeDefined();
      expect(response.body.result.data.name).toBe(newProject.name);
      expect(response.body.result.data.description).toBe(newProject.description);
    });
  });

  describe('Run Router', () => {
    it('should get all runs', async () => {
      const response = await request(app)
        .post('/trpc/run.getAll')
        .send({})
        .expect(200);

      expect(response.body.result.data).toBeDefined();
      expect(Array.isArray(response.body.result.data)).toBe(true);
    });

    it('should get runs by project ID', async () => {
      const response = await request(app)
        .post('/trpc/run.getByProject')
        .send({ input: { projectId: '1' } })
        .expect(200);

      expect(response.body.result.data).toBeDefined();
      expect(Array.isArray(response.body.result.data)).toBe(true);
      expect(response.body.result.data.every((run: any) => run.projectId === '1')).toBe(true);
    });

    it('should create a new run', async () => {
      const newRun = {
        projectId: '1',
        name: 'Test Run',
        description: 'A test run',
        status: 'pending' as const,
      };

      const response = await request(app)
        .post('/trpc/run.create')
        .send({ input: newRun })
        .expect(200);

      expect(response.body.result.data).toBeDefined();
      expect(response.body.result.data.name).toBe(newRun.name);
      expect(response.body.result.data.projectId).toBe(newRun.projectId);
    });
  });
}); 