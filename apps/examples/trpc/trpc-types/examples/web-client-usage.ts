// Example: Using @saga-soa/trpc-types in a web client
// This demonstrates how clients can import types without server dependencies

import { 
  CreateProjectInput, 
  UpdateProjectInput, 
  CreateRunInput, 
  UpdateRunInput 
} from '@saga-soa/trpc-types';

// Example React component using the types
interface ProjectFormProps {
  onSubmit: (data: CreateProjectInput) => void;
  onUpdate?: (data: UpdateProjectInput) => void;
}

// Example function using run types
interface RunFormProps {
  projectId: string;
  onSubmit: (data: CreateRunInput) => void;
  onUpdate?: (data: UpdateRunInput) => void;
}

// Example API client using the types
class TRPCClient {
  async createProject(data: CreateProjectInput) {
    // Implementation would call tRPC
    console.log('Creating project:', data);
  }

  async updateProject(data: UpdateProjectInput) {
    // Implementation would call tRPC
    console.log('Updating project:', data);
  }

  async createRun(data: CreateRunInput) {
    // Implementation would call tRPC
    console.log('Creating run:', data);
  }

  async updateRun(data: UpdateRunInput) {
    // Implementation would call tRPC
    console.log('Updating run:', data);
  }
}

// Example usage
const client = new TRPCClient();

const newProject: CreateProjectInput = {
  name: "My New Project",
  description: "A project created with type safety",
  status: "active"
};

const updatedProject: UpdateProjectInput = {
  id: "project-123",
  name: "Updated Project Name",
  description: "Updated description",
  status: "inactive"
};

const newRun: CreateRunInput = {
  projectId: "project-123",
  name: "Test Run",
  description: "A test run with configuration",
  status: "pending",
  config: { timeout: 5000, retries: 3 }
};

console.log('✅ Types package works correctly in web client!');
console.log('Project types:', { newProject, updatedProject });
console.log('Run types:', { newRun }); 