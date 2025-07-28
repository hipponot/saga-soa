import { z } from 'zod';

// Zod schemas for input validation
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});

export const UpdateProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
});

export const GetProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
}); 