import { MongoClient } from 'mongodb';

export interface IMongoProvider {
  readonly instanceName: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getClient(): MongoClient;
}