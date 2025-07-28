import { injectable, inject } from 'inversify';
import { TRPCControllerBase, router } from '@saga-soa/core-api/trpc-controller';
import type { ILogger } from '@saga-soa/logger';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  GetProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type GetProjectInput,
} from './project.types.js';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from './project.data.js';

@injectable()
export class ProjectController extends TRPCControllerBase {
  readonly sectorName = 'project';

  constructor(@inject('ILogger') logger: ILogger) {
    super(logger);
  }

  createRouter() {
    const t = this.createProcedure();

    return router({
      // Get all projects
      getAllProjects: t
        .query(() => {
          return getAllProjects();
        }),

      // Get project by ID
      getProjectById: t
        .input(GetProjectSchema)
        .query(({ input }: { input: GetProjectInput }) => {
          const project = getProjectById(input.id);
          if (!project) {
            throw new Error('Project not found');
          }
          return project;
        }),

      // Create project
      createProject: t
        .input(CreateProjectSchema)
        .mutation(({ input }: { input: CreateProjectInput }) => {
          return createProject(input);
        }),

      // Update project
      updateProject: t
        .input(UpdateProjectSchema)
        .mutation(({ input }: { input: UpdateProjectInput }) => {
          const updatedProject = updateProject(input);
          if (!updatedProject) {
            throw new Error('Project not found');
          }
          return updatedProject;
        }),

      // Delete project
      deleteProject: t
        .input(GetProjectSchema)
        .mutation(({ input }: { input: GetProjectInput }) => {
          const success = deleteProject(input.id);
          if (!success) {
            throw new Error('Project not found');
          }
          return { success: true, message: 'Project deleted successfully' };
        }),
    });
  }
}