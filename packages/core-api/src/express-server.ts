import express, { Application } from 'express';
import { injectable, inject } from 'inversify';
import type { ExpressServerConfig } from './express-server-schema';
import type { ILogger } from '@saga-soa/logger';

@injectable()
export class ExpressServer {
  private readonly app: Application;
  private serverInstance?: ReturnType<Application['listen']>;

  constructor(
    @inject('ExpressServerConfig') private config: ExpressServerConfig,
    @inject('ILogger') private logger: ILogger
  ) {
    this.app = express();
  }

  public start(): void {
    this.serverInstance = this.app.listen(this.config.port, () => {
      this.logger.info(
        `Express server '${this.config.name}' started on port ${this.config.port}`
      );
    });
  }

  public stop(): void {
    if (this.serverInstance) {
      this.serverInstance.close(() => {
        this.logger.info(
          `Express server '${this.config.name}' stopped.`
        );
      });
    }
  }

  public getApp(): Application {
    return this.app;
  }
} 