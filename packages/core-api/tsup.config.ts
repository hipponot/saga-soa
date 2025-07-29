import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/express-server.ts',
    'src/express-server-schema.ts',
    'src/abstract-rest-controller.ts',
    'src/abstract-trpc-controller.ts',
    'src/trpc-app-router.ts',
    'src/trpc-app-router-schema.ts',
    'src/sectors-controller.ts',
    'src/utils/loadControllers.ts',
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