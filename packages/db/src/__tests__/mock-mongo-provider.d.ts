import { MongoClient } from 'mongodb';
import { IMongoProvider } from '../i-mongo-connection-manager';
export declare class MockMongoProvider implements IMongoProvider {
    readonly instanceName: string;
    private client;
    private mongoServer;
    constructor(instanceName?: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getClient(): MongoClient;
}
//# sourceMappingURL=mock-mongo-provider.d.ts.map