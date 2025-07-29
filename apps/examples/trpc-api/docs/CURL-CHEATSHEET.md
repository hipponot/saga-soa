# tRPC API cURL Cheatsheet

This cheatsheet provides cURL commands for testing the tRPC API endpoints. The API runs on port 5000 by default and uses the `/trpc` base path.

## Prerequisites

1. **Build the project:**
   ```bash
   pnpm build
   ```

2. **Start the server:**
   ```bash
   node dist/main.js
   ```

   You should see output like:
   ```
   Loaded tRPC controllers: [ 'ProjectController', 'RunController' ]
   INFO: Logger initialized with level info
   INFO: Added tRPC router 'project'
   INFO: Added tRPC router 'run'
   INFO: Created namespaced tRPC router with 2 routers
   INFO: Server started on port 5000
   ```

## Health Check

Test if the server is running:

```bash
curl -X GET http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "tRPC API"
}
```

## Project Endpoints

### Get All Projects

```bash
curl -X POST http://localhost:5000/trpc/project.getAllProjects \
  -H "Content-Type: application/json" \
  -d '{"0":{"jsonrpc":"2.0","id":1,"method":"query","params":{}}}'
```

**Expected Response:**
```json
{
  "result": {
    "data": [
      {
        "id": "1",
        "name": "Saga SOA Platform",
        "description": "A modular service-oriented architecture platform",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "2",
        "name": "API Gateway",
        "description": "Centralized API management and routing",
        "status": "active",
        "createdAt": "2024-01-15T00:00:00.000Z",
        "updatedAt": "2024-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Project by ID

```bash
curl -X POST http://localhost:5000/trpc/project.getProjectById \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"query","params":{"input":{"id":"1"}}}'
```

**Expected Response:**
```json
{
  "result": {
    "data": {
      "id": "1",
      "name": "Saga SOA Platform",
      "description": "A modular service-oriented architecture platform",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Create New Project

```bash
curl -X POST http://localhost:5000/trpc/project.createProject \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"mutation","params":{"input":{"name":"Test Project","description":"A test project","status":"active"}}}'
```

**Expected Response:**
```json
{
  "result": {
    "data": {
      "id": "generated-uuid",
      "name": "Test Project",
      "description": "A test project",
      "status": "active",
      "createdAt": "2025-07-29T13:56:05.818Z",
      "updatedAt": "2025-07-29T13:56:05.818Z"
    }
  }
}
```

### Update Project

```bash
curl -X POST http://localhost:5000/trpc/project.updateProject \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"mutation","params":{"input":{"id":"1","name":"Updated Project","description":"Updated description","status":"active"}}}'
```

**Expected Response:**
```json
{
  "result": {
    "data": {
      "id": "1",
      "name": "Updated Project",
      "description": "Updated description",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2025-07-29T13:56:05.818Z"
    }
  }
}
```

### Delete Project

```bash
curl -X POST http://localhost:5000/trpc/project.deleteProject \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"mutation","params":{"input":{"id":"1"}}}'
```

**Expected Response:**
```json
{
  "result": {
    "data": {
      "success": true,
      "message": "Project deleted successfully"
    }
  }
}
```

## Run Endpoints

### Get All Runs

```bash
curl -X POST http://localhost:5000/trpc/run.getAllRuns \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"query","params":{}}'
```

**Expected Response:**
```json
{
  "result": {
    "data": [
      {
        "id": "1",
        "projectId": "1",
        "name": "Initial Build",
        "description": "First build of the Saga SOA Platform",
        "status": "completed",
        "config": {
          "environment": "development",
          "version": "1.0.0"
        },
        "createdAt": "2024-01-01T10:00:00.000Z",
        "updatedAt": "2024-01-01T10:00:00.000Z",
        "startedAt": "2024-01-01T10:00:00.000Z",
        "completedAt": "2024-01-01T10:30:00.000Z"
      },
      {
        "id": "2",
        "projectId": "1",
        "name": "Integration Tests",
        "description": "Running integration test suite",
        "status": "running",
        "config": {
          "testSuite": "integration",
          "timeout": 300
        },
        "createdAt": "2024-01-02T09:00:00.000Z",
        "updatedAt": "2024-01-02T09:00:00.000Z",
        "startedAt": "2024-01-02T09:00:00.000Z"
      }
    ]
  }
}
```

### Get Run by ID

```bash
curl -X POST http://localhost:5000/trpc/run.getRunById \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"query","params":{"input":{"id":"1"}}}'
```

**Expected Response:**
```json
{
  "result": {
    "data": {
      "id": "1",
      "projectId": "1",
      "name": "Initial Build",
      "description": "First build of the Saga SOA Platform",
      "status": "completed",
      "config": {
        "environment": "development",
        "version": "1.0.0"
      },
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z",
      "startedAt": "2024-01-01T10:00:00.000Z",
      "completedAt": "2024-01-01T10:30:00.000Z"
    }
  }
}
```

### Create New Run

```bash
curl -X POST http://localhost:5000/trpc/run.createRun \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"mutation","params":{"input":{"projectId":"1","name":"Test Run","description":"A test run","status":"pending"}}}'
```

**Expected Response:**
```json
{
  "result": {
    "data": {
      "id": "generated-uuid",
      "projectId": "1",
      "name": "Test Run",
      "description": "A test run",
      "status": "pending",
      "createdAt": "2025-07-29T13:56:05.827Z",
      "updatedAt": "2025-07-29T13:56:05.827Z"
    }
  }
}
```

## Error Handling

### Invalid Project ID

```bash
curl -X POST http://localhost:5000/trpc/project.getProjectById \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"query","params":{"input":{"id":"999"}}}'
```

**Expected Response:**
```json
{
  "error": {
    "code": -32603,
    "message": "Project not found"
  }
}
```

### Invalid Input Schema

```bash
curl -X POST http://localhost:5000/trpc/project.createProject \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"mutation","params":{"input":{"name":"Test"}}}'
```

**Expected Response:**
```json
{
  "error": {
    "code": -32603,
    "message": "Validation failed"
  }
}
```

## Testing Scripts

### Quick Test Script

Create a file `test-api.sh`:

```bash
#!/bin/bash

echo "Testing tRPC API..."

echo "1. Health Check:"
curl -s -X GET http://localhost:5000/health | jq

echo -e "\n2. Get All Projects:"
curl -s -X POST http://localhost:5000/trpc/project.getAllProjects \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"query","params":{}}' | jq

echo -e "\n3. Create New Project:"
curl -s -X POST http://localhost:5000/trpc/project.createProject \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"mutation","params":{"input":{"name":"cURL Test Project","description":"Created via cURL","status":"active"}}}' | jq

echo -e "\n4. Get All Runs:"
curl -s -X POST http://localhost:5000/trpc/run.getAllRuns \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"query","params":{}}' | jq
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Notes

- The API uses tRPC's HTTP transport format
- All requests are POST requests to the `/trpc` endpoint
- Query methods use `"method":"query"`
- Mutation methods use `"method":"mutation"`
- Input parameters are passed in the `params.input` object
- The server runs on port 5000 by default
- Use `jq` for pretty-printing JSON responses: `curl ... | jq`
- **Note:** tRPC HTTP transport is complex. For easier testing, use the tRPC client or the provided test script

## Troubleshooting

1. **Server not starting:** Make sure you've run `pnpm build` first
2. **Port already in use:** Change the port in `main.ts` or kill the existing process
3. **Invalid JSON:** Check your JSON syntax in the request body
4. **Method not found:** Verify the endpoint name matches the router structure

## Using tRPC Client (Recommended)

For easier testing, use the tRPC client which handles the HTTP transport format automatically:

```javascript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

const client = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:5000/trpc',
    }),
  ],
});

// Test queries
const projects = await client.project.getAllProjects.query();
console.log(projects);

const project = await client.project.getProjectById.query({ id: '1' });
console.log(project);

// Test mutations
const newProject = await client.project.createProject.mutate({
  name: 'Test Project',
  description: 'A test project',
  status: 'active'
});
console.log(newProject);
```

**Benefits of using tRPC client:**
- Type safety
- Automatic HTTP transport handling
- Better error messages
- Easier debugging 