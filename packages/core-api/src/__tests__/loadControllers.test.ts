import { describe, it, expect } from 'vitest';
import { loadControllers } from '../utils/loadControllers.js';
import { RestControllerBase } from '../rest-controller.js';
import path from 'node:path';

const fixturesDir = path.join(__dirname, 'fixtures');
const dummyControllerGlob = path.join(fixturesDir, 'DummyRestController.ts');

describe('loadControllers', () => {
  it('loads a controller that extends RestControllerBase', async () => {
    const controllers = await loadControllers(dummyControllerGlob, RestControllerBase);
    expect(controllers).toHaveLength(1);
    expect(controllers[0].name).toBe('DummyRestController');
  });
}); 