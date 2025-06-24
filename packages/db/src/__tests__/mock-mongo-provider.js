import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
export class MockMongoProvider {
    instanceName;
    client = null;
    mongoServer = null;
    constructor(instanceName = 'MockMongoDB') {
        this.instanceName = instanceName;
    }
    async connect() {
        this.mongoServer = await MongoMemoryServer.create();
        const uri = this.mongoServer.getUri();
        this.client = new MongoClient(uri);
        await this.client.connect();
    }
    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.client = null;
        }
        if (this.mongoServer) {
            await this.mongoServer.stop();
            this.mongoServer = null;
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
}
