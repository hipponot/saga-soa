import { ILogger, LogLevel } from '../i-logger';
interface LogEntry {
    level: LogLevel;
    message: string;
    data?: object;
    error?: Error;
}
export declare class MockLogger implements ILogger {
    logs: LogEntry[];
    info(message: string, data?: object): void;
    warn(message: string, data?: object): void;
    error(message: string, error?: Error, data?: object): void;
    debug(message: string, data?: object): void;
    clear(): void;
}
export {};
//# sourceMappingURL=mock-logger.d.ts.map