'use client';

import { Button } from '@saga/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import styles from '../page.module.css';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  GetProjectInput,
  CreateRunInput,
  UpdateRunInput,
  GetRunInput,
  GetRunsByProjectInput
} from '@saga-soa/trpc-types';

// Define the available endpoints with their types and sample data
const ENDPOINTS = [
  {
    id: 'project.getAllProjects',
    name: 'Get All Projects',
    method: 'GET',
    description: 'Retrieve all projects',
    inputType: null,
    sampleInput: null,
    url: '/saga-soa/v1/trpc/project.getAllProjects'
  },
  {
    id: 'project.getProjectById',
    name: 'Get Project by ID',
    method: 'GET',
    description: 'Retrieve a specific project by ID',
    inputType: 'GetProjectInput' as const,
    sampleInput: { id: '1' } as GetProjectInput,
    url: '/saga-soa/v1/trpc/project.getProjectById'
  },
  {
    id: 'project.createProject',
    name: 'Create Project',
    method: 'POST',
    description: 'Create a new project',
    inputType: 'CreateProjectInput' as const,
    sampleInput: {
      name: 'New Project',
      description: 'A new project description',
      status: 'active' as const
    } as CreateProjectInput,
    url: '/saga-soa/v1/trpc/project.createProject'
  },
  {
    id: 'project.updateProject',
    name: 'Update Project',
    method: 'POST',
    description: 'Update an existing project',
    inputType: 'UpdateProjectInput' as const,
    sampleInput: {
      id: '1',
      name: 'Updated Project',
      description: 'Updated project description',
      status: 'active' as const
    } as UpdateProjectInput,
    url: '/saga-soa/v1/trpc/project.updateProject'
  },
  {
    id: 'project.deleteProject',
    name: 'Delete Project',
    method: 'POST',
    description: 'Delete a project',
    inputType: 'GetProjectInput' as const,
    sampleInput: { id: '1' } as GetProjectInput,
    url: '/saga-soa/v1/trpc/project.deleteProject'
  },
  {
    id: 'run.getAllRuns',
    name: 'Get All Runs',
    method: 'GET',
    description: 'Retrieve all runs',
    inputType: null,
    sampleInput: null,
    url: '/saga-soa/v1/trpc/run.getAllRuns'
  },
  {
    id: 'run.getRunById',
    name: 'Get Run by ID',
    method: 'GET',
    description: 'Retrieve a specific run by ID',
    inputType: 'GetRunInput' as const,
    sampleInput: { id: '1' } as GetRunInput,
    url: '/saga-soa/v1/trpc/run.getRunById'
  },
  {
    id: 'run.createRun',
    name: 'Create Run',
    method: 'POST',
    description: 'Create a new run',
    inputType: 'CreateRunInput' as const,
    sampleInput: {
      projectId: '1',
      name: 'New Run',
      description: 'A new run description',
      status: 'pending' as const,
      config: { timeout: 30000 }
    } as CreateRunInput,
    url: '/saga-soa/v1/trpc/run.createRun'
  },
  {
    id: 'run.updateRun',
    name: 'Update Run',
    method: 'POST',
    description: 'Update an existing run',
    inputType: 'UpdateRunInput' as const,
    sampleInput: {
      id: '1',
      name: 'Updated Run',
      description: 'Updated run description',
      status: 'completed' as const,
      config: { timeout: 30000 }
    } as UpdateRunInput,
    url: '/saga-soa/v1/trpc/run.updateRun'
  },
  {
    id: 'run.deleteRun',
    name: 'Delete Run',
    method: 'POST',
    description: 'Delete a run',
    inputType: 'GetRunInput' as const,
    sampleInput: { id: '1' } as GetRunInput,
    url: '/saga-soa/v1/trpc/run.deleteRun'
  }
];

type Endpoint = typeof ENDPOINTS[0];

export default function TrpcApiPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [inputData, setInputData] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleEndpointChange = (endpointId: string) => {
    const endpoint = ENDPOINTS.find(ep => ep.id === endpointId);
    setSelectedEndpoint(endpoint || null);
    setInputData(endpoint?.sampleInput ? JSON.stringify(endpoint.sampleInput, null, 2) : '');
    setResponse('');
    setError('');
  };

  const generateCode = (endpoint: Endpoint, input: string) => {
    const baseUrl = 'http://localhost:5000';
    const fullUrl = `${baseUrl}${endpoint.url}`;
    
    if (endpoint.method === 'GET') {
      if (input.trim()) {
        const inputParam = encodeURIComponent(input);
        return `curl -X GET "${fullUrl}?input=${inputParam}"`;
      }
      return `curl -X GET "${fullUrl}"`;
    } else {
      return `curl -X POST "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${input}'`;
    }
  };

  const executeEndpoint = async () => {
    if (!selectedEndpoint) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const baseUrl = 'http://localhost:5000';
      const fullUrl = `${baseUrl}${selectedEndpoint.url}`;
      
      let response;
      if (selectedEndpoint.method === 'GET') {
        const url = inputData.trim() 
          ? `${fullUrl}?input=${encodeURIComponent(inputData)}`
          : fullUrl;
        response = await fetch(url);
      } else {
        response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: inputData,
        });
      }

      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const syntaxHighlight = (code: string) => {
    return code
      .replace(/(curl)/g, '<span style="color: #dc2626;">$1</span>')
      .replace(/(GET|POST)/g, '<span style="color: #059669;">$1</span>')
      .replace(/(http:\/\/[^\s"]+)/g, '<span style="color: #2563eb;">$1</span>')
      .replace(/(Content-Type|application\/json)/g, '<span style="color: #7c3aed;">$1</span>')
      .replace(/(-[Hd])/g, '<span style="color: #d97706;">$1</span>');
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>tRPC API Demo</h1>
        <p className={styles.description}>
          Interactive demonstration of tRPC API endpoints with type-safe invocations
        </p>
        
        <div className={styles.content}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--foreground)' }}>Select Endpoint</h2>
                           <select 
                 value={selectedEndpoint?.id || ''} 
                 onChange={(e) => handleEndpointChange(e.target.value)}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   fontSize: '1rem',
                   border: '1px solid var(--gray-alpha-200)',
                   borderRadius: '4px',
                   backgroundColor: 'var(--background)',
                   color: 'var(--foreground)'
                 }}
               >
              <option value="">Choose an endpoint...</option>
              {ENDPOINTS.map(endpoint => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpoint.name} ({endpoint.method})
                </option>
              ))}
            </select>
          </div>

          {selectedEndpoint && (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--foreground)' }}>Endpoint Details</h3>
                                 <div style={{ 
                   padding: '1rem', 
                   backgroundColor: 'var(--gray-alpha-100)', 
                   borderRadius: '4px',
                   border: '1px solid var(--gray-alpha-200)',
                   color: 'var(--foreground)'
                 }}>
                  <p><strong>Name:</strong> {selectedEndpoint.name}</p>
                  <p><strong>Method:</strong> {selectedEndpoint.method}</p>
                  <p><strong>Description:</strong> {selectedEndpoint.description}</p>
                  <p><strong>URL:</strong> <code>{selectedEndpoint.url}</code></p>
                  {selectedEndpoint.inputType && (
                    <p><strong>Input Type:</strong> <code>{selectedEndpoint.inputType}</code></p>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--foreground)' }}>Input Data (JSON)</h3>
                                  <textarea
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    placeholder="Enter JSON input data..."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      border: '1px solid var(--gray-alpha-200)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--gray-alpha-100)',
                      color: 'var(--foreground)'
                    }}
                  />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--foreground)' }}>Generated Code</h3>
                                 <div style={{
                   padding: '1rem',
                   backgroundColor: 'var(--gray-alpha-100)',
                   color: 'var(--foreground)',
                   borderRadius: '4px',
                   fontFamily: 'monospace',
                   fontSize: '0.9rem',
                   overflowX: 'auto',
                   border: '1px solid var(--gray-alpha-200)'
                 }}>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: syntaxHighlight(generateCode(selectedEndpoint, inputData)) 
                    }} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <button 
                  onClick={executeEndpoint}
                  disabled={isLoading}
                                     style={{ 
                     marginRight: '1rem',
                     padding: '0.75rem 1.5rem',
                     backgroundColor: 'var(--foreground)',
                     color: 'var(--background)',
                     border: 'none',
                     borderRadius: '4px',
                     cursor: isLoading ? 'not-allowed' : 'pointer',
                     opacity: isLoading ? 0.6 : 1
                   }}
                >
                  {isLoading ? 'Executing...' : 'Execute Endpoint'}
                </button>
                <button 
                  onClick={() => {
                    setResponse('');
                    setError('');
                  }}
                                     style={{
                     padding: '0.75rem 1.5rem',
                     backgroundColor: 'transparent',
                     color: 'var(--foreground)',
                     border: '1px solid var(--gray-alpha-200)',
                     borderRadius: '4px',
                     cursor: 'pointer'
                   }}
                >
                  Clear Response
                </button>
              </div>

              {error && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: 'var(--foreground)' }}>Error</h3>
                                     <div style={{
                     padding: '1rem',
                     backgroundColor: 'rgba(220, 38, 38, 0.1)',
                     color: '#dc2626',
                     borderRadius: '4px',
                     border: '1px solid rgba(220, 38, 38, 0.2)'
                   }}>
                    {error}
                  </div>
                </div>
              )}

              {response && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: 'var(--foreground)' }}>Response</h3>
                                     <div style={{
                     padding: '1rem',
                     backgroundColor: 'var(--gray-alpha-100)',
                     borderRadius: '4px',
                     border: '1px solid var(--gray-alpha-200)',
                     fontFamily: 'monospace',
                     fontSize: '0.9rem',
                     whiteSpace: 'pre-wrap',
                     overflowX: 'auto',
                     color: 'var(--foreground)'
                   }}>
                    {response}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.ctas}>
          <Link
            href="/"
            className={styles.secondary}
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
} 