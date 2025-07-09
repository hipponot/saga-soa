import fg from 'fast-glob';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadControllers<T>(
  globPattern: string,
  baseClass: abstract new (...args: any[]) => T
): Promise<Array<new (...args: any[]) => T>> {
  const files = await fg(globPattern, { absolute: true });
  const controllers: Array<new (...args: any[]) => T> = [];

  for (const file of files) {
    const mod = await import(pathToFileURL(file).href);
    const candidate = mod.default;
    if (
      typeof candidate === 'function' &&
      candidate.prototype instanceof baseClass
    ) {
      controllers.push(candidate);
    }
  }
  return controllers;
} 