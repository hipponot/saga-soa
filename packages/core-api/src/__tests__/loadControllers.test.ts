import { describe, it, expect } from 'vitest';
import { loadControllers } from '../utils/loadControllers.js';
import { AbstractRestController } from '../abstract-rest-controller.js';
import { AbstractGQLController } from '../abstract-gql-controller.js';
import path from 'node:path';

const fixturesDir = path.join(__dirname, 'fixtures');
const dummyRestControllerGlob = path.join(fixturesDir, 'DummyRestController.ts');
const dummyGQLControllerGlob = path.join(fixturesDir, 'DummyGQLController.ts');


describe('loadControllers', () => {
  it('loads a controller that extends AbstractRestController', async () => {
    const controllers = await loadControllers(dummyRestControllerGlob, AbstractRestController);
    expect(controllers).toHaveLength(1);
    expect(controllers[0].name).toBe('DummyRestController');
  });

  it('loads a controller that extends AbstractGQLController', async () => {
    const controllers = await loadControllers(dummyGQLControllerGlob, AbstractGQLController);
    expect(controllers).toHaveLength(1);
    expect(controllers[0].name).toBe('DummyGQLController');
  });

  it('throws an error if no controllers are found', async () => {
    const noMatchGlob = path.join(fixturesDir, 'NoSuchController.ts');
    await expect(loadControllers(noMatchGlob, AbstractRestController)).rejects.toThrow('No controllers found');
  });
}); 