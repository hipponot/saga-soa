import { injectable, inject } from 'inversify';
import type { ILogger } from '@saga-soa/logger';
import { initTRPC } from '@trpc/server';

// Initialize tRPC
const t = initTRPC.create();

export const { router, procedure } = t;

@injectable()
export abstract class TRPCControllerBase {
  protected logger: ILogger;
  abstract readonly sectorName: string;

  constructor(@inject('ILogger') logger: ILogger) {
    this.logger = logger;
  }

  // Helper method to create a procedure with logging
  protected createProcedure() {
    return procedure.use(async ({ next, path }) => {
      this.logger.info(`tRPC procedure called: ${path}`);
      return next();
    });
  }

  // Abstract method that each sector must implement
  abstract createRouter(): ReturnType<typeof router>;
} 