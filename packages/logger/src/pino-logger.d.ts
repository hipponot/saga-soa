import { ILogger } from './i-logger';
import type { PinoLoggerConfig } from './pino-logger-schema';
export declare class PinoLogger implements ILogger {
    private config;
    private readonly logger;
    constructor(config: PinoLoggerConfig);
    info(message: string, data?: object): void;
    warn(message: string, data?: object): void;
    error(message: string, error?: Error, data?: object): void;
    debug(message: string, data?: object): void;
}
//# sourceMappingURL=pino-logger.d.ts.map