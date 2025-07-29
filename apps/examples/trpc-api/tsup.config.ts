import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: [
    "src/main.ts",
    "src/inversify.config.ts",
    "src/sectors/**/*",
  ],
  clean: true,
  format: ["esm"],
  sourcemap: true,
  dts: true,
  outDir: 'dist',
  splitting: false,
  skipNodeModulesBundle: true,
  target: 'node16',
  ...options,
})); 