import { Get, Post, Controller, HttpCode } from 'routing-controllers';
import { injectable, inject } from 'inversify';
import type { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
import { MONGO_CLIENT } from '@saga/soa-db';
import type { ILogger } from '@saga/soa-logger';
import { RestControllerBase, REST_API_BASE_PATH } from '@saga/soa-core-api/rest-controller';

const SECTOR = 'hello-mongo';
const TEST_COLLECTION = 'hello_mongo_test';
const TEST_DOC = { _id: new ObjectId('64b7f8f8f8f8f8f8f8f8f8f8'), message: 'Hello from Mongo!' };

@Controller(`/${REST_API_BASE_PATH}/${SECTOR}`)
@injectable()
export class HelloMongo extends RestControllerBase {
  readonly sectorName = SECTOR;
  constructor(
    @inject('ILogger') logger: ILogger,
    @inject(MONGO_CLIENT) private client: MongoClient
  ) {
    super(logger, SECTOR);
  }

  @Post('/test-write')
  @HttpCode(201)
  async writeDoc() {
    const db = this.client.db();
    await db.collection(TEST_COLLECTION).insertOne(TEST_DOC);
    return { ok: true };
  }

  @Get('/test-read')
  async readDoc() {
    const db = this.client.db();
    const doc = await db.collection(TEST_COLLECTION).findOne({ _id: TEST_DOC._id });
    if (!doc) return { error: 'Not found' };
    return doc;
  }

  async init() {
    // Async setup if needed
  }
}