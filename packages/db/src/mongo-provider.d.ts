import { MongoClient } from 'mongodb';
import { IMongoProvider } from './i-mongo-connection-manager';
import type { MongoProviderConfig } from './mongo-provider-config';
export declare class MongoProvider implements IMongoProvider {
    readonly instanceName: string;
    private client;
    private config;
    constructor(config: MongoProviderConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getClient(): MongoClient;
    private _buildConnectionString;
}
export declare const MongoProviderFactory: unique symbol;
export type MongoProviderFactory = (config: MongoProviderConfig) => MongoProvider;
//# sourceMappingURL=mongo-provider.d.ts.map