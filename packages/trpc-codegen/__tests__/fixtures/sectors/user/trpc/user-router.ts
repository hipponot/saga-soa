import { z } from 'zod';

// Mock router for testing - this simulates the actual router pattern
export class UserController {
  readonly sectorName = 'user';
  
  createRouter() {
    const t = this.createProcedure();
    return router({
      getUser: t.procedure
        .input(GetUserSchema)
        .query(() => ({ id: '1', name: 'Test User', email: 'test@example.com' })),
      
      createUser: t.procedure
        .input(CreateUserSchema)
        .mutation(() => ({ id: '1', name: 'New User', email: 'new@example.com' })),
      
      updateUser: t.procedure
        .input(UpdateUserSchema)
        .mutation(() => ({ id: '1', name: 'Updated User', email: 'updated@example.com' })),
      
      deleteUser: t.procedure
        .input(DeleteUserSchema)
        .mutation(() => ({ success: true })),
      
      listUsers: t.procedure
        .input(ListUsersSchema)
        .query(() => [{ id: '1', name: 'User 1' }, { id: '2', name: 'User 2' }])
    });
  }
  
  private createProcedure() {
    return {
      procedure: {
        input: (schema: any) => ({
          query: (handler: any) => handler,
          mutation: (handler: any) => handler
        })
      }
    };
  }
}

// Mock router function for testing
function router(config: any) {
  return config;
}

// Mock schemas for testing
export const GetUserSchema = z.object({
  id: z.string()
});

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']).default('user')
});

export const UpdateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user', 'guest']).optional()
});

export const DeleteUserSchema = z.object({
  id: z.string()
});

export const ListUsersSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  role: z.enum(['admin', 'user', 'guest']).optional()
});
