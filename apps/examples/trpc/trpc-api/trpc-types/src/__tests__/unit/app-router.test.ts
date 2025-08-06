import { describe, it, expect, expectTypeOf } from 'vitest';
import type { AppRouter } from '../../index.js';
import type { 
  CreateProjectInput, 
  UpdateProjectInput, 
  GetProjectInput,
  CreateRunInput,
  UpdateRunInput,
  GetRunInput,
  Project,
  Run
} from '../../schemas/index.js';

describe('AppRouter Type', () => {
  it('should have correct project router structure', () => {
    // Test that the AppRouter type has the expected structure
    type ProjectRouter = AppRouter['project'];
    
    // Check that all expected procedures exist
    expectTypeOf<ProjectRouter['getAllProjects']>().toBeObject();
    expectTypeOf<ProjectRouter['getProjectById']>().toBeObject();
    expectTypeOf<ProjectRouter['createProject']>().toBeObject();
    expectTypeOf<ProjectRouter['updateProject']>().toBeObject();
    expectTypeOf<ProjectRouter['deleteProject']>().toBeObject();
  });

  it('should have correct run router structure', () => {
    // Test that the AppRouter type has the expected structure
    type RunRouter = AppRouter['run'];
    
    // Check that all expected procedures exist
    expectTypeOf<RunRouter['getAllRuns']>().toBeObject();
    expectTypeOf<RunRouter['getRunById']>().toBeObject();
    expectTypeOf<RunRouter['createRun']>().toBeObject();
    expectTypeOf<RunRouter['updateRun']>().toBeObject();
    expectTypeOf<RunRouter['deleteRun']>().toBeObject();
  });

  it('should have correct query procedure types', () => {
    // Test query procedures
    expectTypeOf<AppRouter['project']['getAllProjects']['query']>().returns.toEqualTypeOf<Promise<Project[]>>();
    expectTypeOf<AppRouter['project']['getProjectById']['query']>().parameters.toEqualTypeOf<[GetProjectInput]>();
    expectTypeOf<AppRouter['project']['getProjectById']['query']>().returns.toEqualTypeOf<Promise<Project>>();
    
    expectTypeOf<AppRouter['run']['getAllRuns']['query']>().returns.toEqualTypeOf<Promise<Run[]>>();
    expectTypeOf<AppRouter['run']['getRunById']['query']>().parameters.toEqualTypeOf<[GetRunInput]>();
    expectTypeOf<AppRouter['run']['getRunById']['query']>().returns.toEqualTypeOf<Promise<Run>>();
  });

  it('should have correct mutation procedure types', () => {
    // Test mutation procedures
    expectTypeOf<AppRouter['project']['createProject']['mutation']>().parameters.toEqualTypeOf<[CreateProjectInput]>();
    expectTypeOf<AppRouter['project']['createProject']['mutation']>().returns.toEqualTypeOf<Promise<Project>>();
    
    expectTypeOf<AppRouter['project']['updateProject']['mutation']>().parameters.toEqualTypeOf<[UpdateProjectInput]>();
    expectTypeOf<AppRouter['project']['updateProject']['mutation']>().returns.toEqualTypeOf<Promise<Project>>();
    
    expectTypeOf<AppRouter['project']['deleteProject']['mutation']>().parameters.toEqualTypeOf<[GetProjectInput]>();
    expectTypeOf<AppRouter['project']['deleteProject']['mutation']>().returns.toEqualTypeOf<Promise<{ success: boolean; message: string }>>();
    
    expectTypeOf<AppRouter['run']['createRun']['mutation']>().parameters.toEqualTypeOf<[CreateRunInput]>();
    expectTypeOf<AppRouter['run']['createRun']['mutation']>().returns.toEqualTypeOf<Promise<Run>>();
    
    expectTypeOf<AppRouter['run']['updateRun']['mutation']>().parameters.toEqualTypeOf<[UpdateRunInput]>();
    expectTypeOf<AppRouter['run']['updateRun']['mutation']>().returns.toEqualTypeOf<Promise<Run>>();
    
    expectTypeOf<AppRouter['run']['deleteRun']['mutation']>().parameters.toEqualTypeOf<[GetRunInput]>();
    expectTypeOf<AppRouter['run']['deleteRun']['mutation']>().returns.toEqualTypeOf<Promise<{ success: boolean; message: string }>>();
  });

  it('should be compatible with tRPC client types', () => {
    // This test ensures the AppRouter type is compatible with tRPC client expectations
    // The type should be assignable to a generic tRPC router type
    
    // Mock tRPC client type (simplified)
    type TRPCClient<TRouter> = {
      [K in keyof TRouter]: {
        [P in keyof TRouter[K]]: {
          query: (...args: any[]) => Promise<any>;
          mutation: (...args: any[]) => Promise<any>;
        };
      };
    };
    
    // This should compile without errors
    type TestClient = TRPCClient<AppRouter>;
    
    // Verify the client type has the expected structure
    expectTypeOf<TestClient['project']['getAllProjects']['query']>().toBeFunction();
    expectTypeOf<TestClient['project']['createProject']['mutation']>().toBeFunction();
    expectTypeOf<TestClient['run']['getAllRuns']['query']>().toBeFunction();
    expectTypeOf<TestClient['run']['createRun']['mutation']>().toBeFunction();
  });

  it('should have correct input/output type compatibility', () => {
    // Test that input types match the expected schema types
    const createProjectInput: CreateProjectInput = {
      name: 'Test Project',
      description: 'Test Description',
      status: 'active',
    };
    
    const updateProjectInput: UpdateProjectInput = {
      id: '1',
      name: 'Updated Project',
      description: 'Updated Description',
      status: 'inactive',
    };
    
    const getProjectInput: GetProjectInput = {
      id: '1',
    };
    
    const createRunInput: CreateRunInput = {
      projectId: '1',
      name: 'Test Run',
      description: 'Test Description',
      status: 'running',
    };
    
    const updateRunInput: UpdateRunInput = {
      id: '1',
      name: 'Updated Run',
      description: 'Updated Description',
      status: 'completed',
    };
    
    const getRunInput: GetRunInput = {
      id: '1',
    };
    
    // These should all be valid and compile without errors
    expect(createProjectInput).toBeDefined();
    expect(updateProjectInput).toBeDefined();
    expect(getProjectInput).toBeDefined();
    expect(createRunInput).toBeDefined();
    expect(updateRunInput).toBeDefined();
    expect(getRunInput).toBeDefined();
  });
}); 