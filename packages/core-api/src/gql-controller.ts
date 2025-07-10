import { injectable, inject } from 'inversify';
import type { ILogger } from '@saga-soa/logger';

@injectable()
export abstract class GQLControllerBase {
  protected logger: ILogger;
  abstract readonly sectorName: string;

  constructor(@inject('ILogger') logger: ILogger) {
    this.logger = logger;
  }
} 