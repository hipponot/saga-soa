import { Application } from 'express';
import type { ExpressServerConfig } from './express-server-schema';
import type { ILogger } from '@saga-soa/logger';
export declare class ExpressServer {
    private config;
    private logger;
    private readonly app;
    private serverInstance?;
    constructor(config: ExpressServerConfig, logger: ILogger);
    start(): void;
    stop(): void;
    getApp(): Application;
}
//# sourceMappingURL=express-server.d.ts.map