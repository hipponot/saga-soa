import { inject } from 'inversify';
import { TRPCControllerBase } from '@saga-soa/core-api/trpc-controller';
import type { ILogger } from '@saga-soa/logger';
import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import {
  CreateRunSchema,
  UpdateRunSchema,
  GetRunSchema,
  GetRunsByProjectSchema,
  type CreateRunInput,
  type UpdateRunInput,
  type GetRunInput,
  type GetRunsByProjectInput,
} from './run.types.js';
import {
  getAllRuns,
  getRunById,
  getRunsByProject,
  createRun,
  updateRun,
  deleteRun,
} from './run.data.js';

// Create tRPC instance for this router
const t = initTRPC.create();

export const runRouter = t.router({
  // Get all runs
  getAll: t.procedure
    .query(() => {
      return getAllRuns();
    }),

  // Get run by ID
  getById: t.procedure
    .input(GetRunSchema)
    .query(({ input }: { input: GetRunInput }) => {
      const run = getRunById(input.id);
      if (!run) {
        throw new Error('Run not found');
      }
      return run;
    }),

  // Get runs by project ID
  getByProject: t.procedure
    .input(GetRunsByProjectSchema)
    .query(({ input }: { input: GetRunsByProjectInput }) => {
      return getRunsByProject(input.projectId);
    }),

  // Create new run
  create: t.procedure
    .input(CreateRunSchema)
    .mutation(({ input }: { input: CreateRunInput }) => {
      return createRun(input);
    }),

  // Update run
  update: t.procedure
    .input(UpdateRunSchema)
    .mutation(({ input }: { input: UpdateRunInput }) => {
      const run = updateRun(input);
      if (!run) {
        throw new Error('Run not found');
      }
      return run;
    }),

  // Delete run
  delete: t.procedure
    .input(GetRunSchema)
    .mutation(({ input }: { input: GetRunInput }) => {
      const success = deleteRun(input.id);
      if (!success) {
        throw new Error('Run not found');
      }
      return { success: true, message: 'Run deleted successfully' };
    }),
}); 