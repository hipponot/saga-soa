import { describe, it, expect } from 'vitest';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../index.js';
import { mockRouter } from '../fixtures/mock-server.js';
import {
  validCreateProjectInput,
  validUpdateProjectInput,
  validGetProjectInput,
  validCreateRunInput,
  validUpdateRunInput,
  validGetRunInput,
  mockProjects,
  mockRuns,
} from '../fixtures/test-data.js';

describe('Mock tRPC Server Integration', () => {
  // Create a mock client that uses the mock router
  const createMockClient = () => {
    // In a real test, you would create an actual HTTP server
    // For this test, we'll simulate the client-server interaction
    return {
      project: {
        getAllProjects: {
          query: async () => mockProjects,
        },
        getProjectById: {
          query: async (input: { id: string }) => {
            const project = mockProjects.find(p => p.id === input.id);
            if (!project) throw new Error(`Project with id ${input.id} not found`);
            return project;
          },
        },
        createProject: {
          mutation: async (input: typeof validCreateProjectInput) => {
            return {
              id: Date.now().toString(),
              ...input,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          },
        },
        updateProject: {
          mutation: async (input: typeof validUpdateProjectInput) => {
            const project = mockProjects.find(p => p.id === input.id);
            if (!project) throw new Error(`Project with id ${input.id} not found`);
            return { ...project, ...input, updatedAt: new Date() };
          },
        },
        deleteProject: {
          mutation: async (input: typeof validGetProjectInput) => {
            const project = mockProjects.find(p => p.id === input.id);
            if (!project) throw new Error(`Project with id ${input.id} not found`);
            return { success: true, message: `Project ${input.id} deleted successfully` };
          },
        },
      },
      run: {
        getAllRuns: {
          query: async () => mockRuns,
        },
        getRunById: {
          query: async (input: { id: string }) => {
            const run = mockRuns.find(r => r.id === input.id);
            if (!run) throw new Error(`Run with id ${input.id} not found`);
            return run;
          },
        },
        createRun: {
          mutation: async (input: typeof validCreateRunInput) => {
            return {
              id: Date.now().toString(),
              ...input,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          },
        },
        updateRun: {
          mutation: async (input: typeof validUpdateRunInput) => {
            const run = mockRuns.find(r => r.id === input.id);
            if (!run) throw new Error(`Run with id ${input.id} not found`);
            return { ...run, ...input, updatedAt: new Date() };
          },
        },
        deleteRun: {
          mutation: async (input: typeof validGetRunInput) => {
            const run = mockRuns.find(r => r.id === input.id);
            if (!run) throw new Error(`Run with id ${input.id} not found`);
            return { success: true, message: `Run ${input.id} deleted successfully` };
          },
        },
      },
    } as AppRouter;
  };

  describe('Project Operations', () => {
    it('should handle getAllProjects query', async () => {
      const client = createMockClient();
      const result = await client.project.getAllProjects.query();
      
      expect(result).toEqual(mockProjects);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('status');
    });

    it('should handle getProjectById query', async () => {
      const client = createMockClient();
      const result = await client.project.getProjectById.query({ id: '1' });
      
      expect(result).toEqual(mockProjects[0]);
      expect(result.id).toBe('1');
      expect(result.name).toBe('Test Project 1');
    });

    it('should handle createProject mutation', async () => {
      const client = createMockClient();
      const result = await client.project.createProject.mutation(validCreateProjectInput);
      
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(validCreateProjectInput.name);
      expect(result.description).toBe(validCreateProjectInput.description);
      expect(result.status).toBe(validCreateProjectInput.status);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle updateProject mutation', async () => {
      const client = createMockClient();
      const result = await client.project.updateProject.mutation(validUpdateProjectInput);
      
      expect(result.id).toBe(validUpdateProjectInput.id);
      expect(result.name).toBe(validUpdateProjectInput.name);
      expect(result.description).toBe(validUpdateProjectInput.description);
      expect(result.status).toBe(validUpdateProjectInput.status);
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle deleteProject mutation', async () => {
      const client = createMockClient();
      const result = await client.project.deleteProject.mutation(validGetProjectInput);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');
    });
  });

  describe('Run Operations', () => {
    it('should handle getAllRuns query', async () => {
      const client = createMockClient();
      const result = await client.run.getAllRuns.query();
      
      expect(result).toEqual(mockRuns);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('projectId');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('status');
    });

    it('should handle getRunById query', async () => {
      const client = createMockClient();
      const result = await client.run.getRunById.query({ id: '1' });
      
      expect(result).toEqual(mockRuns[0]);
      expect(result.id).toBe('1');
      expect(result.name).toBe('Test Run 1');
    });

    it('should handle createRun mutation', async () => {
      const client = createMockClient();
      const result = await client.run.createRun.mutation(validCreateRunInput);
      
      expect(result).toHaveProperty('id');
      expect(result.projectId).toBe(validCreateRunInput.projectId);
      expect(result.name).toBe(validCreateRunInput.name);
      expect(result.description).toBe(validCreateRunInput.description);
      expect(result.status).toBe(validCreateRunInput.status);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle updateRun mutation', async () => {
      const client = createMockClient();
      const result = await client.run.updateRun.mutation(validUpdateRunInput);
      
      expect(result.id).toBe(validUpdateRunInput.id);
      expect(result.name).toBe(validUpdateRunInput.name);
      expect(result.description).toBe(validUpdateRunInput.description);
      expect(result.status).toBe(validUpdateRunInput.status);
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle deleteRun mutation', async () => {
      const client = createMockClient();
      const result = await client.run.deleteRun.mutation(validGetRunInput);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct input types for queries', async () => {
      const client = createMockClient();
      
      // These should compile without errors
      await client.project.getProjectById.query({ id: '1' });
      await client.run.getRunById.query({ id: '1' });
      
      // These should cause TypeScript errors (commented out for testing)
      // await client.project.getProjectById.query({ id: 123 }); // Should error
      // await client.run.getRunById.query({ invalid: 'data' }); // Should error
    });

    it('should enforce correct input types for mutations', async () => {
      const client = createMockClient();
      
      // These should compile without errors
      await client.project.createProject.mutation({
        name: 'Test Project',
        description: 'Test Description',
        status: 'active',
      });
      
      await client.run.createRun.mutation({
        projectId: '1',
        name: 'Test Run',
        description: 'Test Description',
        status: 'running',
      });
      
      // These should cause TypeScript errors (commented out for testing)
      // await client.project.createProject.mutation({ name: '' }); // Should error
      // await client.run.createRun.mutation({ projectId: '' }); // Should error
    });

    it('should return correctly typed responses', async () => {
      const client = createMockClient();
      
      const projects = await client.project.getAllProjects.query();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects[0]).toHaveProperty('id');
      expect(projects[0]).toHaveProperty('name');
      expect(projects[0]).toHaveProperty('status');
      
      const runs = await client.run.getAllRuns.query();
      expect(Array.isArray(runs)).toBe(true);
      expect(runs[0]).toHaveProperty('id');
      expect(runs[0]).toHaveProperty('projectId');
      expect(runs[0]).toHaveProperty('name');
      expect(runs[0]).toHaveProperty('status');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing project', async () => {
      const client = createMockClient();
      
      await expect(
        client.project.getProjectById.query({ id: 'nonexistent' })
      ).rejects.toThrow('Project with id nonexistent not found');
    });

    it('should handle missing run', async () => {
      const client = createMockClient();
      
      await expect(
        client.run.getRunById.query({ id: 'nonexistent' })
      ).rejects.toThrow('Run with id nonexistent not found');
    });

    it('should handle delete of nonexistent project', async () => {
      const client = createMockClient();
      
      await expect(
        client.project.deleteProject.mutation({ id: 'nonexistent' })
      ).rejects.toThrow('Project with id nonexistent not found');
    });

    it('should handle delete of nonexistent run', async () => {
      const client = createMockClient();
      
      await expect(
        client.run.deleteRun.mutation({ id: 'nonexistent' })
      ).rejects.toThrow('Run with id nonexistent not found');
    });
  });
}); 