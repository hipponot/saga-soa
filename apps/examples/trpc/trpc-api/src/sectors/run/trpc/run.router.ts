import { injectable, inject } from 'inversify';
import { AbstractTRPCController, router } from '@saga-soa/core-api/abstract-trpc-controller';
import type { ILogger } from '@saga-soa/logger';
import {
  CreateRunSchema,
  UpdateRunSchema,
  GetRunSchema,
  type CreateRunInput,
  type UpdateRunInput,
  type GetRunInput,
} from './run.types.js';
import { getAllRuns, getRunById, createRun, updateRun, deleteRun } from './run.data.js';

@injectable()
export class RunController extends AbstractTRPCController {
  readonly sectorName = 'run';

  constructor(@inject('ILogger') logger: ILogger) {
    super(logger);
  }

  createRouter() {
    const t = this.createProcedure();

    return router({
      // Get all runs
      getAllRuns: t.query(() => {
        return getAllRuns();
      }),

      // Get run by ID
      getRunById: t.input(GetRunSchema).query(({ input }: { input: GetRunInput }) => {
        const run = getRunById(input.id);
        if (!run) {
          throw new Error('Run not found');
        }
        return run;
      }),

      // Create run
      createRun: t.input(CreateRunSchema).mutation(({ input }: { input: CreateRunInput }) => {
        return createRun(input);
      }),

      // Update run
      updateRun: t.input(UpdateRunSchema).mutation(({ input }: { input: UpdateRunInput }) => {
        const updatedRun = updateRun(input);
        if (!updatedRun) {
          throw new Error('Run not found');
        }
        return updatedRun;
      }),

      // Delete run
      deleteRun: t.input(GetRunSchema).mutation(({ input }: { input: GetRunInput }) => {
        const success = deleteRun(input.id);
        if (!success) {
          throw new Error('Run not found');
        }
        return { success: true, message: 'Run deleted successfully' };
      }),
    });
  }
}
