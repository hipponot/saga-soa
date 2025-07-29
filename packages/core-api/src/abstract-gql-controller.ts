import { injectable, inject } from 'inversify';
import type { ILogger } from '@saga-soa/logger';

export const GQL_API_BASE_PATH = 'saga-soa/graphql';

@injectable()
export abstract class AbstractGQLController {
  protected logger: ILogger;
  abstract readonly sectorName: string;

  constructor(@inject('ILogger') logger: ILogger) {
    this.logger = logger;
  }
} 