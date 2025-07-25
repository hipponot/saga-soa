import { z } from 'zod';

// This file has no schemas ending with 'Schema'
export const user = z.object({
  id: z.string(),
  name: z.string(),
});

export const profile = z.object({
  bio: z.string(),
}); 