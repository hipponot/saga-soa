'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from '../page.module.css';
import { ENDPOINTS } from '../../src/services/endpoints';
import { TrpcCurlService } from '../../src/services/trpc-curl-service';
import { TrpcClientService } from '../../src/services/trpc-client-service';

type EndpointType = typeof ENDPOINTS[0];

export default function TrpcApiPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointType | null>(null);
  const [inputData, setInputData] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [useTrpcClient, setUseTrpcClient] = useState(false);

  // Initialize services
  const curlService = new TrpcCurlService();
  const trpcService = new TrpcClientService();

  const handleEndpointChange = (endpointId: string) => {
    const endpoint = ENDPOINTS.find(ep => ep.id === endpointId);
    setSelectedEndpoint(endpoint || null);
    setInputData(endpoint?.sampleInput ? JSON.stringify(endpoint.sampleInput, null, 2) : '');
    setResponse('');
    setError('');
  };

  const generateCode = (endpoint: EndpointType, input: string) => {
    const service = useTrpcClient ? trpcService : curlService;
    return service.generateCode(endpoint, input);
  };



  const executeEndpoint = async () => {
    if (!selectedEndpoint) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const service = useTrpcClient ? trpcService : curlService;
      const result = await service.executeEndpoint(selectedEndpoint, inputData);
      
      if (result.success) {
        setResponse(JSON.stringify(result.data, null, 2));
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>tRPC API Demo</h1>
        <p className={styles.description} style={{ color: '#D2691E' }}>
          Interactive demonstration of tRPC API endpoints with type-safe invocations
        </p>
        
        <div className={styles.content} style={{ fontFamily: 'sans-serif' }}>
          {/* Mode Toggle */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--foreground)', marginBottom: '1rem' }}>API Mode</h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: 'var(--gray-alpha-100)',
              borderRadius: '4px',
              border: '1px solid var(--gray-alpha-200)'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                color: 'var(--foreground)'
              }}>
                <input
                  type="radio"
                  name="mode"
                  checked={!useTrpcClient}
                  onChange={() => setUseTrpcClient(false)}
                  style={{ margin: 0 }}
                />
                <span style={{ fontWeight: !useTrpcClient ? 'bold' : 'normal' }}>
                  cURL Mode
                </span>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                color: 'var(--foreground)'
              }}>
                <input
                  type="radio"
                  name="mode"
                  checked={useTrpcClient}
                  onChange={() => setUseTrpcClient(true)}
                  style={{ margin: 0 }}
                />
                <span style={{ fontWeight: useTrpcClient ? 'bold' : 'normal' }}>
                  tRPC Client Mode
                </span>
              </label>
            </div>
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--gray-alpha-200)',
              marginTop: '0.5rem'
            }}>
              {useTrpcClient
                ? 'Using type-safe tRPC client with full TypeScript support'
                : 'Using HTTP requests with curl commands'
              }
            </p>
          </div>

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

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#D2691E', marginBottom: '10px' }}>Endpoint Details</h3>
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--gray-alpha-100)',
              borderRadius: '4px',
              border: '1px solid var(--gray-alpha-200)',
              color: 'var(--foreground)'
            }}>
              {selectedEndpoint ? (
                <>
                  <p><strong>Name:</strong> {selectedEndpoint.name}</p>
                  <p><strong>Method:</strong> {selectedEndpoint.method}</p>
                  <p><strong>Description:</strong> {selectedEndpoint.description}</p>
                  <p><strong>URL:</strong> <code>{selectedEndpoint.url}</code></p>
                  {selectedEndpoint.inputType && (
                    <p><strong>Input Type:</strong> <code>{selectedEndpoint.inputType}</code></p>
                  )}
                </>
              ) : (
                <p style={{ color: 'var(--gray-alpha-200)', fontStyle: 'italic' }}>
                  Select an endpoint from the dropdown above to see details
                </p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#D2691E', marginBottom: '10px' }}>Input Data (JSON)</h3>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder={selectedEndpoint ? "Enter JSON input data..." : "Select an endpoint to enable input"}
              disabled={!selectedEndpoint}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                border: '1px solid var(--gray-alpha-200)',
                borderRadius: '4px',
                backgroundColor: selectedEndpoint ? 'var(--gray-alpha-100)' : 'var(--gray-alpha-100)',
                color: 'var(--foreground)',
                opacity: selectedEndpoint ? 1 : 0.6
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <h3 style={{ color: '#D2691E', margin: 0 }}>
                Generated Code ({useTrpcClient ? 'tRPC Client' : 'cURL'})
              </h3>
              {selectedEndpoint && (
                <button
                  onClick={() => {
                    const code = generateCode(selectedEndpoint, inputData);
                    navigator.clipboard.writeText(code);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--foreground)',
                    color: 'var(--background)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Copy Code
                </button>
              )}
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--gray-alpha-100)',
              color: 'var(--foreground)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              overflowX: 'auto',
              border: '1px solid var(--gray-alpha-200)',
              minHeight: '80px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {selectedEndpoint ? (
                <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>
                  {generateCode(selectedEndpoint, inputData)}
                </pre>
              ) : (
                <div style={{ color: 'var(--gray-alpha-200)', fontStyle: 'italic', fontFamily: 'sans-serif' }}>
                  Select an endpoint to see the generated code
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <button
              onClick={executeEndpoint}
              disabled={!selectedEndpoint || isLoading}
              style={{
                marginRight: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: selectedEndpoint ? 'var(--foreground)' : 'var(--gray-alpha-200)',
                color: selectedEndpoint ? 'var(--background)' : 'var(--gray-alpha-200)',
                border: 'none',
                borderRadius: '4px',
                cursor: selectedEndpoint && !isLoading ? 'pointer' : 'not-allowed',
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
              disabled={!selectedEndpoint}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: selectedEndpoint ? 'var(--foreground)' : 'var(--gray-alpha-200)',
                border: `1px solid ${selectedEndpoint ? 'var(--gray-alpha-200)' : 'var(--gray-alpha-100)'}`,
                borderRadius: '4px',
                cursor: selectedEndpoint ? 'pointer' : 'not-allowed'
              }}
            >
              Clear Response
            </button>
          </div>

          {error && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#D2691E', marginBottom: '10px' }}>Error</h3>
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
              <h3 style={{ color: '#D2691E', marginBottom: '10px' }}>Response</h3>
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

          {!selectedEndpoint && !error && !response && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#D2691E', marginBottom: '10px' }}>Response</h3>
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--gray-alpha-100)',
                borderRadius: '4px',
                border: '1px solid var(--gray-alpha-200)',
                fontSize: '0.9rem',
                color: 'var(--gray-alpha-200)',
                fontStyle: 'italic',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center'
              }}>
                Execute an endpoint to see the response here
              </div>
            </div>
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