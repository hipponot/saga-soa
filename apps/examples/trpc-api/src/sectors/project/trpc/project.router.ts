import { inject } from 'inversify';
import { TRPCControllerBase } from '@saga-soa/core-api/trpc-controller';
import type { ILogger } from '@saga-soa/logger';
import { z } from 'zod';
import { initTRPC } from '@trpc/server';
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

// Create tRPC instance for this router
const t = initTRPC.create();

export const projectRouter = t.router({
  // Get all projects
  getAll: t.procedure
    .query(() => {
      return getAllProjects();
    }),

  // Get project by ID
  getById: t.procedure
    .input(GetProjectSchema)
    .query(({ input }: { input: GetProjectInput }) => {
      const project = getProjectById(input.id);
      if (!project) {
        throw new Error('Project not found');
      }
      return project;
    }),

  // Create new project
  create: t.procedure
    .input(CreateProjectSchema)
    .mutation(({ input }: { input: CreateProjectInput }) => {
      return createProject(input);
    }),

  // Update project
  update: t.procedure
    .input(UpdateProjectSchema)
    .mutation(({ input }: { input: UpdateProjectInput }) => {
      const project = updateProject(input);
      if (!project) {
        throw new Error('Project not found');
      }
      return project;
    }),

  // Delete project
  delete: t.procedure
    .input(GetProjectSchema)
    .mutation(({ input }: { input: GetProjectInput }) => {
      const success = deleteProject(input.id);
      if (!success) {
        throw new Error('Project not found');
      }
      return { success: true, message: 'Project deleted successfully' };
    }),
}); 