var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { injectable } from 'inversify';
import { MongoClient } from 'mongodb';
let MongoProvider = class MongoProvider {
    instanceName;
    client = null;
    config;
    constructor(config) {
        this.config = config;
        this.instanceName = config.instanceName;
    }
    async connect() {
        if (this.isConnected())
            return;
        const uri = this._buildConnectionString();
        this.client = new MongoClient(uri, this.config.options);
        await this.client.connect();
    }
    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.client = null;
        }
    }
    isConnected() {
        return !!this.client && !this.client.closed;
    }
    getClient() {
        if (!this.client) {
            throw new Error('MongoClient is not connected');
        }
        return this.client;
    }
    _buildConnectionString() {
        const { host, port, database, username, password } = this.config;
        let auth = '';
        if (username && password) {
            auth = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
        }
        return `mongodb://${auth}${host}:${port}/${database}`;
    }
};
MongoProvider = __decorate([
    injectable(),
    __metadata("design:paramtypes", [Object])
], MongoProvider);
export { MongoProvider };
export const MongoProviderFactory = Symbol('MongoProviderFactory');
