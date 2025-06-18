import 'reflect-metadata';
import { Container } from 'inversify';
import { IMongoProvider } from '../i-mongo-connection-manager';
import { MockMongoProvider } from './mock-mongo-provider';
import { IConfigManager, MockConfigManager } from '@saga-soa/config';
import { MongoProviderSchema } from '../mongo-provider-config';
import type { MongoProviderConfig } from '../mongo-provider-config';
import { z } from 'zod';

describe('MockMongoProvider (Inversify Factory with MockConfigManager)', () => {
  const MOCK_INSTANCE_NAME = 'MockMongoDB';
  let container: Container;
  let mockConfig: MongoProviderConfig;

  beforeEach(() => {
    container = new Container();
    // Provide a valid mock config directly
    mockConfig = {
      configType: 'MONGO',
      instanceName: MOCK_INSTANCE_NAME,
      host: 'localhost',
      port: 27017,
      database: 'testdb',
      username: 'user',
      password: 'pass',
      options: {},
    };
    // Bind the factory for the mock provider
    container.bind<IMongoProvider>(MockMongoProvider)
      .toDynamicValue(() => new MockMongoProvider(mockConfig.instanceName))
      .whenTargetNamed(MOCK_INSTANCE_NAME);
  });

  afterEach(async () => {
    container.unbindAll();
  });

  it('should connect, check isConnected, getClient, and disconnect', async () => {
    const provider = container.getNamed<IMongoProvider>(MockMongoProvider, MOCK_INSTANCE_NAME);
    expect(provider.isConnected()).toBe(false);
    await provider.connect();
    expect(provider.isConnected()).toBe(true);
    const client = provider.getClient();
    expect(client).toBeDefined();
    await provider.disconnect();
    expect(provider.isConnected()).toBe(false);
  });

  it('should throw if getClient is called before connect', () => {
    const provider = container.getNamed<IMongoProvider>(MockMongoProvider, MOCK_INSTANCE_NAME);
    expect(() => provider.getClient()).toThrow('MongoClient is not connected');
  });
});