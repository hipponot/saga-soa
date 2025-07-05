import { Request, Response, Router } from 'express';
import { injectable, inject }        from 'inversify';
import type { MongoClient }          from 'mongodb';
import { ObjectId }                  from 'mongodb';
import { MONGO_CLIENT }              from '@saga-soa/db';

const TEST_COLLECTION = 'hello_mongo_test';
const TEST_DOC = { _id: new ObjectId('64b7f8f8f8f8f8f8f8f8f8f8'), message: 'Hello from Mongo!' };

@injectable()
export class HelloMongoSector {
  public readonly router: Router;

  constructor(@inject(MONGO_CLIENT) private client: MongoClient) {
    this.router = Router();
    this.router.post('/hello-mongo', this.writeDoc);
    this.router.get('/hello-mongo', this.readDoc);
  }

  writeDoc = async (req: Request, res: Response) => {
    try {
      const db = this.client.db();
      await db.collection(TEST_COLLECTION).insertOne(TEST_DOC);
      res.status(201).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  };

  readDoc = async (req: Request, res: Response) => {
    try {
      const db = this.client.db();
      const doc = await db.collection(TEST_COLLECTION).findOne({ _id: TEST_DOC._id });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  };
}