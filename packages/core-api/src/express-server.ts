import express, { Application }                                                 from 'express';
import { injectable, inject }                                                   from 'inversify';
import type { ExpressServerConfig }                                             from './express-server-schema';
import type { ILogger }                                                         from '@saga-soa/logger';
import { useContainer, useExpressServer }                                        from 'routing-controllers';
import { Container }                                                            from 'inversify';

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

  public async init(container: Container, controllersModule: any): Promise<void> {
    // Ensure routing-controllers uses Inversify for controller resolution
    useContainer(container);

    // Discover all sector controller classes (extending RestControllerBase)
    const controllerClasses = Object.values(controllersModule).filter(
      (ctrl): ctrl is new (...args: any[]) => any => typeof ctrl === 'function' && ctrl.prototype && ctrl.prototype.init
    );

    // Remove controller binding logic from here

    // Resolve and initialize all controllers
    for (const Ctrl of controllerClasses) {
      const instance = await container.getAsync<any>(Ctrl);
      if (typeof instance.init === 'function') {
        await instance.init();
      }
    }

    // Register controller classes with routing-controllers
    useExpressServer(this.app, {
      controllers: controllerClasses as Function[],
    });
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

