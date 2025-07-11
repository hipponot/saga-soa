import fg from 'fast-glob';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadControllers<TBase>(
  globPatterns: string | string[],
  baseClass: abstract new (...args: any[]) => TBase
): Promise<[
  new (...args: any[]) => TBase,
  ...Array<new (...args: any[]) => TBase>
]> {
  // Support single string, array, or varargs
  const patterns = Array.isArray(globPatterns) ? globPatterns : [globPatterns];
  const files = await fg(patterns, { absolute: true });
  const controllers: Array<new (...args: any[]) => TBase> = [];

  for (const file of files) {
    const mod = await import(pathToFileURL(file).href);
    // Check default export first
    const candidate = mod.default;
    if (
      typeof candidate === 'function' &&
      candidate.prototype instanceof baseClass
    ) {
      controllers.push(candidate);
    } else {
      // Check all named exports
      for (const key of Object.keys(mod)) {
        const named = mod[key];
        if (
          typeof named === 'function' &&
          named.prototype instanceof baseClass
        ) {
          controllers.push(named);
        }
      }
    }
  }
  if (controllers.length === 0) {
    throw new Error(`No controllers found for patterns: ${patterns.join(', ')}`);
  }
  return controllers as [new (...args: any[]) => TBase, ...Array<new (...args: any[]) => TBase>];
}