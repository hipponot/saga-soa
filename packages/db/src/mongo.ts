import { injectable } from 'inversify';
import { MongoClient } from 'mongodb';
import { z } from 'zod';
import { IMongoProvider } from './i-mongo-connection-manager';

export const MongoProviderSchema = z.object({
  configType: z.literal('mongo'),
  instanceName: z.string().min(1),
  host: z.string().min(1),
  port: z.number().int().positive(),
  database: z.string().min(1),
  username: z.string().optional(),
  password: z.string().optional(),
  options: z.record(z.string(), z.any()).optional(),
});

export type MongoProviderConfig = z.infer<typeof MongoProviderSchema>;

@injectable()
export class MongoProvider implements IMongoProvider {
  public readonly instanceName: string;
  private client: MongoClient | null = null;
  private config: MongoProviderConfig;

  constructor(config: MongoProviderConfig) {
    this.config = config;
    this.instanceName = config.instanceName;
  }

  async connect(): Promise<void> {
    if (this.client && this.isConnected()) return;
    const uri = this._buildConnectionString();
    this.client = new MongoClient(uri, this.config.options);
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  isConnected(): boolean {
    return !!this.client && !(this.client as any).closed;
  }

  getClient(): MongoClient {
    if (!this.client) {
      throw new Error('MongoClient is not connected');
    }
    return this.client;
  }

  private _buildConnectionString(): string {
    const { host, port, database, username, password } = this.config;
    let auth = '';
    if (username && password) {
      auth = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
    }
    return `mongodb://${auth}${host}:${port}/${database}`;
  }

  // TODO: Add reconnection logic and event listeners as needed
}

export const MongoProviderFactory = Symbol('MongoProviderFactory');
export type MongoProviderFactory = (config: MongoProviderConfig) => MongoProvider;

// Usage (in your Inversify container setup):
// container.bind<MongoProviderFactory>(MongoProviderFactory)
//   .toFactory<MongoProvider>((context) => (config: MongoProviderConfig) => {
//     const instance = new MongoProvider(config);
//     context.container.bind<MongoProvider>(MongoProvider)
//       .toConstantValue(instance)
//       .whenTargetNamed(config.instanceName);
//     return instance;
//   });
