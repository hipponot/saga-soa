import { v4 as uuidv4 } from 'uuid';
import type { Run, CreateRunInput, UpdateRunInput } from './run.types.js';

// Mock data store
const runs: Run[] = [
  {
    id: '1',
    projectId: '1',
    name: 'Initial Build',
    description: 'First build of the Saga SOA Platform',
    status: 'completed',
    config: { environment: 'development', version: '1.0.0' },
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    startedAt: new Date('2024-01-01T10:00:00Z'),
    completedAt: new Date('2024-01-01T10:30:00Z'),
  },
  {
    id: '2',
    projectId: '1',
    name: 'Integration Tests',
    description: 'Running integration test suite',
    status: 'running',
    config: { testSuite: 'integration', timeout: 300 },
    createdAt: new Date('2024-01-02T09:00:00Z'),
    updatedAt: new Date('2024-01-02T09:00:00Z'),
    startedAt: new Date('2024-01-02T09:00:00Z'),
  },
  {
    id: '3',
    projectId: '2',
    name: 'API Gateway Deploy',
    description: 'Deploying API Gateway to production',
    status: 'pending',
    config: { environment: 'production', region: 'us-east-1' },
    createdAt: new Date('2024-01-03T08:00:00Z'),
    updatedAt: new Date('2024-01-03T08:00:00Z'),
  },
];

// Business logic functions
export const getAllRuns = (): Run[] => {
  return [...runs];
};

export const getRunById = (id: string): Run | null => {
  return runs.find(run => run.id === id) || null;
};

export const getRunsByProject = (projectId: string): Run[] => {
  return runs.filter(run => run.projectId === projectId);
};

export const createRun = (input: CreateRunInput): Run => {
  const now = new Date();
  const run: Run = {
    id: uuidv4(),
    projectId: input.projectId,
    name: input.name,
    description: input.description,
    status: input.status,
    config: input.config,
    createdAt: now,
    updatedAt: now,
  };

  runs.push(run);
  return run;
};

export const updateRun = (input: UpdateRunInput): Run | null => {
  const runIndex = runs.findIndex(run => run.id === input.id);
  if (runIndex === -1) {
    return null;
  }

  const run = runs[runIndex]!;
  const updatedRun: Run = {
    id: run.id,
    projectId: run.projectId,
    name: input.name ?? run.name,
    description: input.description ?? run.description,
    status: input.status ?? run.status,
    config: input.config ?? run.config,
    createdAt: run.createdAt,
    updatedAt: new Date(),
    startedAt: run.startedAt,
    completedAt: run.completedAt,
  };

  // Update timestamps based on status changes
  if (input.status === 'running' && run.status !== 'running') {
    updatedRun.startedAt = new Date();
  } else if (
    (input.status === 'completed' || input.status === 'failed') &&
    run.status !== 'completed' &&
    run.status !== 'failed'
  ) {
    updatedRun.completedAt = new Date();
  }

  runs[runIndex] = updatedRun;
  return updatedRun;
};

export const deleteRun = (id: string): boolean => {
  const runIndex = runs.findIndex(run => run.id === id);
  if (runIndex === -1) {
    return false;
  }

  runs.splice(runIndex, 1);
  return true;
};
