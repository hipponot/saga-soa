import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/express-server.ts',
    'src/express-server-schema.ts',
    'src/gql-server.ts',
    'src/gql-server-schema.ts',
    'src/abstract-rest-controller.ts',
    'src/abstract-trpc-controller.ts',
    'src/trpc-server.ts',
    'src/trpc-server-schema.ts',
    'src/sectors-controller.ts',
    'src/utils/loadControllers.ts',
    'src/utils/controller-patterns.ts',
    'src/abstract-gql-controller.ts',
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
