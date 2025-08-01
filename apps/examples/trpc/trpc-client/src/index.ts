// Example tRPC client that demonstrates usage of @saga-soa/trpc-types
// This shows how clients can use the types without server dependencies

import { 
  CreateProjectInput, 
  UpdateProjectInput, 
  CreateRunInput, 
  UpdateRunInput,
  GetProjectInput,
  GetRunInput,
  GetRunsByProjectInput
} from '@saga-soa/trpc-types';

/**
 * Example tRPC client that demonstrates type-safe API calls
 * This client shows how to use the types package in a real application
 */
export class TRPCClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  // Project operations
  async createProject(data: CreateProjectInput): Promise<{ id: string }> {
    console.log('Creating project:', data);
    // In a real implementation, this would call the tRPC API
    return { id: 'project-' + Date.now() };
  }

  async updateProject(data: UpdateProjectInput): Promise<{ success: boolean }> {
    console.log('Updating project:', data);
    // In a real implementation, this would call the tRPC API
    return { success: true };
  }

  async getProject(data: GetProjectInput): Promise<{ id: string; name: string; status: string }> {
    console.log('Getting project:', data);
    // In a real implementation, this would call the tRPC API
    return { id: data.id, name: 'Example Project', status: 'active' };
  }

  // Run operations
  async createRun(data: CreateRunInput): Promise<{ id: string }> {
    console.log('Creating run:', data);
    // In a real implementation, this would call the tRPC API
    return { id: 'run-' + Date.now() };
  }

  async updateRun(data: UpdateRunInput): Promise<{ success: boolean }> {
    console.log('Updating run:', data);
    // In a real implementation, this would call the tRPC API
    return { success: true };
  }

  async getRun(data: GetRunInput): Promise<{ id: string; name: string; status: string }> {
    console.log('Getting run:', data);
    // In a real implementation, this would call the tRPC API
    return { id: data.id, name: 'Example Run', status: 'completed' };
  }

  async getRunsByProject(data: GetRunsByProjectInput): Promise<Array<{ id: string; name: string; status: string }>> {
    console.log('Getting runs for project:', data);
    // In a real implementation, this would call the tRPC API
    return [
      { id: 'run-1', name: 'Run 1', status: 'completed' },
      { id: 'run-2', name: 'Run 2', status: 'running' }
    ];
  }
}

/**
 * Example React component props using the types
 */
export interface ProjectFormProps {
  onSubmit: (data: CreateProjectInput) => void;
  onUpdate?: (data: UpdateProjectInput) => void;
  initialData?: Partial<CreateProjectInput>;
}

export interface RunFormProps {
  projectId: string;
  onSubmit: (data: CreateRunInput) => void;
  onUpdate?: (data: UpdateRunInput) => void;
  initialData?: Partial<CreateRunInput>;
}

/**
 * Example usage and testing
 */
export async function demonstrateUsage() {
  const client = new TRPCClient();

  // Create a project
  const newProject: CreateProjectInput = {
    name: "My New Project",
    description: "A project created with type safety",
    status: "active"
  };

  const projectResult = await client.createProject(newProject);
  console.log('Created project:', projectResult);

  // Update the project
  const updateProject: UpdateProjectInput = {
    id: projectResult.id,
    name: "Updated Project Name",
    description: "Updated description",
    status: "inactive"
  };

  const updateResult = await client.updateProject(updateProject);
  console.log('Updated project:', updateResult);

  // Create a run
  const newRun: CreateRunInput = {
    projectId: projectResult.id,
    name: "Test Run",
    description: "A test run with configuration",
    status: "pending",
    config: { timeout: 5000, retries: 3 }
  };

  const runResult = await client.createRun(newRun);
  console.log('Created run:', runResult);

  // Get runs for the project
  const runs = await client.getRunsByProject({ projectId: projectResult.id });
  console.log('Project runs:', runs);

  return { projectResult, runResult, runs };
}

// Export types for external use
export type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateRunInput,
  UpdateRunInput,
  GetProjectInput,
  GetRunInput,
  GetRunsByProjectInput
};

// Run the demonstration when this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateUsage().catch(console.error);
} 