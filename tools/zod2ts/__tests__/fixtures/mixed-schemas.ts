import { z } from 'zod';

// Schema ending with 'Schema' - should remove suffix by default
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

// Schema not ending with 'Schema' - should use name as-is by default
export const Product = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
});

// Another schema ending with 'Schema'
export const OrderSchema = z.object({
  id: z.string(),
  items: z.array(z.string()),
  total: z.number(),
}); 