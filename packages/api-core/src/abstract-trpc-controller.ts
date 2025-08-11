import { injectable, inject } from 'inversify';
import type { ILogger } from '@saga-soa/logger';
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export abstract class AbstractTRPCController {
  protected logger: ILogger;
  abstract readonly sectorName: string;

  constructor(@inject('ILogger') logger: ILogger) {
    this.logger = logger;
  }

  createProcedure() {
    return publicProcedure;
  }
}
