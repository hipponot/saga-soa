import { beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Test setup - clean output directory before and after tests
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, 'output');

beforeAll(async () => {
  try {
    await fs.rm(outputDir, { recursive: true, force: true });
  } catch (error) {
    // Directory doesn't exist, that's fine
  }
});

afterAll(async () => {
  try {
    await fs.rm(outputDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
});
