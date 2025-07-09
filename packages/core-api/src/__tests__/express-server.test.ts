import 'reflect-metadata';
import { describe, it, expect }              from 'vitest';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container }                         from 'inversify';
import { TestSector }                        from './test-sector.js';
import { fetch }                             from 'undici';

function getRandomPort() {
  return Math.floor(Math.random() * 10000) + 20000;
}

describe('ExpressServer (integration)', () => {
  it('should respond to GET /test with { ok: true }', async () => {
    const container = new Container();
    container.bind(TestSector).toSelf();
    useContainer(container);
    const app = createExpressServer({ controllers: [TestSector] });
    const port = getRandomPort();
    const server = app.listen(port);
    try {
      const res = await fetch(`http://localhost:${port}/test`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ ok: true });
    } finally {
      server.close();
    }
  });
});