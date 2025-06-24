var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { injectable } from 'inversify';
let MockLogger = class MockLogger {
    logs = [];
    info(message, data) {
        this.logs.push({ level: 'info', message, data });
    }
    warn(message, data) {
        this.logs.push({ level: 'warn', message, data });
    }
    error(message, error, data) {
        this.logs.push({ level: 'error', message, error, data });
    }
    debug(message, data) {
        this.logs.push({ level: 'debug', message, data });
    }
    clear() {
        this.logs = [];
    }
};
MockLogger = __decorate([
    injectable()
], MockLogger);
export { MockLogger };
