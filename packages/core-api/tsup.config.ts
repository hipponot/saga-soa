import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/express-server.ts',
    'src/express-server-schema.ts',
    'src/rest-controller.ts',
    'src/trpc-controller.ts',
    'src/sectors-controller.ts',
    'src/utils/loadControllers.ts',
    'src/gql-controller.ts',
  ],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  splitting: false,
  skipNodeModulesBundle: true,
  target: 'node16',
}); 