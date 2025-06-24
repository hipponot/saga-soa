var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { injectable, inject } from 'inversify';
import pino from 'pino';
let PinoLogger = class PinoLogger {
    config;
    logger;
    constructor(config) {
        this.config = config;
        const env = process.env.NODE_ENV || 'development';
        const isForeground = Boolean(process.stdout.isTTY);
        const isExpressContext = config.isExpressContext;
        const logFile = config.logFile;
        const targets = [];
        // Enforce production Express context rule
        if (env === 'production' && isExpressContext && !logFile) {
            throw new Error('In production Express context, logFile must be specified for the logger.');
        }
        // NODE_ENV=local
        if (env === 'local') {
            // Always console logger
            targets.push({
                target: config.prettyPrint ? 'pino-pretty' : 'pino/file',
                options: config.prettyPrint
                    ? {
                        colorize: true,
                        levelFirst: true,
                        translateTime: 'SYS:standard',
                    }
                    : { destination: 1 }, // STDOUT
            });
            // File logger if specified
            if (logFile) {
                targets.push({
                    target: 'pino/file',
                    options: { destination: logFile },
                });
            }
        }
        // NODE_ENV=development
        else if (env === 'development') {
            if (isExpressContext && isForeground) {
                targets.push({
                    target: config.prettyPrint ? 'pino-pretty' : 'pino/file',
                    options: config.prettyPrint
                        ? {
                            colorize: true,
                            levelFirst: true,
                            translateTime: 'SYS:standard',
                        }
                        : { destination: 1 },
                });
            }
            if (logFile) {
                targets.push({
                    target: 'pino/file',
                    options: { destination: logFile },
                });
            }
        }
        // NODE_ENV=production
        else if (env === 'production') {
            if (isExpressContext) {
                // Always file logger (already enforced above)
                targets.push({
                    target: 'pino/file',
                    options: { destination: logFile },
                });
                if (isForeground) {
                    targets.push({
                        target: config.prettyPrint ? 'pino-pretty' : 'pino/file',
                        options: config.prettyPrint
                            ? {
                                colorize: true,
                                levelFirst: true,
                                translateTime: 'SYS:standard',
                            }
                            : { destination: 1 },
                    });
                }
            }
        }
        // Fallback/default: always log to console
        if (targets.length === 0) {
            targets.push({
                target: config.prettyPrint ? 'pino-pretty' : 'pino/file',
                options: config.prettyPrint
                    ? {
                        colorize: true,
                        levelFirst: true,
                        translateTime: 'SYS:standard',
                    }
                    : { destination: 1 },
            });
        }
        this.logger = pino({
            level: config.level,
            transport: {
                targets,
            },
        });
        this.logger.info(`Logger initialized with level ${config.level}`);
    }
    info(message, data) {
        if (data) {
            this.logger.info(data, message);
        }
        else {
            this.logger.info(message);
        }
    }
    warn(message, data) {
        if (data) {
            this.logger.warn(data, message);
        }
        else {
            this.logger.warn(message);
        }
    }
    error(message, error, data) {
        const logObject = { ...data, err: error };
        this.logger.error(logObject, message);
    }
    debug(message, data) {
        if (data) {
            this.logger.debug(data, message);
        }
        else {
            this.logger.debug(message);
        }
    }
};
PinoLogger = __decorate([
    injectable(),
    __param(0, inject('PinoLoggerConfig')),
    __metadata("design:paramtypes", [Object])
], PinoLogger);
export { PinoLogger };
