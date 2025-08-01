# @saga-soa/trpc-client

An example client that demonstrates how to use the `@saga-soa/trpc-types` package in a real application.

## Purpose

This client shows how web applications can use the type-safe tRPC types without any server dependencies. It serves as both an example and a reference implementation.

## Features

- ✅ **Type-Safe API Calls**: Uses types from `@saga-soa/trpc-types`
- ✅ **Zero Server Dependencies**: No server code or dependencies
- ✅ **Real-World Example**: Shows how to structure a client application
- ✅ **React Component Props**: Demonstrates usage in React components

## Usage

### Basic Client Usage

```typescript
import { TRPCClient } from '@saga-soa/trpc-client';

const client = new TRPCClient('http://localhost:3000');

// Create a project with full type safety
const project = await client.createProject({
  name: "My Project",
  description: "A new project",
  status: "active"
});
```

### React Component Usage

```typescript
import { ProjectFormProps, RunFormProps } from '@saga-soa/trpc-client';

// Type-safe form props
const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onUpdate }) => {
  // Component implementation
};

const RunForm: React.FC<RunFormProps> = ({ projectId, onSubmit }) => {
  // Component implementation
};
```

## Available Methods

### Project Operations
- `createProject(data: CreateProjectInput)`: Create a new project
- `updateProject(data: UpdateProjectInput)`: Update an existing project
- `getProject(data: GetProjectInput)`: Get project details

### Run Operations
- `createRun(data: CreateRunInput)`: Create a new run
- `updateRun(data: UpdateRunInput)`: Update an existing run
- `getRun(data: GetRunInput)`: Get run details
- `getRunsByProject(data: GetRunsByProjectInput)`: Get all runs for a project

## Type Safety

All methods use types from `@saga-soa/trpc-types`, ensuring:

- ✅ **Compile-time Safety**: TypeScript catches errors at build time
- ✅ **IntelliSense Support**: Full autocomplete and documentation
- ✅ **Runtime Safety**: Types match server expectations exactly

## Development

```bash
# Install dependencies
pnpm install

# Build the client
pnpm build

# Run the example
pnpm test

# Type checking
pnpm check-types
```

## Example Output

```bash
$ pnpm test

Creating project: {
  name: 'My New Project',
  description: 'A project created with type safety',
  status: 'active'
}
Created project: { id: 'project-1703123456789' }

Updating project: {
  id: 'project-1703123456789',
  name: 'Updated Project Name',
  description: 'Updated description',
  status: 'inactive'
}
Updated project: { success: true }

Creating run: {
  projectId: 'project-1703123456789',
  name: 'Test Run',
  description: 'A test run with configuration',
  status: 'pending',
  config: { timeout: 5000, retries: 3 }
}
Created run: { id: 'run-1703123456790' }

Getting runs for project: { projectId: 'project-1703123456789' }
Project runs: [
  { id: 'run-1', name: 'Run 1', status: 'completed' },
  { id: 'run-2', name: 'Run 2', status: 'running' }
]
```

## Architecture

This client demonstrates the benefits of the new project structure:

```
examples/trpc/
├── trpc-api/          # Server implementation
├── trpc-types/        # Shared types (no server deps)
└── trpc-client/       # Client example (uses types)
```

The close proximity makes development easier and the relationships clearer.

## Benefits

- ✅ **Clear Separation**: Client code is separate from server code
- ✅ **Type Safety**: Full TypeScript support without server dependencies
- ✅ **Easy Development**: Related projects are grouped together
- ✅ **Better DX**: Faster navigation and context switching 