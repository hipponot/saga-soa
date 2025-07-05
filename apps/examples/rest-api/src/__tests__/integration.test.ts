import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import { container } from '../inversify.config';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import type { ExpressServerConfig } from '@saga-soa/core-api/express-server-schema';

let app: ReturnType<ExpressServer['getApp']>;

beforeAll(() => {
  // Use the same config as main.ts
  const expressConfig: ExpressServerConfig = {
    configType: 'EXPRESS_SERVER',
    port: 0, // Use ephemeral port for testing
    logLevel: 'info',
    name: 'Test REST API',
  };
  container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);
  const server = container.resolve(ExpressServer);
  app = server.getApp();
});

describe('REST API Integration', () => {
  it('GET /api/hello/test-route', async () => {
    const res = await request(app).get('/api/hello/test-route');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello');
  });

  it('GET /api/hello-again/test-route', async () => {
    const res = await request(app).get('/api/hello-again/test-route');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello again');
  });

  it('POST /hello-mongo then GET /hello-mongo', async () => {
    // Write test doc
    const postRes = await request(app).post('/hello-mongo');
    expect(postRes.status).toBe(201);
    expect(postRes.body.ok).toBe(true);

    // Read test doc
    const getRes = await request(app).get('/hello-mongo');
    expect(getRes.status).toBe(200);
    expect(getRes.body.message).toBe('Hello from Mongo!');
  });
}); 