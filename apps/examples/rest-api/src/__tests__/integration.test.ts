import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ExpressServerConfig } from '@saga-soa/core-api/express-server-schema';
import { ExpressServer } from '@saga-soa/core-api/express-server';
import { loadControllers } from '@saga-soa/core-api/utils/loadControllers';
import { AbstractRestController } from '@saga-soa/core-api/abstract-rest-controller';
import { container } from '../inversify.config.js';
import express from 'express';

let app: express.Application;

beforeAll(async () => {
  // ExpressServer binding
  const expressConfig: ExpressServerConfig = {
    configType: 'EXPRESS_SERVER',
    port: 0, // Use ephemeral port for testing
    logLevel: 'info',
    name: 'Test REST API',
  };
  container.bind<ExpressServerConfig>('ExpressServerConfig').toConstantValue(expressConfig);

  // Dynamically load all sector controllers (match main.ts logic)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const controllers = await loadControllers(
    // Note this is a vitest so we load the TS files - vitest uses esbuild to transpile ts files on the fly for testing
    path.resolve(__dirname, '../sectors/*.ts'),
    AbstractRestController
  );
  console.log('Loaded controllers:', controllers.map(c => c.name));

  // Use ExpressServer from DI, initialize with controllers, and get the app instance
  const expressServer = container.get(ExpressServer);
  await expressServer.init(container, controllers);
  app = expressServer.getApp();
});

describe('REST API Integration', () => {
  it('GET /hello/test-route', async () => {
    const res = await request(app).get('/hello/test-route');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello');
  });

  it('GET /hello-again/test-route', async () => {
    const res = await request(app).get('/hello-again/test-route');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello Again');
  });

  it('GET /hello-mongo/test-route', async () => {
    const res = await request(app).get('/hello-mongo/test-route');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello Mongo');
  });
}); 