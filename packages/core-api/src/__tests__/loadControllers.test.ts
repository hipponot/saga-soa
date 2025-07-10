import { describe, it, expect } from 'vitest';
import { loadControllers } from '../utils/loadControllers.js';
import { RestControllerBase } from '../rest-controller.js';
import { GQLControllerBase } from '../gql-controller.js';
import path from 'node:path';

const fixturesDir = path.join(__dirname, 'fixtures');
const dummyRestControllerGlob = path.join(fixturesDir, 'DummyRestController.ts');
const dummyGQLControllerGlob = path.join(fixturesDir, 'DummyGQLController.ts');


describe('loadControllers', () => {
  it('loads a controller that extends RestControllerBase', async () => {
    const controllers = await loadControllers(dummyRestControllerGlob, RestControllerBase);
    expect(controllers).toHaveLength(1);
    expect(controllers[0].name).toBe('DummyRestController');
  });

  it('loads a controller that extends GQLControllerBase', async () => {
    const controllers = await loadControllers(dummyGQLControllerGlob, GQLControllerBase);
    expect(controllers).toHaveLength(1);
    expect(controllers[0].name).toBe('DummyGQLController');
  });

  it('throws an error if no controllers are found', async () => {
    const noMatchGlob = path.join(fixturesDir, 'NoSuchController.ts');
    await expect(loadControllers(noMatchGlob, RestControllerBase)).rejects.toThrow('No controllers found');
  });
}); 