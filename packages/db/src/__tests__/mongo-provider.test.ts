import 'reflect-metadata';
import { Container }                                from 'inversify';
import { IMongoProvider }                           from '../i-mongo-connection-manager';
import { MockMongoProvider }                        from './mock-mongo-provider';
import { IConfigManager, MockConfigManager }        from '@saga-soa/config';
import { MongoProviderSchema, MongoProviderConfig } from '../mongo';
import { z }                                        from 'zod';

describe('MockMongoProvider (Inversify Factory with MockConfigManager)', () => {
  const MOCK_INSTANCE_NAME = 'MockMongoDB';
  let container: Container;
  let mockConfig: MongoProviderConfig;

  beforeEach(() => {
    container = new Container();
    // Bind the mock config manager
    container.bind<IConfigManager>('IConfigManager').to(MockConfigManager);
    const configManager = container.get<IConfigManager>('IConfigManager');
    // Generate a mock config using the schema
    mockConfig = configManager.get(MongoProviderSchema.extend({
      instanceName: MongoProviderSchema.shape.instanceName.default(MOCK_INSTANCE_NAME),
      configType: z.literal('mongo')
    }));
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