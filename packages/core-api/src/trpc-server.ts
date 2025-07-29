import { injectable, inject } from 'inversify';
import { initTRPC, type AnyRouter, type CreateContextCallback } from '@trpc/server';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import type { ILogger } from '@saga-soa/logger';
import type { TRPCServerConfig } from './trpc-server-schema.js';

@injectable()
export class TRPCServer {
  private readonly t: ReturnType<typeof initTRPC.create>;
  private routers: Record<string, AnyRouter> = {};
  private mergedRouter?: AnyRouter;

  constructor(
    @inject('TRPCServerConfig') private config: TRPCServerConfig,
    @inject('ILogger') private logger: ILogger
  ) {
    this.t = initTRPC.create();
  }

  /**
   * Get the shared tRPC instance for creating procedures and middleware
   */
  public getTRPC() {
    return this.t;
  }

  /**
   * Get the shared procedures from the tRPC instance
   */
  public get procedures() {
    return this.t.procedure;
  }

  /**
   * Get the shared router builder from the tRPC instance
   */
  public get router() {
    return this.t.router;
  }

  /**
   * Add a single router with a name
   */
  public addRouter(name: string, router: AnyRouter): void {
    if (this.routers[name]) {
      this.logger.warn(`Router '${name}' already exists and will be overwritten`);
    }
    
    this.routers[name] = router;
    this.mergedRouter = undefined; // Reset merged router to force regeneration
    this.logger.info(`Added tRPC router '${name}'`);
  }

  /**
   * Add multiple routers at once
   */
  public addRouters(routers: Record<string, AnyRouter>): void {
    for (const [name, router] of Object.entries(routers)) {
      this.addRouter(name, router);
    }
  }

  /**
   * Get the final merged router with all added routers
   */
  public getRouter(): AnyRouter {
    if (!this.mergedRouter) {
      if (Object.keys(this.routers).length === 0) {
        // Create an empty router if no routers have been added
        this.mergedRouter = this.t.router({});
      } else {
        // Create a namespaced router with each router as a sub-router
        const namespacedRouters: Record<string, AnyRouter> = {};
        for (const [name, router] of Object.entries(this.routers)) {
          namespacedRouters[name] = router;
        }
        this.mergedRouter = this.t.router(namespacedRouters);
      }
      this.logger.info(`Created namespaced tRPC router with ${Object.keys(this.routers).length} routers`);
    }
    
    return this.mergedRouter;
  }

  /**
   * Create Express middleware for the merged router
   */
  public createExpressMiddleware() {
    const router = this.getRouter();
    
    return createExpressMiddleware({
      router,
      createContext: this.config.contextFactory || (async () => ({})),
      onError: ({ error }) => {
        this.logger.error('tRPC Error:', error);
      },
    });
  }

  /**
   * Get the base path for the tRPC API
   */
  public getBasePath(): string {
    return this.config.basePath;
  }

  /**
   * Get the name of this tRPC app
   */
  public getName(): string {
    return this.config.name;
  }

  /**
   * Get all registered router names
   */
  public getRouterNames(): string[] {
    return Object.keys(this.routers);
  }

  /**
   * Check if a router with the given name exists
   */
  public hasRouter(name: string): boolean {
    return name in this.routers;
  }

  /**
   * Remove a router by name
   */
  public removeRouter(name: string): boolean {
    if (this.routers[name]) {
      delete this.routers[name];
      this.mergedRouter = undefined; // Reset merged router to force regeneration
      this.logger.info(`Removed tRPC router '${name}'`);
      return true;
    }
    return false;
  }

  /**
   * Clear all routers
   */
  public clearRouters(): void {
    this.routers = {};
    this.mergedRouter = undefined;
    this.logger.info('Cleared all tRPC routers');
  }
} 