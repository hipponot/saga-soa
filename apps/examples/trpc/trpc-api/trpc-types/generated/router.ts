// Auto-generated - do not edit
// This file is dynamically generated based on sectors in src/sectors/*/trpc/
import { initTRPC } from '@trpc/server';
import * as projectSchemas from './schemas/project.schemas.js';
import * as runSchemas from './schemas/run.schemas.js';

const t = initTRPC.create();

export const staticAppRouter = t.router({
  project: t.router({
    getAllProjects: t.procedure.query(() => []),
    getProjectById: t.procedure.input(projectSchemas.GetProjectSchema).query(() => ({})),
    createProject: t.procedure.input(projectSchemas.CreateProjectSchema).mutation(() => ({})),
    updateProject: t.procedure.input(projectSchemas.UpdateProjectSchema).mutation(() => ({})),
    deleteProject: t.procedure.input(projectSchemas.GetProjectSchema).mutation(() => ({})),
  }),
  run: t.router({
    getAllRuns: t.procedure.query(() => []),
    getRunById: t.procedure.input(runSchemas.GetRunSchema).query(() => ({})),
    createRun: t.procedure.input(runSchemas.CreateRunSchema).mutation(() => ({})),
    updateRun: t.procedure.input(runSchemas.UpdateRunSchema).mutation(() => ({})),
    deleteRun: t.procedure.input(runSchemas.GetRunSchema).mutation(() => ({})),
  }),
});

export type AppRouter = typeof staticAppRouter;
