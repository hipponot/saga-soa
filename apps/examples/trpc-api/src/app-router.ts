import { initTRPC } from '@trpc/server';
import { projectRouter } from './sectors/project/trpc/project.router.js';
import { runRouter } from './sectors/run/trpc/run.router.js';

const t = initTRPC.create();

export const appRouter = t.router({
  project: projectRouter,
  run: runRouter,
});

export type AppRouter = typeof appRouter; 