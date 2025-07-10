import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import { container } from '../inversify.config.js';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import type { ExpressServerConfig } from '@saga-soa/core-api/express-server-schema';
import { useContainer, createExpressServer } from 'routing-controllers';
import { loadControllers } from '@saga-soa/core-api/utils/loadControllers';
import { RestControllerBase } from '@saga-soa/core-api/rest-controller';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

let app: express.Application;

beforeAll(async () => {
  // Use the same config as main.ts
  const expressConfig: ExpressServerConfig = {
    configType: 'EXPRESS_SERVER',
    port: 0, // Use ephemeral port for testing
    logLevel: 'info',
    name: 'Test REST API',
  };
  container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

  // Wait for MongoProvider to connect and bind MongoClient
  const { MockMongoProvider } = await import('@saga-soa/db/mocks/mock-mongo-provider');
  const { MONGO_CLIENT } = await import('@saga-soa/db');
  const mongoProvider = new MockMongoProvider('MockMongoDB');
  await mongoProvider.connect();
  if (container.isBound(MockMongoProvider)) container.unbind(MockMongoProvider);
  if (container.isBound(MONGO_CLIENT)) container.unbind(MONGO_CLIENT);
  container.bind(MockMongoProvider).toConstantValue(mongoProvider);
  container.bind(MONGO_CLIENT).toConstantValue(mongoProvider.getClient());

  // Dynamically load all sector controllers (match main.ts logic)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const controllers = await loadControllers(
    path.resolve(__dirname, '../sectors/*.js'),
    RestControllerBase
  );

  // Use ExpressServer from DI, initialize with controllers, and get the app instance
  const expressServer = container.get(ExpressServer);
  await expressServer.init(container, controllers);
  app = expressServer.getApp();
});

describe.skip('REST API Integration', () => {
  it('GET /saga-soa/hello/test-route', async () => {
    const res = await request(app).get('/saga-soa/hello/test-route');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello');
  });

  it('GET /saga-soa/hello-again/test-route', async () => {
    const res = await request(app).get('/saga-soa/hello-again/test-route');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello again');
  });

  it('POST /hello-mongo then GET /hello-mongo', async () => {
    // Write test doc
    const postRes = await request(app).post('/saga-soa/hello-mongo/test-write');
    expect(postRes.status).toBe(201);
    expect(postRes.body.ok).toBe(true);

    // Read test doc
    const getRes = await request(app).get('/saga-soa/hello-mongo/test-read');
    expect(getRes.status).toBe(200);
    expect(getRes.body.message).toBe('Hello from Mongo!');
  });
});