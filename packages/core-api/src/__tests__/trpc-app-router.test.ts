import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { TRPCAppRouter } from '../trpc-app-router.js';
import { TRPCAppRouterSchema } from '../trpc-app-router-schema.js';
import { MockLogger } from '@saga-soa/logger/mocks';

describe('TRPCAppRouter', () => {
  let container: Container;
  let trpcAppRouter: TRPCAppRouter;

  beforeEach(() => {
    container = new Container();
    
    const config = TRPCAppRouterSchema.parse({
      configType: 'TRPC_APP_ROUTER',
      name: 'Test tRPC App',
      basePath: '/api/trpc',
    });

    container.bind('TRPCAppRouterConfig').toConstantValue(config);
    container.bind('ILogger').to(MockLogger);
    container.bind(TRPCAppRouter).toSelf();

    trpcAppRouter = container.get(TRPCAppRouter);
  });

  describe('initialization', () => {
    it('should create a tRPC instance', () => {
      expect(trpcAppRouter.getTRPC()).toBeDefined();
      expect(trpcAppRouter.procedures).toBeDefined();
      expect(trpcAppRouter.router).toBeDefined();
    });

    it('should have correct configuration', () => {
      expect(trpcAppRouter.getName()).toBe('Test tRPC App');
      expect(trpcAppRouter.getBasePath()).toBe('/api/trpc');
    });
  });

  describe('router management', () => {
    it('should start with no routers', () => {
      expect(trpcAppRouter.getRouterNames()).toEqual([]);
      expect(trpcAppRouter.hasRouter('test')).toBe(false);
    });

    it('should add a single router', () => {
      const testRouter = trpcAppRouter.router({
        hello: trpcAppRouter.procedures.query(() => 'world'),
      });

      trpcAppRouter.addRouter('test', testRouter);

      expect(trpcAppRouter.getRouterNames()).toEqual(['test']);
      expect(trpcAppRouter.hasRouter('test')).toBe(true);
    });

    it('should add multiple routers', () => {
      const router1 = trpcAppRouter.router({
        hello: trpcAppRouter.procedures.query(() => 'world'),
      });

      const router2 = trpcAppRouter.router({
        goodbye: trpcAppRouter.procedures.query(() => 'bye'),
      });

      trpcAppRouter.addRouters({
        test1: router1,
        test2: router2,
      });

      expect(trpcAppRouter.getRouterNames()).toEqual(['test1', 'test2']);
      expect(trpcAppRouter.hasRouter('test1')).toBe(true);
      expect(trpcAppRouter.hasRouter('test2')).toBe(true);
    });

    it('should remove a router', () => {
      const testRouter = trpcAppRouter.router({
        hello: trpcAppRouter.procedures.query(() => 'world'),
      });

      trpcAppRouter.addRouter('test', testRouter);
      expect(trpcAppRouter.hasRouter('test')).toBe(true);

      const removed = trpcAppRouter.removeRouter('test');
      expect(removed).toBe(true);
      expect(trpcAppRouter.hasRouter('test')).toBe(false);
    });

    it('should clear all routers', () => {
      const router1 = trpcAppRouter.router({
        hello: trpcAppRouter.procedures.query(() => 'world'),
      });

      const router2 = trpcAppRouter.router({
        goodbye: trpcAppRouter.procedures.query(() => 'bye'),
      });

      trpcAppRouter.addRouters({
        test1: router1,
        test2: router2,
      });

      expect(trpcAppRouter.getRouterNames()).toHaveLength(2);
      
      trpcAppRouter.clearRouters();
      expect(trpcAppRouter.getRouterNames()).toEqual([]);
    });
  });

  describe('merged router', () => {
    it('should create an empty router when no routers are added', () => {
      const mergedRouter = trpcAppRouter.getRouter();
      expect(mergedRouter).toBeDefined();
    });

    it('should merge multiple routers', () => {
      const router1 = trpcAppRouter.router({
        hello: trpcAppRouter.procedures.query(() => 'world'),
      });

      const router2 = trpcAppRouter.router({
        goodbye: trpcAppRouter.procedures.query(() => 'bye'),
      });

      trpcAppRouter.addRouters({
        test1: router1,
        test2: router2,
      });

      const mergedRouter = trpcAppRouter.getRouter();
      expect(mergedRouter).toBeDefined();
      expect(mergedRouter._def.record).toBeDefined();
    });
  });

  describe('Express middleware', () => {
    it('should create Express middleware', () => {
      const middleware = trpcAppRouter.createExpressMiddleware();
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });
  });
}); 