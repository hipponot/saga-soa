import { z } from 'zod';

export const ComplexSchema = z.object({
  id: z.string().uuid(),
  metadata: z.object({
    tags: z.array(z.string()),
    categories: z.array(z.object({
      id: z.number(),
      name: z.string(),
      color: z.string().regex(/^#[0-9A-F]{6}$/i),
    })),
  }),
  status: z.enum(['draft', 'published', 'archived']),
  content: z.union([
    z.object({
      type: z.literal('text'),
      value: z.string(),
    }),
    z.object({
      type: z.literal('image'),
      url: z.string().url(),
      alt: z.string(),
    }),
  ]),
  timestamps: z.object({
    created: z.date(),
    updated: z.date().optional(),
  }),
}); 