import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/express-server.ts',
    'src/express-server-schema.ts',
    'src/rest/rest-endpoint-group.ts',
    'src/rest/rest-router.ts'
  ],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  splitting: false,
  skipNodeModulesBundle: true,
}); 