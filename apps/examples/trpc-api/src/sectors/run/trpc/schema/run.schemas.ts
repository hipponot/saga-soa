import { z } from 'zod';

// Zod schemas for input validation
export const CreateRunSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'Run name is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
  config: z.record(z.unknown()).optional(),
});

export const UpdateRunSchema = z.object({
  id: z.string().min(1, 'Run ID is required'),
  name: z.string().min(1, 'Run name is required').optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']).optional(),
  config: z.record(z.unknown()).optional(),
});

export const GetRunSchema = z.object({
  id: z.string().min(1, 'Run ID is required'),
});

export const GetRunsByProjectSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

// TypeScript types derived from schemas
export type CreateRunInput = z.infer<typeof CreateRunSchema>;
export type UpdateRunInput = z.infer<typeof UpdateRunSchema>;
export type GetRunInput = z.infer<typeof GetRunSchema>;
export type GetRunsByProjectInput = z.infer<typeof GetRunsByProjectSchema>;
